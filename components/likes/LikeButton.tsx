"use client";

import { useState, useTransition } from "react";
import { togglePostLike, toggleCommentLike } from "@/lib/likes/actions";
import { optimisticToggle } from "@/lib/likes/can-like";

/**
 * Botão de curtir com atualização otimista e estado de loading. Reconciliado
 * com a contagem real retornada pela Server Action. Quando `canLike` é false
 * (autor ou não autenticado), exibe só a contagem (sem ação).
 */
export function LikeButton({
  target,
  id,
  initialCount,
  initialLiked,
  canLike,
}: {
  target: "post" | "comment";
  id: string;
  initialCount: number;
  initialLiked: boolean;
  canLike: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();

  if (!canLike) {
    return (
      <span className="brutal-box bg-paper px-3 py-1.5 text-sm font-bold">
        ▲ {count}
      </span>
    );
  }

  function onClick() {
    // Otimista.
    const next = optimisticToggle({ liked, count });
    setLiked(next.liked);
    setCount(next.count);

    startTransition(async () => {
      const res =
        target === "post"
          ? await togglePostLike(id)
          : await toggleCommentLike(id);
      // Reconcilia com o servidor (verdade final).
      setLiked(res.liked);
      setCount(res.count);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? "Descurtir" : "Curtir"}
      className={
        (liked
          ? "bg-brand-red text-paper "
          : "bg-paper ") +
        "brutal-box px-3 py-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      }
    >
      ▲ {count}
    </button>
  );
}
