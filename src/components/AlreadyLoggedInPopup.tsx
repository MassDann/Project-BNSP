"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AlreadyLoggedInPopup({ role }: { role: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1F2937] border border-[#374151] p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center transform scale-100 transition-transform">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Kamu Sudah Login!</h3>
        <p className="text-gray-400 mb-6">
          Ngapain ke sini lagi? Kamu sudah masuk ke akunmu kok. Lanjut pesen lapangan aja kuy!
        </p>
        <button 
          onClick={handleClose}
          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
