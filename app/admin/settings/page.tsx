"use client";
import AdminRoute from "@/components/AdminRoute";
import AdminSettings from "@/pages/admin/AdminSettings";

export default function Page() {
  return (
    <AdminRoute>
      <AdminSettings />
    </AdminRoute>
  );
}
