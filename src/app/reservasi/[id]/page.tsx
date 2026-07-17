import { db } from "@/lib/db";
import { lapangan, reservasi, slotLock } from "@/db/schema";
import { eq, and, gte, or } from "drizzle-orm";
import JadwalLapangan from "@/components/booking/JadwalLapangan";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function BookingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  const [lap] = await db.select().from(lapangan).where(eq(lapangan.id, params.id));

  if (!lap) {
    return <div className="p-8 text-center text-red-500 font-bold">Lapangan tidak ditemukan.</div>;
  }

  // Ambil reservasi yang aktif
  const listReservasi = await db.select().from(reservasi).where(
    and(
      eq(reservasi.lapanganId, lap.id),
      gte(reservasi.tanggal, new Date().toISOString().split("T")[0]),
      or(
        eq(reservasi.status, "terkonfirmasi"),
        eq(reservasi.status, "menunggu_verifikasi"),
        eq(reservasi.status, "pending_bayar")
      )
    )
  );

  // Ambil slot_lock yang belum kedaluwarsa
  const listLock = await db.select().from(slotLock).where(
    and(
      eq(slotLock.lapanganId, lap.id),
      gte(slotLock.kedaluwarsaPada, new Date())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-[#0A2540] text-white px-8 py-5 flex justify-between items-center shadow-lg">
        <Link href="/" className="font-extrabold text-xl hover:text-gray-300 transition-colors">
          &larr; Kembali
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="h-64 bg-gray-200 w-full relative">
            {lap.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lap.fotoUrl} alt={lap.nama} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400">Tidak ada foto</div>
            )}
          </div>
          <div className="p-8">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-extrabold text-gray-900">{lap.nama}</h1>
              <span className="bg-[#E6F0FF] text-[#0066FF] text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                {lap.jenis}
              </span>
            </div>
            <p className="text-[#0A2540] font-black text-2xl">
              Rp {Number(lap.hargaPerJam).toLocaleString("id-ID")}<span className="text-base text-gray-500 font-medium"> / jam</span>
            </p>
          </div>
        </div>

        <JadwalLapangan 
          lapangan={lap} 
          listReservasi={listReservasi} 
          listLock={listLock} 
          userId={session?.user?.id}
        />
      </div>
    </div>
  );
}
