import { createClient } from "@/lib/supabase/server";

export type LikeInfo = { count: number; likedByMe: boolean };

/** Mapa target_id → {count, likedByMe} para um conjunto de ids (evita N+1). */
async function likeDataFor(
  table: "post_likes" | "comment_likes",
  column: "post_id" | "comment_id",
  ids: string[],
  userId: string | null,
): Promise<Map<string, LikeInfo>> {
  const map = new Map<string, LikeInfo>();
  ids.forEach((id) => map.set(id, { count: 0, likedByMe: false }));
  if (ids.length === 0) return map;

  const supabase = await createClient();
  const { data } = await supabase
    .from(table)
    .select(`${column}, user_id`)
    .in(column, ids);

  for (const row of (data ?? []) as Record<string, string>[]) {
    const id = row[column];
    const info = map.get(id);
    if (!info) continue;
    info.count += 1;
    if (userId && row.user_id === userId) info.likedByMe = true;
  }
  return map;
}

export function postLikeData(ids: string[], userId: string | null) {
  return likeDataFor("post_likes", "post_id", ids, userId);
}

export function commentLikeData(ids: string[], userId: string | null) {
  return likeDataFor("comment_likes", "comment_id", ids, userId);
}
