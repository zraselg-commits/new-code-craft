import { NextResponse } from "next/server";
import { listLocalPublishedPosts } from "@lib/local-blog-store";

export const revalidate = 60;

export async function GET() {
  const posts = listLocalPublishedPosts().map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImage: p.coverImage ?? null,
    tags: p.tags,
    publishedAt: p.publishedAt ?? null,
    createdAt: p.createdAt,
    authorName: p.authorName ?? "Code Craft BD Team",
  }));
  return NextResponse.json(posts, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
