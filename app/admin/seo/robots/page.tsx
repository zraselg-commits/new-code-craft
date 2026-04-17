"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, RotateCcw, Info, ExternalLink, CheckCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const DEFAULT_ROBOTS = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /api/
Disallow: /checkout
Disallow: /profile

Sitemap: https://codecraftbd.info/sitemap.xml
Host: https://codecraftbd.info`;

export default function RobotsTxtEditorPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasOverride, setHasOverride] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiFetch("/api/admin/robots");
        const data = await r.json();
        if (data.text) {
          setText(data.text);
          setHasOverride(true);
        } else {
          setText(DEFAULT_ROBOTS);
          setHasOverride(false);
        }
      } catch {
        setText(DEFAULT_ROBOTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await apiFetch("/api/admin/robots", {
        method: "PUT",
        body: JSON.stringify({ text }),
      });
      if (!r.ok) throw new Error("Save failed");
      setHasOverride(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success("robots.txt saved and active!");
    } catch {
      toast.error("Failed to save robots.txt");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset to default robots.txt? Custom override will be removed.")) return;
    try {
      await apiFetch("/api/admin/robots", { method: "DELETE" });
      setText(DEFAULT_ROBOTS);
      setHasOverride(false);
      toast.success("Robots.txt reset to defaults");
    } catch {
      toast.error("Reset failed");
    }
  };

  return (
    <AdminLayout
      title="Robots.txt Editor"
      subtitle="Control which pages search engines can crawl"
      actions={
        <div className="flex items-center gap-2">
          {hasOverride && (
            <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors">
              <RotateCcw size={12} /> Reset to default
            </button>
          )}
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/20 transition-colors"
          >
            <ExternalLink size={12} /> Preview
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {saved ? <CheckCircle size={14} /> : saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? "Saved!" : saving ? "Saving…" : "Save"}
          </button>
        </div>
      }
    >
      <div className="max-w-3xl">
        <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5">
          <Info size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-400/80">
            This file controls search engine crawling. <strong>Incorrect rules can block your entire site from Google.</strong>{" "}
            Test at{" "}
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener" className="underline">
              Google Search Console
            </a>{" "}
            after saving.
            {hasOverride && <span className="ml-2 text-green-400">✓ Custom override is active</span>}
            {!hasOverride && <span className="ml-2 text-white/40">Using default rules — save to apply a custom override</span>}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw size={24} className="text-white/20 animate-spin" />
          </div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/2">
              <span className="text-xs font-mono text-white/40">robots.txt</span>
              <span className="text-xs text-white/30">{text.split("\n").length} lines</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={20}
              spellCheck={false}
              className="w-full bg-transparent font-mono text-sm text-white/80 p-4 focus:outline-none resize-none leading-6"
            />
          </div>
        )}

        <div className="mt-4 bg-white/3 border border-white/8 rounded-xl p-4">
          <p className="text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Common Directives</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-white/40 font-mono">
            <div><span className="text-white/60">User-agent: *</span> — Apply to all bots</div>
            <div><span className="text-white/60">Disallow: /admin</span> — Block admin</div>
            <div><span className="text-white/60">Allow: /</span> — Allow all pages</div>
            <div><span className="text-white/60">Sitemap:</span> — Point to sitemap</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
