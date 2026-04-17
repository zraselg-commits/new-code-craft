import { NextRequest, NextResponse } from "next/server";
import { findLocalPostBySlug } from "@lib/local-blog-store";

export const revalidate = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const post = findLocalPostBySlug(params.slug);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json(
    {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage ?? null,
      tags: post.tags,
      publishedAt: post.publishedAt ?? null,
      createdAt: post.createdAt,
      authorName: post.authorName ?? "Code Craft BD Team",
    },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } }
  );
}
