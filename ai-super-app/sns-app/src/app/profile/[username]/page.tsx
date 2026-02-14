"use client";

import { useEffect, useState, useCallback, use } from "react";
import Header from "@/components/Header";
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

interface FollowInfo {
  followers: number;
  following: number;
  isFollowing: boolean;
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followInfo, setFollowInfo] = useState<FollowInfo>({
    followers: 0,
    following: 0,
    isFollowing: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    setCurrentUser(meData.user);

    const usersRes = await fetch(`/api/users?username=${username}`);
    if (!usersRes.ok) {
      setLoading(false);
      return;
    }
    const userData = await usersRes.json();
    setProfileUser(userData.user);

    if (userData.user) {
      const [postsRes, followRes] = await Promise.all([
        fetch(`/api/posts?userId=${userData.user.id}`),
        fetch(`/api/follows?userId=${userData.user.id}`),
      ]);
      const postsData = await postsRes.json();
      const followData = await followRes.json();
      setPosts(postsData.posts);
      setFollowInfo(followData);
    }
    setLoading(false);
  }, [username]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
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

  const handleFollow = async () => {
    if (!currentUser || !profileUser) return;
    await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: profileUser.id }),
    });
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={currentUser} />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center text-gray-500">
          読み込み中...
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={currentUser} />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center text-gray-500">
          ユーザーが見つかりません
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser} />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-2xl">
                {profileUser.display_name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {profileUser.display_name}
                </h1>
                <p className="text-gray-500 text-sm">@{profileUser.username}</p>
              </div>
            </div>
            {currentUser && !isOwnProfile && (
              <button
                onClick={handleFollow}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  followInfo.isFollowing
                    ? "bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {followInfo.isFollowing ? "フォロー中" : "フォローする"}
              </button>
            )}
          </div>
          {profileUser.bio && (
            <p className="mt-4 text-gray-700 text-sm">{profileUser.bio}</p>
          )}
          <div className="mt-4 flex gap-4 text-sm">
            <span className="text-gray-600">
              <strong className="text-gray-900">{followInfo.following}</strong>{" "}
              フォロー
            </span>
            <span className="text-gray-600">
              <strong className="text-gray-900">{followInfo.followers}</strong>{" "}
              フォロワー
            </span>
            <span className="text-gray-600">
              <strong className="text-gray-900">{posts.length}</strong> 投稿
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              まだ投稿がありません
            </p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.id}
                onLike={handleLike}
                onDelete={isOwnProfile ? handleDelete : undefined}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
