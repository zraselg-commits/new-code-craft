"use client";

import { useState, useCallback, useEffect } from "react";
import {
  X, TrendingUp, ArrowRight, Tag,
  Globe, ShoppingCart, Smartphone, Brain, PenTool, BarChart3,
  Layers, RefreshCw, ExternalLink,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLangValue } from "@/hooks/useLangValue";
import { useQuery } from "@tanstack/react-query";

/* ── Types ──────────────────────────────────────────────────────────── */
interface PortfolioItem {
  id: string;
  category: string;
  title: string;       title_bn?: string;
  tagline: string;     tagline_bn?: string;
  description: string; description_bn?: string;
  image: string;
  tags: string[];
  metric: string;      metric_bn?: string;
  features: string[];  features_bn?: string[];
  year: string;
  liveUrl?: string;
  active?: boolean;
}

/* ── Category → icon map ─────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  "E-Commerce": ShoppingCart,
  Web: Globe,
  Mobile: Smartphone,
  AI: Brain,
  SEO: BarChart3,
  Design: PenTool,
  Default: Layers,
};
const getIcon = (cat: string) => ICON_MAP[cat] ?? ICON_MAP.Default;

/* ── Skeleton card ───────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="rounded-2xl bg-muted/20 border border-border/30 overflow-hidden animate-pulse">
    <div className="h-44 bg-muted/40" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-muted/40 rounded w-1/3" />
      <div className="h-4 bg-muted/40 rounded w-3/4" />
      <div className="h-3 bg-muted/40 rounded w-full" />
      <div className="h-3 bg-muted/40 rounded w-5/6" />
    </div>
  </div>
);

/* ── Project Detail Modal ────────────────────────────────────────── */
function ProjectModal({
  project, onClose, lv,
}: {
  project: PortfolioItem;
  onClose: () => void;
  lv: (en?: string | null, bn?: string | null) => string;
}) {
  const Icon = getIcon(project.category);
  const title       = lv(project.title,       project.title_bn);
  const tagline     = lv(project.tagline,     project.tagline_bn);
  const description = lv(project.description, project.description_bn);
  const metric      = lv(project.metric,      project.metric_bn);
  const featuresDisplay: string[] = project.features_bn?.length
    ? project.features.map((f, i) => lv(f, project.features_bn?.[i]))
    : project.features;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background border border-border/40 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-background/80 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow"
        >
          <X size={16} />
        </button>

        {/* ── Infinite-scroll screenshot banner ── */}
        <div className="relative h-56 md:h-72 overflow-hidden rounded-t-2xl bg-muted/20 group/banner">
          {project.image ? (
            <>
              {/* Scrolling container — image duplicated for seamless loop */}
              <div className="absolute inset-x-0 top-0 animate-scroll-banner will-change-transform"
                style={{ animationDuration: "18s", animationTimingFunction: "linear", animationIterationCount: "infinite" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.image} alt={title}
                  className="w-full object-cover object-top"
                  style={{ height: "600px" }} />
                {/* Duplicate for seamless loop */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.image} alt=""
                  className="w-full object-cover object-top"
                  style={{ height: "600px" }} aria-hidden="true" />
              </div>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
              {/* Scroll indicator badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 text-[10px] font-medium pointer-events-none">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
                Scrolling Preview
              </div>
              {/* Live preview CTA overlay — shows on hover */}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover/banner:opacity-100 transition-all duration-300 bg-black/30 backdrop-blur-[2px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-bold shadow-[0_0_24px_rgba(16,185,129,0.6)] hover:bg-emerald-400 transition-colors">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                    </span>
                    <span suppressHydrationWarning>{lv("Open Live Site", "লাইভ সাইট খুলুন")}</span>
                    <ExternalLink size={14} />
                  </div>
                  <span className="text-white/60 text-xs" suppressHydrationWarning>{lv("Click to visit", "ক্লিক করতে")}</span>
                </a>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon size={64} className="text-muted-foreground/20" />
            </div>
          )}
          {/* Metric badge */}
          <div className="absolute bottom-4 left-6 pointer-events-none">
            <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border/40 shadow-lg">
              <TrendingUp size={14} className="text-primary" />
              <span className="text-sm font-bold text-primary" suppressHydrationWarning>{metric}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold">{project.category}</span>
                <span className="text-xs text-muted-foreground">· {project.year}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{title}</h2>
              <p className="text-muted-foreground text-sm mt-1">{tagline}</p>
            </div>
          </div>

          <p className="text-foreground/80 leading-relaxed mb-6 text-sm md:text-base">{description}</p>

          {featuresDisplay.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider" suppressHydrationWarning>{lv("Key Features", "\u09ae\u09c2\u09b2 \u09ac\u09c8\u09b6\u09bf\u09b7\u09cd\u099f\u09cd\u09af")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {featuresDisplay.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={13} className="text-muted-foreground" /> <span suppressHydrationWarning>{lv("Tech Stack", "\u09aa\u09cd\u09b0\u09af\u09c1\u0995\u09cd\u09a4\u09bf\u09b8\u09ae\u09c2\u09b9")}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-foreground font-medium">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/live w-full inline-flex items-center justify-center gap-3 py-4 rounded-xl
                  bg-emerald-500 hover:bg-emerald-400
                  text-white font-bold text-sm tracking-wide
                  shadow-[0_4px_20px_rgba(16,185,129,0.45)] hover:shadow-[0_6px_32px_rgba(16,185,129,0.7)]
                  border border-emerald-400/40 hover:border-emerald-300
                  transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {/* Animated live dot */}
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
                <span suppressHydrationWarning className="flex items-center gap-2">
                  {lv("🚀 Open Live Site", "🚀 লাইভ সাইট খুলুন")}
                </span>
                <ExternalLink size={16} className="transition-transform group-hover/live:translate-x-1 group-hover/live:-translate-y-1" />
              </a>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/contact" className="btn-primary-glow flex-1 inline-flex items-center justify-center gap-2 text-sm" suppressHydrationWarning>
                {lv("Build Something Similar", "একই ধরনের কিছু তৈরি করুন")} <ArrowRight size={14} />
              </a>
              <button onClick={onClose}
                className="flex-1 px-4 py-2 rounded-xl border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all" suppressHydrationWarning>
                ← {lv("Back to Demo", "ডেমো তালিকায় ফিরুন")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
const PortfolioPage = () => {
  const { t } = useLanguage();
  const lv = useLangValue();

  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  /* Fetch from public API (synced with admin panel) */
  const { data: projects = [], isLoading, isError } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"],
    queryFn: async () => {
      const r = await fetch("/api/portfolio");
      if (!r.ok) throw new Error("Failed");
      const all: PortfolioItem[] = await r.json();
      // Only show items that aren't explicitly marked inactive
      return all.filter((p) => p.active !== false);
    },
    staleTime: 60_000,
  });

  /* Build category list from actual data */
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  const filtered = activeCategory === "All"
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  /* Close modal on ESC / body scroll lock */
  const closeModal = useCallback(() => setSelected(null), []);
  useEffect(() => {
    if (!selected) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [selected, closeModal]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Page header ── */}
      <section className="pt-24 pb-10 relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">

          <div className="text-center mb-10 animate-fade-in-up">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              {t.portfolioTag ?? "Our Work"}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              {t.portfolioHeading ?? "Portfolio"}{" "}
              <span className="gradient-text">{t.portfolioHeadingHighlight ?? "Showcase"}</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base" suppressHydrationWarning>
              {lv("Real projects. Real results. Click any card to see the full case study.", "বাস্তব প্রজেক্ট, বাস্তব ফলাফল। যেকোনো কার্ডে ক্লিক করুন।")}
            </p>
          </div>

          {/* ── Category filter (built from live data) ── */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.4)]"
                    : "bg-muted/30 text-muted-foreground border-border/40 hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Grid ── */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} />)}
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <RefreshCw size={32} className="text-muted-foreground/30 mx-auto mb-3 animate-spin" />
              <p className="text-muted-foreground text-sm">Failed to load portfolio. Please refresh.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((project, i) => {
                const Icon = getIcon(project.category);
                const title   = lv(project.title,   project.title_bn);
                const tagline = lv(project.tagline,  project.tagline_bn);
                const metric  = lv(project.metric,   project.metric_bn);

                return (
                  <div
                    key={project.id}
                    onClick={() => setSelected(project)}
                    className="group glass-card-hover cursor-pointer overflow-hidden relative animate-fade-in-up rounded-2xl border border-border/30 hover:border-primary/30 transition-colors"
                    style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
                  >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden bg-muted/30">
                      {project.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.image}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon size={40} className="text-muted-foreground/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

                      {/* Category badge */}
                      <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-[10px] uppercase tracking-wider font-semibold text-primary">
                        <Icon size={10} />
                        {project.category}
                      </span>

                      {/* Hover CTA */}
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-foreground shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300" suppressHydrationWarning>
                          {lv("View Case Study", "\u09ac\u09bf\u09b8\u09cd\u09a4\u09be\u09b0\u09bf\u09a4 \u09a6\u09c7\u0996\u09c1\u09a8")} <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-foreground text-sm leading-snug mb-1 line-clamp-1">{title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{tagline}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                          <TrendingUp size={11} />
                          {metric}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{project.year}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 border border-border/40 text-muted-foreground">{tag}</span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 border border-border/40 text-muted-foreground">+{project.tags.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm" suppressHydrationWarning>
              {lv("No projects in this category yet. Check back soon!", "\u098f\u0987 \u09ac\u09bf\u09ad\u09be\u0997\u09c7 \u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09aa\u09cd\u09b0\u099c\u09c7\u0995\u09cd\u099f \u09a8\u09c5\u0987\u0964 \u09b6\u09c0\u0998\u09cd\u09b0\u0987 \u0986\u09b8\u09ac\u09c7!")}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* ══ Detail Modal ══════════════════════════════════════════════════ */}
      {selected && (
        <ProjectModal project={selected} onClose={closeModal} lv={lv} />
      )}

    </div>
  );
};

export default PortfolioPage;
