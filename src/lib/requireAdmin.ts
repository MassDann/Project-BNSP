import { auth } from "./auth";

export async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const isAdmin = role === "admin" || role === "superadmin";
  
  if (!isAdmin) {
    throw new Error("Forbidden");
  }
  return session?.user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}
