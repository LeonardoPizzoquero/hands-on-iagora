"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { commentSchema } from "@/lib/validation/comment";

export type CommentFormState = { error?: string; ok?: boolean };

/** Cria comentário. author_id = usuário atual (server-side). */
export async function createComment(
  postId: string,
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const parsed = commentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Comentário inválido" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { error } = await supabase
    .from("comments")
    .insert({ content: parsed.data.content, post_id: postId, author_id: user.id });

  if (error) return { error: "Não foi possível comentar. Tente novamente." };

  revalidatePath(`/posts/${postId}`);
  return { ok: true };
}

/** Edita comentário. RLS garante que só o autor altera. */
export async function updateComment(
  commentId: string,
  postId: string,
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const parsed = commentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Comentário inválido" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { error } = await supabase
    .from("comments")
    .update({ content: parsed.data.content })
    .eq("id", commentId);

  if (error) return { error: "Não foi possível salvar. Tente novamente." };

  revalidatePath(`/posts/${postId}`);
  return { ok: true };
}

/** Apaga comentário. RLS garante que só o autor apaga. */
export async function deleteComment(
  commentId: string,
  postId: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath(`/posts/${postId}`);
}
