"use client";

import { Target, Zap, Heart, Globe, Award, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutPage = () => {
  const { t } = useLanguage();

  const values = [
    { icon: Target, title: t.aboutVal1Title, desc: t.aboutVal1Desc },
    { icon: Zap,    title: t.aboutVal2Title, desc: t.aboutVal2Desc },
    { icon: Heart,  title: t.aboutVal3Title, desc: t.aboutVal3Desc },
    { icon: Globe,  title: t.aboutVal4Title, desc: t.aboutVal4Desc },
    { icon: Award,  title: t.aboutVal5Title, desc: t.aboutVal5Desc },
    { icon: Users,  title: t.aboutVal6Title, desc: t.aboutVal6Desc },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-10 relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-10 max-w-3xl mx-auto animate-fade-in-up">
            <p className="text-sm uppercase tracking-widest text-primary mb-3" suppressHydrationWarning>
              {t.aboutTag}
            </p>
            <h1 className="section-heading" suppressHydrationWarning>
              {t.aboutHeading} <span className="gradient-text">{t.aboutHeadingHighlight}</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed" suppressHydrationWarning>
              {t.aboutSubheading}
            </p>
          </div>

          <div className="glass-card p-6 md:p-10 mb-10 max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-2xl font-bold text-foreground mb-4" suppressHydrationWarning>
              {t.aboutStoryTitle}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p suppressHydrationWarning>{t.aboutStory1}</p>
              <p suppressHydrationWarning>{t.aboutStory2}</p>
              <p suppressHydrationWarning>{t.aboutStory3}</p>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-10" suppressHydrationWarning>
              {t.aboutDiffTitle}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((val, i) => {
                const Icon = val.icon;
                return (
                  <div
                    key={i}
                    className="glass-card p-6 animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}
                    data-testid={`card-value-${i}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2" suppressHydrationWarning>{val.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>{val.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AboutPage;
