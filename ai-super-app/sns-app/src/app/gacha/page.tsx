"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface User {
  id: string;
  username: string;
  display_name: string;
  bio: string;
}

interface GachaResult {
  direction: string;
  duration: string;
  mission: string;
  rarity: "N" | "R" | "SR" | "SSR";
}

const DIRECTIONS = [
  "北", "南", "東", "西",
  "北東", "北西", "南東", "南西",
];

const DURATIONS = [
  "10分", "15分", "20分", "30分", "45分", "60分", "90分",
];

const MISSIONS_BY_RARITY: Record<string, { missions: string[]; weight: number }> = {
  N: {
    weight: 50,
    missions: [
      "自販機を見つけてドリンクを買う",
      "猫か犬を見つける",
      "花を3種類見つける",
      "知らない道を1本歩く",
      "ベンチに座って空を見上げる",
      "コンビニでおやつを買う",
      "信号を5回渡る",
      "階段を見つけて上り下りする",
    ],
  },
  R: {
    weight: 30,
    missions: [
      "面白い看板を写真に撮る",
      "カフェを見つけてテイクアウトする",
      "公園で深呼吸を10回する",
      "鳥の声を3種類聞き分ける",
      "地元のお店に初めて入る",
      "面白い形の雲を見つける",
      "神社やお寺をお参りする",
      "橋を渡る",
    ],
  },
  SR: {
    weight: 15,
    missions: [
      "知らない人に挨拶する",
      "夕日か朝日を見る",
      "川沿いをひたすら歩く",
      "坂道を見つけて一番上まで登る",
      "レトロな建物を見つけて観察する",
      "商店街を端から端まで歩く",
      "すれ違った人の数を数える（100人目まで）",
      "路地裏を探検する",
    ],
  },
  SSR: {
    weight: 5,
    missions: [
      "虹を見つける（見つからなくても空を楽しむ）",
      "行ったことのない駅まで歩く",
      "地元の絶景スポットを発見する",
      "野良猫と友達になる",
      "散歩中に出会った人と会話する",
      "ゴール地点で最高の一枚を撮る",
      "寄り道しまくって予定の3倍歩く",
      "散歩中に見つけた一番素敵なものをスケッチする",
    ],
  },
};

const RARITY_CONFIG = {
  N: {
    label: "N",
    color: "text-gray-500",
    bg: "bg-gray-100",
    border: "border-gray-300",
    glow: "",
    emoji: "",
  },
  R: {
    label: "R",
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-300",
    glow: "",
    emoji: "",
  },
  SR: {
    label: "SR",
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-300",
    glow: "shadow-lg shadow-purple-200",
    emoji: "",
  },
  SSR: {
    label: "SSR",
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    glow: "shadow-xl shadow-yellow-200",
    emoji: "",
  },
};

