import { db } from "@/lib/db";
import { lapangan } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ReservasiIndexPage() {
  const lapangans = await db.select().from(lapangan).where(eq(lapangan.status, "aktif"));
  
  if (lapangans.length > 0) {
    redirect(`/reservasi/${lapangans[0].id}`);
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Belum Ada Lapangan</h1>
        <p className="text-gray-400">Mohon maaf, saat ini belum ada lapangan yang tersedia untuk direservasi.</p>
      </div>
    </div>
  );
}
