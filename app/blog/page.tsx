import type { Metadata } from "next";
import BlogPage from "@/pages/BlogPage";

export const dynamic = "force-dynamic";

const SITE = "https://codecraftbd.info";

export const metadata: Metadata = {
  title: "ব্লগ — Code Craft BD | ডিজিটাল কৌশল ও ওয়েব টিপস",
  description: "কোড ক্রাফট বিডি ব্লগ — ডিজিটাল কৌশল, SEO গাইড, AI টিপস ও ওয়েব ডেভেলপমেন্ট পরামর্শ। Code Craft BD blog — digital strategy, SEO guides, AI tips & web development insights for Bangladesh businesses.",
  keywords: "Code Craft BD blog, digital marketing Bangladesh, SEO tips Bengali, web development guide, AI automation tips, ডিজিটাল মার্কেটিং ব্লগ",
  alternates: { canonical: `${SITE}/blog` },
  openGraph: {
    title: "ব্লগ — Code Craft BD",
    description: "ডিজিটাল কৌশল, SEO গাইড ও AI টিপস — কোড ক্রাফট বিডি থেকে।",
    type: "website",
    siteName: "Code Craft BD",
    url: `${SITE}/blog`,
    locale: "bn_BD",
    images: [{ url: `${SITE}/og-image.jpg`, width: 1200, height: 630, alt: "Code Craft BD Blog" }],
  },
  twitter: { card: "summary_large_image", title: "Code Craft BD Blog", description: "Digital strategy, SEO & AI tips for Bangladesh businesses", images: [`${SITE}/og-image.jpg`] },
};

export default BlogPage;
