import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { revalidatePath } from "next/cache";
import * as fs from "fs";
import * as path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "scripts", "site-settings.json");

function readSettings() {
  if (!fs.existsSync(SETTINGS_FILE)) return getDefaults();
  try { return { ...getDefaults(), ...JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8")) }; }
  catch { return getDefaults(); }
}

function getDefaults() {
  return {
    siteName: "Code Craft BD",
    siteName_bn: "কোড ক্রাফট বিডি",
    tagline: "Digital Agency & Web Solutions",
    tagline_bn: "ডিজিটাল এজেন্সি ও ওয়েব সমাধান",
    heroHeading: "We Build, Grow & Transform Your Digital Presence.",
    heroHeading_bn: "আমরা তৈরি করি, বৃদ্ধি করি ও রূপান্তরিত করি আপনার ডিজিটাল উপস্থিতি।",
    heroSubheading: "Custom websites, AI automation, SEO & creative media — everything your business needs to thrive online.",
    heroSubheading_bn: "কাস্টম ওয়েবসাইট, AI অটোমেশন, SEO ও ক্রিয়েটিভ মিডিয়া — আপনার ব্যবসার অনলাইন সাফল্যের জন্য সব কিছু।",
    heroCtaText: "Get a Free Consultation",
    heroCtaText_bn: "বিনামূল্যে পরামর্শ নিন",
    heroCtaSecondaryText: "Our Portfolio",
    heroCtaSecondaryText_bn: "আমাদের পোর্টফোলিও",
    heroCtaPrimaryUrl: "/contact",
    heroCtaSecondaryUrl: "/portfolio",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#ef4444",
    accentColor: "#f97316",
    footerText: "© 2026 Code Craft BD. All rights reserved.",
    footerText_bn: "© ২০২৬ কোড ক্রাফট বিডি। সর্বস্বত্ব সংরক্ষিত।",
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
    metaTitle: "Code Craft BD — ডিজিটাল এজেন্সি | Web, AI & SEO",
    metaTitle_bn: "কোড ক্রাফট বিডি — ওয়েব, AI ও SEO সেবা | বাংলাদেশ",
    metaDescription: "Code Craft BD — Professional web development, AI automation, SEO, video editing & brand design. Bangladesh's top digital agency.",
    metaDescription_bn: "কোড ক্রাফট বিডি — বাংলাদেশের শীর্ষ ডিজিটাল এজেন্সি। কাস্টম ওয়েব, AI অটোমেশন, SEO, ভিডিও এডিটিং ও ব্র্যান্ড ডিজাইন।",
    metaKeywords: "web development Bangladesh, AI automation, SEO Bangladesh, digital agency Dhaka, Code Craft BD, ওয়েব ডেভেলপমেন্ট, ডিজিটাল এজেন্সি ঢাকা",
    ogImageUrl: "https://codecraftbd.info/og-image.jpg",
    schemaType: "LocalBusiness",
    announcementBar: "",
    announcementBar_bn: "",
    announcementBarEnabled: false,
    maintenanceMode: false,
    googleAnalyticsId: "",
    facebookPixelId: "",
    googleSearchConsoleId: "",
    statsProjects: "150+",
    statsClients: "80+",
    statsYears: "5+",
    statsSatisfaction: "99%",
    statsTagline: "Numbers that speak for themselves",
    statsTagline_bn: "সংখ্যাই বলে দেয় সব কিছু",
    heroImageUrl: "/hero-main.jpg",
    pricingCurrencyDefault: "BDT",
    usdToBdtRate: "110",
    telegramBotToken: "",
    telegramChatId: "",
  };
}

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  return NextResponse.json(readSettings());
}

export async function PUT(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  try {
    const body = await req.json();
    const current = readSettings();
    const updated = { ...current, ...body };
    fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    // Revalidate ALL pages — admin changes show instantly, no rebuild/restart needed
    revalidatePath("/", "layout");
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
