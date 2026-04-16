import { db } from "./db.js";
import { services, packages, users, blogPosts, orders, contacts } from "./schema.js";
import { eq } from "drizzle-orm";

const serviceData = [
  {
    title: "Custom Web & Admin Panels",
    slug: "web-development",
    category: "development",
    description:
      "Enterprise-grade websites, admin dashboards, e-commerce platforms, and management systems built with modern frameworks. Scalable, secure, and pixel-perfect designs with full CMS integration and mobile responsiveness.",
    imageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80",
    tags: ["web development", "admin panel", "e-commerce", "React", "Node.js"],
    packages: [
      {
        name: "Basic",
        tier: "basic",
        price: "499",
        features: ["5-page landing site", "Mobile responsive", "Contact form", "Basic SEO setup", "2 rounds of revisions"],
        deliveryDays: 7,
        revisions: 2,
        isPopular: false,
      },
      {
        name: "Standard",
        tier: "standard",
        price: "1299",
        features: ["Up to 15 pages", "Custom admin panel", "E-commerce ready", "Advanced SEO", "CMS integration", "5 rounds of revisions"],
        deliveryDays: 14,
        revisions: 5,
        isPopular: true,
      },
      {
        name: "Premium",
        tier: "premium",
        price: "2999",
        features: ["Unlimited pages", "Full custom admin panel", "E-commerce + payments", "Technical SEO audit", "Performance optimization", "Ongoing support 30 days", "Unlimited revisions"],
        deliveryDays: 30,
        revisions: null,
        isPopular: false,
      },
    ],
  },
  {
    title: "AI Agent Automation",
    slug: "ai-automation",
    category: "automation",
    description:
      "Deploy intelligent AI agents for social media management, website chatbots, and business workflow automation. Automate repetitive tasks, reduce costs, and scale your operations on autopilot with cutting-edge AI technology.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    tags: ["AI automation", "chatbot", "workflow", "GPT", "social media bot"],
    packages: [
      {
        name: "Basic",
        tier: "basic",
        price: "399",
        features: ["1 AI chatbot", "Website integration", "FAQ automation", "Basic analytics", "1 revision"],
        deliveryDays: 5,
        revisions: 1,
        isPopular: false,
      },
      {
        name: "Standard",
        tier: "standard",
        price: "999",
        features: ["Up to 3 AI agents", "Social media automation", "Lead generation bot", "Workflow automation", "Analytics dashboard", "3 revisions"],
        deliveryDays: 10,
        revisions: 3,
        isPopular: true,
      },
      {
        name: "Premium",
        tier: "premium",
        price: "2499",
        features: ["Unlimited AI agents", "Full business automation", "Custom AI model fine-tuning", "CRM integration", "24/7 monitoring", "30-day support", "Unlimited revisions"],
        deliveryDays: 21,
        revisions: null,
        isPopular: false,
      },
    ],
  },
  {
    title: "SEO & Digital Growth",
    slug: "seo-growth",
    category: "marketing",
    description:
      "Dominate search rankings with comprehensive technical SEO, strategic content marketing, and performance optimization. Data-driven campaigns that deliver measurable results and sustainable organic traffic growth.",
    imageUrl: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&q=80",
    tags: ["SEO", "digital marketing", "content strategy", "link building", "Google ranking"],
    packages: [
      {
        name: "Basic",
        tier: "basic",
        price: "299",
        features: ["SEO audit report", "Keyword research (50)", "On-page optimization", "Google Search Console setup", "Monthly report"],
        deliveryDays: 7,
        revisions: 1,
        isPopular: false,
      },
      {
        name: "Standard",
        tier: "standard",
        price: "699",
        features: ["Full technical SEO audit", "Keyword research (200)", "Content strategy plan", "Link building (10/month)", "Performance tracking", "Bi-weekly reports"],
        deliveryDays: 14,
        revisions: 3,
        isPopular: true,
      },
      {
        name: "Premium",
        tier: "premium",
        price: "1499",
        features: ["Enterprise SEO strategy", "Unlimited keyword research", "Content creation (4 posts/mo)", "Premium link building", "Competitor analysis", "Weekly reports", "Dedicated SEO manager"],
        deliveryDays: 30,
        revisions: null,
        isPopular: false,
      },
    ],
  },
  {
    title: "Creative Media & Design",
    slug: "creative-media",
    category: "design",
    description:
      "Professional video editing, motion graphics, brand identity design, and social media content creation. Elevate your brand with stunning visuals that captivate your audience and drive engagement across all platforms.",
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
    tags: ["video editing", "motion graphics", "brand design", "social media", "content creation"],
    packages: [
      {
        name: "Basic",
        tier: "basic",
        price: "199",
        features: ["3 short-form videos (60s)", "Basic color grading", "Subtitles/captions", "1 thumbnail design", "2 revisions"],
        deliveryDays: 5,
        revisions: 2,
        isPopular: false,
      },
      {
        name: "Standard",
        tier: "standard",
        price: "549",
        features: ["8 videos (up to 5 min)", "Advanced color grading", "Motion graphics", "Brand kit design", "10 social media posts", "5 revisions"],
        deliveryDays: 10,
        revisions: 5,
        isPopular: true,
      },
      {
        name: "Premium",
        tier: "premium",
        price: "1299",
        features: ["Unlimited videos", "Cinema-grade editing", "Full brand identity", "Social media content strategy", "30 posts/month", "Intro/outro animation", "Unlimited revisions"],
        deliveryDays: 21,
        revisions: null,
        isPopular: false,
      },
    ],
  },
  {
    title: "Social Media Management",
    slug: "social-media-management",
    category: "marketing",
    description:
      "Strategic social media presence management across all major platforms. Content planning, scheduling, community engagement, analytics tracking, and growth strategies that build your brand and drive conversions.",
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    tags: ["social media", "Instagram", "Facebook", "LinkedIn", "content strategy"],
    packages: [
      {
        name: "Basic",
        tier: "basic",
        price: "249",
        features: ["2 platforms", "8 posts/month", "Basic graphics", "Monthly analytics report", "Hashtag research"],
        deliveryDays: 3,
        revisions: 1,
        isPopular: false,
      },
      {
        name: "Standard",
        tier: "standard",
        price: "599",
        features: ["4 platforms", "20 posts/month", "Custom graphics", "Story content", "Community management", "Bi-weekly reports"],
        deliveryDays: 5,
        revisions: 3,
        isPopular: true,
      },
      {
        name: "Premium",
        tier: "premium",
        price: "1199",
        features: ["All platforms", "Daily posts", "Video content", "Influencer outreach", "Paid ads management", "Weekly strategy calls", "Dedicated manager"],
        deliveryDays: 7,
        revisions: null,
        isPopular: false,
      },
    ],
  },
  {
    title: "E-Commerce Solutions",
    slug: "e-commerce-solutions",
    category: "development",
    description:
      "Complete online store setup with payment integration, inventory management, and beautiful storefront design. From Shopify customization to fully custom platforms, we build stores that convert visitors into loyal customers.",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    tags: ["e-commerce", "Shopify", "WooCommerce", "online store", "payment gateway"],
    packages: [
      {
        name: "Basic",
        tier: "basic",
        price: "599",
        features: ["Shopify store setup", "Up to 50 products", "Payment gateway", "Basic theme", "Order management"],
        deliveryDays: 7,
        revisions: 2,
        isPopular: false,
      },
      {
        name: "Standard",
        tier: "standard",
        price: "1499",
        features: ["Custom store design", "Up to 500 products", "Multi-payment options", "Inventory system", "Email marketing setup", "5 revisions"],
        deliveryDays: 14,
        revisions: 5,
        isPopular: true,
      },
      {
        name: "Premium",
        tier: "premium",
        price: "3499",
        features: ["Fully custom platform", "Unlimited products", "Advanced analytics", "Multi-currency support", "API integrations", "Subscription/recurring", "Ongoing support"],
        deliveryDays: 30,
        revisions: null,
        isPopular: false,
      },
    ],
  },
];

