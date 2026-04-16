import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { listAllPosts, createPost, findUserById } from "@lib/firestore";
import { getLocalBlogPosts } from "@lib/local-data";
import { z } from "zod";

const createPostSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1),
  excerpt: z.string().default(""),
  content: z.string().default(""),
  coverImage: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    const posts = await listAllPosts();
    const authorIds = Array.from(new Set(posts.map((p) => p.authorId).filter(Boolean) as string[]));
    const authorMap = new Map<string, string>();
    await Promise.all(
      authorIds.map(async (id) => {
        const u = await findUserById(id);
        if (u) authorMap.set(id, u.name);
      })
    );
    const result = posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      coverImage: post.coverImage ?? null,
      tags: post.tags,
      published: post.published,
      publishedAt: post.publishedAt ?? null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorName: post.authorId ? (authorMap.get(post.authorId) ?? null) : null,
    }));
    return NextResponse.json(result);
  } catch {
    // Firebase unavailable — fall back to local db-export.json (all posts incl. unpublished)
    try {
      const localPosts = getLocalBlogPosts();
      return NextResponse.json(localPosts);
    } catch (localErr) {
      console.error("Local blog fallback failed:", localErr);
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    const body = await req.json();
    const data = createPostSchema.parse(body);

    const publishedAt = data.published
      ? (data.publishedAt ? data.publishedAt : new Date().toISOString())
      : null;

    const post = await createPost({
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage ?? null,
      tags: data.tags,
      published: data.published,
      publishedAt,
      authorId: user.id,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("POST /api/admin/blog error:", err);
    return NextResponse.json({ error: "Failed to create post (Firebase not configured)" }, { status: 503 });
  }
}
