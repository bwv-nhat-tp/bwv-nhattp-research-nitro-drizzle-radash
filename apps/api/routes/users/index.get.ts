import { defineEventHandler } from 'h3';
import { UserRepository } from '@intern/domain';
import { omit } from 'radash';

export default defineEventHandler(async () => {
  const allUsers = await UserRepository.findAll();
  const safeUsers = allUsers.map(user => omit(user, ['password']));
  
  return safeUsers;
});
