import { db } from "@/lib/db";
import { lapangan } from "@/db/schema";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth, signOut } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  const lapangans = await db.select().from(lapangan).where(eq(lapangan.status, "aktif"));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Premium */}
      <header className="bg-[#0A2540] text-white px-8 py-5 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0066FF] rounded-lg flex items-center justify-center font-extrabold text-xl shadow-md">
            SM
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Sport Center</h1>
        </div>
        
        <div className="flex gap-4 items-center">
          {session ? (
            <div className="flex items-center gap-4 bg-[#113050] px-4 py-2 rounded-full border border-gray-700">
              <span className="text-sm font-medium">Halo, {session.user?.name}</span>
              {(session.user as any)?.role === "superadmin" || (session.user as any)?.role === "admin" ? (
                <Link href="/admin" className="text-xs bg-yellow-400 hover:bg-yellow-500 text-[#0A2540] font-bold px-3 py-1.5 rounded-full transition-all hover:scale-105 shadow-sm">
                  Admin Panel
                </Link>
              ) : (
                <Link href="/profil" className="text-xs bg-[#0066FF] hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-full transition-all hover:scale-105 shadow-sm">
                  Riwayat Booking
                </Link>
              )}
              <div className="w-px h-5 bg-gray-600 mx-1"></div>
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <button type="submit" className="text-xs text-red-400 hover:text-red-300 font-bold transition-colors">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="text-sm bg-[#0066FF] hover:bg-blue-600 px-6 py-2.5 rounded-full transition-all hover:scale-105 shadow-md font-bold tracking-wide">
              Masuk / Daftar
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-[#0A2540] text-white py-20 px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-5xl font-extrabold mb-6 leading-tight">Mulai Keringatmu<br />Tanpa Ribet.</h2>
          <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto">
            Booking lapangan futsal dan badminton dalam hitungan detik. Cek jadwal realtime, booking langsung, tanpa takut bentrok.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lapangans.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col group hover:-translate-y-2 transition-transform duration-300">
              <div className="h-56 bg-gray-100 w-full flex items-center justify-center text-gray-400 relative overflow-hidden">
                {l.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.fotoUrl} alt={l.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span className="font-medium">Belum Ada Foto</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur-sm text-[#0066FF] text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                    {l.jenis}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{l.nama}</h3>
                <p className="text-[#0A2540] font-black text-3xl mb-6">
                  Rp {Number(l.hargaPerJam).toLocaleString("id-ID")}
                  <span className="text-sm text-gray-500 font-medium tracking-normal"> / jam</span>
                </p>
                <div className="mt-auto">
                  <Link 
                    href={`/reservasi/${l.id}`}
                    className="block w-full text-center bg-[#0A2540] group-hover:bg-[#0066FF] text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Pilih Jadwal
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20 py-8 text-center text-gray-500 font-medium">
        <p>&copy; {new Date().getFullYear()} SM Sport Center. Dibuat untuk Sertifikasi LSP.</p>
      </footer>
    </div>
  );
}
