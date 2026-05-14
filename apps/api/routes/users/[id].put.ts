import { defineEventHandler, getRouterParam, readBody, createError } from 'h3';
import { UserRepository } from '@intern/domain';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });
  }

  const body = await readBody(event);
  const user = await UserRepository.findById(id);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' });
  }
  if (body.email && body.email !== user.email) {
    const emailTaken = await UserRepository.findByEmail(body.email);
    if (emailTaken) {
      throw createError({ statusCode: 409, statusMessage: 'Conflict' });
    }
  }

  await UserRepository.update(id, body);

  return { data: { id } };
});