import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';
const poolConnection = new pg.Pool({ connectionString });

export const db = drizzle(poolConnection, { schema });
