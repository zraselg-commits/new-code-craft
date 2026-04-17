import type { Metadata } from "next";
import { listLocalPublishedPosts, findLocalPostBySlug } from "@lib/local-blog-store";
import BlogPostPage from "@/pages/BlogPostPage";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return listLocalPublishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = findLocalPostBySlug(params.slug);
  if (!post) return { title: "Post Not Found — Code Craft BD" };

  const description = post.excerpt || "Read this article on the Code Craft BD blog.";
  const canonical = `https://codecraftbd.info/blog/${params.slug}`;
  return {
    title: `${post.title} — Code Craft BD`,
    description,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      siteName: "Code Craft BD",
      url: canonical,
      publishedTime: post.publishedAt ?? undefined,
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

export default function Page({ params }: Props) {
  const post = findLocalPostBySlug(params.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post?.title ?? params.slug,
    "description": post?.excerpt ?? "",
    "datePublished": post?.publishedAt ?? post?.createdAt ?? "",
    "author": { "@type": "Organization", "name": post?.authorName ?? "Code Craft BD Team" },
    "publisher": { "@type": "Organization", "name": "Code Craft BD", "url": "https://codecraftbd.info" },
    ...(post?.coverImage ? { "image": post.coverImage } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogPostPage />
    </>
  );
}
