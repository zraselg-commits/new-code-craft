export const revalidate = 3600;
import type { Metadata } from "next";
import PortfolioPage from "@/pages/PortfolioPage";

const SITE = "https://codecraftbd.info";

export const metadata: Metadata = {
  title: "পোর্টফোলিও — Code Craft BD | সফল প্রজেক্ট সমূহ",
  description: "কোড ক্রাফট বিডি-র সফল প্রজেক্টসমূহ — ই-কমার্স, AI, SEO, ওয়েব অ্যাপ ও ব্র্যান্ড ডিজাইন। Code Craft BD portfolio — e-commerce, AI automation, SEO, web apps & design projects across Bangladesh and worldwide.",
  keywords: "Code Craft BD portfolio, web development projects Bangladesh, e-commerce solutions, AI projects, SEO case studies, পোর্টফোলিও বাংলাদেশ",
  alternates: { canonical: `${SITE}/portfolio` },
  openGraph: {
    title: "পোর্টফোলিও — Code Craft BD",
    description: "আমাদের সফল প্রজেক্টসমূহ দেখুন — ই-কমার্স, AI, SEO ও ওয়েব অ্যাপ।",
    siteName: "Code Craft BD",
    type: "website",
    url: `${SITE}/portfolio`,
    locale: "bn_BD",
    images: [{ url: `${SITE}/og-image.jpg`, width: 1200, height: 630, alt: "Code Craft BD Portfolio" }],
  },
  twitter: { card: "summary_large_image", title: "Portfolio — Code Craft BD", description: "Successful web, AI & SEO projects from Bangladesh's top agency", images: [`${SITE}/og-image.jpg`] },
};

export default PortfolioPage;
