import axiosInstance from './config';
import type { MessageResponse } from './types';
import { APP_ROUTES } from '@intern/factory';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthData {
  user: {
    id: number;
    email: string;
    name: string;
  };
  accessToken: string;
}

export const authAPI = {
  login: (data: LoginDto) =>
    axiosInstance.post<AuthData>(APP_ROUTES.BACKEND.AUTH.LOGIN, data),

  register: (data: RegisterDto) =>
    axiosInstance.post<{ id: number }>(APP_ROUTES.BACKEND.AUTH.REGISTER, data),

  logout: () => axiosInstance.post<MessageResponse>(APP_ROUTES.BACKEND.AUTH.LOGOUT),

  getMe: () => axiosInstance.get<{ id: number; email: string; name: string }>(APP_ROUTES.BACKEND.AUTH.ME),
};
