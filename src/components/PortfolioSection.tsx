"use client";
import { ExternalLink, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLangValue } from "@/hooks/useLangValue";
import { useQuery } from "@tanstack/react-query";

interface PortfolioItem {
  id: string;
  category: string;
  title: string; title_bn?: string;
  tagline: string; tagline_bn?: string;
  description: string; description_bn?: string;
  image: string;
  tags: string[];
  metric: string; metric_bn?: string;
  year: string;
  liveUrl?: string;
}

const PortfolioSection = () => {
  const { t } = useLanguage();
  const lv = useLangValue();

  const { data: items = [] } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio-preview"],
    queryFn: async () => {
      const r = await fetch("/api/admin/portfolio");
      if (!r.ok) return [];
      const all: PortfolioItem[] = await r.json();
      return all.slice(0, 4); // show first 4 on homepage
    },
    staleTime: 60_000,
  });

  if (items.length === 0) return null;

  return (
    <section id="portfolio" className="py-10 md:py-14 relative">
      <div className="absolute inset-0 mesh-gradient opacity-50" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-10 animate-fade-in-up" style={{ animationFillMode: "both" }}>
          <p className="text-sm uppercase tracking-widest text-secondary mb-3">{t.portfolioTag}</p>
          <h2 className="section-heading">
            {t.portfolioHeading} <span className="gradient-text">{t.portfolioHeadingHighlight}</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {items.map((project, i) => (
            <div
              key={project.id}
              className="glass-card-hover group cursor-pointer relative overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={lv(project.title, project.title_bn)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              </div>

              <div className="p-8 relative">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ExternalLink size={18} className="text-primary" />
                </div>

                <span className="text-xs uppercase tracking-widest text-primary font-medium">
                  {project.category}
                </span>
                <h3 className="text-2xl font-bold mt-2 mb-3 text-foreground">
                  {lv(project.title, project.title_bn)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {lv(project.tagline, project.tagline_bn)}
                </p>

                <div className="flex items-center gap-2 mb-5 text-secondary text-sm font-medium">
                  <TrendingUp size={16} />
                  {lv(project.metric, project.metric_bn)}
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tech-badge text-xs !py-1 !px-3">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
