import { NextRequest, NextResponse } from "next/server";
import { findPostBySlug, findUserById } from "@lib/firestore";
import { findLocalPostBySlug } from "@lib/local-blog-store";

export const revalidate = 3600;

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await findPostBySlug(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    let authorName: string | null = post.authorName ?? null;
    if (!authorName && post.authorId) {
      const author = await findUserById(post.authorId);
      authorName = author?.name ?? null;
    }
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
        authorName,
      },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch (error) {
    // Firebase not configured — fall back to local blog store
    console.warn("Blog post: Firebase unavailable, using local store.", String(error));
    const localPost = findLocalPostBySlug(params.slug);
    if (!localPost) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({
      id: localPost.id,
      slug: localPost.slug,
      title: localPost.title,
      excerpt: localPost.excerpt,
      content: localPost.content,
      coverImage: localPost.coverImage ?? null,
      tags: localPost.tags,
      publishedAt: localPost.publishedAt ?? null,
      createdAt: localPost.createdAt,
      authorName: localPost.authorName ?? "Code Craft BD Team",
    });
  }
}


