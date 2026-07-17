"use client";

import { useState, useEffect } from "react";
import { uploadBuktiAction, batalkanReservasiAction } from "@/actions/transaksi";
import { jsPDF } from "jspdf";

export default function ProfilClient({ data, userNama }: { data: any, userNama: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const statusColors: any = {
    "pending_bayar": "bg-yellow-100 text-yellow-800",
    "menunggu_verifikasi": "bg-blue-100 text-blue-800",
    "terkonfirmasi": "bg-green-100 text-green-800",
    "dibatalkan": "bg-red-100 text-red-800",
    "kedaluwarsa": "bg-gray-200 text-gray-800"
  };

  const statusLabels: any = {
    "pending_bayar": "Menunggu Pembayaran",
    "menunggu_verifikasi": "Menunggu Verifikasi Admin",
    "terkonfirmasi": "Berhasil / Terkonfirmasi",
    "dibatalkan": "Dibatalkan",
    "kedaluwarsa": "Kedaluwarsa"
  };

  useEffect(() => {
    if (data.r.status !== "pending_bayar" || !data.t) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const batas = new Date(data.t.batasWaktuBayar).getTime();
      const distance = batas - now;

      if (distance < 0) {
        setTimeLeft("Waktu Habis");
        clearInterval(interval);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data.r.status, data.t]);

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SM Sport Center", 20, 20);
    
    doc.setFontSize(14);
    doc.text("Bukti Reservasi (Terkonfirmasi)", 20, 30);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`ID Booking: ${data.r.id}`, 20, 45);
    doc.text(`Nama Pemesan: ${userNama}`, 20, 52);
    doc.text(`Lapangan: ${data.l.nama} (${data.l.jenis})`, 20, 59);
    doc.text(`Tanggal: ${data.r.tanggal}`, 20, 66);
    doc.text(`Waktu: ${data.r.jamMulai} - ${data.r.jamSelesai}`, 20, 73);
    doc.text(`Total Bayar: Rp ${Number(data.t.jumlahBayar).toLocaleString("id-ID")}`, 20, 80);
    
    doc.save(`Invoice_${data.l.nama}_${data.r.tanggal}.pdf`);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("transaksiId", data.t.id);
    formData.append("reservasiId", data.r.id);
    
    const res = await uploadBuktiAction(formData);
    if (res?.error) {
      showToast(res.error);
    } else {
      showToast("Bukti berhasil diupload!");
    }
    
    setIsUploading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6 justify-between relative">
      {/* Custom Toast */}
      {toastMsg && (
        <div className="absolute top-4 right-4 bg-[#0A2540] text-white px-4 py-2 rounded shadow-xl text-sm font-bold animate-pulse z-50">
          {toastMsg}
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-xl font-bold text-gray-900">{data.l.nama}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[data.r.status]}`}>
            {statusLabels[data.r.status]}
          </span>
        </div>
        <p className="text-gray-600 mb-1">Jadwal: <span className="font-bold text-gray-800">{data.r.tanggal} ({data.r.jamMulai} - {data.r.jamSelesai})</span></p>
        <p className="text-gray-600">Total Harga: <span className="font-bold text-[#0A2540] text-lg">Rp {Number(data.t?.jumlahBayar || data.r.totalHarga).toLocaleString("id-ID")}</span></p>
        
        {data.r.status === "pending_bayar" && data.t && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-bold text-yellow-800 mb-2">Transfer ke Rekening BCA: 1234567890 a/n SM Sport Center</p>
            <p className="text-sm text-yellow-700">Pastikan nominal sesuai hingga 3 digit terakhir. Sisa Waktu: <strong className="text-red-600">{timeLeft}</strong></p>
            
            <form onSubmit={handleUpload} className="mt-4 flex gap-2">
              <input type="file" name="foto" accept="image/*" required className="text-sm border border-yellow-300 bg-white rounded p-1.5 flex-1" />
              <button disabled={isUploading} type="submit" className="bg-[#0A2540] hover:bg-[#0066FF] text-white px-4 py-1.5 rounded text-sm font-medium transition disabled:opacity-50">
                {isUploading ? "Upload..." : "Kirim Bukti"}
              </button>
            </form>
            
            <button 
              onClick={() => batalkanReservasiAction(data.r.id)} 
              className="mt-4 text-xs text-red-500 hover:underline font-bold"
            >
              Batalkan Booking
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 justify-center min-w-[200px]">
        {data.r.status === "terkonfirmasi" && (
          <button onClick={handleDownloadInvoice} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-sm transition active:scale-95 text-center w-full">
            Unduh Bukti Reservasi
          </button>
        )}
      </div>
    </div>
  );
}
