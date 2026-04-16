"use client";

import { Headphones, Award, Zap, Layers, CreditCard, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const WhyUsPage = () => {
  const { t } = useLanguage();

  const reasons = [
    { icon: Headphones, title: t.why1Title, desc: t.why1Desc },
    { icon: Award, title: t.why2Title, desc: t.why2Desc },
    { icon: Zap, title: t.why3Title, desc: t.why3Desc },
    { icon: Layers, title: t.why4Title, desc: t.why4Desc },
    { icon: CreditCard, title: t.why5Title, desc: t.why5Desc },
    { icon: BarChart3, title: t.why6Title, desc: t.why6Desc },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-10 relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-10 animate-fade-in-up">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">{t.whyTag}</p>
            <h1 className="section-heading">
              {t.whyHeading} <span className="gradient-text">{t.whyHeadingHighlight}</span>
            </h1>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {reasons.map((r) => (
              <div
                key={r.title}
                className="glass-card-hover p-8 text-center group glow-border animate-fade-in-up"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] group-hover:scale-110 transition-all duration-500">
                  <r.icon size={28} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default WhyUsPage;
