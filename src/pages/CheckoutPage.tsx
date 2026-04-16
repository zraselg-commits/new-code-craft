"use client";

import { useState, FormEvent } from "react";
import {
  Send, CheckCircle, ArrowLeft, ShoppingBag, Loader2,
  CreditCard, Smartphone, User, Mail, Phone,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CountryCodePicker } from "@/components/ui/PhoneInput";

// TODO: integrate Stripe API key — replace this stub with real Stripe SDK calls
async function handleStripePayment(_orderId: string): Promise<void> {
  // TODO: create Stripe PaymentIntent, redirect to Stripe Checkout or use Stripe Elements
  console.log("Stripe payment stub for order:", _orderId);
}

// TODO: integrate bKash API key — replace this stub with real bKash payment gateway calls
async function handleBkashPayment(_orderId: string): Promise<void> {
  // TODO: call bKash payment API, redirect user to bKash payment page
  console.log("bKash payment stub for order:", _orderId);
}

type PaymentMethod = "stripe" | "bkash";

interface OrderRef {
  id: string;
  reference: string;
}

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; description: string; icon: React.ReactNode; badge?: string }[] = [
  {
    id: "stripe",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, Amex & more",
    icon: <CreditCard size={22} className="text-blue-500" />,
    badge: "International",
  },
  {
    id: "bkash",
    label: "bKash",
    description: "Mobile banking for Bangladesh",
    icon: <Smartphone size={22} className="text-pink-500" />,
    badge: "Local",
  },
];

