"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0A2540]">Daftar Akun Baru</h1>
          <p className="text-sm text-gray-500 mt-2">Mulai booking lapangan di SM Sport Center</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input 
              name="nama" 
              type="text" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
              placeholder="Nama Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
              placeholder="email@contoh.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
            <input 
              name="noTelepon" 
              type="tel" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
              placeholder="0812xxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-[#0A2540] hover:bg-[#0066FF] text-white font-medium py-2.5 rounded transition-colors disabled:opacity-70"
            >
              {isPending ? "Memproses..." : "Daftar"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Sudah punya akun? <Link href="/login" className="text-[#0066FF] hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
