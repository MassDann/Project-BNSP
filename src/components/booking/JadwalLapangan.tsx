"use client";

import { useState, useEffect } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { lockSlotAction, createReservasiAction } from "@/actions/reservasi";
import { useRouter } from "next/navigation";

export default function JadwalLapangan({ lapangan, listReservasi, listLock, userId }: any) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [lockedSlots, setLockedSlots] = useState<string[]>(listLock.map((l: any) => `${l.tanggal}_${l.jamMulai}`));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const jamOperasional = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

  const [modalState, setModalState] = useState<{isOpen: boolean, jam: string, textJam: string, lockId?: string}>({isOpen: false, jam: "", textJam: ""});

  useEffect(() => {
    // Subscribe ke Pusher untuk realtime update
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`lapangan-${lapangan.id}`);

    channel.bind("slot-locked", (data: any) => {
      setLockedSlots((prev) => [...prev, `${data.tanggal}_${data.jamMulai}`]);
    });

    return () => {
      pusher.unsubscribe(`lapangan-${lapangan.id}`);
    };
  }, [lapangan.id]);

  const handleBookingClick = async (jamMulai: string) => {
    if (!userId) {
      router.push("/login");
      return;
    }

    const [h, m] = jamMulai.split(":");
    const jamSelesai = `${String(Number(h) + 1).padStart(2, '0')}:${m}`;
    const textJam = `${jamMulai} - ${jamSelesai}`;

    setIsLoading(true);
    setErrorMsg("");

    const lockRes = await lockSlotAction(lapangan.id, selectedDate, `${jamMulai}:00`, `${jamSelesai}:00`);
    
    if (lockRes.error) {
      setErrorMsg(lockRes.error);
      setIsLoading(false);
      return;
    }

    // Tampilkan modal konfirmasi custom
    setModalState({ isOpen: true, jam: jamMulai, textJam, lockId: lockRes.lockId });
    setIsLoading(false);
  };

  const confirmBooking = async () => {
    if (!modalState.lockId) return;
    setIsLoading(true);
    
    const [h, m] = modalState.jam.split(":");
    const jamSelesai = `${String(Number(h) + 1).padStart(2, '0')}:${m}`;

    const res = await createReservasiAction(modalState.lockId, lapangan.id, selectedDate, `${modalState.jam}:00`, `${jamSelesai}:00`);
    if (res.success) {
      // Pindah tanpa alert, profil page sudah jelas ada pesan status
      router.push("/profil");
    } else {
      setErrorMsg(res.error || "Gagal membuat reservasi.");
      setModalState({ isOpen: false, jam: "", textJam: "" });
    }
    setIsLoading(false);
  };

  return (
    <>
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full transform scale-100 transition-transform">
            <h3 className="text-xl font-bold text-[#0A2540] mb-2">Konfirmasi Booking</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Kamu akan memesan <strong>{lapangan.nama}</strong> pada tanggal <strong>{selectedDate}</strong> jam <strong>{modalState.textJam}</strong>.
            </p>
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-gray-100 mb-6 text-center">
              <span className="block text-sm text-gray-500 mb-1">Total Harga</span>
              <span className="text-2xl font-black text-[#0066FF]">Rp {Number(lapangan.hargaPerJam).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex gap-3">
              <button 
                disabled={isLoading}
                onClick={() => setModalState({ isOpen: false, jam: "", textJam: "" })}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                disabled={isLoading}
                onClick={confirmBooking}
                className="flex-1 bg-[#0A2540] hover:bg-[#0066FF] text-white py-3 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Proses..." : "Ya, Pesan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl border border-gray-100 mt-[-40px] relative z-20 mx-4 md:mx-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0A2540] mb-2">Jadwal Tersedia</h2>
            <p className="text-gray-500 font-medium">Silakan pilih tanggal dan jam mainmu.</p>
          </div>
          <div className="relative">
            <input 
              type="date" 
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="appearance-none bg-gray-50 border-2 border-gray-200 text-[#0A2540] text-lg font-bold rounded-2xl px-6 py-4 pr-12 focus:border-[#0066FF] focus:ring-4 focus:ring-blue-50 outline-none transition-all cursor-pointer shadow-inner"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#0066FF]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-r-xl mb-8 font-bold text-sm shadow-sm flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {jamOperasional.map(jam => {
            const isBooked = listReservasi.some((r: any) => r.tanggal === selectedDate && r.jamMulai.startsWith(jam));
            const isLocked = lockedSlots.includes(`${selectedDate}_${jam}:00`);
            
            const [h, m] = jam.split(":");
            const jamSelesai = `${String(Number(h) + 1).padStart(2, '0')}:${m}`;
            const textJam = `${jam} - ${jamSelesai}`;

            if (isBooked) {
              return (
                <div key={jam} className="bg-gray-100/80 text-gray-400 p-5 rounded-2xl text-center border-2 border-gray-200/50 cursor-not-allowed flex flex-col items-center justify-center h-full">
                  <span className="font-extrabold text-lg mb-1">{textJam}</span>
                  <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mt-2">Penuh</span>
                </div>
              );
            }

            if (isLocked) {
              return (
                <div key={jam} className="bg-yellow-50 text-yellow-600 p-5 rounded-2xl text-center border-2 border-yellow-200 cursor-wait flex flex-col items-center justify-center relative overflow-hidden h-full shadow-inner">
                  <div className="absolute inset-0 bg-yellow-400/10 animate-pulse"></div>
                  <span className="font-extrabold text-lg mb-1 relative z-10">{textJam}</span>
                  <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mt-2 relative z-10">Dipesan</span>
                </div>
              );
            }

            return (
              <button 
                key={jam}
                onClick={() => handleBookingClick(jam)}
                disabled={isLoading}
                className="group bg-white hover:bg-[#0066FF] hover:text-white text-[#0A2540] p-5 rounded-2xl text-center border-2 border-[#E6F0FF] hover:border-[#0066FF] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center h-full"
              >
                <span className="font-extrabold text-lg mb-1">{textJam}</span>
                <span className="bg-[#E6F0FF] group-hover:bg-white/20 text-[#0066FF] group-hover:text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mt-2 transition-colors">Tersedia</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
