import { 
  mysqlTable, 
  varchar, 
  timestamp, 
  decimal, 
  mysqlEnum, 
  int,
  index
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { Nationality } from '@intern/factory';

const nationalityValues = Object.values(Nationality) as [string, ...string[]];

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  balance: decimal('balance', { precision: 10, scale: 2 }).notNull().default('0'),
  nationality: mysqlEnum('nationality', nationalityValues).default(Nationality.US),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const transferLogs = mysqlTable('transfer_logs', {
  id: int('id').autoincrement().primaryKey(),
  senderId: int('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: int('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['success', 'pending', 'failed']).notNull().default('success'),
  message: varchar('message', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
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
