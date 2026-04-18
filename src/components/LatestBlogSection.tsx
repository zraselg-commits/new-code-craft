"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Calendar, ArrowRight, BookOpen, Tag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLangValue } from "@/hooks/useLangValue";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  authorName: string | null;
}

function formatDate(dateStr: string | null, lang: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function LatestBlogSection() {
  const { lang } = useLanguage();
  const lv = useLangValue();

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    queryFn: async () => {
      const r = await fetch("/api/blog", { cache: "no-store" });
      if (!r.ok) return [];
      return r.json();
    },
    staleTime: 0,
    gcTime: 60_000,
    select: (data) => data.slice(0, 3), // Show only latest 3
  });

  // Don't render section if no posts and not loading
  if (!isLoading && posts.length === 0) return null;

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6 text-sm text-muted-foreground">
            <BookOpen size={14} className="text-primary" />
            <span suppressHydrationWarning>{lv("Latest Insights", "সর্বশেষ নিবন্ধ")}</span>
          </div>
          <h2 className="section-heading text-3xl md:text-4xl mb-4">
            {lv("From Our ", "আমাদের ")}<span className="gradient-text" suppressHydrationWarning>{lv("Blog", "ব্লগ")}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto" suppressHydrationWarning>
            {lv(
              "Tips, guides and insights from the Code Craft BD team.",
              "কোড ক্রাফট বিডি টিমের টিপস, গাইড ও পরামর্শ।"
            )}
          </p>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-muted/30" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-muted/40 rounded" />
                  <div className="h-5 w-4/5 bg-muted/40 rounded" />
                  <div className="h-3 w-full bg-muted/30 rounded" />
                  <div className="h-3 w-3/4 bg-muted/30 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group glass-card rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
              >
                {/* Cover image or gradient placeholder */}
                {post.coverImage ? (
                  <div className="h-44 overflow-hidden bg-muted/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-primary/20 via-orange-500/10 to-secondary/20 flex items-center justify-center">
                    <BookOpen size={36} className="text-primary/40" />
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                        >
                          <Tag size={8} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar size={10} />
                      {formatDate(post.publishedAt || post.createdAt, lang)}
                    </span>
                    <span className="text-[11px] text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all" suppressHydrationWarning>
                      {lv("Read", "পড়ুন")} <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View all link */}
        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-all duration-300 group"
          >
            <BookOpen size={15} />
            <span suppressHydrationWarning>{lv("View All Posts", "সমস্ত পোস্ট দেখুন")}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
