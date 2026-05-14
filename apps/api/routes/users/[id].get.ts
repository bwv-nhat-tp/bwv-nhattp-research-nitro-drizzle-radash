import { defineEventHandler, getRouterParam, createError } from 'h3';
import { UserRepository } from '@intern/domain';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });
  }

  const user = await UserRepository.findById(id);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' });
  }

  return { data: user };
});