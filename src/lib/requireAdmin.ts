import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const isAdmin = role === "admin" || role === "superadmin";
  
  if (!isAdmin) {
    redirect("/"); // Arahkan ke beranda jika bukan admin
  }
  return session?.user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login"); // Arahkan ke halaman login jika belum autentikasi
  }
  return session.user;
}
