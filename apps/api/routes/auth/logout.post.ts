import { defineEventHandler } from 'h3';
import { requireAuth } from '../../utils/auth';
import { SUCCESS_MESSAGES } from '@intern/factory';

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  return { message: SUCCESS_MESSAGES.LOGOUT };
});
