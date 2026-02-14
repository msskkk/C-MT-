"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, displayName }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(data.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-green-500 mb-8">
          SNS App
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-gray-200 p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-800">新規登録</h2>
          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {error}
            </p>
          )}
          <div>
            <input
              type="text"
              placeholder="ユーザー名 (3〜20文字、英数字)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              minLength={3}
              maxLength={20}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="表示名"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="パスワード (6文字以上)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "登録中..." : "アカウントを作成"}
          </button>
          <p className="text-center text-sm text-gray-500">
            既にアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-green-500 hover:underline">
              ログイン
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
