import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts/queries";
import { getComments } from "@/lib/comments/queries";
import { getCurrentProfile } from "@/lib/auth/profile";
import { canDelete, isModerating } from "@/lib/auth/moderation";
import { canLike } from "@/lib/likes/can-like";
import { LikeButton } from "@/components/likes/LikeButton";
import { deletePost } from "@/app/posts/actions";
import { MarkdownRenderer } from "@/components/posts/MarkdownRenderer";
import { DeleteConfirm } from "@/components/ui/DeleteConfirm";
import { CommentList } from "@/components/comments/CommentList";
import { CommentForm } from "@/components/comments/CommentForm";
import { formatDate } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const viewerId = profile?.id ?? null;

  const post = await getPost(id, viewerId);
  if (!post) notFound();

  const comments = await getComments(id, viewerId);
  const viewer = profile ? { id: profile.id, role: profile.role } : null;
  const showDeletePost = canDelete(viewer, post.author_id);
  const moderatingPost = isModerating(viewer, post.author_id);
  const canLikePost = canLike(viewerId ? { id: viewerId } : null, post.author_id);

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-[760px] flex-col gap-8 px-6 py-10">
      <Link href="/feed" className="w-fit font-mono text-sm underline">
        ← voltar ao feed
      </Link>

      <article className="flex flex-col gap-5">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
            <LikeButton
              target="post"
              id={post.id}
              initialCount={post.likeCount}
              initialLiked={post.likedByMe}
              canLike={canLikePost}
            />
            <span className="brutal-box bg-brand-yellow px-2 py-0.5">
              {post.authorName}
            </span>
            <span className="opacity-70">{formatDate(post.created_at)}</span>
          </div>
        </header>

        <div className="brutal-box bg-paper p-6">
          <MarkdownRenderer content={post.content} />
        </div>

        {(viewer?.id === post.author_id || showDeletePost) && (
          <div className="flex flex-wrap items-center gap-2">
            {viewer?.id === post.author_id && (
              <Link
                href={`/posts/${post.id}/edit`}
                className="brutal-box bg-paper px-3 py-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
              >
                Editar
              </Link>
            )}
            {showDeletePost && (
              <DeleteConfirm
                action={deletePost.bind(null, post.id)}
                triggerLabel={moderatingPost ? "Apagar (moderar)" : "Apagar"}
                question={
                  moderatingPost
                    ? "Apagar post de outro usuário (moderação)?"
                    : "Apagar este post?"
                }
              />
            )}
          </div>
        )}
      </article>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold tracking-tight">
          Comentários ({post.commentCount})
        </h2>
        <CommentForm postId={post.id} />
        <CommentList comments={comments} postId={post.id} viewer={viewer} />
      </section>
    </main>
  );
}
