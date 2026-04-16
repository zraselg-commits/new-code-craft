/**
 * Pages Router _app.tsx
 *
 * src/pages/ contains React page COMPONENTS imported by the App Router (app/).
 * Next.js also picks them up as Pages Router pages (at /AboutPage, /IndexPage etc.)
 * This _app.tsx provides all necessary providers so those Pages Router pages
 * don't crash during build-time prerendering.
 *
 * Real routes are served by App Router (app/) — not these Pages Router paths.
 */
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { apiFetch } from "@/lib/api";

async function defaultQueryFn({ queryKey }: { queryKey: readonly unknown[] }) {
  const segments = queryKey.filter((k) => k !== null && k !== undefined);
  const url =
    segments.length === 1
      ? (segments[0] as string)
      : segments.join("/").replace(/\/+/g, "/");
  const r = await apiFetch(url as string);
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
    throw new Error(err.error || `Request failed: ${r.status}`);
  }
  return r.json();
}

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 5 * 60_000,
            gcTime: 30 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            queryFn: defaultQueryFn,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <AuthProvider>
              <CartProvider>
                <Component {...pageProps} />
              </CartProvider>
            </AuthProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
