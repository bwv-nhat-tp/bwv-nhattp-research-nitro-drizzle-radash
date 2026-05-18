import { db } from '../db';
import { NewTransferLog, TransferLog, transferLogs, users } from '../schema';
import { eq, and, or, like, gte, lte, sql, desc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { sift } from 'radash';
import { BaseRepository } from './base.repository';
import { ERROR_MESSAGES, errors } from '@intern/factory';

interface LogFilters {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  userId?: number;
}

class TransferLogRepositoryClass extends BaseRepository<typeof transferLogs, TransferLog, NewTransferLog> {
  constructor() {
    super(transferLogs, transferLogs.id);
  }

  async findLogs(filters: LogFilters) {
    const { page, limit, startDate, endDate, search, userId } = filters;
    const offset = (page - 1) * limit;

    const sender = alias(users, 'sender');
    const receiver = alias(users, 'receiver');

    const conditions = [];

    if (userId) {
      conditions.push(or(eq(transferLogs.senderId, userId), eq(transferLogs.receiverId, userId)));
    }

    if (startDate) {
      conditions.push(gte(transferLogs.createdAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(transferLogs.createdAt, new Date(endDate)));
    }

    if (search) {
      const keyword = `%${search}%`;
      const searchConditions = [
        like(transferLogs.status, keyword),
        like(transferLogs.message, keyword),
        like(sender.name, keyword),
        like(sender.email, keyword),
        like(receiver.name, keyword),
        like(receiver.email, keyword),
      ];

      if (!isNaN(Number(search))) {
        searchConditions.push(eq(transferLogs.amount, search));
      }

      conditions.push(or(...searchConditions));
    }

    const compacted = sift(conditions);
    const whereClause = compacted.length > 0 ? and(...compacted) : undefined;

    const baseQuery = db.select({
      id: transferLogs.id,
      amount: transferLogs.amount,
      status: transferLogs.status,
      message: transferLogs.message,
      createdAt: transferLogs.createdAt,
      sender: {
        id: sender.id,
        name: sender.name,
        email: sender.email,
      },
      receiver: {
        id: receiver.id,
        name: receiver.name,
        email: receiver.email,
      }
    })
    .from(transferLogs)
    .leftJoin(sender, eq(transferLogs.senderId, sender.id))
    .leftJoin(receiver, eq(transferLogs.receiverId, receiver.id));

    const [countResult] = await db.select({ count: sql<number>`count(*)` })
      .from(transferLogs)
      .leftJoin(sender, eq(transferLogs.senderId, sender.id))
      .leftJoin(receiver, eq(transferLogs.receiverId, receiver.id))
      .where(whereClause);

    const total = Number(countResult?.count || 0);

    const data = await baseQuery
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(transferLogs.createdAt));

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async transferBalance(fromUserId: number, toUserId: number, amount: number) {
    return await db.transaction(async (tx) => {
      const [fromUser] = await tx.select().from(users).where(eq(users.id, fromUserId));
      const [toUser] = await tx.select().from(users).where(eq(users.id, toUserId));

      if (!fromUser || !toUser) {
        throw new errors.NotFound(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (Number(fromUser.balance) < amount) {
        throw new errors.Argument('amount', ERROR_MESSAGES.INSUFFICIENT_BALANCE);
      }

      await tx.update(users)
        .set({ balance: sql`${users.balance} - ${amount}` })
        .where(eq(users.id, fromUserId));
        
      await tx.update(users)
        .set({ balance: sql`${users.balance} + ${amount}` })
        .where(eq(users.id, toUserId));

      await tx.insert(transferLogs).values({
        senderId: fromUserId,
        receiverId: toUserId,
        amount: String(amount),
        status: 'success'
      });

      return true;
    });
  }
}

export const TransferLogRepository = new TransferLogRepositoryClass();
