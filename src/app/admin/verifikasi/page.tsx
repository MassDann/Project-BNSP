import { db } from "@/lib/db";
import { transaksi, reservasi, pelanggan, lapangan } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifikasiPembayaranAction } from "@/actions/adminVerifikasi";

export default async function VerifikasiPage() {
  const daftarTransaksi = await db.select({
    t: transaksi,
    r: reservasi,
    p: pelanggan,
    l: lapangan
  })
  .from(transaksi)
  .innerJoin(reservasi, eq(transaksi.reservasiId, reservasi.id))
  .innerJoin(pelanggan, eq(reservasi.pelangganId, pelanggan.id))
  .innerJoin(lapangan, eq(reservasi.lapanganId, lapangan.id))
  .orderBy(desc(transaksi.batasWaktuBayar));

  const menunggu = daftarTransaksi.filter(d => d.t.statusVerifikasi === "menunggu");
  const riwayat = daftarTransaksi.filter(d => d.t.statusVerifikasi !== "menunggu");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Verifikasi Pembayaran</h1>

      <h2 className="text-xl font-bold mb-4 text-[#0066FF]">Menunggu Verifikasi</h2>
      {menunggu.length === 0 ? (
        <p className="text-gray-500 mb-8 bg-white p-4 rounded border border-gray-100 shadow-sm">Tidak ada transaksi yang menunggu verifikasi saat ini.</p>
      ) : (
        <div className="grid gap-4 mb-8">
          {menunggu.map((data) => (
            <div key={data.t.id} className="bg-white p-6 rounded-lg border border-yellow-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
              <div>
                <p className="font-bold text-gray-800 text-lg">{data.p.nama} <span className="text-sm font-normal text-gray-500">({data.p.email})</span></p>
                <p className="text-sm text-gray-600 mt-1">{data.l.nama} — {data.r.tanggal} ({data.r.jamMulai} - {data.r.jamSelesai})</p>
                <p className="text-lg font-bold text-[#0A2540] mt-3">Rp {Number(data.t.jumlahBayar).toLocaleString("id-ID")}</p>
              </div>
              <div className="flex flex-col gap-3 min-w-[200px]">
                {data.t.buktiTransferUrl ? (
                  <a href={data.t.buktiTransferUrl} target="_blank" rel="noreferrer" className="text-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded">
                    Lihat Bukti Transfer
                  </a>
                ) : (
                  <span className="text-sm text-red-500 italic text-center p-2">Belum upload bukti</span>
                )}
                
                <div className="flex gap-2">
                  <form action={async () => {
                    "use server";
                    await verifikasiPembayaranAction(data.t.id, "disetujui", data.r.id);
                  }} className="flex-1">
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded font-medium">Setujui</button>
                  </form>
                  <form action={async () => {
                    "use server";
                    await verifikasiPembayaranAction(data.t.id, "ditolak", data.r.id);
                  }} className="flex-1">
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded font-medium">Tolak</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 text-gray-700">Riwayat Verifikasi</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="p-4 font-medium text-sm text-gray-600">Pelanggan</th>
              <th className="p-4 font-medium text-sm text-gray-600">Booking</th>
              <th className="p-4 font-medium text-sm text-gray-600">Jumlah</th>
              <th className="p-4 font-medium text-sm text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.map(data => (
              <tr key={data.t.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-800">{data.p.nama}</div>
                  <div className="text-xs text-gray-500">{data.p.email}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-800">{data.l.nama}</div>
                  <div className="text-xs text-gray-500">{data.r.tanggal} ({data.r.jamMulai})</div>
                </td>
                <td className="p-4 text-sm font-bold text-gray-800">Rp {Number(data.t.jumlahBayar).toLocaleString("id-ID")}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${data.t.statusVerifikasi === 'disetujui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {data.t.statusVerifikasi}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
