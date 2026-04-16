"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const testimonials = [
  {
    name: "Arif Rahman",
    role: { en: "E-commerce Business Owner", bn: "ই-কমার্স ব্যবসার মালিক" },
    text: {
      en: "Code Craft BD built our entire WooCommerce checkout with bKash integration. Sales increased by 40% within the first month!",
      bn: "Code Craft BD আমাদের সম্পূর্ণ WooCommerce চেকআউট বিকাশ ইন্টিগ্রেশন সহ তৈরি করেছে। প্রথম মাসেই বিক্রয় ৪০% বেড়েছে!",
    },
    rating: 5,
    avatar: "AR",
  },
  {
    name: "Dr. Nasrin Akter",
    role: { en: "Healthcare Professional", bn: "স্বাস্থ্যসেবা পেশাদার" },
    text: {
      en: "The medical dashboard is incredibly intuitive. Patient management has never been this smooth and efficient.",
      bn: "মেডিকেল ড্যাশবোর্ডটি অবিশ্বাস্যভাবে ব্যবহারবান্ধব। রোগী ব্যবস্থাপনা এত সহজ আর হয়নি।",
    },
    rating: 5,
    avatar: "NA",
  },
  {
    name: "Tanvir Hossain",
    role: { en: "Startup Founder", bn: "স্টার্টআপ প্রতিষ্ঠাতা", hi: "स्टार्टअप फाउंडर" },
    text: {
      en: "Working with Code Craft BD on our AI automation project was a game-changer. Delivered well beyond expectations.",
      bn: "আমাদের AI অটোমেশন প্রজেক্টে Code Craft BD-এর সাথে কাজ করা ছিল গেম-চেঞ্জার। প্রত্যাশার বাইরে ডেলিভারি করেছে।",
      hi: "AI ऑटोमेशन पर रसेल के साथ काम करना गेम-चेंजर था। उम्मीद से कहीं बेहतर डिलीवरी।",
    },
    rating: 5,
    avatar: "TH",
  },
  {
    name: "Sakib Al Hasan",
    role: { en: "Restaurant Chain Owner", bn: "রেস্তোরাঁ চেইনের মালিক", hi: "रेस्तरां चेन ओनर" },
    text: {
      en: "Our food delivery app went live in 3 weeks. The UX is beautiful and our customers love it. Highly recommended!",
      bn: "আমাদের ফুড ডেলিভারি অ্যাপ ৩ সপ্তাহে লাইভ হয়েছে। ইউএক্স অসাধারণ এবং গ্রাহকরা পছন্দ করছে।",
      hi: "हमारा फूड डिलीवरी ऐप 3 हफ्ते में लाइव हो गया। UX शानदार है और ग्राहक इसे पसंद करते हैं!",
    },
    rating: 5,
    avatar: "SA",
  },
  {
    name: "Fatema Begum",
    role: { en: "Fashion Brand Director", bn: "ফ্যাশন ব্র্যান্ড পরিচালক", hi: "फैशन ब्रांड डायरेक्टर" },
    text: {
      en: "The SEO work doubled our organic traffic in 2 months. Our brand now ranks #1 in Bangladesh for our category.",
      bn: "এসইও কাজ ২ মাসে আমাদের অর্গানিক ট্র্যাফিক দ্বিগুণ করেছে। আমাদের ব্র্যান্ড এখন বাংলাদেশে #1।",
      hi: "SEO काम ने 2 महीने में हमारा ऑर्गेनिक ट्रैफिक दोगुना कर दिया। हम अब बांग्लादेश में #1 हैं।",
    },
    rating: 5,
    avatar: "FB",
  },
  {
    name: "Mahbub Alam",
    role: { en: "Real Estate Developer", bn: "রিয়েল এস্টেট ডেভেলপার", hi: "रियल एस्टेट डेवलपर" },
    text: {
      en: "Professional, fast, and communicative. Our property listing portal exceeded all our initial goals.",
      bn: "পেশাদার, দ্রুত এবং যোগাযোগশীল। আমাদের প্রপার্টি লিস্টিং পোর্টাল সমস্ত লক্ষ্যমাত্রা ছাড়িয়ে গেছে।",
      hi: "पेशेवर, तेज और संवादशील। हमारा प्रॉपर्टी लिस्टिंग पोर्टल सभी लक्ष्यों से आगे निकल गया।",
    },
    rating: 5,
    avatar: "MA",
  },
];

const TestimonialsSection = () => {
  const { t, lang } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);
  const total = testimonials.length;

  const goTo = useCallback(
    (idx: number, dir: "left" | "right") => {
      if (animating) return;
      setAnimDir(dir);
      setAnimating(true);
      setTimeout(() => {
        setCurrent(idx);
        setAnimating(false);
        setAnimDir(null);
      }, 260);
    },
    [animating]
  );

  const prev = useCallback(() => goTo((current - 1 + total) % total, "right"), [current, total, goTo]);
  const next = useCallback(() => goTo((current + 1) % total, "left"), [current, total, goTo]);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  const item = testimonials[current];

  return (
    <section className="py-10 md:py-14 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-40" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Compact header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <p className="text-xs uppercase tracking-widest text-primary mb-2">{t.testTag}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t.testHeading}{" "}
            <span className="gradient-text">{t.testHeadingHighlight}</span>
          </h2>
        </div>

        {/* Slider */}
        <div className="relative max-w-2xl mx-auto">
          {/* Left arrow */}
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            data-testid="button-testimonial-prev"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-9 h-9 rounded-full bg-background border border-border/60 shadow-md flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-200 hover:shadow-lg"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Card */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className={`glass-card p-6 md:p-8 relative transition-all duration-260 ${
                animating
                  ? animDir === "left"
                    ? "opacity-0 -translate-x-4"
                    : "opacity-0 translate-x-4"
                  : "opacity-100 translate-x-0"
              }`}
              style={{ transition: "opacity 0.26s ease, transform 0.26s ease" }}
              data-testid={`testimonial-card-${current}`}
            >
              {/* Quote icon */}
              <Quote size={28} className="text-primary/15 absolute top-5 right-5" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-primary text-primary" />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed italic mb-5" suppressHydrationWarning>
                "{item.text[lang as "en" | "bn"] ?? item.text.en}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                  {item.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground" suppressHydrationWarning>
                    {item.role[lang as "en" | "bn"] ?? item.role.en}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={next}
            aria-label="Next testimonial"
            data-testid="button-testimonial-next"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-9 h-9 rounded-full bg-background border border-border/60 shadow-md flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-200 hover:shadow-lg"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? "left" : "right")}
              aria-label={`Go to testimonial ${i + 1}`}
              data-testid={`dot-testimonial-${i}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>

        {/* Counter */}
        <p className="text-center text-xs text-muted-foreground mt-2">
          {current + 1} / {total}
        </p>
      </div>
    </section>
  );
};

export default TestimonialsSection;
