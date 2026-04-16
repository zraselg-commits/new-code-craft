"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MessageSquare, Trash2, Mail, Calendar, Search, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  details: string;
  createdAt: string;
}

const AdminContacts = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);

  const { data: contacts = [], isLoading, refetch } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
    queryFn: async () => {
      const r = await apiFetch("/api/admin/contacts");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const r = await apiFetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/contacts"] }); setSelected(null); toast.success("Contact deleted"); },
    onError: () => toast.error("Delete failed"),
  });

  const filtered = contacts.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Contact Submissions"
      subtitle={`${contacts.length} total submissions`}
      actions={
        <button onClick={() => refetch()} className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-colors">
          <RefreshCw size={15} />
        </button>
      }
    >
      <div className="flex gap-4 max-w-6xl h-[calc(100vh-10rem)]">
        {/* List */}
        <div className="w-80 shrink-0 flex flex-col">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/40 transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5">
            {isLoading ? (
              Array.from({length: 5}).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare size={32} className="text-white/10 mx-auto mb-2" />
                <p className="text-sm text-white/25">No contacts found</p>
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                    selected?.id === c.id
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-white/3 border-white/8 hover:bg-white/5 hover:border-white/12"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                    <span className="text-[10px] text-white/25 shrink-0 ml-2">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-white/40 truncate">{c.email}</p>
                  <p className="text-xs text-white/30 truncate mt-0.5">{c.details}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 min-w-0 bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          {selected ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-white text-lg">{selected.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                      <Mail size={11} /> {selected.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                      <Calendar size={11} /> {new Date(selected.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=Re: Your enquiry at Code Craft BD`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-xs rounded-lg transition-colors"
                  >
                    <Mail size={12} />
                    Reply via Email
                  </a>
                  <button
                    onClick={() => window.confirm("Delete this contact?") && remove.mutate(selected.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs rounded-lg transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                {selected.service && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-1">Service Interest</p>
                    <span className="text-sm px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-medium">{selected.service}</span>
                  </div>
                )}
                {selected.phone && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-1">Phone</p>
                    <p className="text-sm text-white">{selected.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-2">Message</p>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/8">
                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{selected.details}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <MessageSquare size={48} className="text-white/10 mb-3" />
              <p className="text-sm text-white/25">Select a contact to view details</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminContacts;
