"use client";

import { ArrowRight, Phone, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLangValue } from "@/hooks/useLangValue";
import { useCountUp } from "@/hooks/useCountUp";
import { useQuery } from "@tanstack/react-query";

const DOTS = [
  { top: "8%",  left: "6%",  size: "w-1.5 h-1.5", opacity: "opacity-30" },
  { top: "14%", left: "82%", size: "w-1 h-1",     opacity: "opacity-20" },
  { top: "28%", left: "4%",  size: "w-1 h-1",     opacity: "opacity-25" },
  { top: "42%", left: "93%", size: "w-2 h-2",     opacity: "opacity-15" },
  { top: "55%", left: "10%", size: "w-1 h-1",     opacity: "opacity-20" },
  { top: "68%", left: "87%", size: "w-1.5 h-1.5", opacity: "opacity-25" },
  { top: "76%", left: "22%", size: "w-1 h-1",     opacity: "opacity-20" },
  { top: "88%", left: "70%", size: "w-1 h-1",     opacity: "opacity-15" },
  { top: "20%", left: "48%", size: "w-1 h-1",     opacity: "opacity-10" },
  { top: "62%", left: "55%", size: "w-1.5 h-1.5", opacity: "opacity-15" },
  { top: "38%", left: "75%", size: "w-1 h-1",     opacity: "opacity-20" },
  { top: "82%", left: "38%", size: "w-1 h-1",     opacity: "opacity-15" },
];

const STATS = [
  { value: "50+", labelKey: "statsProjects",    color: "#FF4B4B" },
  { value: "30+", labelKey: "statsClients",     color: "#14B8A6" },
  { value: "99%", labelKey: "statsSatisfaction", color: "#FF8C00" },
  { value: "24/7", labelKey: "statsSupport",    color: "#0EA5E9" },
];

const REVIEWS = [
  { avatar: "AR", name: "Arif Rahman",     stars: 5, text: "Sales increased by 40% within the first month!" },
  { avatar: "NA", name: "Dr. Nasrin Akter",stars: 5, text: "Patient management has never been this smooth." },
  { avatar: "TH", name: "Tanvir Hossain",  stars: 5, text: "Delivered well beyond expectations. Game-changer!" },
  { avatar: "SA", name: "Sakib Al Hasan",  stars: 5, text: "Our food delivery app went live in just 3 weeks." },
  { avatar: "FB", name: "Fatema Begum",    stars: 5, text: "Organic traffic doubled in 2 months. We rank #1!" },
];

const SOCIALS = [
  {
    label: "WhatsApp",
    href: "https://wa.me/8801XXXXXXXXX",
    color: "#25D366",
    svg: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  },
  {
    label: "Telegram",
    href: "https://t.me/codecraftbd",
    color: "#0088CC",
    svg: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
  },
  {
    label: "Facebook",
    href: "https://facebook.com/codecraftbd",
    color: "#1877F2",
    svg: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/codecraftbd",
    color: "#0A66C2",
    svg: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  },
];

const HeroCountUp = ({ end, suffix, label }: { end: number; suffix: string; label: string }) => {
  const { count, ref } = useCountUp(end, 1800);
  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{count}{suffix}</div>
      <div className="text-[11px] text-gray-500 dark:text-white/40 mt-1 uppercase tracking-wider" suppressHydrationWarning>{label}</div>
    </div>
  );
};

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
};

