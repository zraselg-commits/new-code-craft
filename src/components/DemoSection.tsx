"use client";

import { useState, useCallback, useEffect } from "react";
import { ExternalLink, TrendingUp, ArrowRight, X, Tag,
  Globe, ShoppingCart, Smartphone, Brain, PenTool, BarChart3, Layers,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLangValue } from "@/hooks/useLangValue";
import { useQuery } from "@tanstack/react-query";

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
  isActive?: boolean;
}

/* ── Category → icon map (same as PortfolioPage) ── */
const ICON_MAP: Record<string, React.ElementType> = {
  "E-Commerce": ShoppingCart, Web: Globe, Mobile: Smartphone,
  AI: Brain, SEO: BarChart3, Design: PenTool, Default: Layers,
};
const getIcon = (cat: string) => ICON_MAP[cat] ?? ICON_MAP.Default;

/* ── Detail Modal (identical to PortfolioPage's ProjectModal) ── */
function ProjectModal({
  project, onClose, lv,
}: {
  project: PortfolioItem;
  onClose: () => void;
  lv: (en?: string | null, bn?: string | null) => string;
}) {
  const Icon        = getIcon(project.category);
  const title       = lv(project.title,       project.title_bn);
  const tagline     = lv(project.tagline,     project.tagline_bn);
  const description = lv(project.description, project.description_bn);
  const metric      = lv(project.metric,      project.metric_bn);
  const featuresDisplay: string[] = project.features_bn?.length
    ? project.features.map((f, i) => lv(f, project.features_bn?.[i]))
    : project.features ?? [];

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background border border-border/40 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-background/80 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow"
        >
          <X size={16} />
        </button>

        {/* Infinite-scroll screenshot banner */}
        <div className="relative h-52 md:h-72 overflow-hidden rounded-t-2xl bg-muted/20 group/banner">
          {project.image ? (
            <>
              <div className="absolute inset-x-0 top-0 animate-scroll-banner will-change-transform"
                style={{ animationDuration: "18s", animationTimingFunction: "linear", animationIterationCount: "infinite" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.image} alt={title} className="w-full object-cover object-top" style={{ height: "560px" }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.image} alt="" className="w-full object-cover object-top" style={{ height: "560px" }} aria-hidden="true" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 text-[10px] font-medium pointer-events-none">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                Scrolling Preview
              </div>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover/banner:opacity-100 transition-all duration-300 bg-black/30 backdrop-blur-[2px]"
                  onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-bold shadow-[0_0_24px_rgba(16,185,129,0.6)] hover:bg-emerald-400 transition-colors">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                    </span>
                    <span suppressHydrationWarning>{lv("Open Live Site", "লাইভ সাইট খুলুন")}</span>
                    <ExternalLink size={14} />
                  </div>
                  <span className="text-white/60 text-xs" suppressHydrationWarning>{lv("Click to visit", "ক্লিক করুন")}</span>
                </a>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon size={64} className="text-muted-foreground/20" />
            </div>
          )}
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
              <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight" suppressHydrationWarning>{title}</h2>
              <p className="text-muted-foreground text-sm mt-1" suppressHydrationWarning>{tagline}</p>
            </div>
          </div>

          <p className="text-foreground/80 leading-relaxed mb-6 text-sm md:text-base" suppressHydrationWarning>{description}</p>

          {featuresDisplay.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider" suppressHydrationWarning>
                {lv("Key Features", "মূল বৈশিষ্ট্য")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {featuresDisplay.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span suppressHydrationWarning>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={13} className="text-muted-foreground" /> <span suppressHydrationWarning>{lv("Tech Stack", "প্রযুক্তিসমূহ")}</span>
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
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
                <span suppressHydrationWarning>{lv("🚀 Open Live Site", "🚀 লাইভ সাইট খুলুন")}</span>
                <ExternalLink size={16} className="transition-transform group-hover/live:translate-x-1 group-hover/live:-translate-y-1" />
              </a>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/contact" className="btn-primary-glow flex-1 inline-flex items-center justify-center gap-2 text-sm" suppressHydrationWarning>
                {lv("Build Something Similar", "একই ধরনের কিছু তৈরি করুন")} <ArrowRight size={14} />
              </a>
              <button onClick={onClose}
                className="flex-1 px-4 py-2 rounded-xl border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all" suppressHydrationWarning>
                ← {lv("Back", "ফিরে যান")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ DemoSection ═══════════════════════════════════════════════════════════ */
const DemoSection = () => {
  const { t } = useLanguage();
  const lv = useLangValue();

  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const closeModal = useCallback(() => setSelected(null), []);

  // Lock body scroll when modal open
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected, closeModal]);

  const { data: allItems = [] } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"],
    queryFn: async () => {
      const r = await fetch("/api/portfolio");
      if (!r.ok) return [];
      return r.json();
    },
    staleTime: 60_000,
  });

  // One demo per category
  const seenCategories = new Set<string>();
  const demos: PortfolioItem[] = [];
  for (const item of allItems) {
    if (item.isActive === false) continue;
    const cat = (item.category || "").trim();
    if (!cat || seenCategories.has(cat)) continue;
    seenCategories.add(cat);
    demos.push(item);
  }

  if (demos.length === 0) return null;

  return (
    <>
      <section id="demos" className="py-10 md:py-14 relative">
        <div className="absolute inset-0 mesh-gradient opacity-50" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Heading */}
          <div className="text-center mb-10 animate-fade-in-up" style={{ animationFillMode: "both" }}>
            <p className="text-sm uppercase tracking-widest text-secondary mb-3" suppressHydrationWarning>
              {lv("Our Work", "আমাদের কাজ")}
            </p>
            <h2 className="section-heading" suppressHydrationWarning>
              {lv("Service", "সেবা")} <span className="gradient-text">{lv("Demos", "ডেমোসমূহ")}</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm" suppressHydrationWarning>
              {lv(
                "Explore one live demo from each of our service categories. Click any card to see the full case study.",
                "আমাদের প্রতিটি সেবা বিভাগ থেকে একটি করে লাইভ ডেমো দেখুন। বিস্তারিত দেখতে যেকোনো কার্ডে ক্লিক করুন।"
              )}
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {demos.map((project, i) => {
              const Icon    = getIcon(project.category);
              const title   = lv(project.title,   project.title_bn);
              const tagline = lv(project.tagline,  project.tagline_bn) || lv(project.description, project.description_bn);
              const metric  = lv(project.metric,   project.metric_bn);

              return (
                <div
                  key={project.id}
                  onClick={() => setSelected(project)}
                  className="glass-card-hover group cursor-pointer relative overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelected(project)}
                  aria-label={title}
                >
                  {/* Image */}
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={project.image}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

                    {/* Category badge */}
                    <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-[10px] uppercase tracking-wider font-semibold text-primary">
                      <Icon size={10} /> {project.category}
                    </span>

                    {/* Hover CTA overlay */}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-semibold text-foreground shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300" suppressHydrationWarning>
                        {lv("View Case Study", "বিস্তারিত দেখুন")} <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 relative">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={18} className="text-primary" />
                      </a>
                    )}

                    <h3 className="text-2xl font-bold mt-2 mb-3 text-foreground" suppressHydrationWarning>{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4" suppressHydrationWarning>{tagline}</p>

                    {metric && (
                      <div className="flex items-center gap-2 mb-5 text-secondary text-sm font-medium" suppressHydrationWarning>
                        <TrendingUp size={16} /> {metric}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tech-badge text-xs !py-1 !px-3">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View full portfolio */}
          <div className="text-center mt-10">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 btn-secondary-outline px-6 py-3 text-sm font-semibold"
              suppressHydrationWarning
            >
              {lv("View Full Portfolio", "সম্পূর্ণ পোর্টফোলিও দেখুন")}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {selected && <ProjectModal project={selected} onClose={closeModal} lv={lv} />}
    </>
  );
};

export default DemoSection;
