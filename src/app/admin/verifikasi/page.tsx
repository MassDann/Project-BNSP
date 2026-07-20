import { db } from "@/lib/db";
import { transaksi, reservasi, pelanggan, lapangan } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import CountdownTimer from "@/components/ui/CountdownTimer";

export default async function VerifikasiPage() {
  const daftarTransaksi = await db.select({
    t: transaksi,
    r: reservasi,
    p: pelanggan,
    l: lapangan
  })
  .from(transaksi)
  .innerJoin(reservasi, eq(transaksi.reservasiId, reservasi.id))
  .leftJoin(pelanggan, eq(reservasi.pelangganId, pelanggan.id))
  .innerJoin(lapangan, eq(reservasi.lapanganId, lapangan.id))
  .orderBy(desc(transaksi.batasWaktuBayar));

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Riwayat Transaksi Masuk</h1>
      <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8">Data pembayaran dikonfirmasi secara otomatis dari sistem (Simulasi QRIS).</p>

      <div className="bg-[#111827] rounded-lg shadow-sm border border-[#1F2937] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#1F2937] border-b border-[#374151]">
              <th className="p-4 font-medium text-sm text-gray-300">Pelanggan</th>
              <th className="p-4 font-medium text-sm text-gray-300">Booking</th>
              <th className="p-4 font-medium text-sm text-gray-300">Jumlah</th>
              <th className="p-4 font-medium text-sm text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {daftarTransaksi.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">Belum ada transaksi.</td>
              </tr>
            )}
            {daftarTransaksi.map(data => (
              <tr key={data.t.id} className="border-b border-[#1F2937] hover:bg-[#1F2937]/50">
                <td className="p-4">
                  <div className="font-medium text-gray-200">
                    {data.p ? data.p.nama : data.r.namaOffline || "Walk-in"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {data.p 
                      ? (data.p.email.startsWith("offline_") ? `Offline / Walk-in (${data.p.noTelepon})` : data.p.email) 
                      : `Offline / Walk-in (${data.r.noHpOffline || "-"})`}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-300">{data.l.nama}</div>
                  <div className="text-xs text-gray-500">{data.r.tanggal} ({data.r.jamMulai})</div>
                </td>
                <td className="p-4 text-sm font-bold text-gray-300">Rp {Number(data.t.jumlahBayar).toLocaleString("id-ID")}</td>
                <td className="p-4">
                  {data.t.statusVerifikasi === 'menunggu' ? (
                    <CountdownTimer 
                      expireAt={data.t.batasWaktuBayar} 
                      className="text-xs text-gray-400 font-mono" 
                      prefixNode={
                        <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 text-xs font-bold rounded">
                          menunggu
                        </span>
                      }
                    />
                  ) : (
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      data.t.statusVerifikasi === 'disetujui' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                      data.t.statusVerifikasi === 'ditolak' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                      'bg-gray-500/10 text-gray-400 border border-gray-600/30'
                    }`}>
                      {data.t.statusVerifikasi}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
