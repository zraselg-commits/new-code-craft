"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useCallback, useEffect } from "react";
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code2, Link as LinkIcon, Image as ImageIcon,
  Undo2, Redo2, Minus, AlignLeft, Code, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ─── Toolbar Button ────────────────────────────────────────────────────────

function ToolBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={cn(
        "w-7 h-7 flex items-center justify-center rounded text-xs transition-colors",
        active
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

// ─── Link Dialog ──────────────────────────────────────────────────────────

function LinkDialog({
  onConfirm,
  onCancel,
  initial,
}: {
  onConfirm: (url: string) => void;
  onCancel: () => void;
  initial: string;
}) {
  const [url, setUrl] = useState(initial);
  return (
    <div className="flex items-center gap-2 p-2 bg-popover border border-border rounded-lg shadow-lg text-sm">
      <Input
        autoFocus
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="h-7 text-xs w-56"
        onKeyDown={(e) => {
          if (e.key === "Enter") onConfirm(url);
          if (e.key === "Escape") onCancel();
        }}
      />
      <Button size="sm" className="h-7 text-xs px-2" onClick={() => onConfirm(url)} type="button">Set</Button>
      <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={onCancel} type="button">Cancel</Button>
    </div>
  );
}

// ─── Image URL Dialog ─────────────────────────────────────────────────────

function ImageDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: (url: string, alt: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  return (
    <div className="flex flex-col gap-2 p-3 bg-popover border border-border rounded-lg shadow-lg text-sm w-72">
      <p className="text-xs font-medium text-muted-foreground">Insert Image</p>
      <Input
        autoFocus
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Image URL (https://...)"
        className="h-7 text-xs"
      />
      <Input
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        placeholder="Alt text (optional)"
        className="h-7 text-xs"
      />
      <div className="flex gap-2">
        <Button size="sm" className="h-7 text-xs flex-1" onClick={() => onConfirm(url, alt)} type="button">Insert</Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onCancel} type="button">Cancel</Button>
      </div>
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your post content here...",
  minHeight = 360,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"rich" | "code">("rich");
  const [rawHtml, setRawHtml] = useState(value);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,    // ← prevents SSR/hydration mismatch error
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: "bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto",
          },
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-xl max-w-full" },
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2 hover:text-primary/80",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html);
      setRawHtml(html);
    },
    editorProps: {
      attributes: {
        class: "outline-none prose prose-sm dark:prose-invert max-w-none px-5 py-4 min-h-[inherit]",
      },
    },
  });

  // Sync external value reset (e.g. when dialog opens for new post)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && (value === "" || value === "<p></p>")) {
      editor.commands.clearContent();
      setRawHtml("");
    }
  }, [value, editor]);

  const handleModeSwitch = useCallback(
    (next: "rich" | "code") => {
      if (next === "code") {
        // Capture current rich output as raw HTML
        const html = editor?.getHTML() ?? "";
        setRawHtml(html);
      } else {
        // Apply raw HTML back to editor
        editor?.commands.setContent(rawHtml);
        onChange(rawHtml);
      }
      setMode(next);
    },
    [editor, rawHtml, onChange]
  );

  const handleRawChange = (v: string) => {
    setRawHtml(v);
    onChange(v);
  };

  const setLink = (url: string) => {
    setShowLinkDialog(false);
    if (!url) {
      editor?.chain().focus().unsetLink().run();
      return;
    }
    editor?.chain().focus().setLink({ href: url }).run();
  };

  const insertImage = (url: string, alt: string) => {
    setShowImageDialog(false);
    if (!url) return;
    editor?.chain().focus().setImage({ src: url, alt }).run();
  };

  if (!editor) return null;

  const currentLinkHref = editor.getAttributes("link").href ?? "";

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background flex flex-col">
      {/* ── Tab Bar ── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleModeSwitch("rich")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors",
              mode === "rich"
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye size={12} />
            Rich Text
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("code")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors",
              mode === "code"
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Code size={12} />
            HTML / Code
          </button>
        </div>
        <span className="text-[10px] text-muted-foreground/50">
          {mode === "rich" ? "WYSIWYG editor" : "Raw HTML editing"}
        </span>
      </div>

      {/* ── Toolbar (Rich mode only) ── */}
      {mode === "rich" && (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-b border-border bg-muted/20">
          {/* Text style */}
          <ToolBtn
            title="Bold (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <Bold size={13} />
          </ToolBtn>
          <ToolBtn
            title="Italic (Ctrl+I)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <Italic size={13} />
          </ToolBtn>
          <ToolBtn
            title="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
          >
            <Strikethrough size={13} />
          </ToolBtn>

          <Divider />

          {/* Headings */}
          <ToolBtn
            title="Heading 1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
          >
            <Heading1 size={13} />
          </ToolBtn>
          <ToolBtn
            title="Heading 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 size={13} />
          </ToolBtn>
          <ToolBtn
            title="Heading 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
          >
            <Heading3 size={13} />
          </ToolBtn>

          <Divider />

          {/* Lists */}
          <ToolBtn
            title="Bullet List"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            <List size={13} />
          </ToolBtn>
          <ToolBtn
            title="Ordered List"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            <ListOrdered size={13} />
          </ToolBtn>

          <Divider />

          {/* Blocks */}
          <ToolBtn
            title="Blockquote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
          >
            <Quote size={13} />
          </ToolBtn>
          <ToolBtn
            title="Inline Code"
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
          >
            <Code2 size={13} />
          </ToolBtn>
          <ToolBtn
            title="Code Block"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
          >
            <AlignLeft size={13} />
          </ToolBtn>
          <ToolBtn
            title="Horizontal Rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus size={13} />
          </ToolBtn>

          <Divider />

          {/* Link */}
          <div className="relative">
            <ToolBtn
              title="Insert / Edit Link"
              onClick={() => setShowLinkDialog((v) => !v)}
              active={editor.isActive("link")}
            >
              <LinkIcon size={13} />
            </ToolBtn>
            {showLinkDialog && (
              <div className="absolute top-8 left-0 z-50">
                <LinkDialog
                  initial={currentLinkHref}
                  onConfirm={setLink}
                  onCancel={() => setShowLinkDialog(false)}
                />
              </div>
            )}
          </div>

          {/* Image */}
          <div className="relative">
            <ToolBtn
              title="Insert Image by URL"
              onClick={() => setShowImageDialog((v) => !v)}
            >
              <ImageIcon size={13} />
            </ToolBtn>
            {showImageDialog && (
              <div className="absolute top-8 left-0 z-50">
                <ImageDialog
                  onConfirm={insertImage}
                  onCancel={() => setShowImageDialog(false)}
                />
              </div>
            )}
          </div>

          <Divider />

          {/* History */}
          <ToolBtn
            title="Undo (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo2 size={13} />
          </ToolBtn>
          <ToolBtn
            title="Redo (Ctrl+Shift+Z)"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo2 size={13} />
          </ToolBtn>
        </div>
      )}

      {/* ── Editor Area ── */}
      {mode === "rich" ? (
        <div style={{ minHeight }} className="overflow-auto">
          <EditorContent editor={editor} style={{ minHeight }} />
        </div>
      ) : (
        <Textarea
          value={rawHtml}
          onChange={(e) => handleRawChange(e.target.value)}
          className="font-mono text-xs rounded-none border-0 resize-none focus-visible:ring-0 bg-[#0d1117] text-[#e6edf3]"
          style={{ minHeight }}
          placeholder="<p>Write raw HTML here...</p>"
          spellCheck={false}
        />
      )}

      {/* ── Status bar ── */}
      <div className="px-4 py-1.5 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/50">
          {mode === "rich"
            ? `${editor.storage.characterCount?.characters?.() ?? rawHtml.replace(/<[^>]+>/g, "").length} chars`
            : `${rawHtml.length} chars (raw HTML)`}
        </span>
        <span className="text-[10px] text-muted-foreground/40">
          Tip: Switch to HTML/Code for raw editing
        </span>
      </div>
    </div>
  );
}
