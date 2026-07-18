"use client";

import { useState } from "react";
import { editLapanganAction } from "@/actions/adminLapangan";

export default function EditLapanganModal({ lapangan }: { lapangan: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-sm text-yellow-600 font-bold hover:underline mr-4">Edit</button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1F2937] border border-[#374151] p-8 rounded-2xl w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Edit Lapangan</h2>
            <form action={async (formData) => {
              setIsSubmitting(true);
              await editLapanganAction(formData);
              setIsSubmitting(false);
              setIsOpen(false);
            }} className="space-y-4">
              <input type="hidden" name="id" value={lapangan.id} />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Nama Lapangan</label>
                  <input name="nama" type="text" defaultValue={lapangan.nama} required className="w-full bg-[#111827] border border-[#374151] text-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Jenis</label>
                  <select name="jenis" defaultValue={lapangan.jenis} className="w-full bg-[#111827] border border-[#374151] text-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 focus:outline-none transition-colors">
                    <option value="futsal">Futsal</option>
                    <option value="badminton">Badminton</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Harga per Jam</label>
                <input name="hargaPerJam" type="number" defaultValue={lapangan.hargaPerJam} required className="w-full bg-[#111827] border border-[#374151] text-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Foto Lapangan <span className="text-gray-500 font-normal">(Opsional)</span></label>
                <input name="foto" type="file" accept="image/*" className="w-full bg-[#111827] border border-[#374151] text-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 focus:outline-none transition-colors" />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" disabled={isSubmitting} onClick={() => setIsOpen(false)} className="px-5 py-2.5 bg-[#374151] hover:bg-[#4B5563] text-gray-200 font-bold rounded-xl transition disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50">
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
