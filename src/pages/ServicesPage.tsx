"use client";

import { ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLangValue } from "@/hooks/useLangValue";
import { useServices } from "@/hooks/useServices";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Skeleton } from "@/components/ui/skeleton";

const categoryIcons: Record<string, string> = {
  development: "💻",
  automation: "🤖",
  marketing: "📈",
  design: "🎨",
};

const ServicesPage = () => {
  const { t } = useLanguage();
  const lv = useLangValue();
  const { data: services, isLoading } = useServices();
  const { formatPrice } = useCurrency();

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-10 relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div
            className="text-center mb-10 animate-fade-in-up"
            style={{ animationFillMode: "both" }}
          >
            <p className="text-sm uppercase tracking-widest text-primary mb-3">{t.servicesTag}</p>
            <h1 className="section-heading">
              {t.servicesHeading} <span className="gradient-text">{t.servicesHeadingHighlight}</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Choose a service to explore our packages and find the right fit for your project.
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" data-testid={`skeleton-service-${i}`} />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {(services || []).map((svc, i) => (
                <div
                  key={svc.id}
                  className="glass-card-hover p-8 group glow-border flex flex-col animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
                  data-testid={`card-service-${svc.id}`}
                >
                  {svc.imageUrl ? (
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={svc.imageUrl}
                        alt={svc.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading={i === 0 ? "eager" : "lazy"}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-36 rounded-xl mb-4 bg-primary/5 border border-primary/10 flex items-center justify-center text-4xl">
                      {categoryIcons[svc.category] || "🔧"}
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                      <Tag size={10} />
                      {svc.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-foreground" data-testid={`text-service-title-${svc.id}`}>
                    {lv(svc.title, (svc as unknown as Record<string,string>).title_bn)}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                    {lv(svc.description, (svc as unknown as Record<string,string>).description_bn)}
                  </p>

                  {(svc.startingPrice || (svc.packages && svc.packages.length > 0)) && (
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-xs text-muted-foreground">Starting from</span>
                      <span className="font-bold gradient-text">
                        {formatPrice(
                          svc.startingPrice
                            ? parseFloat(svc.startingPrice)
                            : Math.min(...(svc.packages || []).map((p) => parseFloat(p.price)))
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-auto">
                    <Link
                      href={`/services/${svc.slug}`}
                      className="btn-primary-glow !px-4 !py-2 text-sm inline-flex items-center gap-2 flex-1 justify-center"
                      data-testid={`link-view-packages-${svc.id}`}
                    >
                      View Packages
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ServicesPage;
