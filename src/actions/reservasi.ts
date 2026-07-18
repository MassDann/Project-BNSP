"use server";

import { db } from "@/lib/db";
import { reservasi, slotLock, transaksi, lapangan, pelanggan } from "@/db/schema";
import { requireAuth } from "@/lib/requireAdmin";
import { eq, and, or, gte, lte } from "drizzle-orm";
import { pusherServer } from "@/lib/pusher";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function lockSlotAction(lapanganId: string, tanggal: string, jamMulai: string, jamSelesai: string) {
  const user = await requireAuth();
  if (!user || !user.id) throw new Error("Unauthorized");

  // Hapus validasi block admin, izinkan admin untuk me-lock slot.

  // Bersihkan lock kedaluwarsa dulu
  await db.delete(slotLock).where(lte(slotLock.kedaluwarsaPada, new Date()));

  // Cek apakah udah di-booking betulan
  const existingRes = await db.select().from(reservasi).where(
    and(
      eq(reservasi.lapanganId, lapanganId),
      eq(reservasi.tanggal, tanggal),
      eq(reservasi.jamMulai, jamMulai),
      or(
        eq(reservasi.status, "terkonfirmasi"),
        eq(reservasi.status, "menunggu_verifikasi"),
        eq(reservasi.status, "pending_bayar")
      )
    )
  );

  if (existingRes.length > 0) {
    return { error: "Jadwal sudah dipesan orang lain." };
  }

  // Cek apakah lagi di-lock orang lain
  let lockUserId = user.id;

  // Jika admin, kita butuh ID dari tabel pelanggan agar tidak kena FK constraint (Foreign Key)
  if ((user as any).role === "admin" || (user as any).role === "superadmin") {
    let dummyAdmin = await db.select().from(pelanggan).where(eq(pelanggan.email, "admin_lock_dummy@smsport.com"));
    if (dummyAdmin.length === 0) {
      const [newDummy] = await db.insert(pelanggan).values({
        nama: "Admin System (Booking Offline)",
        email: "admin_lock_dummy@smsport.com",
        noTelepon: "000000000",
        passwordHash: "dummy"
      }).returning();
      lockUserId = newDummy.id;
    } else {
      lockUserId = dummyAdmin[0].id;
    }
  }

  const existingLock = await db.select().from(slotLock).where(
    and(
      eq(slotLock.lapanganId, lapanganId),
      eq(slotLock.tanggal, tanggal),
      eq(slotLock.jamMulai, jamMulai)
    )
  );

  if (existingLock.length > 0 && existingLock[0].pelangganId !== lockUserId) {
    return { error: "Jadwal sedang dikonfirmasi orang lain. Coba beberapa menit lagi." };
  }

  // Kalau lock punya sendiri dan belum kedaluwarsa, lanjut
  if (existingLock.length > 0 && existingLock[0].pelangganId === lockUserId) {
    return { success: true, lockId: existingLock[0].id };
  }

  // Bikin lock baru (10 menit)
  const kedaluwarsaPada = new Date();
  kedaluwarsaPada.setMinutes(kedaluwarsaPada.getMinutes() + 10);

  try {
    const [newLock] = await db.insert(slotLock).values({
      lapanganId,
      tanggal,
      jamMulai,
      jamSelesai,
      pelangganId: lockUserId, // Pastikan ID ini berasal dari tabel pelanggan
      kedaluwarsaPada,
    }).returning();

    try {
      // Broadcast ke klien lain biar UI mereka ke-update
      if (process.env.PUSHER_APP_ID) {
        await pusherServer.trigger(`lapangan-${lapanganId}`, "slot-locked", {
          tanggal,
          jamMulai,
          jamSelesai
        });
      }
    } catch (pusherErr) {
      console.error("PUSHER ERROR IGNORED:", pusherErr);
      // Biarkan lanjut, karena lock di DB sudah berhasil
    }

    return { success: true, lockId: newLock.id };
  } catch (error: any) {
    // Kalau gagal insert krn unique constraint (race condition A vs B di DB)
    return { error: "Keduluan orang lain! Jadwal ini baru saja dikunci sepersekian detik yang lalu." };
  }
}

