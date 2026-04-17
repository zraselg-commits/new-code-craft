"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Trash2, RefreshCw, ArrowRight, Save, Edit2, X, Check,
  AlertCircle, ExternalLink,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import type { RedirectRule } from "@lib/redirects";

function StatusBadge({ type }: { type: 301 | 302 }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
      type === 301 ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
    }`}>
      {type}
    </span>
  );
}

function AddForm({ onAdd }: { onAdd: () => void }) {
  const [from, setFrom] = useState("/");
  const [to, setTo] = useState("");
  const [type, setType] = useState<301 | 302>(301);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from.startsWith("/")) { toast.error("'From' path must start with /"); return; }
    if (!to) { toast.error("'To' URL is required"); return; }
    setLoading(true);
    try {
      const r = await apiFetch("/api/admin/redirects", {
        method: "POST",
        body: JSON.stringify({ from, to, type }),
      });
      if (!r.ok) throw new Error("Failed");
      toast.success("Redirect added");
      setFrom("/");
      setTo("");
      onAdd();
    } catch {
      toast.error("Failed to add redirect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/3 border border-white/8 rounded-xl p-4">
      <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Plus size={14} className="text-red-400" />Add New Redirect</p>
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr,auto,auto] gap-2 items-center">
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="/old-url"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500/40 font-mono"
        />
        <ArrowRight size={16} className="text-white/30 mx-1 shrink-0" />
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="/new-url or https://..."
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500/40 font-mono"
        />
        <select
          value={type}
          onChange={(e) => setType(Number(e.target.value) as 301 | 302)}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none font-mono"
        >
          <option value={301}>301 (Permanent)</option>
          <option value={302}>302 (Temporary)</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
          Add
        </button>
      </div>
    </form>
  );
}

function RedirectRow({ rule, onDelete, onUpdate }: { rule: RedirectRule; onDelete: () => void; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [from, setFrom] = useState(rule.from);
  const [to, setTo] = useState(rule.to);
  const [type, setType] = useState<301 | 302>(rule.type);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const r = await apiFetch("/api/admin/redirects", {
        method: "PUT",
        body: JSON.stringify({ id: rule.id, from, to, type }),
      });
      if (!r.ok) throw new Error("Failed");
      toast.success("Updated");
      setEditing(false);
      onUpdate();
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete redirect: ${rule.from} → ${rule.to}?`)) return;
    setLoading(true);
    try {
      const r = await apiFetch(`/api/admin/redirects?id=${rule.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed");
      toast.success("Deleted");
      onDelete();
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl">
        <input value={from} onChange={(e) => setFrom(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white font-mono focus:outline-none" />
        <ArrowRight size={14} className="text-white/30 shrink-0" />
        <input value={to} onChange={(e) => setTo(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white font-mono focus:outline-none" />
        <select value={type} onChange={(e) => setType(Number(e.target.value) as 301 | 302)}
          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none">
          <option value={301}>301</option>
          <option value={302}>302</option>
        </select>
        <button onClick={handleSave} disabled={loading} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded transition-colors">
          <Check size={14} />
        </button>
        <button onClick={() => setEditing(false)} className="p-1.5 text-white/30 hover:text-white hover:bg-white/5 rounded transition-colors">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-white/5 rounded-xl bg-white/2 hover:bg-white/3 group transition-colors">
      <StatusBadge type={rule.type} />
      <span className="font-mono text-sm text-white/80 flex-1 truncate">{rule.from}</span>
      <ArrowRight size={14} className="text-white/30 shrink-0" />
      <span className="font-mono text-sm text-white/60 flex-1 truncate">{rule.to}</span>
      <a href={rule.from} target="_blank" rel="noopener" className="opacity-0 group-hover:opacity-100 p-1.5 text-white/30 hover:text-white transition-all">
        <ExternalLink size={12} />
      </a>
      <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 p-1.5 text-white/30 hover:text-blue-400 transition-all">
        <Edit2 size={13} />
      </button>
      <button onClick={handleDelete} disabled={loading} className="opacity-0 group-hover:opacity-100 p-1.5 text-white/30 hover:text-red-400 transition-all disabled:opacity-30">
        {loading ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
      </button>
    </div>
  );
}

export default function RedirectManagerPage() {
  const qc = useQueryClient();

  const { data: rules = [], isLoading } = useQuery<RedirectRule[]>({
    queryKey: ["/api/admin/redirects"],
    queryFn: async () => {
      const r = await apiFetch("/api/admin/redirects");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["/api/admin/redirects"] });

  return (
    <AdminLayout
      title="Redirect Manager"
      subtitle="Create and manage 301/302 URL redirects"
    >
      <div className="max-w-4xl">
        <div className="mb-5 bg-white/3 border border-white/8 rounded-xl p-3 flex items-start gap-2.5">
          <AlertCircle size={14} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-400/70">
            <strong className="text-blue-300">301 (Permanent)</strong> — Use when a page has moved forever. Passes full SEO value.{" "}
            <strong className="text-blue-300">302 (Temporary)</strong> — Use for temporary redirects; SEO value stays with original URL.
            Redirects take effect immediately at runtime.
          </p>
        </div>

        <AddForm onAdd={refresh} />

        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/70">
              Active Redirects <span className="text-white/30">({rules.length})</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><RefreshCw size={20} className="text-white/20 animate-spin" /></div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <ArrowRight size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No redirects yet</p>
              <p className="text-xs mt-1">Add your first redirect above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <RedirectRow key={rule.id} rule={rule} onDelete={refresh} onUpdate={refresh} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