const blogData = [
  {
    slug: "why-your-business-needs-a-website-in-2025",
    title: "Why Your Business Needs a Website in 2025",
    excerpt: "In today's digital landscape, having a professional website is no longer optional. Learn why every business needs an online presence and how it drives growth.",
    content: `# Why Your Business Needs a Website in 2025

In today's digital-first world, your website is often the first impression customers have of your business. Whether you're a small startup or an established enterprise, a professional website is essential for growth.

## The Digital Landscape

Over 4.9 billion people use the internet daily. Without a website, you're invisible to the majority of potential customers. A well-designed website serves as your 24/7 salesperson, working around the clock to attract and convert leads.

## Key Benefits

### 1. Credibility and Trust
A professional website instantly builds credibility. 75% of users judge a company's credibility based on their website design. First impressions matter, and your website is often the first touchpoint.

### 2. Reach More Customers
With proper SEO, your website can attract thousands of organic visitors monthly. Unlike a physical store, your website has no geographical limitations — you can reach customers worldwide.

### 3. Cost-Effective Marketing
Compared to traditional advertising, a website offers the best ROI. Content marketing, SEO, and social media integration through your website provide sustainable, long-term growth.

### 4. Data and Analytics
A website gives you valuable insights into customer behavior. Tools like Google Analytics help you understand what your customers want, enabling data-driven decisions.

## Getting Started

The best time to build your website was yesterday. The second best time is today. At rasel.cloud, we specialize in creating fast, beautiful, and conversion-optimized websites that help businesses grow.

**Ready to take your business online?** [Contact us](/contact) for a free consultation.`,
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    tags: ["Business", "Web Development", "Digital Marketing"],
    published: true,
    publishedAt: new Date("2025-01-15"),
  },
  {
    slug: "top-5-seo-strategies-for-small-businesses",
    title: "Top 5 SEO Strategies for Small Businesses",
    excerpt: "Discover proven SEO strategies that can help small businesses rank higher on Google without breaking the bank. Practical tips you can implement today.",
    content: `# Top 5 SEO Strategies for Small Businesses

Search Engine Optimization doesn't have to be complicated or expensive. Here are five proven strategies that can dramatically improve your search rankings.

## 1. Optimize for Local Search

If you serve a local area, local SEO is your best friend. Claim your Google Business Profile, ensure your NAP (Name, Address, Phone) is consistent across the web, and encourage customer reviews.

## 2. Create Quality Content Regularly

Content is still king. Publish blog posts, guides, and resources that answer your customers' questions. Aim for at least 2-4 posts per month, focusing on topics relevant to your industry.

## 3. Improve Page Speed

Google uses page speed as a ranking factor. Optimize images, use a CDN, minimize JavaScript, and choose a fast hosting provider. Tools like Google PageSpeed Insights can help identify issues.

## 4. Build Quality Backlinks

Focus on earning links from reputable websites in your industry. Guest posting, creating shareable infographics, and building partnerships are effective strategies.

## 5. Mobile Optimization

With over 60% of searches happening on mobile devices, having a mobile-friendly website is crucial. Use responsive design and test your site on various devices.

## Conclusion

SEO is a marathon, not a sprint. Implement these strategies consistently, and you'll see significant improvements in your search rankings over time. Need help? Our SEO experts at rasel.cloud can create a customized strategy for your business.`,
    coverImage: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&q=80",
    tags: ["SEO", "Digital Marketing", "Small Business"],
    published: true,
    publishedAt: new Date("2025-02-10"),
  },
  {
    slug: "how-ai-is-transforming-business-automation",
    title: "How AI is Transforming Business Automation",
    excerpt: "Artificial Intelligence is revolutionizing how businesses operate. From chatbots to predictive analytics, discover how AI automation can save time and boost revenue.",
    content: `# How AI is Transforming Business Automation

Artificial Intelligence isn't just a buzzword anymore — it's a practical tool that businesses of all sizes can leverage to streamline operations and boost productivity.

## The Rise of AI in Business

From ChatGPT to custom machine learning models, AI tools have become accessible to everyone. Small businesses can now automate tasks that previously required dedicated teams.

## Key Areas of AI Automation

### Customer Service
AI chatbots can handle up to 80% of routine customer inquiries, providing instant responses 24/7. This frees up your team to focus on complex issues that require a human touch.

### Marketing Automation
AI can personalize email campaigns, predict customer behavior, optimize ad spend, and generate content. Marketing teams using AI report a 40% increase in productivity.

### Data Analysis
AI excels at processing large amounts of data quickly. Predictive analytics can forecast sales trends, identify at-risk customers, and uncover hidden opportunities.

### Workflow Automation
Repetitive tasks like data entry, invoice processing, and report generation can be fully automated. Tools like Zapier, combined with custom AI solutions, can transform your workflow.

## Getting Started with AI

You don't need a massive budget to start with AI. Begin by identifying repetitive tasks in your business, then explore AI tools that can automate them. Start small, measure results, and scale what works.

At rasel.cloud, we help businesses implement practical AI solutions that deliver real ROI. From custom chatbots to full workflow automation, we've got you covered.`,
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    tags: ["AI", "Automation", "Technology", "Business"],
    published: true,
    publishedAt: new Date("2025-03-05"),
  },
  {
    slug: "complete-guide-to-e-commerce-in-2025",
    title: "Complete Guide to E-Commerce in 2025",
    excerpt: "Everything you need to know about starting and growing an online store. From platform selection to marketing strategies, this guide covers it all.",
    content: `# Complete Guide to E-Commerce in 2025

The e-commerce industry continues to grow rapidly. Whether you're starting from scratch or scaling an existing store, this guide will help you navigate the landscape.

## Choosing the Right Platform

### Shopify
Best for beginners and small-to-medium stores. Easy setup, thousands of themes, and robust app ecosystem.

### WooCommerce
Best for WordPress users who want full control. Highly customizable with thousands of plugins.

### Custom Solution
Best for unique requirements. Full control over features, design, and scalability.

## Essential Features

1. **Mobile-First Design** — Over 70% of e-commerce traffic comes from mobile devices
2. **Fast Checkout** — Reduce cart abandonment with streamlined checkout
3. **Multiple Payment Options** — Credit cards, digital wallets, buy-now-pay-later
4. **Inventory Management** — Real-time stock tracking and alerts
5. **Analytics Dashboard** — Track sales, conversions, and customer behavior

## Marketing Your Store

- **SEO** — Optimize product pages for search engines
- **Social Media** — Showcase products on Instagram, TikTok, and Facebook
- **Email Marketing** — Build and nurture your customer list
- **Paid Ads** — Google Shopping, Facebook Ads, Instagram Ads

## Conclusion

E-commerce success requires the right technology, strategy, and execution. At rasel.cloud, we build custom e-commerce solutions that are designed to convert visitors into customers.`,
    coverImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    tags: ["E-Commerce", "Business", "Shopify", "Online Store"],
    published: true,
    publishedAt: new Date("2025-03-20"),
  },
  {
    slug: "the-importance-of-brand-identity-for-startups",
    title: "The Importance of Brand Identity for Startups",
    excerpt: "Your brand is more than a logo. Learn how a strong brand identity can differentiate your startup, build trust, and create lasting customer relationships.",
    content: `# The Importance of Brand Identity for Startups

In a crowded marketplace, your brand identity is what sets you apart. It's not just about a pretty logo — it's about creating a cohesive experience that resonates with your audience.

## What is Brand Identity?

Brand identity encompasses everything visual and emotional about your brand: your logo, colors, typography, voice, messaging, and the feelings you evoke in your customers.

## Why It Matters

### First Impressions
You have 7 seconds to make a first impression. A polished brand identity signals professionalism and builds instant trust with potential customers.

### Customer Loyalty
Consistent branding across all touchpoints creates familiarity. Familiar brands are trusted brands, and trusted brands earn loyal customers.

### Premium Pricing
Strong brands command premium prices. When customers perceive your brand as professional and trustworthy, they're willing to pay more for your products or services.

## Building Your Brand

1. **Define your mission and values** — What does your startup stand for?
2. **Know your audience** — Who are you trying to reach?
3. **Create visual elements** — Logo, color palette, typography
4. **Develop your voice** — How do you communicate?
5. **Be consistent** — Apply your brand everywhere

## Conclusion

Investing in brand identity early pays dividends as your startup grows. At rasel.cloud, our creative team designs brand identities that tell your story and connect with your audience.`,
    coverImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
    tags: ["Branding", "Design", "Startups", "Marketing"],
    published: true,
    publishedAt: new Date("2025-03-28"),
  },
];

