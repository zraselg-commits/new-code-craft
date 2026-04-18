import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

// Always fetch fresh — admin changes must reflect immediately on VPS
export const dynamic = "force-dynamic";

const SETTINGS_FILE = path.join(process.cwd(), "scripts", "site-settings.json");

/** Public fields exposed to all visitors (no auth required) */
const PUBLIC_FIELDS = new Set([
  // Branding
  "siteName", "siteName_bn",
  "tagline", "tagline_bn",
  "logoUrl", "faviconUrl",
  // Hero section
  "heroImageUrl",
  "heroHeading", "heroHeading_bn",
  "heroSubheading", "heroSubheading_bn",
  "heroCtaText", "heroCtaText_bn",
  "heroCtaPrimaryUrl",
  "heroCtaSecondaryText", "heroCtaSecondaryText_bn",
  "heroCtaSecondaryUrl",
  // CTA banner section
  "ctaHeading", "ctaHeading_bn",
  "ctaDesc", "ctaDesc_bn",
  "ctaBtn1Text", "ctaBtn1Text_bn", "ctaBtn1Url",
  "ctaBtn2Text", "ctaBtn2Text_bn", "ctaBtn2Url",
  // Footer & contact
  "footerText", "footerText_bn",
  "contactEmail", "contactPhone", "contactAddress", "contactAddress_bn",
  "whatsappNumber",
  // Social
  "socialFacebook", "socialInstagram", "socialLinkedin",
  "socialTwitter", "socialYoutube", "socialGithub",
  // Misc
  "announcementBar", "announcementBar_bn", "announcementBarEnabled",
  "statsProjects", "statsClients", "statsYears", "statsSatisfaction",
  "statsTagline", "statsTagline_bn",
  // SEO
  "metaTitle", "metaTitle_bn",
  "metaDescription", "metaDescription_bn",
  "metaKeywords",
  "ogImageUrl",
  "schemaType",
  "googleAnalyticsId", "facebookPixelId", "googleSearchConsoleId",
  // Appearance
  "primaryColor", "accentColor",
  // Pricing defaults
  "pricingCurrencyDefault", "usdToBdtRate",
]);

function getDefaults(): Record<string, string | boolean> {
  return {
    siteName: "Code Craft BD",
    siteName_bn: "কোড ক্রাফট বিডি",
    tagline: "Digital Agency & Web Solutions",
    tagline_bn: "ডিজিটাল এজেন্সি ও ওয়েব সমাধান",
    // Hero section
    heroImageUrl: "/hero-main.jpg",
    heroHeading: "We Build, Grow & Transform Your Digital Presence.",
    heroHeading_bn: "আমরা তৈরি করি, বৃদ্ধি করি ও রূপান্তরিত করি আপনার ডিজিটাল উপস্থিতি।",
    heroSubheading: "Custom websites, AI automation, SEO & creative media — everything your business needs to thrive online.",
    heroSubheading_bn: "কাস্টম ওয়েবসাইট, AI অটোমেশন, SEO ও ক্রিয়েটিভ মিডিয়া — আপনার ব্যবসার অনলাইন সাফল্যের জন্য সব কিছু।",
    heroCtaText: "Get a Free Consultation",
    heroCtaText_bn: "বিনামূল্যে পরামর্শ নিন",
    heroCtaPrimaryUrl: "/contact",
    heroCtaSecondaryText: "Our Portfolio",
    heroCtaSecondaryText_bn: "আমাদের পোর্টফোলিও",
    heroCtaSecondaryUrl: "/portfolio",
    // CTA banner section
    ctaHeading: "",
    ctaHeading_bn: "",
    ctaDesc: "",
    ctaDesc_bn: "",
    ctaBtn1Text: "",
    ctaBtn1Text_bn: "",
    ctaBtn1Url: "/contact",
    ctaBtn2Text: "",
    ctaBtn2Text_bn: "",
    ctaBtn2Url: "/portfolio",
    // Footer
    footerText: "© 2025 Code Craft BD. All rights reserved.",
    footerText_bn: "© ২০২৫ কোড ক্রাফট বিডি। সর্বস্বত্ব সংরক্ষিত।",
    contactEmail: "hello@codecraftbd.info",
    contactPhone: "+880 1700-000000",
    contactAddress: "Dhaka, Bangladesh",
    contactAddress_bn: "ঢাকা, বাংলাদেশ",
    whatsappNumber: "+8801700000000",
    socialFacebook: "https://facebook.com/codecraftbd",
    socialInstagram: "https://instagram.com/codecraftbd",
    socialLinkedin: "https://linkedin.com/company/codecraftbd",
    socialTwitter: "https://twitter.com/codecraftbd",
    socialYoutube: "",
    socialGithub: "https://github.com/codecraftbd",
    announcementBar: "",
    announcementBar_bn: "",
    announcementBarEnabled: false,
    statsProjects: "150+",
    statsClients: "80+",
    statsYears: "5+",
    statsSatisfaction: "99%",
    statsTagline: "Numbers that speak for themselves",
    statsTagline_bn: "সংখ্যাই বলে দেয় সব কিছু",
    // SEO
    metaTitle: "Code Craft BD — ডিজিটাল এজেন্সি | Web, AI & SEO",
    metaTitle_bn: "কোড ক্রাফট বিডি — ওয়েব, AI ও SEO সেবা | বাংলাদেশ",
    metaDescription: "Code Craft BD — Professional web development, AI automation, SEO, video editing & brand design. Bangladesh's top digital agency.",
    metaDescription_bn: "কোড ক্রাফট বিডি — বাংলাদেশের শীর্ষ ডিজিটাল এজেন্সি। কাস্টম ওয়েব, AI অটোমেশন, SEO, ভিডিও এডিটিং ও ব্র্যান্ড ডিজাইন।",
    metaKeywords: "web development Bangladesh, AI automation, SEO Bangladesh, digital agency Dhaka, Code Craft BD, ওয়েব ডেভেলপমেন্ট, ডিজিটাল এজেন্সি ঢাকা",
    ogImageUrl: "https://codecraftbd.info/og-image.jpg",
    schemaType: "LocalBusiness",
    googleAnalyticsId: "",
    facebookPixelId: "",
    googleSearchConsoleId: "",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#ef4444",
    accentColor: "#f97316",
    pricingCurrencyDefault: "BDT",
    usdToBdtRate: "110",
  };
}

function readAllSettings(): Record<string, string | boolean> {
  const defaults = getDefaults();
  if (!fs.existsSync(SETTINGS_FILE)) return defaults;
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8")) };
  } catch {
    return defaults;
  }
}

/** GET /api/settings-public — no auth, returns only safe public fields */
export async function GET() {
  const all = readAllSettings();
  const pub: Record<string, string | boolean> = {};
  for (const key of PUBLIC_FIELDS) {
    if (key in all) pub[key] = all[key];
  }
  return NextResponse.json(pub, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
