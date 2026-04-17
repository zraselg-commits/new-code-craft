"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { BilingualField } from "@/components/admin/BilingualField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  tags: string[];
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorName: string | null;
}

interface PostForm {
  slug: string;
  title: string;
  title_bn: string;
  excerpt: string;
  excerpt_bn: string;
  content: string;
  coverImage: string;
  tags: string;
  published: boolean;
}

const emptyForm: PostForm = {
  slug: "",
  title: "",
  title_bn: "",
  excerpt: "",
  excerpt_bn: "",
  content: "",
  coverImage: "",
  tags: "",
  published: false,
};

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminBlog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: PostForm) => {
      const r = await apiFetch("/api/admin/blog", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          coverImage: data.coverImage || null,
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Failed to create post");
      }
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Post created!" });
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (e: unknown) => {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PostForm) => {
      const r = await apiFetch(`/api/admin/blog/${editPost!.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...data,
          tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          coverImage: data.coverImage || null,
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Failed to update post");
      }
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Post updated!" });
      setDialogOpen(false);
      setEditPost(null);
      setForm(emptyForm);
    },
    onError: (e: unknown) => {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await apiFetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Failed to delete post");
      }
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Post deleted." });
      setDeleteId(null);
    },
  });

  const openCreate = () => {
    setEditPost(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditPost(post);
    setForm({
      slug: post.slug,
      title: post.title,
      title_bn: (post as unknown as { title_bn?: string }).title_bn ?? "",
      excerpt: post.excerpt,
      excerpt_bn: (post as unknown as { excerpt_bn?: string }).excerpt_bn ?? "",
      content: "",
      coverImage: post.coverImage ?? "",
      tags: post.tags.join(", "),
      published: post.published,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: "Title and slug are required.", variant: "destructive" });
      return;
    }
    if (editPost) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Blog Posts">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your published and draft posts</p>
        </div>
        <Button onClick={openCreate} data-testid="button-create-post">
          <Plus size={16} className="mr-2" />
          New Post
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <p className="text-muted-foreground">No posts yet. Create your first blog post!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              data-testid={`row-post-${post.id}`}
              className="glass-card rounded-xl px-5 py-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">{post.title}</span>
                  <Badge variant={post.published ? "default" : "secondary"} className="shrink-0 text-xs">
                    {post.published ? <><Eye size={10} className="mr-1" />Published</> : <><EyeOff size={10} className="mr-1" />Draft</>}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>/blog/{post.slug}</span>
                  {post.tags.length > 0 && (
                    <span>{post.tags.slice(0, 3).join(", ")}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(post)}
                  data-testid={`button-edit-post-${post.id}`}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(post.id)}
                  data-testid={`button-delete-post-${post.id}`}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPost ? "Edit Post" : "New Blog Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <BilingualField
                  label="Title" required nameEn="title" nameBn="title_bn"
                  valueEn={form.title} valueBn={form.title_bn}
                  onChange={(k, v) => {
                    setForm((f) => ({
                      ...f,
                      [k]: v,
                      ...(k === "title" && !f.slug ? { slug: slugify(v) } : {}),
                    }));
                  }}
                  placeholder="My Awesome Post" placeholderBn="আমার চমৎকার পোস্ট"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="post-slug">Slug *</Label>
                <Input
                  id="post-slug"
                  data-testid="input-post-slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="my-awesome-post"
                />
              </div>
            </div>
            <BilingualField
              label="Excerpt" nameEn="excerpt" nameBn="excerpt_bn"
              valueEn={form.excerpt} valueBn={form.excerpt_bn}
              onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
              type="textarea" rows={2}
              placeholder="Short summary shown on the blog listing page..."
              placeholderBn="ব্লগ তালিকা পেজে দেখানো সংক্ষিপ্ত বিবরণ..."
            />
            <div className="space-y-1.5">
              <Label>Content</Label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                placeholder="Write your post content here... Use the toolbar for formatting, or switch to HTML/Code for raw editing."
                minHeight={400}
              />
            </div>
            <ImageUploadField
              label="Cover Image"
              description="Upload or paste URL. Displayed at the top of the blog post."
              value={form.coverImage}
              onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
              placeholder="https://..."
            />
            <div className="space-y-1.5">
              <Label htmlFor="post-tags">Tags (comma-separated)</Label>
              <Input
                id="post-tags"
                data-testid="input-post-tags"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="SEO, Web Design, Marketing"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="post-published"
                data-testid="switch-post-published"
                checked={form.published}
                onCheckedChange={(val) => setForm((f) => ({ ...f, published: val }))}
              />
              <Label htmlFor="post-published" className="cursor-pointer">
                {form.published ? "Published (visible to public)" : "Draft (hidden from public)"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending} data-testid="button-submit-post">
              {isPending ? "Saving..." : editPost ? "Save Changes" : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              data-testid="button-confirm-delete-post"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
