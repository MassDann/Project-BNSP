process.env.POSTGRES_URL="postgresql://neondb_owner:npg_wTUuHPi6oNy5@ep-royal-union-azriy7pi-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
import { db } from "./lib/db";
import { lapangan } from "./db/schema";
import { randomUUID } from "crypto";

import { eq, inArray } from "drizzle-orm";

async function main() {
  await db.delete(lapangan).where(
    inArray(lapangan.nama, ["Badminton 4", "Badminton 5"])
  );
  console.log("Kelebihan lapangan berhasil dihapus, sekarang totalnya pas 3.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
