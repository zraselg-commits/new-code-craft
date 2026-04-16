export const revalidate = 3600;
import type { Metadata } from "next";
import ServicesPage from "@/pages/ServicesPage";

const SITE = "https://codecraftbd.info";

export const metadata: Metadata = {
  title: "আমাদের সেবাসমূহ — Code Craft BD | Web, AI, SEO বাংলাদেশ",
  description: "কোড ক্রাফট বিডি-র সেবাসমূহ: কাস্টম ওয়েব ডেভেলপমেন্ট, AI অটোমেশন, SEO, ভিডিও এডিটিং, ব্র্যান্ড ডিজাইন। Code Craft BD services — web development, AI automation, SEO, video editing & brand design Bangladesh.",
  keywords: "web development Bangladesh, AI automation service, SEO Bangladesh, video editing Dhaka, brand design, Code Craft BD services, ওয়েব ডেভেলপমেন্ট সেবা, AI অটোমেশন",
  alternates: { canonical: `${SITE}/services` },
  openGraph: {
    title: "আমাদের সেবাসমূহ — Code Craft BD",
    description: "কাস্টম ওয়েব, AI অটোমেশন, SEO, ভিডিও এডিটিং ও ব্র্যান্ড ডিজাইন — আপনার ব্যবসার প্রতিটি ডিজিটাল প্রয়োজন।",
    siteName: "Code Craft BD",
    type: "website",
    url: `${SITE}/services`,
    locale: "bn_BD",
    images: [{ url: `${SITE}/og-image.jpg`, width: 1200, height: 630, alt: "Code Craft BD Services" }],
  },
  twitter: { card: "summary_large_image", title: "Code Craft BD Services", description: "Web, AI, SEO & creative services from Bangladesh's top agency", images: [`${SITE}/og-image.jpg`] },
};

export default ServicesPage;
