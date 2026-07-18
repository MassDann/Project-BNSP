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
    "pending_bayar": "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30",
    "menunggu_verifikasi": "bg-blue-500/10 text-blue-500 border border-blue-500/30",
    "terkonfirmasi": "bg-green-500/10 text-green-500 border border-green-500/30",
    "dibatalkan": "bg-red-500/10 text-red-500 border border-red-500/30",
    "kedaluwarsa": "bg-gray-500/10 text-gray-400 border border-gray-600/30"
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
    <div className="bg-[#111827] rounded-2xl shadow-lg border border-[#1F2937] p-6 flex flex-col md:flex-row gap-6 justify-between relative hover:border-[#374151] transition-colors">
      {/* Custom Toast */}
      {toastMsg && (
        <div className="absolute top-4 right-4 bg-[#2563EB] text-white px-4 py-2 rounded-lg shadow-xl text-sm font-bold animate-pulse z-50">
          {toastMsg}
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-xl font-bold text-white">{data.l.nama}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[data.r.status]}`}>
            {statusLabels[data.r.status]}
          </span>
        </div>
        <p className="text-gray-400 mb-1">Jadwal: <span className="font-bold text-gray-200">{data.r.tanggal} ({data.r.jamMulai} - {data.r.jamSelesai})</span></p>
        <p className="text-gray-400">Total Harga: <span className="font-black text-[#3B82F6] text-lg">Rp {Number(data.t?.jumlahBayar || data.r.totalHarga).toLocaleString("id-ID")}</span></p>
        
        {data.r.status === "pending_bayar" && data.t && (
          <div className="mt-5 p-5 bg-[#1F2937] border border-yellow-600/30 rounded-xl flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Dummy QR Code */}
            <div className="flex-shrink-0 bg-white p-3 rounded-2xl shadow-lg border-4 border-gray-100 flex flex-col items-center">
              <div className="mb-2">
                <span className="text-xs font-black text-gray-800 tracking-wider">QRIS DINAMIS</span>
              </div>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ID-PESANAN-${data.r.id}-TOTAL-Rp${data.t.jumlahBayar}`} 
                alt="QRIS Dinamis" 
                className="w-[120px] h-[120px] object-contain"
              />
              <p className="text-center text-[10px] font-bold text-gray-500 mt-2 uppercase">SM Sport Center</p>
              <p className="text-center text-[8px] text-gray-400 mt-1 break-all px-2 max-w-[140px]">ID: {data.r.id}</p>
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              <p className="font-bold text-yellow-500 mb-2">Scan QRIS atau Transfer Rekening</p>
              <p className="text-sm text-gray-400 mb-1">BCA: <strong className="text-gray-200">1234567890</strong> a/n SM Sport Center</p>
              <p className="text-sm text-gray-400">Pastikan nominal bayar pas. Sisa Waktu: <strong className="text-red-500 text-base ml-1">{timeLeft}</strong></p>
              
              <form onSubmit={handleUpload} className="mt-5 flex flex-col sm:flex-row gap-3">
                <input type="file" name="foto" accept="image/*" required className="text-sm text-gray-300 border border-[#374151] bg-[#111827] rounded-lg p-2 flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 cursor-pointer" />
                <button disabled={isUploading} type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                  {isUploading ? "Upload..." : "Kirim Bukti"}
                </button>
              </form>
              
              <button 
                onClick={() => batalkanReservasiAction(data.r.id)} 
                className="mt-5 text-xs text-red-400 hover:text-red-300 hover:underline font-bold transition-colors inline-block"
              >
                Batalkan Booking
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 justify-center min-w-[200px]">
        {data.r.status === "terkonfirmasi" && (
          <button onClick={handleDownloadInvoice} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5 text-center w-full">
            Unduh Bukti Reservasi
          </button>
        )}
      </div>
    </div>
  );
}
