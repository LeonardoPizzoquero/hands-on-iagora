import { z } from "zod";

/**
 * Schema-exemplo de validação. TODA mutation (Server Action) DEVE validar e
 * sanitizar o input com Zod antes de tocar o banco. RLS continua sendo a
 * camada final de defesa.
 */
export const createPostSchema = z.object({
  title: z.string().trim().min(3, "Título muito curto").max(140),
  body: z.string().trim().min(1, "Conteúdo obrigatório").max(10_000),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
