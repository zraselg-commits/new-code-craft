"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Package, X, ChevronDown, ChevronUp } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { BilingualField } from "@/components/admin/BilingualField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface ServicePackage {
  id: string;
  serviceId: string;
  name: string;
  tier: string;
  price: string;
  features: string[];
  deliveryDays: number;
  revisions: number | null;
  isPopular: boolean;
}

interface Service {
  id: string;
  title: string; title_bn?: string;
  slug: string;
  category: string;
  description: string; description_bn?: string;
  imageUrl: string | null;
  tags: string[];
  isActive: boolean;
  packages: ServicePackage[];
}

const TIERS = ["basic", "standard", "premium"] as const;

const emptyServiceForm = {
  title: "",    title_bn: "",
  slug: "",
  category: "",
  description: "", description_bn: "",
  imageUrl: "",
  tags: "",
  isActive: true,
};

const emptyPackageForm = {
  name: "",
  name_bn: "",
  tier: "basic" as string,
  price: "",
  features: "",
  features_bn: "",
  deliveryDays: "7",
  revisions: "",
  isPopular: false,
};

const AdminServices = () => {
  const queryClient = useQueryClient();
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [serviceModal, setServiceModal] = useState<{ open: boolean; editing: Service | null }>({ open: false, editing: null });
  const [packageModal, setPackageModal] = useState<{ open: boolean; serviceId: string; editing: ServicePackage | null }>({ open: false, serviceId: "", editing: null });
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [packageForm, setPackageForm] = useState(emptyPackageForm);

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
    queryFn: async () => {
      const r = await apiFetch("/api/admin/services");
      if (!r.ok) throw new Error("Failed to load services");
      return r.json();
    },
  });

  const upsertService = useMutation({
    mutationFn: async (data: typeof serviceForm & { id?: string }) => {
      const { id, ...body } = data;
      const payload = {
        ...body,
        tags: body.tags.split(",").map((t) => t.trim()).filter(Boolean),
        imageUrl: body.imageUrl || undefined,
      };
      const r = id
        ? await apiFetch(`/api/admin/services/${id}`, { method: "PUT", body: JSON.stringify(payload) })
        : await apiFetch("/api/admin/services", { method: "POST", body: JSON.stringify(payload) });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as Record<string, unknown>).error as string || "Failed");
      }
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setServiceModal({ open: false, editing: null });
      toast.success(serviceModal.editing ? "Service updated" : "Service created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const r = await apiFetch(`/api/admin/services/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast.success("Service deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const r = await apiFetch(`/api/admin/services/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive }),
      });
      if (!r.ok) throw new Error("Update failed");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  const upsertPackage = useMutation({
    mutationFn: async (data: typeof packageForm & { id?: string; serviceId: string }) => {
      const { id, serviceId, ...body } = data;
      const payload = {
        serviceId,
        name:         body.name,
        name_bn:      body.name_bn,
        tier:         body.tier,
        price:        parseFloat(body.price),
        features:     body.features.split("\n").map((f) => f.trim()).filter(Boolean),
        features_bn:  body.features_bn.split("\n").map((f) => f.trim()).filter(Boolean),
        deliveryDays: parseInt(body.deliveryDays, 10),
        revisions:    body.revisions === "" ? null : parseInt(body.revisions, 10),
        isPopular:    body.isPopular,
      };
      const r = id
        ? await apiFetch(`/api/admin/packages/${id}`, { method: "PUT", body: JSON.stringify(payload) })
        : await apiFetch("/api/admin/packages", { method: "POST", body: JSON.stringify(payload) });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as Record<string, unknown>).error as string || "Failed");
      }
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setPackageModal({ open: false, serviceId: "", editing: null });
      toast.success(packageModal.editing ? "Package updated" : "Package created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deletePackage = useMutation({
    mutationFn: async (id: string) => {
      const r = await apiFetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast.success("Package deleted");
    },
    onError: () => toast.error("Failed to delete package"),
  });

  const openAddService = () => {
    setServiceForm(emptyServiceForm);
    setServiceModal({ open: true, editing: null });
  };

  const openEditService = (svc: Service) => {
    setServiceForm({
      title: svc.title,           title_bn: svc.title_bn ?? "",
      slug: svc.slug,
      category: svc.category,
      description: svc.description, description_bn: svc.description_bn ?? "",
      imageUrl: svc.imageUrl ?? "",
      tags: svc.tags.join(", "),
      isActive: svc.isActive,
    });
    setServiceModal({ open: true, editing: svc });
  };

  const openAddPackage = (serviceId: string) => {
    setPackageForm(emptyPackageForm);
    setPackageModal({ open: true, serviceId, editing: null });
  };

  const openEditPackage = (pkg: ServicePackage) => {
    setPackageForm({
      name:         pkg.name,
      name_bn:      (pkg as any).name_bn ?? "",
      tier:         pkg.tier,
      price:        pkg.price,
      features:     pkg.features.join("\n"),
      features_bn:  ((pkg as any).features_bn ?? []).join("\n"),
      deliveryDays: String(pkg.deliveryDays),
      revisions:    pkg.revisions === null ? "" : String(pkg.revisions),
      isPopular:    pkg.isPopular,
    });
    setPackageModal({ open: true, serviceId: pkg.serviceId, editing: pkg });
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertService.mutate({ ...serviceForm, id: serviceModal.editing?.id });
  };

  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertPackage.mutate({ ...packageForm, serviceId: packageModal.serviceId, id: packageModal.editing?.id });
  };

  return (
    <AdminLayout title="Services">
      <div className="space-y-4 max-w-5xl">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{services.length} services</p>
          <button
            onClick={openAddService}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            data-testid="button-add-service"
          >
            <Plus size={15} />
            Add Service
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-10 text-center text-muted-foreground">
            No services yet. Add your first service.
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((svc) => (
              <div key={svc.id} className="rounded-xl border border-border/50 bg-card overflow-hidden" data-testid={`card-service-${svc.id}`}>
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground text-sm">{svc.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">{svc.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${svc.isActive ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" : "bg-muted text-muted-foreground border-border/50"}`}>
                        {svc.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">/services/{svc.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleActive.mutate({ id: svc.id, isActive: !svc.isActive })}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                      title={svc.isActive ? "Deactivate" : "Activate"}
                      data-testid={`button-toggle-active-${svc.id}`}
                    >
                      {svc.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                    </button>
                    <button
                      onClick={() => openEditService(svc)}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                      data-testid={`button-edit-service-${svc.id}`}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${svc.title}"? This will also delete all its packages.`)) {
                          deleteService.mutate(svc.id);
                        }
                      }}
                      className="p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors"
                      data-testid={`button-delete-service-${svc.id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={() => setExpandedService(expandedService === svc.id ? null : svc.id)}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                      data-testid={`button-expand-service-${svc.id}`}
                    >
                      {expandedService === svc.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {expandedService === svc.id && (
                  <div className="border-t border-border/40 bg-muted/20 px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <Package size={14} />
                        Packages ({svc.packages?.length ?? 0})
                      </div>
                      <button
                        onClick={() => openAddPackage(svc.id)}
                        className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/15 transition-colors"
                        data-testid={`button-add-package-${svc.id}`}
                      >
                        <Plus size={12} />
                        Add Package
                      </button>
                    </div>
                    {(svc.packages ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No packages yet.</p>
                    ) : (
                      <div className="grid sm:grid-cols-3 gap-3">
                        {[...svc.packages].sort((a, b) => {
                          const order = { basic: 0, standard: 1, premium: 2 };
                          return (order[a.tier as keyof typeof order] ?? 3) - (order[b.tier as keyof typeof order] ?? 3);
                        }).map((pkg) => (
                          <div key={pkg.id} className="rounded-lg border border-border/50 bg-background p-3" data-testid={`card-package-${pkg.id}`}>
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <p className="font-medium text-sm text-foreground">{pkg.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{pkg.tier} · ${parseFloat(pkg.price).toLocaleString()}</p>
                              </div>
                              <div className="flex gap-0.5">
                                <button onClick={() => openEditPackage(pkg)} className="p-1 rounded text-muted-foreground hover:text-foreground" data-testid={`button-edit-package-${pkg.id}`}>
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete "${pkg.name}" package?`)) deletePackage.mutate(pkg.id);
                                  }}
                                  className="p-1 rounded text-muted-foreground hover:text-destructive"
                                  data-testid={`button-delete-package-${pkg.id}`}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{pkg.deliveryDays}d · {pkg.revisions === null ? "∞" : pkg.revisions} rev{pkg.isPopular ? " · ⭐ Popular" : ""}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {serviceModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="font-semibold text-foreground">{serviceModal.editing ? "Edit Service" : "Add Service"}</h2>
              <button onClick={() => setServiceModal({ open: false, editing: null })} className="p-1.5 rounded text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleServiceSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Bilingual Title */}
              <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
                <BilingualField
                  label="Title" required
                  nameEn="title" nameBn="title_bn"
                  valueEn={serviceForm.title} valueBn={serviceForm.title_bn}
                  onChange={(k, v) => setServiceForm({ ...serviceForm, [k]: v })}
                  placeholder="Web Development" placeholderBn="ওয়েব ডেভেলপমেন্ট"
                />
              </div>
              {/* Bilingual Description */}
              <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
                <BilingualField
                  label="Description" required
                  nameEn="description" nameBn="description_bn"
                  valueEn={serviceForm.description} valueBn={serviceForm.description_bn}
                  onChange={(k, v) => setServiceForm({ ...serviceForm, [k]: v })}
                  type="textarea" rows={3}
                  placeholder="Describe this service..." placeholderBn="এই সেবাটি বর্ণনা করুন..."
                />
              </div>
              {[
                { label: "Slug (e.g. web-development)", key: "slug", type: "text", required: true },
                { label: "Category", key: "category", type: "text", required: true },
                { label: "Tags (comma separated)", key: "tags", type: "text", required: false },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={serviceForm[f.key as keyof typeof serviceForm] as string}
                    onChange={(e) => setServiceForm({ ...serviceForm, [f.key]: e.target.value })}
                    className="w-full bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    data-testid={`input-service-${f.key}`}
                  />
                </div>
              ))}
              <ImageUploadField
                label="Service Image (optional)"
                description="Upload or paste URL. Shown on service card."
                value={serviceForm.imageUrl}
                onChange={(url) => setServiceForm({ ...serviceForm, imageUrl: url })}
                placeholder="https://..."
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="svc-active"
                  checked={serviceForm.isActive}
                  onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
                  className="rounded"
                  data-testid="input-service-isActive"
                />
                <label htmlFor="svc-active" className="text-sm text-foreground">Active (visible to users)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={upsertService.isPending}
                  className="flex-1 bg-primary text-primary-foreground text-sm font-medium py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  data-testid="button-submit-service"
                >
                  {upsertService.isPending ? "Saving..." : serviceModal.editing ? "Save Changes" : "Create Service"}
                </button>
                <button
                  type="button"
                  onClick={() => setServiceModal({ open: false, editing: null })}
                  className="px-4 text-sm text-muted-foreground border border-border/60 rounded-lg hover:bg-muted/40"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {packageModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="font-semibold text-foreground">{packageModal.editing ? "Edit Package" : "Add Package"}</h2>
              <button onClick={() => setPackageModal({ open: false, serviceId: "", editing: null })} className="p-1.5 rounded text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePackageSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <BilingualField
                label="Package Name"
                nameEn="name"
                nameBn="name_bn"
                valueEn={packageForm.name}
                valueBn={packageForm.name_bn}
                onChange={(field, val) => setPackageForm((prev) => ({ ...prev, [field]: val }))}
                required
              />
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tier</label>
                <select
                  value={packageForm.tier}
                  onChange={(e) => setPackageForm({ ...packageForm, tier: e.target.value })}
                  className="w-full bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  data-testid="input-package-tier"
                >
                  {TIERS.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              {[
                { label: "Price ($)", key: "price", type: "number", required: true, min: "0", step: "0.01" },
                { label: "Delivery Days", key: "deliveryDays", type: "number", required: true, min: "1", step: "1" },
                { label: "Revisions (leave blank for unlimited)", key: "revisions", type: "number", required: false, min: "0", step: "1" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    min={f.min}
                    step={f.step}
                    value={packageForm[f.key as keyof typeof packageForm] as string}
                    onChange={(e) => setPackageForm({ ...packageForm, [f.key]: e.target.value })}
                    className="w-full bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    data-testid={`input-package-${f.key}`}
                  />
                </div>
              ))}
              <BilingualField
                label="Features (one per line)"
                type="textarea"
                rows={4}
                nameEn="features"
                nameBn="features_bn"
                valueEn={packageForm.features}
                valueBn={packageForm.features_bn}
                onChange={(field, val) => setPackageForm((prev) => ({ ...prev, [field]: val }))}
                required
                placeholder={"Feature 1\nFeature 2\nFeature 3"}
                placeholderBn={"বৈশিষ্ট্য ১\nবৈশিষ্ট্য ২\nবৈশিষ্ট্য ৩"}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pkg-popular"
                  checked={packageForm.isPopular}
                  onChange={(e) => setPackageForm({ ...packageForm, isPopular: e.target.checked })}
                  className="rounded"
                  data-testid="input-package-isPopular"
                />
                <label htmlFor="pkg-popular" className="text-sm text-foreground">Mark as Most Popular</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={upsertPackage.isPending}
                  className="flex-1 bg-primary text-primary-foreground text-sm font-medium py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  data-testid="button-submit-package"
                >
                  {upsertPackage.isPending ? "Saving..." : packageModal.editing ? "Save Changes" : "Create Package"}
                </button>
                <button
                  type="button"
                  onClick={() => setPackageModal({ open: false, serviceId: "", editing: null })}
                  className="px-4 text-sm text-muted-foreground border border-border/60 rounded-lg hover:bg-muted/40"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminServices;
