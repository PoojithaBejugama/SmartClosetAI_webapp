import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { hasSupabaseConfig, supabase } from "@/lib/supabaseClient";
import type { AuthUser, LoginRequest, SignupRequest } from "@/services/authService";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toAuthUser = (supabaseUser: User): AuthUser => {
  const metadata = supabaseUser.user_metadata || {};

  return {
    id: supabaseUser.id,
    name: metadata.name || metadata.full_name || supabaseUser.email || "SmartCloset User",
    email: supabaseUser.email || "",
    avatar_url: metadata.avatar_url,
    preferred_style: metadata.preferred_style,
    preferred_colors: metadata.preferred_colors,
  };
};

export function useAuthProvider() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const persistSession = useCallback((session: Session | null) => {
    if (!session?.user || !session.access_token) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setToken(null);
      setUser(null);
      return;
    }

    // Supabase owns password/session security; React stores the access token only so apiClient can call FastAPI.
    const authUser = toAuthUser(session.user);
    localStorage.setItem("auth_token", session.access_token);
    localStorage.setItem("auth_user", JSON.stringify(authUser));
    setToken(session.access_token);
    setUser(authUser);
  }, []);

  useEffect(() => {
    let isMounted = true;

    // On page load, mirror the current Supabase session into local React state.
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      persistSession(data.session);
      setIsLoading(false);
    });

    // This keeps localStorage/auth state synced after login, logout, token refresh, and OAuth redirects.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      persistSession(session);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [persistSession]);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      if (!hasSupabaseConfig) throw new Error("Supabase frontend env vars are missing");

      const { data: response, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      persistSession(response.session);
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const signup = useCallback(async (data: SignupRequest) => {
    setIsLoading(true);
    try {
      if (!hasSupabaseConfig) throw new Error("Supabase frontend env vars are missing");

      const { data: response, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name },
        },
      });
      if (error) throw error;
      persistSession(response.session);
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!hasSupabaseConfig) throw new Error("Supabase frontend env vars are missing");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    supabase.auth.signOut().catch(() => {});
  }, []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return { user, token, isAuthenticated, isLoading, login, signup, loginWithGoogle, logout, updateUser };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
