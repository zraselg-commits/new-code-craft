"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  // Give auth an extra grace period on first paint to avoid flashing redirect
  const [grace, setGrace] = useState(true);

  useEffect(() => {
    // 400ms grace period so the /api/auth/me call can complete
    const t = setTimeout(() => setGrace(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isLoading && !grace && (!user || user.role !== "admin")) {
      router.replace("/admin/login?from=" + encodeURIComponent(window.location.pathname));
    }
  }, [isLoading, grace, user, router]);

  // Show blank while auth is resolving
  if (isLoading || grace) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <div className="min-h-screen bg-[#0a0a0f]" />;
  }

  return <>{children}</>;
};

export default AdminRoute;
