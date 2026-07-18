"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] p-4 relative overflow-hidden">
      {/* Dekorasi Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full bg-[#111827]/80 backdrop-blur-md rounded-2xl shadow-2xl border border-[#1F2937] p-8 z-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-[#2563EB] to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Selamat Datang</h1>
          <p className="text-gray-400 mt-2">Masuk untuk melanjutkan ke SM Sport Center</p>
        </div>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              {state.error}
            </div>
          )}

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
              {isPending ? "Memproses..." : "Masuk"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          Belum punya akun? <Link href="/register" className="text-[#3B82F6] font-semibold hover:text-blue-400 hover:underline transition-colors">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
