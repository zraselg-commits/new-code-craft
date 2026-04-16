"use client";

import { ShoppingCart, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";

const CartPage = () => {
  const { t } = useLanguage();
  const { items, removeItem, total } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-10 relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-2xl">
          <div className="text-center mb-12 animate-fade-in-up">
            <ShoppingCart size={32} className="text-primary mx-auto mb-4" />
            <h1 className="section-heading text-3xl">{t.cartTitle}</h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center glass-card p-12 animate-fade-in">
              <ShoppingBag size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">{t.cartEmpty}</p>
              <Link href="/services" className="btn-primary-glow inline-flex items-center gap-2 text-sm">
                {t.navServices} <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="glass-card p-5 flex items-center justify-between animate-fade-in-up"
                  data-testid={`card-cart-item-${item.id}`}
                >
                  <div>
                    <h3 className="font-semibold text-foreground" data-testid={`text-cart-service-${item.id}`}>{item.serviceName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5" data-testid={`text-cart-package-${item.id}`}>
                      {item.packageName}
                      {item.tier && ` · ${item.tier} tier`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold gradient-text" data-testid={`text-cart-price-${item.id}`}>{formatPrice(item.price)}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                      data-testid={`button-remove-${item.id}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="glass-card p-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-foreground">{t.cartTotal}</span>
                  <span className="text-2xl font-bold gradient-text" data-testid="text-cart-total">{formatPrice(total)}</span>
                </div>
                <Link
                  href="/checkout"
                  className="btn-primary-glow w-full inline-flex items-center justify-center gap-2 text-base animate-pulse-cta"
                  data-testid="link-checkout"
                >
                  {t.cartCheckout}
                  <ArrowRight size={18} />
                </Link>
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