function ReviewsPopup({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 z-50 w-72 rounded-2xl shadow-2xl border border-white/10
        bg-white dark:bg-[#111] backdrop-blur-xl overflow-hidden"
      style={{ animation: "slideUpFade 220ms ease both" }}
    >
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-gray-100 dark:border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-widest font-semibold text-gray-400 dark:text-white/40">
            Client Reviews
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#FF4B4B]/10 text-[#FF4B4B] text-[10px] font-bold">
            5.0 ★
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={13} />
        </button>
      </div>

      {/* Review notifications list */}
      <div className="divide-y divide-gray-50 dark:divide-white/5">
        {REVIEWS.map((r, i) => (
          <div
            key={r.avatar}
            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-colors"
            style={{ animation: `slideUpFade ${180 + i * 40}ms ease both` }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4B4B]/80 to-[#FF8C00]/80 flex items-center justify-center shrink-0 text-white text-[10px] font-bold">
              {r.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-xs font-semibold text-gray-800 dark:text-white/90 truncate">{r.name}</span>
                <span className="text-[10px] text-[#FF4B4B] shrink-0">{"★".repeat(r.stars)}</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-white/45 leading-snug line-clamp-2">{r.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-gray-50/70 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
        <p className="text-[10px] text-center text-gray-400 dark:text-white/30">
          All reviews verified ✓ &nbsp;·&nbsp; 100% satisfaction rate
        </p>
      </div>
    </div>
  );
}

function StatsPopup({
  anchor, onClose, t, lv,
}: {
  anchor: "bottom-left" | "top-right";
  onClose: () => void;
  t: Record<string, string>;
  lv: (en?: string | null, bn?: string | null) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const posClass =
    anchor === "bottom-left"
      ? "bottom-full left-0 mb-2"
      : "top-full right-0 mt-2";

  return (
    <div
      ref={ref}
      className={`absolute ${posClass} z-50 w-72 rounded-2xl shadow-2xl border border-white/10
        bg-white dark:bg-[#111] backdrop-blur-xl overflow-hidden animate-fade-in-up`}
      style={{ animationDuration: "180ms" }}
    >
      {/* Header */}
      <div className="px-4 pt-3 pb-2.5 border-b border-gray-100 dark:border-white/8 flex items-center justify-between bg-gradient-to-r from-emerald-50/60 to-transparent dark:from-emerald-900/10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400" suppressHydrationWarning>
            {lv("Available for new projects", "নতুন প্রজেক্টের জন্য প্রস্তুত")}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors rounded-lg p-0.5 hover:bg-gray-100 dark:hover:bg-white/10"
          aria-label="Close"
        >
          <X size={13} />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-white/5">
        {STATS.map((s) => (
          <div key={s.labelKey} className="flex flex-col items-center justify-center py-4 px-3 bg-white dark:bg-[#111]">
            <span className="text-2xl font-black" style={{ color: s.color }}>{s.value}</span>
            <span className="text-[11px] text-gray-500 dark:text-white/45 mt-1 text-center leading-tight" suppressHydrationWarning>
              {String(t[s.labelKey] ?? s.labelKey)}
            </span>
          </div>
        ))}
      </div>

      {/* Socials */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-white/8">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/35 mb-2 text-center" suppressHydrationWarning>
          {lv("Connect with us", "যোগাযোগ করুন")}
        </p>
        <div className="flex gap-2 mb-3">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex-1 flex items-center justify-center h-9 rounded-xl border border-gray-100 dark:border-white/8 text-gray-500 dark:text-white/50 transition-all duration-200 hover:scale-105"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = s.color;
                (e.currentTarget as HTMLElement).style.borderColor = s.color + "40";
                (e.currentTarget as HTMLElement).style.background = s.color + "15";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "";
                (e.currentTarget as HTMLElement).style.borderColor = "";
                (e.currentTarget as HTMLElement).style.background = "";
              }}
            >
              {s.svg}
            </a>
          ))}
        </div>
        <a
          href="/contact"
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary text-[11px] font-semibold transition-all duration-200" suppressHydrationWarning
        >
          {lv("→ Start a Project", "→ প্রজেক্ট শুরু করুন")}
        </a>
      </div>
    </div>
  );
}

const HeroSection = () => {
  const { t } = useLanguage();
  const lv = useLangValue();
  const reducedMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const words = t.typewriterWords;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch site settings for bilingual hero content
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings-public"],
    queryFn: async () => {
      const r = await fetch("/api/settings-public");
      if (!r.ok) return {};
      return r.json();
    },
    staleTime: 60_000,
  });

  // Resolved heading: admin setting > translation keys
  const heroLine1 = settings?.heroHeading
    ? lv(settings.heroHeading, settings.heroHeading_bn)
    : `${t.heroHeading1} ${t.heroHeading2} ${t.heroHeading3}`;

  // Resolved button URLs from settings with safe defaults
  const primaryUrl   = (settings?.heroCtaPrimaryUrl   || "/contact") as string;
  const secondaryUrl = (settings?.heroCtaSecondaryUrl || "/portfolio") as string;

  useEffect(() => {
    if (reducedMotion) return;
    const currentWord = words[wordIndex];
    timeoutRef.current = setTimeout(
      () => {
        if (!isDeleting) {
          if (charIndex < currentWord.length) {
            setCharIndex((c) => c + 1);
          } else {
            setTimeout(() => setIsDeleting(true), 1500);
          }
        } else {
          if (charIndex > 0) {
            setCharIndex((c) => c - 1);
          } else {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? 40 : 80
    );
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [charIndex, isDeleting, wordIndex, words, reducedMotion]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 bg-gray-50 dark:bg-[#050505] transition-colors duration-300">

      {/* Decorative floating dots */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {DOTS.map((dot, i) => (
          <span
            key={i}
            className={`absolute rounded-full bg-gray-400 dark:bg-white ${dot.size} ${dot.opacity}`}
            style={{ top: dot.top, left: dot.left }}
          />
        ))}
      </div>

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04] dark:opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute inset-0 z-0 opacity-0 dark:opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Left: Text ── */}
          <div className="flex flex-col order-1">

            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-3 mb-8 animate-fade-in-up"
              style={{ animationDelay: "0ms" }}
            >
              <span className="w-10 h-px bg-[#FF4B4B]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FF4B4B]">
                Digital Agency
              </span>
              <span className="w-10 h-px bg-[#FF4B4B]" />
            </div>

            {/* Headline — uses admin hero heading if set, otherwise translation */}
            <h1
              className="text-[1.85rem] sm:text-4xl lg:text-5xl xl:text-[4.5rem] font-black leading-[1.1] mb-5 animate-fade-in-up text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", animationDelay: "100ms" }}
              suppressHydrationWarning
            >
              {settings?.heroHeading ? (
                /* Admin-configured heading renders as a single block */
                <span
                  style={{
                    background: "linear-gradient(120deg, #FF4B4B 0%, #FF8C00 45%, #14B8A6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 0 20px rgba(255,75,75,0.3))",
                    display: "inline",
                  }}
                  suppressHydrationWarning
                >
                  {heroLine1}
                </span>
              ) : (
                /* Default 3-line layout using translation keys */
                <>
                  {t.heroHeading1}
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(120deg, #FF4B4B 0%, #FF8C00 45%, #14B8A6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      filter: "drop-shadow(0 0 20px rgba(255,75,75,0.5))",
                      display: "inline-block",
                    }}
                  >
                    {t.heroHeading2}
                  </span>
                  <br />
                  {t.heroHeading3}
                </>
              )}
            </h1>

            {/* Typewriter */}
            <div
              className="flex items-center h-8 mb-6 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <span className="text-base font-semibold text-[#14B8A6]">
                {reducedMotion ? words[0] : words[wordIndex].slice(0, charIndex)}
              </span>
              {!reducedMotion && (
                <span className="inline-block w-0.5 h-5 bg-[#14B8A6] animate-pulse ml-1 rounded-full" />
              )}
            </div>

            {/* Subtitle */}
            <p
              className="text-gray-600 dark:text-white/55 text-base md:text-lg leading-relaxed mb-10 max-w-[480px] animate-fade-in-up"
              style={{ animationDelay: "250ms" }}
            >
              {settings?.heroSubheading
                ? lv(settings.heroSubheading, settings.heroSubheading_bn)
                : "Custom web solutions, AI automation, SEO growth & creative media — built for businesses of every scale."}
            </p>

            {/* CTA buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
              style={{ animationDelay: "350ms" }}
            >
              <Link
                href={primaryUrl}
                data-testid="link-hero-cta-primary"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-[15px] font-bold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: "#FF4B4B",
                  boxShadow: "0 0 30px rgba(255,75,75,0.45), 0 4px 20px rgba(255,75,75,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
                suppressHydrationWarning
              >
                <Phone size={16} />
                <span suppressHydrationWarning>
                  {settings?.heroCtaText ? lv(settings.heroCtaText, settings.heroCtaText_bn) : t.heroCtaPrimary}
                </span>
              </Link>
              <Link
                href={secondaryUrl}
                data-testid="link-hero-cta-secondary"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-[15px] font-semibold transition-all duration-300
                  text-gray-800 border border-gray-300 hover:bg-gray-100
                  dark:text-white/90 dark:border-white/15 dark:hover:border-white/35 dark:hover:bg-white/5 dark:hover:text-white"
                style={{ backdropFilter: "blur(12px)" }}
                suppressHydrationWarning
              >
                <span suppressHydrationWarning>
                  {settings?.heroCtaSecondaryText ? lv(settings.heroCtaSecondaryText, settings.heroCtaSecondaryText_bn) : t.heroCtaSecondary}
                </span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-8 mt-14 animate-fade-in"
              style={{ animationDelay: "500ms" }}
            >
              <HeroCountUp end={50} suffix="+" label={t.heroProjects} />
              <div className="w-px h-10 bg-gray-200 dark:bg-white/10" />
              <HeroCountUp end={30} suffix="+" label={t.heroClients} />
              <div className="w-px h-10 bg-gray-200 dark:bg-white/10" />
              <HeroCountUp end={3} suffix="+" label={t.heroYears} />
            </div>
          </div>

          {/* ── Right: Image + blobs ── */}
          <div
            className="relative order-2 flex items-center justify-center animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            {/* Blob 1 — teal */}
            <div
              className="absolute rounded-full blur-[90px] opacity-40 dark:opacity-50 pointer-events-none"
              style={{ width: 300, height: 300, background: "#14B8A6", top: "-8%", right: "2%" }}
            />
            {/* Blob 2 — red */}
            <div
              className="absolute rounded-full blur-[80px] opacity-35 dark:opacity-45 pointer-events-none"
              style={{ width: 240, height: 240, background: "#FF4B4B", bottom: "2%", right: "5%" }}
            />
            {/* Blob 3 — sky-blue */}
            <div
              className="absolute rounded-full blur-[70px] opacity-25 dark:opacity-35 pointer-events-none"
              style={{ width: 180, height: 180, background: "#0EA5E9", bottom: "25%", left: "-5%" }}
            />
            {/* Blob 4 — orange */}
            <div
              className="absolute rounded-full blur-[60px] opacity-20 dark:opacity-30 pointer-events-none"
              style={{ width: 140, height: 140, background: "#FF8C00", top: "20%", left: "0%" }}
            />

            {/* Image card */}
            <div className="relative z-10 w-full max-w-[460px]">
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl dark:shadow-black/60"
                style={{ outline: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Image
                  src={settings?.heroImageUrl || "/hero-main.jpg"}
                  alt="Creative professionals collaborating with laptops"
                  width={560}
                  height={400}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 560px"
                  className="w-full h-auto object-cover"
                  priority
                  fetchPriority="high"
                  unoptimized={!!(settings?.heroImageUrl && settings.heroImageUrl.startsWith("/uploads/"))}
                />
                <div
                  className="absolute inset-0 pointer-events-none block dark:hidden"
                  style={{ background: "linear-gradient(to bottom, transparent 55%, #f9fafb 100%)" }}
                />
                <div
                  className="absolute inset-0 pointer-events-none hidden dark:block"
                  style={{ background: "linear-gradient(to bottom, transparent 55%, #050505 100%)" }}
                />
              </div>

              {/* Floating availability badge — clickable */}
              <div className="absolute -bottom-5 -left-4 z-20">
                <button
                  data-testid="button-availability-badge"
                  onClick={() => { setAvailabilityOpen((v) => !v); setRatingOpen(false); }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]
                    bg-white/90 border border-gray-200 shadow-lg hover:border-emerald-300 hover:shadow-emerald-100/50
                    dark:bg-[rgba(20,20,20,0.85)] dark:border-white/10 dark:shadow-black/40 dark:hover:border-emerald-500/40"
                  style={{ backdropFilter: "blur(14px)" }}
                >
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 dark:bg-emerald-400" />
                  </span>
                  <span className="text-xs font-medium text-gray-700 dark:text-white/80" suppressHydrationWarning>{lv("Available for new projects", "নতুন প্রজেক্টের জন্য প্রস্তুত")}</span>
                </button>
                {availabilityOpen && (
                  <StatsPopup anchor="bottom-left" onClose={() => setAvailabilityOpen(false)} t={t as unknown as Record<string,string>} lv={lv} />
                )}
              </div>

              {/* Floating rating badge — clickable */}
              <div className="absolute -top-4 -right-4 z-20">
                <button
                  data-testid="button-rating-badge"
                  onClick={() => { setRatingOpen((v) => !v); setAvailabilityOpen(false); }}
                  className="flex flex-col items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]
                    bg-white/90 border border-red-200 shadow-lg hover:shadow-red-100/50
                    dark:bg-[rgba(20,20,20,0.85)] dark:border-[rgba(255,75,75,0.25)] dark:shadow-black/40 dark:hover:border-[rgba(255,75,75,0.5)]"
                  style={{ backdropFilter: "blur(14px)" }}
                >
                  <span className="text-xl font-black text-[#FF4B4B]">5★</span>
                  <span className="text-[10px] text-gray-500 dark:text-white/50 mt-0.5" suppressHydrationWarning>{lv("Client Rating", "ক্লায়েন্ট রেটিং")}</span>
                </button>
                {ratingOpen && (
                  <ReviewsPopup onClose={() => setRatingOpen(false)} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in pointer-events-none"
        style={{ animationDelay: "900ms" }}
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-gray-400 dark:text-white/25">Scroll</span>
        <div className="w-[18px] h-[30px] rounded-full border border-gray-300 dark:border-white/20 flex items-start justify-center pt-[5px]">
          <div className="w-1 h-1.5 rounded-full bg-gray-400 dark:bg-white/40 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
