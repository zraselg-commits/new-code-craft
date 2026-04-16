import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLangValue } from "@/hooks/useLangValue";
import { useServices } from "@/hooks/useServices";
import { Skeleton } from "@/components/ui/skeleton";

const categoryIcons: Record<string, string> = {
  development: "💻",
  automation: "🤖",
  marketing: "📈",
  design: "🎨",
};

const ServicesSection = () => {
  const { t } = useLanguage();
  const lv = useLangValue();
  const { data: services, isLoading } = useServices();

  return (
    <section id="services" className="py-10 md:py-14 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 animate-fade-in-up">
          <p className="text-sm uppercase tracking-widest text-primary mb-3">{t.servicesTag}</p>
          <h2 className="section-heading">
            {t.servicesHeading} <span className="gradient-text">{t.servicesHeadingHighlight}</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(services || []).map((service, i) => (
              <div
                key={service.id}
                className="glass-card-hover p-8 group glow-border animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
                data-testid={`card-service-home-${service.id}`}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-2xl transition-all duration-500 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] group-hover:scale-110">
                  {categoryIcons[service.category] || "🔧"}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  {lv(service.title, (service as unknown as Record<string, string>).title_bn)}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm mb-4 line-clamp-3">
                  {lv(service.description, (service as unknown as Record<string, string>).description_bn)}
                </p>
                <Link
                  href={`/services/${service.slug}`}
                  className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all"
                  data-testid={`link-service-detail-${service.id}`}
                >
                  {t.svcLearnMore} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
