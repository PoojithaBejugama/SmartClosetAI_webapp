import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { authService, type AuthUser, type LoginRequest, type SignupRequest } from "@/services/authService";

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

// Check if we're in demo mode (no real API)
const isDemoMode = !import.meta.env.VITE_API_BASE_URL;

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
        persistAuth("demo-token", DEMO_USER);
        return;
      }
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
        persistAuth("demo-token", { ...DEMO_USER, name: data.name, email: data.email });
        return;
      }
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
