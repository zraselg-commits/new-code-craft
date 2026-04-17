import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { updatePost, deletePost, findPostById } from "@lib/firestore";
import { findLocalPostById, updateLocalPost, deleteLocalPost } from "@lib/local-blog-store";
import { z } from "zod";


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    const post = await findPostById(params.id);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch {
    // Firebase unavailable — fall back to local blog store
    const localPost = findLocalPostById(params.id);
    if (!localPost) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(localPost);
  }
}


const updatePostSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    const body = await req.json();
    const data = updatePostSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };

    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt ?? null;
    }
    if (data.published === true && !updateData.publishedAt) {
      updateData.publishedAt = new Date().toISOString();
    }

    const updated = await updatePost(params.id, updateData as Parameters<typeof updatePost>[1]);

    if (!updated) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    // Firebase unavailable — fall back to local store
    console.warn("PATCH /api/admin/blog/[id]: Firebase unavailable, using local store.");
    try {
      const body = await req.json().catch(() => ({}));
      const data = updatePostSchema.parse(body);
      const updateData: Record<string, unknown> = { ...data };
      if (data.published === true && !updateData.publishedAt) {
        updateData.publishedAt = new Date().toISOString();
      }
      const updated = updateLocalPost(params.id, updateData as Parameters<typeof updateLocalPost>[1]);
      if (!updated) return NextResponse.json({ error: "Post not found" }, { status: 404 });
      return NextResponse.json(updated);
    } catch (localErr) {
      console.error("Local blog update failed:", localErr);
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    await deletePost(params.id);
    return NextResponse.json({ success: true });
  } catch {
    // Firebase unavailable — fall back to local store
    const deleted = deleteLocalPost(params.id);
    if (!deleted) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  }
}
