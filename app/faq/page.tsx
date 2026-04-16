export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import FaqPage from "@/pages/FaqPage";

const SITE = "https://codecraftbd.info";

export const metadata: Metadata = {
  title: "সাধারণ প্রশ্নোত্তর — Code Craft BD | FAQ বাংলা ও English",
  description: "কোড ক্রাফট বিডি সম্পর্কে সাধারণ প্রশ্ন — সেবা, মূল্য, সময়সীমা, রিভিশন ও পেমেন্ট। Code Craft BD FAQ — services, pricing, timelines, revisions, bKash/Nagad payment, and support process.",
  keywords: "Code Craft BD FAQ, digital agency questions Bangladesh, web development FAQ, AI service questions, ঘন ঘন জিজ্ঞাসিত প্রশ্ন",
  alternates: { canonical: `${SITE}/faq` },
  openGraph: {
    title: "সাধারণ প্রশ্নোত্তর — Code Craft BD",
    description: "সেবা, মূল্য, সময়সীমা ও পেমেন্ট বিষয়ক সাধারণ প্রশ্ন।",
    siteName: "Code Craft BD",
    type: "website",
    url: `${SITE}/faq`,
    locale: "bn_BD",
    images: [{ url: `${SITE}/og-image.jpg`, width: 1200, height: 630, alt: "Code Craft BD FAQ" }],
  },
  twitter: { card: "summary_large_image", title: "FAQ — Code Craft BD", description: "Common questions about our services, pricing & support", images: [`${SITE}/og-image.jpg`] },
};

export default FaqPage;
