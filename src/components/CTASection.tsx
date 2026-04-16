"use client";

import { Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLangValue } from "@/hooks/useLangValue";
import { useQuery } from "@tanstack/react-query";

const CTASection = () => {
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

  // Text — admin setting overrides translation keys
  const heading  = settings?.ctaHeading  ? lv(settings.ctaHeading,  settings.ctaHeading_bn)  : `${t.ctaHeading1} ${t.ctaHeadingHighlight} ${t.ctaHeading2}`;
  const desc     = settings?.ctaDesc     ? lv(settings.ctaDesc,     settings.ctaDesc_bn)     : t.ctaDesc;
  const btn1Text = settings?.ctaBtn1Text ? lv(settings.ctaBtn1Text, settings.ctaBtn1Text_bn) : t.ctaCta1;
  const btn2Text = settings?.ctaBtn2Text ? lv(settings.ctaBtn2Text, settings.ctaBtn2Text_bn) : t.ctaCta2;

  // Links — admin setting with safe defaults
  const btn1Url = (settings?.ctaBtn1Url || "/contact")   as string;
  const btn2Url = (settings?.ctaBtn2Url || "/portfolio") as string;

  return (
    <section className="py-10 md:py-14 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[200px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div
          className="glass-card p-10 md:p-16 text-center max-w-4xl mx-auto border-primary/20 animate-fade-in-up"
          style={{ animationFillMode: "both" }}
        >
          <h2 className="section-heading text-3xl md:text-5xl mb-6" suppressHydrationWarning>
            {settings?.ctaHeading ? (
              <span className="gradient-text" suppressHydrationWarning>{heading}</span>
            ) : (
              <>
                {t.ctaHeading1}{" "}
                <span className="gradient-text">{t.ctaHeadingHighlight}</span>{" "}
                {t.ctaHeading2}
              </>
            )}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed" suppressHydrationWarning>
            {desc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={btn1Url}
              className="btn-primary-glow inline-flex items-center justify-center gap-2 text-base animate-pulse-cta"
              suppressHydrationWarning
            >
              <Phone size={20} />
              <span suppressHydrationWarning>{btn1Text}</span>
            </Link>
            <Link
              href={btn2Url}
              className="btn-secondary-outline inline-flex items-center justify-center gap-2 text-base"
              suppressHydrationWarning
            >
              <span suppressHydrationWarning>{btn2Text}</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
