"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { PostFormState } from "@/app/posts/actions";
import { ImageUploadButton } from "./ImageUploadButton";
import { TITLE_MAX } from "@/lib/validation/post";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="brutal-box bg-brand-yellow px-6 py-3 text-lg font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
    >
      {pending ? "Salvando…" : label}
    </button>
  );
}

/**
 * Editor de post (criar/editar). Markdown em textarea + upload de imagem.
 * `action` é a Server Action (create ou update já vinculada ao id).
 */
export function PostEditor({
  action,
  defaultTitle = "",
  defaultContent = "",
  submitLabel = "Publicar",
}: {
  action: (prev: PostFormState, fd: FormData) => Promise<PostFormState>;
  defaultTitle?: string;
  defaultContent?: string;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState<PostFormState, FormData>(action, {});
  const [content, setContent] = useState(defaultContent);
  const taRef = useRef<HTMLTextAreaElement>(null);

  function insertAtCursor(text: string) {
    const ta = taRef.current;
    if (!ta) {
      setContent((c) => c + text);
      return;
    }
    const start = ta.selectionStart ?? content.length;
    const end = ta.selectionEnd ?? content.length;
    setContent(content.slice(0, start) + text + content.slice(end));
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="font-bold">Título</span>
        <input
          name="title"
          defaultValue={defaultTitle}
          maxLength={TITLE_MAX}
          required
          placeholder="Sobre o que é seu post?"
          className="brutal-box bg-paper px-4 py-3 text-lg outline-none focus:[box-shadow:var(--shadow-brutal-lg)]"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-bold">Conteúdo (markdown)</span>
        <textarea
          ref={taRef}
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={14}
          placeholder="Escreva em markdown. Use **negrito**, listas, links e imagens."
          className="brutal-box resize-y bg-paper px-4 py-3 font-mono text-sm outline-none focus:[box-shadow:var(--shadow-brutal-lg)]"
        />
      </label>

      <ImageUploadButton onInsert={insertAtCursor} />

      {state.error && (
        <p
          role="alert"
          className="brutal-box bg-brand-red px-4 py-2 font-bold text-paper"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link
          href="/feed"
          className="brutal-box bg-paper px-6 py-3 font-medium transition-transform hover:-translate-y-0.5"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
