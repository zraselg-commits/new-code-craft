"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Save, RefreshCw, ChevronDown, ChevronRight,
  Globe, Eye, EyeOff, Check, X, AlertCircle, Code2,
  FileText, Hash, ExternalLink, ToggleLeft, ToggleRight,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import type { PageSeoEntry, SeoPageMap } from "@lib/seo-pages";

// All known routes in the app
const KNOWN_ROUTES = [
  { route: "/",          label: "Homepage",        icon: "🏠" },
  { route: "/about",     label: "About",           icon: "ℹ️" },
  { route: "/services",  label: "Services",        icon: "⚙️" },
  { route: "/pricing",   label: "Pricing",         icon: "💰" },
  { route: "/portfolio", label: "Portfolio",       icon: "🎨" },
  { route: "/blog",      label: "Blog Index",      icon: "📝" },
  { route: "/contact",   label: "Contact",         icon: "📞" },
  { route: "/team",      label: "Team",            icon: "👥" },
  { route: "/faq",       label: "FAQ",             icon: "❓" },
  { route: "/why-us",    label: "Why Us",          icon: "✅" },
  { route: "/terms",     label: "Terms",           icon: "📄" },
  { route: "/privacy",   label: "Privacy",         icon: "🔒" },
];

function charColor(len: number, max: number) {
  if (len === 0) return "text-white/20";
  if (len > max) return "text-red-400";
  if (len > max * 0.85) return "text-yellow-400";
  return "text-green-400";
}

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value.length;
  return (
    <span className={`text-xs font-mono ${charColor(len, max)}`}>
      {len}/{max}
      {len > max && <span className="ml-1">⚠ too long</span>}
    </span>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
        value ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/40"
      }`}
    >
      {value ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
      {value ? "On" : "Off"}
    </button>
  );
}

function JsonEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [error, setError] = useState("");
  const validate = (v: string) => {
    if (!v.trim()) { setError(""); return; }
    try { JSON.parse(v); setError(""); } catch { setError("Invalid JSON"); }
  };
  return (
    <div>
      <textarea
        rows={6}
        value={value}
        onChange={(e) => { onChange(e.target.value); validate(e.target.value); }}
        placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "WebPage"\n}'}
        className={`w-full font-mono text-xs bg-white/5 border rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none resize-none transition-colors ${
          error ? "border-red-500/50" : "border-white/10 focus:border-red-500/40"
        }`}
        spellCheck={false}
      />
      {error && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

interface PageEditorProps {
  route: string;
  label: string;
  icon: string;
  data: PageSeoEntry;
  onChange: (route: string, data: PageSeoEntry) => void;
}

function PageEditor({ route, label, icon, data, onChange }: PageEditorProps) {
  const [open, setOpen] = useState(false);
  const set = (key: keyof PageSeoEntry, value: unknown) =>
    onChange(route, { ...data, [key]: value });

  const hasData = !!(data.metaTitle || data.metaDescription || data.noIndex || data.noFollow || data.schemaJson);

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden bg-white/2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors text-left"
      >
        <span className="text-base">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-white/40 font-mono">{route}</p>
        </div>
        {hasData && (
          <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
            <Check size={10} />SEO set
          </span>
        )}
        {data.noIndex && (
          <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
            <EyeOff size={10} />noindex
          </span>
        )}
        {open ? <ChevronDown size={14} className="text-white/30 shrink-0" /> : <ChevronRight size={14} className="text-white/30 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-white/5 px-4 py-4 space-y-4 bg-white/1">
          {/* Title + description */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Meta Title</label>
                <CharCounter value={data.metaTitle || ""} max={60} />
              </div>
              <input
                value={data.metaTitle || ""}
                onChange={(e) => set("metaTitle", e.target.value)}
                placeholder="Page title for Google search results…"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/40 transition-colors"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Meta Description</label>
                <CharCounter value={data.metaDescription || ""} max={160} />
              </div>
              <textarea
                rows={3}
                value={data.metaDescription || ""}
                onChange={(e) => set("metaDescription", e.target.value)}
                placeholder="Description for Google search results…"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/40 resize-none transition-colors"
              />
            </div>
          </div>

          {/* Canonical + Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">Canonical URL</label>
              <input
                value={data.canonical || ""}
                onChange={(e) => set("canonical", e.target.value)}
                placeholder={`https://codecraftbd.info${route}`}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/40 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">Keywords (comma-separated)</label>
              <input
                value={data.keywords || ""}
                onChange={(e) => set("keywords", e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/40 transition-colors"
              />
            </div>
          </div>

          {/* OG */}
          <div className="bg-white/3 rounded-xl p-3 space-y-3">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={12} /> Open Graph (Social Sharing)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-white/50">OG Title</label>
                  <CharCounter value={data.ogTitle || ""} max={60} />
                </div>
                <input value={data.ogTitle || ""} onChange={(e) => set("ogTitle", e.target.value)}
                  placeholder="OG title (defaults to meta title)"
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">OG Image URL</label>
                <input value={data.ogImage || ""} onChange={(e) => set("ogImage", e.target.value)}
                  placeholder="https://… (1200×630)"
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none font-mono" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-white/50">OG Description</label>
                <CharCounter value={data.ogDescription || ""} max={160} />
              </div>
              <textarea rows={2} value={data.ogDescription || ""} onChange={(e) => set("ogDescription", e.target.value)}
                placeholder="OG description (defaults to meta description)"
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none resize-none" />
            </div>
          </div>

          {/* Robots controls */}
          <div className="flex items-center gap-6 py-2">
            <div className="flex items-center gap-2">
              <Toggle value={!!data.noIndex} onChange={(v) => set("noIndex", v)} />
              <span className="text-sm text-white/60">NoIndex <span className="text-xs text-white/30">(hide from Google)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Toggle value={!!data.noFollow} onChange={(v) => set("noFollow", v)} />
              <span className="text-sm text-white/60">NoFollow <span className="text-xs text-white/30">(don&apos;t follow links)</span></span>
            </div>
          </div>

          {/* Schema JSON-LD */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
              <Code2 size={12} /> JSON-LD Schema Markup
            </label>
            <JsonEditor value={data.schemaJson || ""} onChange={(v) => set("schemaJson", v)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function SeoManagerPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [localData, setLocalData] = useState<SeoPageMap>({});
  const [dirty, setDirty] = useState(false);

  const { data, isLoading } = useQuery<SeoPageMap>({
    queryKey: ["/api/admin/seo-pages"],
    queryFn: async () => {
      const r = await apiFetch("/api/admin/seo-pages");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  useEffect(() => {
    if (data) { setLocalData(data); setDirty(false); }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const r = await apiFetch("/api/admin/seo-pages", { method: "PUT", body: JSON.stringify(localData) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: () => {
      qc.setQueryData(["/api/admin/seo-pages"], localData);
      setDirty(false);
      toast.success("SEO settings saved!");
    },
    onError: () => toast.error("Failed to save SEO settings"),
  });

  const handleChange = useCallback((route: string, entry: PageSeoEntry) => {
    setLocalData((prev) => ({ ...prev, [route]: entry }));
    setDirty(true);
  }, []);

  const filtered = KNOWN_ROUTES.filter(
    (r) => r.label.toLowerCase().includes(search.toLowerCase()) || r.route.includes(search)
  );

  return (
    <AdminLayout
      title="SEO Manager"
      subtitle="Per-page meta titles, descriptions, Open Graph, JSON-LD schema and robots directives"
      actions={
        dirty ? (
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {save.isPending ? "Saving…" : "Save All Changes"}
          </button>
        ) : null
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Info banner */}
        <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <FileText size={16} className="text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-300">Per-Page SEO Control</p>
            <p className="text-xs text-blue-400/70 mt-0.5">
              These settings override the global SEO defaults for each specific page. Leave fields blank to use the global defaults configured in Site Settings → SEO tab.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500/40 transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <RefreshCw size={24} className="text-white/20 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(({ route, label, icon }) => (
              <PageEditor
                key={route}
                route={route}
                label={label}
                icon={icon}
                data={localData[route] ?? { route }}
                onChange={handleChange}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
