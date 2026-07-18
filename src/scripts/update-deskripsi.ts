import { db } from "../lib/db";
import { lapangan } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const lapangans = await db.select().from(lapangan);
  for (const l of lapangans) {
    let deskripsi = "";
    if (l.nama.toLowerCase().includes("futsal 1")) {
      deskripsi = "Futsal 1 menggunakan lantai interlock berstandar internasional yang empuk dan anti slip. Dilengkapi dengan jaring pelindung super tebal dan penerangan LED 800 lux. Cocok untuk turnamen resmi atau fun match intensitas tinggi.";
    } else if (l.nama.toLowerCase().includes("futsal")) {
      deskripsi = "Futsal V-Sport adalah lapangan futsal dengan lantai vinyl premium yang sangat ramah untuk persendian lutut. Area penonton luas dan sirkulasi udara sangat baik, memberikan kenyamanan maksimal saat bermain di siang hari.";
    } else if (l.nama.toLowerCase().includes("badminton 1") || l.nama.toLowerCase().includes("badminton a")) {
      deskripsi = "Lapangan Badminton 1 (VIP) menggunakan karpet vinyl setebal 4.5mm bersertifikat BWF. Dilengkapi pencahayaan samping anti silau dan background gelap untuk visibilitas kok yang sempurna. Ideal untuk pemain pro.";
    } else {
      deskripsi = "Lapangan Badminton Reguler dengan permukaan lantai kayu parket berlapis karet anti slip. Memiliki jarak antar lapangan yang luas sehingga aman saat bermain agresif. Cocok untuk latihan santai bersama teman dan keluarga.";
    }
    await db.update(lapangan).set({ deskripsi }).where(eq(lapangan.id, l.id));
    console.log(`Updated ${l.nama} with deskripsi`);
  }
  console.log("Done");
  process.exit(0);
}
main();
