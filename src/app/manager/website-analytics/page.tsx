"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageWebsiteAnalyticsClient from "./ManageWebsiteAnalyticsClient";

export default function WebsiteAnalyticsPage() {
  return (
    <PermissionGuard permissionKey="website-analytics">
      <ManageWebsiteAnalyticsClient />
    </PermissionGuard>
  );
}
