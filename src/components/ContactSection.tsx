"use client";

import { Send, CheckCircle, AlertCircle, Clock, Mail, Phone, MessageSquare } from "lucide-react";
import { useState, FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiFetch } from "@/lib/api";
import { PhoneInput } from "@/components/ui/PhoneInput";

const SERVICES = [
  "Web Design & Development",
  "SEO Optimization",
  "Social Media Marketing",
  "AI Automation",
  "E-Commerce Solutions",
  "Brand Identity Design",
  "Other / Not sure yet",
];

const WA_NUMBER = "8801711234567";
const WA_MSG = encodeURIComponent("Hi Code Craft BD, I came from your website and would like to discuss a project.");
const TG_HANDLE = "codecraftbd";

const DIRECT_CHANNELS = [
  {
    label: "WhatsApp",
    subLabel: "Fastest response",
    href: `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`,
    color: "hover:border-[#25D366]/50 hover:bg-[#25D366]/10",
    iconColor: "text-[#25D366]",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    subLabel: "Usually within 1 hour",
    href: `https://t.me/${TG_HANDLE}`,
    color: "hover:border-[#0088CC]/50 hover:bg-[#0088CC]/10",
    iconColor: "text-[#0088CC]",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    subLabel: "Professional enquiries",
    href: "https://linkedin.com/company/codecraftbd",
    color: "hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10",
    iconColor: "text-[#0A66C2]",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    subLabel: "Follow & message us",
    href: "https://facebook.com/codecraftbd",
    color: "hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10",
    iconColor: "text-[#1877F2]",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Email",
    subLabel: "hello@codecraftbd.info",
    href: "mailto:hello@codecraftbd.info",
    color: "hover:border-primary/50 hover:bg-primary/10",
    iconColor: "text-primary",
    icon: <Mail size={22} />,
  },
];

const ContactSection = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dialCode: "+880",
    phone: "",
    service: "",
    details: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const dialCode = formData.dialCode.replace("-CA", "");
      const rawPhone = formData.phone.trim();
      const phone = rawPhone ? `${dialCode}${rawPhone}` : null;

      const res = await apiFetch("/api/contacts", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone,
          service: formData.service || null,
          details: formData.details.trim(),
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setFormData({ name: "", email: "", dialCode: "+880", phone: "", service: "", details: "" });
    } catch {
      setStatus("error");
    }

    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <section id="contact" className="py-10 md:py-14 relative">
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-10 animate-fade-in-up" style={{ animationFillMode: "both" }}>
          <p className="text-sm uppercase tracking-widest text-secondary mb-3">{t.contactTag}</p>
          <h2 className="section-heading">
            {t.contactHeading} <span className="gradient-text">{t.contactHeadingHighlight}</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto" suppressHydrationWarning>
            {t.contactSubheading}
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-start">

          {/* ── Left: Form ── */}
          <form
            onSubmit={handleSubmit}
            className="glass-card p-8 md:p-10 space-y-5 animate-fade-in-up"
            style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              <span suppressHydrationWarning>{t.contactSendTitle}</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t.contactName}</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-contact-name"
                  className="w-full bg-muted/50 border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                  placeholder={t.contactNamePlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t.contactEmail}</label>
                <input
                  type="email"
                  required
                  maxLength={255}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-contact-email"
                  className="w-full bg-muted/50 border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                  placeholder={t.contactEmailPlaceholder}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1.5" suppressHydrationWarning><Phone size={13} /> {t.contactPhoneLabel}</span>
                </label>
                <PhoneInput
                  dialCode={formData.dialCode}
                  onDialCodeChange={(code) => setFormData({ ...formData, dialCode: code })}
                  phoneNumber={formData.phone}
                  onPhoneNumberChange={(num) => setFormData({ ...formData, phone: num })}
                  placeholder="1XXXXXXXXX"
                  maxLength={20}
                  testIdPrefix="contact-"
                  inputClassName="bg-muted/50 border-border/50 focus:border-primary/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5" suppressHydrationWarning>{t.contactServiceLabel}</label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  data-testid="select-contact-service"
                  className="w-full bg-muted/50 border border-border/50 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm appearance-none"
                >
                  <option value="" suppressHydrationWarning>{t.contactSelectService}</option>
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t.contactDetails}</label>
              <textarea
                required
                rows={5}
                maxLength={2000}
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                data-testid="textarea-contact-details"
                className="w-full bg-muted/50 border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors resize-none text-sm"
                placeholder={t.contactDetailsPlaceholder}
              />
            </div>

            {status === "success" && (
              <div className="flex items-center gap-2 text-secondary text-sm bg-secondary/10 border border-secondary/20 rounded-lg px-4 py-3">
                <CheckCircle size={16} className="shrink-0" /> {t.contactSuccess}
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                <AlertCircle size={16} className="shrink-0" /> {t.contactError}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              data-testid="button-contact-submit"
              className="btn-primary-glow w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span suppressHydrationWarning>{status === "loading" ? t.contactFormSending : t.contactSend}</span>
              <Send size={17} />
            </button>
          </form>

          {/* ── Right: Direct contact panel ── */}
          <div
            className="space-y-4 animate-fade-in-up"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            <div className="glass-card p-6 md:p-8">
              <h3 className="text-lg font-semibold text-foreground mb-1" suppressHydrationWarning>{t.contactDirectTitle}</h3>
              <p className="text-sm text-muted-foreground mb-6" suppressHydrationWarning>{t.contactSkipDesc}</p>

              <div className="space-y-3">
                {DIRECT_CHANNELS.map((ch) => (
                  <a
                    key={ch.label}
                    href={ch.href}
                    target={ch.label === "Email" ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    data-testid={`link-contact-${ch.label.toLowerCase()}`}
                    className={`flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-muted/20 transition-all duration-200 group ${ch.color}`}
                  >
                    <span className={`shrink-0 ${ch.iconColor} transition-colors`}>{ch.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm group-hover:text-foreground">{ch.label}</p>
                      <p className="text-xs text-muted-foreground">{ch.subLabel}</p>
                    </div>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Office hours card */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-primary" />
                <h4 className="font-semibold text-foreground text-sm" suppressHydrationWarning>{t.contactOfficeHours}</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday – Thursday</span>
                  <span className="text-foreground font-medium">9:00 AM – 9:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Friday – Saturday</span>
                  <span className="text-foreground font-medium">10:00 AM – 6:00 PM</span>
                </div>
                <div className="border-t border-border/30 pt-2 mt-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-secondary text-xs font-medium">WhatsApp &amp; Telegram monitored 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
