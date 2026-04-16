import { Check, Clock, RefreshCw, Zap, ShoppingCart } from "lucide-react";
import type { Package, Service } from "@/hooks/useServices";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLangValue } from "@/hooks/useLangValue";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface PackageCardProps {
  pkg: Package;
  service: Service;
  index?: number;
}

const PackageCard = ({ pkg, service, index = 0 }: PackageCardProps) => {
  const { addItem, items } = useCart();
  const { formatPrice } = useCurrency();
  const lv    = useLangValue();
  const { lang } = useLanguage();
  const inCart = items.some((i) => i.id === pkg.id);

  const pkgAny = pkg as unknown as Record<string, unknown>;

  // Bilingual name
  const displayName = lv(pkg.name, pkgAny.name_bn as string);

  // Bilingual features — if features_bn exists and lang=bn, use it; else use EN
  const rawFeatures   = pkg.features ?? [];
  const rawFeaturesBn = (pkgAny.features_bn as string[]) ?? [];
  const featuresToShow = lang === "bn" && rawFeaturesBn.length > 0
    ? rawFeaturesBn
    : rawFeatures;

  const handleOrder = () => {
    if (inCart) return;
    addItem({
      id:          pkg.id,
      serviceId:   service.id,
      serviceName: lv(service.title, (service as unknown as Record<string, unknown>).title_bn as string),
      packageId:   pkg.id,
      packageName: displayName,
      price:       parseFloat(pkg.price),
      tier:        pkg.tier,
    });
    toast.success(`${displayName} package added to cart!`);
  };

  return (
    <div
      className={`glass-card p-8 relative flex flex-col transition-all duration-500 animate-fade-in-up ${
        pkg.isPopular
          ? "red-glow scale-105 glow-border"
          : "hover:border-border/80 hover:scale-[1.02]"
      }`}
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "both" }}
      data-testid={`card-package-${pkg.id}`}
    >
      {pkg.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
          <Zap size={12} />
          <span suppressHydrationWarning>{lv("Most Popular", "সবচেয়ে জনপ্রিয়")}</span>
        </div>
      )}

      <div className="mb-6">
        <h3
          className="text-xl font-bold text-foreground mb-1"
          data-testid={`text-package-name-${pkg.id}`}
          suppressHydrationWarning
        >
          {displayName}
        </h3>
        <div className="text-4xl font-bold gradient-text mt-3">
          {formatPrice(parseFloat(pkg.price))}
          <span className="text-sm text-muted-foreground font-normal" suppressHydrationWarning>
            {" "}{lv("/project", "/প্রজেক্ট")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock size={14} className="text-primary/70" />
          <span suppressHydrationWarning>
            {pkg.deliveryDays} {lv("days", "দিন")}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <RefreshCw size={14} className="text-primary/70" />
          <span suppressHydrationWarning>
            {pkg.revisions === null ? lv("Unlimited", "আনলিমিটেড") : pkg.revisions}{" "}
            {lv("revisions", "রিভিশন")}
          </span>
        </span>
      </div>

      <ul className="space-y-2.5 mb-8 flex-1">
        {featuresToShow.map((f, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
            <Check size={15} className="text-primary shrink-0 mt-0.5" />
            <span suppressHydrationWarning>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleOrder}
        disabled={inCart}
        className={`w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-lg transition-all duration-300 ${
          inCart
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : pkg.isPopular
            ? "btn-primary-glow animate-pulse-cta"
            : "btn-secondary-outline"
        }`}
        data-testid={`button-order-${pkg.id}`}
      >
        <ShoppingCart size={16} />
        <span suppressHydrationWarning>
          {inCart ? lv("Added to Cart", "কার্টে আছে") : lv("Order Now", "এখনই অর্ডার করুন")}
        </span>
      </button>
    </div>
  );
};

export default PackageCard;
