const STORAGE_KEY = "ai-super-app-usage";
const FREE_DAILY_LIMIT = 2;

interface UsageData {
  date: string;
  count: number;
  isPremium: boolean;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUsage(): UsageData {
  if (typeof window === "undefined")
    return { date: today(), count: 0, isPremium: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: today(), count: 0, isPremium: false };
    const data: UsageData = JSON.parse(raw);
    if (data.date !== today()) {
      return { date: today(), count: 0, isPremium: data.isPremium };
    }
    return data;
  } catch {
    return { date: today(), count: 0, isPremium: false };
  }
}

function saveUsage(data: UsageData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function canUse(): boolean {
  const u = getUsage();
  if (u.isPremium) return true;
  return u.count < FREE_DAILY_LIMIT;
}

export function getRemainingUses(): number {
  const u = getUsage();
  if (u.isPremium) return Infinity;
  return Math.max(0, FREE_DAILY_LIMIT - u.count);
}

export function isPremium(): boolean {
  return getUsage().isPremium;
}

export function recordUse() {
  const u = getUsage();
  u.count += 1;
  u.date = today();
  saveUsage(u);
}

export function setPremium(val: boolean) {
  const u = getUsage();
  u.isPremium = val;
  saveUsage(u);
}
