"use client";

import { useState, useCallback, useEffect, type ButtonHTMLAttributes } from "react";
import {
  Menu, Home, Layers, DollarSign, Briefcase, Users, HelpCircle, Mail,
  ShoppingCart, LogIn, User, LogOut, ChevronDown, LayoutDashboard,
  Info, Shield, FileText, Sparkles, BookOpen, Globe, Sun, Moon,
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const LANG_CYCLE  = { en: "bn", bn: "en" } as const;
const LANG_LABEL  = { en: "বাং", bn: "EN" } as const;

const PREFETCH_MAP: Record<string, string[][]> = {
  "/services": [["/api/services"]],
  "/pricing":  [["/api/services", "with-packages"]],
  "/blog":     [["/api/blog"]],
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { t, lang, setLang } = useLanguage();
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { currency, toggle: toggleCurrency } = useCurrency();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Fetch branding from public settings
  const { data: branding } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings-public"],
    queryFn: async () => {
      const r = await fetch("/api/settings-public", { cache: "no-store" });
      if (!r.ok) return {};
      return r.json();
    },
    staleTime: 0,
  });
  const logoUrl  = branding?.logoUrl  || "";
  const siteName = branding?.siteName || "Code Craft BD";
  const siteName_bn = branding?.siteName_bn || "কোড ক্রাফট বিডি";

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLinkHover = useCallback((href: string) => {
    const keys = PREFETCH_MAP[href];
    if (!keys) return;
    keys.forEach((queryKey) => {
      if (!queryClient.getQueryData(queryKey)) {
        queryClient.prefetchQuery({ queryKey, staleTime: 5 * 60_000 });
      }
    });
  }, [queryClient]);

  const navLinks = [
    { label: t.navHome,      href: "/",          icon: Home },
    { label: t.navPortfolio, href: "/portfolio",  icon: Briefcase },
    { label: t.navServices,  href: "/services",  icon: Layers },
    { label: t.navPricing,   href: "/pricing",   icon: DollarSign },
    { label: t.navTeam,      href: "/team",      icon: Users },
    { label: t.navWhyUs,     href: "/why-us",    icon: HelpCircle },
    { label: t.navContact,   href: "/contact",   icon: Mail },
  ];

  const infoLinks = [
    { label: "Blog", href: "/blog", icon: BookOpen },
    { label: t.navAbout ?? "About", href: "/about", icon: Info },
    { label: t.navFaq ?? "FAQ", href: "/faq", icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setIsOpen(false);
    router.push("/");
  };

  const CurrencyPill = ({ className = "" }: { className?: string }) => (
    <button
      onClick={mounted ? toggleCurrency : undefined}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 ${
        mounted && currency === "USD"
          ? "bg-secondary/10 border-secondary/40 text-secondary"
          : "bg-primary/10 border-primary/40 text-primary"
      } hover:opacity-80 ${className}`}
      data-testid="button-currency-toggle"
      aria-label={`Switch currency to ${currency === "BDT" ? "USD" : "BDT"}`}
      title={`Switch to ${currency === "BDT" ? "USD" : "BDT"}`}
      suppressHydrationWarning
    >
      {mounted ? (currency === "BDT" ? "৳ BDT" : "$ USD") : "৳ BDT"}
    </button>
  );

  const ThemeBtn = ({ className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      onClick={mounted ? toggleTheme : undefined}
      className={`w-9 h-9 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200 ${className}`}
      aria-label="Toggle theme"
      data-testid="button-theme-toggle"
      suppressHydrationWarning
      {...rest}
    >
      {mounted ? (isDark ? <Sun size={16} /> : <Moon size={16} />) : <Sun size={16} />}
    </button>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 rounded-none border-x-0 animate-navbar-in">
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">

        {/* ─── Left: Hamburger + Logo ─────────────────────────────────────── */}
        <div className="flex items-center gap-2.5">
          <button
            className="lg:hidden text-foreground w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors shrink-0"
            onClick={() => setIsOpen(true)}
            data-testid="button-mobile-menu"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
          {/* Logo: shows uploaded image if set, otherwise brand icon + name */}
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Home">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={siteName}
                className="h-8 w-auto object-contain max-w-[140px]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white text-xs font-black shrink-0">CC</span>
                <span className="text-base font-bold gradient-text" suppressHydrationWarning>
                  {lang === "bn" ? siteName_bn : siteName}
                </span>
              </span>
            )}
          </Link>
        </div>

        {/* ─── Center: Desktop nav links ──────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                onMouseEnter={() => handleLinkHover(link.href)}
                suppressHydrationWarning
                className={`flex items-center gap-1.5 text-sm transition-colors duration-300 ${
                  pathname === link.href
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={13} className="shrink-0" />
                <span suppressHydrationWarning>{link.label}</span>
              </Link>
            );
          })}

          <div className="relative">
            <button
              onClick={() => setMoreMenuOpen((v) => !v)}
              className={`flex items-center gap-1 text-sm transition-colors duration-300 ${
                ["/about", "/faq", "/privacy", "/terms"].includes(pathname)
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="button-more-menu"
            >
              <Info size={13} className="shrink-0" />
              <span suppressHydrationWarning>{t.navMore ?? "More"}</span>
              <ChevronDown size={12} className={`transition-transform ${moreMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {moreMenuOpen && (
              <div className="absolute left-0 mt-2 w-44 glass-card border border-border/50 rounded-xl overflow-hidden shadow-xl z-50 animate-dropdown-in">
                {[
                  { label: t.navAbout ?? "About", href: "/about", icon: Info },
                  { label: t.navFaq ?? "FAQ", href: "/faq", icon: HelpCircle },
                  { label: t.navPrivacy ?? "Privacy", href: "/privacy", icon: Shield },
                  { label: t.navTerms ?? "Terms", href: "/terms", icon: FileText },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${
                        pathname === link.href ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <Icon size={14} className="text-muted-foreground" />
                      <span suppressHydrationWarning>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {moreMenuOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setMoreMenuOpen(false)} />
            )}
          </div>
        </div>

        {/* ─── Right: Desktop controls ─────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Language toggle pill — prominent in top bar */}
          <button
            onClick={() => setLang(LANG_CYCLE[lang as "en" | "bn"] as "en" | "bn")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 ${
              lang === "bn"
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-secondary/10 border-secondary/40 text-secondary"
            } hover:opacity-80`}
            aria-label="Switch language"
            suppressHydrationWarning
          >
            <Globe size={13} />
            <span suppressHydrationWarning>{lang === "bn" ? "বাং → EN" : "EN → বাং"}</span>
          </button>
          <CurrencyPill />
          <Link
            href="/cart"
            aria-label="View cart"
            className="relative w-9 h-9 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-300 hover:border-primary/40"
            data-testid="link-cart"
          >
            <ShoppingCart size={16} />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/40 transition-all text-sm text-foreground"
                data-testid="button-user-menu"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-primary/30" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <User size={12} className="text-primary" />
                  </div>
                )}
                <span className="max-w-[100px] truncate font-medium" data-testid="text-nav-username">{user.name}</span>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 glass-card border border-border/50 rounded-xl overflow-hidden shadow-xl z-50 animate-dropdown-in">
                  <div className="px-4 py-3 border-b border-border/50">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    data-testid="link-profile"
                  >
                    <User size={14} className="text-muted-foreground" />
                    {t.navProfile ?? "Profile"}
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
                      data-testid="link-admin"
                    >
                      <LayoutDashboard size={14} className="text-muted-foreground" />
                      {t.navAdminPanel ?? "Admin Panel"}
                    </Link>
                  )}
                  <div className="border-t border-border/50" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    data-testid="button-logout"
                  >
                    <LogOut size={14} />
                    {t.navSignOut ?? "Sign Out"}
                  </button>
                </div>
              )}

              {userMenuOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              )}
            </div>
          ) : (
            <Link href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
            >
              <LogIn size={13} />
              <span suppressHydrationWarning>{t.navSignIn ?? "Sign In"}</span>
            </Link>
          )}
        </div>

        {/* ─── Right: Mobile controls ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/cart"
            aria-label="View cart"
            className="relative w-9 h-9 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground"
          >
            <ShoppingCart size={16} />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Language toggle pill — mobile top bar (theme moved to sidebar) */}
          <button
            onClick={() => setLang(LANG_CYCLE[lang as "en" | "bn"] as "en" | "bn")}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[11px] font-bold transition-all ${
              lang === "bn"
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-secondary/10 border-secondary/40 text-secondary"
            }`}
            suppressHydrationWarning
            aria-label="Switch language"
          >
            <Globe size={11} />
            <span suppressHydrationWarning>{lang === "bn" ? "EN" : "বাং"}</span>
          </button>

          {/* Mobile sidebar sheet (no trigger, controlled by hamburger at top-left) */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent
              side="left"
              className="w-[80vw] max-w-[300px] p-0 flex flex-col bg-background border-r border-border/40"
            >
              {/* Sidebar header */}
              <div className="flex items-center gap-2 px-4 h-14 border-b border-border/20 shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={siteName}
                    className="h-7 w-auto object-contain max-w-[120px]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <>
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white text-xs font-black shrink-0">CC</span>
                    <span className="font-bold gradient-text text-sm" suppressHydrationWarning>
                      {lang === "bn" ? siteName_bn : siteName}
                    </span>
                  </>
                )}
              </div>

              {/* Auth CTA — replaces the 4-icon grid */}
              {user ? (
                <div className="px-4 py-4 border-b border-border/20 bg-muted/20 shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-xl object-cover border border-border/50" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <User size={18} className="text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary-glow w-full flex items-center justify-center gap-2 !py-2 text-xs"
                    data-testid="link-mobile-profile"
                  >
                    <User size={13} />
                    View Profile
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="mt-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-muted/50 border border-border/50 text-foreground text-xs font-semibold hover:bg-muted transition-colors w-full"
                      data-testid="link-mobile-admin"
                    >
                      <LayoutDashboard size={13} />
                      Admin Panel
                    </Link>
                  )}
                </div>
              ) : (
                <div className="px-4 py-4 border-b border-border/20 shrink-0">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary-glow w-full flex items-center justify-center gap-2 !py-2.5"
                    data-testid="link-sidebar-login"
                  >
                    <LogIn size={15} />
                    Get Started
                  </Link>
                  <p className="text-[11px] text-center text-muted-foreground mt-2">
                    Sign in to manage orders & profile
                  </p>
                </div>
              )}

              {/* Scrollable nav */}
              <div className="flex-1 overflow-y-auto py-3">

                {/* Main links */}
                <div className="px-3 mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-2 mb-1.5" suppressHydrationWarning>
                    {t.navSectionMain ?? "Main"}
                  </p>
                  <div className="space-y-0.5">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const active = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                            active
                              ? "text-primary bg-primary/10 border border-primary/20"
                              : "text-foreground hover:text-primary hover:bg-muted/60"
                          }`}
                        >
                          <span className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${
                            active ? "bg-primary/20" : "bg-muted/60"
                          }`}>
                            <Icon size={15} />
                          </span>
                          <span suppressHydrationWarning>{link.label}</span>
                          {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Info / More links */}
                <div className="px-3 mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-2 mb-1.5" suppressHydrationWarning>
                    {t.navSectionInfo ?? "More"}
                  </p>
                  <div className="space-y-0.5">
                    {[
                      ...infoLinks,
                      { label: t.navPrivacy ?? "Privacy", href: "/privacy", icon: Shield },
                      { label: t.navTerms ?? "Terms",   href: "/terms",   icon: FileText },
                    ].map((link) => {
                      const Icon = link.icon;
                      const active = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 py-2 px-3 rounded-xl text-sm transition-all ${
                            active
                              ? "text-primary bg-primary/10 border border-primary/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          }`}
                        >
                          <span className={`flex items-center justify-center w-6 h-6 rounded-lg shrink-0 ${
                            active ? "bg-primary/20" : "bg-muted/40"
                          }`}>
                            <Icon size={13} />
                          </span>
                          <span suppressHydrationWarning>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Language & Currency rows */}
                <div className="px-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-2 mb-1.5" suppressHydrationWarning>
                    {lang === "bn" ? "পছন্দ" : "Preferences"}
                  </p>
                  <button
                    onClick={() => setLang(LANG_CYCLE[lang as "en" | "bn"] as "en" | "bn")}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-all text-sm"
                    aria-label="Switch language"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Globe size={14} />
                      <span suppressHydrationWarning>{lang === "bn" ? "ভাষা" : "Language"}</span>
                    </span>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full" suppressHydrationWarning>
                      {LANG_LABEL[lang as "en" | "bn"] ?? "EN"}
                    </span>
                  </button>
                  <button
                    onClick={toggleCurrency}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-all text-sm"
                    data-testid="button-sidebar-currency"
                    aria-label={`Switch to ${currency === "BDT" ? "USD" : "BDT"}`}
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign size={14} />
                      <span suppressHydrationWarning>{lang === "bn" ? "মুদ্রা" : "Currency"}</span>
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      currency === "USD"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-primary/10 text-primary"
                    }`}>{currency === "BDT" ? "৳ BDT" : "$ USD"}</span>
                  </button>
                  {/* Theme toggle — now in sidebar only */}
                  <button
                    onClick={mounted ? toggleTheme : undefined}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-all text-sm"
                    suppressHydrationWarning
                    data-testid="button-sidebar-theme"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      {mounted ? (isDark ? <Sun size={14} /> : <Moon size={14} />) : <Sun size={14} />}
                      <span suppressHydrationWarning>{lang === "bn" ? "থিম" : "Theme"}</span>
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground" suppressHydrationWarning>
                      {mounted ? (isDark ? (lang === "bn" ? "ডার্ক" : "Dark") : (lang === "bn" ? "লাইট" : "Light")) : "Dark"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Footer — Social links + logout */}
              <div className="px-4 pt-3 pb-5 border-t border-border/20 shrink-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-3 text-center">
                  Connect with us
                </p>
                <div className="flex items-center justify-between gap-2">
                  {([
                    {
                      href: "https://facebook.com/codecraftbd",
                      label: "Facebook",
                      color: "hover:bg-[#1877F2]/15 hover:text-[#1877F2] hover:border-[#1877F2]/40",
                      svg: (
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                      ),
                    },
                    {
                      href: "https://wa.me/8801711234567",
                      label: "WhatsApp",
                      color: "hover:bg-[#25D366]/15 hover:text-[#25D366] hover:border-[#25D366]/40",
                      svg: (
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      ),
                    },
                    {
                      href: "https://t.me/codecraftbd",
                      label: "Telegram",
                      color: "hover:bg-[#0088CC]/15 hover:text-[#0088CC] hover:border-[#0088CC]/40",
                      svg: (
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                      ),
                    },
                    {
                      href: "https://linkedin.com/company/codecraftbd",
                      label: "LinkedIn",
                      color: "hover:bg-[#0A66C2]/15 hover:text-[#0A66C2] hover:border-[#0A66C2]/40",
                      svg: (
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      ),
                    },
                    {
                      href: "https://github.com/codecraftbd",
                      label: "GitHub",
                      color: "hover:bg-foreground/10 hover:text-foreground hover:border-foreground/30",
                      svg: (
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                      ),
                    },
                  ] as Array<{ href: string; label: string; color: string; svg: JSX.Element }>).map(({ href, label, color, svg }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      data-testid={`link-social-${label.toLowerCase()}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex-1 flex items-center justify-center h-10 rounded-xl border border-border/30 text-muted-foreground transition-all duration-200 ${color}`}
                    >
                      {svg}
                    </a>
                  ))}
                </div>

                {/* Sign out button — only when logged in */}
                {user && (
                  <button
                    onClick={handleLogout}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-destructive/20 text-destructive/70 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/40 transition-all text-xs font-medium"
                    data-testid="button-mobile-logout"
                  >
                    <LogOut size={13} />
                    Sign Out
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
