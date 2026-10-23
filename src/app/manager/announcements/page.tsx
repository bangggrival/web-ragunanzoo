"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageAnnouncementsClient from "./ManageAnnouncementsClient";

export default function AnnouncementsPage() {
  return (
    <PermissionGuard permissionKey="announcements">
      <ManageAnnouncementsClient />
    </PermissionGuard>
  );
}
