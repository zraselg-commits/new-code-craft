"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingBag, Users, Clock, TrendingUp, BarChart3 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

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

// ── Chart colour palette ────────────────────────────────────────────────────
const CHART_COLORS = {
  pending:    "#eab308",
  processing: "#3b82f6",
  completed:  "#22c55e",
  revenue:    "#ef4444",
};

// ── Custom tooltip shared ───────────────────────────────────────────────────
const ChartTooltip = ({
  active, payload, label, prefix = "", suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
  prefix?: string;
  suffix?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-xs">
        {label && <p className="text-white/50 mb-1">{label}</p>}
        {payload.map((p) => (
          <p key={p.name} className="font-semibold text-white">
            {prefix}{p.value.toLocaleString()}{suffix}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── Derive order-status breakdown from recentOrders ─────────────────────────
function buildStatusPie(orders: RecentOrder[]) {
  const counts: Record<string, number> = {};
  orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

// ── Derive a simple revenue-by-date bar chart from recentOrders ─────────────
function buildRevenueBars(orders: RecentOrder[]) {
  const byDate: Record<string, number> = {};
  orders.forEach((o) => {
    const date = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    byDate[date] = (byDate[date] ?? 0) + parseFloat(o.price || "0");
  });
  return Object.entries(byDate)
    .map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }))
    .slice(-10); // last 10 data points
}

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

  const recentOrders = data?.recentOrders ?? [];
  const statusPie = buildStatusPie(recentOrders);
  const revenueBars = buildRevenueBars(recentOrders);
  const hasChartData = recentOrders.length > 0;

  return (
    <AdminLayout title="Overview">
      <div className="space-y-6 max-w-5xl">

        {/* ── Stat Cards ── */}
        <div className="grid sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/50 bg-card p-5 flex items-center gap-4"
              data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
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

        {/* ── Charts Row ── */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-xl border border-border/50 bg-card p-5">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <Skeleton className="h-4 w-28 mb-4" />
              <Skeleton className="h-48 w-full rounded-full mx-auto" style={{ borderRadius: "50%" }} />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">

            {/* Revenue Bar Chart */}
            <div className="md:col-span-2 rounded-xl border border-border/50 bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 size={15} className="text-red-500" />
                Revenue by Order Date
              </h2>
              {!hasChartData ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <TrendingUp size={28} className="text-muted-foreground/20" />
                  <p className="text-xs text-muted-foreground/50">No order data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={revenueBars} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      content={<ChartTooltip prefix="$" />}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill={CHART_COLORS.revenue}
                      radius={[4, 4, 0, 0]}
                      opacity={0.85}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Order Status Donut */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShoppingBag size={15} className="text-blue-500" />
                Order Status
              </h2>
              {!hasChartData ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <ShoppingBag size={28} className="text-muted-foreground/20" />
                  <p className="text-xs text-muted-foreground/50">No orders yet</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={statusPie}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={58}
                        strokeWidth={2}
                        stroke="hsl(var(--card))"
                      >
                        {statusPie.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={CHART_COLORS[entry.status as keyof typeof CHART_COLORS] ?? "#888"}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number, name: string) => [v, name]}
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-1">
                    {statusPie.map((d) => (
                      <div key={d.status} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: CHART_COLORS[d.status as keyof typeof CHART_COLORS] ?? "#888" }}
                          />
                          <span className="capitalize text-muted-foreground">{d.status}</span>
                        </div>
                        <span className="font-semibold text-foreground">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Recent Orders Table ── */}
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
                    <tr
                      key={order.id}
                      className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                      data-testid={`row-order-${order.id}`}
                    >
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
