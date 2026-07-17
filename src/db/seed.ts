import { db } from "../lib/db";
import { admin, lapangan } from "./schema";
import bcrypt from "bcrypt";

async function main() {
  console.log("Seeding data...");

  // Seed Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  await db.insert(admin).values({
    nama: "Admin Utama",
    email: "admin@smsport.com",
    passwordHash: adminPassword,
    role: "superadmin"
  }).onConflictDoNothing({ target: admin.email });

  // Seed Lapangan
  await db.insert(lapangan).values([
    { nama: "Futsal 1", jenis: "futsal", hargaPerJam: "150000" },
    { nama: "Futsal 2", jenis: "futsal", hargaPerJam: "150000" },
    { nama: "Badminton 1", jenis: "badminton", hargaPerJam: "50000" },
    { nama: "Badminton 2", jenis: "badminton", hargaPerJam: "50000" },
    { nama: "Badminton 3", jenis: "badminton", hargaPerJam: "50000" },
  ]);

  console.log("Seed complete!");
  process.exit(0);
}

main().catch(console.error);
