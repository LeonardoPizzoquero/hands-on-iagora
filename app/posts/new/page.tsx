import { createPost } from "@/app/posts/actions";
import { PostEditor } from "@/components/posts/PostEditor";

export default function NewPostPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-[760px] flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Novo post</h1>
      <PostEditor action={createPost} submitLabel="Publicar" />
    </main>
  );
}
