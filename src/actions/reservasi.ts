"use server";

import { db } from "@/lib/db";
import { reservasi, slotLock, transaksi, lapangan, pelanggan } from "@/db/schema";
import { requireAuth } from "@/lib/requireAdmin";
import { eq, and, or, gt, lt, lte } from "drizzle-orm";
import { pusherServer } from "@/lib/pusher";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function lockSlotAction(lapanganId: string, tanggal: string, jamMulai: string, jamSelesai: string) {
  const user = await requireAuth();
  if (!user || !user.id) throw new Error("Unauthorized");

  await db.delete(slotLock).where(lte(slotLock.kedaluwarsaPada, new Date()));

  // Cek overlap booking
  const existingRes = await db.select().from(reservasi).where(
    and(
      eq(reservasi.lapanganId, lapanganId),
      eq(reservasi.tanggal, tanggal),
      lt(reservasi.jamMulai, jamSelesai),
      gt(reservasi.jamSelesai, jamMulai),
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

  let lockUserId = user.id;

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
      lt(slotLock.jamMulai, jamSelesai),
      gt(slotLock.jamSelesai, jamMulai)
    )
  );

  if (existingLock.length > 0 && existingLock[0].pelangganId !== lockUserId) {
    return { error: "Jadwal sedang dikonfirmasi orang lain. Coba beberapa menit lagi." };
  }

  if (existingLock.length > 0 && existingLock[0].pelangganId === lockUserId) {
    return { success: true, lockId: existingLock[0].id };
  }

  const kedaluwarsaPada = new Date();
  kedaluwarsaPada.setMinutes(kedaluwarsaPada.getMinutes() + 10);

  try {
    const [newLock] = await db.insert(slotLock).values({
      lapanganId,
      tanggal,
      jamMulai,
      jamSelesai,
      pelangganId: lockUserId,
      kedaluwarsaPada,
    }).returning();

    try {
      if (process.env.PUSHER_APP_ID) {
        await pusherServer.trigger(`lapangan-${lapanganId}`, "slot-locked", {
          tanggal,
          jamMulai,
          jamSelesai
        });
      }
    } catch (pusherErr) {
      console.error("PUSHER ERROR IGNORED:", pusherErr);
    }

    return { success: true, lockId: newLock.id };
  } catch (error: any) {
    return { error: "Keduluan orang lain! Jadwal ini baru saja dikunci." };
  }
}

export async function createReservasiAction(lockId: string, lapanganId: string, tanggal: string, jamMulai: string, jamSelesai: string) {
  const user = await requireAuth();
  if (!user || !user.id) throw new Error("Unauthorized");

  const [lap] = await db.select().from(lapangan).where(eq(lapangan.id, lapanganId));
  if (!lap) return { error: "Lapangan tidak ditemukan." };

  const durasi = parseInt(jamSelesai.split(":")[0]) - parseInt(jamMulai.split(":")[0]);
  const totalHarga = Number(lap.hargaPerJam) * durasi;
  const kodeUnik = 0;
  const jumlahBayar = totalHarga;

  const batasWaktuBayar = new Date();
  batasWaktuBayar.setMinutes(batasWaktuBayar.getMinutes() + 10);

  const [newRes] = await db.insert(reservasi).values({
    pelangganId: user.id,
    lapanganId,
    tanggal,
    jamMulai,
    jamSelesai,
    status: "pending_bayar",
    totalHarga: totalHarga.toString(),
  }).returning();

  await db.insert(transaksi).values({
    reservasiId: newRes.id,
    kodeUnik,
    jumlahBayar: jumlahBayar.toString(),
    metodePembayaran: "qris",
    statusVerifikasi: "menunggu",
    batasWaktuBayar,
  });

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
    return { error: "Akses ditolak." };
  }

  if (!namaPelanggan || !noHpPelanggan) {
    return { error: "Nama dan No HP Pelanggan wajib diisi." };
  }

  const [lap] = await db.select().from(lapangan).where(eq(lapangan.id, lapanganId));
  if (!lap) return { error: "Lapangan tidak ditemukan." };

  const durasi = parseInt(jamSelesai.split(":")[0]) - parseInt(jamMulai.split(":")[0]);
  const totalHarga = Number(lap.hargaPerJam) * durasi;

  const dummyEmail = `offline_${Date.now()}_${crypto.randomBytes(4).toString('hex')}@smsport.com`;

  const [newPelanggan] = await db.insert(pelanggan).values({
    nama: namaPelanggan,
    email: dummyEmail,
    noTelepon: noHpPelanggan,
    passwordHash: crypto.randomBytes(16).toString('hex')
  }).returning();

  let statusRes = "terkonfirmasi";
  let statusTrans = "disetujui";
  let diverifikasiOleh = user.id;

  if (metodePembayaran === "qris") {
    statusRes = "pending_bayar";
    statusTrans = "menunggu";
    diverifikasiOleh = null as any; // belum diverifikasi
  }

  const [newRes] = await db.insert(reservasi).values({
    pelangganId: newPelanggan.id,
    lapanganId,
    tanggal,
    jamMulai,
    jamSelesai,
    status: statusRes,
    totalHarga: totalHarga.toString(),
  }).returning();

  const [newTrans] = await db.insert(transaksi).values({
    reservasiId: newRes.id,
    kodeUnik: 0,
    jumlahBayar: totalHarga.toString(),
    metodePembayaran: metodePembayaran,
    statusVerifikasi: statusTrans,
    diverifikasiOleh: diverifikasiOleh,
    diverifikasiPada: diverifikasiOleh ? new Date() : null,
    batasWaktuBayar: new Date(Date.now() + 600000), // 10 menit
  }).returning();

  if (lockId) {
    await db.delete(slotLock).where(eq(slotLock.id, lockId));
  }

  revalidatePath(`/reservasi/${lapanganId}`);
  revalidatePath("/admin");

  return { success: true, reservasiId: newRes.id, transaksiId: newTrans.id };
}

export async function unlockSlotAction(lockId: string, lapanganId: string, tanggal: string, jamMulai: string, jamSelesai: string) {
  const user = await requireAuth();
  if (!user || !user.id) throw new Error("Unauthorized");
  
  await db.delete(slotLock).where(eq(slotLock.id, lockId));
  
  try {
    if (process.env.PUSHER_APP_ID) {
      await pusherServer.trigger(`lapangan-${lapanganId}`, "slot-unlocked", {
        tanggal,
        jamMulai,
        jamSelesai
      });
    }
  } catch (err) {
    console.error("PUSHER ERROR:", err);
  }
  
  return { success: true };
}
