import { db } from "@/lib/db";
import { reservasi, transaksi } from "@/db/schema";
import { and, eq, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Hanya proses jika auth header sesuai dengan CRON_SECRET yang diset di Vercel
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Cari semua transaksi yang statusnya menunggu dan lewat batas waktu
  const expiredTransactions = await db.select()
    .from(transaksi)
    .where(
      and(
        eq(transaksi.statusVerifikasi, "menunggu"),
        lte(transaksi.batasWaktuBayar, now)
      )
    );

  if (expiredTransactions.length === 0) {
    return NextResponse.json({ message: "No expired reservations found" });
  }

  // Update status transaksi menjadi gagal
  // Di sistem kita, kalau lewat batas waktu dan bukti transfer blm ada, brati gagal
  // Update reservasi menjadi kedaluwarsa
  const expiredIds = expiredTransactions.map(t => t.reservasiId);

  try {
    for (const tx of expiredTransactions) {
      if (!tx.buktiTransferUrl) { // Pastikan belum upload bukti sama sekali
        await db.update(reservasi)
          .set({ status: "kedaluwarsa" })
          .where(eq(reservasi.id, tx.reservasiId));
      }
    }
    
    return NextResponse.json({ message: `Expired ${expiredIds.length} reservations` });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process expiration" }, { status: 500 });
  }
}
