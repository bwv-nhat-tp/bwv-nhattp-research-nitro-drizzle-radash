import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import path, { dirname } from 'node:path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function runMigrate() {
  const connectionString = process.env.DATABASE_URL || '';
  
  const connection = await mysql.createConnection(connectionString);
  const db = drizzle(connection);

  await migrate(db, { migrationsFolder: path.resolve(__dirname, '../drizzle') });

  await connection.end();
  process.exit(0);
}

runMigrate().catch(() => {
  process.exit(1);
});
