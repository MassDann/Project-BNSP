import { db } from "@/lib/db";
import { transaksi, reservasi, lapangan } from "@/db/schema";
import { requireAuth } from "@/lib/requireAdmin";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import ProfilClient from "./ProfilClient";

export default async function ProfilPage() {
  const user = await requireAuth();
  if (!user || !user.id) throw new Error("Unauthorized");

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
    <div className="min-h-screen bg-[#0B1120] font-sans">
      <header className="bg-[#111827] border-b border-[#1F2937] text-white px-8 py-5 flex justify-between items-center sticky top-0 z-10 shadow-lg">
        <h1 className="text-xl font-bold tracking-wide">Profil & Riwayat</h1>
        <Link href="/" className="bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 rounded-lg font-bold transition-all shadow-md shadow-blue-500/20 text-sm">
          Kembali ke Beranda
        </Link>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-6">
        <div className="bg-[#111827] rounded-2xl p-8 shadow-xl border border-[#1F2937] mb-10 flex gap-10">
          <div>
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Booking</h2>
            <p className="text-4xl font-black text-white">{countTotal}</p>
          </div>
          <div>
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Berhasil</h2>
            <p className="text-4xl font-black text-green-500">{countTerkonfirmasi}</p>
          </div>
          <div>
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Batal/Hangus</h2>
            <p className="text-4xl font-black text-red-500">{countDibatalkan}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">Daftar Reservasi Anda</h2>

        <div className="grid gap-6">
          {data.length === 0 ? (
            <div className="bg-[#111827] p-10 rounded-2xl border border-[#1F2937] text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="text-gray-400 font-medium">Anda belum pernah melakukan reservasi.</p>
              <Link href="/reservasi" className="mt-4 inline-block text-[#3B82F6] hover:text-blue-400 font-bold hover:underline transition-colors">
                Mulai Booking Sekarang &rarr;
              </Link>
            </div>
          ) : data.map((d) => (
            <ProfilClient key={d.r.id} data={d} userNama={user.name!} />
          ))}
        </div>
      </main>
    </div>
  );
}
