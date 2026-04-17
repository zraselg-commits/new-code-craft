"use client";

import { useState } from "react";
import {
  ShoppingCart, Trash2, ArrowRight, ShoppingBag, Sparkles,
  Shield, Clock, RefreshCcw, ChevronRight, Package,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

const TRUST_BADGES = [
  { icon: Shield, en: "Secure Checkout", bn: "নিরাপদ চেকআউট" },
  { icon: Clock,  en: "24h Support",     bn: "২৪ ঘণ্টা সাপোর্ট" },
  { icon: RefreshCcw, en: "Revisions Included", bn: "রিভিশন অন্তর্ভুক্ত" },
];

const CartPage = () => {
  const { t, lang } = useLanguage();
  const { items, removeItem, total } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [removed, setRemoved] = useState<string | null>(null);

  const handleRemove = (id: string, name: string) => {
    setRemoved(id);
    setTimeout(() => {
      removeItem(id);
      setRemoved(null);
      toast.success(lang === "bn" ? `"${name}" সরানো হয়েছে` : `"${name}" removed from cart`);
    }, 300);
  };

  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero banner */}
      <section className="pt-20 pb-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-orange-500/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/6 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex items-center gap-2 mb-5 pt-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {lang === "bn" ? "হোম" : "Home"}
            </Link>
            <ChevronRight size={14} className="text-muted-foreground/40" />
            <span className="text-sm text-foreground font-medium">{t.cartTitle}</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <ShoppingCart size={18} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t.cartTitle}</h1>
            {items.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                {items.length}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="pb-16 relative">
        <div className="container mx-auto px-4 md:px-6">
          {isEmpty ? (
            /* ── Empty state ── */
            <div className="max-w-lg mx-auto text-center py-12">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-orange-500/10 animate-pulse" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center">
                  <ShoppingBag size={40} className="text-primary/60" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">{t.cartEmpty}</h2>
              <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
                {lang === "bn"
                  ? "কার্টে কিছু নেই। আমাদের সেবাগুলো দেখুন এবং আপনার পছন্দের সেবা বেছে নিন।"
                  : "Your cart is empty. Browse our services and pick the perfect package for your project."}
              </p>
              <Link
                href="/services"
                className="btn-primary-glow inline-flex items-center gap-2 text-sm font-semibold"
              >
                <Sparkles size={15} />
                {t.navServices}
                <ArrowRight size={15} />
              </Link>
              <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
                {TRUST_BADGES.map(({ icon: Icon, en, bn }) => (
                  <div key={en} className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                    <Icon size={13} className="text-primary/50" />
                    {lang === "bn" ? bn : en}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Cart with items ── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* ── Left: Item list ── */}
              <div className="lg:col-span-2 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`glass-card p-5 flex items-center gap-4 transition-all duration-300 ${
                      removed === item.id ? "opacity-0 scale-95 translate-x-4" : "opacity-100 scale-100"
                    }`}
                    data-testid={`card-cart-item-${item.id}`}
                  >
                    {/* Service icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-orange-500/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Package size={20} className="text-primary/70" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-foreground text-sm leading-tight truncate"
                        data-testid={`text-cart-service-${item.id}`}
                      >
                        {item.serviceName}
                      </h3>
                      <p
                        className="text-xs text-muted-foreground mt-0.5"
                        data-testid={`text-cart-package-${item.id}`}
                      >
                        {item.packageName}
                        {item.tier && (
                          <span className="ml-1.5 capitalize px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground/80 text-[10px]">
                            {item.tier}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Price + remove */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="font-bold gradient-text text-base"
                        data-testid={`text-cart-price-${item.id}`}
                      >
                        {formatPrice(item.price)}
                      </span>
                      <button
                        onClick={() => handleRemove(item.id, item.serviceName)}
                        className="w-8 h-8 rounded-lg bg-destructive/8 border border-destructive/20 flex items-center justify-center text-destructive/60 hover:bg-destructive/15 hover:text-destructive hover:border-destructive/40 transition-all duration-200"
                        data-testid={`button-remove-${item.id}`}
                        aria-label={`Remove ${item.serviceName}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Continue shopping */}
                <Link
                  href="/services"
                  className="flex items-center gap-2 text-sm text-primary/70 hover:text-primary transition-colors mt-2 w-fit group"
                >
                  <ArrowRight size={13} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                  {lang === "bn" ? "আরও সেবা দেখুন" : "Continue shopping"}
                </Link>
              </div>

              {/* ── Right: Summary sticky card ── */}
              <div className="lg:sticky lg:top-24">
                <div className="glass-card p-6 relative overflow-hidden">
                  {/* Glow */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                  <h3 className="font-bold text-foreground text-base mb-4">
                    {lang === "bn" ? "অর্ডার সারসংক্ষেপ" : "Order Summary"}
                  </h3>

                  {/* Line items */}
                  <div className="space-y-2 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[60%]">{item.packageName}</span>
                        <span className="text-foreground font-medium shrink-0">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border/30 pt-4 mb-5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">{t.cartTotal}</span>
                      <span
                        className="text-2xl font-black gradient-text"
                        data-testid="text-cart-total"
                      >
                        {formatPrice(total)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      {currency === "BDT"
                        ? "মূল্য টাকায় (BDT)"
                        : "Price in USD · Tax may apply"}
                    </p>
                  </div>

                  <Link
                    href="/checkout"
                    className="btn-primary-glow w-full inline-flex items-center justify-center gap-2 text-sm font-bold animate-pulse-cta"
                    data-testid="link-checkout"
                  >
                    {t.cartCheckout}
                    <ArrowRight size={16} />
                  </Link>

                  {/* Trust badges */}
                  <div className="mt-5 space-y-2">
                    {TRUST_BADGES.map(({ icon: Icon, en, bn }) => (
                      <div key={en} className="flex items-center gap-2 text-xs text-muted-foreground/60">
                        <Icon size={12} className="text-primary/50 shrink-0" />
                        {lang === "bn" ? bn : en}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CartPage;
