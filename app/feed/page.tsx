import Link from "next/link";
import { getFeed, searchPosts, type FeedSort } from "@/lib/posts/queries";
import { parseSearchQuery } from "@/lib/posts/search";
import { getCurrentProfile } from "@/lib/auth/profile";
import { PostCard } from "@/components/posts/PostCard";
import { LoadMore } from "./LoadMore";
import { SearchBar } from "./SearchBar";

export const dynamic = "force-dynamic";

/**
 * Feed: posts mais recentes primeiro (cursor) por padrão; `?sort=top` ordena por
 * mais curtidos; `?q=` exibe resultados da busca full-text por relevância.
 */
export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; sort?: string }>;
}) {
  const { q, sort } = await searchParams;
  const query = parseSearchQuery(q);
  const searching = query.length > 0;
  const feedSort: FeedSort = sort === "top" ? "top" : "recent";

  const profile = await getCurrentProfile();
  const viewerId = profile?.id ?? null;

  const results = searching ? await searchPosts(query, viewerId) : [];
  const feed = searching
    ? null
    : await getFeed(null, { sort: feedSort, viewerId });

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-[760px] flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Feed</h1>
        <Link
          href="/posts/new"
          className="brutal-box bg-brand-yellow px-5 py-2.5 font-bold transition-transform hover:-translate-y-0.5"
        >
          + Novo post
        </Link>
      </div>

      <SearchBar initialQuery={query} />

      {!searching && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Ordenar feed">
          <Link
            href="/feed"
            aria-current={feedSort === "recent"}
            className={
              (feedSort === "recent" ? "bg-brand-blue text-paper " : "bg-paper ") +
              "brutal-box px-4 py-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
            }
          >
            Mais recentes
          </Link>
          <Link
            href="/feed?sort=top"
            aria-current={feedSort === "top"}
            className={
              (feedSort === "top" ? "bg-brand-blue text-paper " : "bg-paper ") +
              "brutal-box px-4 py-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
            }
          >
            Mais curtidos
          </Link>
        </div>
      )}

      {searching ? (
        results.length === 0 ? (
          <div className="brutal-box bg-paper p-10 text-center">
            <p className="text-lg font-medium">
              nenhum post encontrado para «{query}»
            </p>
            <p className="mt-2 opacity-70">Tente outros termos.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="font-mono text-sm opacity-70">
              {results.length} resultado(s) para «{query}»
            </p>
            {results.map((p) => (
              <PostCard key={p.id} post={p} viewerId={viewerId} />
            ))}
          </div>
        )
      ) : feed && feed.posts.length === 0 ? (
        <div className="brutal-box bg-paper p-10 text-center">
          <p className="text-lg font-medium">ainda não há posts</p>
          <p className="mt-2 opacity-70">Seja o primeiro a publicar.</p>
        </div>
      ) : (
        feed && (
          <div className="flex flex-col gap-4">
            {feed.posts.map((p) => (
              <PostCard key={p.id} post={p} viewerId={viewerId} />
            ))}
            {feed.nextCursor && (
              <LoadMore initialCursor={feed.nextCursor} viewerId={viewerId} />
            )}
          </div>
        )
      )}
    </main>
  );
}
