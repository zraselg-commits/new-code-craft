/**
 * local-blog-store.ts
 * File-based blog post persistence — used when Firebase is not configured.
 * Reads/writes from scripts/blog-posts.json (same pattern as services & portfolio).
 */

import * as fs from "fs";
import * as path from "path";

const BLOG_FILE = path.join(process.cwd(), "scripts", "blog-posts.json");

export interface LocalBlogPost {
  id: string;
  slug: string;
  title: string;
  title_bn?: string;
  excerpt: string;
  excerpt_bn?: string;
  content: string;
  coverImage: string | null;
  tags: string[];
  published: boolean;
  publishedAt: string | null;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
}

function readPosts(): LocalBlogPost[] {
  if (!fs.existsSync(BLOG_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(BLOG_FILE, "utf-8")) as LocalBlogPost[];
  } catch {
    return [];
  }
}

function writePosts(posts: LocalBlogPost[]): void {
  fs.mkdirSync(path.dirname(BLOG_FILE), { recursive: true });
  fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), "utf-8");
}

export function listLocalAllPosts(): LocalBlogPost[] {
  return readPosts().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listLocalPublishedPosts(): LocalBlogPost[] {
  return readPosts()
    .filter((p) => p.published)
    .sort((a, b) =>
      (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt)
    );
}

export function findLocalPostById(id: string): LocalBlogPost | null {
  return readPosts().find((p) => p.id === id) ?? null;
}

export function findLocalPostBySlug(slug: string): LocalBlogPost | null {
  const post = readPosts().find((p) => p.slug === slug);
  if (!post || !post.published) return null;
  return post;
}

export function createLocalPost(
  data: Omit<LocalBlogPost, "id" | "createdAt" | "updatedAt">
): LocalBlogPost {
  const posts = readPosts();
  const now = new Date().toISOString();
  const post: LocalBlogPost = {
    ...data,
    id: Date.now().toString(),
    createdAt: now,
    updatedAt: now,
  };
  posts.unshift(post);
  writePosts(posts);
  return post;
}

export function updateLocalPost(
  id: string,
  data: Partial<Omit<LocalBlogPost, "id" | "createdAt">>
): LocalBlogPost | null {
  const posts = readPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated: LocalBlogPost = {
    ...posts[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  posts[idx] = updated;
  writePosts(posts);
  return updated;
}

export function deleteLocalPost(id: string): boolean {
  const posts = readPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  writePosts(filtered);
  return true;
}
