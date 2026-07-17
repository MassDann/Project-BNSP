import { db } from "@/lib/db";
import { transaksi, reservasi, lapangan } from "@/db/schema";
import { requireAuth } from "@/lib/requireAdmin";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import ProfilClient from "./ProfilClient";

export default async function ProfilPage() {
  const user = await requireAuth();

  const data = await db.select({
    r: reservasi,
    t: transaksi,
    l: lapangan
  })
  .from(reservasi)
  .leftJoin(transaksi, eq(reservasi.id, transaksi.reservasiId))
  .innerJoin(lapangan, eq(reservasi.lapanganId, lapangan.id))
  .where(eq(reservasi.pelangganId, user.id))
  .orderBy(desc(reservasi.createdAt));

  const countTotal = data.length;
  const countTerkonfirmasi = data.filter(d => d.r.status === "terkonfirmasi").length;
  const countDibatalkan = data.filter(d => d.r.status === "dibatalkan" || d.r.status === "kedaluwarsa").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0A2540] text-white px-8 py-5 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold">Profil & Riwayat</h1>
        <Link href="/" className="bg-[#0066FF] hover:bg-blue-600 px-4 py-2 rounded font-medium transition">
          Beranda
        </Link>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8 flex gap-8">
          <div>
            <h2 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Booking</h2>
            <p className="text-4xl font-extrabold text-[#0A2540] mt-1">{countTotal}</p>
          </div>
          <div>
            <h2 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Berhasil</h2>
            <p className="text-4xl font-extrabold text-green-600 mt-1">{countTerkonfirmasi}</p>
          </div>
          <div>
            <h2 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Batal/Hangus</h2>
            <p className="text-4xl font-extrabold text-red-600 mt-1">{countDibatalkan}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Reservasi Anda</h2>

        <div className="grid gap-6">
          {data.length === 0 ? (
            <p className="text-gray-500 bg-white p-6 rounded border">Anda belum pernah melakukan reservasi.</p>
          ) : data.map((d) => (
            <ProfilClient key={d.r.id} data={d} userNama={user.name!} />
          ))}
        </div>
      </main>
    </div>
  );
}
