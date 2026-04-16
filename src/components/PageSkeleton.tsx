"use client";

import Navbar from "@/components/Navbar";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted/50 ${className}`} />
  );
}

export function HeroSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-32 gap-6 text-center">
        <SkeletonBlock className="h-5 w-32 mx-auto" />
        <SkeletonBlock className="h-14 w-3/4 max-w-xl mx-auto" />
        <SkeletonBlock className="h-14 w-1/2 max-w-md mx-auto" />
        <SkeletonBlock className="h-5 w-2/3 max-w-lg mx-auto mt-2" />
        <div className="flex gap-4 mt-4">
          <SkeletonBlock className="h-12 w-44 rounded-full" />
          <SkeletonBlock className="h-12 w-44 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-3">
          <SkeletonBlock className="h-4 w-24 mx-auto" />
          <SkeletonBlock className="h-10 w-72 mx-auto" />
          <SkeletonBlock className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/40 overflow-hidden">
              <SkeletonBlock className="h-48 rounded-none" />
              <div className="p-5 space-y-3">
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-6 w-3/4" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-4/5" />
                <SkeletonBlock className="h-10 w-full rounded-lg mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PricingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-3">
          <SkeletonBlock className="h-4 w-28 mx-auto" />
          <SkeletonBlock className="h-10 w-64 mx-auto" />
          <SkeletonBlock className="h-4 w-80 mx-auto" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-10">
            <SkeletonBlock className="h-7 w-48 mb-5" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[0, 1, 2].map((j) => (
                <div key={j} className="rounded-2xl border border-border/40 p-6 space-y-4">
                  <SkeletonBlock className="h-6 w-24" />
                  <SkeletonBlock className="h-8 w-32" />
                  <div className="space-y-2 mt-4">
                    {Array.from({ length: 4 }).map((_, k) => (
                      <SkeletonBlock key={k} className="h-4 w-full" />
                    ))}
                  </div>
                  <SkeletonBlock className="h-10 w-full rounded-lg mt-2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlogListSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-3">
          <SkeletonBlock className="h-4 w-24 mx-auto" />
          <SkeletonBlock className="h-10 w-48 mx-auto" />
          <SkeletonBlock className="h-4 w-80 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/40 overflow-hidden">
              <SkeletonBlock className="h-48 rounded-none" />
              <div className="p-5 space-y-3">
                <div className="flex gap-2">
                  <SkeletonBlock className="h-5 w-16 rounded-full" />
                  <SkeletonBlock className="h-5 w-16 rounded-full" />
                </div>
                <SkeletonBlock className="h-6 w-3/4" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-5/6" />
                <SkeletonBlock className="h-4 w-24 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogPostSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <SkeletonBlock className="h-6 w-32 mb-6" />
        <SkeletonBlock className="h-10 w-full mb-3" />
        <SkeletonBlock className="h-10 w-3/4 mb-6" />
        <SkeletonBlock className="h-4 w-40 mb-8" />
        <SkeletonBlock className="h-72 w-full mb-10 rounded-2xl" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} className={`h-4 ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ServiceDetailSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <SkeletonBlock className="h-6 w-24" />
          <SkeletonBlock className="h-12 w-2/3" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
          <SkeletonBlock className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border/40 p-5 space-y-3">
                <SkeletonBlock className="h-5 w-20" />
                <SkeletonBlock className="h-7 w-28" />
                {Array.from({ length: 4 }).map((_, j) => (
                  <SkeletonBlock key={j} className="h-3 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SimplePageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12 space-y-3">
          <SkeletonBlock className="h-4 w-24 mx-auto" />
          <SkeletonBlock className="h-10 w-64 mx-auto" />
          <SkeletonBlock className="h-4 w-80 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/40 p-6 space-y-3">
              <SkeletonBlock className="h-10 w-10 rounded-xl" />
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