export async function createReservasiAction(lockId: string, lapanganId: string, tanggal: string, jamMulai: string, jamSelesai: string) {
  const user = await requireAuth();
  if (!user || !user.id) throw new Error("Unauthorized");

  // Dapatkan detail lapangan untuk harganya
  const [lap] = await db.select().from(lapangan).where(eq(lapangan.id, lapanganId));
  if (!lap) return { error: "Lapangan tidak ditemukan." };

  const totalHarga = lap.hargaPerJam; // Asumsi booking 1 jam
  const kodeUnik = Math.floor(Math.random() * 900) + 100; // 100-999
  const jumlahBayar = Number(totalHarga) + kodeUnik;

  const batasWaktuBayar = new Date();
  batasWaktuBayar.setHours(batasWaktuBayar.getHours() + 1); // 1 jam batas bayar

  // Insert reservasi
  const [newRes] = await db.insert(reservasi).values({
    pelangganId: user.id,
    lapanganId,
    tanggal,
    jamMulai,
    jamSelesai,
    status: "pending_bayar",
    totalHarga: totalHarga.toString(),
  }).returning();

  // Insert transaksi
  await db.insert(transaksi).values({
    reservasiId: newRes.id,
    kodeUnik,
    jumlahBayar: jumlahBayar.toString(),
    metodePembayaran: "transfer_bank", // Default
    statusVerifikasi: "menunggu", // Status menunggu upload bukti
    batasWaktuBayar,
  });

  // Hapus lock karena udah jadi reservasi
  await db.delete(slotLock).where(eq(slotLock.id, lockId));

  revalidatePath(`/reservasi/${lapanganId}`);
  revalidatePath("/profil");

  return { success: true, reservasiId: newRes.id };
}

export async function createOfflineReservasiAction(
  lockId: string, 
  lapanganId: string, 
  tanggal: string, 
  jamMulai: string, 
  jamSelesai: string,
  namaPelanggan: string,
  noHpPelanggan: string,
  metodePembayaran: string
) {
  const user = await requireAuth();
  if (!user || !user.id) throw new Error("Unauthorized");
  
  if ((user as any).role !== "admin" && (user as any).role !== "superadmin") {
    return { error: "Akses ditolak. Hanya admin yang bisa booking offline." };
  }

  if (!namaPelanggan || !noHpPelanggan) {
    return { error: "Nama dan No HP Pelanggan wajib diisi." };
  }

  // Dapatkan detail lapangan untuk harganya
  const [lap] = await db.select().from(lapangan).where(eq(lapangan.id, lapanganId));
  if (!lap) return { error: "Lapangan tidak ditemukan." };

  const totalHarga = lap.hargaPerJam; // Booking 1 jam

  // Bikin email dummy unik
  const dummyEmail = `offline_${Date.now()}_${crypto.randomBytes(4).toString('hex')}@smsport.com`;

  // Insert dummy pelanggan
  const [newPelanggan] = await db.insert(pelanggan).values({
    nama: namaPelanggan,
    email: dummyEmail,
    noTelepon: noHpPelanggan,
    passwordHash: crypto.randomBytes(16).toString('hex') // Password dummy
  }).returning();

  // Insert reservasi dengan status terkonfirmasi
  const [newRes] = await db.insert(reservasi).values({
    pelangganId: newPelanggan.id, // Pakai id dummy
    lapanganId,
    tanggal,
    jamMulai,
    jamSelesai,
    status: "terkonfirmasi", // Langsung terkonfirmasi
    totalHarga: totalHarga.toString(),
  }).returning();

  // Insert transaksi lunas
  await db.insert(transaksi).values({
    reservasiId: newRes.id,
    kodeUnik: 0,
    jumlahBayar: totalHarga.toString(),
    metodePembayaran: metodePembayaran,
    statusVerifikasi: "disetujui",
    diverifikasiOleh: user.id, // Disetujui oleh admin yang sedang login
    diverifikasiPada: new Date(),
    batasWaktuBayar: new Date(),
  });

  // Hapus lock karena udah jadi reservasi
  if (lockId) {
    await db.delete(slotLock).where(eq(slotLock.id, lockId));
  }

  revalidatePath(`/reservasi/${lapanganId}`);
  revalidatePath("/admin");

  return { success: true, reservasiId: newRes.id };
}
