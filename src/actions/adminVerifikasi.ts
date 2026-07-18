"use server";

import { db } from "@/lib/db";
import { reservasi, transaksi } from "@/db/schema";
import { requireAdmin } from "@/lib/requireAdmin";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function verifikasiPembayaranAction(transaksiId: string, status: "disetujui" | "ditolak", reservasiId: string) {
  const admin = await requireAdmin();
  
  await db.update(transaksi)
    .set({ 
      statusVerifikasi: status,
      diverifikasiOleh: admin.id,
      diverifikasiPada: new Date(),
    })
    .where(eq(transaksi.id, transaksiId));

  const statusReservasi = status === "disetujui" ? "terkonfirmasi" : "dibatalkan";
  
  const [res] = await db.update(reservasi)
    .set({ status: statusReservasi })
    .where(eq(reservasi.id, reservasiId))
    .returning({ lapanganId: reservasi.lapanganId });

  revalidatePath("/admin/verifikasi");
  if (res?.lapanganId) {
    revalidatePath(`/reservasi/${res.lapanganId}`);
  }
}
