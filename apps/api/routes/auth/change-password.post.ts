import { defineEventHandler, createError } from 'h3';
import bcrypt from 'bcrypt';
import { UserRepository } from '@intern/domain';
import { requireAuth } from '../../utils/auth';
import { validateBody } from '../../utils/validate';
import { backendChangePasswordSchema, ERROR_MESSAGES, HttpStatus, SUCCESS_MESSAGES } from '@intern/factory';

export default defineEventHandler(async (event) => {
  const userContext = await requireAuth(event);
  const body = await validateBody(event, backendChangePasswordSchema);

  const user = await UserRepository.findById(userContext.id);
  if (!user) {
    throw createError({ statusCode: HttpStatus.NOT_FOUND, statusMessage: ERROR_MESSAGES.USER_NOT_FOUND });
  }

  const isMatch = await bcrypt.compare(body.oldPassword, user.password);
  if (!isMatch) {
    throw createError({ statusCode: HttpStatus.UNAUTHORIZED, statusMessage: ERROR_MESSAGES.INVALID_PASSWORD });
  }

  const hashedNewPassword = await bcrypt.hash(body.newPassword, 10);

  await UserRepository.update(user.id, { password: hashedNewPassword });

  return { message: SUCCESS_MESSAGES.CHANGE_PASSWORD };
});
