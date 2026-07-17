import { requireAdmin } from "@/lib/requireAdmin";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin().catch(() => null);
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A2540] text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-sm text-gray-400 mt-1">{user.name}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/verifikasi" className="block px-4 py-2 rounded hover:bg-gray-700 transition">Verifikasi Pembayaran</Link>
          <Link href="/admin/lapangan" className="block px-4 py-2 rounded hover:bg-gray-700 transition">Kelola Lapangan</Link>
          <Link href="/admin/laporan" className="block px-4 py-2 rounded hover:bg-gray-700 transition">Laporan Transaksi</Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <form action={async () => {
            "use server";
            await signOut();
          }}>
            <button type="submit" className="w-full text-left px-4 py-2 rounded text-red-400 hover:bg-gray-700 transition">
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
