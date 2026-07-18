import { db } from "@/lib/db";
import { lapangan } from "@/db/schema";
import Link from "next/link";
import { eq } from "drizzle-orm";

export default async function HomePage() {
  const lapangans = await db.select().from(lapangan).where(eq(lapangan.status, "aktif"));

  return (
    <div className="min-h-screen bg-[#0B1120] font-sans selection:bg-blue-500/30">
      {/* Hero Section with Glowing Backgrounds */}
      <div className="relative overflow-hidden pt-24 pb-32 px-6 lg:px-8 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-70"></div>
          <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-70"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto mt-10">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wide mb-6 backdrop-blur-sm">
            Tersedia 24/7 untuk Anda
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight mb-8">
            Mulai Keringatmu <br className="hidden md:block"/> Tanpa Ribet.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Sistem reservasi lapangan olahraga paling modern. Cek jadwal <span className="text-white font-medium">realtime</span>, booking langsung, tanpa takut jadwal bentrok.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reservasi" className="px-8 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all hover:-translate-y-1">
              Booking Sekarang
            </Link>
            <a href="#lapangan" className="px-8 py-4 text-base font-bold text-gray-300 bg-[#1F2937] hover:bg-[#374151] border border-[#374151] rounded-2xl transition-all hover:-translate-y-1">
              Lihat Lapangan
            </a>
          </div>
        </div>
      </div>

      {/* Main Content (Fields) */}
      <main id="lapangan" className="max-w-7xl mx-auto px-6 pb-32 relative z-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Pilih Lapangan Favoritmu</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lapangans.map((l) => (
            <div key={l.id} className="bg-[#111827] rounded-3xl border border-[#1F2937] overflow-hidden flex flex-col group hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
              <div className="h-64 bg-[#1F2937] w-full flex items-center justify-center relative overflow-hidden">
                {l.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.fotoUrl} alt={l.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#374151] rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <span className="font-medium text-gray-500 text-sm">Belum Ada Foto</span>
                  </div>
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"></div>
                
                <div className="absolute top-5 right-5">
                  <span className="bg-black/50 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-widest border border-white/10">
                    {l.jenis}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col relative">
                <h3 className="text-2xl font-bold text-white mb-2">{l.nama}</h3>
                
                <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3">
                  {l.deskripsi || "Belum ada deskripsi lapangan."}
                </p>

                <div className="flex items-end gap-2 mb-8">
                  <p className="text-blue-500 font-black text-3xl">
                    Rp {Number(l.hargaPerJam).toLocaleString("id-ID")}
                  </p>
                  <span className="text-sm text-gray-500 font-medium tracking-normal mb-1">/ jam</span>
                </div>
                
                <div className="mt-auto">
                  <Link 
                    href={`/reservasi/${l.id}`}
                    className="flex items-center justify-center gap-2 w-full text-center bg-[#1F2937] group-hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all duration-300"
                  >
                    <span>Cek Jadwal</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}
