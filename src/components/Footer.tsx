"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLangValue } from "@/hooks/useLangValue";
import { useQuery } from "@tanstack/react-query";

const Footer = () => {
  const { t } = useLanguage();
  const lv = useLangValue();

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings-public"],
    queryFn: async () => {
      const r = await fetch("/api/settings-public");
      if (!r.ok) return {};
      return r.json();
    },
    staleTime: 60_000,
  });

  const footerText = settings?.footerText
    ? lv(settings.footerText, settings.footerText_bn)
    : t.footerText;

  const logoUrl  = settings?.logoUrl  || "";
  const siteName = settings?.siteName || "Code Craft BD";

  return (
    <footer className="border-t border-border/30 py-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            {logoUrl ? (
              <Link href="/" className="inline-block mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="h-7 w-auto object-contain max-w-[120px]"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </Link>
            ) : (
              <p className="text-sm font-semibold text-foreground mb-3 gradient-text" suppressHydrationWarning>
                {siteName}
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed" suppressHydrationWarning>{footerText}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Services</p>
            <ul className="space-y-2">
              {[
                { label: t.navServices, to: "/services" },
                { label: t.navPricing, to: "/pricing" },
                { label: t.navPortfolio, to: "/portfolio" },
              ].map((l) => (
                <li key={l.to}>
                  <Link href={l.to} suppressHydrationWarning className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <span suppressHydrationWarning>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Company</p>
            <ul className="space-y-2">
              {[
                { label: t.navAbout ?? "About", to: "/about" },
                { label: t.navTeam, to: "/team" },
                { label: t.navWhyUs, to: "/why-us" },
                { label: t.navContact, to: "/contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link href={l.to} suppressHydrationWarning className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <span suppressHydrationWarning>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Legal</p>
            <ul className="space-y-2">
              {[
                { label: t.navPrivacy ?? "Privacy Policy", to: "/privacy" },
                { label: t.navTerms ?? "Terms & Conditions", to: "/terms" },
                { label: t.navFaq ?? "FAQ", to: "/faq" },
              ].map((l) => (
                <li key={l.to}>
                  <Link href={l.to} suppressHydrationWarning className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <span suppressHydrationWarning>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            &copy; {new Date().getFullYear()}{" "}
            <Link href="/" className="gradient-text font-medium hover:opacity-80 transition-opacity" suppressHydrationWarning>{siteName}</Link>
            {" "}&middot; {lv("All rights reserved.", "\u09b8\u09b0\u09cd\u09ac\u09b8\u09cd\u09ac \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4\u0964")}
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" suppressHydrationWarning className="hover:text-foreground transition-colors">
              <span suppressHydrationWarning>{t.navPrivacy ?? "Privacy"}</span>
            </Link>
            <Link href="/terms" suppressHydrationWarning className="hover:text-foreground transition-colors">
              <span suppressHydrationWarning>{t.navTerms ?? "Terms"}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
