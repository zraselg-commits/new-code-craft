export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import TeamPage from "@/pages/TeamPage";

const SITE = "https://codecraftbd.info";

export const metadata: Metadata = {
  title: "আমাদের দল — Code Craft BD | বিশেষজ্ঞ ডেভেলপার ও ডিজাইনার",
  description: "কোড ক্রাফট বিডি-র প্রতিভাবান দল — ডেভেলপার, ডিজাইনার, AI ইঞ্জিনিয়ার ও SEO বিশেষজ্ঞ। Meet the Code Craft BD team — skilled developers, designers, AI engineers & digital strategists passionate about exceptional results.",
  keywords: "Code Craft BD team, web developers Bangladesh, digital agency team Dhaka, AI engineers Bangladesh, আমাদের দল কোড ক্রাফট বিডি",
  alternates: { canonical: `${SITE}/team` },
  openGraph: {
    title: "আমাদের দল — Code Craft BD",
    description: "কোড ক্রাফট বিডি-র প্রতিভাবান দলের সাথে পরিচিত হন।",
    siteName: "Code Craft BD",
    type: "website",
    url: `${SITE}/team`,
    locale: "bn_BD",
    images: [{ url: `${SITE}/og-image.jpg`, width: 1200, height: 630, alt: "Code Craft BD Team" }],
  },
  twitter: { card: "summary_large_image", title: "Our Team — Code Craft BD", description: "Meet the developers, designers & AI engineers behind Code Craft BD", images: [`${SITE}/og-image.jpg`] },
};

export default TeamPage;
