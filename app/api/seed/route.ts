import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb } from "@lib/firebase-admin";

const SEED_KEY = process.env.SEED_SECRET || "";

const services = [
  {
    title: "Web Design & Development",
    slug: "web-design-development",
    category: "Development",
    description: "Custom, high-performance websites and web applications built with modern technologies. From landing pages to full-stack platforms, we craft digital experiences that convert visitors into customers.",
    imageUrl: null,
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    isActive: true,
    packages: [
      { name: "Starter", tier: "starter", price: "299", features: ["5-page website", "Responsive design", "Contact form", "Basic SEO", "1 revision round"], deliveryDays: 7, revisions: 1, isPopular: false },
      { name: "Professional", tier: "professional", price: "799", features: ["Up to 15 pages", "Custom UI design", "CMS integration", "Advanced SEO", "3 revision rounds", "Performance optimization"], deliveryDays: 14, revisions: 3, isPopular: true },
      { name: "Enterprise", tier: "enterprise", price: "1999", features: ["Unlimited pages", "Full-stack development", "Custom CMS", "E-commerce integration", "API development", "Unlimited revisions", "6-month support"], deliveryDays: 30, revisions: null, isPopular: false },
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
      { name: "Basic SEO", tier: "starter", price: "149", features: ["10 keyword optimization", "On-page SEO audit", "Meta tags optimization", "Google Search Console setup", "Monthly report"], deliveryDays: 14, revisions: 2, isPopular: false },
      { name: "Growth SEO", tier: "professional", price: "399", features: ["30 keyword optimization", "Technical SEO audit", "Content strategy", "Backlink analysis", "Competitor analysis", "Bi-weekly reports"], deliveryDays: 14, revisions: 3, isPopular: true },
      { name: "Authority SEO", tier: "enterprise", price: "999", features: ["Unlimited keywords", "Full technical audit", "Content creation", "Link building campaign", "Local SEO", "Weekly reports", "Dedicated SEO manager"], deliveryDays: 30, revisions: null, isPopular: false },
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
      { name: "Starter", tier: "starter", price: "199", features: ["2 platforms", "12 posts/month", "Community management", "Basic analytics", "Monthly strategy call"], deliveryDays: 7, revisions: 2, isPopular: false },
      { name: "Growth", tier: "professional", price: "499", features: ["4 platforms", "30 posts/month", "Stories & Reels", "Community management", "Paid ad management", "Weekly analytics report"], deliveryDays: 7, revisions: 3, isPopular: true },
      { name: "Dominator", tier: "enterprise", price: "1299", features: ["All platforms", "Daily posting", "Influencer outreach", "Video production (4/month)", "Full ad management", "Dedicated account manager"], deliveryDays: 7, revisions: null, isPopular: false },
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
      { name: "Starter Bot", tier: "starter", price: "349", features: ["AI chatbot setup", "FAQ automation", "Basic integrations", "Email automation", "2 weeks of optimization"], deliveryDays: 14, revisions: 2, isPopular: false },
      { name: "Smart Workflow", tier: "professional", price: "899", features: ["Advanced AI chatbot", "CRM integration", "Lead qualification", "Custom workflow automation", "Analytics dashboard", "1 month of optimization"], deliveryDays: 21, revisions: 3, isPopular: true },
      { name: "Enterprise AI", tier: "enterprise", price: "2499", features: ["Custom AI model", "Full business automation", "ERP/CRM/E-commerce integration", "Voice AI", "AI content generation", "24/7 monitoring", "Dedicated AI engineer"], deliveryDays: 45, revisions: null, isPopular: false },
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
      { name: "Shop Starter", tier: "starter", price: "599", features: ["Up to 50 products", "Payment gateway", "Order management", "Basic inventory", "Mobile responsive", "SSL certificate"], deliveryDays: 14, revisions: 2, isPopular: false },
      { name: "Shop Pro", tier: "professional", price: "1499", features: ["Unlimited products", "Multi-currency", "Advanced inventory", "Discount system", "Email marketing integration", "Analytics dashboard", "SEO optimization"], deliveryDays: 21, revisions: 3, isPopular: true },
      { name: "Shop Enterprise", tier: "enterprise", price: "3999", features: ["Custom storefront", "Multi-vendor support", "B2B portal", "Custom checkout", "ERP integration", "Advanced analytics", "Dedicated support"], deliveryDays: 45, revisions: null, isPopular: false },
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
      { name: "Logo Only", tier: "starter", price: "129", features: ["3 logo concepts", "2 revision rounds", "PNG, SVG, PDF files", "Color variations", "Brand color palette"], deliveryDays: 5, revisions: 2, isPopular: false },
      { name: "Brand Kit", tier: "professional", price: "449", features: ["Logo (primary + variations)", "Brand guidelines PDF", "Business card design", "Email signature", "Social media kit", "Font selection", "3 revision rounds"], deliveryDays: 10, revisions: 3, isPopular: true },
      { name: "Full Brand", tier: "enterprise", price: "1199", features: ["Complete brand identity", "Brand strategy document", "All collateral design", "Presentation template", "Brand video intro", "Unlimited revisions", "Brand management guide"], deliveryDays: 21, revisions: null, isPopular: false },
    ],
  },
];

