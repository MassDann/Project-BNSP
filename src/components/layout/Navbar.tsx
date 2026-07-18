import { auth, signOut } from "@/lib/auth";
import Link from "next/link";

export default async function Navbar() {
  const session = await auth();
  
  return (
    <nav className="bg-[#0B1120] text-white px-8 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-[#1F2937]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#2563EB] rounded-lg flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        </div>
        <h1 className="text-xl font-bold tracking-wide">SM SPORT CENTER</h1>
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
            <form action={async () => {
              "use server";
              await signOut();
            }}>
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

      {/* Menu Mobile (Hamburger) */}
      <div className="md:hidden flex items-center">
        <label htmlFor="mobile-menu-toggle" className="cursor-pointer text-gray-300 hover:text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </label>
        <input type="checkbox" id="mobile-menu-toggle" className="peer hidden" />
        
        {/* Dropdown Menu Mobile */}
        <div className="absolute top-[73px] left-0 w-full bg-[#0B1120] border-b border-[#1F2937] flex-col gap-6 shadow-xl z-50 p-6 hidden peer-checked:flex">
          <Link href="/" className="text-gray-300 hover:text-white font-semibold text-lg">Beranda</Link>
          <Link href="/reservasi" className="text-gray-300 hover:text-white font-semibold text-lg">Reservasi Lapangan</Link>
          <Link href="/profil" className="text-gray-300 hover:text-white font-semibold text-lg">Riwayat Booking</Link>
          
          {((session?.user as any)?.role === "superadmin" || (session?.user as any)?.role === "admin") && (
            <Link href="/admin" className="text-yellow-500 font-semibold text-lg">
              Admin Panel
            </Link>
          )}
          
          <div className="w-full h-px bg-[#1F2937] my-2"></div>
          
          {session ? (
            <div className="flex flex-col gap-4">
              <span className="text-sm font-medium text-gray-400">Halo, {session.user?.name}</span>
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <button type="submit" className="text-left text-red-400 hover:text-red-300 font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="bg-[#2563EB] text-white text-center py-3 rounded-xl font-bold w-full">
              Masuk / Daftar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