const contactsData = [
  {
    name: "Ali Rahman",
    email: "ali@techstartup.com",
    details: "Hi, I'm interested in building a SaaS platform for my startup. Can we discuss custom web development and pricing?",
  },
  {
    name: "Jessica Lee",
    email: "jessica@boutique.com",
    details: "I need an e-commerce website for my clothing boutique. Looking for Shopify integration with a custom theme.",
  },
  {
    name: "Michael Chen",
    email: "michael@consulting.com",
    details: "We need help with SEO and content marketing for our consulting firm website. Currently getting very little organic traffic.",
  },
  {
    name: "Fatima Begum",
    email: "fatima@restaurant.bd",
    details: "Want to set up online ordering system for my restaurant chain. Need mobile-friendly design and payment integration.",
  },
  {
    name: "James Wilson",
    email: "james@realestate.com",
    details: "Looking for a property listing website with virtual tour integration and lead capture forms. Budget is flexible for the right solution.",
  },
];

async function seed() {
  console.log("Seeding database with demo data...\n");

  const [existingSvc] = await db.select({ id: services.id }).from(services).limit(1);
  if (existingSvc) {
    console.log("Database already has services. Clearing existing data for fresh seed...");
    await db.delete(orders);
    await db.delete(packages);
    await db.delete(services);
    await db.delete(blogPosts);
    await db.delete(contacts);
    await db.delete(users);
    console.log("Existing data cleared.\n");
  }

  const [adminUser] = await db
    .insert(users)
    .values({
      name: "Rasel Ahmed",
      email: "admin@rasel.cloud",
      passwordHash: "$2b$10$placeholder_hash_admin",
      role: "admin",
    })
    .returning();

  const [demoUser1] = await db
    .insert(users)
    .values({
      name: "Sarah Khan",
      email: "sarah@example.com",
      passwordHash: "$2b$10$placeholder_hash_user1",
      phone: "+880-1700-000001",
      role: "user",
    })
    .returning();

  const [demoUser2] = await db
    .insert(users)
    .values({
      name: "David Miller",
      email: "david@example.com",
      passwordHash: "$2b$10$placeholder_hash_user2",
      phone: "+1-555-000-0002",
      role: "user",
    })
    .returning();

  console.log("3 users created (1 admin, 2 demo users).");

  const insertedServices: (typeof services.$inferSelect)[] = [];
  const insertedPackages: (typeof packages.$inferSelect)[] = [];

  for (const { packages: pkgData, ...svcFields } of serviceData) {
    const [svc] = await db.insert(services).values(svcFields).returning();
    insertedServices.push(svc);

    for (const pkg of pkgData) {
      const [insertedPkg] = await db.insert(packages).values({ ...pkg, serviceId: svc.id }).returning();
      insertedPackages.push(insertedPkg);
    }
  }
  console.log(`${insertedServices.length} services created with ${insertedPackages.length} packages.`);

  for (const post of blogData) {
    await db.insert(blogPosts).values({ ...post, authorId: adminUser.id });
  }
  console.log(`${blogData.length} blog posts created.`);

  const webDev = insertedServices.find((s) => s.slug === "web-development")!;
  const aiAuto = insertedServices.find((s) => s.slug === "ai-automation")!;
  const seoGrowth = insertedServices.find((s) => s.slug === "seo-growth")!;
  const creative = insertedServices.find((s) => s.slug === "creative-media")!;
  const socialMedia = insertedServices.find((s) => s.slug === "social-media-management")!;
  const ecommerce = insertedServices.find((s) => s.slug === "e-commerce-solutions")!;

  const getPkg = (serviceId: string, tier: string) =>
    insertedPackages.find((p) => p.serviceId === serviceId && p.tier === tier)!;

  const ordersData = [
    {
      userId: demoUser1.id,
      serviceId: webDev.id,
      packageId: getPkg(webDev.id, "standard").id,
      customerName: "Sarah Khan",
      customerEmail: "sarah@example.com",
      customerPhone: "+880-1700-000001",
      serviceName: webDev.title,
      packageName: "Standard",
      price: "1299",
      notes: "Need a modern portfolio website with blog integration, contact form, and admin panel for managing projects.",
      status: "in_progress",
      paymentStatus: "paid",
    },
    {
      userId: demoUser2.id,
      serviceId: seoGrowth.id,
      packageId: getPkg(seoGrowth.id, "premium").id,
      customerName: "David Miller",
      customerEmail: "david@example.com",
      customerPhone: "+1-555-000-0002",
      serviceName: seoGrowth.title,
      packageName: "Premium",
      price: "1499",
      notes: "Complete digital marketing overhaul for my SaaS startup. Need to rank for competitive keywords in the project management space.",
      status: "pending",
      paymentStatus: "unpaid",
    },
    {
      userId: demoUser1.id,
      serviceId: creative.id,
      packageId: getPkg(creative.id, "basic").id,
      customerName: "Sarah Khan",
      customerEmail: "sarah@example.com",
      customerPhone: "+880-1700-000001",
      serviceName: creative.title,
      packageName: "Basic",
      price: "199",
      notes: "Logo redesign for my bakery brand. Want something modern and clean with pastel colors.",
      status: "completed",
      paymentStatus: "paid",
    },
    {
      userId: demoUser2.id,
      serviceId: aiAuto.id,
      packageId: getPkg(aiAuto.id, "standard").id,
      customerName: "David Miller",
      customerEmail: "david@example.com",
      customerPhone: "+1-555-000-0002",
      serviceName: aiAuto.title,
      packageName: "Standard",
      price: "999",
      notes: "Need an AI chatbot for customer support on our website plus a social media auto-responder for Instagram.",
      status: "in_progress",
      paymentStatus: "paid",
    },
    {
      userId: demoUser1.id,
      serviceId: socialMedia.id,
      packageId: getPkg(socialMedia.id, "standard").id,
      customerName: "Sarah Khan",
      customerEmail: "sarah@example.com",
      customerPhone: "+880-1700-000001",
      serviceName: socialMedia.title,
      packageName: "Standard",
      price: "599",
      notes: "Manage my bakery's Instagram, Facebook, TikTok, and LinkedIn. Need consistent posting and community engagement.",
      status: "pending",
      paymentStatus: "paid",
    },
    {
      userId: demoUser2.id,
      serviceId: ecommerce.id,
      packageId: getPkg(ecommerce.id, "premium").id,
      customerName: "David Miller",
      customerEmail: "david@example.com",
      customerPhone: "+1-555-000-0002",
      serviceName: ecommerce.title,
      packageName: "Premium",
      price: "3499",
      notes: "Full custom e-commerce platform for our electronics brand. Multi-currency, API integrations with shipping providers, and subscription model support.",
      status: "pending",
      paymentStatus: "unpaid",
    },
  ];

  await db.insert(orders).values(ordersData);
  console.log(`${ordersData.length} orders created.`);

  await db.insert(contacts).values(contactsData);
  console.log(`${contactsData.length} contacts created.`);

  console.log("\n=== Seed completed successfully! ===");
  console.log(`  Users:     3 (1 admin + 2 demo)`);
  console.log(`  Services:  ${insertedServices.length}`);
  console.log(`  Packages:  ${insertedPackages.length} (3 tiers each)`);
  console.log(`  Blog Posts: ${blogData.length}`);
  console.log(`  Orders:    ${ordersData.length}`);
  console.log(`  Contacts:  ${contactsData.length}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
