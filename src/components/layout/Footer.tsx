import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0B1120] border-t border-[#1F2937] py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white flex items-center gap-2 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">SM</span> 
            SPORT
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Fasilitas olahraga premium yang siap mendukung setiap tendangan dan smes terbaik Anda. Pesan lapangan kapan saja, di mana saja dengan mudah.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Akses Cepat</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-blue-500 transition-colors">Beranda</Link></li>
            <li><Link href="/#lapangan" className="hover:text-blue-500 transition-colors">Lapangan Futsal</Link></li>
            <li><Link href="/#lapangan" className="hover:text-blue-500 transition-colors">Lapangan Badminton</Link></li>
            <li><Link href="/login" className="hover:text-blue-500 transition-colors">Login / Daftar</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Hubungi Kami</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <a href="https://wa.me/62895332793777" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-400 transition-colors group">
                <svg className="w-4 h-4 text-green-500 group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                0895-3327-93777
              </a>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              support@smsport.com
            </li>
            <li className="flex items-start gap-2 mt-2">
              <svg className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Jl. Merdeka No. 45, Jakarta Selatan
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-[#1F2937] text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} SM Sport Center. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
