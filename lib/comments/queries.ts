import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/auth/roles";
import { commentLikeData } from "@/lib/likes/queries";

export type CommentView = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  authorName: string;
  authorRole: Role;
  likeCount: number;
  likedByMe: boolean;
};

type AuthorRow = { name: string; role: Role };
type AuthorJoin = AuthorRow | AuthorRow[] | null;
function author(a: AuthorJoin): { name: string; role: Role } {
  const row = Array.isArray(a) ? a[0] : a;
  return { name: row?.name ?? "Usuário", role: row?.role ?? "student" };
}

/** Comentários de um post, ordenados do mais antigo para o mais novo (+ curtidas). */
export async function getComments(
  postId: string,
  viewerId: string | null = null,
): Promise<CommentView[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select(
      "id, content, created_at, author_id, author:profiles!comments_author_id_fkey(name, role)",
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const rows = data as unknown as (Omit<
    CommentView,
    "authorName" | "authorRole" | "likeCount" | "likedByMe"
  > & { author: AuthorJoin })[];

  const likes = await commentLikeData(
    rows.map((r) => r.id),
    viewerId,
  );

  return rows.map((r) => {
    const a = author(r.author);
    const like = likes.get(r.id) ?? { count: 0, likedByMe: false };
    return {
      id: r.id,
      content: r.content,
      created_at: r.created_at,
      author_id: r.author_id,
      authorName: a.name,
      authorRole: a.role,
      likeCount: like.count,
      likedByMe: like.likedByMe,
    };
  });
}
