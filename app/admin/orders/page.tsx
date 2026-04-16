"use client";
import AdminRoute from "@/components/AdminRoute";
import AdminOrders from "@/pages/admin/AdminOrders";

export default function Page() {
  return (
    <AdminRoute>
      <AdminOrders />
    </AdminRoute>
  );
}
