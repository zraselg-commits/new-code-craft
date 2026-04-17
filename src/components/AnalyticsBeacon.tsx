"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * AnalyticsBeacon — fires a lightweight page-view event to /api/analytics
 * on every route change. Non-blocking, uses requestIdleCallback when available.
 * Excludes admin and API paths.
 */
export default function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip admin and API routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const track = () => {
      const referrer = document.referrer || "direct";
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname, referrer }),
        // Fire-and-forget
        keepalive: true,
      }).catch(() => {});
    };

    // Use idle callback if available, otherwise defer 100ms
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(track, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      const timer = setTimeout(track, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return null;
}
