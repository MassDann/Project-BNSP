import { db } from "../src/lib/db";
import { slotLock } from "../src/db/schema";

async function clear() {
  await db.delete(slotLock);
  console.log("Cleared slotLock");
  process.exit(0);
}

clear();
