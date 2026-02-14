"use client";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface AllocationBarProps {
  segments: Segment[];
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
];

export function getSegmentColor(index: number): string {
  return COLORS[index % COLORS.length];
}

export default function AllocationBar({ segments }: AllocationBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  return (
    <div>
      <div className="flex rounded-lg overflow-hidden h-8 mb-3">
        {segments.map((seg, i) => {
          const pct = (seg.value / total) * 100;
          if (pct < 0.5) return null;
          return (
            <div
              key={i}
              style={{ width: `${pct}%`, backgroundColor: seg.color }}
              className="relative group"
              title={`${seg.label}: ${pct.toFixed(1)}%`}
            >
              {pct > 8 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium truncate px-1">
                  {pct.toFixed(0)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: seg.color }}
            />
            {seg.label}
          </div>
        ))}
      </div>
    </div>
  );
}
