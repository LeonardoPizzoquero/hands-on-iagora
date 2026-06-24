import { createClient } from "@/lib/supabase/server";
import { postLikeData } from "@/lib/likes/queries";

export const FEED_PAGE_SIZE = 10;
export const TOP_FEED_SIZE = 20;

export type FeedSort = "recent" | "top";

export type FeedPost = {
  id: string;
  title: string;
  created_at: string;
  author_id: string;
  authorName: string;
  likeCount: number;
  likedByMe: boolean;
};

export type PostDetail = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  authorName: string;
  commentCount: number;
  likeCount: number;
  likedByMe: boolean;
};

export type Cursor = { created_at: string; id: string };

/** Codifica/decodifica cursor de paginação (created_at + id). */
export function encodeCursor(c: Cursor): string {
  return `${c.created_at}|${c.id}`;
}
export function decodeCursor(raw: string | undefined): Cursor | null {
  if (!raw) return null;
  const [created_at, id] = raw.split("|");
  if (!created_at || !id) return null;
  return { created_at, id };
}

type AuthorJoin = { name: string } | { name: string }[] | null;
function authorName(a: AuthorJoin): string {
  if (!a) return "Usuário";
  return Array.isArray(a) ? (a[0]?.name ?? "Usuário") : a.name;
}

/** Anexa likeCount + likedByMe a uma lista de posts (query em lote). */
async function attachPostLikes(
  posts: Omit<FeedPost, "likeCount" | "likedByMe">[],
  viewerId: string | null,
): Promise<FeedPost[]> {
  const likes = await postLikeData(
    posts.map((p) => p.id),
    viewerId,
  );
  return posts.map((p) => {
    const info = likes.get(p.id) ?? { count: 0, likedByMe: false };
    return { ...p, likeCount: info.count, likedByMe: info.likedByMe };
  });
}

/**
 * Feed. `sort="recent"` (default): cursor por created_at desc, id desc.
 * `sort="top"`: mais curtidos (RPC top_posts, top N, sem cursor). Inclui
 * likeCount + likedByMe.
 */
export async function getFeed(
  cursor: Cursor | null,
  opts: { sort?: FeedSort; viewerId?: string | null } = {},
): Promise<{ posts: FeedPost[]; nextCursor: string | null }> {
  const supabase = await createClient();
  const viewerId = opts.viewerId ?? null;

  if (opts.sort === "top") {
    const { data, error } = await supabase.rpc("top_posts", {
      p_limit: TOP_FEED_SIZE,
    });
    if (error || !data) return { posts: [], nextCursor: null };
    type TopRow = {
      id: string;
      title: string;
      created_at: string;
      author_id: string;
      author_name: string | null;
      like_count: number;
    };
    const likes = await postLikeData(
      (data as TopRow[]).map((r) => r.id),
      viewerId,
    );
    const posts: FeedPost[] = (data as TopRow[]).map((r) => ({
      id: r.id,
      title: r.title,
      created_at: r.created_at,
      author_id: r.author_id,
      authorName: r.author_name ?? "Usuário",
      likeCount: Number(r.like_count),
      likedByMe: likes.get(r.id)?.likedByMe ?? false,
    }));
    return { posts, nextCursor: null };
  }

  let query = supabase
    .from("posts")
    .select("id, title, created_at, author_id, author:profiles!posts_author_id_fkey(name)")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(FEED_PAGE_SIZE + 1);

  if (cursor) {
    // (created_at, id) < (cursor.created_at, cursor.id)
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error || !data) return { posts: [], nextCursor: null };

  const rows = data as unknown as (Omit<
    FeedPost,
    "authorName" | "likeCount" | "likedByMe"
  > & {
    author: AuthorJoin;
  })[];

  const hasMore = rows.length > FEED_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, FEED_PAGE_SIZE) : rows;

  const posts = await attachPostLikes(
    page.map((r) => ({
      id: r.id,
      title: r.title,
      created_at: r.created_at,
      author_id: r.author_id,
      authorName: authorName(r.author),
    })),
    viewerId,
  );

  const last = page[page.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeCursor({ created_at: last.created_at, id: last.id })
      : null;

  return { posts, nextCursor };
}

/** Detalhe de um post + nome do autor + contagem de comentários + curtidas. */
export async function getPost(
  id: string,
  viewerId: string | null = null,
): Promise<PostDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, content, created_at, updated_at, author_id, author:profiles!posts_author_id_fkey(name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const { count } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("post_id", id);

  const likes = await postLikeData([id], viewerId);
  const like = likes.get(id) ?? { count: 0, likedByMe: false };

  const row = data as unknown as Omit<
    PostDetail,
    "authorName" | "commentCount" | "likeCount" | "likedByMe"
  > & { author: AuthorJoin };

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author_id: row.author_id,
    authorName: authorName(row.author),
    commentCount: count ?? 0,
    likeCount: like.count,
    likedByMe: like.likedByMe,
  };
}

/**
 * Busca full-text de posts por título+conteúdo (RPC `search_posts`), ordenada
 * por relevância. O termo é sanitizado pelo `websearch_to_tsquery` no banco;
 * aqui só normalizamos (trim). Termo vazio → []. RLS continua valendo (RPC é
 * SECURITY INVOKER).
 */
export async function searchPosts(
  rawQuery: string,
  viewerId: string | null = null,
): Promise<FeedPost[]> {
  const q = rawQuery.trim();
  if (!q) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_posts", { q });
  if (error || !data) return [];

  type SearchRow = {
    id: string;
    title: string;
    created_at: string;
    author_id: string;
    author_name: string | null;
  };

  return attachPostLikes(
    (data as SearchRow[]).map((r) => ({
      id: r.id,
      title: r.title,
      created_at: r.created_at,
      author_id: r.author_id,
      authorName: r.author_name ?? "Usuário",
    })),
    viewerId,
  );
}
