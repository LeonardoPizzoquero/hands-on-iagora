"use server";

import { decodeCursor, getFeed, type FeedPost } from "@/lib/posts/queries";
import { createClient } from "@/lib/supabase/server";

/** Carrega a próxima página do feed (modo recente) a partir de um cursor. */
export async function loadMoreFeed(
  cursor: string,
): Promise<{ posts: FeedPost[]; nextCursor: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return getFeed(decodeCursor(cursor), {
    sort: "recent",
    viewerId: user?.id ?? null,
  });
}
