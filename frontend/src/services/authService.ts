import { apiClient } from "./apiClient";

// =============================================================================
// authService.ts — handles everything to do with who the user is
// =============================================================================
// This file is responsible for:
//   - Logging in and signing up
//   - Logging out
//   - Reading and updating the user's profile
//   - Changing or resetting passwords
//   - Deleting an account
//
// It uses apiClient (our shared network layer) so it doesn't have to worry
// about headers, tokens, or error handling — that's all done in apiClient.ts.
//
// The "interfaces" below define the exact shape of data we send and receive
// for each action. Think of them like contracts: "if you call login(), you
// must pass an email and password, and you'll get back a token and user."
// =============================================================================

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
  // Sends email + password to the backend. If correct, the server returns
  // a token (a long unique string that proves the user is authenticated) and
  // the user's basic profile data. The app then stores that token in localStorage.
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login", data),

  // Same as login, but creates a brand new account first.
  // Most backends return the same token + user object so the user is
  // immediately logged in after signing up — no extra step needed.
  signup: (data: SignupRequest) =>
    apiClient.post<AuthResponse>("/auth/signup", data),

  // Tells the server to invalidate the token so it can't be used again.
  // The local token cleanup (removing from localStorage) is typically
  // done in AuthContext after this call returns.
  logout: () =>
    apiClient.post<void>("/auth/logout"),

  // Fetches the latest version of the user's profile from the server.
  // Useful on app startup to make sure the UI shows up-to-date info.
  getProfile: () =>
    apiClient.get<AuthUser>("/auth/profile"),

  // Updates only the fields that were passed in — if you only pass "name",
  // only the name changes; email and preferences stay the same.
  // This uses PATCH (not PUT) because we're doing a partial update.
  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.patch<AuthUser>("/auth/profile", data),

  // The server checks that current_password is correct before allowing
  // the change — this prevents someone else from changing your password
  // if they temporarily have access to your logged-in session.
  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<void>("/auth/change-password", data),

  // Permanently deletes the account and all its data on the server.
  // There's no undo — the UI should confirm this with the user first.
  deleteAccount: () =>
    apiClient.delete<void>("/auth/account"),
};
