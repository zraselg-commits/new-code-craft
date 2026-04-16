"use client";
import AdminRoute from "@/components/AdminRoute";
import AdminTeam from "@/pages/admin/AdminTeam";

export default function Page() {
  return (
    <AdminRoute>
      <AdminTeam />
    </AdminRoute>
  );
}
