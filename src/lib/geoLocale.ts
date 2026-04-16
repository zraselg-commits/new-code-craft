"use client";

type GeoLocale = { lang: "en" | "bn"; currency: "BDT" | "USD" };

const COUNTRY_KEY = "rc_country";

let _promise: Promise<GeoLocale> | null = null;

async function fetchCountry(): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 4000);
  try {
    // Use our local proxy to avoid CORS — server fetches ipapi.co and returns country_code
    const res = await fetch("/api/geo", { signal: controller.signal });
    const data = await res.json();
    const code = (data.country_code as string) || "UNKNOWN";
    try { localStorage.setItem(COUNTRY_KEY, code); } catch {}
    return code;
  } catch {
    return "UNKNOWN";
  } finally {
    clearTimeout(id);
  }
}

export function detectGeoLocale(): Promise<GeoLocale> {
  if (_promise) return _promise;
  _promise = (async (): Promise<GeoLocale> => {
    try {
      const cached = localStorage.getItem(COUNTRY_KEY);
      const country = cached !== null ? cached : await fetchCountry();
      return country === "BD"
        ? { lang: "bn", currency: "BDT" }
        : { lang: "en", currency: "USD" };
    } catch {
      return { lang: "en", currency: "USD" };
    }
  })();
  return _promise;
}
