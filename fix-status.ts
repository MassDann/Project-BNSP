import { db } from "./src/lib/db";
import { transaksi } from "./src/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Fixing status...");
  await db.update(transaksi)
    .set({ statusVerifikasi: "disetujui" })
    .where(eq(transaksi.statusVerifikasi, "terkonfirmasi"));
  console.log("Done!");
}

main().catch(console.error);
