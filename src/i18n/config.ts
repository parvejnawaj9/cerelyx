/**
 * i18n configuration. Phase 1 ships English UI only; the structure supports
 * adding Bengali, Hindi and more without rework (brief §9).
 */
export const LOCALES = ["en", "bn", "hi"] as const;
export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

/** Locales whose UI message catalog actually ships today. */
export const ENABLED_LOCALES: AppLocale[] = ["en"];

export const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  bn: "বাংলা",
  hi: "हिन्दी",
  ta: "தமிழ்",
  te: "తెలుగు",
  mr: "मराठी",
  gu: "ગુજરાતી",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  pa: "ਪੰਜਾਬੀ",
  ur: "اردو",
};

/** RTL-readiness for the layout system (Urdu/Arabic ship later — brief §9). */
export const RTL_LOCALES = new Set(["ur", "ar", "he", "fa"]);

export function isRtl(locale: string): boolean {
  return RTL_LOCALES.has(locale);
}
