import { notFound } from "next/navigation";
import Link from "next/link";
import { apps, getAppBySlug } from "@/data/apps";
import DemoArea from "@/components/DemoArea";

export function generateStaticParams() {
  return apps.map((app) => ({ slug: app.slug }));
}

export default async function AppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getAppBySlug(slug);
  if (!app) notFound();

  const prevApp = apps.find((a) => a.id === app.id - 1);
  const nextApp = apps.find((a) => a.id === app.id + 1);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
        >
          ← 一覧に戻る
        </Link>
        <div className="flex gap-2">
          {prevApp && (
            <Link
              href={`/apps/${prevApp.slug}`}
              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1 border rounded-full transition-colors"
            >
              ← {prevApp.name}
            </Link>
          )}
          {nextApp && (
            <Link
              href={`/apps/${nextApp.slug}`}
              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1 border rounded-full transition-colors"
            >
              {nextApp.name} →
            </Link>
          )}
        </div>
      </div>

      {/* Header */}
      <div
        className={`bg-gradient-to-br ${app.color} rounded-2xl p-8 text-white mb-8`}
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{app.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold">{app.name}</h1>
            <p className="text-white/80 text-sm mt-1">{app.tagline}</p>
          </div>
        </div>
        <p className="text-white/90 text-sm leading-relaxed mb-4">
          {app.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
            {app.target}
          </span>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
            {app.pricing}
          </span>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
            #{app.id} / 30
          </span>
        </div>
      </div>

      {/* Demo */}
      <DemoArea app={app} />

      {/* Footer Nav */}
      <div className="mt-12 flex justify-between">
        {prevApp ? (
          <Link
            href={`/apps/${prevApp.slug}`}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← #{prevApp.id} {prevApp.name}
          </Link>
        ) : (
          <div />
        )}
        {nextApp ? (
          <Link
            href={`/apps/${nextApp.slug}`}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            #{nextApp.id} {nextApp.name} →
          </Link>
        ) : (
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            一覧に戻る →
          </Link>
        )}
      </div>
    </main>
  );
}
