import { defineEventHandler, getRouterParam, createError } from 'h3';
import { UserRepository } from '@intern/domain';
import { ERROR_MESSAGES, HttpStatus } from '@intern/factory';
import { omit } from 'radash';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  
  if (isNaN(id)) {
    throw createError({ statusCode: HttpStatus.BAD_REQUEST, statusMessage: ERROR_MESSAGES.BAD_REQUEST });
  }

  const user = await UserRepository.findById(id);
  
  if (!user) {
    throw createError({ statusCode: HttpStatus.NOT_FOUND, statusMessage: ERROR_MESSAGES.USER_NOT_FOUND });
  }

  return omit(user, ['password']);
});