const blogPosts = [
  {
    slug: "how-we-built-a-50k-user-ecommerce-platform-in-30-days",
    title: "How We Built a 50k-User E-Commerce Platform in 30 Days",
    excerpt: "A behind-the-scenes look at how Code Craft BD delivered a full-scale multi-vendor marketplace with bKash/Nagad payment integration in just one month.",
    content: `<h2>The Challenge</h2><p>Our client, BazaarBD, came to us with an ambitious goal: launch a fully functional multi-vendor marketplace for Bangladesh's growing online retail market within 30 days. The platform needed to support local payment gateways (bKash and Nagad), a real-time seller dashboard, and mobile-first checkout — all before a national campaign launch.</p><h2>Our Approach</h2><p>We broke the project into four one-week sprints. Week one was purely architecture: choosing WooCommerce as the foundation (given the client's team's familiarity), setting up cloud hosting on a multi-region AWS stack, and designing the database schema for multi-vendor inventory.</p><p>Week two focused on the seller portal and payment integrations. The bKash API documentation was thorough, but Nagad's was less so — we spent three days working through their sandbox environment before achieving stable transaction flows.</p><h2>The Technical Stack</h2><p>We went with WooCommerce + custom PHP plugins, MySQL with read replicas, Redis for session caching, and Cloudinary for image management. A headless approach would have been faster to develop but riskier to maintain for a client team without React experience.</p><h2>Results</h2><p>BazaarBD launched on day 29 to 12,000 registered users on day one. Within 30 days of launch, the platform was handling 50,000 daily active users with a 99.7% uptime. Cart abandonment dropped 22% compared to their previous provider thanks to the optimised checkout flow.</p><p>This project proved that aggressive timelines are achievable when architecture decisions are made early and the client trusts the team's judgment.</p>`,
    coverImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
    tags: ["E-Commerce", "WooCommerce", "Bangladesh", "Case Study"],
    published: true,
    publishedAt: "2024-11-15T08:00:00.000Z",
    authorId: null,
    authorName: "Code Craft BD Team",
  },
  {
    slug: "seo-in-bangladesh-what-works-in-2025",
    title: "SEO in Bangladesh: What Actually Works in 2025",
    excerpt: "Google's algorithm has changed — here's the data-backed playbook we use for Bengali and English content to rank in Bangladesh's competitive digital market.",
    content: `<h2>Why Bangladesh SEO Is Different</h2><p>Bangladesh presents a unique SEO landscape. Over 70% of searches happen on mobile devices, average connection speeds are lower than in South Asia broadly, and a significant portion of users search in Bangla script — yet most websites are optimised only for English keywords.</p><h2>Core Web Vitals Are Non-Negotiable</h2><p>We've audited 60+ Bangladeshi business websites in 2024. The single biggest ranking factor gap is Core Web Vitals: specifically Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS). The average LCP for a local fashion e-commerce site is 6.2 seconds. Google's threshold for "good" is 2.5 seconds. Fixing this alone moved one client from page 3 to position 4 within 8 weeks.</p><h2>Bengali Keyword Strategy</h2><p>Tools like SEMrush and Ahrefs severely undercount Bengali search volume. We've developed an internal workflow that combines Google Search Console data, Google Trends for "bd" region, and manual Suggest API scraping to build comprehensive keyword maps in both scripts.</p><h2>Link Building in 2025</h2><p>Guest posting on Bangladeshi news portals (Prothom Alo digital, The Daily Star, Business Standard BD) still carries significant weight. More importantly, local citation building across Google Business Profile, Facebook Business pages, and local directories is underutilised and highly effective for location-based searches.</p><h2>The Results Formula</h2><p>Our six-month SEO engagements consistently follow this pattern: technical audit + fix in month 1, content strategy in month 2–3, link building in month 4–6, with reporting throughout. Clients see meaningful organic growth starting around month 3 and compounding through month 12.</p>`,
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    tags: ["SEO", "Bangladesh", "Digital Marketing", "Content"],
    published: true,
    publishedAt: "2024-10-28T08:00:00.000Z",
    authorId: null,
    authorName: "Code Craft BD Team",
  },
  {
    slug: "ai-chatbots-for-small-businesses-a-practical-guide",
    title: "AI Chatbots for Small Businesses: A Practical Guide for 2025",
    excerpt: "You don't need a massive budget to deploy AI automation. Here's how small businesses in Bangladesh are using GPT-powered chatbots to handle customer queries 24/7.",
    content: `<h2>The Real Cost of Missing Customer Messages</h2><p>The average small business in Bangladesh misses 40% of inbound customer queries because they come outside business hours or during busy periods. Each missed query represents a lost sale — and increasingly, a customer who will go to a competitor.</p><h2>What AI Chatbots Actually Do Well</h2><p>Modern AI chatbots powered by GPT-4 can handle: answering FAQ-style questions about products and services, qualifying leads by asking the right questions, taking order details and logging them to a spreadsheet or CRM, and routing complex enquiries to a human with a summary of the conversation.</p><p>They do not handle: nuanced complaints requiring empathy, complex negotiations, or anything requiring access to real-time data they haven't been given.</p><h2>The Setup We Recommend</h2><p>For most small businesses, we deploy a WhatsApp Business API chatbot through a Meta-approved BSP (Business Solution Provider). The bot is trained on the client's FAQ, product catalogue, and business policies. Integration with a Google Sheet allows the client team to see all conversations and follow up on hot leads.</p><h2>Realistic Costs and Timeline</h2><p>A basic setup costs $349–$899 depending on complexity and runs in 10–14 days. Monthly maintenance is typically $50–$150 depending on volume. Most clients see positive ROI within 60 days, measured by leads captured outside business hours.</p><h2>Getting Started</h2><p>The most important first step is documenting your frequently asked questions honestly. If you can answer "what are your prices?", "how long does delivery take?", and "do you offer custom orders?" in clear, simple language, you have everything an AI chatbot needs to start helping your customers.</p>`,
    coverImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80",
    tags: ["AI", "Automation", "Small Business", "WhatsApp"],
    published: true,
    publishedAt: "2024-09-12T08:00:00.000Z",
    authorId: null,
    authorName: "Code Craft BD Team",
  },
  {
    slug: "why-your-website-is-losing-you-customers-on-mobile",
    title: "Why Your Website Is Losing You Customers on Mobile",
    excerpt: "83% of Bangladeshi internet users browse on mobile. If your site isn't optimised for small screens and slow connections, you're handing sales to your competitors.",
    content: `<h2>The Mobile Reality in Bangladesh</h2><p>As of 2024, Bangladesh has over 120 million internet users, and 83% of them access the web primarily on mobile devices. Average mobile data speeds hover around 15 Mbps — fast enough for most content, but punishing for bloated, unoptimised websites.</p><h2>The Five Most Common Mobile Failures We See</h2><p><strong>1. Text too small to read.</strong> Many sites still use 12–13px body text. On a 5.5-inch screen, this forces pinch-zoom, and most users will simply leave.</p><p><strong>2. Buttons too small to tap.</strong> Google's minimum tap target is 48×48px. We regularly see contact buttons at 32×20px — impossible to reliably hit with a thumb.</p><p><strong>3. Images not resized for mobile.</strong> Serving a 2MB hero image to a mobile user kills your LCP score and costs your users real money in data charges.</p><p><strong>4. Horizontal scrolling.</strong> Any element wider than the viewport breaks the mobile experience completely. We find this most often with tables, code blocks, and un-responsive navigation menus.</p><p><strong>5. Intrusive pop-ups.</strong> Google penalises sites with pop-ups that cover content on mobile. We still see this on 40% of audited Bangladeshi business sites.</p><h2>The Fix</h2><p>A proper mobile audit takes 2–4 hours. We test on real devices (not just browser emulation), run Lighthouse, and check PageSpeed Insights with throttled connections. Most issues can be resolved in a single sprint. The ROI — measured in reduced bounce rate and increased enquiries — is typically visible within 30 days.</p>`,
    coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80",
    tags: ["Mobile", "Web Design", "Performance", "UX"],
    published: true,
    publishedAt: "2024-08-05T08:00:00.000Z",
    authorId: null,
    authorName: "Code Craft BD Team",
  },
  {
    slug: "social-media-marketing-that-actually-works-in-bangladesh",
    title: "Social Media Marketing That Actually Works in Bangladesh",
    excerpt: "Facebook is still king in Bangladesh — but the algorithm has changed. Here's the content strategy we use to grow our clients' audiences organically in 2025.",
    content: `<h2>Platform Priorities for Bangladesh</h2><p>Facebook remains the dominant platform in Bangladesh with over 47 million active users. YouTube is the second most important platform for discovery, especially for how-to and product review content. Instagram and TikTok are growing fast among under-30 audiences. LinkedIn is underutilised but very effective for B2B services.</p><h2>What the Facebook Algorithm Rewards in 2025</h2><p>Facebook's algorithm in 2025 heavily prioritises Reels (short vertical video), content that generates meaningful comments (not just likes), and posts shared in private groups. Simple image posts with text overlays — once the dominant format in Bangladesh — now see dramatically reduced organic reach.</p><h2>Our Content Framework</h2><p>We structure social content around three buckets: 60% educational content (tips, how-tos, industry insights), 30% social proof (client results, testimonials, behind-the-scenes), and 10% direct promotional content. This ratio keeps audiences engaged between promotional posts and builds trust over time.</p><h2>Bengali vs English Content</h2><p>For consumer brands targeting the Bangladeshi market, Bengali content consistently outperforms English by 2–4× in engagement rates. However, English content performs better for professional audiences and helps with SEO cross-pollination when content is repurposed as blog posts.</p><h2>What We Track</h2><p>We care about reach, saves, profile visits, and direct messages — not vanity metrics like follower count. A page with 5,000 engaged followers that generates 20 enquiries per month outperforms a 50,000-follower page that generates none.</p>`,
    coverImage: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&q=80",
    tags: ["Social Media", "Facebook", "Marketing", "Bangladesh"],
    published: true,
    publishedAt: "2024-07-20T08:00:00.000Z",
    authorId: null,
    authorName: "Code Craft BD Team",
  },
  {
    slug: "brand-identity-design-mistakes-bangladeshi-businesses-make",
    title: "5 Brand Identity Mistakes Bangladeshi Businesses Make (And How to Fix Them)",
    excerpt: "A weak brand costs you more than the price of a good logo. Here are the five most common brand identity mistakes we see — and what to do instead.",
    content: `<h2>Why Brand Identity Matters</h2><p>Brand identity is the visual and verbal system that makes your business recognisable and trustworthy. For a Bangladeshi business competing in an increasingly crowded online space, a strong brand identity is the difference between being remembered and being ignored.</p><h2>Mistake 1: Copying Competitors' Colours</h2><p>If every restaurant in your city uses red and yellow (because McDonald's does), yours will disappear into the noise. Your brand colours should be chosen based on your target customer's psychology and your desired positioning — not based on what competitors are doing.</p><h2>Mistake 2: Too Many Fonts</h2><p>We regularly see business materials using 4–6 different fonts. A strong brand uses two: one display font for headings and one body font for text. That's it. Consistency creates recognition.</p><h2>Mistake 3: A Logo That Doesn't Scale</h2><p>Your logo needs to work at 16×16px (favicon), on a business card, on a billboard, and embroidered on a polo shirt. A logo with fine details or thin strokes fails at small sizes. Test your logo at every scale before committing.</p><h2>Mistake 4: No Brand Guidelines Document</h2><p>Without a brand guidelines document, every vendor, employee, and collaborator will interpret your brand differently. A simple one-page brand guide covering logo usage, colours, and typography takes two hours to create and saves years of inconsistency.</p><h2>Mistake 5: Treating Brand as a One-Time Exercise</h2><p>Brands evolve. The best companies review their visual identity every 3–5 years and make incremental refinements. This isn't rebranding — it's stewardship. Regular small updates keep a brand feeling current without losing the recognition built over years.</p>`,
    coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80",
    tags: ["Branding", "Design", "Logo", "Business"],
    published: true,
    publishedAt: "2024-06-10T08:00:00.000Z",
    authorId: null,
    authorName: "Code Craft BD Team",
  },
];

