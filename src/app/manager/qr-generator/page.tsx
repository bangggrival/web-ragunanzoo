"use client";

import React, { useState } from 'react';
import PermissionGuard from '@/components/PermissionGuard';
import QRCodeBulkGenerator from '@/components/qr/QRCodeBulkGenerator';
import { QrCode, Printer, Building2, PawPrint, Layers, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ManageQRGeneratorClient() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link 
              href="/manager" 
              className="text-muted-foreground hover:text-foreground text-xs font-semibold inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard Manager</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Generator QR Code Massal Ragunan</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Modul resmi pencetakan label stiker dan plat akrilik QR Code siap pakai untuk kandang satwa dan titik fasilitas kebun binatang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Buka Studio Cetak QR</span>
          </Button>
        </div>
      </div>

      {/* Hero Quick Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setModalOpen(true)}
          className="p-5 rounded-2xl bg-card border border-border hover:border-emerald-500/50 transition-all cursor-pointer shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <PawPrint className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground mb-1">Label Kandang Satwa</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cetak plat kandang satwa lengkap dengan nama latin, zona observasi, dan tautan langsung ke panduan digital, audio suara, AR 3D, serta kuis.
          </p>
        </div>

        <div 
          onClick={() => setModalOpen(true)}
          className="p-5 rounded-2xl bg-card border border-border hover:border-sky-500/50 transition-all cursor-pointer shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground mb-1">Titik Fasilitas Ragunan</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Stiker bilik toilet, musholla, halte kereta tram, pos medis P3K, loket JakCard, dan pujasera yang terhubung ke peta navigasi rute dan lapor fasilitas.
          </p>
        </div>

        <div 
          onClick={() => setModalOpen(true)}
          className="p-5 rounded-2xl bg-card border border-border hover:border-amber-500/50 transition-all cursor-pointer shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground mb-1">Pilihan Format Lembar A4</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Mendukung template layout kertas A4 3x3 (9 label), papan kandang besar 2x2 (4 label), stiker kompak 4x4 (16 label), hingga poster display 1x1.
          </p>
        </div>
      </div>

      {modalOpen && (
        <QRCodeBulkGenerator
          defaultTab="all"
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function QRGeneratorPage() {
  return (
    <PermissionGuard permissionKey="animals">
      <ManageQRGeneratorClient />
    </PermissionGuard>
  );
}
