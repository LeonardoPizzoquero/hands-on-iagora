import type { CommentView } from "@/lib/comments/queries";
import { canDelete, isModerating, type Viewer } from "@/lib/auth/moderation";
import { canLike } from "@/lib/likes/can-like";
import { CommentItem } from "./CommentItem";

/** Lista plana de comentários (mais antigo → mais novo) + estado vazio. */
export function CommentList({
  comments,
  postId,
  viewer,
}: {
  comments: CommentView[];
  postId: string;
  viewer: Viewer;
}) {
  if (comments.length === 0) {
    return (
      <p className="brutal-box bg-paper px-4 py-6 text-center font-medium opacity-80">
        seja o primeiro a comentar
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          postId={postId}
          isAuthor={c.author_id === viewer?.id}
          canDelete={canDelete(viewer, c.author_id)}
          moderating={isModerating(viewer, c.author_id)}
          canLike={canLike(
            viewer ? { id: viewer.id } : null,
            c.author_id,
          )}
        />
      ))}
    </div>
  );
}
