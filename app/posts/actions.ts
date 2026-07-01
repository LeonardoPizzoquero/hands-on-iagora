"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { postSchema } from "@/lib/validation/post";
import { validateImage } from "@/lib/validation/image";

export type PostFormState = { error?: string };

/** Cria post. author_id é sempre o usuário atual (nunca vem do client). */
export async function createPost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { data, error } = await supabase
    .from("posts")
    .insert({ ...parsed.data, author_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível publicar. Tente novamente." };
  }

  revalidatePath("/feed");
  redirect(`/posts/${data.id}`);
}

/** Edita post. RLS garante que só o autor consegue alterar. */
export async function updatePost(
  postId: string,
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { error } = await supabase
    .from("posts")
    .update(parsed.data)
    .eq("id", postId);

  if (error) return { error: "Não foi possível salvar. Tente novamente." };

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/feed");
  redirect(`/posts/${postId}`);
}

/** Apaga post. RLS garante que só o autor consegue apagar. */
export async function deletePost(postId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("posts").delete().eq("id", postId);

  revalidatePath("/feed");
  redirect("/feed");
}

export type UploadState = { url?: string; error?: string };

/**
 * Faz upload de imagem do conteúdo para o bucket público `post-images` em
 * `{user_id}/{uuid}.ext` e retorna uma URL pública permanente. Valida tipo e
 * tamanho server-side (defesa em camadas — RLS de Storage restringe a escrita
 * à própria pasta).
 */
export async function uploadPostImage(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Nenhum arquivo enviado." };

  const check = validateImage({ type: file.type, size: file.size });
  if (!check.ok) return { error: check.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const path = `${user.id}/${randomUUID()}.${check.ext}`;
  const { error: upErr } = await supabase.storage
    .from("post-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (upErr) return { error: "Falha no upload. Tente novamente." };

  // URL pública permanente (bucket é público). Não expira, ao contrário da
  // signed URL, evitando que imagens gravadas no conteúdo do post quebrem.
  const { data } = supabase.storage.from("post-images").getPublicUrl(path);

  if (!data?.publicUrl) return { error: "Falha ao gerar URL da imagem." };

  return { url: data.publicUrl };
}
