import { db } from "@/lib/db";
import { lapangan } from "@/db/schema";
import { addLapanganAction, toggleLapanganStatusAction } from "@/actions/adminLapangan";

import EditLapanganModal from "./EditLapanganModal";

export default async function AdminLapanganPage() {
  const lapangans = await db.select().from(lapangan);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Kelola Lapangan</h1>

      <div className="bg-[#111827] p-6 rounded-lg shadow-sm border border-[#1F2937] mb-8 max-w-2xl">
        <h2 className="text-lg font-bold text-gray-100 mb-4">Tambah Lapangan Baru</h2>
        <form action={addLapanganAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nama Lapangan</label>
              <input name="nama" type="text" required className="w-full bg-[#1F2937] border border-[#374151] text-gray-100 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="Cth: Futsal 3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Jenis</label>
              <select name="jenis" className="w-full bg-[#1F2937] border border-[#374151] text-gray-100 rounded px-3 py-2 focus:border-blue-500 focus:outline-none">
                <option value="futsal">Futsal</option>
                <option value="badminton">Badminton</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Harga per Jam (Rp)</label>
            <input name="hargaPerJam" type="number" required className="w-full bg-[#1F2937] border border-[#374151] text-gray-100 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="150000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Foto Lapangan</label>
            <input name="foto" type="file" accept="image/*" className="w-full bg-[#1F2937] border border-[#374151] text-gray-100 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <button type="submit" className="bg-[#2563EB] hover:bg-blue-600 text-white px-4 py-2 rounded transition font-medium shadow-sm">Simpan Lapangan</button>
        </form>
      </div>

      <div className="bg-[#111827] rounded-lg shadow-sm border border-[#1F2937] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1F2937] border-b border-[#374151]">
              <th className="p-4 font-medium text-sm text-gray-300">Nama</th>
              <th className="p-4 font-medium text-sm text-gray-300">Jenis</th>
              <th className="p-4 font-medium text-sm text-gray-300">Harga/Jam</th>
              <th className="p-4 font-medium text-sm text-gray-300">Status</th>
              <th className="p-4 font-medium text-sm text-gray-300">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {lapangans.map(l => (
              <tr key={l.id} className="border-b border-[#1F2937] hover:bg-[#1F2937]/50">
                <td className="p-4 font-medium text-gray-200">{l.nama}</td>
                <td className="p-4 capitalize text-gray-400">{l.jenis}</td>
                <td className="p-4 text-gray-400">Rp {Number(l.hargaPerJam).toLocaleString("id-ID")}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${l.status === 'aktif' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {l.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <EditLapanganModal lapangan={l} />
                    <form action={async () => {
                      "use server";
                      await toggleLapanganStatusAction(l.id, l.status);
                    }}>
                      <button type="submit" className="text-sm text-red-400 font-medium hover:text-red-300 hover:underline">
                        {l.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
