"use client";
import AdminRoute from "@/components/AdminRoute";
import AdminUsers from "@/pages/admin/AdminUsers";

export default function Page() {
  return (
    <AdminRoute>
      <AdminUsers />
    </AdminRoute>
  );
}
