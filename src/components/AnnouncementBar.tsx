"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X, Megaphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLangValue } from "@/hooks/useLangValue";

interface SiteSettings {
  announcementBar?: string;
  announcementBar_bn?: string;
  announcementBarEnabled?: boolean;
  primaryColor?: string;
}

export default function AnnouncementBar() {
  const { lang } = useLanguage();
  const lv = useLangValue();
  const [dismissed, setDismissed] = useState(false);

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings-public"],
    queryFn: async () => {
      const r = await fetch("/api/settings-public", { cache: "no-store" });
      if (!r.ok) return {};
      return r.json();
    },
    staleTime: 0,
    gcTime: 60_000,
  });

  if (dismissed) return null;
  if (!settings?.announcementBarEnabled) return null;

  const message = lv(
    settings.announcementBar || "",
    settings.announcementBar_bn || settings.announcementBar || ""
  );
  if (!message.trim()) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium text-white"
      style={{
        background: `linear-gradient(90deg, ${settings.primaryColor || "#ef4444"}, #f97316)`,
        minHeight: "36px",
      }}
    >
      <Megaphone size={14} className="shrink-0 opacity-90" />
      <span className="text-center leading-snug" suppressHydrationWarning>
        {message}
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 opacity-75 hover:opacity-100 transition-opacity ml-1 p-0.5 rounded"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
