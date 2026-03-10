import { apiClient } from "./apiClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  preferred_style?: string;
  preferred_colors?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  preferred_style?: string;
  preferred_colors?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login", data),

  signup: (data: SignupRequest) =>
    apiClient.post<AuthResponse>("/auth/signup", data),

  logout: () =>
    apiClient.post<void>("/auth/logout"),

  getProfile: () =>
    apiClient.get<AuthUser>("/auth/profile"),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.patch<AuthUser>("/auth/profile", data),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<void>("/auth/change-password", data),

  deleteAccount: () =>
    apiClient.delete<void>("/auth/account"),
};
