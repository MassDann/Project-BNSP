process.env.POSTGRES_URL = "postgresql://neondb_owner:npg_wTUuHPi6oNy5@ep-royal-union-azriy7pi-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
import { db } from "./lib/db";
import { transaksi, reservasi, pelanggan, lapangan } from "./db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const transaksiId = "569b7ab0-5209-46b0-b6ca-fb6c6cb2dd51";
  
  const t = await db.select().from(transaksi).where(eq(transaksi.id, transaksiId));
  console.log("Transaksi:", t);

  if (t.length > 0) {
    const resId = t[0].reservasiId;
    const r = await db.select().from(reservasi).where(eq(reservasi.id, resId));
    console.log("Reservasi:", r);

    if (r.length > 0) {
      const pelId = r[0].pelangganId;
      const lapId = r[0].lapanganId;
      const p = await db.select().from(pelanggan).where(eq(pelanggan.id, pelId));
      const l = await db.select().from(lapangan).where(eq(lapangan.id, lapId));
      console.log("Pelanggan:", p);
      console.log("Lapangan:", l);
    }
  }

  process.exit(0);
}

main().catch(console.error);
