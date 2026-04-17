"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import NextImage from "next/image";
import { useParams } from "next/navigation";
import { Calendar, Tag, ArrowLeft, User, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  authorName: string | null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function estimateReadTime(content: string) {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Renders blog post content.
 * Auto-detects format: if content starts with "<" it is treated as HTML
 * (output from TipTap), otherwise it is rendered as Markdown.
 */
function PostContent({ content }: { content: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    const isHtml = content.trimStart().startsWith("<");
    if (isHtml) {
      import("dompurify").then((DOMPurifyModule) => {
        const DOMPurify = DOMPurifyModule.default;
        const clean = DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
        setHtml(clean);
      });
    } else {
      Promise.all([import("marked"), import("dompurify")]).then(
        ([{ marked }, DOMPurifyModule]) => {
          const DOMPurify = DOMPurifyModule.default;
          const raw = marked(content);
          const resolved = typeof raw === "string" ? raw : "";
          const clean = DOMPurify.sanitize(resolved, { USE_PROFILES: { html: true } });
          setHtml(clean);
        }
      );
    }
  }, [content]);

  if (!html) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`h-4 bg-muted/40 rounded ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="prose prose-lg dark:prose-invert max-w-none
        prose-headings:font-bold prose-headings:tracking-tight
        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-muted prose-pre:rounded-xl
        prose-blockquote:border-primary prose-blockquote:text-muted-foreground
        prose-img:rounded-xl prose-img:shadow-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data: post, isLoading, isError } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            data-testid="link-back-to-blog"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          {isLoading && (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-muted/40 rounded w-1/2" />
              <div className="h-64 bg-muted/40 rounded-2xl" />
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`h-4 bg-muted/40 rounded ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
                ))}
              </div>
            </div>
          )}

          {isError && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">Post not found.</p>
              <Link href="/blog" className="text-primary hover:underline mt-4 inline-block">
                ← Back to Blog
              </Link>
            </div>
          )}

          {post && (
            <article data-testid="blog-post-content">
              {post.coverImage && (
                <div className="rounded-2xl overflow-hidden mb-8 aspect-video relative">
                  <NextImage
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
                    className="object-cover"
                    unoptimized={post.coverImage.startsWith("/uploads/") || post.coverImage.startsWith("http")}
                  />
                </div>
              )}

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-post-title">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/40">
                {post.authorName && (
                  <span className="flex items-center gap-1.5">
                    <User size={14} />
                    {post.authorName}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {estimateReadTime(post.content)} min read
                </span>
              </div>

              {post.excerpt && (
                <p className="text-lg text-muted-foreground mb-8 italic border-l-2 border-primary/40 pl-4">
                  {post.excerpt}
                </p>
              )}

              <PostContent content={post.content} />
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
