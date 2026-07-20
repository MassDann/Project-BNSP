import { db } from "@/lib/db";
import { transaksi, reservasi, pelanggan, lapangan } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import LaporanClient from "./LaporanClient";

export default async function AdminLaporanPage() {
  const data = await db.select({
    id: transaksi.id,
    createdAt: transaksi.diverifikasiPada, // Using verified date for reports
    jumlahBayar: transaksi.jumlahBayar,
    statusVerifikasi: transaksi.statusVerifikasi,
    pelangganNama: pelanggan.nama,
    pelangganEmail: pelanggan.email,
    namaOffline: reservasi.namaOffline,
    noHpOffline: reservasi.noHpOffline,
    lapanganNama: lapangan.nama,
    tanggal: reservasi.tanggal,
    jamMulai: reservasi.jamMulai,
    jamSelesai: reservasi.jamSelesai,
  })
  .from(transaksi)
  .innerJoin(reservasi, eq(transaksi.reservasiId, reservasi.id))
  .leftJoin(pelanggan, eq(reservasi.pelangganId, pelanggan.id))
  .innerJoin(lapangan, eq(reservasi.lapanganId, lapangan.id))
  .orderBy(desc(transaksi.batasWaktuBayar));

  // Default fallback if diverifikasiPada is null, use batasWaktuBayar minus 1 hour as proxy for creation
  const normalizedData = data.map(d => ({
    ...d,
    pelangganNama: d.pelangganNama || d.namaOffline || "Walk-in",
    pelangganEmail: d.pelangganEmail || `Offline (${d.noHpOffline || "-"})`,
    createdAt: d.createdAt || new Date() 
  }));

  return <LaporanClient daftarTransaksi={normalizedData} />;
}
