import { auth, signOut } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import MobileMenu from "./MobileMenu";

export default async function Navbar() {
  const session = await auth();
  
  const signOutAction = async () => {
    "use server";
    await signOut();
  };

  return (
    <nav className="bg-[#0B1120] text-white px-8 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-[#1F2937]">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 overflow-hidden rounded-md shadow-lg bg-black border border-[#1F2937]">
          <Image 
            src="/logo.png" 
            alt="Logo SM Sport Center" 
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-xl font-bold tracking-wide hidden sm:block">SM SPORT CENTER</h1>
      </div>
      
      {/* Menu Desktop */}
      <div className="hidden md:flex gap-8 items-center text-sm font-semibold text-gray-300">
        <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
        <Link href="/reservasi" className="hover:text-white transition-colors">Reservasi Lapangan</Link>
        <Link href="/profil" className="hover:text-white transition-colors">Riwayat Booking</Link>
        
        {((session?.user as any)?.role === "superadmin" || (session?.user as any)?.role === "admin") && (
          <Link href="/admin" className="px-4 py-1.5 border border-yellow-600/50 text-yellow-500 rounded hover:bg-yellow-600/10 transition-colors">
            Admin Panel
          </Link>
        )}
      </div>

      <div className="hidden md:flex gap-4 items-center">
        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              {session.user?.name}
            </span>
            <div className="w-px h-5 bg-gray-700 mx-1"></div>
            <form action={signOutAction}>
              <button type="submit" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Keluar
              </button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="text-sm bg-[#2563EB] hover:bg-blue-600 text-white px-5 py-2 rounded transition-colors font-semibold">
            Masuk / Daftar
          </Link>
        )}
      </div>

      {/* Menu Mobile */}
      <MobileMenu session={session} signOutAction={signOutAction} />
    </nav>
  );
}
