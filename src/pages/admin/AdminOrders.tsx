"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  packageName: string;
  price: string;
  status: string;
  paymentStatus: string;
  notes: string;
  createdAt: string;
}

const ORDER_STATUSES = ["pending", "processing", "completed"] as const;
const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  completed: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20",
  unpaid: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  paid: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20",
  refunded: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

const PAGE_SIZE = 10;

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const r = await apiFetch("/api/admin/orders");
      if (!r.ok) throw new Error("Failed to load orders");
      return r.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: string }) => {
      const r = await apiFetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ [field]: value }),
      });
      if (!r.ok) throw new Error("Update failed");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast.success("Order updated");
    },
    onError: () => toast.error("Failed to update order"),
  });

  const filtered = orders.filter(
    (o) =>
      search === "" ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      o.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <AdminLayout title="Orders">
      <div className="space-y-4 max-w-7xl">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="search"
            placeholder="Search by name, email, service, or order ID..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 min-w-[200px] max-w-sm bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            data-testid="input-orders-search"
          />
          <span className="text-sm text-muted-foreground">{filtered.length} orders</span>
        </div>

        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Service / Package</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/20">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No orders found</td>
                  </tr>
                ) : (
                  paginated.map((order) => (
                    <tr key={order.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors" data-testid={`row-order-${order.id}`}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-muted-foreground" title={order.id} data-testid={`text-order-id-${order.id}`}>
                          {order.id.split("-")[0].toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{order.serviceName}</p>
                        <p className="text-xs text-muted-foreground">{order.packageName}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{formatPrice(parseFloat(order.price))}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateMutation.mutate({ id: order.id, field: "status", value: e.target.value })}
                          className={`text-xs font-medium border rounded-full px-2 py-1 cursor-pointer focus:outline-none bg-transparent ${statusColors[order.status] ?? ""}`}
                          data-testid={`select-order-status-${order.id}`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-background text-foreground capitalize">{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => updateMutation.mutate({ id: order.id, field: "paymentStatus", value: e.target.value })}
                          className={`text-xs font-medium border rounded-full px-2 py-1 cursor-pointer focus:outline-none bg-transparent ${statusColors[order.paymentStatus] ?? ""}`}
                          data-testid={`select-order-payment-${order.id}`}
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-background text-foreground capitalize">{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && totalPages > 1 && (
            <div className="px-4 py-3 border-t border-border/40 flex items-center justify-between bg-muted/10">
              <span className="text-xs text-muted-foreground">
                Page {safePage} of {totalPages} · {filtered.length} total
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  data-testid="button-prev-page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, safePage - 2);
                  const pageNum = start + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                        pageNum === safePage
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      data-testid={`button-page-${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  data-testid="button-next-page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
