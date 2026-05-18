import { 
  pgEnum,
  pgTable, 
  varchar, 
  timestamp, 
  decimal, 
  integer,
  serial,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { Nationality } from '@intern/factory';

const nationalityValues = Object.values(Nationality) as [string, ...string[]];
export const nationalityEnum = pgEnum('nationality', nationalityValues);
export const transferStatusEnum = pgEnum('transfer_status', ['success', 'pending', 'failed']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  balance: decimal('balance', { precision: 10, scale: 2 }).notNull().default('0'),
  nationality: nationalityEnum('nationality').default(Nationality.US),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transferLogs = pgTable('transfer_logs', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: integer('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: transferStatusEnum('status').notNull().default('success'),
  message: varchar('message', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
},
(table) => {
  return {
    senderIdx: index('sender_idx').on(table.senderId),
    receiverIdx: index('receiver_idx').on(table.receiverId),
    createdAtIdx: index('created_at_idx').on(table.createdAt),
  };
});

export const usersRelations = relations(users, ({ many }) => ({
  sentTransfers: many(transferLogs, { relationName: 'sentTransfers' }),
  receivedTransfers: many(transferLogs, { relationName: 'receivedTransfers' }),
}));

export const transferLogsRelations = relations(transferLogs, ({ one }) => ({
  sender: one(users, {
    fields: [transferLogs.senderId],
    references: [users.id],
    relationName: 'sentTransfers',
  }),
  receiver: one(users, {
    fields: [transferLogs.receiverId],
    references: [users.id],
    relationName: 'receivedTransfers',
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type TransferLog = typeof transferLogs.$inferSelect;
export type NewTransferLog = typeof transferLogs.$inferInsert;
