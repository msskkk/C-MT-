"use client";

interface AssetCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

export default function AssetCard({ label, value, sub, color = "blue" }: AssetCardProps) {
  const colorMap: Record<string, string> = {
    blue: "border-blue-500/30 bg-blue-500/5",
    green: "border-green-500/30 bg-green-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
    orange: "border-orange-500/30 bg-orange-500/5",
    red: "border-red-500/30 bg-red-500/5",
  };

  return (
    <div className={`rounded-xl border p-5 ${colorMap[color] || colorMap.blue}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
