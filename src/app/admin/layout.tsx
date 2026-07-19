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
    <div className="flex-1 bg-[#0B1120] text-gray-100 flex flex-col md:grid md:grid-cols-[256px_1fr]">
      {/* Sidebar */}
      <aside className="w-full bg-[#111827] text-white flex flex-col border-b md:border-b-0 md:border-r border-[#1F2937]">
        <div className="p-4 md:p-6 border-b border-[#1F2937] flex justify-between items-center md:items-start md:flex-col">
          <div>
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <p className="text-sm text-gray-400 mt-1 hidden md:block">{user.name}</p>
          </div>
          
          <div className="md:hidden">
            <form action={async () => {
              "use server";
              await signOut();
            }}>
              <button type="submit" className="px-3 py-1.5 rounded text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">
                Logout
              </button>
            </form>
          </div>
        </div>
        
        <nav className="flex-1 p-2 md:p-4 flex flex-row md:flex-col overflow-x-auto gap-2 md:space-y-2 md:gap-0 whitespace-nowrap hide-scrollbar">
          <Link href="/admin" className="block px-3 py-2 md:px-4 rounded text-sm md:text-base text-gray-300 hover:text-white hover:bg-[#1F2937] transition">Dashboard</Link>
          <Link href="/admin/verifikasi" className="block px-3 py-2 md:px-4 rounded text-sm md:text-base text-gray-300 hover:text-white hover:bg-[#1F2937] transition">Riwayat & Verifikasi</Link>
          <Link href="/admin/lapangan" className="block px-3 py-2 md:px-4 rounded text-sm md:text-base text-gray-300 hover:text-white hover:bg-[#1F2937] transition">Kelola Lapangan</Link>
          <Link href="/admin/laporan" className="block px-3 py-2 md:px-4 rounded text-sm md:text-base text-gray-300 hover:text-white hover:bg-[#1F2937] transition">Laporan Transaksi</Link>
        </nav>

        <div className="p-4 border-t border-[#1F2937] hidden md:block">
          <form action={async () => {
            "use server";
            await signOut();
          }}>
            <button type="submit" className="w-full text-left px-4 py-2 rounded text-red-400 hover:bg-red-500/10 transition">
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
