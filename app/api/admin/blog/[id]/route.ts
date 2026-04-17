import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import {
  findLocalPostById,
  updateLocalPost,
  deleteLocalPost,
} from "@lib/local-blog-store";
import { z } from "zod";

const updatePostSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(1).optional(),
  title_bn: z.string().optional(),
  excerpt: z.string().optional(),
  excerpt_bn: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const post = findLocalPostById(params.id);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  const result = updatePostSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const data = result.data;
  if (data.published === true && !data.publishedAt) {
    (data as Record<string, unknown>).publishedAt = new Date().toISOString();
  }

  const updated = updateLocalPost(params.id, data);
  if (!updated) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const deleted = deleteLocalPost(params.id);
  if (!deleted) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
