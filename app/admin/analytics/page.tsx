"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  RefreshCw, BarChart3, TrendingUp, Globe, Smartphone,
  Monitor, Tablet, Eye, ArrowUpRight, Users,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface AnalyticsData {
  totalViews: number;
  daily: { date: string; views: number }[];
  topPages: { path: string; views: number }[];
  devices: { device: string; views: number }[];
  referrers: { referrer: string; views: number }[];
}

const DEVICE_COLORS: Record<string, string> = {
  desktop: "#ef4444",
  mobile: "#f97316",
  tablet: "#eab308",
};

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  desktop: <Monitor size={13} />,
  mobile: <Smartphone size={13} />,
  tablet: <Tablet size={13} />,
};

function StatCard({ label, value, icon, sub }: { label: string; value: string | number; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: {active?:boolean; payload?:Array<{value:number}>; label?:string}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2">
        <p className="text-xs text-white/50 mb-1">{label}</p>
        <p className="text-sm font-semibold text-white">{payload[0].value.toLocaleString()} views</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboardPage() {
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics", days],
    queryFn: async () => {
      const r = await apiFetch(`/api/admin/analytics?days=${days}`);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  const totalViews = data?.totalViews ?? 0;
  const avgPerDay = Math.round(totalViews / days);

  // Shorten long dates for chart
  const dailyData = (data?.daily ?? []).map((d) => ({
    ...d,
    date: d.date.slice(5), // "MM-DD"
  }));

  return (
    <AdminLayout title="Analytics" subtitle="Built-in page view analytics — no Google Analytics required">
      <div className="max-w-5xl">
        {/* Period selector */}
        <div className="flex items-center gap-2 mb-5">
          {[7, 14, 30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                days === d ? "bg-red-500/20 text-red-400" : "text-white/40 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              {d === 7 ? "7 days" : d === 14 ? "2 weeks" : d === 30 ? "30 days" : d === 60 ? "60 days" : "90 days"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24"><RefreshCw size={24} className="text-white/20 animate-spin" /></div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total Page Views" value={totalViews} icon={<Eye size={16} />} sub={`last ${days} days`} />
              <StatCard label="Avg. Daily Views" value={avgPerDay} icon={<TrendingUp size={16} />} sub="page views/day" />
              <StatCard label="Unique Pages" value={data?.topPages.length ?? 0} icon={<Globe size={16} />} sub="tracked routes" />
              <StatCard label="Referrer Sources" value={data?.referrers.length ?? 0} icon={<ArrowUpRight size={16} />} sub="external sources" />
            </div>

            {/* Daily chart */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-6">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-red-400" /> Daily Page Views
              </h2>
              {totalViews === 0 ? (
                <div className="text-center py-10 text-white/30">
                  <Eye size={28} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No data yet — the analytics beacon starts tracking once visitors arrive.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dailyData} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="views" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#ef4444" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Top pages */}
              <div className="md:col-span-2 bg-white/3 border border-white/8 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe size={16} className="text-red-400" /> Top Pages
                </h2>
                {(data?.topPages ?? []).length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-6">No page data yet</p>
                ) : (
                  <div className="space-y-2">
                    {(data?.topPages ?? []).map((p, i) => {
                      const pct = Math.round((p.views / ((data?.topPages[0]?.views) ?? 1)) * 100);
                      return (
                        <div key={p.path} className="flex items-center gap-3">
                          <span className="text-xs text-white/20 w-4 shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono text-white/70 truncate">{p.path || "/"}</p>
                            <div className="h-1 bg-white/5 rounded-full mt-1">
                              <div className="h-full bg-red-500/50 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <span className="text-xs text-white/50 shrink-0">{p.views.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Devices */}
              <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={16} className="text-red-400" /> Devices
                </h2>
                {(data?.devices ?? []).length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-6">No device data yet</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie data={data?.devices} dataKey="views" nameKey="device" cx="50%" cy="50%" outerRadius={50}>
                          {(data?.devices ?? []).map((entry) => (
                            <Cell key={entry.device} fill={DEVICE_COLORS[entry.device] ?? "#888"} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [v.toLocaleString(), "views"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-2">
                      {(data?.devices ?? []).map((d) => (
                        <div key={d.device} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-white/60">
                            <span style={{ color: DEVICE_COLORS[d.device] }}>{DEVICE_ICONS[d.device]}</span>
                            {d.device}
                          </div>
                          <span className="text-xs text-white/40">{d.views.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Referrers */}
            {(data?.referrers ?? []).length > 0 && (
              <div className="mt-4 bg-white/3 border border-white/8 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <ArrowUpRight size={16} className="text-red-400" /> Top Referrer Sources
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(data?.referrers ?? []).map((r) => (
                    <div key={r.referrer} className="flex items-center justify-between px-3 py-2 bg-white/3 rounded-lg">
                      <span className="text-xs text-white/60 truncate">{r.referrer}</span>
                      <span className="text-xs text-white/40 ml-2 shrink-0">{r.views}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
