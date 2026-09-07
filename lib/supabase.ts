import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

if (typeof window !== "undefined" && supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase URL/Anon Key missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
  );
}

const stub: Pick<SupabaseClient, "auth"> = {
  auth: {
    signInWithPassword: async () => ({
      data: { session: null, user: null },
      error: { message: "Supabase not configured" } as any,
    }),
    signUp: async () => ({
      data: { session: null, user: null },
      error: { message: "Supabase not configured" } as any,
    }),
    signOut: async () => ({ error: null as any }),
  } as any,
};

export const supabase = (client ?? (stub as unknown as SupabaseClient));
