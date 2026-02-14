import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "資産管理ダッシュボード",
  description: "統合資産管理ダッシュボード",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased flex">
        <Sidebar />
        <main className="flex-1 p-6 min-h-screen overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
