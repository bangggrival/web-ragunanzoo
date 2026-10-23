"use client";

import PermissionGuard from "@/components/PermissionGuard";
import ManageGalleryClient from "./ManageGalleryClient";

export default function GalleryPage() {
  return (
    <PermissionGuard permissionKey="gallery">
      <ManageGalleryClient />
    </PermissionGuard>
  );
}
