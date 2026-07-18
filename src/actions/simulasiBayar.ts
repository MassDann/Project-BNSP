"use server";

import { db } from "@/lib/db";
import { reservasi, transaksi } from "@/db/schema";
import { eq } from "drizzle-orm";
import { pusherServer } from "@/lib/pusher";
import { revalidatePath } from "next/cache";

export async function simulasiBayarAction(transaksiId: string) {
  try {
    const [tx] = await db.select().from(transaksi).where(eq(transaksi.id, transaksiId));
    if (!tx) return { error: "Transaksi tidak ditemukan." };

    const [res] = await db.select().from(reservasi).where(eq(reservasi.id, tx.reservasiId));
    if (!res) return { error: "Reservasi tidak ditemukan." };

    if (res.status !== "pending_bayar") {
      return { error: "Pesanan sudah dibayar atau kedaluwarsa." };
    }

    if (new Date() > new Date(tx.batasWaktuBayar)) {
      await db.update(reservasi).set({ status: "kedaluwarsa" }).where(eq(reservasi.id, res.id));
      return { error: "QRIS sudah kedaluwarsa." };
    }

    // Update status sukses
    await db.update(transaksi)
      .set({ statusVerifikasi: "disetujui" })
      .where(eq(transaksi.id, transaksiId));

    await db.update(reservasi)
      .set({ status: "terkonfirmasi" })
      .where(eq(reservasi.id, res.id));

    // Beritahu frontend via Pusher
    if (process.env.PUSHER_APP_ID) {
      await pusherServer.trigger(`transaksi-${transaksiId}`, "payment-success", {
        transaksiId
      });
    }

    revalidatePath("/profil");
    revalidatePath("/admin/verifikasi");
    revalidatePath(`/reservasi/${res.lapanganId}`);

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Gagal memproses pembayaran simulasi." };
  }
}
