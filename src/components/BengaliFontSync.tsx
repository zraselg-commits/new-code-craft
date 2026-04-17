"use client";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Syncs the active language to <body class="lang-bn|lang-en">.
 * This lets us scope the Hind Siliguri font entirely via CSS
 * without any JS font-loading overhead.
 */
export function BengaliFontSync() {
  const { lang } = useLanguage();

  useEffect(() => {
    const body = document.body;
    body.classList.remove("lang-en", "lang-bn", "lang-hi");
    body.classList.add(`lang-${lang}`);
  }, [lang]);

  return null;
}
