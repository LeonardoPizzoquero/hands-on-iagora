"use server";

import { createClient } from "@/lib/supabase/server";

export type LikeResult = { liked: boolean; count: number; error?: string };

async function countPostLikes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string,
): Promise<number> {
  const { count } = await supabase
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);
  return count ?? 0;
}

async function countCommentLikes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  commentId: string,
): Promise<number> {
  const { count } = await supabase
    .from("comment_likes")
    .select("*", { count: "exact", head: true })
    .eq("comment_id", commentId);
  return count ?? 0;
}

/**
 * Toggle de curtida em post. Remove a própria curtida se existir; senão insere.
 * `user_id` é sempre o usuário atual. Auto-curtida é barrada pelo RLS.
 */
export async function togglePostLike(postId: string): Promise<LikeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { liked: false, count: 0, error: "Sessão expirada." };

  const { data: removed } = await supabase
    .from("post_likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .select();

  let liked: boolean;
  if (removed && removed.length > 0) {
    liked = false;
  } else {
    const { error } = await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: user.id });
    if (error) {
      return {
        liked: false,
        count: await countPostLikes(supabase, postId),
        error: "Não foi possível curtir este post.",
      };
    }
    liked = true;
  }

  return { liked, count: await countPostLikes(supabase, postId) };
}

/** Toggle de curtida em comentário. Mesma regra do post. */
export async function toggleCommentLike(
  commentId: string,
): Promise<LikeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { liked: false, count: 0, error: "Sessão expirada." };

  const { data: removed } = await supabase
    .from("comment_likes")
    .delete()
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .select();

  let liked: boolean;
  if (removed && removed.length > 0) {
    liked = false;
  } else {
    const { error } = await supabase
      .from("comment_likes")
      .insert({ comment_id: commentId, user_id: user.id });
    if (error) {
      return {
        liked: false,
        count: await countCommentLikes(supabase, commentId),
        error: "Não foi possível curtir este comentário.",
      };
    }
    liked = true;
  }

  return { liked, count: await countCommentLikes(supabase, commentId) };
}
