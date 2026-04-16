import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const PORTFOLIO_FILE = path.join(process.cwd(), "scripts", "portfolio-data.json");

const DEFAULT_PORTFOLIO = [
  { id: "1", category: "E-Commerce", title: "BazaarBD — Multi-vendor E-Commerce", tagline: "Bangladesh's growing online marketplace", description: "Full WooCommerce platform with bKash, Nagad & card payments. Real-time inventory, seller dashboard, and mobile-first checkout.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80", tags: ["WooCommerce", "PHP", "bKash API", "MySQL", "Redis"], metric: "+40% sales in 30 days", features: ["Multi-vendor seller portal", "bKash & Nagad gateway", "SMS order notifications", "Real-time inventory sync", "Mobile-first UI"], year: "2024" },
  { id: "2", category: "Web", title: "Quran Academy — Islamic Learning Portal", tagline: "Interactive Quran & Arabic learning platform", description: "Next.js-powered platform with audio recitations, tajweed lessons, and live tutoring.", image: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=900&q=80", tags: ["Next.js", "React", "PostgreSQL", "Web Audio API", "RTL"], metric: "10k+ active students", features: ["Arabic RTL support", "Audio recitation player", "Live tutor scheduling", "Progress certificates", "Quiz & assessment engine"], year: "2024" },
  { id: "3", category: "Web", title: "MedCare — Patient Management System", tagline: "Healthcare dashboard for clinics & hospitals", description: "React + Node.js dashboard for patient records, appointment scheduling, prescriptions.", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80", tags: ["React", "Node.js", "MySQL", "Encryption", "PDF"], metric: "60% faster appointments", features: ["Patient record management", "Appointment scheduler", "Digital prescriptions", "Role-based access", "Automated billing"], year: "2023" },
  { id: "4", category: "AI", title: "AutoBot — AI Business Automation", tagline: "Intelligent workflow automation with GPT-4", description: "Python + Linux server AI suite automating invoice processing, customer email replies, social scheduling.", image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80", tags: ["Python", "GPT-4 API", "Linux", "Celery", "Redis"], metric: "70% time saved", features: ["AI email responder", "Invoice auto-processor", "Social media scheduler", "Report generator", "24/7 server automation"], year: "2024" },
  { id: "5", category: "Mobile", title: "FoodRush — Restaurant Delivery App", tagline: "On-demand food delivery for Dhaka", description: "React Native app with real-time GPS tracking, live order status, and restaurant admin panel.", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80", tags: ["React Native", "Node.js", "Socket.io", "Google Maps", "Stripe"], metric: "500+ daily orders", features: ["Real-time GPS tracking", "Live order notifications", "Restaurant admin panel", "Rider assignment system", "Rating & review system"], year: "2024" },
  { id: "6", category: "SEO", title: "StyleHouse BD — Fashion SEO Campaign", tagline: "Full-stack SEO & digital growth strategy", description: "6-month SEO + content strategy for a Dhaka fashion brand. Achieved #1 ranking for 45 target keywords.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80", tags: ["Technical SEO", "Google Ads", "Schema Markup", "Content", "Analytics"], metric: "#1 Google rank in BD", features: ["45 keywords in top 3", "2× organic traffic", "Google Shopping ads", "Monthly SEO reports", "Core Web Vitals fixed"], year: "2023" },
];

function readPortfolio() {
  if (!fs.existsSync(PORTFOLIO_FILE)) return DEFAULT_PORTFOLIO;
  try { return JSON.parse(fs.readFileSync(PORTFOLIO_FILE, "utf-8")); }
  catch { return DEFAULT_PORTFOLIO; }
}

// Public endpoint — no auth required, reads same JSON as admin panel
export async function GET() {
  try {
    const items = readPortfolio();
    return NextResponse.json(items, {
      headers: { "Cache-Control": "private, max-age=30, must-revalidate" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
