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
    <div className="p-4 md:p-8 min-h-screen bg-[#0B1120]">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Laporan Transaksi</h1>
          <p className="text-sm md:text-base text-gray-400 mt-1 md:mt-2">Filter dan ekspor data transaksi reservasi lapangan.</p>
        </div>
        <button onClick={handleExport} className="w-full md:w-auto bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow-sm font-semibold transition-all hover:-translate-y-0.5">
          Export ke Excel
        </button>
      </div>

      <div className="bg-[#111827] p-4 md:p-6 rounded-xl shadow-sm border border-[#1F2937] mb-6 md:mb-8 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-semibold text-gray-300 mb-2">Bulan</label>
          <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="w-full sm:w-auto border border-[#374151] rounded-lg px-4 py-2 bg-[#1F2937] text-white focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none">
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('id-ID', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-semibold text-gray-300 mb-2">Tahun</label>
          <input type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="w-full sm:w-32 border border-[#374151] rounded-lg px-4 py-2 bg-[#1F2937] text-white focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none" />
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl shadow-sm border border-[#1F2937] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#1F2937] border-b border-[#374151]">
              <th className="p-4 font-semibold text-sm text-gray-300">Pelanggan</th>
              <th className="p-4 font-semibold text-sm text-gray-300">Lapangan</th>
              <th className="p-4 font-semibold text-sm text-gray-300">Waktu</th>
              <th className="p-4 font-semibold text-sm text-gray-300">Jumlah</th>
              <th className="p-4 font-semibold text-sm text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Tidak ada transaksi di periode ini.</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id} className="border-b border-[#1F2937] hover:bg-[#1F2937]/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-gray-200">{d.pelangganNama}</div>
                  <div className="text-xs text-gray-500">{d.pelangganEmail}</div>
                </td>
                <td className="p-4 font-medium text-gray-400">{d.lapanganNama}</td>
                <td className="p-4">
                  <div className="text-sm text-gray-300">{d.tanggal}</div>
                  <div className="text-xs text-gray-500">{d.jamMulai} - {d.jamSelesai}</div>
                </td>
                <td className="p-4 text-sm font-bold text-[#3B82F6]">Rp {Number(d.jumlahBayar).toLocaleString("id-ID")}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${d.statusVerifikasi === 'disetujui' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : d.statusVerifikasi === 'ditolak' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
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
