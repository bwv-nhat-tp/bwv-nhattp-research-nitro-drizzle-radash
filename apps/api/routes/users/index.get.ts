import { defineEventHandler } from 'h3';
import { UserRepository } from '@intern/domain';

export default defineEventHandler(async (event) => {
  const allUsers = await UserRepository.findAll();
  
  return {
    success: true,
    data: allUsers
  };
});