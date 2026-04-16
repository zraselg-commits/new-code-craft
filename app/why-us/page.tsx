export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import WhyUsPage from "@/pages/WhyUsPage";

const SITE = "https://codecraftbd.info";

export const metadata: Metadata = {
  title: "কেন আমাদের বেছে নেবেন — Code Craft BD | ৮০+ সন্তুষ্ট ক্লায়েন্ট",
  description: "কোড ক্রাফট বিডি কেন বাংলাদেশের সেরা পছন্দ — ২৪/৭ সাপোর্ট, স্বচ্ছ মূল্য, দ্রুত ডেলিভারি। Why Code Craft BD — 80+ satisfied clients, 24/7 support, transparent pricing & proven results in web, AI & SEO.",
  keywords: "why Code Craft BD, best digital agency Bangladesh, trusted web development Dhaka, AI agency reviews, কেন কোড ক্রাফট বিডি বেছে নেবেন",
  alternates: { canonical: `${SITE}/why-us` },
  openGraph: {
    title: "কেন আমাদের বেছে নেবেন — Code Craft BD",
    description: "৮০+ সন্তুষ্ট ক্লায়েন্ট, ২৪/৭ সাপোর্ট ও প্রমাণিত ফলাফল।",
    siteName: "Code Craft BD",
    type: "website",
    url: `${SITE}/why-us`,
    locale: "bn_BD",
    images: [{ url: `${SITE}/og-image.jpg`, width: 1200, height: 630, alt: "Why Code Craft BD" }],
  },
  twitter: { card: "summary_large_image", title: "Why Code Craft BD", description: "80+ happy clients, 24/7 support & proven results", images: [`${SITE}/og-image.jpg`] },
};

export default WhyUsPage;
