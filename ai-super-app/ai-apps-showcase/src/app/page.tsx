import { apps } from "@/data/apps";
import AppCard from "@/components/AppCard";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Apps Showcase
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-2">
          Pieter Levels氏に学ぶ、シンプルだけど使われるAIアプリ
        </p>
        <p className="text-sm text-gray-400">
          全30アプリのプロトタイプ — クリックしてデモを体験
        </p>
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            30 Apps
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            Interactive Demo
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-purple-500 rounded-full" />
            Mock AI Results
          </span>
        </div>
      </div>

      {/* Category Sections */}
      <Section
        title="写真 → AI変換"
        description="画像をアップロードしてAIで変換するサービス"
        apps={apps.filter((a) =>
          [2, 3, 4, 6, 8, 9, 10, 11, 14, 15, 17, 19, 21, 22, 24, 25, 26, 29].includes(a.id)
        )}
      />
      <Section
        title="テキスト → AI生成"
        description="テキストを入力してAIがコンテンツを生成するサービス"
        apps={apps.filter((a) => [5, 16, 18, 23, 27].includes(a.id))}
      />
      <Section
        title="フォーム → AI提案"
        description="情報を入力してAIが最適な提案を返すサービス"
        apps={apps.filter((a) => [7, 12, 13, 28, 30].includes(a.id))}
      />
      <Section
        title="ファイル → AI分析"
        description="ドキュメントをアップロードしてAIが分析するサービス"
        apps={apps.filter((a) => [1, 20].includes(a.id))}
      />
    </main>
  );
}

function Section({
  title,
  description,
  apps: sectionApps,
}: {
  title: string;
  description: string;
  apps: typeof apps;
}) {
  return (
    <section className="mb-16">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sectionApps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </section>
  );
}
