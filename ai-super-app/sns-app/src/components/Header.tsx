"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
  user: { id: string; username: string; display_name: string } | null;
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    onLogout?.();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-green-500">
          SNS App
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/gacha"
            className="text-sm text-green-500 hover:text-green-600 font-semibold"
          >
            🎲 散歩ガチャ
          </Link>
          {user ? (
            <>
              <Link
                href={`/profile/${user.username}`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {user.display_name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="text-sm bg-green-500 text-white px-4 py-1.5 rounded-full hover:bg-green-600"
              >
                登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
