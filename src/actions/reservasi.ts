"use server";

import { db } from "@/lib/db";
import { reservasi, slotLock, transaksi, lapangan } from "@/db/schema";
import { requireAuth } from "@/lib/requireAdmin";
import { eq, and, or, gte, lte } from "drizzle-orm";
import { pusherServer } from "@/lib/pusher";
import { revalidatePath } from "next/cache";

export async function lockSlotAction(lapanganId: string, tanggal: string, jamMulai: string, jamSelesai: string) {
  const user = await requireAuth();

  if ((user as any).role === "admin" || (user as any).role === "superadmin") {
    return { error: "Akun Admin tidak bisa melakukan booking. Harap gunakan akun pelanggan." };
  }

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
  const existingLock = await db.select().from(slotLock).where(
    and(
      eq(slotLock.lapanganId, lapanganId),
      eq(slotLock.tanggal, tanggal),
      eq(slotLock.jamMulai, jamMulai)
    )
  );

  if (existingLock.length > 0 && existingLock[0].pelangganId !== user.id) {
    return { error: "Jadwal sedang dikonfirmasi orang lain. Coba beberapa menit lagi." };
  }

  // Kalau lock punya sendiri dan belum kedaluwarsa, lanjut
  if (existingLock.length > 0 && existingLock[0].pelangganId === user.id) {
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
      pelangganId: user.id,
      kedaluwarsaPada,
    }).returning();

    // Broadcast ke klien lain biar UI mereka ke-update
    if (process.env.PUSHER_APP_ID) {
      await pusherServer.trigger(`lapangan-${lapanganId}`, "slot-locked", {
        tanggal,
        jamMulai,
        jamSelesai
      });
    }

    return { success: true, lockId: newLock.id };
  } catch (error) {
    // Kalau gagal insert krn unique constraint (race condition di DB)
    return { error: "Gagal mengunci jadwal, mungkin baru saja diambil." };
  }
}

export async function createReservasiAction(lockId: string, lapanganId: string, tanggal: string, jamMulai: string, jamSelesai: string) {
  const user = await requireAuth();

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
