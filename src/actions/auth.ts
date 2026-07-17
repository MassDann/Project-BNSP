"use server";

import { db } from "@/lib/db";
import { pelanggan } from "@/db/schema";
import { signIn } from "@/lib/auth";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export async function loginAction(state: any, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau password salah." };
    }
    throw error; // Biarkan error lain ditangani Next.js
  }
  redirect("/"); // Redirect ke home kalau sukses
}

export async function registerAction(state: any, formData: FormData) {
  const nama = formData.get("nama") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const noTelepon = formData.get("noTelepon") as string;

  if (!nama || !email || !password) {
    return { error: "Semua kolom wajib diisi." };
  }

  // Cek email duplikat
  const [existingUser] = await db.select().from(pelanggan).where(eq(pelanggan.email, email));
  if (existingUser) {
    return { error: "Email sudah terdaftar." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  await db.insert(pelanggan).values({
    nama,
    email,
    passwordHash,
    noTelepon,
  });
  
  redirect("/login");
}
