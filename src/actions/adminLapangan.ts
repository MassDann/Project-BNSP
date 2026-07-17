"use server";

import { db } from "@/lib/db";
import { lapangan } from "@/db/schema";
import { requireAdmin } from "@/lib/requireAdmin";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function addLapanganAction(formData: FormData) {
  await requireAdmin();
  
  const nama = formData.get("nama") as string;
  const jenis = formData.get("jenis") as string;
  const hargaPerJam = formData.get("hargaPerJam") as string;
  const foto = formData.get("foto") as File;

  let fotoUrl = null;
  
  if (foto && foto.size > 0) {
    const blob = await put(`lapangan-photos/${Date.now()}-${foto.name}`, foto, {
      access: 'public',
    });
    fotoUrl = blob.url;
  }

  await db.insert(lapangan).values({
    nama,
    jenis,
    hargaPerJam,
    fotoUrl,
  });

  revalidatePath("/admin/lapangan");
  revalidatePath("/");
}

export async function toggleLapanganStatusAction(id: string, currentStatus: string) {
  await requireAdmin();
  const newStatus = currentStatus === "aktif" ? "nonaktif" : "aktif";
  
  await db.update(lapangan).set({ status: newStatus }).where(eq(lapangan.id, id));
  
  revalidatePath("/admin/lapangan");
  revalidatePath("/");
}
