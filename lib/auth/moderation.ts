import type { Role } from "@/lib/auth/roles";

export type Viewer = { id: string; role: Role } | null;

/**
 * Decide se o `viewer` pode apagar um conteúdo de `authorId`.
 * Regra = a mesma do RLS: autor OU teacher. RLS é a defesa final; isto só
 * controla a exibição do botão na UI.
 */
export function canDelete(viewer: Viewer, authorId: string): boolean {
  if (!viewer) return false;
  return viewer.id === authorId || viewer.role === "teacher";
}

/** True quando o viewer apaga conteúdo que NÃO é seu (ação de moderação). */
export function isModerating(viewer: Viewer, authorId: string): boolean {
  return !!viewer && viewer.id !== authorId && viewer.role === "teacher";
}
