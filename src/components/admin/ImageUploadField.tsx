"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import { Upload, Link2, X, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface ImageUploadFieldProps {
  /** Current image value (URL string) */
  value: string;
  /** Called whenever value changes — either from URL input or after upload */
  onChange: (url: string) => void;
  /** Label shown above the field */
  label: string;
  /** Optional description */
  description?: string;
  /** Placeholder for manual URL input */
  placeholder?: string;
  /** Accept attribute for the file picker, default "image/*" */
  accept?: string;
}

type UploadState = "idle" | "uploading" | "done" | "error";

export function ImageUploadField({
  value,
  onChange,
  label,
  description,
  placeholder = "https://example.com/image.jpg",
  accept = "image/*",
}: ImageUploadFieldProps) {
  const [tab, setTab] = useState<"url" | "upload">("url");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setUploadState("uploading");
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiFetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
      setUploadState("done");
    } catch (e) {
      setUploadError((e as Error).message);
      setUploadState("error");
    }
  }, [onChange]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearImage = () => {
    onChange("");
    setUploadState("idle");
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="py-3 border-b border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
        </div>
        {/* Tab switcher */}
        <div className="flex rounded-lg overflow-hidden border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-colors ${
              tab === "url" ? "bg-red-500 text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            <Link2 size={11} /> URL
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium border-l border-white/10 transition-colors ${
              tab === "upload" ? "bg-red-500 text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            <Upload size={11} /> Upload
          </button>
        </div>
      </div>

      {/* URL tab */}
      {tab === "url" && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/50 transition-colors"
        />
      )}

      {/* Upload tab */}
      {tab === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 cursor-pointer transition-all ${
            isDragging
              ? "border-red-500/60 bg-red-500/10"
              : uploadState === "done"
              ? "border-emerald-500/40 bg-emerald-500/5"
              : uploadState === "error"
              ? "border-red-400/50 bg-red-500/5"
              : "border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/5"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileChange}
          />

          {uploadState === "uploading" && (
            <>
              <Loader2 size={22} className="text-white/40 animate-spin" />
              <p className="text-xs text-white/50">Uploading...</p>
            </>
          )}
          {uploadState === "done" && (
            <>
              <CheckCircle2 size={22} className="text-emerald-400" />
              <p className="text-xs text-emerald-400">Uploaded successfully!</p>
              <p className="text-[10px] text-white/30 break-all text-center px-2">{value}</p>
            </>
          )}
          {uploadState === "error" && (
            <>
              <X size={22} className="text-red-400" />
              <p className="text-xs text-red-400">{uploadError}</p>
              <p className="text-[10px] text-white/40">Click to try again</p>
            </>
          )}
          {uploadState === "idle" && (
            <>
              <Upload size={22} className="text-white/30" />
              <p className="text-xs text-white/50">
                <span className="text-white/70 font-medium">Click to upload</span> or drag & drop
              </p>
              <p className="text-[10px] text-white/25">JPG, PNG, WebP, GIF, SVG — max 5MB</p>
            </>
          )}
        </div>
      )}

      {/* Preview — shown if any value set, regardless of tab */}
      {value && (
        <div className="mt-2 relative rounded-xl overflow-hidden border border-white/10 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full max-h-36 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-white/60 flex items-center gap-1">
              <ImageIcon size={10} /> Preview
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearImage(); }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/80 text-white text-[10px] hover:bg-red-500 transition-colors"
            >
              <X size={10} /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
