"use client";
import * as XLSX from 'xlsx';
import { useState } from 'react';

export default function LaporanPage({ daftarTransaksi }: { daftarTransaksi: any[] }) {
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const filtered = daftarTransaksi.filter((t) => {
    const date = new Date(t.createdAt);
    return date.getMonth() + 1 === bulan && date.getFullYear() === tahun;
  });

  const handleExport = () => {
    const dataExport = filtered.map(d => ({
      'ID Transaksi': d.id,
      'Pelanggan': d.pelangganNama,
      'Email': d.pelangganEmail,
      'Lapangan': d.lapanganNama,
      'Tanggal': d.tanggal,
      'Jam': `${d.jamMulai} - ${d.jamSelesai}`,
      'Jumlah Bayar': d.jumlahBayar,
      'Status': d.statusVerifikasi
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `Laporan_Transaksi_${tahun}_${bulan}.xlsx`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0A2540]">Laporan Transaksi</h1>
          <p className="text-gray-500 mt-2">Filter dan ekspor data transaksi reservasi lapangan.</p>
        </div>
        <button onClick={handleExport} className="bg-[#0066FF] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow-sm font-semibold transition-all hover:-translate-y-0.5">
          Export ke Excel
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bulan</label>
          <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-[#0066FF] focus:border-[#0066FF] outline-none">
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('id-ID', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun</label>
          <input type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 w-32 focus:ring-2 focus:ring-[#0066FF] focus:border-[#0066FF] outline-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-sm text-gray-600">Pelanggan</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Lapangan</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Waktu</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Jumlah</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Tidak ada transaksi di periode ini.</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-gray-800">{d.pelangganNama}</div>
                  <div className="text-xs text-gray-500">{d.pelangganEmail}</div>
                </td>
                <td className="p-4 font-medium text-gray-700">{d.lapanganNama}</td>
                <td className="p-4">
                  <div className="text-sm text-gray-800">{d.tanggal}</div>
                  <div className="text-xs text-gray-500">{d.jamMulai} - {d.jamSelesai}</div>
                </td>
                <td className="p-4 text-sm font-bold text-[#0A2540]">Rp {Number(d.jumlahBayar).toLocaleString("id-ID")}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${d.statusVerifikasi === 'disetujui' ? 'bg-green-100 text-green-700' : d.statusVerifikasi === 'ditolak' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {d.statusVerifikasi}
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
