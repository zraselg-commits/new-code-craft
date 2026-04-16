"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingBag, Users, Clock } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface StatsData {
  totalOrders: number;
  totalUsers: number;
  totalRevenue: string;
  recentOrders: RecentOrder[];
}

interface RecentOrder {
  id: string;
  customerName: string;
  serviceName: string;
  packageName: string;
  price: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-500 border-yellow-500/20",
  processing: "bg-blue-500/15 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/15 text-green-500 border-green-500/20",
};

const AdminOverview = () => {
  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const r = await apiFetch("/api/admin/stats");
      if (!r.ok) throw new Error("Failed to load stats");
      return r.json();
    },
  });

  const stats = [
    {
      label: "Total Orders",
      value: isLoading ? "—" : String(data?.totalOrders ?? 0),
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Users",
      value: isLoading ? "—" : String(data?.totalUsers ?? 0),
      icon: Users,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Revenue (Completed)",
      value: isLoading ? "—" : `$${parseFloat(data?.totalRevenue ?? "0").toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <AdminLayout title="Overview">
      <div className="space-y-6 max-w-5xl">
        <div className="grid sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border/50 bg-card p-5 flex items-center gap-4" data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className={`w-11 h-11 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
            <Clock size={15} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Package</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/30">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : (data?.recentOrders ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No orders yet</td>
                  </tr>
                ) : (
                  (data?.recentOrders ?? []).map((order) => (
                    <tr key={order.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors" data-testid={`row-order-${order.id}`}>
                      <td className="px-4 py-3 font-medium text-foreground">{order.customerName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.serviceName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.packageName}</td>
                      <td className="px-4 py-3 font-medium text-foreground">${parseFloat(order.price).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColors[order.status] ?? ""}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
