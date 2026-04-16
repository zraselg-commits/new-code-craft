"use client";

import { useMemo, useRef, useState } from "react";
import {
  User, Mail, Package, Calendar, DollarSign,
  Camera, Phone, Pencil, Check, X, Loader2, Lock, Eye, EyeOff,
  KeyRound, ChevronDown, ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { CountryCodePicker } from "@/components/ui/PhoneInput";

interface Order {
  id: string;
  serviceName: string;
  packageName: string;
  price: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  createdAt: string;
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
};

const paymentColor: Record<string, string> = {
  unpaid: "bg-red-500/10 text-red-500 border-red-500/20",
  paid: "bg-green-500/10 text-green-500 border-green-500/20",
  refunded: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const MAX_FILE_BYTES = 200 * 1024;

const isPhoneOnlyUser = (email?: string) =>
  !!email && /^phone_\d+@rasel\.cloud$/.test(email);

const ProfilePage = () => {
  const { user, updateLocalUser } = useAuth();
  const queryClient = useQueryClient();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name ?? "");
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneDialCode, setPhoneDialCode] = useState("+880");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const phoneOnly = isPhoneOnlyUser(user?.email);

  const { data: profileData } = useQuery<{ createdAt?: string; hasPassword?: boolean }>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const r = await apiFetch("/api/profile");
      if (!r.ok) throw new Error("Failed to load profile");
      return r.json();
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/mine"],
    queryFn: async () => {
      const r = await apiFetch("/api/orders/mine");
      if (!r.ok) throw new Error("Failed to load orders");
      return r.json();
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const hasPassword = !!profileData?.hasPassword;
  const isFirstSet = !hasPassword && phoneOnly;

  const completedCount = useMemo(
    () => orders.filter((o) => o.status === "completed").length,
    [orders]
  );
  const totalSpent = useMemo(
    () =>
      orders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((s, o) => s + parseFloat(o.price), 0),
    [orders]
  );

  const avatarSrc =
    user?.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "User")}&backgroundColor=6366f1,8b5cf6,a855f7`;

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!e.target.files) return;
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      toast.error(
        `Photo must be under 200 KB. Selected: ${(file.size / 1024).toFixed(0)} KB.`
      );
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const r = await apiFetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ avatarUrl: dataUrl }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(
          ((body as Record<string, unknown>).error as string) || "Upload failed"
        );
      }
      const updated = await r.json();
      updateLocalUser({ avatarUrl: updated.avatarUrl });
      toast.success("Profile photo updated!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload photo"
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const saveName = async () => {
    if (!nameValue.trim() || nameValue.trim() === user?.name) {
      setEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      const r = await apiFetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: nameValue.trim() }),
      });
      if (!r.ok) throw new Error("Failed to save name");
      const updated = await r.json();
      updateLocalUser({ name: updated.name });
      toast.success("Name updated!");
      setEditingName(false);
    } catch {
      toast.error("Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  const savePhone = async () => {
    const fullPhone = `${phoneDialCode.replace("-CA", "")}${phoneNumber.trim()}`;
    if (!phoneNumber.trim()) {
      setEditingPhone(false);
      return;
    }
    setIsSavingPhone(true);
    try {
      const r = await apiFetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ phone: fullPhone }),
      });
      if (!r.ok) throw new Error("Failed to save phone");
      const updated = await r.json();
      updateLocalUser({ phone: updated.phone });
      toast.success("Phone number updated!");
      setEditingPhone(false);
      setPhoneNumber("");
    } catch {
      toast.error("Failed to update phone");
    } finally {
      setIsSavingPhone(false);
    }
  };

  const savePassword = async () => {
    if (newPw.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    setIsSavingPw(true);
    try {
      const r = await apiFetch("/api/profile/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
          confirmPassword: confirmPw,
        }),
      });
      const body = (await r
        .json()
        .catch(() => ({}))) as Record<string, unknown>;
      if (!r.ok)
        throw new Error((body.error as string) || "Failed to update password");
      toast.success("Password updated successfully!");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setShowPasswordForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update password"
      );
    } finally {
      setIsSavingPw(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12 relative">
        <div className="absolute inset-0 mesh-gradient opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">

          {/* ─── Page title ─────────────────────────────────────────── */}
          <div className="pt-6 pb-5 animate-fade-in-up">
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your account settings and view your orders
            </p>
          </div>

          {/* ─── Hero card ──────────────────────────────────────────── */}
          <div className="glass-card p-5 md:p-6 mb-5 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">

              {/* Avatar */}
              <div className="relative shrink-0" data-testid="avatar-container">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-border/50">
                  <img
                    src={avatarSrc}
                    alt={user?.name || "Avatar"}
                    className="w-full h-full object-cover"
                    data-testid="img-avatar"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                  data-testid="button-upload-photo"
                  title="Upload photo (max 200 KB)"
                >
                  {isUploadingAvatar ? (
                    <Loader2 size={20} className="text-white animate-spin" />
                  ) : (
                    <Camera size={20} className="text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  data-testid="input-avatar-file"
                />
              </div>

              {/* Name + role + email */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h2
                    className="text-2xl font-bold text-foreground"
                    data-testid="text-username"
                  >
                    {user?.name}
                  </h2>
                  <span
                    className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      user?.role === "admin"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                    data-testid="text-role"
                  >
                    {user?.role}
                  </span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-muted-foreground mb-0.5">
                  <Mail size={13} className="shrink-0" />
                  <span data-testid="text-email" className="truncate">
                    {phoneOnly ? (
                      <span className="italic text-muted-foreground/60">
                        Phone-only account
                      </span>
                    ) : (
                      user?.email
                    )}
                  </span>
                </div>

                {user?.phone && (
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-muted-foreground">
                    <Phone size={13} className="shrink-0" />
                    <span data-testid="text-phone">{user.phone}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {profileData?.createdAt && (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                      <Calendar size={10} />
                      Member since{" "}
                      {new Date(profileData.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground/40">
                    Hover avatar to upload · max 200 KB
                  </span>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-6 sm:gap-4 sm:flex-col sm:items-end shrink-0">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-11 w-20 rounded-xl bg-muted/30 animate-pulse"
                    />
                  ))
                ) : (
                  <>
                    <div className="text-center sm:text-right">
                      <p
                        className="text-2xl font-bold gradient-text leading-none"
                        data-testid="stat-total-orders"
                      >
                        {orders.length}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Orders
                      </p>
                    </div>
                    <div className="text-center sm:text-right">
                      <p
                        className="text-2xl font-bold gradient-text leading-none"
                        data-testid="stat-completed-orders"
                      >
                        {completedCount}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Done
                      </p>
                    </div>
                    <div className="text-center sm:text-right">
                      <p
                        className="text-2xl font-bold gradient-text leading-none"
                        data-testid="stat-total-spent"
                      >
                        ${totalSpent.toFixed(0)}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Spent
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ─── 2-column detail card grid ──────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 animate-fade-in-up">

            {/* ── Name card ── */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <User size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Display Name
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your public profile name
                  </p>
                </div>
              </div>

              {editingName ? (
                <div className="space-y-2">
                  <input
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    className="w-full text-sm bg-muted/50 border border-primary/40 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary transition-colors"
                    autoFocus
                    data-testid="input-edit-name"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveName}
                      disabled={isSavingName}
                      className="btn-primary-glow flex items-center gap-1.5 !py-1.5 !px-3 text-xs"
                      data-testid="button-save-name"
                    >
                      {isSavingName ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingName(false);
                        setNameValue(user?.name ?? "");
                      }}
                      className="px-3 py-1.5 text-xs rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      data-testid="button-cancel-name"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between group/name">
                  <span
                    className="text-sm font-medium text-foreground"
                    data-testid="text-name-display"
                  >
                    {user?.name}
                  </span>
                  <button
                    onClick={() => {
                      setNameValue(user?.name ?? "");
                      setEditingName(true);
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/50 hover:border-border rounded-lg px-2.5 py-1.5 transition-colors"
                    data-testid="button-edit-name"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* ── Phone card ── */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Phone Number
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For account recovery and notifications
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-medium text-foreground"
                  data-testid="text-phone"
                >
                  {user?.phone || (
                    <span className="text-muted-foreground/50 italic text-xs">
                      No phone number
                    </span>
                  )}
                </span>
                <button
                  onClick={() => {
                    setPhoneNumber("");
                    setPhoneDialCode("+880");
                    setEditingPhone(true);
                  }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/50 hover:border-border rounded-lg px-2.5 py-1.5 transition-colors"
                  data-testid="button-edit-phone"
                >
                  <Pencil size={12} />
                  {user?.phone ? "Edit" : "Add"}
                </button>
              </div>
            </div>

            {/* ── Password card ── */}
            <div className="glass-card overflow-hidden">
              <button
                onClick={() => setShowPasswordForm((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
                data-testid="button-toggle-password-form"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <KeyRound size={16} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {isFirstSet ? "Set Password" : "Change Password"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isFirstSet
                        ? "Add a password to sign in with email"
                        : "Update your account password"}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={15}
                  className={`text-muted-foreground transition-transform duration-200 shrink-0 ${showPasswordForm ? "rotate-180" : ""}`}
                />
              </button>

              {showPasswordForm && (
                <div className="px-5 pb-5 border-t border-border/30">
                  <div className="pt-4 space-y-3">
                    {isFirstSet && (
                      <div className="text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5 flex items-start gap-2">
                        <Lock size={12} className="shrink-0 mt-0.5 text-primary" />
                        <span>
                          Setting a password lets you also sign in with email.
                        </span>
                      </div>
                    )}

                    {hasPassword && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPw ? "text" : "password"}
                            value={currentPw}
                            onChange={(e) => setCurrentPw(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full text-sm bg-muted/50 border border-border/50 rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:border-primary/50 transition-colors"
                            data-testid="input-current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showCurrentPw ? (
                              <EyeOff size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPw ? "text" : "password"}
                          value={newPw}
                          onChange={(e) => setNewPw(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full text-sm bg-muted/50 border border-border/50 rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:border-primary/50 transition-colors"
                          data-testid="input-new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPw ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") savePassword();
                        }}
                        placeholder="Repeat new password"
                        className="w-full text-sm bg-muted/50 border border-border/50 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary/50 transition-colors"
                        data-testid="input-confirm-password"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={savePassword}
                        disabled={isSavingPw}
                        className="btn-primary-glow flex items-center gap-2 !py-2 !px-4 text-sm"
                        data-testid="button-save-password"
                      >
                        {isSavingPw ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ShieldCheck size={14} />
                        )}
                        {isFirstSet ? "Set Password" : "Update"}
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordForm(false);
                          setCurrentPw("");
                          setNewPw("");
                          setConfirmPw("");
                        }}
                        className="px-4 py-2 text-sm rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        data-testid="button-cancel-password"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Orders card ── */}
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Package size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Order History
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isLoading
                        ? "Loading…"
                        : orders.length === 0
                        ? "No orders yet"
                        : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-xl bg-muted/30 animate-pulse"
                    />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package
                    size={32}
                    className="text-muted-foreground/20 mx-auto mb-2"
                  />
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    Your orders will appear here once placed.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/20 max-h-72 overflow-y-auto">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      data-testid={`row-order-${order.id}`}
                      className="px-5 py-3 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {order.serviceName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {order.packageName}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="flex items-center gap-0.5 text-sm font-semibold text-foreground">
                            <DollarSign size={11} />
                            {parseFloat(order.price).toFixed(2)}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                              statusColor[order.status] ||
                              "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                            paymentColor[order.paymentStatus] || ""
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar size={10} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Phone number dialog ── */}
      <Dialog open={editingPhone} onOpenChange={(o) => {
        if (!o) { setEditingPhone(false); setPhoneNumber(""); }
      }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone size={16} className="text-primary" />
              {user?.phone ? "Edit Phone Number" : "Add Phone Number"}
            </DialogTitle>
            <DialogDescription>
              {user?.phone
                ? "Update your phone number for account recovery and notifications."
                : "Add a phone number for account recovery and notifications."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="flex gap-2">
              <CountryCodePicker
                value={phoneDialCode}
                onChange={setPhoneDialCode}
              />
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") savePhone();
                  if (e.key === "Escape") { setEditingPhone(false); setPhoneNumber(""); }
                }}
                placeholder="1XXXXXXXXX"
                type="tel"
                className="text-sm bg-muted/50 border border-primary/40 rounded-lg px-3 py-2.5 flex-1 focus:outline-none focus:border-primary transition-colors"
                autoFocus
                data-testid="input-edit-phone"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setEditingPhone(false); setPhoneNumber(""); }}
                className="px-4 py-2 text-sm rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePhone}
                disabled={isSavingPhone}
                className="btn-primary-glow flex items-center gap-2 !py-2 !px-4 text-sm"
                data-testid="button-save-phone"
              >
                {isSavingPhone ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Save
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProfilePage;
