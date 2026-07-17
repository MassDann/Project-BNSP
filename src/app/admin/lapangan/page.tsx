import { db } from "@/lib/db";
import { lapangan } from "@/db/schema";
import { addLapanganAction, toggleLapanganStatusAction } from "@/actions/adminLapangan";

export default async function AdminLapanganPage() {
  const lapangans = await db.select().from(lapangan);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Lapangan</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 max-w-2xl">
        <h2 className="text-lg font-bold mb-4">Tambah Lapangan Baru</h2>
        <form action={addLapanganAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lapangan</label>
              <input name="nama" type="text" required className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Cth: Futsal 3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
              <select name="jenis" className="w-full border border-gray-300 rounded px-3 py-2">
                <option value="futsal">Futsal</option>
                <option value="badminton">Badminton</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga per Jam (Rp)</label>
            <input name="hargaPerJam" type="number" required className="w-full border border-gray-300 rounded px-3 py-2" placeholder="150000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto Lapangan</label>
            <input name="foto" type="file" accept="image/*" className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <button type="submit" className="bg-[#0A2540] hover:bg-[#0066FF] text-white px-4 py-2 rounded transition">Simpan Lapangan</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="p-4 font-medium text-sm text-gray-600">Nama</th>
              <th className="p-4 font-medium text-sm text-gray-600">Jenis</th>
              <th className="p-4 font-medium text-sm text-gray-600">Harga/Jam</th>
              <th className="p-4 font-medium text-sm text-gray-600">Status</th>
              <th className="p-4 font-medium text-sm text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {lapangans.map(l => (
              <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium">{l.nama}</td>
                <td className="p-4 capitalize">{l.jenis}</td>
                <td className="p-4">Rp {Number(l.hargaPerJam).toLocaleString("id-ID")}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${l.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {l.status}
                  </span>
                </td>
                <td className="p-4">
                  <form action={async () => {
                    "use server";
                    await toggleLapanganStatusAction(l.id, l.status);
                  }}>
                    <button type="submit" className="text-sm text-[#0066FF] hover:underline">
                      {l.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
