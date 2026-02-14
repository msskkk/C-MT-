"use client";

import Link from "next/link";

interface Post {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  content: string;
  created_at: string;
  like_count: number;
  liked_by_me: number;
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr + "Z");
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}秒前`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  return date.toLocaleDateString("ja-JP");
}

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
}: PostCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
            {post.display_name.charAt(0)}
          </div>
          <div>
            <Link
              href={`/profile/${post.username}`}
              className="font-semibold text-gray-900 hover:underline text-sm"
            >
              {post.display_name}
            </Link>
            <p className="text-xs text-gray-500">
              @{post.username} · {timeAgo(post.created_at)}
            </p>
          </div>
        </div>
        {currentUserId === post.user_id && onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-gray-400 hover:text-red-500 text-sm"
            title="削除"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-gray-800 whitespace-pre-wrap break-words ml-12 mb-3">
        {post.content}
      </p>

      <div className="ml-12 flex items-center gap-4">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1 text-sm transition-colors ${
            post.liked_by_me
              ? "text-red-500"
              : "text-gray-400 hover:text-red-500"
          }`}
        >
          <span>{post.liked_by_me ? "♥" : "♡"}</span>
          <span>{post.like_count > 0 ? post.like_count : ""}</span>
        </button>
      </div>
    </div>
  );
}
