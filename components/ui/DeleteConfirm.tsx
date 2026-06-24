"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function ConfirmButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="brutal-box bg-brand-red px-3 py-1.5 text-sm font-bold text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-60"
    >
      {pending ? "Apagando…" : label}
    </button>
  );
}

/**
 * Botão de apagar com confirmação em dois passos (sem dialog nativo).
 * `action` é uma Server Action já vinculada ao id do recurso.
 */
export function DeleteConfirm({
  action,
  triggerLabel = "Apagar",
  confirmLabel = "Confirmar",
  question = "Tem certeza? Esta ação não pode ser desfeita.",
}: {
  action: () => Promise<void>;
  triggerLabel?: string;
  confirmLabel?: string;
  question?: string;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="brutal-box bg-paper px-3 py-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
      >
        {triggerLabel}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">{question}</span>
      <form action={action}>
        <ConfirmButton label={confirmLabel} />
      </form>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="brutal-box bg-paper px-3 py-1.5 text-sm font-medium transition-transform hover:-translate-y-0.5"
      >
        Cancelar
      </button>
    </div>
  );
}
