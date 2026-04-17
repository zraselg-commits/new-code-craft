import { NextResponse } from "next/server";
import { listPublishedPosts, findUserById } from "@lib/firestore";
import { listLocalPublishedPosts } from "@lib/local-blog-store";

export const revalidate = 3600;

export async function GET() {
  try {
    const posts = await listPublishedPosts();
    const authorIds = Array.from(new Set(posts.map((p) => p.authorId).filter(Boolean) as string[]));
    const authorMap = new Map<string, string>();
    await Promise.all(
      authorIds.map(async (id) => {
        const user = await findUserById(id);
        if (user) authorMap.set(id, user.name);
      })
    );
    const result = posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      coverImage: post.coverImage ?? null,
      tags: post.tags,
      publishedAt: post.publishedAt ?? null,
      createdAt: post.createdAt,
      authorName: post.authorName ?? (post.authorId ? (authorMap.get(post.authorId) ?? null) : null),
    }));
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    // Firebase not configured — fall back to local file-based store
    console.warn("Blog: Firebase unavailable, using local blog store.", String(error));
    try {
      const localPosts = listLocalPublishedPosts().map((p) => ({
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
      return NextResponse.json(localPosts);
    } catch (localErr) {
      console.error("Local blog fallback failed:", localErr);
      return NextResponse.json([], { status: 200 });
    }
  }
}


