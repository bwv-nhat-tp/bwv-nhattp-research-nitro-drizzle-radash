import { AnyPgColumn, AnyPgTable } from "drizzle-orm/pg-core";
import { eq, SQL } from "drizzle-orm";
import { db } from "../db";

type TableWithId = AnyPgTable & { id: AnyPgColumn };

export class BaseRepository<
  TTable extends TableWithId,
  TSelect,
  TInsert extends Record<string, unknown>,
> {
  constructor(
    protected table: TTable,
    private idColumn: TTable['id'],
  ) {}

  async findAll(): Promise<TSelect[]> {
    return db.select()
      .from(this.table as never)
      .then((rows) => rows as unknown as TSelect[]);
  }

  async findById(id: number): Promise<TSelect | null> {
    const [result] = await db.select()
      .from(this.table as never)
      .where(eq(this.idColumn, id));

    return (result as TSelect | undefined) || null;
  }

  async findOne<TValue>(column: AnyPgColumn, value: TValue | SQL): Promise<TSelect | null> {
    const [result] = await db.select()
      .from(this.table as never)
      .where(eq(column, value));

    return (result as TSelect | undefined) || null;
  }

  async create(data: TInsert): Promise<TSelect[]> {
    return db.insert(this.table)
      .values(data)
      .returning()
      .then((rows) => rows as unknown as TSelect[]);
  }

  async update(id: number, data: Partial<TInsert>) {
    return db.update(this.table)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(this.idColumn, id));
  }

  async delete(id: number) {
    return db.delete(this.table).where(eq(this.idColumn, id));
  }
}
