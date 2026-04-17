"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Currency = "BDT" | "USD";

const USD_TO_BDT = 110;

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggle: () => void;
  formatPrice: (usdAmount: number) => string;
  convertPrice: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "rc_currency";
const MANUAL_KEY  = "rc_currency_manual"; // "1" = user has manually chosen; skip auto-sync

function getInitial(): { currency: Currency; manual: boolean } {
  try {
    if (typeof localStorage === "undefined") return { currency: "BDT", manual: false };
    const manual = localStorage.getItem(MANUAL_KEY) === "1";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "USD" || stored === "BDT") return { currency: stored, manual };
    const country = localStorage.getItem("rc_country");
    return { currency: country === null || country === "BD" ? "BDT" : "USD", manual: false };
  } catch {
    return { currency: "BDT", manual: false };
  }
}

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { lang } = useLanguage();
  const init = getInitial();
  const [currency, setCurrencyState] = useState<Currency>(init.currency);
  const [manual, setManual] = useState(init.manual);

  // ── Auto-sync: language change → currency change (unless user manually overrode) ──
  useEffect(() => {
    if (manual) return;
    const auto: Currency = lang === "bn" ? "BDT" : "USD";
    setCurrencyState(auto);
    try { localStorage.setItem(STORAGE_KEY, auto); } catch {}
  }, [lang, manual]);

  // ── Geo-detect on first visit (no stored prefs) ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "USD" || stored === "BDT") return;
      const country = localStorage.getItem("rc_country");
      if (country !== null) return;
      import("@/lib/geoLocale").then(({ detectGeoLocale }) =>
        detectGeoLocale().then(({ currency: detected }) => {
          if (!localStorage.getItem(MANUAL_KEY)) setCurrencyState(detected);
        })
      );
    } catch {}
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    setManual(true);
    try {
      localStorage.setItem(STORAGE_KEY, c);
      localStorage.setItem(MANUAL_KEY, "1");
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setCurrencyState((prev) => {
      const next: Currency = prev === "BDT" ? "USD" : "BDT";
      setManual(true);
      try {
        localStorage.setItem(STORAGE_KEY, next);
        localStorage.setItem(MANUAL_KEY, "1");
      } catch {}
      return next;
    });
  }, []);

  const convertPrice = useCallback(
    (usdAmount: number) => (currency === "BDT" ? Math.round(usdAmount * USD_TO_BDT) : usdAmount),
    [currency]
  );

  const formatPrice = useCallback(
    (usdAmount: number) => {
      if (currency === "BDT") {
        return "৳\u00a0" + Math.round(usdAmount * USD_TO_BDT).toLocaleString("en-BD");
      }
      return "$" + usdAmount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggle, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
