"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Layers, ShoppingBag, Users, BookOpen,
  LogOut, Menu, ChevronRight, Globe, Briefcase, MessageSquare,
  Settings, UserCheck, BarChart3, X, Bell, Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navGroups = [
  {
    label: "Main",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/services", label: "Services", icon: Layers, exact: false },
      { to: "/admin/blog", label: "Blog Posts", icon: BookOpen, exact: false },
      { to: "/admin/portfolio", label: "Portfolio", icon: Briefcase, exact: false },
      { to: "/admin/team", label: "Team", icon: UserCheck, exact: false },
    ],
  },
  {
    label: "Business",
    items: [
      { to: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
      { to: "/admin/contacts", label: "Contacts", icon: MessageSquare, exact: false },
      { to: "/admin/users", label: "Users", icon: Users, exact: false },
    ],
  },
  {
    label: "Configuration",
    items: [
      { to: "/admin/settings", label: "Site Settings", icon: Settings, exact: false },
    ],
  },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const AdminLayout = ({ children, title, subtitle, actions }: AdminLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isActive = (item: { to: string; exact: boolean }) => {
    if (item.exact) return pathname === item.to;
    return pathname.startsWith(item.to);
  };

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full bg-[#0f0f14]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavigate} target="_blank">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">CC</div>
          <div>
            <p className="font-bold text-white text-sm leading-none">Code Craft BD</p>
            <p className="text-[10px] text-red-400 font-medium mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-1">
              {group.label}
            </p>
            {group.items.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5",
                  isActive(item)
                    ? "bg-red-500/15 text-red-400 shadow-sm"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                )}
                data-testid={`nav-admin-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <item.icon size={16} className={isActive(item) ? "text-red-400" : ""} />
                {item.label}
                {isActive(item) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:bg-white/5 hover:text-white/70 transition-colors"
          >
            <Globe size={13} />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            data-testid="button-admin-logout"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-white/5 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-white/5 flex items-center px-4 md:px-6 gap-4 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-20">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-1.5 rounded text-white/40 hover:text-white"
                data-testid="button-admin-menu"
              >
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-56 border-white/5 bg-transparent">
              <SidebarContent onNavigate={() => setSheetOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white">{title}</h1>
            {subtitle && <p className="text-xs text-white/40 hidden md:block">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <Link
              href="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/20 transition-colors"
            >
              <Globe size={12} />
              View Site
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
