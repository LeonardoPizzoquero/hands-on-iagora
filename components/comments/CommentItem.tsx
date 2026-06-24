"use client";

import { useState, useTransition } from "react";
import {
  updateComment,
  deleteComment,
} from "@/app/posts/[id]/comments/actions";
import { DeleteConfirm } from "@/components/ui/DeleteConfirm";
import { LikeButton } from "@/components/likes/LikeButton";
import { COMMENT_MAX } from "@/lib/validation/comment";
import { formatDate } from "@/lib/utils/date";
import type { CommentView } from "@/lib/comments/queries";

/**
 * Comentário individual. Texto plano (escapado). Autor edita/apaga o próprio;
 * teacher pode apagar qualquer um (moderação). Comentário de professor recebe
 * destaque visual.
 */
export function CommentItem({
  comment,
  postId,
  isAuthor,
  canDelete,
  moderating,
  canLike,
}: {
  comment: CommentView;
  postId: string;
  isAuthor: boolean;
  canDelete: boolean;
  moderating: boolean;
  canLike: boolean;
}) {
  const isTeacherComment = comment.authorRole === "teacher";
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateComment(comment.id, postId, {}, formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      setError(null);
      setEditing(false);
    });
  }

  return (
    <div
      className={
        isTeacherComment
          ? "brutal-box border-brand-red bg-brand-yellow p-4 [box-shadow:var(--shadow-brutal-lg)]"
          : "brutal-box bg-paper p-4"
      }
    >
      <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
        <span
          className={
            isTeacherComment
              ? "brutal-box bg-brand-red px-2 py-0.5 text-paper"
              : "brutal-box bg-brand-blue px-2 py-0.5 text-paper"
          }
        >
          {comment.authorName}
        </span>
        {isTeacherComment && (
          <span className="brutal-box bg-ink px-2 py-0.5 text-paper">
            professor
          </span>
        )}
        <span className="opacity-70">{formatDate(comment.created_at)}</span>
      </div>

      {editing ? (
        <form action={onSubmit} className="mt-3 flex flex-col gap-2">
          <textarea
            name="content"
            required
            maxLength={COMMENT_MAX}
            rows={3}
            defaultValue={comment.content}
            className="brutal-box resize-y bg-paper px-3 py-2 outline-none"
          />
          {error && (
            <p role="alert" className="text-sm font-bold text-brand-red">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="brutal-box bg-brand-yellow px-3 py-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {pending ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              className="brutal-box bg-paper px-3 py-1.5 text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-2 whitespace-pre-wrap break-words">{comment.content}</p>
      )}

      {!editing && (
        <div className="mt-3">
          <LikeButton
            target="comment"
            id={comment.id}
            initialCount={comment.likeCount}
            initialLiked={comment.likedByMe}
            canLike={canLike}
          />
        </div>
      )}

      {(isAuthor || canDelete) && !editing && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {isAuthor && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="brutal-box bg-paper px-3 py-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
            >
              Editar
            </button>
          )}
          {canDelete && (
            <DeleteConfirm
              action={deleteComment.bind(null, comment.id, postId)}
              triggerLabel={moderating ? "Apagar (moderar)" : "Apagar"}
              question={
                moderating
                  ? "Apagar comentário de outro usuário (moderação)?"
                  : "Apagar este comentário?"
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
