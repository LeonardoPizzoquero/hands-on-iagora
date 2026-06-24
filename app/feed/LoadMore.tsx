"use client";

import { useState, useTransition } from "react";
import { PostCard } from "@/components/posts/PostCard";
import type { FeedPost } from "@/lib/posts/queries";
import { loadMoreFeed } from "./actions";

/** Acumula páginas do feed via cursor, sem recarregar a lista inicial. */
export function LoadMore({
  initialCursor,
  viewerId,
}: {
  initialCursor: string;
  viewerId: string | null;
}) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [pending, startTransition] = useTransition();

  function more() {
    if (!cursor) return;
    startTransition(async () => {
      const res = await loadMoreFeed(cursor);
      setPosts((prev) => [...prev, ...res.posts]);
      setCursor(res.nextCursor);
    });
  }

  return (
    <>
      {posts.map((p) => (
        <PostCard key={p.id} post={p} viewerId={viewerId} />
      ))}
      {cursor && (
        <button
          type="button"
          onClick={more}
          disabled={pending}
          className="brutal-box mx-auto w-fit bg-paper px-6 py-3 font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Carregando…" : "Carregar mais"}
        </button>
      )}
    </>
  );
}
