"use client";

import { useMemo } from "react";
import { ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLangValue } from "@/hooks/useLangValue";
import { useServicesWithPackages } from "@/hooks/useServices";
import { useCurrency } from "@/contexts/CurrencyContext";

const tierOrder = { basic: 0, standard: 1, premium: 2 } as const;

const PricingPage = () => {
  const { t, lang } = useLanguage();
  const lv = useLangValue();
  const { data: services, isLoading } = useServicesWithPackages();
  const { formatPrice } = useCurrency();

  const sortedServices = useMemo(
    () =>
      (services || []).map((svc) => ({
        ...svc,
        sortedPackages: [...(svc.packages || [])].sort(
          (a, b) => (tierOrder[a.tier as keyof typeof tierOrder] ?? 3) - (tierOrder[b.tier as keyof typeof tierOrder] ?? 3)
        ),
      })),
    [services]
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-10 relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-10 animate-fade-in-up">
            <p className="text-sm uppercase tracking-widest text-primary mb-3" suppressHydrationWarning>{t.pricingTag}</p>
            <h1 className="section-heading" suppressHydrationWarning>
              {t.pricingHeading} <span className="gradient-text">{t.pricingHeadingHighlight}</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto" suppressHydrationWarning>
              {lv(
                "Each service has three package tiers \u2014 Basic, Standard, and Premium. Click a service to compare packages and order.",
                "\u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u09b8\u09c7\u09ac\u09be\u09b0 \u09a4\u09bf\u09a8\u099f\u09bf \u09aa\u09cd\u09af\u09be\u0995\u09c7\u099c \u09b0\u09af\u09bc\u09c7\u099b\u09c7 \u2014 \u09ac\u09c7\u09b8\u09bf\u0995, \u09b8\u09cd\u099f\u09cd\u09af\u09be\u09a8\u09cd\u09a1\u09be\u09b0\u09cd\u09a1 \u098f\u09ac\u0982 \u09aa\u09cd\u09b0\u09bf\u09ae\u09bf\u09af\u09bc\u09be\u09ae\u0964 \u09aa\u09cd\u09af\u09be\u0995\u09c7\u099c \u09a4\u09c1\u09b2\u09a8\u09be \u0995\u09b0\u09a4\u09c7 \u09b8\u09c7\u09ac\u09be\u09a4\u09c7 \u0995\u09cd\u09b2\u09bf\u0995 \u0995\u09b0\u09c1\u09a8\u0964"
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="min-h-[400px]" />
          ) : (
            <div className="space-y-16 max-w-5xl mx-auto">
              {sortedServices.map((svc) => {
                const svcAny = svc as Record<string, unknown>;
                const svcTitle = lv(svc.title, svcAny.title_bn as string);

                return (
                  <div key={svc.id} className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-foreground flex items-center gap-2" suppressHydrationWarning>
                        <Package size={18} className="text-primary" />
                        {svcTitle}
                      </h2>
                      <Link
                        href={`/services/${svc.slug}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                        data-testid={`link-pricing-detail-${svc.id}`}
                        suppressHydrationWarning
                      >
                        {lv("See full details", "\u09ac\u09bf\u09b8\u09cd\u09a4\u09be\u09b0\u09bf\u09a4 \u09a6\u09c7\u0996\u09c1\u09a8")} <ArrowRight size={13} />
                      </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      {svc.sortedPackages.map((pkg) => {
                        const pkgAny = pkg as unknown as Record<string, unknown>;
                        const pkgName = lv(pkg.name, pkgAny.name_bn as string);
                        const pkgFeaturesBn = (pkgAny.features_bn as string[]) ?? [];
                        const featuresToShow =
                          lang === "bn" && pkgFeaturesBn.length > 0
                            ? pkgFeaturesBn
                            : pkg.features ?? [];

                        return (
                          <div
                            key={pkg.id}
                            className={`glass-card p-6 relative transition-all duration-300 hover:scale-[1.02] ${
                              pkg.isPopular ? "red-glow glow-border" : "hover:border-border/80"
                            }`}
                            data-testid={`card-pricing-${pkg.id}`}
                          >
                            {pkg.isPopular && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full" suppressHydrationWarning>
                                {lv("Most Popular", "\u09b8\u09ac\u099a\u09c7\u09af\u09bc\u09c7 \u099c\u09a8\u09aa\u09cd\u09b0\u09bf\u09af\u09bc")}
                              </div>
                            )}
                            <h3 className="font-bold text-foreground mb-1" suppressHydrationWarning>
                              {pkgName}
                            </h3>
                            <div className="text-2xl font-bold gradient-text mb-3">
                              {formatPrice(parseFloat(pkg.price))}
                            </div>
                            <p className="text-xs text-muted-foreground mb-4" suppressHydrationWarning>
                              {pkg.deliveryDays} {lv("days", "\u09a6\u09bf\u09a8")} ·{" "}
                              {pkg.revisions === null
                                ? lv("Unlimited", "\u0986\u09a8\u09b2\u09bf\u09ae\u09bf\u099f\u09c7\u09a1")
                                : pkg.revisions}{" "}
                              {lv("revisions", "\u09b0\u09bf\u09ad\u09bf\u09b6\u09a8")}
                            </p>

                            {featuresToShow.length > 0 && (
                              <ul className="space-y-1.5 mb-4 text-xs text-muted-foreground">
                                {featuresToShow.slice(0, 4).map((f, i) => (
                                  <li key={i} className="flex items-start gap-1.5" suppressHydrationWarning>
                                    <span className="text-primary mt-0.5">✓</span> {f}
                                  </li>
                                ))}
                                {featuresToShow.length > 4 && (
                                  <li className="text-muted-foreground/60 text-xs" suppressHydrationWarning>
                                    +{featuresToShow.length - 4} {lv("more", "\u0986\u09b0\u09cb")}…
                                  </li>
                                )}
                              </ul>
                            )}

                            <Link
                              href={`/services/${svc.slug}`}
                              className={`w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-lg transition-all ${
                                pkg.isPopular ? "btn-primary-glow" : "btn-secondary-outline"
                              }`}
                              data-testid={`link-order-pricing-${pkg.id}`}
                              suppressHydrationWarning
                            >
                              {lv("Order Now", "\u098f\u0996\u09a8\u0987 \u0985\u09b0\u09cd\u09a1\u09be\u09b0 \u0995\u09b0\u09c1\u09a8")} <ArrowRight size={13} />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PricingPage;
