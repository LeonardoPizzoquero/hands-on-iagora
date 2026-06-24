import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client para uso no browser (Client Components).
 * Usa a publishable key — segura para o client; a proteção vem do RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
