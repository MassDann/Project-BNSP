"use server";

import { db } from "@/lib/db";
import { transaksi, reservasi } from "@/db/schema";
import { requireAuth } from "@/lib/requireAdmin";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function uploadBuktiAction(formData: FormData) {
  try {
    const user = await requireAuth();
    if (!user || !user.id) throw new Error("Unauthorized");
    
    const transaksiId = formData.get("transaksiId") as string;
    const reservasiId = formData.get("reservasiId") as string;
    const foto = formData.get("foto") as File;

    if (!transaksiId || !reservasiId || !foto || foto.size === 0) {
      return { error: "Data tidak lengkap atau file kosong" };
    }

    // Convert foto ke Base64 supaya bisa langsung disimpen di database (tanpa butuh Vercel Blob atau Netlify Blob)
    const arrayBuffer = await foto.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const buktiUrl = `data:${foto.type};base64,${base64}`;

    // Update transaksi & reservasi
    await db.update(transaksi)
      .set({ 
        buktiTransferUrl: buktiUrl,
        statusVerifikasi: 'menunggu' 
      }).where(eq(transaksi.id, transaksiId));

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
