"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageHeroBannerClient from "./ManageHeroBannerClient";

export default function HeroBannerPage() {
  return (
    <PermissionGuard permissionKey="hero-banner">
      <ManageHeroBannerClient />
    </PermissionGuard>
  );
}
