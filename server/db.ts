import "dotenv/config";
import pg from "pg"; // ESM-friendly import
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema"; // or "../shared/schema" if no path alias

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// NOTE: for node-postgres, drizzle takes (pool, { schema })
export const db = drizzle(pool, { schema });
export { pool };
