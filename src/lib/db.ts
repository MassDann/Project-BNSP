import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';

// Use non-null assertion since we expect the env var to be set
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
