import { notFound, redirect } from "next/navigation";
import { getPost } from "@/lib/posts/queries";
import { createClient } from "@/lib/supabase/server";
import { updatePost } from "@/app/posts/actions";
import { PostEditor } from "@/components/posts/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Só o autor edita (RLS é a defesa final; aqui é UX/guard).
  if (!user || user.id !== post.author_id) redirect(`/posts/${id}`);

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-[760px] flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Editar post</h1>
      <PostEditor
        action={updatePost.bind(null, id)}
        defaultTitle={post.title}
        defaultContent={post.content}
        submitLabel="Salvar alterações"
      />
    </main>
  );
}
