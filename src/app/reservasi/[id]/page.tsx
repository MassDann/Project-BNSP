import { db } from "@/lib/db";
import { lapangan, reservasi, slotLock } from "@/db/schema";
import { eq, and, gte, or, inArray } from "drizzle-orm";
import JadwalLapangan from "@/components/booking/JadwalLapangan";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function BookingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  
  // Fetch semua lapangan yang aktif untuk menu pill buttons
  const allLapangans = await db.select().from(lapangan).where(eq(lapangan.status, "aktif"));
  
  const lap = allLapangans.find(l => l.id === params.id);

  if (!lap) {
    return <div className="p-8 text-center text-red-500 font-bold min-h-screen bg-[#0B1120]">Lapangan tidak ditemukan.</div>;
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

  // DYNAMIC CLEANUP: Hapus reservasi yang kedaluwarsa secara real-time
  const pendingReservations = listReservasi.filter(r => r.status === "pending_bayar");
  if (pendingReservations.length > 0) {
    const { transaksi } = await import("@/db/schema");
    const transactions = await db.select().from(transaksi).where(
      inArray(transaksi.reservasiId, pendingReservations.map(r => r.id))
    );
    
    const now = new Date();
    for (const t of transactions) {
      if (t.batasWaktuBayar < now && t.statusVerifikasi === "menunggu") {
         // Update DB
         await db.update(reservasi).set({ status: "kedaluwarsa" }).where(eq(reservasi.id, t.reservasiId));
         await db.update(transaksi).set({ statusVerifikasi: "kedaluwarsa" }).where(eq(transaksi.id, t.id));
         
         // Hapus dari listReservasi agar UI menganggap slot kosong
         const idx = listReservasi.findIndex(r => r.id === t.reservasiId);
         if (idx > -1) listReservasi.splice(idx, 1);
      }
    }
  }

  // Ambil slot_lock yang belum kedaluwarsa
  const listLock = await db.select().from(slotLock).where(
    and(
      eq(slotLock.lapanganId, lap.id),
      gte(slotLock.kedaluwarsaPada, new Date())
    )
  );

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-100 pb-20">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-white mb-3">Reservasi Lapangan</h1>
        <p className="text-gray-400">Pilih lapangan, tentukan jadwal, dan lakukan pembayaran</p>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <JadwalLapangan 
          lapangan={lap} 
          allLapangans={allLapangans}
          listReservasi={listReservasi} 
          listLock={listLock} 
          userId={session?.user?.id}
          userRole={(session?.user as any)?.role}
        />
      </div>
    </div>
  );
}
