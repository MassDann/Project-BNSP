import { db } from "@/lib/db";
import { transaksi, reservasi, lapangan, pelanggan } from "@/db/schema";
import { eq } from "drizzle-orm";
import PayClient from "./PayClient";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Simulasi Pembayaran QRIS - SM Sport Center",
};

export default async function PayPage({ params }: { params: { transaksiId: string } }) {
  const { transaksiId } = params;

  const data = await db.select({
    t: transaksi,
    r: reservasi,
    l: lapangan,
    p: pelanggan
  })
  .from(transaksi)
  .innerJoin(reservasi, eq(transaksi.reservasiId, reservasi.id))
  .innerJoin(lapangan, eq(reservasi.lapanganId, lapangan.id))
  .innerJoin(pelanggan, eq(reservasi.pelangganId, pelanggan.id))
  .where(eq(transaksi.id, transaksiId));

  if (data.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-200 py-10 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">SM Sport Center</h1>
          <p className="text-gray-400 text-sm">QRIS Payment Simulator</p>
        </div>
        
        <PayClient data={data[0]} />
      </div>
    </div>
  );
}
