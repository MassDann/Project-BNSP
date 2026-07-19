"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MobileMenu({ session, signOutAction }: { session: any, signOutAction: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Otomatis tutup menu kalau pindah halaman
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="cursor-pointer text-gray-300 hover:text-white p-2 focus:outline-none"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        )}
      </button>
      
      {/* Dropdown Menu Mobile */}
      {isOpen && (
        <div className="absolute top-[73px] left-0 w-full bg-[#0B1120] border-b border-[#1F2937] flex flex-col gap-6 shadow-xl z-50 p-6">
          <Link href="/" className="text-gray-300 hover:text-white font-semibold text-lg block w-full">Beranda</Link>
          <Link href="/reservasi" className="text-gray-300 hover:text-white font-semibold text-lg block w-full">Reservasi Lapangan</Link>
          <Link href="/profil" className="text-gray-300 hover:text-white font-semibold text-lg block w-full">Riwayat Booking</Link>
          
          {((session?.user as any)?.role === "superadmin" || (session?.user as any)?.role === "admin") && (
            <Link href="/admin" className="text-yellow-500 font-semibold text-lg block w-full">
              Admin Panel
            </Link>
          )}
          
          <div className="w-full h-px bg-[#1F2937] my-2"></div>
          
          {session ? (
            <div className="flex flex-col gap-4">
              <span className="text-sm font-medium text-gray-400">Halo, {session.user?.name}</span>
              <button onClick={() => signOutAction()} className="text-left text-red-400 hover:text-red-300 font-bold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Keluar
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-[#2563EB] text-white text-center py-3 rounded-xl font-bold w-full">
              Masuk / Daftar
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
