import {
  APP_ROUTES,
  type UpdateUserDto,
  type UserFromApi,
} from "@intern/factory";

import { Service } from "./_base";

export class UserService extends Service {
  public getAllUsers() {
    return this.fetch<UserFromApi[]>({
      url: APP_ROUTES.BACKEND.USER.BASE,
      method: "GET",
      expectedStatusCode: 200,
    });
  }

  public getUserById(id: number) {
    return this.fetch<UserFromApi>({
      url: APP_ROUTES.BACKEND.USER.GET_BY_ID(id),
      method: "GET",
      expectedStatusCode: 200,
    });
  }

  public updateUser(id: number, data: UpdateUserDto) {
    return this.fetch<{ message: string }>({
      url: APP_ROUTES.BACKEND.USER.GET_BY_ID(id),
      method: "PUT",
      data,
      expectedStatusCode: 200,
    });
  }

  public uploadAvatar(id: number, file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    return this.fetch<UserFromApi>({
      url: APP_ROUTES.BACKEND.USER.AVATAR(id),
      method: "POST",
      data: formData,
      expectedStatusCode: 200,
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  public deleteUser(id: number) {
    return this.fetch<{ message: string }>({
      url: APP_ROUTES.BACKEND.USER.GET_BY_ID(id),
      method: "DELETE",
      expectedStatusCode: 200,
    });
  }
}
