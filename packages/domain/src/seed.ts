import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';
import { users } from './schema';
import { uid } from 'radash';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function runSeed() {
  const connectionString = process.env.DATABASE_URL || '';
  const connection = await mysql.createConnection(connectionString);
  const db = drizzle(connection);
  try {
    const mockUsers = Array.from({ length: 5 }).map((_, index) => ({
      name: `Test User ${index}`,
      email: `user_${uid(6)}@example.com`,
    }));

    await db.insert(users).values(mockUsers);
  } catch (_error) {
    //
  } finally {
    await connection.end();
    process.exit(0);
  }
}

runSeed();