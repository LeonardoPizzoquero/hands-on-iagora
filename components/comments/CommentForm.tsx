"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createComment,
  type CommentFormState,
} from "@/app/posts/[id]/comments/actions";
import { COMMENT_MAX } from "@/lib/validation/comment";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="brutal-box w-fit bg-brand-yellow px-5 py-2.5 font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
    >
      {pending ? "Enviando…" : "Comentar"}
    </button>
  );
}

/** Form de novo comentário. Reseta o textarea ao enviar com sucesso. */
export function CommentForm({ postId }: { postId: string }) {
  const action = createComment.bind(null, postId);
  const [state, formAction] = useActionState<CommentFormState, FormData>(
    action,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <textarea
        name="content"
        required
        maxLength={COMMENT_MAX}
        rows={3}
        placeholder="Escreva um comentário…"
        className="brutal-box resize-y bg-paper px-4 py-3 outline-none focus:[box-shadow:var(--shadow-brutal-lg)]"
      />
      {state.error && (
        <p role="alert" className="text-sm font-bold text-brand-red">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
