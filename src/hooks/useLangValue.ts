/**
 * useLangValue — picks the correct language string from bilingual field pairs.
 *
 * Usage:
 *   const lv = useLangValue();
 *   lv(item.title, item.title_bn)  // returns title_bn if lang=bn and not empty, else title
 *
 * Storage convention:  fieldName (English) + fieldName_bn (Bengali)
 * If the selected language's value is empty, falls back to the other language.
 */
import { useLanguage } from "@/contexts/LanguageContext";

export function useLangValue() {
  const { lang } = useLanguage();

  return function lv(en: string | undefined | null, bn?: string | undefined | null): string {
    const enVal = en?.trim() ?? "";
    const bnVal = bn?.trim() ?? "";

    if (lang === "bn") {
      return bnVal || enVal; // Bengali → fall back to English if bn empty
    }
    return enVal || bnVal; // English → fall back to Bengali if en empty
  };
}

/**
 * getLangValue — non-hook version (for server components or utility functions).
 * Pass lang explicitly.
 */
export function getLangValue(
  lang: "en" | "bn",
  en: string | undefined | null,
  bn?: string | undefined | null
): string {
  const enVal = en?.trim() ?? "";
  const bnVal = bn?.trim() ?? "";
  if (lang === "bn") return bnVal || enVal;
  return enVal || bnVal;
}
