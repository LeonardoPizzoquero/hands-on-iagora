/**
 * Roles da aplicação. RBAC será aplicado via RLS no banco (camada final
 * de defesa) e checagens em Server Actions. Schema/policies virão em
 * changes futuras — aqui só fixamos o contrato de tipos.
 */
export const ROLES = ["student", "teacher"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.includes(value as Role);
}
