import { db } from "@/lib/db";
import { transaksi, reservasi, pelanggan } from "@/db/schema";
import { eq, sum, count } from "drizzle-orm";
import Link from "next/link";

export default async function AdminIndexPage() {
  // 1. Total Pendapatan (Status disetujui)
  const [{ totalPendapatan }] = await db
    .select({ totalPendapatan: sum(transaksi.jumlahBayar) })
    .from(transaksi)
    .where(eq(transaksi.statusVerifikasi, "disetujui"));

  // 2. Total Pesanan
  const [{ totalPesanan }] = await db
    .select({ totalPesanan: count() })
    .from(reservasi);

  // 3. Pesanan Sukses
  const [{ pesananSukses }] = await db
    .select({ pesananSukses: count() })
    .from(reservasi)
    .where(eq(reservasi.status, "terkonfirmasi"));

  // 4. Total Pelanggan
  const [{ totalPelanggan }] = await db
    .select({ totalPelanggan: count() })
    .from(pelanggan);

  const formattedPendapatan = Number(totalPendapatan || 0).toLocaleString("id-ID");

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Dashboard Statistik</h1>
        <p className="text-gray-400">Ringkasan performa SM Sport Center secara keseluruhan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Pendapatan */}
        <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p className="text-sm font-semibold text-gray-400 mb-1">Total Pendapatan</p>
          <h2 className="text-3xl font-black text-green-400">Rp {formattedPendapatan}</h2>
        </div>

        {/* Card 2: Pesanan Sukses */}
        <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p className="text-sm font-semibold text-gray-400 mb-1">Pesanan Sukses</p>
          <h2 className="text-3xl font-black text-blue-400">{pesananSukses} <span className="text-lg font-normal text-gray-500">transaksi</span></h2>
        </div>

        {/* Card 3: Total Pesanan */}
        <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <p className="text-sm font-semibold text-gray-400 mb-1">Total Semua Pesanan</p>
          <h2 className="text-3xl font-black text-purple-400">{totalPesanan} <span className="text-lg font-normal text-gray-500">pesanan</span></h2>
        </div>

        {/* Card 4: Total Pelanggan */}
        <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <p className="text-sm font-semibold text-gray-400 mb-1">Total Pelanggan</p>
          <h2 className="text-3xl font-black text-yellow-400">{totalPelanggan} <span className="text-lg font-normal text-gray-500">orang</span></h2>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">Akses Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/verifikasi" className="block p-4 bg-[#1F2937] hover:bg-blue-600/20 hover:border-blue-500/50 border border-[#374151] rounded-xl transition-all group">
            <h4 className="font-bold text-gray-200 group-hover:text-blue-400 mb-1">Verifikasi Pembayaran</h4>
            <p className="text-sm text-gray-500">Cek pesanan baru yang butuh persetujuan.</p>
          </Link>
          <Link href="/admin/lapangan" className="block p-4 bg-[#1F2937] hover:bg-purple-600/20 hover:border-purple-500/50 border border-[#374151] rounded-xl transition-all group">
            <h4 className="font-bold text-gray-200 group-hover:text-purple-400 mb-1">Kelola Lapangan</h4>
            <p className="text-sm text-gray-500">Update harga, status, atau tambah lapangan.</p>
          </Link>
          <Link href="/admin/laporan" className="block p-4 bg-[#1F2937] hover:bg-green-600/20 hover:border-green-500/50 border border-[#374151] rounded-xl transition-all group">
            <h4 className="font-bold text-gray-200 group-hover:text-green-400 mb-1">Cetak Laporan</h4>
            <p className="text-sm text-gray-500">Export data pendapatan ke PDF / Excel.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
