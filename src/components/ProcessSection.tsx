import { MessageSquare, Palette, Code2, Rocket } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ProcessSection = () => {
  const { t } = useLanguage();

  const steps = [
    { icon: MessageSquare, step: "01", title: t.proc1Title, description: t.proc1Desc },
    { icon: Palette, step: "02", title: t.proc2Title, description: t.proc2Desc },
    { icon: Code2, step: "03", title: t.proc3Title, description: t.proc3Desc },
    { icon: Rocket, step: "04", title: t.proc4Title, description: t.proc4Desc },
  ];

  return (
    <section className="py-10 md:py-14 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div
          className="text-center mb-10 animate-fade-in-up"
          style={{ animationFillMode: "both" }}
        >
          <p className="text-sm uppercase tracking-widest text-secondary mb-3">{t.processTag}</p>
          <h2 className="section-heading">
            {t.processHeading} <span className="gradient-text">{t.processHeadingHighlight}</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className="relative animate-fade-in-up"
              style={{ animationDelay: `${i * 0.15}s`, animationFillMode: "both" }}
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              <div className="glass-card-hover p-8 text-center relative">
                <div className="text-5xl font-black text-primary/10 absolute top-4 right-4">{step.step}</div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <step.icon size={28} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