function pickRarity(): GachaResult["rarity"] {
  const rand = Math.random() * 100;
  if (rand < MISSIONS_BY_RARITY.SSR.weight) return "SSR";
  if (rand < MISSIONS_BY_RARITY.SSR.weight + MISSIONS_BY_RARITY.SR.weight) return "SR";
  if (rand < MISSIONS_BY_RARITY.SSR.weight + MISSIONS_BY_RARITY.SR.weight + MISSIONS_BY_RARITY.R.weight) return "R";
  return "N";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rollGacha(): GachaResult {
  const rarity = pickRarity();
  return {
    direction: pickRandom(DIRECTIONS),
    duration: pickRandom(DURATIONS),
    mission: pickRandom(MISSIONS_BY_RARITY[rarity].missions),
    rarity,
  };
}

export default function GachaPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<GachaResult | null>(null);
  const [rolling, setRolling] = useState(false);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      });
  }, []);

  const handleRoll = useCallback(() => {
    setRolling(true);
    setPosted(false);
    setResult(null);

    // Animation: flash through random results
    let count = 0;
    const interval = setInterval(() => {
      setResult(rollGacha());
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setResult(rollGacha());
        setRolling(false);
      }
    }, 100);
  }, []);

  const buildPostContent = (r: GachaResult) => {
    const config = RARITY_CONFIG[r.rarity];
    const stars = r.rarity === "SSR" ? "!!!" : r.rarity === "SR" ? "!!" : r.rarity === "R" ? "!" : "";
    return `【散歩ガチャ】[${config.label}]${stars}\n` +
      `方角: ${r.direction}\n` +
      `時間: ${r.duration}\n` +
      `ミッション: ${r.mission}\n` +
      `#散歩ガチャ`;
  };

  const handlePost = async () => {
    if (!result || !user) return;
    setPosting(true);
    const content = buildPostContent(result);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setPosted(true);
    }
    setPosting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={null} />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center text-gray-500">
          読み込み中...
        </div>
      </div>
    );
  }

  const config = result ? RARITY_CONFIG[result.rarity] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={() => setUser(null)} />
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            散歩ガチャ
          </h1>
          <p className="text-gray-500 text-sm">
            ボタンを押して今日の散歩のお題を決めよう！
          </p>
        </div>

        {/* Gacha Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleRoll}
            disabled={rolling}
            className={`
              relative px-10 py-4 rounded-full text-lg font-bold text-white
              transition-all duration-200
              ${rolling
                ? "bg-gray-400 cursor-not-allowed scale-95"
                : "bg-green-500 hover:bg-green-600 hover:scale-105 active:scale-95"
              }
            `}
          >
            {rolling ? "ガチャ中..." : "ガチャを回す！"}
          </button>
        </div>

        {/* Result Card */}
        {result && config && (
          <div
            className={`
              border-2 rounded-xl p-6 transition-all duration-300
              ${config.border} ${config.bg} ${config.glow}
              ${rolling ? "opacity-50" : "opacity-100"}
            `}
          >
            {/* Rarity Badge */}
            <div className="text-center mb-4">
              <span
                className={`
                  inline-block px-4 py-1 rounded-full text-sm font-bold
                  ${config.color}
                  ${result.rarity === "SSR" ? "bg-yellow-200 animate-pulse" : ""}
                  ${result.rarity === "SR" ? "bg-purple-200" : ""}
                  ${result.rarity === "R" ? "bg-blue-200" : ""}
                  ${result.rarity === "N" ? "bg-gray-200" : ""}
                `}
              >
                {config.label}
              </span>
            </div>

            {/* Direction & Duration */}
            <div className="flex justify-center gap-6 mb-5">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">方角</div>
                <div className="text-3xl font-bold text-gray-800">
                  {result.direction}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">時間</div>
                <div className="text-3xl font-bold text-gray-800">
                  {result.duration}
                </div>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-lg p-4 mb-5">
              <div className="text-xs text-gray-500 mb-1 text-center">ミッション</div>
              <p className="text-center text-gray-800 font-semibold">
                {result.mission}
              </p>
            </div>

            {/* Probability Info */}
            <div className="text-center text-xs text-gray-400 mb-4">
              SSR: 5% / SR: 15% / R: 30% / N: 50%
            </div>

            {/* Share Button */}
            {user && !rolling && (
              <div className="text-center">
                {posted ? (
                  <div className="space-y-2">
                    <p className="text-green-600 font-semibold text-sm">
                      投稿しました！
                    </p>
                    <button
                      onClick={() => router.push("/")}
                      className="text-sm text-green-500 hover:underline"
                    >
                      タイムラインで確認する
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handlePost}
                    disabled={posting}
                    className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
                  >
                    {posting ? "投稿中..." : "この結果を投稿する"}
                  </button>
                )}
              </div>
            )}

            {!user && !rolling && (
              <p className="text-center text-sm text-gray-400">
                <button
                  onClick={() => router.push("/login")}
                  className="text-green-500 hover:underline"
                >
                  ログイン
                </button>
                すると結果を投稿できます
              </p>
            )}
          </div>
        )}

        {/* Placeholder before first roll */}
        {!result && (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">🎲</div>
            <p className="text-gray-400 text-sm">
              ガチャを回して散歩のお題をゲット！
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
