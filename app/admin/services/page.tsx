"use client";
import AdminRoute from "@/components/AdminRoute";
import AdminServices from "@/pages/admin/AdminServices";

export default function Page() {
  return (
    <AdminRoute>
      <AdminServices />
    </AdminRoute>
  );
}
