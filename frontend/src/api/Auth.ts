import api from "./client";

// ============================================
// AUTH API
// ============================================

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: {
    bio: string;
    avatar: string | null;
  };
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
  created?: boolean;
}

/** Register a new user */
export const registerUser = (data: {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
}) => api.post<AuthResponse>("/users/register/", data);

/** Login with username OR email + password */
export const loginUser = (data: { identifier: string; password: string }) =>
  api.post<AuthResponse>("/users/login/", data);

/** Login with Google OAuth token (supports id_token/credential or access_token) */
export const googleLogin = (payload: {
  credential?: string;
  access_token?: string;
}) => api.post<AuthResponse>("/users/google/", payload);

/** Get current user data */
export const getMe = () => api.get<User>("/users/me/");

/** Logout – blacklists the refresh token server-side */
export const logoutUser = (refreshToken: string) =>
  api.post("/users/logout/", { refresh: refreshToken });

/** Verify email with a 6-digit OTP code */
export const verifyEmail = (data: { email: string; code: string }) =>
  api.post("/users/verify-email/", data);

/** Resend verification email */
export const resendVerificationEmail = (data: { email: string }) =>
  api.post("/users/resend-verification/", data);
