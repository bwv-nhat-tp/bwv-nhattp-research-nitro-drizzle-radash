import {
  mysqlTable,
  varchar,
  date,
  smallint,
  int,
  bigint,
} from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';

const commonCols = {
  createdDate: date('created_date', { mode: 'string' }).default(sql`(CURRENT_DATE)`).notNull(),
  updatedDate: date('updated_date', { mode: 'string' }).default(sql`(CURRENT_DATE)`).notNull(),
  deletedDate: date('deleted_date', { mode: 'string' }),
};

export const customers = mysqlTable('customer', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  startedDate: date('started_date', { mode: 'string' }).notNull(),
  positionId: smallint('position_id').notNull(),
  ...commonCols,
});

export const orders = mysqlTable('order', {
  orderId: bigint('order_id', { mode: 'number' }).primaryKey().autoincrement(),
  itemName: varchar('item_name', { length: 15 }).notNull(),
  itemCode: varchar('item_code', { length: 7 }),
  itemQuantity: int('item_quantity').notNull(),
  customerId: bigint('customer_id', { mode: 'number' })
    .notNull()
    .references(() => customers.id, {
      onDelete: 'restrict',
      onUpdate: 'restrict',
    }),
  ...commonCols,
});

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
}));