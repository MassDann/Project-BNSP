import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { pelanggan, admin } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }, // 'pelanggan' atau 'admin'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const email = credentials.email as string;
        const password = credentials.password as string;

        // Cek di tabel admin dulu
        const [adminUser] = await db.select().from(admin).where(eq(admin.email, email));
        if (adminUser) {
          const passwordsMatch = await bcrypt.compare(password, adminUser.passwordHash);
          if (passwordsMatch) {
            return { id: adminUser.id, name: adminUser.nama, email: adminUser.email, role: adminUser.role };
          }
          return null;
        }

        // Kalau ga ada di admin, cek di tabel pelanggan
        const [pelangganUser] = await db.select().from(pelanggan).where(eq(pelanggan.email, email));
        if (pelangganUser) {
          const passwordsMatch = await bcrypt.compare(password, pelangganUser.passwordHash);
          if (passwordsMatch) {
            return { id: pelangganUser.id, name: pelangganUser.nama, email: pelangganUser.email, role: "pelanggan" };
          }
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
});
