import { api } from '@/core/api';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  mobile?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  user: AuthUser;
}

export const authService = {
  register: (data: RegisterInput) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: LoginInput) =>
    api.post<AuthResponse>('/auth/login', data),

  refresh: () =>
    api.post<RefreshResponse>('/auth/refresh'),

  logout: () =>
    api.post<{ message: string }>('/auth/logout'),

  getProfile: () =>
    api.get<AuthUser>('/auth/me'),
};
