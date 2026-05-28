// This file creates the browser Supabase client used by React for authentication.
// It uses only public frontend-safe values: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
// Never put SUPABASE_SERVICE_ROLE_KEY in this file or anywhere in the frontend.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://missing-supabase-url.supabase.co",
  supabaseAnonKey || "missing-supabase-anon-key"
);
