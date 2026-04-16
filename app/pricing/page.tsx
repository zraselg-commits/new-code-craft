export const revalidate = 3600;
import type { Metadata } from "next";
import PricingPage from "@/pages/PricingPage";

const SITE = "https://codecraftbd.info";

export const metadata: Metadata = {
  title: "মূল্য তালিকা — Code Craft BD | স্বচ্ছ মূল্য নির্ধারণ BDT/USD",
  description: "কোড ক্রাফট বিডি-র স্বচ্ছ মূল্য তালিকা — ওয়েব ডেভেলপমেন্ট, AI অটোমেশন, SEO ও ডিজাইন সেবার জন্য। BDT ও USD উভয়ে প্রযোজ্য। Code Craft BD transparent pricing — web, AI, SEO & design. No hidden fees.",
  keywords: "Code Craft BD pricing, web development cost Bangladesh, digital agency pricing BDT, SEO price Dhaka, মূল্য তালিকা ওয়েব ডেভেলপমেন্ট বাংলাদেশ",
  alternates: { canonical: `${SITE}/pricing` },
  openGraph: {
    title: "মূল্য তালিকা — Code Craft BD",
    description: "স্বচ্ছ মূল্যে ওয়েব, AI, SEO ও ডিজাইন সেবা — কোনো লুকানো চার্জ নেই।",
    siteName: "Code Craft BD",
    type: "website",
    url: `${SITE}/pricing`,
    locale: "bn_BD",
    images: [{ url: `${SITE}/og-image.jpg`, width: 1200, height: 630, alt: "Code Craft BD Pricing" }],
  },
  twitter: { card: "summary_large_image", title: "Pricing — Code Craft BD", description: "Transparent pricing for web, AI, SEO & design — BDT & USD", images: [`${SITE}/og-image.jpg`] },
};

export default PricingPage;
