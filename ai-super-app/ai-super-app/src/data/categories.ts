import { Category } from "./types";

export const categories: Category[] = [
  {
    id: "life",
    emoji: "\u{1F3E0}",
    gradient: "from-orange-400 to-amber-500",
    bundleIds: ["daily", "cook", "archive", "moving", "realestate", "time", "eco", "cleaning", "interior", "ceremony", "tea", "party", "giftwrap"],
  },
  {
    id: "health",
    emoji: "\u{1F49A}",
    gradient: "from-green-400 to-emerald-500",
    bundleIds: ["fitness", "sleep", "beauty", "yoga", "nutrition", "mental", "running"],
  },
  {
    id: "work",
    emoji: "\u{1F4BC}",
    gradient: "from-blue-500 to-indigo-600",
    bundleIds: ["sidehustle", "biz", "career", "money", "marketing", "freelance", "meeting", "datavis", "startup", "email_pro", "mindmap", "tax"],
  },
  {
    id: "creative",
    emoji: "\u{1F3A8}",
    gradient: "from-violet-500 to-purple-600",
    bundleIds: ["creator", "design", "music", "photo", "writer", "manga", "video", "podcast", "handmade"],
  },
  {
    id: "study",
    emoji: "\u{1F4DA}",
    gradient: "from-emerald-500 to-teal-600",
    bundleIds: ["student", "learn", "lang", "reading", "exam", "debug", "presentation", "speech"],
  },
  {
    id: "family",
    emoji: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}",
    gradient: "from-sky-400 to-blue-500",
    bundleIds: ["parent", "kid", "senior", "wedding", "pet", "baby"],
  },
  {
    id: "hobby",
    emoji: "\u{1F3AE}",
    gradient: "from-fuchsia-500 to-pink-600",
    bundleIds: ["diy", "garden", "game", "event", "date", "camping", "boardgame", "aquarium", "recycle", "nail", "astro", "movie"],
  },
  {
    id: "outing",
    emoji: "\u{1F697}",
    gradient: "from-cyan-500 to-blue-600",
    bundleIds: ["travel", "car", "sns", "news", "access", "bicycle", "sports", "abroad"],
  },
];
