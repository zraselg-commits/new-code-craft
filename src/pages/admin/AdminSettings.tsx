"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Globe, Palette, Phone, Share2, BarChart3, Code, Megaphone, RefreshCw, Zap, Link2, DollarSign, Image as ImageIcon, Search, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { BilingualField } from "@/components/admin/BilingualField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type Settings = Record<string, string | boolean>;

const tabs = [
  { id: "general",    label: "General",       icon: Globe },
  { id: "hero",       label: "Hero Section",  icon: Megaphone },
  { id: "cta",        label: "CTA Section",   icon: Zap },
  { id: "contact",   label: "Contact Info",  icon: Phone },
  { id: "social",    label: "Social Media",  icon: Share2 },
  { id: "stats",     label: "Stats & Numbers", icon: BarChart3 },
  { id: "pricing",   label: "Pricing",       icon: DollarSign },
  { id: "appearance",label: "Appearance",    icon: Palette },
  { id: "seo",       label: "SEO & Analytics", icon: Code },
  { id: "chat",      label: "Chat Widget",   icon: MessageSquare },
];

function Field({
  label, description, name, type = "text", value, onChange, placeholder,
}: {
  label: string;
  description?: string;
  name: string;
  type?: string;
  value: string | boolean;
  onChange: (name: string, val: string | boolean) => void;
  placeholder?: string;
}) {
  if (type === "toggle") {
    return (
      <div className="flex items-start justify-between gap-4 py-3 border-b border-white/5">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange(name, !value)}
          className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${value ? "bg-red-500" : "bg-white/10"}`}
        >
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="py-3 border-b border-white/5">
        <label className="block text-sm font-medium text-white mb-1">{label}</label>
        {description && <p className="text-xs text-white/40 mb-2">{description}</p>}
        <textarea
          rows={3}
          value={value as string}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/50 resize-none transition-colors"
        />
      </div>
    );
  }

  if (type === "color") {
    return (
      <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value as string}
            onChange={(e) => onChange(name, e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
          <input
            type="text"
            value={value as string}
            onChange={(e) => onChange(name, e.target.value)}
            className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-red-500/50"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 border-b border-white/5">
      <label className="block text-sm font-medium text-white mb-1">{label}</label>
      {description && <p className="text-xs text-white/40 mb-2">{description}</p>}
      <input
        type={type}
        value={value as string}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/50 transition-colors"
      />
    </div>
  );
}

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<Settings>({});
  const [dirty, setDirty] = useState(false);

  const { data, isLoading } = useQuery<Settings>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const r = await apiFetch("/api/admin/settings");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  useEffect(() => {
    if (data) { setSettings(data); setDirty(false); }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const r = await apiFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify(settings) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(["/api/admin/settings"], saved);
      // Also bust the public cache so visitors see the change immediately
      queryClient.invalidateQueries({ queryKey: ["/api/settings-public"] });
      setDirty(false);
      toast.success("Settings saved! Changes are now live on the public site.");
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const set = (name: string, val: string | boolean) => {
    setSettings((prev) => ({ ...prev, [name]: val }));
    setDirty(true);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "general": return (
        <div>
          <BilingualField label="Site Name" nameEn="siteName" nameBn="siteName_bn"
            valueEn={String(settings.siteName ?? "")} valueBn={String(settings.siteName_bn ?? "")}
            onChange={(n, v) => set(n, v)} placeholder="Code Craft BD" placeholderBn="কোড ক্রাফট বিডি" />
          <BilingualField label="Tagline" nameEn="tagline" nameBn="tagline_bn"
            valueEn={String(settings.tagline ?? "")} valueBn={String(settings.tagline_bn ?? "")}
            onChange={(n, v) => set(n, v)} placeholder="Digital Agency & Web Solutions" placeholderBn="ডিজিটাল এজেন্সি ও ওয়েব সমাধান" />
          <ImageUploadField
            label="Site Logo"
            description="PNG or SVG recommended. Shown in navbar and emails."
            value={String(settings.logoUrl ?? "")}
            onChange={(url) => set("logoUrl", url)}
            placeholder="https://..."
          />
          <ImageUploadField
            label="Favicon"
            description="ICO, PNG or SVG. Shown in browser tabs."
            value={String(settings.faviconUrl ?? "")}
            onChange={(url) => set("faviconUrl", url)}
            placeholder="https://..."
            accept="image/*,.ico"
          />
          <BilingualField label="Footer Text" nameEn="footerText" nameBn="footerText_bn"
            valueEn={String(settings.footerText ?? "")} valueBn={String(settings.footerText_bn ?? "")}
            onChange={(n, v) => set(n, v)} placeholder="© 2025 Code Craft BD. All rights reserved." placeholderBn="© ২০২৫ কোড ক্রাফট বিডি। সর্বস্বত্ব সংরক্ষিত।" />
          <BilingualField label="Announcement Bar Text" nameEn="announcementBar" nameBn="announcementBar_bn"
            valueEn={String(settings.announcementBar ?? "")} valueBn={String(settings.announcementBar_bn ?? "")}
            onChange={(n, v) => set(n, v)} type="textarea"
            description="Shown as a top banner if enabled"
            placeholder="🎉 New: AI Agent packages now available!" placeholderBn="🎉 নতুন: এআই প্যাকেজ এখন পাওয়া যাচ্ছে!" />
          <Field label="Enable Announcement Bar" name="announcementBarEnabled" value={settings.announcementBarEnabled ?? false} onChange={set} type="toggle" />
          <Field label="Maintenance Mode" description="Shows a maintenance page to all visitors" name="maintenanceMode" value={settings.maintenanceMode ?? false} onChange={set} type="toggle" />
        </div>
      );

      case "hero": return (
        <div>
          <p className="text-xs text-white/40 pb-3 border-b border-white/5 mb-3">
            Changes here are saved and immediately shown on the public website via <code className="bg-white/10 px-1 rounded">/api/settings-public</code>.
            Leave any field blank to use the default translation text.
          </p>

          {/* Hero Image */}
          <ImageUploadField
            label="Hero Section Image"
            description="Right-side image in the hero section. Default: /hero-main.jpg"
            value={String(settings.heroImageUrl ?? "")}
            onChange={(url) => set("heroImageUrl", url)}
            placeholder="/hero-main.jpg or https://..."
          />

          <BilingualField label="Hero Heading" nameEn="heroHeading" nameBn="heroHeading_bn"
            valueEn={String(settings.heroHeading ?? "")} valueBn={String(settings.heroHeading_bn ?? "")}
            onChange={(n, v) => set(n, v)} type="textarea"
            placeholder="We Build, Grow &amp; Transform Your Digital Presence."
            placeholderBn="আপনার ডিজিটাল উপস্থিতি তৈরি, বৃদ্ধি ও রূপান্তর করি।" />
          <BilingualField label="Hero Subheading" nameEn="heroSubheading" nameBn="heroSubheading_bn"
            valueEn={String(settings.heroSubheading ?? "")} valueBn={String(settings.heroSubheading_bn ?? "")}
            onChange={(n, v) => set(n, v)} type="textarea"
            placeholder="Custom websites, AI automation, SEO &amp; social media management..."
            placeholderBn="কাস্টম ওয়েবসাইট, এআই অটোমেশন, এসইও ও সোশ্যাল মিডিয়া ম্যানেজমেন্ট..." />

          <div className="pt-3 pb-2 border-b border-white/5">
            <p className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider">🔴 Primary Button (Left)</p>
            <BilingualField label="Primary CTA Text" nameEn="heroCtaText" nameBn="heroCtaText_bn"
              valueEn={String(settings.heroCtaText ?? "")} valueBn={String(settings.heroCtaText_bn ?? "")}
              onChange={(n, v) => set(n, v)} placeholder="Get a Free Consultation" placeholderBn="যোগাযোগ করুন" />
            <div className="py-3">
              <label className="block text-sm font-medium text-white mb-1">Primary Button URL</label>
              <p className="text-xs text-white/40 mb-2">Where does the primary button link to? (e.g. /contact)</p>
              <input value={String(settings.heroCtaPrimaryUrl ?? "/contact")}
                onChange={(e) => set("heroCtaPrimaryUrl", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/50 transition-colors"
                placeholder="/contact" />
            </div>
          </div>

          <div className="pt-3">
            <p className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider">⬜ Secondary Button (Right)</p>
            <BilingualField label="Secondary CTA Text" nameEn="heroCtaSecondaryText" nameBn="heroCtaSecondaryText_bn"
              valueEn={String(settings.heroCtaSecondaryText ?? "")} valueBn={String(settings.heroCtaSecondaryText_bn ?? "")}
              onChange={(n, v) => set(n, v)} placeholder="Our Demo" placeholderBn="আমাদের ডেমো" />
            <div className="py-3">
              <label className="block text-sm font-medium text-white mb-1">Secondary Button URL</label>
              <p className="text-xs text-white/40 mb-2">Where does the secondary button link to? (e.g. /portfolio)</p>
              <input value={String(settings.heroCtaSecondaryUrl ?? "/portfolio")}
                onChange={(e) => set("heroCtaSecondaryUrl", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/50 transition-colors"
                placeholder="/portfolio" />
            </div>
          </div>
        </div>
      );


      case "contact": return (
        <div>
          <Field label="Contact Email" name="contactEmail" value={settings.contactEmail ?? ""} onChange={set} type="email" placeholder="hello@codecraftbd.info" />
          <Field label="Contact Phone" name="contactPhone" value={settings.contactPhone ?? ""} onChange={set} type="tel" placeholder="+880 1700-000000" />
          <BilingualField label="Office Address" nameEn="contactAddress" nameBn="contactAddress_bn"
            valueEn={String(settings.contactAddress ?? "")} valueBn={String(settings.contactAddress_bn ?? "")}
            onChange={(n, v) => set(n, v)} placeholder="Dhaka, Bangladesh" placeholderBn="ঢাকা, বাংলাদেশ" />
          <Field label="WhatsApp Number" description="Include country code, e.g. +8801700000000" name="whatsappNumber" value={settings.whatsappNumber ?? ""} onChange={set} placeholder="+8801700000000" />
        </div>
      );

      case "social": return (
        <div>
          <Field label="Facebook URL" name="socialFacebook" value={settings.socialFacebook ?? ""} onChange={set} placeholder="https://facebook.com/..." />
          <Field label="Instagram URL" name="socialInstagram" value={settings.socialInstagram ?? ""} onChange={set} placeholder="https://instagram.com/..." />
          <Field label="LinkedIn URL" name="socialLinkedin" value={settings.socialLinkedin ?? ""} onChange={set} placeholder="https://linkedin.com/company/..." />
          <Field label="Twitter / X URL" name="socialTwitter" value={settings.socialTwitter ?? ""} onChange={set} placeholder="https://twitter.com/..." />
          <Field label="YouTube URL" name="socialYoutube" value={settings.socialYoutube ?? ""} onChange={set} placeholder="https://youtube.com/..." />
          <Field label="GitHub URL" name="socialGithub" value={settings.socialGithub ?? ""} onChange={set} placeholder="https://github.com/..." />
        </div>
      );

      case "stats": return (
        <div>
          <p className="text-xs text-white/40 pb-3 border-b border-white/5 mb-1">These numbers appear in the Stats section on the homepage.</p>
          <Field label="Projects Completed" name="statsProjects" value={settings.statsProjects ?? ""} onChange={set} placeholder="150+" />
          <Field label="Happy Clients" name="statsClients" value={settings.statsClients ?? ""} onChange={set} placeholder="80+" />
          <Field label="Years Experience" name="statsYears" value={settings.statsYears ?? ""} onChange={set} placeholder="5+" />
          <Field label="Client Satisfaction" name="statsSatisfaction" value={settings.statsSatisfaction ?? ""} onChange={set} placeholder="99%" />
          <BilingualField label="Stats Section Tagline" nameEn="statsTagline" nameBn="statsTagline_bn"
            valueEn={String(settings.statsTagline ?? "")} valueBn={String(settings.statsTagline_bn ?? "")}
            onChange={(n, v) => set(n, v)} placeholder="Numbers that speak for themselves"
            placeholderBn="সংখ্যাই বলে দেয় সব কিছু" />
        </div>
      );

      case "appearance": return (
        <div>
          <Field label="Primary Color" description="Main brand color (used for buttons, accents)" name="primaryColor" value={settings.primaryColor ?? "#ef4444"} onChange={set} type="color" />
          <Field label="Accent Color" description="Secondary highlight color" name="accentColor" value={settings.accentColor ?? "#f97316"} onChange={set} type="color" />
        </div>
      );

      case "seo": return (
        <div>
          <p className="text-xs text-white/40 pb-3 border-b border-white/5 mb-3">
            All SEO settings below are applied site-wide and affect Google search rankings.
          </p>

          {/* Meta Title & Description */}
          <BilingualField label="Meta Title" nameEn="metaTitle" nameBn="metaTitle_bn"
            valueEn={String(settings.metaTitle ?? "")} valueBn={String(settings.metaTitle_bn ?? "")}
            onChange={(n, v) => set(n, v)}
            description="Browser tab & Google search title (50–60 chars recommended)"
            placeholder="Code Craft BD — Digital Agency"
            placeholderBn="কোড ক্রাফট বিডি — ডিজিটাল এজেন্সি" />
          <BilingualField label="Meta Description" nameEn="metaDescription" nameBn="metaDescription_bn"
            valueEn={String(settings.metaDescription ?? "")} valueBn={String(settings.metaDescription_bn ?? "")}
            onChange={(n, v) => set(n, v)} type="textarea"
            description="Google search result description (150–160 chars recommended)"
            placeholder="Professional web development, AI automation, SEO services..."
            placeholderBn="পেশাদার ওয়েব ডেভেলপমেন্ট, AI অটোমেশন, SEO সেবা..." />

          {/* Keywords */}
          <div className="py-3 border-b border-white/5">
            <label className="block text-sm font-medium text-white mb-1">Meta Keywords</label>
            <p className="text-xs text-white/40 mb-2">Comma-separated keywords (for Bing & structured data)</p>
            <textarea
              rows={2}
              value={String(settings.metaKeywords ?? "")}
              onChange={(e) => set("metaKeywords", e.target.value)}
              placeholder="web development Bangladesh, AI automation, digital agency Dhaka, ডিজিটাল এজেন্সি"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/50 resize-none transition-colors"
            />
          </div>

          {/* OG / Social Share Image */}
          <div className="py-3 border-b border-white/5">
            <p className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={13} /> Open Graph / Social Share Image
            </p>
            <p className="text-xs text-white/40 mb-3">Shown when your site is shared on Facebook, Twitter, WhatsApp etc. Ideal size: 1200×630px</p>
            <ImageUploadField
              label="OG Image"
              description="Upload a 1200×630 image for best social sharing results"
              value={String(settings.ogImageUrl ?? "")}
              onChange={(url) => set("ogImageUrl", url)}
              placeholder="https://codecraftbd.info/og-image.jpg"
            />
          </div>

          {/* Schema Type */}
          <div className="py-3 border-b border-white/5">
            <label className="block text-sm font-medium text-white mb-1">Schema.org Type</label>
            <p className="text-xs text-white/40 mb-2">Structured data type for Google rich results</p>
            <select
              value={String(settings.schemaType ?? "LocalBusiness")}
              onChange={(e) => set("schemaType", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
            >
              <option value="LocalBusiness">LocalBusiness (Recommended)</option>
              <option value="Organization">Organization</option>
              <option value="WebSite">WebSite</option>
              <option value="ProfessionalService">ProfessionalService</option>
              <option value="SoftwareApplication">SoftwareApplication</option>
            </select>
          </div>

          {/* Analytics */}
          <div className="pt-3">
            <p className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider">📊 Analytics & Verification</p>
            <Field label="Google Analytics ID" description="e.g. G-XXXXXXXXXX or UA-XXXXXXX" name="googleAnalyticsId" value={settings.googleAnalyticsId ?? ""} onChange={set} placeholder="G-XXXXXXXXXX" />
            <Field label="Facebook Pixel ID" name="facebookPixelId" value={settings.facebookPixelId ?? ""} onChange={set} placeholder="1234567890" />
            <Field label="Google Search Console Verification" description="The content value from the meta verification tag" name="googleSearchConsoleId" value={settings.googleSearchConsoleId ?? ""} onChange={set} placeholder="google-site-verification=XXXXX" />
          </div>
        </div>
      );

      case "pricing": return (
        <div>
          <p className="text-xs text-white/40 pb-3 border-b border-white/5 mb-3">
            Control default currency display and conversion rate. Default is <strong className="text-white/60">BDT (৳)</strong> for Bangladesh visitors.
          </p>
          <div className="py-3 border-b border-white/5">
            <label className="block text-sm font-medium text-white mb-1">Default Currency</label>
            <p className="text-xs text-white/40 mb-2">Currency shown to visitors by default</p>
            <select
              value={String(settings.pricingCurrencyDefault ?? "BDT")}
              onChange={(e) => set("pricingCurrencyDefault", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
            >
              <option value="BDT">BDT (৳) — Bangladeshi Taka</option>
              <option value="USD">USD ($) — US Dollar</option>
            </select>
          </div>
          <Field
            label="USD → BDT Rate"
            description="Exchange rate used to convert USD prices to BDT"
            name="usdToBdtRate"
            value={settings.usdToBdtRate ?? "110"}
            onChange={set}
            placeholder="110"
          />
          <div className="py-3 mt-2 bg-white/3 rounded-xl px-4">
            <p className="text-xs text-white/60 font-medium mb-1">💡 Example Conversion</p>
            <p className="text-xs text-white/40">
              $299 USD × {String(settings.usdToBdtRate ?? "110")} = ৳{(299 * Number(settings.usdToBdtRate ?? 110)).toLocaleString()} BDT
            </p>
          </div>
        </div>
      );

      case "cta": return (
        <div>
          <p className="text-xs text-white/40 pb-3 border-b border-white/5 mb-1">
            Controls the <strong className="text-white/60">full-width CTA banner</strong> shown at the bottom of the homepage.
            Leave any field blank to keep the default translation text.
          </p>

          <BilingualField label="CTA Heading" nameEn="ctaHeading" nameBn="ctaHeading_bn"
            valueEn={String(settings.ctaHeading ?? "")} valueBn={String(settings.ctaHeading_bn ?? "")}
            onChange={(n, v) => set(n, v)} type="textarea"
            placeholder="Ready to Elevate Your Business?"
            placeholderBn="আপনার ব্যবসাকে এগিয়ে নিতে প্রস্তুত?" />

          <BilingualField label="CTA Description" nameEn="ctaDesc" nameBn="ctaDesc_bn"
            valueEn={String(settings.ctaDesc ?? "")} valueBn={String(settings.ctaDesc_bn ?? "")}
            onChange={(n, v) => set(n, v)} type="textarea" rows={3}
            placeholder="Whether you need a custom web app, AI automation, or stunning content — codecraftbd.info is your team."
            placeholderBn="কাস্টম ওয়েব অ্যাপ, এআই অটোমেশন বা চমৎকার কন্টেন্ট — codecraftbd.info আপনার দল।" />

          {/* Primary CTA Button */}
          <div className="pt-4 pb-3 border-b border-white/5">
            <p className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary inline-block" /> Primary Button (Left, Red)
            </p>
            <BilingualField label="Button Text" nameEn="ctaBtn1Text" nameBn="ctaBtn1Text_bn"
              valueEn={String(settings.ctaBtn1Text ?? "")} valueBn={String(settings.ctaBtn1Text_bn ?? "")}
              onChange={(n, v) => set(n, v)}
              placeholder="Get a Free Consultation" placeholderBn="বিনামূল্যে পরামর্শ নিন" />
            <div className="py-3">
              <label className="block text-sm font-medium text-white mb-1 flex items-center gap-1.5">
                <Link2 size={13} className="text-white/40" /> Button URL
              </label>
              <p className="text-xs text-white/30 mb-2">Use a relative path like <code className="bg-white/10 px-1 rounded">/contact</code> or a full URL like <code className="bg-white/10 px-1 rounded">https://wa.me/8801700000000</code></p>
              <input
                value={String(settings.ctaBtn1Url ?? "/contact")}
                onChange={(e) => set("ctaBtn1Url", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/50 transition-colors font-mono"
                placeholder="/contact"
              />
            </div>
          </div>

          {/* Secondary CTA Button */}
          <div className="pt-4">
            <p className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-white/20 border border-white/30 inline-block" /> Secondary Button (Right, Outline)
            </p>
            <BilingualField label="Button Text" nameEn="ctaBtn2Text" nameBn="ctaBtn2Text_bn"
              valueEn={String(settings.ctaBtn2Text ?? "")} valueBn={String(settings.ctaBtn2Text_bn ?? "")}
              onChange={(n, v) => set(n, v)}
              placeholder="See Our Work" placeholderBn="আমাদের কাজ দেখুন" />
            <div className="py-3">
              <label className="block text-sm font-medium text-white mb-1 flex items-center gap-1.5">
                <Link2 size={13} className="text-white/40" /> Button URL
              </label>
              <p className="text-xs text-white/30 mb-2">Relative or absolute URL. Examples: <code className="bg-white/10 px-1 rounded">/portfolio</code>, <code className="bg-white/10 px-1 rounded">/services</code></p>
              <input
                value={String(settings.ctaBtn2Url ?? "/portfolio")}
                onChange={(e) => set("ctaBtn2Url", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/50 transition-colors font-mono"
                placeholder="/portfolio"
              />
            </div>
          </div>
        </div>
      );

      case "chat": return (
        <ChatWidgetTab settings={settings} set={set} />
      );

      default: return null;
    }
  };

  return (
    <AdminLayout
      title="Site Settings"
      subtitle="Control every aspect of your website"
      actions={
        dirty ? (
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {save.isPending ? "Saving..." : "Save Changes"}
          </button>
        ) : null
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="text-white/20 animate-spin" />
        </div>
      ) : (
        <div className="max-w-4xl flex gap-6">
          {/* Tab sidebar */}
          <div className="w-44 shrink-0">
            <div className="space-y-0.5 sticky top-20">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-red-500/15 text-red-400"
                      : "text-white/40 hover:bg-white/5 hover:text-white/70"
                  }`}
                >
                  <tab.icon size={15} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  {(() => {
                    const t = tabs.find((t) => t.id === activeTab)!;
                    return (
                      <div className="flex items-center gap-2">
                        <t.icon size={16} className="text-red-400" />
                        <h2 className="font-semibold text-white text-sm">{t.label}</h2>
                      </div>
                    );
                  })()}
                </div>
                <button
                  onClick={() => save.mutate()}
                  disabled={save.isPending || !dirty}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/25 disabled:opacity-30 transition-colors"
                >
                  <Save size={12} />
                  {save.isPending ? "Saving..." : "Save"}
                </button>
              </div>
              {renderTab()}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

/* ── Chat Widget Tab ─────────────────────────────────────────── */
function ChatWidgetTab({ settings, set }: { settings: Settings; set: (k: string, v: string | boolean) => void }) {
  const [loadingChats, setLoadingChats] = useState(false);
  const [chats, setChats] = useState<Array<{ id: number; type: string; name: string }>>([]);
  const [chatError, setChatError] = useState("");
  const [testResult, setTestResult] = useState<"idle" | "ok" | "fail">("idle");
  const [testing, setTesting] = useState(false);

  const token = String(settings.telegramBotToken ?? "");
  const chatId = String(settings.telegramChatId ?? "");

  async function fetchChatId() {
    setLoadingChats(true); setChatError(""); setChats([]);
    try {
      const r = await fetch("/api/notify");
      const data = await r.json();
      if (data.ok && data.chats?.length > 0) {
        setChats(data.chats);
      } else {
        setChatError(data.error || "Bot কোনো message পায়নি — আগে bot এ /start পাঠান");
      }
    } catch {
      setChatError("API request ব্যর্থ");
    } finally {
      setLoadingChats(false);
    }
  }

  async function testBot() {
    setTesting(true); setTestResult("idle");
    try {
      const r = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "✅ Test message from Admin Panel", phone: "0000000000", website: "admin-test" }),
      });
      const data = await r.json();
      setTestResult(data.ok ? "ok" : "fail");
    } catch {
      setTestResult("fail");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div>
      <p className="text-xs text-white/40 pb-3 border-b border-white/5 mb-3">
        WhatsApp chat widget ব্যবহারকারীর message ব্যাকগ্রাউন্ডে এই Telegram Bot এ পাঠাবে।{" "}
        User এর কাছে সব WhatsApp এর মতো দেখাবে।
      </p>

      {/* Bot Token */}
      <div className="py-3 border-b border-white/5">
        <label className="block text-sm font-medium text-white mb-1">Telegram Bot Token</label>
        <p className="text-xs text-white/40 mb-2">
          <a href="https://t.me/BotFather" target="_blank" rel="noopener" className="text-blue-400 hover:underline">@BotFather</a> থেকে token নিন
        </p>
        <input
          type="password"
          value={token}
          onChange={e => set("telegramBotToken", e.target.value)}
          placeholder="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/50 font-mono transition-colors"
        />
        {token && (
          <p className="text-xs text-green-400/70 mt-1.5">✓ Token configured — {token.split(":")[0]}:***</p>
        )}
      </div>

      {/* Chat ID */}
      <div className="py-3 border-b border-white/5">
        <label className="block text-sm font-medium text-white mb-1">Telegram Chat ID</label>
        <p className="text-xs text-white/40 mb-2">Bot কে Telegram এ message পাঠান, তারপর নিচে <strong className="text-white/60">"Chat ID খুঁজুন"</strong> বাটন চাপুন</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={chatId}
            onChange={e => set("telegramChatId", e.target.value)}
            placeholder="-1001234567890 বা 123456789"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/50 font-mono transition-colors"
          />
          <button
            onClick={fetchChatId}
            disabled={!token || loadingChats}
            className="px-3 py-2 bg-blue-500/15 text-blue-400 border border-blue-500/20 text-xs rounded-lg hover:bg-blue-500/25 disabled:opacity-30 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            {loadingChats ? <RefreshCw size={12} className="animate-spin" /> : <MessageSquare size={12} />}
            Chat ID খুঁজুন
          </button>
        </div>

        {/* Discovered chats */}
        {chats.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs text-white/50">পাওয়া chats — একটিতে ক্লিক করে select করুন:</p>
            {chats.map(c => (
              <button
                key={c.id}
                onClick={() => set("telegramChatId", String(c.id))}
                className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                  String(c.id) === chatId
                    ? "bg-green-500/15 border-green-500/30 text-green-400"
                    : "bg-white/3 border-white/8 text-white/60 hover:bg-white/6 hover:text-white"
                }`}
              >
                <span className="font-mono">{c.id}</span>
                <span className="ml-2 text-white/40">{c.name}</span>
                <span className="ml-1 text-white/25">({c.type})</span>
                {String(c.id) === chatId && <span className="ml-2">✓</span>}
              </button>
            ))}
          </div>
        )}
        {chatError && <p className="text-xs text-red-400 mt-2">⚠ {chatError}</p>}
      </div>

      {/* Test button */}
      <div className="py-3 border-b border-white/5">
        <p className="text-sm font-medium text-white mb-2">Connection Test</p>
        <div className="flex items-center gap-3">
          <button
            onClick={testBot}
            disabled={!token || !chatId || testing}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/15 text-green-400 border border-green-500/20 text-sm font-medium rounded-lg hover:bg-green-500/25 disabled:opacity-30 transition-colors"
          >
            {testing ? <RefreshCw size={13} className="animate-spin" /> : <MessageSquare size={13} />}
            {testing ? "পাঠানো হচ্ছে..." : "Test Message পাঠাও"}
          </button>
          {testResult === "ok" && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <CheckCircle size={14} /> Telegram এ message পৌঁছেছে!
            </span>
          )}
          {testResult === "fail" && (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <XCircle size={14} /> ব্যর্থ — Token ও Chat ID চেক করুন
            </span>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="mt-4 bg-white/3 rounded-xl p-4 border border-white/8">
        <p className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">⚙ কিভাবে কাজ করে</p>
        <ul className="text-xs text-white/40 space-y-1.5 leading-relaxed">
          <li>🟢 User WhatsApp button চাপলে chat widget খোলে</li>
          <li>💬 User message লেখে → নম্বর দেয় → <strong className="text-white/60">Send</strong> চাপে</li>
          <li>📲 Telegram Bot টি এই chat ID তে message পাঠায় (ব্যাকগ্রাউন্ড)</li>
          <li>✅ User দেখে "মেসেজ পাঠানো হয়েছে" — WhatsApp এর মতো</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminSettings;
