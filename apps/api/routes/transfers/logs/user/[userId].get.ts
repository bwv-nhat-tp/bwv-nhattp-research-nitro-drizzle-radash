import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3';
import { requireAuth } from '~/utils/auth';
import { TransferLogRepository } from '@intern/domain';
import { ERROR_MESSAGES, HttpStatus } from '@intern/factory';

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const query = getQuery(event);
  const userId = Number(getRouterParam(event, 'userId'));

  if (isNaN(userId)) {
    throw createError({ statusCode: HttpStatus.BAD_REQUEST, statusMessage: ERROR_MESSAGES.BAD_REQUEST });
  }

  const filters = {
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 10,
    startDate: query.startDate ? String(query.startDate) : undefined,
    endDate: query.endDate ? String(query.endDate) : undefined,
    search: query.search ? String(query.search) : undefined,
    userId: userId,
  };

  return await TransferLogRepository.findLogs(filters);
});
