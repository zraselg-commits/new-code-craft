"use client";

import { useState } from "react";
import {
  Globe, ShoppingCart, Smartphone, Brain,
  BarChart3, PenTool, Zap, Clock, CheckCircle2,
  ArrowRight, Layers,
} from "lucide-react";
import Link from "next/link";

const SERVICES = [
  { id: "website",   label: "Business Website",   icon: Globe,         time: [2, 4],   base: [200, 800] },
  { id: "ecommerce", label: "E-Commerce Store",    icon: ShoppingCart,  time: [3, 8],   base: [500, 2000] },
  { id: "mobile",    label: "Mobile App",          icon: Smartphone,    time: [6, 16],  base: [1500, 6000] },
  { id: "ai",        label: "AI / Automation",     icon: Brain,         time: [4, 12],  base: [800, 4000] },
  { id: "seo",       label: "SEO & Marketing",     icon: BarChart3,     time: [1, 3],   base: [150, 600] },
  { id: "design",    label: "UI/UX Design",        icon: PenTool,       time: [1, 4],   base: [100, 500] },
];

const URGENCY = [
  { id: "standard", label: "Standard", desc: "Best quality, no rush", mult: 1.0, icon: Clock },
  { id: "fast",     label: "Fast",     desc: "Priority delivery",     mult: 1.35, icon: Zap },
  { id: "asap",     label: "ASAP",     desc: "Express turnaround",    mult: 1.7,  icon: Zap },
];

const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

export default function ProjectEstimator() {
  const [selected, setSelected] = useState<string[]>([]);
  const [urgency, setUrgency] = useState("standard");

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const urgencyMult = URGENCY.find((u) => u.id === urgency)?.mult ?? 1;
  const chosenServices = SERVICES.filter((s) => selected.includes(s.id));

  const totalMin = chosenServices.reduce((acc, s) => acc + s.base[0], 0);
  const totalMax = chosenServices.reduce((acc, s) => acc + s.base[1], 0);
  const timeMin = chosenServices.length ? Math.max(...chosenServices.map((s) => s.time[0])) : 0;
  const timeMax = chosenServices.length ? Math.max(...chosenServices.map((s) => s.time[1])) : 0;

  const estMin = Math.round(totalMin * urgencyMult);
  const estMax = Math.round(totalMax * urgencyMult);
  const hasSelection = selected.length > 0;

  return (
    <section className="py-10 md:py-14 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-widest mb-3">
            <Layers size={12} />
            Project Planner
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
            Instant{" "}
            <span className="gradient-text">Cost Estimate</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Select what you need — get an instant ballpark estimate and timeline. No sign-up required.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Step 1 — Services */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">1</span>
              What do you need?
              <span className="text-muted-foreground font-normal text-xs ml-1">(select all that apply)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SERVICES.map((svc) => {
                const Icon = svc.icon;
                const isOn = selected.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggle(svc.id)}
                    data-testid={`service-${svc.id}`}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 text-left ${
                      isOn
                        ? "bg-primary/10 border-primary/50 text-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]"
                        : "bg-muted/30 border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isOn ? "bg-primary/20" : "bg-muted/50"}`}>
                      <Icon size={14} className={isOn ? "text-primary" : "text-muted-foreground"} />
                    </div>
                    <span className="leading-tight">{svc.label}</span>
                    {isOn && <CheckCircle2 size={13} className="text-primary ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2 — Urgency */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">2</span>
              How soon do you need it?
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {URGENCY.map((u) => {
                const Icon = u.icon;
                const isOn = urgency === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUrgency(u.id)}
                    data-testid={`urgency-${u.id}`}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-center transition-all duration-200 ${
                      isOn
                        ? "bg-primary/10 border-primary/50 text-primary"
                        : "bg-muted/30 border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <Icon size={16} className={isOn ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-sm font-semibold">{u.label}</span>
                    <span className="text-[10px] leading-snug">{u.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result */}
          <div
            className={`glass-card p-6 border transition-all duration-300 animate-fade-in-up ${
              hasSelection ? "border-primary/30" : "border-border/30"
            }`}
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
            data-testid="estimator-result"
          >
            <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">3</span>
              Your Instant Estimate
            </h3>

            {!hasSelection ? (
              <p className="text-center text-muted-foreground text-sm py-6">
                Select at least one service above to see your estimate.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Estimated Budget</p>
                    <p className="text-2xl md:text-3xl font-bold gradient-text">
                      {fmt(estMin)} – {fmt(estMax)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">USD · rough estimate</p>
                  </div>
                  <div className="rounded-xl bg-secondary/5 border border-secondary/20 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Estimated Timeline</p>
                    <p className="text-2xl md:text-3xl font-bold gradient-text">
                      {timeMin}–{timeMax}w
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">weeks · based on scope</p>
                  </div>
                </div>

                {/* Selected services summary */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {chosenServices.map((s) => {
                    const Icon = s.icon;
                    return (
                      <span key={s.id} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
                        <Icon size={10} /> {s.label}
                      </span>
                    );
                  })}
                  {urgency !== "standard" && (
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium">
                      <Zap size={10} /> {URGENCY.find((u) => u.id === urgency)?.label} delivery
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  This is a rough estimate — actual pricing depends on your exact requirements, features, and timeline. Get a precise quote with no obligation.
                </p>

                <Link
                  href="/contact"
                  className="btn-primary-glow w-full inline-flex items-center justify-center gap-2 text-sm"
                  data-testid="link-get-quote"
                >
                  Get My Free Exact Quote <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
