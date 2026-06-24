import { z } from "zod";

/**
 * Validação + sanitização de posts. TODA mutation (Server Action) DEVE validar
 * com este schema antes de tocar o banco. RLS é a camada final de defesa.
 *
 * `title`: obrigatório, máx 200. `content`: markdown obrigatório (sanitizado na
 * renderização — ver components/posts/MarkdownRenderer).
 */
export const TITLE_MAX = 200;
export const CONTENT_MAX = 50_000;

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Título obrigatório")
    .max(TITLE_MAX, `Título deve ter no máximo ${TITLE_MAX} caracteres`),
  content: z
    .string()
    .trim()
    .min(1, "Conteúdo obrigatório")
    .max(CONTENT_MAX, "Conteúdo muito longo"),
});

export type PostInput = z.infer<typeof postSchema>;
