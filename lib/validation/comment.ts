import { z } from "zod";

/**
 * Validação de comentários. Texto plano (SEM markdown). Sanitização de exibição
 * é feita renderizando como texto escapado (sem dangerouslySetInnerHTML).
 */
export const COMMENT_MAX = 1000;

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comentário obrigatório")
    .max(COMMENT_MAX, `Comentário deve ter no máximo ${COMMENT_MAX} caracteres`),
});

export type CommentInput = z.infer<typeof commentSchema>;
