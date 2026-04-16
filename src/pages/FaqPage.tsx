"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const faqs = [
  {
    q: "What services does Code Craft BD offer?",
    a: "We offer custom web development, AI agent automation, SEO & digital growth, creative media & design, and full admin panel development. Each service has tiered packages to fit different budgets and needs.",
  },
  {
    q: "How long does a typical project take?",
    a: "Project timelines vary by scope. Basic packages typically deliver in 3–7 days, Standard in 7–14 days, and Premium in 14–30 days. We'll give you an accurate estimate after reviewing your requirements.",
  },
  {
    q: "Do you offer revisions?",
    a: "Yes. Basic packages include 3 revisions, Standard includes 10 revisions, and Premium includes unlimited revisions. We work until you're 100% satisfied.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept bank transfers, bKash, Nagad, PayPal, and major credit/debit cards. Payment schedules can be discussed during the project kick-off.",
  },
  {
    q: "Can I switch currencies from BDT to USD?",
    a: "Absolutely. Use the currency toggle in the navbar to switch between BDT (৳) and USD ($). All prices on the site will update accordingly.",
  },
  {
    q: "Is my data safe with Code Craft BD?",
    a: "Yes. We take data privacy seriously. All data is encrypted in transit and at rest. We never sell or share client data with third parties. See our Privacy Policy for full details.",
  },
  {
    q: "Do you provide post-launch support?",
    a: "All packages include post-delivery support for bug fixes. Premium clients receive priority 24/7 support. Extended support plans are available on request.",
  },
  {
    q: "Can I order multiple services at once?",
    a: "Yes! You can add multiple service packages to your cart and place a combined order. We'll coordinate the delivery schedule to ensure smooth execution.",
  },
  {
    q: "Do you work with international clients?",
    a: "Yes. While we're based in Bangladesh, we serve clients globally. All communication is in English and we adapt our working hours to overlap with your timezone.",
  },
  {
    q: "How do I get started?",
    a: "Browse our Services or Pricing page, add a package to your cart, and proceed to checkout. Alternatively, use the Contact page to send us a detailed inquiry and we'll respond within 24 hours.",
  },
];

const FaqPage = () => {
  const [open, setOpen] = useState<number | null>(null);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-10 relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-10 animate-fade-in-up">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">{t.navFaq ?? "FAQ"}</p>
            <h1 className="section-heading">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Everything you need to know about working with Code Craft BD. Can't find your answer? Contact us.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="glass-card overflow-hidden animate-fade-in-up"
                data-testid={`faq-item-${i}`}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  data-testid={`button-faq-${i}`}
                >
                  <span className="font-medium text-foreground text-sm md:text-base">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-muted-foreground shrink-0 transition-transform duration-300 ${open === i ? "rotate-180 text-primary" : ""}`}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-4">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FaqPage;
