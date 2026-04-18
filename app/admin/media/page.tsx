"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload, Trash2, Copy, RefreshCw, Image as ImageIcon,
  CheckCircle, Grid, List, Search, Zap,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import type { MediaFile } from "@lib/types-media";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadZone({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ savedPercent: number; compressedSizeKB: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await apiFetch("/api/admin/upload", { method: "POST", body: fd, headers: {} });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || "Upload failed");
      }
      const data = await r.json();
      setUploadResult({ savedPercent: data.savedPercent ?? 0, compressedSizeKB: data.compressedSizeKB ?? 0 });
      toast.success(`Uploaded! ${data.savedPercent > 0 ? `Compressed ${data.savedPercent}%` : ""}`);
      onUploaded(data.url);
    } catch (err) {
      toast.error(String(err));
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
        dragging
          ? "border-red-500/60 bg-red-500/10"
          : "border-white/10 hover:border-white/20 hover:bg-white/3"
      } ${uploading ? "pointer-events-none opacity-70" : ""}`}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={28} className="text-red-400 animate-spin" />
          <p className="text-sm text-white/60">Uploading & compressing…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
            <Upload size={20} className="text-white/40" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Drop image here or click to upload</p>
            <p className="text-xs text-white/40 mt-1">JPG, PNG, WebP, GIF, SVG — auto-compressed to WebP</p>
          </div>
          {uploadResult && uploadResult.savedPercent > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full">
              <Zap size={12} /> Saved {uploadResult.savedPercent}% — {uploadResult.compressedSizeKB}KB
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MediaCard({ file, onDelete, onCopy }: { file: MediaFile; onDelete: () => void; onCopy: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete ${file.filename}?`)) return;
    setDeleting(true);
    try {
      const r = await apiFetch(`/api/admin/media?filename=${encodeURIComponent(file.filename)}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      toast.success("Deleted");
      onDelete();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(file.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy();
  };

  return (
    <div className="group relative bg-white/3 border border-white/8 rounded-xl overflow-hidden hover:border-white/15 transition-all">
      {/* Preview */}
      <div className="aspect-square bg-[#0a0a0f] relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.url}
          alt={file.filename}
          className="w-full h-full object-contain p-2"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={handleCopy}
            title="Copy URL"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors disabled:opacity-50"
          >
            {deleting ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="px-2.5 py-2">
        <p className="text-xs text-white/70 truncate font-mono" title={file.filename}>{file.filename}</p>
        <p className="text-[10px] text-white/30 mt-0.5">{formatBytes(file.size)} · {file.ext.toUpperCase()}</p>
      </div>
    </div>
  );
}

export default function MediaLibraryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const { data, isLoading } = useQuery<{ files: MediaFile[] }>({
    queryKey: ["/api/admin/media"],
    queryFn: async () => {
      const r = await apiFetch("/api/admin/media");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["/api/admin/media"] });

  const files = (data?.files ?? []).filter(
    (f) => !search || f.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Media Library"
      subtitle="Upload, manage and copy URLs for all site images"
      actions={
        <div className="flex items-center gap-1.5">
          <button onClick={() => setView("grid")} className={`p-1.5 rounded ${view === "grid" ? "bg-white/10 text-white" : "text-white/30 hover:text-white"}`}>
            <Grid size={15} />
          </button>
          <button onClick={() => setView("list")} className={`p-1.5 rounded ${view === "list" ? "bg-white/10 text-white" : "text-white/30 hover:text-white"}`}>
            <List size={15} />
          </button>
        </div>
      }
    >
      <div className="max-w-5xl">
        <UploadZone onUploaded={refresh} />

        <div className="flex items-center gap-3 mt-5 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files…"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none"
            />
          </div>
          <span className="text-xs text-white/30 shrink-0">{files.length} files</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><RefreshCw size={24} className="text-white/20 animate-spin" /></div>
        ) : files.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <ImageIcon size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">{search ? "No files match your search" : "No files uploaded yet"}</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {files.map((f) => (
              <MediaCard
                key={f.filename}
                file={f}
                onDelete={refresh}
                onCopy={() => toast.success("URL copied to clipboard!")}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {files.map((f) => (
              <div key={f.filename} className="flex items-center gap-3 px-4 py-2.5 bg-white/3 border border-white/5 rounded-xl hover:bg-white/5 group transition-colors">
                <div className="w-10 h-10 rounded bg-[#0a0a0f] overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt={f.filename} className="w-full h-full object-contain" loading="lazy" />
                </div>
                <p className="flex-1 text-sm text-white/80 font-mono truncate">{f.filename}</p>
                <span className="text-xs text-white/30">{formatBytes(f.size)}</span>
                <span className="text-xs text-white/20 w-10 text-center">{f.ext.toUpperCase()}</span>
                <button
                  onClick={async () => { await navigator.clipboard.writeText(f.url); toast.success("Copied!"); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-white/40 hover:text-white transition-all"
                >
                  <Copy size={13} />
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(`Delete ${f.filename}?`)) return;
                    await apiFetch(`/api/admin/media?filename=${encodeURIComponent(f.filename)}`, { method: "DELETE" });
                    toast.success("Deleted");
                    refresh();
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400/50 hover:text-red-400 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
