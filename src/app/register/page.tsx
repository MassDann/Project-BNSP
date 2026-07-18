"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] p-4 relative overflow-hidden">
      {/* Dekorasi Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full bg-[#111827]/80 backdrop-blur-md rounded-2xl shadow-2xl border border-[#1F2937] p-8 z-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-[#2563EB] to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Daftar Akun Baru</h1>
          <p className="text-gray-400 mt-2">Mulai booking lapangan di SM Sport Center</p>
        </div>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Nama Lengkap</label>
            <input 
              name="nama" 
              type="text" 
              required 
              className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] text-white rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder-gray-500"
              placeholder="Nama Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] text-white rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder-gray-500"
              placeholder="email@contoh.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Nomor Telepon</label>
            <input 
              name="noTelepon" 
              type="tel" 
              required 
              className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] text-white rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder-gray-500"
              placeholder="0812xxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] text-white rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder-gray-500"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              {isPending ? "Memproses..." : "Daftar"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          Sudah punya akun? <Link href="/login" className="text-[#3B82F6] font-semibold hover:text-blue-400 hover:underline transition-colors">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
