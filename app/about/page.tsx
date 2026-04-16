export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import AboutPage from "@/pages/AboutPage";

const SITE = "https://codecraftbd.info";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে — Code Craft BD | ডিজিটাল এজেন্সি বাংলাদেশ",
  description: "কোড ক্রাফট বিডি — বাংলাদেশের একটি ফুল-সার্ভিস ডিজিটাল এজেন্সি। কাস্টম ওয়েব, AI অটোমেশন, SEO ও ক্রিয়েটিভ ডিজাইন সেবা প্রদানকারী দক্ষ দল সম্পর্কে জানুন। Code Craft BD — Full-service digital agency for web, AI & SEO.",
  keywords: "Code Craft BD about, digital agency Bangladesh, web development team, AI automation Dhaka, কোড ক্রাফট বিডি সম্পর্কে",
  alternates: { canonical: `${SITE}/about` },
  openGraph: {
    title: "আমাদের সম্পর্কে — Code Craft BD",
    description: "কোড ক্রাফট বিডি — বাংলাদেশের একটি ফুল-সার্ভিস ডিজিটাল এজেন্সি। আমাদের দল ও গল্প সম্পর্কে জানুন।",
    siteName: "Code Craft BD",
    type: "website",
    url: `${SITE}/about`,
    locale: "bn_BD",
    images: [{ url: `${SITE}/og-image.jpg`, width: 1200, height: 630, alt: "Code Craft BD Team" }],
  },
  twitter: { card: "summary_large_image", title: "About Code Craft BD", description: "Learn about Bangladesh's top digital agency", images: [`${SITE}/og-image.jpg`] },
};

export default AboutPage;
