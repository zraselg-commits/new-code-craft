"use client";

import { useState, useEffect, type ReactNode } from "react";

/**
 * MountedText — renders children only after hydration is complete.
 * Use this for any text that changes based on localStorage (lang, currency, theme).
 * During SSR and the first client render it shows `fallback` (default: empty string).
 * After mount, it shows the real children — no hydration mismatch.
 */
export function MountedText({
  children,
  fallback = "",
  className,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <span
      suppressHydrationWarning
      className={className}
      style={!mounted ? { display: "inline-block", minWidth: "1ch" } : undefined}
    >
      {mounted ? children : fallback}
    </span>
  );
}
