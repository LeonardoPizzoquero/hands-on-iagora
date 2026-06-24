import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client para uso server-side (Server Components, Server Actions,
 * Route Handlers). Integrado aos cookies da request do Next.js.
 *
 * Usa apenas a publishable key — RLS é a camada final de defesa.
 * NUNCA usar SUPABASE_SERVICE_ROLE_KEY aqui sem necessidade explícita.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado de um Server Component — pode ser ignorado se houver
            // middleware fazendo refresh da sessão.
          }
        },
      },
    },
  );
}
