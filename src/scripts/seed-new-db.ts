import { db } from "../lib/db";
import { lapangan, admin } from "../db/schema";
import bcrypt from "bcrypt";

async function main() {
  await db.insert(lapangan).values([
    {
      nama: "Futsal 1",
      jenis: "futsal",
      hargaPerJam: "150000",
      deskripsi: "Futsal 1 menggunakan lantai interlock berstandar internasional yang empuk dan anti slip. Dilengkapi dengan jaring pelindung super tebal dan penerangan LED 800 lux. Cocok untuk turnamen resmi atau fun match intensitas tinggi.",
      status: "aktif"
    },
    {
      nama: "Futsal 2",
      jenis: "futsal",
      hargaPerJam: "120000",
      deskripsi: "Futsal V-Sport adalah lapangan futsal dengan lantai vinyl premium yang sangat ramah untuk persendian lutut. Area penonton luas dan sirkulasi udara sangat baik, memberikan kenyamanan maksimal saat bermain di siang hari.",
      status: "aktif"
    },
    {
      nama: "Badminton 1",
      jenis: "badminton",
      hargaPerJam: "75000",
      deskripsi: "Lapangan Badminton 1 (VIP) menggunakan karpet vinyl setebal 4.5mm bersertifikat BWF. Dilengkapi pencahayaan samping anti silau dan background gelap untuk visibilitas kok yang sempurna. Ideal untuk pemain pro.",
      status: "aktif"
    },
    {
      nama: "Badminton 2",
      jenis: "badminton",
      hargaPerJam: "50000",
      deskripsi: "Lapangan Badminton Reguler dengan permukaan lantai kayu parket berlapis karet anti slip. Memiliki jarak antar lapangan yang luas sehingga aman saat bermain agresif. Cocok untuk latihan santai bersama teman dan keluarga.",
      status: "aktif"
    }
  ]);

  const passwordHash = await bcrypt.hash("admin123", 10);
  await db.insert(admin).values({
    nama: "Super Admin",
    email: "admin@smsport.com",
    passwordHash,
    role: "superadmin"
  });

  console.log("Seeding complete!");
  process.exit(0);
}
main();
