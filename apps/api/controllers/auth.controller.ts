import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { omit } from 'radash';
import { InferType } from 'yup';
import {
  backendChangePasswordSchema,
  backendLoginSchema,
  backendRegisterSchema,
  ERROR_MESSAGES,
  errors,
  SUCCESS_MESSAGES,
} from '@intern/factory';
import { UserRepository } from '@intern/domain';
import BaseController from './_base';

class AuthController extends BaseController {
  public register = this.define(async (event) => {
    const body = this.getValidatedBody<InferType<typeof backendRegisterSchema>>(event);

    await UserRepository.assertEmailAvailable(body.email);

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const [result] = await UserRepository.create({
      email: body.email,
      name: body.name,
      password: hashedPassword,
      nationality: body.nationality,
      balance: '1000',
    });

    return this.created(event, { id: result.id });
  });

  public login = this.define(async (event) => {
    const body = this.getValidatedBody<InferType<typeof backendLoginSchema>>(event);
    const user = await UserRepository.findByEmail(body.email);

    const passwordHash = user ? user.password : await bcrypt.hash('dummy_password', 10);
    const isMatch = await bcrypt.compare(body.password, passwordHash);

    if (!isMatch || !user) {
      throw new errors.Unauthorized();
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new errors.Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'],
      },
    );

    return this.ok(event, { rows: { user: omit(user, ['password']), accessToken } });
  });

  public me = this.define(async (event) => {
    const userContext = this.getAuthUser(event);
    const user = await UserRepository.findByIdOrFail(userContext.id);

    return this.ok(event, { rows: omit(user, ['password']) });
  });

  public logout = this.define(async (event) => {
    this.getAuthUser(event);

    return this.ok(event, { rows: { message: SUCCESS_MESSAGES.LOGOUT } });
  });

  public changePassword = this.define(async (event) => {
    const userContext = this.getAuthUser(event);
    const body = this.getValidatedBody<InferType<typeof backendChangePasswordSchema>>(event);
    const user = await UserRepository.findByIdOrFail(userContext.id);

    const isMatch = await bcrypt.compare(body.oldPassword, user.password);
    if (!isMatch) {
      throw new errors.Unauthorized(ERROR_MESSAGES.INVALID_PASSWORD);
    }

    const hashedNewPassword = await bcrypt.hash(body.newPassword, 10);

    await UserRepository.update(user.id, { password: hashedNewPassword });

    return this.ok(event, { rows: { message: SUCCESS_MESSAGES.CHANGE_PASSWORD } });
  });
}

export const authController = new AuthController();
