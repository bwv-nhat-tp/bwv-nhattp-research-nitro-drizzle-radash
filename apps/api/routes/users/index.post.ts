import { defineEventHandler, readBody, createError, setResponseStatus } from 'h3';
import { UserRepository } from '@intern/domain';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body.name || !body.email) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid field' });
  }

  const existingUser = await UserRepository.findByEmail(body.email);
  if (existingUser) {
    throw createError({ statusCode: 409, statusMessage: 'Conflict' });
  }

  const [result] = await UserRepository.create({
    name: body.name,
    email: body.email
  });
  
  setResponseStatus(event, 201);
  return { data: { id: result.insertId } };
});