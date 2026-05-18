import { NewUser, User, users } from '../schema';
import { BaseRepository } from './base.repository';
import { ERROR_MESSAGES, errors } from '@intern/factory';

class UserRepositoryClass extends BaseRepository<typeof users, User, NewUser> {
  constructor() {
    super(users, users.id);
  }

  async findByEmail(email: string) {
    return this.findOne(users.email, email);
  }

  async findByIdOrFail(id: number) {
    const user = await this.findById(id);
    if (!user) {
      throw new errors.NotFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  async assertEmailAvailable(email: string) {
    const user = await this.findByEmail(email);
    if (user) {
      throw new errors.Argument('email', ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }
  }
}

export const UserRepository = new UserRepositoryClass();
