/** Limites de upload de imagem para conteúdo de posts. */
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const IMAGE_EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type ImageValidationResult =
  | { ok: true; ext: string }
  | { ok: false; error: string };

/** Valida tipo MIME e tamanho de um arquivo de imagem. */
export function validateImage(file: {
  type: string;
  size: number;
}): ImageValidationResult {
  if (!IMAGE_ALLOWED_TYPES.includes(file.type as (typeof IMAGE_ALLOWED_TYPES)[number])) {
    return {
      ok: false,
      error: "Tipo não permitido. Use JPG, PNG ou WEBP.",
    };
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return { ok: false, error: "Imagem muito grande. Máximo de 5MB." };
  }
  if (file.size === 0) {
    return { ok: false, error: "Arquivo vazio." };
  }
  return { ok: true, ext: IMAGE_EXT_BY_TYPE[file.type] };
}
