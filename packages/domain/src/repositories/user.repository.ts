import { users } from '../schema';
import { BaseRepository } from './base.repository';

class UserRepositoryClass extends BaseRepository<typeof users> {
  constructor() {
    super(users);
  }
  async findByEmail(email: string) {
    return this.findOne(users.email, email);
  }
}
export const UserRepository = new UserRepositoryClass();