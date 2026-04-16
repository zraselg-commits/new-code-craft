"use client";
import AdminRoute from "@/components/AdminRoute";
import AdminPortfolio from "@/pages/admin/AdminPortfolio";

export default function Page() {
  return (
    <AdminRoute>
      <AdminPortfolio />
    </AdminRoute>
  );
}
