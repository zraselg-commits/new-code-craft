import { useState } from "react";
import { Calculator, TrendingUp, Clock, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ROICalculator = () => {
  const { t } = useLanguage();
  const [hours, setHours] = useState(20);
  const [rate, setRate] = useState(25);

  const savedHours = Math.round(hours * 0.7);
  const savedMoney = Math.round(savedHours * rate * 52);

  return (
    <section className="py-10 md:py-14 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div
          className="text-center mb-10 animate-fade-in-up"
          style={{ animationFillMode: "both" }}
        >
          <p className="text-sm uppercase tracking-widest text-secondary mb-3">{t.roiTag}</p>
          <h2 className="section-heading">
            {t.roiHeading} <span className="gradient-text">{t.roiHeadingHighlight}</span>
          </h2>
        </div>

        <div
          className="max-w-2xl mx-auto glass-card p-8 md:p-12 animate-fade-in-up"
          style={{ animationDelay: "0.15s", animationFillMode: "both" }}
        >
          <div className="space-y-8">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <Clock size={16} className="text-primary" />
                {t.roiHoursLabel}
              </label>
              <input
                type="range"
                min="5"
                max="60"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="text-right text-2xl font-bold text-foreground mt-2">{hours}h</div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <DollarSign size={16} className="text-secondary" />
                {t.roiRateLabel}
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
              />
              <div className="text-right text-2xl font-bold text-foreground mt-2">${rate}</div>
            </div>

            <div className="border-t border-border/30 pt-8">
              <p className="text-center text-muted-foreground mb-6">{t.roiResult}</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="glass-card p-6 text-center border-primary/20">
                  <TrendingUp className="mx-auto mb-2 text-primary" size={28} />
                  <div className="text-3xl md:text-4xl font-bold gradient-text">{savedHours}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.roiHours}</div>
                </div>
                <div className="glass-card p-6 text-center border-secondary/20">
                  <DollarSign className="mx-auto mb-2 text-secondary" size={28} />
                  <div className="text-3xl md:text-4xl font-bold gradient-text">${savedMoney.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.roiMoney}</div>
                </div>
              </div>
            </div>

            <a
              href="#contact"
              className="btn-primary-glow w-full inline-flex items-center justify-center gap-2 text-base animate-pulse-cta"
            >
              <Calculator size={18} />
              {t.roiCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;
