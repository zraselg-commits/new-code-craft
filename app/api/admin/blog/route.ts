import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { listLocalAllPosts, createLocalPost } from "@lib/local-blog-store";
import { z } from "zod";

const createPostSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1),
  title_bn: z.string().optional().default(""),
  excerpt: z.string().default(""),
  excerpt_bn: z.string().optional().default(""),
  content: z.string().default(""),
  coverImage: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const posts = listLocalAllPosts().map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImage: p.coverImage ?? null,
    tags: p.tags,
    published: p.published,
    publishedAt: p.publishedAt ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    authorName: p.authorName ?? "Code Craft BD Team",
  }));
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  const result = createPostSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const data = result.data;
  const publishedAt = data.published
    ? (data.publishedAt ?? new Date().toISOString())
    : null;

  const post = createLocalPost({
    slug: data.slug,
    title: data.title,
    title_bn: data.title_bn ?? "",
    excerpt: data.excerpt,
    excerpt_bn: data.excerpt_bn ?? "",
    content: data.content,
    coverImage: data.coverImage ?? null,
    tags: data.tags,
    published: data.published,
    publishedAt,
    authorId: user.id,
    authorName: user.name ?? "Admin",
  });

  return NextResponse.json(post, { status: 201 });
}