export async function POST(req: NextRequest) {
  if (!SEED_KEY) {
    return NextResponse.json({ error: "Seed endpoint is not configured" }, { status: 503 });
  }
  const key = req.headers.get("x-seed-key") || req.nextUrl.searchParams.get("key");
  if (!key || key !== SEED_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const db = getFirestoreDb();
    const now = new Date().toISOString();
    const results: string[] = [];

    for (const { packages, ...serviceData } of services) {
      const existingSnap = await db
        .collection("services")
        .where("slug", "==", serviceData.slug)
        .limit(1)
        .get();

      let serviceId: string;

      if (!existingSnap.empty) {
        serviceId = existingSnap.docs[0].id;
        results.push(`skip service: ${serviceData.title}`);
      } else {
        const ref = db.collection("services").doc();
        serviceId = ref.id;
        await ref.set({ ...serviceData, createdAt: now });
        results.push(`created service: ${serviceData.title} (${serviceId})`);
      }

      for (const pkg of packages) {
        const existingPkg = await db
          .collection("packages")
          .where("serviceId", "==", serviceId)
          .where("tier", "==", pkg.tier)
          .limit(1)
          .get();

        if (!existingPkg.empty) {
          results.push(`  skip package: ${pkg.name}`);
          continue;
        }

        const pkgRef = db.collection("packages").doc();
        await pkgRef.set({ ...pkg, serviceId, createdAt: now });
        results.push(`  created package: ${pkg.name} (${pkgRef.id})`);
      }
    }

    // ── Blog posts ──────────────────────────────────────────
    for (const post of blogPosts) {
      const existing = await db
        .collection("blogPosts")
        .where("slug", "==", post.slug)
        .limit(1)
        .get();

      if (!existing.empty) {
        const docRef = existing.docs[0].ref;
        const data = existing.docs[0].data();
        if (!data.authorName) {
          await docRef.update({ authorName: post.authorName, updatedAt: now });
          results.push(`updated post (authorName): ${post.title}`);
        } else {
          results.push(`skip post: ${post.title}`);
        }
        continue;
      }

      const ref = db.collection("blogPosts").doc();
      await ref.set({ ...post, createdAt: now, updatedAt: now });
      results.push(`created post: ${post.title} (${ref.id})`);
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: "Seed failed", details: String(err) }, { status: 500 });
  }
}
