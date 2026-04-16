"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProfilePage from "@/pages/ProfilePage";

export default function Page() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
