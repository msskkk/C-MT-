import Link from "next/link";
import { AppIdea } from "@/data/apps";

export default function AppCard({ app }: { app: AppIdea }) {
  return (
    <Link href={`/apps/${app.slug}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-5 transition-opacity`}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{app.emoji}</span>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{app.name}</h3>
              <span className="text-xs text-gray-400">#{app.id}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">{app.tagline}</p>
          <p className="text-xs text-gray-400 mb-4 line-clamp-2">
            {app.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {app.target}
            </span>
            <span
              className={`text-xs font-bold bg-gradient-to-r ${app.color} bg-clip-text text-transparent`}
            >
              {app.pricing}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
