import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { hasSupabaseConfig, supabase } from "@/lib/supabaseClient";
import type { AuthUser, LoginRequest, SignupRequest } from "@/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Supabase's large User object into the small shape used by the UI.
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
  const [isLoading, setIsLoading] = useState(true);

  // Supabase persists and refreshes the session. React only mirrors the user
  // into state so components can render the correct authenticated UI.
  const applySession = useCallback((session: Session | null) => {
    setUser(session?.user ? toAuthUser(session.user) : null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Restore the existing Supabase session when the app first loads.
    void supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        applySession(data.session);
        setIsLoading(false);
      }
    });

    // Keep React synchronized after login, logout, token refresh, or OAuth.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [applySession]);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      if (!hasSupabaseConfig) throw new Error("Supabase frontend env vars are missing");

      const { data: response, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      applySession(response.session);
    } finally {
      setIsLoading(false);
    }
  }, [applySession]);

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
      applySession(response.session);
    } finally {
      setIsLoading(false);
    }
  }, [applySession]);

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

  const logout = useCallback(async () => {
    // Supabase clears its stored session; the listener above clears React state.
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  // This currently updates UI state only. A future profile endpoint should
  // persist these changes before Settings presents them as permanent.
  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateUser,
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