const CheckoutPage = () => {
  const { t } = useLanguage();
  const { items, total, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user, loginWithToken } = useAuth();

  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [orderRefs, setOrderRefs] = useState<OrderRef[]>([]);

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestStep, setGuestStep] = useState<"info" | "submitting">("info");
  const [guestName, setGuestName] = useState("");
  const [guestIdType, setGuestIdType] = useState<"email" | "phone">("phone");
  const [guestDialCode, setGuestDialCode] = useState("+880");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestError, setGuestError] = useState("");

  const buildOrders = async (userId?: string, userName?: string, userEmail?: string) => {
    const created: OrderRef[] = [];
    for (const item of items) {
      const res = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          serviceId: item.serviceId,
          packageId: item.packageId,
          notes: notes.trim() || undefined,
          paymentMethod,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const errorText =
          typeof body === "object" && body !== null
            ? String((body as Record<string, unknown>).error ?? "Failed to place order")
            : "Failed to place order";
        throw new Error(errorText);
      }
      const data = await res.json();
      created.push({ id: data.id, reference: data.id.split("-")[0].toUpperCase() });
    }
    return created;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!user) {
      setShowGuestModal(true);
      return;
    }

    setStatus("loading");
    try {
      const created = await buildOrders();
      setOrderRefs(created);
      clearCart();
      setStatus("success");

      if (paymentMethod === "stripe") await handleStripePayment(created[0]?.id ?? "");
      if (paymentMethod === "bkash") await handleBkashPayment(created[0]?.id ?? "");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(message);
      setStatus("idle");
    }
  };

  const handleGuestSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGuestError("");

    if (!guestName.trim()) {
      setGuestError("Please enter your name.");
      return;
    }

    const identifier =
      guestIdType === "phone"
        ? `${guestDialCode.replace("-CA", "")}${guestPhone.trim()}`
        : guestEmail.trim();

    if (!identifier) {
      setGuestError(`Please enter your ${guestIdType === "phone" ? "phone number" : "email address"}.`);
      return;
    }

    setGuestStep("submitting");

    try {
      const created: OrderRef[] = [];

      for (const item of items) {
        const res = await fetch("/api/orders/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            identifierType: guestIdType,
            guestName: guestName.trim(),
            serviceId: item.serviceId,
            packageId: item.packageId,
            notes: notes.trim() || undefined,
            paymentMethod,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            typeof body === "object" && body !== null
              ? String((body as Record<string, unknown>).error ?? "Failed to place order")
              : "Failed to place order"
          );
        }

        const data = await res.json();

        if (data.token && data.user) {
          loginWithToken(data.token, data.user);
          if (data.isNewAccount) {
            toast.info("Account created! You can set a new password later in your profile.", { duration: 6000 });
          }
        }

        if (paymentMethod === "stripe") await handleStripePayment(data.order?.id ?? "");
        if (paymentMethod === "bkash") await handleBkashPayment(data.order?.id ?? "");

        created.push({ id: data.order.id, reference: data.order.id.split("-")[0].toUpperCase() });
      }

      setShowGuestModal(false);
      setOrderRefs(created);
      clearCart();
      setStatus("success");
    } catch (err) {
      setGuestError(err instanceof Error ? err.message : "Something went wrong");
      setGuestStep("info");
    }
  };

  if (items.length === 0 && status !== "success") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-24 pb-10 flex items-center justify-center">
          <div className="text-center glass-card p-12 max-w-md mx-6">
            <ShoppingBag size={48} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add a service package before checking out.</p>
            <Link href="/services" className="btn-primary-glow inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              Browse Services
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-24 pb-10 flex items-center justify-center">
          <div className="glass-card p-12 text-center max-w-md mx-6 glow-border animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3" data-testid="text-order-success">
              {t.checkoutSuccess}
            </h2>
            <p className="text-muted-foreground mb-2">{t.checkoutSuccessDesc}</p>
            {orderRefs.length > 0 && (
              <div className="mb-6 space-y-1">
                {orderRefs.map((ref) => (
                  <p key={ref.id} className="text-sm text-muted-foreground">
                    Order ref:{" "}
                    <span className="font-mono font-bold text-foreground" data-testid={`text-order-reference-${ref.id}`}>
                      {ref.reference}
                    </span>
                  </p>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Link
                href="/profile"
                className="btn-primary-glow inline-flex items-center justify-center gap-2"
                data-testid="link-view-orders"
              >
                View My Orders
              </Link>
              <Link href="/" className="btn-secondary-outline inline-flex items-center justify-center gap-2">
                <ArrowLeft size={16} />
                {t.checkoutBack}
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-10 relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-2xl">
          <div className="text-center mb-10 animate-fade-in-up">
            <h1 className="section-heading text-3xl">{t.checkoutTitle}</h1>
            <p className="text-muted-foreground mt-2">
              {t.cartTotal}: <span className="font-bold gradient-text">{formatPrice(total)}</span>
            </p>
          </div>

          <div className="grid gap-6">
            {/* Order Summary */}
            <div className="glass-card p-6 animate-fade-in-up">
              <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start" data-testid={`summary-item-${item.id}`}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.serviceName}</p>
                      <p className="text-xs text-muted-foreground">{item.packageName}</p>
                    </div>
                    <span className="font-bold text-sm gradient-text">{formatPrice(item.price)}</span>
                  </div>
                ))}
                <div className="border-t border-border/50 pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold gradient-text">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* User info (if logged in) */}
            {user && (
              <div className="glass-card p-4 flex items-center gap-3 animate-fade-in-up">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-border/50" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="glass-card p-6 animate-fade-in-up">
              <h3 className="font-semibold text-foreground mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id)}
                    data-testid={`payment-option-${opt.id}`}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-border/40 bg-muted/20 hover:border-border"
                    }`}
                  >
                    {opt.badge && (
                      <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                        {opt.badge}
                      </span>
                    )}
                    <div className="mb-2">{opt.icon}</div>
                    <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                    {paymentMethod === opt.id && (
                      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/60 mt-3">
                Payment processing is in demo mode — no charges will be made.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="glass-card p-6 space-y-4 animate-fade-in-up"
            >
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Project Notes <span className="text-xs text-muted-foreground/60">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements or details about your project..."
                  className="w-full bg-muted/50 border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-primary/50 transition-colors text-sm"
                  data-testid="input-order-notes"
                />
              </div>

              {!user && (
                <p className="text-sm text-muted-foreground text-center py-1">
                  You'll be asked for your contact details before the order is placed.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary-glow w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
                data-testid="button-place-order"
              >
                {status === "loading" ? (
                  <><Loader2 size={16} className="animate-spin" /> Placing order…</>
                ) : (
                  <>{t.checkoutSubmit} <Send size={16} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />

      {/* Guest checkout modal */}
      <Dialog open={showGuestModal} onOpenChange={(open) => { if (!open && guestStep !== "submitting") setShowGuestModal(false); }}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden" data-testid="dialog-guest-checkout">
          <div className="p-6">
            <DialogHeader className="mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <User size={18} className="text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold">Almost there!</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Tell us how to reach you — we'll send your order confirmation there.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleGuestSubmit} className="space-y-4">
              {guestError && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
                  {guestError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <User size={13} className="inline mr-1.5 text-muted-foreground" />
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                  data-testid="input-guest-name"
                  autoFocus
                />
              </div>

              {/* Identifier type toggle */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Contact via</label>
                <div className="flex rounded-lg border border-border/50 p-1 gap-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setGuestIdType("phone")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                      guestIdType === "phone" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="guest-tab-phone"
                  >
                    <Phone size={13} /> Phone
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuestIdType("email")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                      guestIdType === "email" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="guest-tab-email"
                  >
                    <Mail size={13} /> Email
                  </button>
                </div>

                {guestIdType === "phone" ? (
                  <div className="flex">
                    <CountryCodePicker value={guestDialCode} onChange={setGuestDialCode} />
                    <input
                      type="tel"
                      placeholder="1XXXXXXXXX"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="flex-1 min-w-0 bg-muted/50 border border-l-0 border-border/50 rounded-r-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                      data-testid="input-guest-phone"
                    />
                  </div>
                ) : (
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-muted/50 border border-border/50 rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                    data-testid="input-guest-email"
                  />
                )}
              </div>

              <p className="text-xs text-muted-foreground/70">
                An account will be created for you automatically. You can log in and manage your orders anytime.
              </p>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGuestModal(false)}
                  className="flex-1"
                  disabled={guestStep === "submitting"}
                  data-testid="button-guest-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 btn-primary-glow"
                  disabled={guestStep === "submitting"}
                  data-testid="button-guest-submit"
                >
                  {guestStep === "submitting" ? (
                    <><Loader2 size={16} className="animate-spin mr-2" /> Placing order…</>
                  ) : (
                    <><Send size={16} className="mr-2" /> Place Order</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPage;
