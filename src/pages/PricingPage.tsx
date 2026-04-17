"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Package, Check, Zap, ChevronDown, ChevronUp, Star } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLangValue } from "@/hooks/useLangValue";
import { useServicesWithPackages } from "@/hooks/useServices";
import { useCurrency } from "@/contexts/CurrencyContext";

const tierOrder = { basic: 0, standard: 1, premium: 2 } as const;

const TIER_STYLES = {
  basic: {
    bg: "bg-white/2",
    border: "border-border/30",
    badge: "bg-white/5 text-white/50",
    btn: "btn-secondary-outline",
  },
  standard: {
    bg: "bg-gradient-to-b from-primary/5 to-orange-500/3",
    border: "border-primary/30 glow-border",
    badge: "bg-gradient-to-r from-primary to-orange-500 text-white shadow-md shadow-primary/20",
    btn: "btn-primary-glow",
  },
  premium: {
    bg: "bg-gradient-to-b from-purple-500/5 to-indigo-500/3",
    border: "border-purple-500/20",
    badge: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
    btn: "inline-flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all",
  },
};

const PricingPage = () => {
  const { t, lang } = useLanguage();
  const lv = useLangValue();
  const { data: services, isLoading } = useServicesWithPackages();
  const { formatPrice, currency } = useCurrency();
  const [expandedSvc, setExpandedSvc] = useState<string | null>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const YEARLY_DISCOUNT = 0.8; // 20% off

  const effectivePrice = (baseUsd: number) => {
    const p = billing === "yearly" ? baseUsd * YEARLY_DISCOUNT : baseUsd;
    return formatPrice(p);
  };

  const sortedServices = useMemo(
    () =>
      (services || []).map((svc) => ({
        ...svc,
        sortedPackages: [...(svc.packages || [])].sort(
          (a, b) =>
            (tierOrder[a.tier as keyof typeof tierOrder] ?? 3) -
            (tierOrder[b.tier as keyof typeof tierOrder] ?? 3)
        ),
      })),
    [services]
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-4 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            {t.pricingTag}
          </span>
          <h1 className="section-heading mb-4" suppressHydrationWarning>
            {t.pricingHeading}{" "}
            <span className="gradient-text">{t.pricingHeadingHighlight}</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-sm" suppressHydrationWarning>
            {lv(
              "Each service has three package tiers — Basic, Standard, and Premium.",
              "প্রতিটি সেবার তিনটি প্যাকেজ রয়েছে — বেসিক, স্ট্যান্ডার্ড এবং প্রিমিয়াম।"
            )}
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 bg-muted/40 border border-border/30 rounded-full">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                billing === "monthly"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang === "bn" ? "মাসিক" : "Monthly"}
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all duration-200 ${
                billing === "yearly"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang === "bn" ? "বার্ষিক" : "Yearly"}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${billing === "yearly" ? "bg-white/20 text-white" : "bg-green-500/15 text-green-400"}`}>
                -20%
              </span>
            </button>
          </div>

          {billing === "yearly" && (
            <p className="text-xs text-green-400 mt-2 flex items-center justify-center gap-1.5">
              <Zap size={12} />
              {lang === "bn" ? "বার্ষিক প্ল্যানে ২০% সাশ্রয়" : "Save 20% with annual billing"}
            </p>
          )}
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {isLoading ? (
            <div className="space-y-12 max-w-5xl mx-auto">
              {[1, 2].map((i) => (
                <div key={i} className="grid md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-64 rounded-2xl bg-muted/20 animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-14 max-w-5xl mx-auto">
              {sortedServices.map((svc) => {
                const svcAny = svc as Record<string, unknown>;
                const svcTitle = lv(svc.title, svcAny.title_bn as string);
                const isExpanded = expandedSvc === svc.id;

                return (
                  <div key={svc.id} className="animate-fade-in-up">
                    {/* Service header */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-foreground flex items-center gap-2.5" suppressHydrationWarning>
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package size={14} className="text-primary" />
                        </div>
                        {svcTitle}
                      </h2>
                      <Link
                        href={`/services/${svc.slug}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                        data-testid={`link-pricing-detail-${svc.id}`}
                        suppressHydrationWarning
                      >
                        {lv("Full details", "বিস্তারিত")} <ArrowRight size={11} />
                      </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                      {svc.sortedPackages.map((pkg) => {
                        const pkgAny = pkg as unknown as Record<string, unknown>;
                        const pkgName = lv(pkg.name, pkgAny.name_bn as string);
                        const pkgFeaturesBn = (pkgAny.features_bn as string[]) ?? [];
                        const featuresToShow =
                          lang === "bn" && pkgFeaturesBn.length > 0
                            ? pkgFeaturesBn
                            : pkg.features ?? [];
                        const tier = (pkg.tier || "basic") as keyof typeof TIER_STYLES;
                        const style = TIER_STYLES[tier] || TIER_STYLES.basic;

                        return (
                          <div
                            key={pkg.id}
                            className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${style.bg} ${style.border}`}
                            data-testid={`card-pricing-${pkg.id}`}
                          >
                            {/* Popular badge */}
                            {pkg.isPopular && (
                              <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-black px-4 py-1 rounded-full flex items-center gap-1 whitespace-nowrap ${style.badge}`} suppressHydrationWarning>
                                <Star size={10} className="fill-current" />
                                {lv("Most Popular", "সবচেয়ে জনপ্রিয়")}
                              </div>
                            )}

                            {/* Tier label */}
                            <div className={`self-start text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-3 ${style.badge}`} suppressHydrationWarning>
                              {tier === "basic" ? lv("Basic", "বেসিক") : tier === "standard" ? lv("Standard", "স্ট্যান্ডার্ড") : lv("Premium", "প্রিমিয়াম")}
                            </div>

                            <h3 className="font-bold text-foreground mb-1 text-base" suppressHydrationWarning>
                              {pkgName}
                            </h3>

                            {/* Price */}
                            <div className="mb-1">
                              <span className="text-3xl font-black gradient-text">{effectivePrice(parseFloat(pkg.price))}</span>
                              {billing === "yearly" && (
                                <span className="text-xs text-muted-foreground/50 line-through ml-2">{formatPrice(parseFloat(pkg.price))}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-4" suppressHydrationWarning>
                              {pkg.deliveryDays} {lv("days delivery", "দিন ডেলিভারি")} ·{" "}
                              {pkg.revisions === null ? lv("Unlimited revisions", "আনলিমিটেড রিভিশন") : `${pkg.revisions} ${lv("revisions", "রিভিশন")}`}
                            </p>

                            {/* Features */}
                            {featuresToShow.length > 0 && (
                              <ul className="space-y-2 mb-5 flex-1">
                                {featuresToShow.slice(0, isExpanded ? undefined : 4).map((f, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground" suppressHydrationWarning>
                                    <span className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                                      <Check size={9} className="text-primary" />
                                    </span>
                                    {f}
                                  </li>
                                ))}
                                {featuresToShow.length > 4 && (
                                  <li>
                                    <button
                                      onClick={() => setExpandedSvc(isExpanded ? null : svc.id)}
                                      className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 transition-colors"
                                      suppressHydrationWarning
                                    >
                                      {isExpanded ? (
                                        <><ChevronUp size={11} /> {lv("Show less", "কম দেখুন")}</>
                                      ) : (
                                        <><ChevronDown size={11} /> +{featuresToShow.length - 4} {lv("more", "আরও")}</>
                                      )}
                                    </button>
                                  </li>
                                )}
                              </ul>
                            )}

                            <Link
                              href={`/services/${svc.slug}`}
                              className={`mt-auto w-full ${style.btn}`}
                              data-testid={`link-order-pricing-${pkg.id}`}
                              suppressHydrationWarning
                            >
                              {lv("Order Now", "এখনই অর্ডার করুন")} <ArrowRight size={13} />
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

          {/* Bottom CTA */}
          {!isLoading && (
            <div className="max-w-2xl mx-auto mt-16 text-center">
              <div className="glass-card p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-500/5" />
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-foreground mb-2" suppressHydrationWarning>
                    {lv("Not sure which plan?", "কোন প্ল্যানটা নেবেন বুঝতে পারছেন না?")}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-5" suppressHydrationWarning>
                    {lv(
                      "Get a free consultation — we'll guide you to the perfect package.",
                      "বিনামূল্যে পরামর্শ নিন — আমরা আপনার জন্য সেরা প্যাকেজটি বেছে দেব।"
                    )}
                  </p>
                  <Link href="/contact" className="btn-primary-glow inline-flex items-center gap-2">
                    {lv("Get Free Consultation", "বিনামূল্যে পরামর্শ নিন")}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
