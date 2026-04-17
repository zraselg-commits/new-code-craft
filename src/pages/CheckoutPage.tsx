"use client";

import { useState, FormEvent } from "react";
import {
  CheckCircle, ArrowLeft, ShoppingBag, Loader2,
  CreditCard, Smartphone, User, Mail, Phone,
  ChevronRight, Shield, Clock, Star, Sparkles,
  Send, Package, ArrowRight,
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

async function handleStripePayment(_orderId: string): Promise<void> {
  console.log("Stripe payment stub for order:", _orderId);
}
async function handleBkashPayment(_orderId: string): Promise<void> {
  console.log("bKash payment stub for order:", _orderId);
}

type PaymentMethod = "stripe" | "bkash";
interface OrderRef { id: string; reference: string; }

const STEPS_EN = ["Review", "Payment", "Confirm"];
const STEPS_BN = ["পর্যালোচনা", "পেমেন্ট", "নিশ্চিত"];

const CheckoutPage = () => {
  const { t, lang } = useLanguage();
  const { items, total, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const { user, loginWithToken } = useAuth();

  const [step, setStep] = useState(0);
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

  const STEPS = lang === "bn" ? STEPS_BN : STEPS_EN;

  const buildOrders = async () => {
    const created: OrderRef[] = [];
    for (const item of items) {
      const res = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({ serviceId: item.serviceId, packageId: item.packageId, notes: notes.trim() || undefined, paymentMethod }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(String((body as Record<string, unknown>).error ?? "Failed"));
      }
      const data = await res.json();
      created.push({ id: data.id, reference: data.id.split("-")[0].toUpperCase() });
    }
    return created;
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) { toast.error(lang === "bn" ? "কার্ট খালি" : "Your cart is empty."); return; }
    if (!user) { setShowGuestModal(true); return; }
    setStatus("loading");
    try {
      const created = await buildOrders();
      setOrderRefs(created);
      clearCart();
      setStatus("success");
      if (paymentMethod === "stripe") await handleStripePayment(created[0]?.id ?? "");
      if (paymentMethod === "bkash") await handleBkashPayment(created[0]?.id ?? "");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("idle");
    }
  };

  const handleGuestSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGuestError("");
    if (!guestName.trim()) { setGuestError(lang === "bn" ? "আপনার নাম লিখুন" : "Please enter your name."); return; }
    const identifier = guestIdType === "phone"
      ? `${guestDialCode.replace("-CA", "")}${guestPhone.trim()}`
      : guestEmail.trim();
    if (!identifier) { setGuestError(lang === "bn" ? "যোগাযোগের তথ্য দিন" : `Please enter your ${guestIdType}`); return; }
    setGuestStep("submitting");
    try {
      const created: OrderRef[] = [];
      for (const item of items) {
        const res = await fetch("/api/orders/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, identifierType: guestIdType, guestName: guestName.trim(), serviceId: item.serviceId, packageId: item.packageId, notes: notes.trim() || undefined, paymentMethod }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(String((body as Record<string, unknown>).error ?? "Failed"));
        }
        const data = await res.json();
        if (data.token && data.user) {
          loginWithToken(data.token, data.user);
          if (data.isNewAccount) toast.info(lang === "bn" ? "অ্যাকাউন্ট তৈরি হয়েছে!" : "Account created!", { duration: 5000 });
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

  // ── Empty cart ──
  if (items.length === 0 && status !== "success") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-28 pb-16 flex items-center justify-center">
          <div className="text-center glass-card p-12 max-w-md mx-6 animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-orange-500/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={28} className="text-primary/70" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {lang === "bn" ? "কার্ট খালি" : "Your cart is empty"}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {lang === "bn" ? "চেকআউটের আগে একটি সেবা প্যাকেজ যোগ করুন।" : "Add a service package before checking out."}
            </p>
            <Link href="/services" className="btn-primary-glow inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              {lang === "bn" ? "সেবা দেখুন" : "Browse Services"}
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // ── Success state ──
  if (status === "success") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-28 pb-16 flex items-center justify-center">
          <div className="glass-card p-10 text-center max-w-md mx-6 glow-border animate-fade-in-up relative overflow-hidden">
            {/* Confetti dots */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-ping"
                  style={{
                    left: `${10 + (i * 8)}%`,
                    top: `${5 + (i % 4) * 20}%`,
                    backgroundColor: i % 3 === 0 ? "#ef4444" : i % 3 === 1 ? "#f97316" : "#eab308",
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: "1.5s",
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={30} className="text-green-400" />
            </div>
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-order-success">
              {t.checkoutSuccess}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">{t.checkoutSuccessDesc}</p>
            {orderRefs.length > 0 && (
              <div className="bg-muted/30 border border-border/30 rounded-xl p-4 mb-6 space-y-1">
                {orderRefs.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{lang === "bn" ? "অর্ডার রেফ" : "Order ref"}:</span>
                    <span className="font-mono font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded" data-testid={`text-order-reference-${ref.id}`}>
                      #{ref.reference}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Link href="/profile" className="btn-primary-glow inline-flex items-center justify-center gap-2" data-testid="link-view-orders">
                {lang === "bn" ? "আমার অর্ডার দেখুন" : "View My Orders"}
              </Link>
              <Link href="/" className="btn-secondary-outline inline-flex items-center justify-center gap-2">
                <ArrowLeft size={14} />
                {t.checkoutBack}
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // ── Main checkout ──
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-orange-500/4" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 pt-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              {lang === "bn" ? "হোম" : "Home"}
            </Link>
            <ChevronRight size={13} className="text-muted-foreground/40" />
            <Link href="/cart" className="text-muted-foreground hover:text-foreground transition-colors">{t.cartTitle}</Link>
            <ChevronRight size={13} className="text-muted-foreground/40" />
            <span className="text-foreground font-medium">{t.checkoutTitle}</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  i < step ? "bg-green-500/15 text-green-400 border border-green-500/20"
                    : i === step ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-muted/40 text-muted-foreground/40 border border-border/20"
                }`}>
                  {i < step ? <CheckCircle size={12} /> : <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-black">{i + 1}</span>}
                  {label}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 transition-colors duration-300 ${i < step ? "bg-green-500/40" : "bg-border/30"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* ── Left: steps ── */}
            <div className="lg:col-span-3 space-y-4">

              {/* Step 0: Review */}
              {step === 0 && (
                <div className="animate-fade-in-up">
                  <div className="glass-card p-6">
                    <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Package size={16} className="text-primary" />
                      {lang === "bn" ? "অর্ডার পর্যালোচনা" : "Order Review"}
                    </h2>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30" data-testid={`summary-item-${item.id}`}>
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Package size={15} className="text-primary/70" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.serviceName}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.packageName}</p>
                          </div>
                          <span className="font-bold gradient-text text-sm shrink-0">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2 mt-5">
                        {lang === "bn" ? "প্রজেক্টের নোট" : "Project Notes"}
                        <span className="text-xs text-muted-foreground/50 ml-1.5">({lang === "bn" ? "ঐচ্ছিক" : "optional"})</span>
                      </label>
                      <textarea
                        rows={3}
                        maxLength={1000}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={lang === "bn" ? "আপনার প্রজেক্টের বিস্তারিত..." : "Any specific requirements..."}
                        className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-primary/50 transition-colors text-sm"
                        data-testid="input-order-notes"
                      />
                    </div>
                  </div>
                  <button onClick={() => setStep(1)} className="btn-primary-glow w-full flex items-center justify-center gap-2 mt-4">
                    {lang === "bn" ? "পরবর্তী: পেমেন্ট পদ্ধতি" : "Next: Payment Method"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
                <div className="animate-fade-in-up">
                  <div className="glass-card p-6">
                    <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <CreditCard size={16} className="text-primary" />
                      {lang === "bn" ? "পেমেন্ট পদ্ধতি বেছে নিন" : "Choose Payment Method"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* bKash */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bkash")}
                        data-testid="payment-option-bkash"
                        className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                          paymentMethod === "bkash"
                            ? "border-pink-500/60 bg-gradient-to-br from-pink-500/8 to-pink-600/5"
                            : "border-border/40 bg-muted/10 hover:border-pink-500/30"
                        }`}
                      >
                        {paymentMethod === "bkash" && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center">
                            <CheckCircle size={10} className="text-white" />
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 text-[10px] px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-400 font-bold border border-pink-500/20">
                          {lang === "bn" ? "স্থানীয়" : "Local"}
                        </span>
                        <Smartphone size={24} className="text-pink-500 mb-3 mt-4" />
                        <p className="text-sm font-bold text-foreground">bKash</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {lang === "bn" ? "বাংলাদেশ মোবাইল ব্যাংকিং" : "Bangladesh mobile banking"}
                        </p>
                      </button>

                      {/* Card */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("stripe")}
                        data-testid="payment-option-stripe"
                        className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                          paymentMethod === "stripe"
                            ? "border-blue-500/60 bg-gradient-to-br from-blue-500/8 to-blue-600/5"
                            : "border-border/40 bg-muted/10 hover:border-blue-500/30"
                        }`}
                      >
                        {paymentMethod === "stripe" && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                            <CheckCircle size={10} className="text-white" />
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold border border-blue-500/20">
                          {lang === "bn" ? "আন্তর্জাতিক" : "International"}
                        </span>
                        <CreditCard size={24} className="text-blue-500 mb-3 mt-4" />
                        <p className="text-sm font-bold text-foreground">
                          {lang === "bn" ? "ক্রেডিট / ডেবিট কার্ড" : "Credit / Debit Card"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Visa, Mastercard, Amex</p>
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground/50 mt-3 flex items-center gap-1.5">
                      <Shield size={11} className="text-primary/40" />
                      {lang === "bn" ? "ডেমো মোড — কোনো চার্জ হবে না" : "Demo mode — no charges will be made"}
                    </p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setStep(0)} className="btn-secondary-outline flex items-center gap-2 flex-1">
                      <ArrowLeft size={15} />
                      {lang === "bn" ? "পেছনে" : "Back"}
                    </button>
                    <button onClick={() => setStep(2)} className="btn-primary-glow flex items-center justify-center gap-2 flex-[2]">
                      {lang === "bn" ? "নিশ্চিত করুন" : "Confirm Order"}
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Confirm */}
              {step === 2 && (
                <div className="animate-fade-in-up">
                  <div className="glass-card p-6">
                    <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Sparkles size={16} className="text-primary" />
                      {lang === "bn" ? "অর্ডার নিশ্চিত করুন" : "Confirm Your Order"}
                    </h2>
                    {/* Final summary */}
                    <div className="space-y-2 mb-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm py-1">
                          <span className="text-muted-foreground">{item.packageName}</span>
                          <span className="font-semibold text-foreground">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border/30 pt-3 flex justify-between items-center mb-4">
                      <span className="font-bold text-foreground">{t.cartTotal}</span>
                      <span className="text-xl font-black gradient-text">{formatPrice(total)}</span>
                    </div>
                    <div className="bg-muted/20 border border-border/30 rounded-xl p-3 text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <CreditCard size={13} className={paymentMethod === "bkash" ? "text-pink-400" : "text-blue-400"} />
                        {paymentMethod === "bkash" ? "bKash" : (lang === "bn" ? "কার্ড পেমেন্ট" : "Card Payment")}
                      </div>
                      {notes && <div className="text-xs text-muted-foreground/60 truncate">📝 {notes}</div>}
                    </div>
                    {!user && (
                      <p className="text-xs text-muted-foreground/60 mt-3 text-center">
                        {lang === "bn" ? "অর্ডার দেওয়ার আগে যোগাযোগের তথ্য চাওয়া হবে।" : "You'll be asked for contact info before placing the order."}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setStep(1)} className="btn-secondary-outline flex items-center gap-2 flex-1">
                      <ArrowLeft size={15} />
                      {lang === "bn" ? "পেছনে" : "Back"}
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={status === "loading"}
                      className="btn-primary-glow flex items-center justify-center gap-2 flex-[2] disabled:opacity-50"
                      data-testid="button-place-order"
                    >
                      {status === "loading" ? (
                        <><Loader2 size={15} className="animate-spin" />{lang === "bn" ? "অর্ডার দেওয়া হচ্ছে..." : "Placing order…"}</>
                      ) : (
                        <><Send size={15} />{t.checkoutSubmit}</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: sticky summary ── */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24 glass-card p-5 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/8 rounded-full blur-2xl pointer-events-none" />
                <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
                  <ShoppingBag size={14} className="text-primary" />
                  {lang === "bn" ? "সারসংক্ষেপ" : "Summary"}
                </h3>
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <Package size={11} className="text-primary/60" />
                      </div>
                      <span className="flex-1 text-muted-foreground truncate">{item.packageName}</span>
                      <span className="font-semibold text-foreground shrink-0">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/20 pt-3 flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-foreground">{t.cartTotal}</span>
                  <span className="text-lg font-black gradient-text" data-testid="text-cart-total">{formatPrice(total)}</span>
                </div>
                {/* Trust */}
                <div className="space-y-2 pt-3 border-t border-border/20">
                  {[
                    { icon: Shield, en: "SSL Secure Payment",     bn: "নিরাপদ পেমেন্ট" },
                    { icon: Clock,  en: "24h Response Guarantee", bn: "২৪ ঘণ্টা সাড়া দেওয়ার গ্যারেন্টি" },
                    { icon: Star,   en: "98% Client Satisfaction",bn: "৯৮% ক্লায়েন্ট সন্তুষ্টি" },
                  ].map(({ icon: Icon, en, bn }) => (
                    <div key={en} className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                      <Icon size={11} className="text-primary/40 shrink-0" />
                      {lang === "bn" ? bn : en}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
              <DialogTitle className="text-xl font-bold">
                {lang === "bn" ? "প্রায় হয়ে গেছে!" : "Almost there!"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {lang === "bn" ? "কীভাবে আপনার সাথে যোগাযোগ করব তা জানান।" : "Tell us how to reach you — we'll send your order confirmation there."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleGuestSubmit} className="space-y-4">
              {guestError && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-xl">
                  {guestError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <User size={13} className="inline mr-1.5 text-muted-foreground" />
                  {lang === "bn" ? "পূর্ণ নাম" : "Full Name"}
                </label>
                <input
                  type="text"
                  placeholder={lang === "bn" ? "আপনার নাম" : "Your full name"}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                  data-testid="input-guest-name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {lang === "bn" ? "যোগাযোগ" : "Contact via"}
                </label>
                <div className="flex rounded-xl border border-border/50 p-1 gap-1 mb-3">
                  <button type="button" onClick={() => setGuestIdType("phone")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium transition-all ${guestIdType === "phone" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    data-testid="guest-tab-phone"
                  >
                    <Phone size={13} /> {lang === "bn" ? "ফোন" : "Phone"}
                  </button>
                  <button type="button" onClick={() => setGuestIdType("email")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium transition-all ${guestIdType === "email" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    data-testid="guest-tab-email"
                  >
                    <Mail size={13} /> {lang === "bn" ? "ইমেইল" : "Email"}
                  </button>
                </div>
                {guestIdType === "phone" ? (
                  <div className="flex">
                    <CountryCodePicker value={guestDialCode} onChange={setGuestDialCode} />
                    <input type="tel" placeholder="1XXXXXXXXX" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)}
                      className="flex-1 min-w-0 bg-muted/50 border border-l-0 border-border/50 rounded-r-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                      data-testid="input-guest-phone"
                    />
                  </div>
                ) : (
                  <input type="email" placeholder="you@email.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                    data-testid="input-guest-email"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground/60">
                {lang === "bn" ? "আপনার জন্য স্বয়ংক্রিয়ভাবে একটি অ্যাকাউন্ট তৈরি হবে।" : "An account will be created for you automatically."}
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowGuestModal(false)} className="flex-1" disabled={guestStep === "submitting"} data-testid="button-guest-cancel">
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </Button>
                <Button type="submit" className="flex-1 btn-primary-glow" disabled={guestStep === "submitting"} data-testid="button-guest-submit">
                  {guestStep === "submitting" ? (
                    <><Loader2 size={15} className="animate-spin mr-2" />{lang === "bn" ? "অর্ডার দেওয়া হচ্ছে..." : "Placing…"}</>
                  ) : (
                    <><Send size={14} className="mr-2" />{lang === "bn" ? "অর্ডার দিন" : "Place Order"}</>
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
