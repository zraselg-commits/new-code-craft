"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Tag, Layers } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import { useService } from "@/hooks/useServices";
import { useLangValue } from "@/hooks/useLangValue";
import { Skeleton } from "@/components/ui/skeleton";

const categoryIcons: Record<string, string> = {
  development: "💻",
  automation: "🤖",
  marketing: "📈",
  design: "🎨",
};

const ServiceDetailPage = () => {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const { data: service, isLoading, isError } = useService(slug || "");
  const lv = useLangValue();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-24 pb-10">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-12 w-2/3 mb-4" />
            <Skeleton className="h-20 w-full mb-12" />
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-24 pb-10 flex items-center justify-center">
          <div className="text-center glass-card p-12 max-w-md mx-6">
            <p className="text-4xl mb-4">🔍</p>
            <h2 className="text-xl font-bold text-foreground mb-3">Service Not Found</h2>
            <p className="text-muted-foreground mb-6">This service doesn't exist or has been removed.</p>
            <Link href="/services" className="btn-primary-glow inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              View All Services
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const sortedPackages = [...(service.packages || [])].sort((a, b) => {
    const order = { basic: 0, standard: 1, premium: 2 };
    return (order[a.tier as keyof typeof order] ?? 3) - (order[b.tier as keyof typeof order] ?? 3);
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-10 relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">

          <div
            className="mb-8 animate-fade-in-up"
            style={{ animationFillMode: "both" }}
          >
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
              data-testid="link-back-to-services"
            >
              <ArrowLeft size={14} />
              All Services
            </Link>

            {service.imageUrl && (
              <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 bg-muted border border-border/50 relative">
                <Image
                  src={service.imageUrl}
                  alt={service.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                <Tag size={11} />
                {categoryIcons[service.category] || "🔧"} {service.category}
              </span>
              {service.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/50">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="section-heading text-3xl md:text-4xl mb-4" data-testid="text-service-title">
              {lv(service.title, (service as unknown as Record<string,string>).title_bn)}
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl" data-testid="text-service-description">
              {lv(service.description, (service as unknown as Record<string,string>).description_bn)}
            </p>
          </div>

          <div
            className="mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Layers size={18} className="text-primary" />
              <h2 className="text-xl font-bold text-foreground">Choose Your Package</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-start">
              {sortedPackages.map((pkg, i) => (
                <PackageCard key={pkg.id} pkg={pkg} service={service} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ServiceDetailPage;
