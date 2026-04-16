export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import TermsPage from "@/pages/TermsPage";

const SITE = "https://codecraftbd.info";

export const metadata: Metadata = {
  title: "সেবার শর্তাবলী — Code Craft BD | Terms of Service",
  description: "কোড ক্রাফট বিডি-র সেবার শর্তাবলী — পেমেন্ট, ডেলিভারি, রিভিশন ও গোপনীয়তা। Code Craft BD Terms of Service — payment, delivery, revision & confidentiality policies.",
  alternates: { canonical: `${SITE}/terms` },
  robots: { index: false },
};

export default TermsPage;
