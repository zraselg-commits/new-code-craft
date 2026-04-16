"use client";
import AdminRoute from "@/components/AdminRoute";
import AdminBlog from "@/pages/admin/AdminBlog";

export default function Page() {
  return (
    <AdminRoute>
      <AdminBlog />
    </AdminRoute>
  );
}
