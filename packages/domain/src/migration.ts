import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function runMigrate() {
  const connectionString = process.env.DATABASE_URL || '';
  
  const connection = await mysql.createConnection(connectionString);
  const db = drizzle(connection);

  await migrate(db, { migrationsFolder: './drizzle' });

  await connection.end();
  process.exit(0);
}

runMigrate().catch((err) => {
  process.exit(1);
});