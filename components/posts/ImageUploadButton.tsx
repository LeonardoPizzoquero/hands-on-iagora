"use client";

import { useRef, useState, useTransition } from "react";
import { uploadPostImage } from "@/app/posts/actions";
import { validateImage } from "@/lib/validation/image";

/**
 * Botão de upload de imagem. Valida no client (UX) e no server (segurança),
 * sobe via Server Action e devolve a markdown `![alt](signedUrl)` ao pai.
 */
export function ImageUploadButton({
  onInsert,
}: {
  onInsert: (markdown: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    const pre = validateImage({ type: file.type, size: file.size });
    if (!pre.ok) {
      setError(pre.error);
      return;
    }
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadPostImage({}, fd);
      if (res.error || !res.url) {
        setError(res.error ?? "Falha no upload.");
        return;
      }
      onInsert(`\n![imagem](${res.url})\n`);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="brutal-box w-fit bg-brand-blue px-3 py-1.5 text-sm font-bold text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "+ Imagem"}
      </button>
      {error && (
        <p role="alert" className="text-sm font-medium text-brand-red">
          {error}
        </p>
      )}
    </div>
  );
}
