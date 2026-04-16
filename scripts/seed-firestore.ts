/**
 * Seed Firestore with initial services and packages data.
 *
 * Run with:
 *   npx tsx scripts/seed-firestore.ts
 *
 * Prerequisites: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY must be set.
 */

import * as admin from "firebase-admin";

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID ||
  "";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.");
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
}

const db = admin.firestore();

// ─── Seed Data ────────────────────────────────────────────────────────────────

type ServiceSeed = {
  title: string;
  slug: string;
  category: string;
  description: string;
  imageUrl: string | null;
  tags: string[];
  isActive: boolean;
};

type PackageSeed = {
  name: string;
  tier: string;
  price: string;
  features: string[];
  deliveryDays: number;
  revisions: number | null;
  isPopular: boolean;
};

const services: (ServiceSeed & { packages: PackageSeed[] })[] = [
  {
    title: "Web Design & Development",
    slug: "web-design-development",
    category: "Development",
    description: "Custom, high-performance websites and web applications built with modern technologies. From landing pages to full-stack platforms, we craft digital experiences that convert visitors into customers.",
    imageUrl: null,
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    isActive: true,
    packages: [
      {
        name: "Starter",
        tier: "starter",
        price: "299",
        features: ["5-page website", "Responsive design", "Contact form", "Basic SEO", "1 revision round"],
        deliveryDays: 7,
        revisions: 1,
        isPopular: false,
      },
      {
        name: "Professional",
        tier: "professional",
        price: "799",
        features: ["Up to 15 pages", "Custom UI design", "CMS integration", "Advanced SEO", "3 revision rounds", "Performance optimization"],
        deliveryDays: 14,
        revisions: 3,
        isPopular: true,
      },
      {
        name: "Enterprise",
        tier: "enterprise",
        price: "1999",
        features: ["Unlimited pages", "Full-stack development", "Custom CMS", "E-commerce integration", "API development", "Unlimited revisions", "6-month support"],
        deliveryDays: 30,
        revisions: null,
        isPopular: false,
      },
    ],
  },
  {
    title: "SEO Optimization",
    slug: "seo-optimization",
    category: "Marketing",
    description: "Data-driven SEO strategies that boost your search rankings and drive organic traffic. We combine technical SEO, content strategy, and link building to grow your online presence sustainably.",
    imageUrl: null,
    tags: ["SEO", "Google Analytics", "Keyword Research", "Link Building"],
    isActive: true,
    packages: [
      {
        name: "Basic SEO",
        tier: "starter",
        price: "149",
        features: ["10 keyword optimization", "On-page SEO audit", "Meta tags optimization", "Google Search Console setup", "Monthly report"],
        deliveryDays: 14,
        revisions: 2,
        isPopular: false,
      },
      {
        name: "Growth SEO",
        tier: "professional",
        price: "399",
        features: ["30 keyword optimization", "Technical SEO audit", "Content strategy", "Backlink analysis", "Competitor analysis", "Bi-weekly reports"],
        deliveryDays: 14,
        revisions: 3,
        isPopular: true,
      },
      {
        name: "Authority SEO",
        tier: "enterprise",
        price: "999",
        features: ["Unlimited keywords", "Full technical audit", "Content creation", "Link building campaign", "Local SEO", "Weekly reports", "Dedicated SEO manager"],
        deliveryDays: 30,
        revisions: null,
        isPopular: false,
      },
    ],
  },
  {
    title: "Social Media Marketing",
    slug: "social-media-marketing",
    category: "Marketing",
    description: "Strategic social media management that builds your brand, grows your audience, and drives engagement. We create compelling content and run targeted campaigns across all major platforms.",
    imageUrl: null,
    tags: ["Facebook", "Instagram", "LinkedIn", "Content Creation"],
    isActive: true,
    packages: [
      {
        name: "Starter",
        tier: "starter",
        price: "199",
        features: ["2 platforms", "12 posts/month", "Community management", "Basic analytics", "Monthly strategy call"],
        deliveryDays: 7,
        revisions: 2,
        isPopular: false,
      },
      {
        name: "Growth",
        tier: "professional",
        price: "499",
        features: ["4 platforms", "30 posts/month", "Stories & Reels", "Community management", "Paid ad management ($200 budget)", "Weekly analytics report"],
        deliveryDays: 7,
        revisions: 3,
        isPopular: true,
      },
      {
        name: "Dominator",
        tier: "enterprise",
        price: "1299",
        features: ["All platforms", "Daily posting", "Influencer outreach", "Video production (4/month)", "Full ad management", "Crisis management", "Dedicated account manager"],
        deliveryDays: 7,
        revisions: null,
        isPopular: false,
      },
    ],
  },
  {
    title: "AI Automation",
    slug: "ai-automation",
    category: "AI & Automation",
    description: "Harness the power of AI to automate repetitive tasks, enhance customer experiences, and unlock new efficiencies. From chatbots to workflow automation, we build intelligent systems that work 24/7.",
    imageUrl: null,
    tags: ["AI", "ChatGPT", "Automation", "n8n", "Zapier"],
    isActive: true,
    packages: [
      {
        name: "Starter Bot",
        tier: "starter",
        price: "349",
        features: ["AI chatbot setup", "FAQ automation", "Basic integrations", "Email automation", "2 weeks of optimization"],
        deliveryDays: 14,
        revisions: 2,
        isPopular: false,
      },
      {
        name: "Smart Workflow",
        tier: "professional",
        price: "899",
        features: ["Advanced AI chatbot", "CRM integration", "Lead qualification", "Custom workflow automation", "Analytics dashboard", "1 month of optimization"],
        deliveryDays: 21,
        revisions: 3,
        isPopular: true,
      },
      {
        name: "Enterprise AI",
        tier: "enterprise",
        price: "2499",
        features: ["Custom AI model", "Full business automation", "ERP/CRM/E-commerce integration", "Voice AI", "AI content generation", "24/7 monitoring", "Dedicated AI engineer"],
        deliveryDays: 45,
        revisions: null,
        isPopular: false,
      },
    ],
  },
  {
    title: "E-Commerce Solutions",
    slug: "ecommerce-solutions",
    category: "Development",
    description: "Complete e-commerce platforms that drive sales and scale with your business. From product listings to payment processing, we build stores that convert and retain customers.",
    imageUrl: null,
    tags: ["Shopify", "WooCommerce", "Stripe", "Payment Gateway"],
    isActive: true,
    packages: [
      {
        name: "Shop Starter",
        tier: "starter",
        price: "599",
        features: ["Up to 50 products", "Payment gateway", "Order management", "Basic inventory", "Mobile responsive", "SSL certificate"],
        deliveryDays: 14,
        revisions: 2,
        isPopular: false,
      },
      {
        name: "Shop Pro",
        tier: "professional",
        price: "1499",
        features: ["Unlimited products", "Multi-currency", "Advanced inventory", "Discount system", "Email marketing integration", "Analytics dashboard", "SEO optimization"],
        deliveryDays: 21,
        revisions: 3,
        isPopular: true,
      },
      {
        name: "Shop Enterprise",
        tier: "enterprise",
        price: "3999",
        features: ["Custom storefront", "Multi-vendor support", "B2B portal", "Custom checkout", "ERP integration", "Advanced analytics", "Dedicated support"],
        deliveryDays: 45,
        revisions: null,
        isPopular: false,
      },
    ],
  },
  {
    title: "Brand Identity Design",
    slug: "brand-identity-design",
    category: "Design",
    description: "Craft a powerful brand identity that resonates with your target audience. From logos to full brand guidelines, we create visual identities that make your business unforgettable.",
    imageUrl: null,
    tags: ["Logo Design", "Brand Guidelines", "Typography", "Color Palette"],
    isActive: true,
    packages: [
      {
        name: "Logo Only",
        tier: "starter",
        price: "129",
        features: ["3 logo concepts", "2 revision rounds", "PNG, SVG, PDF files", "Color variations", "Brand color palette"],
        deliveryDays: 5,
        revisions: 2,
        isPopular: false,
      },
      {
        name: "Brand Kit",
        tier: "professional",
        price: "449",
        features: ["Logo (primary + variations)", "Brand guidelines PDF", "Business card design", "Email signature", "Social media kit", "Font selection", "3 revision rounds"],
        deliveryDays: 10,
        revisions: 3,
        isPopular: true,
      },
      {
        name: "Full Brand",
        tier: "enterprise",
        price: "1199",
        features: ["Complete brand identity", "Brand strategy document", "All collateral design", "Presentation template", "Brand video intro", "Unlimited revisions", "Brand management guide"],
        deliveryDays: 21,
        revisions: null,
        isPopular: false,
      },
    ],
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting Firestore seed...\n");

  const now = new Date().toISOString();

  for (const { packages, ...serviceData } of services) {
    const existingSnap = await db
      .collection("services")
      .where("slug", "==", serviceData.slug)
      .limit(1)
      .get();

    let serviceId: string;

    if (!existingSnap.empty) {
      serviceId = existingSnap.docs[0].id;
      console.log(`  ⏭  Service already exists: ${serviceData.title} (${serviceId})`);
    } else {
      const ref = db.collection("services").doc();
      serviceId = ref.id;
      await ref.set({ ...serviceData, createdAt: now });
      console.log(`  ✅ Created service: ${serviceData.title} (${serviceId})`);
    }

    for (const pkg of packages) {
      const existingPkg = await db
        .collection("packages")
        .where("serviceId", "==", serviceId)
        .where("tier", "==", pkg.tier)
        .limit(1)
        .get();

      if (!existingPkg.empty) {
        console.log(`     ⏭  Package already exists: ${pkg.name}`);
        continue;
      }

      const pkgRef = db.collection("packages").doc();
      await pkgRef.set({ ...pkg, serviceId, createdAt: now });
      console.log(`     ✅ Created package: ${pkg.name} (${pkgRef.id})`);
    }
  }

  console.log("\n🎉 Firestore seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
