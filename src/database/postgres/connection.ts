import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.js';

let pool: any = null;
let pgDb: any = null;

export const getPostgresDB = () => {
  if (pgDb) return pgDb;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    if (process.env.NODE_ENV === 'production' && process.env.DB_DRIVER === 'postgres') {
      throw new Error("FATAL: DATABASE_URL is missing in production environment");
    }
    // Return a dummy/mock if not strict to prevent crashing during build or unrelated tests
    return null;
  }

  pool = new Pool({
    connectionString: databaseUrl,
  });

  pgDb = drizzle(pool, { schema });
  return pgDb;
};

export const closePostgresDB = async () => {
  if (pool) {
    await pool.end();
  }
};
