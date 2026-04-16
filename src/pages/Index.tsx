"use client";

import { lazy, Suspense, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import { useInView } from "@/hooks/useInView";
import { useQueryClient } from "@tanstack/react-query";

const DemoSection     = lazy(() => import("@/components/DemoSection"));
const ProcessSection = lazy(() => import("@/components/ProcessSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const TechStackSection = lazy(() => import("@/components/TechStackSection"));
const ProjectEstimator = lazy(() => import("@/components/ProjectEstimator"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const CTASection = lazy(() => import("@/components/CTASection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));

const DemoSkeleton = () => (
  <section className="py-12 md:py-16">
    <div className="container mx-auto px-4 md:px-6">
      <div className="h-6 w-32 bg-muted/40 rounded mx-auto mb-4 animate-pulse" />
      <div className="h-10 w-64 bg-muted/40 rounded mx-auto mb-8 animate-pulse" />
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-72 rounded-2xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

const ProcessSkeleton = () => (
  <section className="py-12 md:py-16">
    <div className="container mx-auto px-4 md:px-6">
      <div className="h-6 w-28 bg-muted/40 rounded mx-auto mb-4 animate-pulse" />
      <div className="h-10 w-56 bg-muted/40 rounded mx-auto mb-8 animate-pulse" />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

const TestimonialsSkeleton = () => (
  <section className="py-12 md:py-16">
    <div className="container mx-auto px-4 md:px-6">
      <div className="h-6 w-28 bg-muted/40 rounded mx-auto mb-4 animate-pulse" />
      <div className="h-10 w-56 bg-muted/40 rounded mx-auto mb-8 animate-pulse" />
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

const TechStackSkeleton = () => (
  <section className="py-12 md:py-16">
    <div className="container mx-auto px-4 md:px-6">
      <div className="h-6 w-28 bg-muted/40 rounded mx-auto mb-4 animate-pulse" />
      <div className="h-10 w-56 bg-muted/40 rounded mx-auto mb-8 animate-pulse" />
      <div className="h-12 w-full bg-muted/20 rounded mb-16 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

const ROISkeleton = () => (
  <section className="py-12 md:py-16">
    <div className="container mx-auto px-4 md:px-6">
      <div className="h-6 w-28 bg-muted/40 rounded mx-auto mb-4 animate-pulse" />
      <div className="h-10 w-56 bg-muted/40 rounded mx-auto mb-8 animate-pulse" />
      <div className="max-w-2xl mx-auto h-80 rounded-2xl bg-muted/30 animate-pulse" />
    </div>
  </section>
);

const FAQSkeleton = () => (
  <section className="py-12 md:py-16">
    <div className="container mx-auto px-4 md:px-6">
      <div className="h-6 w-28 bg-muted/40 rounded mx-auto mb-4 animate-pulse" />
      <div className="h-10 w-56 bg-muted/40 rounded mx-auto mb-8 animate-pulse" />
      <div className="max-w-3xl mx-auto space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

const CTASkeleton = () => (
  <section className="py-12 md:py-16">
    <div className="container mx-auto px-4 md:px-6">
      <div className="max-w-4xl mx-auto h-48 rounded-2xl bg-muted/30 animate-pulse" />
    </div>
  </section>
);

const ContactSkeleton = () => (
  <section className="py-12 md:py-16">
    <div className="container mx-auto px-4 md:px-6">
      <div className="h-6 w-28 bg-muted/40 rounded mx-auto mb-4 animate-pulse" />
      <div className="h-10 w-56 bg-muted/40 rounded mx-auto mb-8 animate-pulse" />
      <div className="max-w-2xl mx-auto h-96 rounded-2xl bg-muted/30 animate-pulse" />
      <div className="flex justify-center gap-4 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-10 h-10 rounded-lg bg-muted/30 animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

const FooterSkeleton = () => (
  <footer className="py-10">
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-5 w-20 bg-muted/40 rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 w-28 bg-muted/30 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="border-t border-border/30 pt-6">
        <div className="h-4 w-48 bg-muted/30 rounded mx-auto animate-pulse" />
      </div>
    </div>
  </footer>
);

const DeferredSection = ({
  children,
  fallback,
  rootMargin = "300px 0px",
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  rootMargin?: string;
}) => {
  const [ref, inView] = useInView({ rootMargin });
  return (
    <div ref={ref}>
      {inView ? (
        <Suspense fallback={fallback}>{children}</Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

const Index = () => {
  const queryClient = useQueryClient();
  const prefetched = useRef(false);

  useEffect(() => {
    if (prefetched.current) return;
    prefetched.current = true;
    queryClient.prefetchQuery({
      queryKey: ["/api/services"],
      queryFn: async () => {
        const r = await fetch("/api/services");
        if (!r.ok) throw new Error("Failed to prefetch services");
        return r.json();
      },
      staleTime: 5 * 60_000,
    });
    queryClient.prefetchQuery({
      queryKey: ["/api/blog"],
      queryFn: async () => {
        const r = await fetch("/api/blog");
        if (!r.ok) throw new Error("Failed to prefetch blog");
        return r.json();
      },
      staleTime: 5 * 60_000,
    });
  }, [queryClient]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <HeroSection />

      <StatsSection />

      <DeferredSection fallback={<DemoSkeleton />}>
        <DemoSection />
      </DeferredSection>

      <DeferredSection fallback={<ProcessSkeleton />}>
        <ProcessSection />
      </DeferredSection>

      <DeferredSection fallback={<TestimonialsSkeleton />}>
        <TestimonialsSection />
      </DeferredSection>

      <DeferredSection fallback={<TechStackSkeleton />}>
        <TechStackSection />
      </DeferredSection>

      <DeferredSection fallback={<ROISkeleton />}>
        <ProjectEstimator />
      </DeferredSection>

      <DeferredSection fallback={<FAQSkeleton />}>
        <FAQSection />
      </DeferredSection>

      <DeferredSection fallback={<CTASkeleton />}>
        <CTASection />
      </DeferredSection>

      <DeferredSection fallback={<ContactSkeleton />}>
        <ContactSection />
      </DeferredSection>

      <DeferredSection fallback={<FooterSkeleton />}>
        <Footer />
      </DeferredSection>
    </div>
  );
};

export default Index;
