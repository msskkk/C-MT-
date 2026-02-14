"use client";

import { useState } from "react";

interface PostFormProps {
  onPost: () => void;
}

export default function PostForm({ onPost }: PostFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const remaining = 280 - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      setContent("");
      onPost();
    } else {
      const data = await res.json();
      setError(data.error || "投稿に失敗しました");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="いまどうしてる？"
        rows={3}
        className="w-full resize-none border-0 focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-400"
        maxLength={280}
      />
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span
          className={`text-sm ${
            remaining < 20 ? "text-red-500" : "text-gray-400"
          }`}
        >
          {remaining}
        </span>
        <button
          type="submit"
          disabled={!content.trim() || loading || remaining < 0}
          className="bg-green-500 text-white px-5 py-1.5 rounded-full text-sm font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "投稿中..." : "投稿する"}
        </button>
      </div>
    </form>
  );
}
