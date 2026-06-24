export type LikeViewer = { id: string } | null;

/**
 * Pode curtir? Só autenticado E não-autor do conteúdo (sem auto-curtida).
 * Espelha o RLS; é só p/ a UI — o banco é a defesa final.
 */
export function canLike(viewer: LikeViewer, authorId: string): boolean {
  return !!viewer && viewer.id !== authorId;
}

/**
 * Reconciliação otimista: a partir do estado atual, calcula o estado "previsto"
 * ao clicar (toggle), antes da resposta do servidor.
 */
export function optimisticToggle(state: {
  liked: boolean;
  count: number;
}): { liked: boolean; count: number } {
  return state.liked
    ? { liked: false, count: Math.max(0, state.count - 1) }
    : { liked: true, count: state.count + 1 };
}
