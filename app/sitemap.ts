import { MetadataRoute } from "next";
import { getActiveLocalServices } from "@lib/local-services-store";
import { listLocalPublishedPosts } from "@lib/local-blog-store";

const BASE_URL = "https://codecraftbd.info";

const STATIC_ROUTES = [
  { url: "/",           priority: 1.0, changeFrequency: "weekly"  as const },
  { url: "/services",  priority: 0.9, changeFrequency: "weekly"  as const },
  { url: "/pricing",   priority: 0.9, changeFrequency: "weekly"  as const },
  { url: "/portfolio", priority: 0.8, changeFrequency: "monthly" as const },
  { url: "/team",      priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/why-us",   priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/contact",   priority: 0.9, changeFrequency: "monthly" as const },
  { url: "/about",     priority: 0.8, changeFrequency: "monthly" as const },
  { url: "/blog",      priority: 0.9, changeFrequency: "daily"   as const },
  { url: "/faq",       priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/terms",     priority: 0.3, changeFrequency: "yearly"  as const },
  { url: "/privacy",   priority: 0.3, changeFrequency: "yearly"  as const },
];

const langs = (url: string) => ({
  languages: { bn: `${BASE_URL}${url}`, en: `${BASE_URL}${url}`, "x-default": `${BASE_URL}${url}` },
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: now,
    changeFrequency,
    priority,
    alternates: langs(url),
  }));

  const serviceEntries: MetadataRoute.Sitemap = getActiveLocalServices().map((s) => ({
    url: `${BASE_URL}/services/${s.slug}`,
    lastModified: s.createdAt ? new Date(s.createdAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    alternates: langs(`/services/${s.slug}`),
  }));

  const blogEntries: MetadataRoute.Sitemap = listLocalPublishedPosts().map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : p.publishedAt ? new Date(p.publishedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: langs(`/blog/${p.slug}`),
  }));

  return [...staticEntries, ...serviceEntries, ...blogEntries];
}
