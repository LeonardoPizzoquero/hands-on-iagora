import Link from "next/link";
import type { FeedPost } from "@/lib/posts/queries";
import { formatDate } from "@/lib/utils/date";
import { LikeButton } from "@/components/likes/LikeButton";
import { canLike } from "@/lib/likes/can-like";

/** Card do feed. Título (link), autor, data e curtidas. */
export function PostCard({
  post,
  viewerId,
}: {
  post: FeedPost;
  viewerId: string | null;
}) {
  return (
    <div className="brutal-box flex flex-col gap-3 bg-paper p-5 transition-transform hover:-translate-y-1 hover:[box-shadow:var(--shadow-brutal-lg)]">
      <Link href={`/posts/${post.id}`} className="block">
        <h2 className="text-xl font-bold tracking-tight">{post.title}</h2>
      </Link>
      <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
        <LikeButton
          target="post"
          id={post.id}
          initialCount={post.likeCount}
          initialLiked={post.likedByMe}
          canLike={canLike(viewerId ? { id: viewerId } : null, post.author_id)}
        />
        <span className="brutal-box bg-brand-yellow px-2 py-0.5">
          {post.authorName}
        </span>
        <span className="opacity-70">{formatDate(post.created_at)}</span>
      </div>
    </div>
  );
}
