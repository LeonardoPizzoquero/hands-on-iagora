"use client";

import { useFormStatus } from "react-dom";

/** Botão de submit com estado de loading via useFormStatus. */
export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="brutal-box bg-brand-blue px-6 py-3 text-lg font-bold text-paper transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Enviando…" : label}
    </button>
  );
}
