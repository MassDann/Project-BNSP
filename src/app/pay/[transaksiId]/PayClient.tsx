"use client";

import { useState, useEffect } from "react";
import { simulasiBayarAction } from "@/actions/simulasiBayar";

export default function PayClient({ data }: { data: any }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(data.r.status);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (status !== "pending_bayar") return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const batas = new Date(data.t.batasWaktuBayar).getTime();
      const distance = batas - now;

      if (distance < 0) {
        setTimeLeft("Kedaluwarsa");
        setStatus("kedaluwarsa");
        clearInterval(interval);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, data.t]);

  const handlePay = async () => {
    setIsProcessing(true);
    const res = await simulasiBayarAction(data.t.id);
    if (res?.error) {
      alert(res.error);
      if (res.error === "QRIS sudah kedaluwarsa.") {
        setStatus("kedaluwarsa");
      }
    } else {
      setStatus("terkonfirmasi");
    }
    setIsProcessing(false);
  };

  if (status === "terkonfirmasi") {
    return (
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Pembayaran Berhasil!</h2>
        <p className="text-gray-400 mb-6">Terima kasih, pembayaran simulasi Anda telah diterima.</p>
        <div className="bg-[#1F2937] p-4 rounded-xl mb-2 text-left">
          <p className="text-sm text-gray-400">Total Dibayar</p>
          <p className="text-xl font-bold text-white">Rp {Number(data.t.jumlahBayar).toLocaleString("id-ID")}</p>
        </div>
      </div>
    );
  }

  if (status === "kedaluwarsa" || status === "dibatalkan") {
    return (
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">QRIS Kedaluwarsa</h2>
        <p className="text-gray-400 mb-6">Waktu pembayaran telah habis. Silakan buat pesanan baru.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-[#1F2937] p-6 border-b border-[#374151]">
        <p className="text-sm text-gray-400 mb-1">Total Tagihan</p>
        <p className="text-4xl font-black text-white">Rp {Number(data.t.jumlahBayar).toLocaleString("id-ID")}</p>
        <div className="mt-4 inline-block bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30">
          Sisa Waktu: {timeLeft}
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4 mb-8">
          <div className="flex justify-between border-b border-[#374151] pb-3">
            <span className="text-gray-400">Nama Pelanggan</span>
            <span className="text-white font-medium">{data.p.nama}</span>
          </div>
          <div className="flex justify-between border-b border-[#374151] pb-3">
            <span className="text-gray-400">Lapangan</span>
            <span className="text-white font-medium">{data.l.nama} ({data.l.jenis})</span>
          </div>
          <div className="flex justify-between border-b border-[#374151] pb-3">
            <span className="text-gray-400">Jadwal</span>
            <span className="text-white font-medium text-right">{data.r.tanggal}<br/>{data.r.jamMulai} - {data.r.jamSelesai}</span>
          </div>
        </div>
        
        <button 
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? "Memproses..." : "Bayar Sekarang (Simulasi)"}
        </button>
        
        <p className="text-center text-xs text-gray-500 mt-4">
          Ini adalah halaman simulasi. Uang tidak akan terpotong dari rekening Anda.
        </p>
      </div>
    </div>
  );
}
