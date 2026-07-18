import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transaksi, reservasi, lapangan } from "@/db/schema";
import { eq } from "drizzle-orm";
import { pusherServer } from "@/lib/pusher";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const bookingId = url.searchParams.get("bookingId");

  if (!bookingId) {
    return new NextResponse(renderErrorHTML("Booking ID tidak valid atau kosong."), {
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const tList = await db.select().from(transaksi).where(eq(transaksi.id, bookingId));
    if (tList.length === 0) {
      return new NextResponse(renderErrorHTML("Pesanan tidak ditemukan."), {
        headers: { "Content-Type": "text/html" },
      });
    }

    const t = tList[0];
    const rList = await db.select().from(reservasi).where(eq(reservasi.id, t.reservasiId));
    if (rList.length === 0) {
      return new NextResponse(renderErrorHTML("Data reservasi tidak lengkap."), {
        headers: { "Content-Type": "text/html" },
      });
    }

    const r = rList[0];
    const lList = await db.select().from(lapangan).where(eq(lapangan.id, r.lapanganId));
    const l = lList[0];

    // Cek Expiry
    const now = new Date();
    if (t.batasWaktuBayar && new Date(t.batasWaktuBayar) < now && t.statusVerifikasi === "menunggu") {
      return new NextResponse(renderErrorHTML("Batas waktu pembayaran telah habis (Expired)."), {
        headers: { "Content-Type": "text/html" },
      });
    }

    const action = url.searchParams.get("action");

    // Jika belum ada action konfirmasi, tampilkan halaman minta konfirmasi
    if (action !== "confirm" && t.statusVerifikasi === "menunggu") {
      return new NextResponse(renderConfirmationHTML(r, t, l), {
        headers: { "Content-Type": "text/html" },
      });
    }

    let isJustPaid = false;

    // Jika sudah dikonfirmasi dan status menunggu, proses pelunasan
    if (t.statusVerifikasi === "menunggu" && r.status === "pending_bayar") {
      await db.update(transaksi)
        .set({
          statusVerifikasi: "terkonfirmasi",
          diverifikasiPada: new Date(),
        })
        .where(eq(transaksi.id, t.id));

      await db.update(reservasi)
        .set({
          status: "terkonfirmasi",
        })
        .where(eq(reservasi.id, r.id));

      isJustPaid = true;

      // Trigger Pusher untuk realtime update di layar laptop (kasir/pelanggan)
      if (process.env.PUSHER_APP_ID && process.env.PUSHER_SECRET) {
        await pusherServer.trigger(`transaksi-${t.id}`, "payment-success", {
          transaksiId: t.id,
        });
      }

      revalidatePath("/profil");
      revalidatePath("/admin");
    }

    return new NextResponse(renderSuccessHTML(r, t, l, isJustPaid), {
      headers: { "Content-Type": "text/html" },
    });

  } catch (error) {
    console.error("Error in checkout:", error);
    return new NextResponse(renderErrorHTML("Terjadi kesalahan internal sistem."), {
      headers: { "Content-Type": "text/html" },
    });
  }
}

function renderErrorHTML(message: string) {
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pembayaran Gagal</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen p-4">
      <div class="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border-t-4 border-red-500">
        <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Checkout Gagal</h1>
        <p class="text-gray-500 mb-6">${message}</p>
        <p class="text-xs text-gray-400">Silakan tutup halaman ini dan coba lagi.</p>
      </div>
    </body>
    </html>
  `;
}

function renderSuccessHTML(r: any, t: any, l: any, isJustPaid: boolean) {
  const tanggal = new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pembayaran Sukses</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen p-4 font-sans">
      <div class="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
        
        <div class="text-center mb-6 pt-2">
          <div class="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h1 class="text-2xl font-black text-gray-800 mb-1">PEMBAYARAN LUNAS</h1>
          <p class="text-sm font-semibold text-gray-500">SM Sport Center</p>
        </div>

        <div class="border-t border-dashed border-gray-300 py-4 mb-4">
          <div class="flex justify-between mb-2">
            <span class="text-gray-500 text-sm">ID Booking</span>
            <span class="font-bold text-gray-800 text-sm">${r.id.split("-")[0].toUpperCase()}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-500 text-sm">Tanggal Lunas</span>
            <span class="font-bold text-gray-800 text-sm">${tanggal}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-500 text-sm">Item (Lapangan)</span>
            <span class="font-bold text-gray-800 text-sm">${l.nama} (${l.jenis})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 text-sm">Jadwal Main</span>
            <span class="font-bold text-gray-800 text-sm">${r.tanggal} (${r.jamMulai.slice(0, 5)} - ${r.jamSelesai.slice(0, 5)})</span>
          </div>
        </div>

        <div class="border-t border-b border-gray-200 py-4 mb-6 bg-gray-50 px-4 rounded-lg">
          <div class="flex justify-between items-center">
            <span class="text-gray-600 font-bold">Total Harga</span>
            <span class="text-2xl font-black text-green-600">Rp ${Number(t.jumlahBayar).toLocaleString("id-ID")}</span>
          </div>
        </div>

        <div class="text-center">
          ${isJustPaid 
            ? '<p class="text-sm text-gray-500 mb-2">Pembayaran kamu sedang dikonfirmasi secara otomatis ke layar laptop/kasir.</p>' 
            : '<p class="text-sm text-gray-500 mb-2">Pesanan ini sudah lunas sebelumnya.</p>'}
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Silakan tutup tab browser ini</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function renderConfirmationHTML(r: any, t: any, l: any) {
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Konfirmasi Pembayaran</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen p-4 font-sans">
      <div class="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
        
        <div class="text-center mb-6 pt-2">
          <div class="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <h1 class="text-2xl font-black text-gray-800 mb-1">Simulasi QRIS</h1>
          <p class="text-sm font-semibold text-gray-500">Total Tagihan: Rp ${Number(t.jumlahBayar).toLocaleString("id-ID")}</p>
        </div>

        <div class="border-t border-dashed border-gray-300 py-4 mb-6">
          <p class="text-center text-sm text-gray-600">Tekan tombol di bawah ini untuk mensimulasikan persetujuan pembayaran dari aplikasi M-Banking/E-Wallet kamu.</p>
        </div>

        <div class="flex flex-col gap-3">
          <a href="/api/payments/checkout?bookingId=${t.id}&action=confirm" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-center shadow-lg transition-all">
            Bayar Sekarang
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}
