import { MySqlTable } from "drizzle-orm/mysql-core";
import { eq } from "drizzle-orm";
import { db } from "../db";

export class BaseRepository<T extends MySqlTable> {
  constructor(protected table: T) {}

  async findAll() {
    return db.select().from(this.table);
  }

  async findById(id: number) {
    const [result] = await db.select().from(this.table).where(eq((this.table as any).id, id));
    return result || null;
  }

  async findOne(column: any, value: any) {
    const [result] = await db.select().from(this.table).where(eq(column, value));
    return result || null;
  }

  async create(data: any) {
    return db.insert(this.table).values(data);
  }

  async update(id: number, data: any) {
    return db.update(this.table).set(data).where(eq((this.table as any).id, id));
  }

  async delete(id: number) {
    return db.delete(this.table).where(eq((this.table as any).id, id));
  }
}