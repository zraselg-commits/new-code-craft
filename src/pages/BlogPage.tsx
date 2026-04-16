"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { Calendar, Tag, ArrowRight, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

function BlogCardImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <BookOpen size={40} className="text-primary/50" />
      </div>
    );
  }
  return (
    <div className="h-48 overflow-hidden bg-muted/20">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

function formatDate(dateStr: string | null, lang: string) {
  if (!dateStr) return "";
  const locale = lang === "bn" ? "bn-BD" : "en-US";
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const { lang } = useLanguage();
  const lv = useLangValue();
  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6 text-sm text-muted-foreground" suppressHydrationWarning>
              <BookOpen size={14} className="text-primary" />
              {lv("Insights & Resources", "তথ্য ও সম্পদ")}
            </div>
            <h1 className="section-heading text-4xl md:text-5xl mb-4" suppressHydrationWarning>
              {lv("The", "")} <span className="gradient-text" suppressHydrationWarning>{lv("Blog", "ব্লগ")}</span>
            </h1>
            <p className="text-muted-foreground text-lg" suppressHydrationWarning>
              {lv(
                "Digital strategy, web development, and marketing insights from the Code Craft BD team.",
                "ডিজিটাল কৌশল, ওয়েব ডিজাইন ও মার্কেটিং বিষয়ক Code Craft BD টিমের পরামর্শ।"
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted/40" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-muted/40 rounded w-1/3" />
                    <div className="h-6 bg-muted/40 rounded w-4/5" />
                    <div className="h-4 bg-muted/40 rounded w-full" />
                    <div className="h-4 bg-muted/40 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg" suppressHydrationWarning>{lv("No posts yet. Check back soon!", "এখনো কোনো পোস্ট নেই। শীঘ্রই আসবে!")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  data-testid={`blog-card-${post.id}`}
                  className="group glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  {post.coverImage ? (
                    <BlogCardImage src={post.coverImage} alt={post.title} />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <BookOpen size={40} className="text-primary/50" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                          >
                            <Tag size={10} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar size={12} />
                        {formatDate(post.publishedAt || post.createdAt, lang)}
                      </div>
                      <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all" suppressHydrationWarning>
                        {lv("Read", "পড়ুন")} <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
