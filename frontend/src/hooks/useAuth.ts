import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { authService, type AuthUser, type LoginRequest, type SignupRequest } from "@/services/authService";

// TODO(BACKEND): Search for this tag to find every auth integration point.
// TODO(BACKEND): Backend integration checklist for this file:
// 1) Set VITE_API_BASE_URL in your frontend .env so demo mode turns off.
// 2) Keep login/signup calling authService.* and ensure backend returns { token, user }.
// 3) Optional hardening: on app load, call authService.getProfile() to verify a stored token.
// 4) Keep logout calling authService.logout() if your backend invalidates tokens.

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// TODO(BACKEND): Remove demo mode fallback after backend auth routes exist.
// The current backend has no /auth/* routes, so auth stays local/demo for now.
const isDemoMode = import.meta.env.VITE_AUTH_DEMO_MODE !== "false";

const DEMO_USER: AuthUser = {
  id: "demo-user",
  name: "Poojitha",
  email: "poojitha@example.com",
  preferred_style: "casual",
  preferred_colors: "neutral",
};

export function useAuthProvider() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("auth_token")
  );
  const [isLoading, setIsLoading] = useState(false);

  // TODO(BACKEND): Optional startup validation.
  // Right now, if localStorage has a token+user we trust it immediately.
  // With a backend, you can validate the token on startup via authService.getProfile()
  // and logout() if profile fetch fails with 401.

  const isAuthenticated = !!token && !!user;

  const persistAuth = useCallback((authToken: string, authUser: AuthUser) => {
    localStorage.setItem("auth_token", authToken);
    localStorage.setItem("auth_user", JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      if (isDemoMode) {
        // TODO(BACKEND): Delete this demo branch when backend auth is required.
        persistAuth("demo-token", DEMO_USER);
        return;
      }
      // TODO(BACKEND): Ensure POST /auth/login exists and returns { token, user }.
      const response = await authService.login(data);
      persistAuth(response.token, response.user);
    } finally {
      setIsLoading(false);
    }
  }, [persistAuth]);

  const signup = useCallback(async (data: SignupRequest) => {
    setIsLoading(true);
    try {
      if (isDemoMode) {
        // TODO(BACKEND): Delete this demo branch when backend auth is required.
        persistAuth("demo-token", { ...DEMO_USER, name: data.name, email: data.email });
        return;
      }
      // TODO(BACKEND): Ensure POST /auth/signup exists and returns { token, user }.
      const response = await authService.signup(data);
      persistAuth(response.token, response.user);
    } finally {
      setIsLoading(false);
    }
  }, [persistAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    if (!isDemoMode) {
      // TODO(BACKEND): Keep this call if your backend supports token invalidation.
      authService.logout().catch(() => {});
    }
  }, []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return { user, token, isAuthenticated, isLoading, login, signup, logout, updateUser };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
