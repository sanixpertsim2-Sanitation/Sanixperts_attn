import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl =
  typeof supabaseUrl === "string" &&
  /^https?:\/\//i.test(supabaseUrl);

export const supabase =
  isValidUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseEnabled = Boolean(supabase);
