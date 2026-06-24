import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/auth/roles";

export type Profile = {
  id: string;
  name: string;
  role: Role;
};

/**
 * Retorna o usuário autenticado + seu profile (server-side).
 * `name` faz fallback para o local-part do email caso o profile ainda não
 * tenha propagado. Retorna null se não houver sessão.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", user.id)
    .single();

  if (data) return data as Profile;

  return {
    id: user.id,
    name: user.email?.split("@")[0] ?? "Usuário",
    role: "student",
  };
}
