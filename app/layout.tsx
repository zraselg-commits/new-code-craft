import type { Metadata } from "next";
import { Inter, Playfair_Display, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import AnalyticsBeacon from "@/components/AnalyticsBeacon";
import NextTopLoader from "nextjs-toploader";
import * as fs from "fs";
import * as path from "path";

// Force dynamic — re-reads site-settings.json on every request
// Admin panel changes take effect IMMEDIATELY without rebuild
export const dynamic = "force-dynamic";
export const revalidate = 0;

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
  preload: true,
  variable: "--font-playfair",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-hind-siliguri",
});

// Read settings at runtime (called fresh on every request)
function getSettings(): Record<string, string> {
  try {
    const file = path.join(process.cwd(), "scripts", "site-settings.json");
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
  } catch {}
  return {};
}

const SITE_URL = "https://codecraftbd.info";

// generateMetadata runs on every request — metadata always up to date
export async function generateMetadata(): Promise<Metadata> {
  const s = getSettings();
  const META_TITLE = s.metaTitle || "Code Craft BD — ডিজিটাল এজেন্সি | Web, AI & SEO";
  const META_DESC = s.metaDescription || "Code Craft BD — Professional web development, AI automation, SEO, video editing & brand design. Bangladesh's top digital agency.";
  const OG_IMAGE = s.ogImageUrl || `${SITE_URL}/og-image.jpg`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: META_TITLE,
      template: `%s | Code Craft BD`,
    },
    description: META_DESC,
    keywords: s.metaKeywords || "web development Bangladesh, AI automation, SEO Bangladesh, digital agency Dhaka, Code Craft BD, ওয়েব ডেভেলপমেন্ট, ডিজিটাল এজেন্সি ঢাকা",
    authors: [{ name: "Code Craft BD", url: SITE_URL }],
    creator: "Code Craft BD",
    publisher: "Code Craft BD",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: META_TITLE,
      description: s.metaDescription_bn
        ? `${META_DESC} | ${s.metaDescription_bn}`
        : META_DESC,
      siteName: "Code Craft BD",
      type: "website",
      url: SITE_URL,
      locale: "bn_BD",
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: "Code Craft BD — ডিজিটাল এজেন্সি",
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: META_TITLE,
      description: META_DESC,
      site: "@codecraftbd",
      creator: "@codecraftbd",
      images: [OG_IMAGE],
    },
    alternates: {
      canonical: SITE_URL,
      languages: {
        "bn": SITE_URL,
        "en": SITE_URL,
        "x-default": SITE_URL,
      },
    },
    icons: {
      icon: [
        { url: s.faviconUrl || "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      shortcut: s.faviconUrl || "/favicon.svg",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
    verification: {
      google: s.googleSearchConsoleId || undefined,
    },
    category: "technology",
  };
}

// Inline theme script to prevent flash of wrong theme
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else if(t==='dark'){document.documentElement.classList.add('dark')}else{if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}}catch(e){try{if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e2){document.documentElement.classList.add('dark')}}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Read settings fresh on every render
  const s = getSettings();
  const META_TITLE = s.metaTitle || "Code Craft BD — ডিজিটাল এজেন্সি | Web, AI & SEO";
  const META_DESC = s.metaDescription || "Code Craft BD — Professional web development, AI automation, SEO, video editing & brand design. Bangladesh's top digital agency.";
  const OG_IMAGE = s.ogImageUrl || `${SITE_URL}/og-image.jpg`;
  const gaId = s.googleAnalyticsId;
  const pixelId = s.facebookPixelId;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": s.schemaType || "LocalBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: "Code Craft BD",
    alternateName: "কোড ক্রাফট বিডি",
    url: SITE_URL,
    logo: s.logoUrl || `${SITE_URL}/logo.png`,
    image: OG_IMAGE,
    description: META_DESC,
    telephone: s.contactPhone || "+880 1700-000000",
    email: s.contactEmail || "hello@codecraftbd.info",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dhaka",
      addressCountry: "BD",
      streetAddress: s.contactAddress || "Dhaka, Bangladesh",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 23.8103,
      longitude: 90.4125,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "22:00",
    },
    areaServed: ["BD", "US", "GB", "CA", "AU"],
    sameAs: [
      s.socialFacebook || "https://facebook.com/codecraftbd",
      s.socialLinkedin || "https://linkedin.com/company/codecraftbd",
      s.socialTwitter || "https://twitter.com/codecraftbd",
      s.socialGithub || "https://github.com/codecraftbd",
    ].filter(Boolean),
    priceRange: "$$",
    currenciesAccepted: "BDT, USD",
    paymentAccepted: "Cash, bKash, Nagad, Bank Transfer",
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 23.8103,
        longitude: 90.4125,
      },
      geoRadius: "5000",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Code Craft BD",
    inLanguage: ["bn", "en"],
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="bn" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Theme init — prevents flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/* Preloads */}
        <link rel="preload" as="image" href={s.heroImageUrl || "/hero-main.jpg"} fetchPriority="high" />

        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* Additional meta tags */}
        <meta name="theme-color" content={s.primaryColor || "#ef4444"} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={s.siteName || "Code Craft BD"} />
        <meta name="format-detection" content="telephone=no" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* Google Analytics 4 */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{page_path:window.location.pathname});`,
              }}
            />
          </>
        )}

        {/* Facebook Pixel */}
        {pixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`,
            }}
          />
        )}
      </head>
      <body className={`${inter.className} ${hindSiliguri.variable} ${playfair.variable}`} suppressHydrationWarning>
        <NextTopLoader color="#f97316" height={3} showSpinner={false} easing="ease" speed={200} />
        <Providers>{children}</Providers>
        <WhatsAppWidget
          waPhone={(s.whatsappNumber || '+8801700000000').replace(/\D/g, '')}
          agentName={s.siteName || 'Code Craft BD'}
          position="left"
        />
        <AnalyticsBeacon />
        {/* Service Worker — production only */}
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator && location.hostname !== 'localhost' && !location.hostname.match(/^192\\.168\\.|^10\\.|^172\\.(1[6-9]|2[0-9]|3[01])\\./)){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').then(r=>{r.addEventListener('updatefound',()=>{const w=r.installing;w&&w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller){w.postMessage({type:'SKIP_WAITING'})}})})}).catch(()=>{});})}`}} />
      </body>
    </html>
  );
}
