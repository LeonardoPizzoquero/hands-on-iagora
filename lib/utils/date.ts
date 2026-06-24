/**
 * Formata timestamp ISO para data legível pt-BR no fuso de Brasília.
 * Fixamos `timeZone` porque a formatação roda em Server Component (servidor em
 * UTC na Vercel) — sem isso, as datas apareciam 3h à frente.
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
