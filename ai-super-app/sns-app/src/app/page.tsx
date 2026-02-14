"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import PostForm from "@/components/PostForm";
import PostCard from "@/components/PostCard";

interface User {
  id: string;
  username: string;
  display_name: string;
  bio: string;
}

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

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [meRes, postsRes] = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/posts"),
    ]);

    const meData = await meRes.json();
    const postsData = await postsRes.json();

    setUser(meData.user);
    setPosts(postsData.posts);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLike = async (postId: string) => {
    if (!user) return;
    await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    fetchData();
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("この投稿を削除しますか？")) return;
    await fetch(`/api/posts?id=${postId}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={null} />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center text-gray-500">
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={() => setUser(null)} />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {user ? (
          <>
            <div className="mb-6">
              <PostForm onPost={fetchData} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              タイムライン
            </h2>
          </>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              SNS Appへようこそ
            </h2>
            <p className="text-gray-500 mb-4">
              ログインして投稿やいいねをしましょう
            </p>
          </div>
        )}

        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              まだ投稿がありません。最初の投稿をしてみましょう！
            </p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onLike={handleLike}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
