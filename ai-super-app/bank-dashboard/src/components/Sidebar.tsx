"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: "📊" },
  { href: "/accounts", label: "口座管理", icon: "🏦" },
  { href: "/import", label: "CSVインポート", icon: "📁" },
  { href: "/manual", label: "手動入力", icon: "✏️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-[#1a1d27] min-h-screen p-4 flex flex-col border-r border-gray-800">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-white">資産管理</h1>
        <p className="text-xs text-gray-500 mt-1">Asset Dashboard</p>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-600/20 text-blue-400 font-medium"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
