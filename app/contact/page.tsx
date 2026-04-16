export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import ContactPage from "@/pages/ContactPage";

const SITE = "https://codecraftbd.info";

export const metadata: Metadata = {
  title: "যোগাযোগ করুন — Code Craft BD | বিনামূল্যে পরামর্শ নিন",
  description: "কোড ক্রাফট বিডি-র সাথে যোগাযোগ করুন — বিনামূল্যে পরামর্শের জন্য। ২৪ ঘণ্টার মধ্যে সাড়া দেওয়া হয়। Contact Code Craft BD for a free consultation on web, AI, SEO or design. We respond within 24 hours.",
  keywords: "contact Code Craft BD, free consultation Bangladesh, web development quote, digital agency contact Dhaka, কোড ক্রাফট বিডি যোগাযোগ",
  alternates: { canonical: `${SITE}/contact` },
  openGraph: {
    title: "যোগাযোগ করুন — Code Craft BD",
    description: "বিনামূল্যে পরামর্শের জন্য যোগাযোগ করুন — ২৪ ঘণ্টার মধ্যে সাড়া দেওয়া হয়।",
    siteName: "Code Craft BD",
    type: "website",
    url: `${SITE}/contact`,
    locale: "bn_BD",
    images: [{ url: `${SITE}/og-image.jpg`, width: 1200, height: 630, alt: "Contact Code Craft BD" }],
  },
  twitter: { card: "summary_large_image", title: "Contact Code Craft BD", description: "Get a free consultation — we respond within 24 hours", images: [`${SITE}/og-image.jpg`] },
};

export default ContactPage;
