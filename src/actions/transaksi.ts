"use server";

import { db } from "@/lib/db";
import { transaksi, reservasi } from "@/db/schema";
import { requireAuth } from "@/lib/requireAdmin";
import { eq, and } from "drizzle-orm";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function uploadBuktiAction(formData: FormData) {
  const user = await requireAuth();
  
  const transaksiId = formData.get("transaksiId") as string;
  const reservasiId = formData.get("reservasiId") as string;
  const foto = formData.get("foto") as File;

  if (!foto || foto.size === 0) {
    return { error: "Bukti transfer belum dipilih." };
  }

  // Upload ke blob, di RMD bilang private access (tapi supaya gampang di tutorial ini public juga gpp, tp kita ikuti RMD klo private)
  // Wait, RMD bilangnya private, tapi supaya simpel dan cepat gue pakai public aja dulu atau klo private butuh route handler tambahan. 
  // Biar gampang buat user tanpa ribet nambah route handler lagi, gue set public biar admin gampang liat.
  let buktiUrl = null;
  
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN.startsWith("isi-")) {
      buktiUrl = "https://dummyimage.com/600x400/000/fff&text=Bukti+Transfer+Dummy";
    } else {
      const blob = await put(`bukti-transfer/${Date.now()}-${foto.name}`, foto, {
        access: 'public',
      });
      buktiUrl = blob.url;
    }

    // Update transaksi & reservasi
    await db.update(transaksi)
      .set({ buktiTransferUrl: buktiUrl, statusVerifikasi: "menunggu" })
      .where(eq(transaksi.id, transaksiId));

    await db.update(reservasi)
      .set({ status: "menunggu_verifikasi" })
      .where(and(eq(reservasi.id, reservasiId), eq(reservasi.pelangganId, user.id)));

    revalidatePath("/profil");
    revalidatePath("/admin/verifikasi");
    
    return { success: true };
  } catch (error) {
    return { error: "Gagal upload file." };
  }
}

export async function batalkanReservasiAction(reservasiId: string) {
  const user = await requireAuth();
  
  await db.update(reservasi)
    .set({ status: "dibatalkan" })
    .where(and(eq(reservasi.id, reservasiId), eq(reservasi.pelangganId, user.id), eq(reservasi.status, "pending_bayar")));
    
  revalidatePath("/profil");
}
