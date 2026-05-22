import { APP_ROUTES, type RegisterDto } from "@intern/factory";

import { Service } from "./_base";

export type { RegisterDto } from "@intern/factory";

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthData {
  user: {
    id: number;
    email: string;
    name: string;
  };
  accessToken: string;
}

export class AuthService extends Service {
  public login(data: LoginDto) {
    return this.fetch<AuthData>({
      url: APP_ROUTES.BACKEND.AUTH.LOGIN,
      method: "POST",
      data,
      expectedStatusCode: 200,
      noAuth: true,
    });
  }

  public register(data: RegisterDto) {
    return this.fetch<{ id: number }>({
      url: APP_ROUTES.BACKEND.AUTH.REGISTER,
      method: "POST",
      data,
      expectedStatusCode: 201,
      noAuth: true,
    });
  }

  public logout() {
    return this.fetch<{ message: string }>({
      url: APP_ROUTES.BACKEND.AUTH.LOGOUT,
      method: "POST",
      expectedStatusCode: 200,
    });
  }

  public getMe() {
    return this.fetch<AuthData["user"]>({
      url: APP_ROUTES.BACKEND.AUTH.ME,
      method: "GET",
      expectedStatusCode: 200,
    });
  }
}
