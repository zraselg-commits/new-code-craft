"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

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

function getInitialCurrency(): Currency {
  try {
    if (typeof localStorage === "undefined") return "BDT";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "USD" || stored === "BDT") return stored;
    const country = localStorage.getItem("rc_country");
    if (country === "BD" || country === null) return "BDT";
    return "USD";
  } catch {
    return "BDT";
  }
}

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(getInitialCurrency);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "USD" || stored === "BDT") return;
      const country = localStorage.getItem("rc_country");
      if (country !== null) return;
      import("@/lib/geoLocale").then(({ detectGeoLocale }) =>
        detectGeoLocale().then(({ currency: detected }) => setCurrencyState(detected))
      );
    } catch {}
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch {}
  }, []);

  const toggle = useCallback(() => {
    setCurrencyState((prev) => {
      const next: Currency = prev === "BDT" ? "USD" : "BDT";
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  const convertPrice = useCallback((usdAmount: number) => {
    return currency === "BDT" ? Math.round(usdAmount * USD_TO_BDT) : usdAmount;
  }, [currency]);

  const formatPrice = useCallback((usdAmount: number) => {
    if (currency === "BDT") {
      return "৳" + Math.round(usdAmount * USD_TO_BDT).toLocaleString("en-BD");
    }
    return "$" + usdAmount.toLocaleString("en-US");
  }, [currency]);

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
