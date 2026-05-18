import { omit } from 'radash';
import { InferType } from 'yup';
import { SUCCESS_MESSAGES, updateUserSchema } from '@intern/factory';
import { UserRepository } from '@intern/domain';
import BaseController from './_base';

class UsersController extends BaseController {
  public index = this.define(async (event) => {
    const allUsers = await UserRepository.findAll();
    const safeUsers = allUsers.map((user) => omit(user, ['password']));

    return this.ok(event, { rows: safeUsers });
  });

  public get = this.define(async (event) => {
    const id = this.getNumberParam(event, 'id');
    const user = await UserRepository.findByIdOrFail(id);

    return this.ok(event, { rows: omit(user, ['password']) });
  });

  public update = this.define(async (event) => {
    const id = this.getNumberParam(event, 'id');
    const body = this.getValidatedBody<InferType<typeof updateUserSchema>>(event);
    const { balance, ...rest } = body;
    const updateData = {
      ...rest,
      ...(balance !== undefined ? { balance: String(balance) } : {}),
    };

    await UserRepository.findByIdOrFail(id);
    await UserRepository.update(id, updateData);

    return this.ok(event, { rows: { message: SUCCESS_MESSAGES.USER_UPDATE } });
  });

  public delete = this.define(async (event) => {
    const id = this.getNumberParam(event, 'id');

    await UserRepository.findByIdOrFail(id);
    await UserRepository.delete(id);

    return this.ok(event, { rows: { message: SUCCESS_MESSAGES.USER_DELETE } });
  });
}

export const usersController = new UsersController();
