/**
 * Extrai e normaliza o termo de busca a partir do `searchParams` do feed.
 * Aceita string ou string[] (Next pode entregar array). Retorna "" quando
 * ausente/vazio. Limita o tamanho para evitar termos absurdos.
 */
export const SEARCH_MAX = 200;

export function parseSearchQuery(
  q: string | string[] | undefined,
): string {
  const raw = Array.isArray(q) ? q[0] : q;
  if (!raw) return "";
  return raw.trim().slice(0, SEARCH_MAX);
}

/** True quando há um termo de busca efetivo. */
export function hasSearch(q: string | string[] | undefined): boolean {
  return parseSearchQuery(q).length > 0;
}
