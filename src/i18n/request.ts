import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, ENABLED_LOCALES, type AppLocale } from "./config";

/**
 * next-intl request configuration (without i18n routing). Phase 1 always serves
 * the English catalog; Phase 4 adds locale negotiation (cookie/Accept-Language)
 * here without touching components.
 */
export default getRequestConfig(async () => {
  const locale: AppLocale = DEFAULT_LOCALE;
  const effective = ENABLED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const messages = (await import(`../messages/${effective}.json`)).default;
  return { locale: effective, messages };
});
