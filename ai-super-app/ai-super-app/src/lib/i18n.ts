import jaMain from "@/i18n/ja.json";
import enMain from "@/i18n/en.json";
import zhMain from "@/i18n/zh.json";
import koMain from "@/i18n/ko.json";
import jaTools from "@/i18n/tools-ja.json";
import enTools from "@/i18n/tools-en.json";
import zhTools from "@/i18n/tools-zh.json";
import koTools from "@/i18n/tools-ko.json";

export const LOCALES = ["ja", "en", "zh", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

const LOCALE_LABELS: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  zh: "中文",
  ko: "한국어",
};

export function getLocaleLabel(locale: Locale): string {
  return LOCALE_LABELS[locale];
}

const DICTS: Record<Locale, Record<string, unknown>> = {
  ja: { ...jaMain, ...jaTools },
  en: { ...enMain, ...enTools },
  zh: { ...zhMain, ...zhTools },
  ko: { ...koMain, ...koTools },
};

export function getDict(locale: Locale): Record<string, unknown> {
  return DICTS[locale] || DICTS.ja;
}

export function loadDict(locale: Locale): Promise<Record<string, unknown>> {
  return Promise.resolve(getDict(locale));
}

export function t(
  dict: Record<string, unknown>,
  key: string,
  vars?: Record<string, string | number>
): string {
  const parts = key.split(".");
  let val: unknown = dict;
  for (const p of parts) {
    if (val && typeof val === "object") {
      val = (val as Record<string, unknown>)[p];
    } else {
      return key;
    }
  }
  if (typeof val !== "string") return key;
  if (vars) {
    return val.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ""));
  }
  return val;
}
