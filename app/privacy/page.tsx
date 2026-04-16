export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import PrivacyPage from "@/pages/PrivacyPage";

const SITE = "https://codecraftbd.info";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি — Code Craft BD | Privacy Policy",
  description: "কোড ক্রাফট বিডি-র গোপনীয়তা নীতি — আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষা। Code Craft BD Privacy Policy — how we collect, use and protect your personal information.",
  alternates: { canonical: `${SITE}/privacy` },
  robots: { index: false },
};

export default PrivacyPage;
