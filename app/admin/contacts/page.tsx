"use client";
import AdminRoute from "@/components/AdminRoute";
import AdminContacts from "@/pages/admin/AdminContacts";

export default function Page() {
  return (
    <AdminRoute>
      <AdminContacts />
    </AdminRoute>
  );
}
