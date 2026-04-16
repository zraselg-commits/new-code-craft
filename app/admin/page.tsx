"use client";
import AdminRoute from "@/components/AdminRoute";
import AdminOverview from "@/pages/admin/AdminOverview";

export default function Page() {
  return (
    <AdminRoute>
      <AdminOverview />
    </AdminRoute>
  );
}
