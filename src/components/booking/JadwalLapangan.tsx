"use client";

import { useState, useEffect } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { lockSlotAction, createReservasiAction, createOfflineReservasiAction } from "@/actions/reservasi";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JadwalLapangan({ lapangan, allLapangans, listReservasi, listLock, userId, userRole }: any) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [lockedSlots, setLockedSlots] = useState<string[]>(listLock.map((l: any) => `${l.tanggal}_${l.jamMulai}`));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [noHpPelanggan, setNoHpPelanggan] = useState("");
  const [metodePembayaran, setMetodePembayaran] = useState("tunai");

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

  const closeAndClearModal = () => {
    setModalState({ isOpen: false, jam: "", textJam: "" });
    setNamaPelanggan("");
    setNoHpPelanggan("");
    setMetodePembayaran("tunai");
  };

  const confirmBooking = async () => {
    if (!modalState.lockId) return;
    
    const isAdmin = userRole === "admin" || userRole === "superadmin";

    if (isAdmin && (!namaPelanggan || !noHpPelanggan)) {
      setErrorMsg("Nama dan No HP Pelanggan wajib diisi untuk booking offline.");
      closeAndClearModal();
      return;
    }

    setIsLoading(true);
    
    const [h, m] = modalState.jam.split(":");
    const jamSelesai = `${String(Number(h) + 1).padStart(2, '0')}:${m}`;

    let res;
    if (isAdmin) {
      res = await createOfflineReservasiAction(modalState.lockId, lapangan.id, selectedDate, `${modalState.jam}:00`, `${jamSelesai}:00`, namaPelanggan, noHpPelanggan, metodePembayaran);
    } else {
      res = await createReservasiAction(modalState.lockId, lapangan.id, selectedDate, `${modalState.jam}:00`, `${jamSelesai}:00`);
    }

    if (res.success) {
      if (isAdmin) {
        alert(`Booking Offline berhasil dikonfirmasi secara ${metodePembayaran}!`);
        router.push("/admin");
      } else {
        router.push("/profil");
      }
    } else {
      setErrorMsg(res.error || "Gagal membuat reservasi.");
      closeAndClearModal();
    }
    setIsLoading(false);
  };

  return (
    <>
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1F2937] border border-[#374151] p-8 rounded-2xl shadow-2xl max-w-sm w-full transform scale-100 transition-transform">
            <h3 className="text-xl font-bold text-white mb-2">Konfirmasi Booking</h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Kamu akan memesan <strong className="text-gray-200">{lapangan.nama}</strong> pada tanggal <strong className="text-gray-200">{selectedDate}</strong> jam <strong className="text-gray-200">{modalState.textJam}</strong>.
            </p>
            <div className="bg-[#111827] p-4 rounded-xl border border-[#374151] mb-6 text-center">
              <span className="block text-sm text-gray-500 mb-1">Total Harga</span>
              <span className="text-2xl font-black text-[#3B82F6]">Rp {Number(lapangan.hargaPerJam).toLocaleString("id-ID")}</span>
            </div>

            {(userRole === "admin" || userRole === "superadmin") && (
              <div className="mb-6 space-y-3 bg-[#111827] p-4 rounded-xl border border-yellow-600/30">
                <p className="text-xs text-yellow-500 font-bold mb-2 uppercase tracking-wide">Data Pelanggan Offline (Walk-in)</p>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Nama</label>
                  <input type="text" value={namaPelanggan} onChange={(e) => setNamaPelanggan(e.target.value)} className="w-full bg-[#1F2937] border border-[#374151] text-white px-3 py-2 rounded-lg outline-none focus:border-[#3B82F6]" placeholder="Contoh: Budi" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">No HP</label>
                  <input type="text" value={noHpPelanggan} onChange={(e) => setNoHpPelanggan(e.target.value)} className="w-full bg-[#1F2937] border border-[#374151] text-white px-3 py-2 rounded-lg outline-none focus:border-[#3B82F6]" placeholder="Contoh: 08123456789" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Metode Pembayaran</label>
                  <select 
                    value={metodePembayaran} 
                    onChange={(e) => setMetodePembayaran(e.target.value)} 
                    className="w-full bg-[#1F2937] border border-[#374151] text-white px-3 py-2 rounded-lg outline-none focus:border-[#3B82F6] cursor-pointer"
                  >
                    <option value="tunai">Tunai / Cash</option>
                    <option value="transfer_bank">Transfer Bank</option>
                    <option value="qris">QRIS / E-Wallet</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                disabled={isLoading}
                onClick={closeAndClearModal}
                className="flex-1 bg-[#374151] hover:bg-[#4B5563] text-gray-200 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                disabled={isLoading}
                onClick={confirmBooking}
                className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Proses..." : "Ya, Pesan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#1F2937] p-8 md:p-10 rounded-2xl shadow-2xl border border-[#374151]">
        <h2 className="text-2xl font-bold text-white mb-8">Cek Ketersediaan Lapangan</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-4 tracking-wider uppercase">Pilih Lapangan</h3>
            <div className="flex flex-wrap gap-3">
              {allLapangans?.map((l: any) => (
                <Link 
                  key={l.id} 
                  href={`/reservasi/${l.id}`}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${l.id === lapangan.id ? 'bg-[#2563EB] text-white border border-[#2563EB]' : 'bg-[#111827] text-gray-400 border border-[#374151] hover:text-white'}`}
                >
                  {l.nama}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-4 tracking-wider uppercase">Pilih Tanggal</h3>
            <div className="relative">
              <input 
                type="date" 
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ colorScheme: "dark" }}
                className="w-full bg-[#111827] border border-[#374151] text-gray-200 text-base font-semibold rounded-lg px-4 py-3.5 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#0B1120] border border-[#1F2937] p-6 rounded-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-1 block">{lapangan.jenis}</span>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{lapangan.nama}</h1>
            </div>
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-2 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              SM Sport Center
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              {lapangan.deskripsi || "Belum ada deskripsi lapangan."}
            </p>
          </div>
          <div className="mt-4 md:mt-0 md:text-right">
            <span className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-1 block">HARGA PER JAM</span>
            <p className="text-[#3B82F6] font-bold text-xl">
              Rp {Number(lapangan.hargaPerJam).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 font-semibold text-sm flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {jamOperasional.map(jam => {
            const isBooked = listReservasi.some((r: any) => r.tanggal === selectedDate && r.jamMulai.startsWith(jam));
            const isLocked = lockedSlots.includes(`${selectedDate}_${jam}:00`);
            
            const [h, m] = jam.split(":");
            const jamSelesai = `${String(Number(h) + 1).padStart(2, '0')}:${m}`;
            const textJam = `${jam} - ${jamSelesai}`;

            // Waktu realtime saat ini
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const currentHour = now.getHours();
            
            // Cek apakah jam operasional ini sudah terlewat di hari ini
            const jamHour = Number(h);
            const isPastTime = selectedDate === todayStr && jamHour <= currentHour;

            if (isPastTime) {
              return (
                <div key={jam} className="bg-[#111827] p-4 rounded-xl border border-[#1F2937] cursor-not-allowed flex flex-col justify-center opacity-50">
                  <span className="font-semibold text-gray-500 text-sm mb-1">{textJam}</span>
                  <span className="text-gray-500 text-xs font-bold">Terlewat</span>
                </div>
              );
            }

            if (isBooked || isLocked) {
              return (
                <div key={jam} className="bg-[#0B1120] p-4 rounded-xl border border-red-900/30 cursor-not-allowed flex flex-col justify-center">
                  <span className="font-semibold text-gray-400 text-sm mb-1">{textJam}</span>
                  <span className="text-red-500 text-xs font-bold">Dipesan</span>
                </div>
              );
            }

            return (
              <button 
                key={jam}
                onClick={() => handleBookingClick(jam)}
                disabled={isLoading}
                className="group bg-[#111827] hover:bg-[#2563EB] p-4 rounded-xl text-left border border-[#374151] hover:border-[#2563EB] transition-all duration-300 cursor-pointer flex flex-col justify-center"
              >
                <span className="font-semibold text-gray-200 group-hover:text-white text-sm mb-1">{textJam}</span>
                <span className="text-green-500 group-hover:text-white text-xs font-bold">Tersedia</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
