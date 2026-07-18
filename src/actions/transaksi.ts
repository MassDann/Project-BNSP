"use server";

import { db } from "@/lib/db";
import { transaksi, reservasi } from "@/db/schema";
import { requireAuth } from "@/lib/requireAdmin";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function konfirmasiPembayaranAction(transaksiId: string, reservasiId: string) {
  try {
    const user = await requireAuth();
    if (!user || !user.id) throw new Error("Unauthorized");
    
    if (!transaksiId || !reservasiId) {
      return { error: "Data tidak lengkap" };
    }

    // Update transaksi & reservasi
    await db.update(transaksi)
      .set({ 
        statusVerifikasi: 'menunggu' 
      }).where(eq(transaksi.id, transaksiId));

    await db.update(reservasi)
      .set({ status: "menunggu_verifikasi" })
      .where(and(eq(reservasi.id, reservasiId), eq(reservasi.pelangganId, user.id)));

    revalidatePath("/profil");
    revalidatePath("/admin/verifikasi");
    
    return { success: true };
  } catch (error) {
    return { error: "Gagal mengonfirmasi." };
  }
}

export async function batalkanReservasiAction(reservasiId: string) {
  const user = await requireAuth();
  if (!user || !user.id) throw new Error("Unauthorized");
  
  const [res] = await db.update(reservasi)
    .set({ status: "dibatalkan" })
    .where(and(eq(reservasi.id, reservasiId), eq(reservasi.pelangganId, user.id), eq(reservasi.status, "pending_bayar")))
    .returning({ lapanganId: reservasi.lapanganId });
    
  revalidatePath("/profil");
  if (res?.lapanganId) {
    revalidatePath(`/reservasi/${res.lapanganId}`);
  }
}
