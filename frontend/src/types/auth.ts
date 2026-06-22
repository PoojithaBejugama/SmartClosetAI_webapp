// Small app-facing auth types.
// Supabase owns the full User and Session objects; the UI only needs these fields.
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  preferred_style?: string;
  preferred_colors?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}
