"use client";

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Animal } from '@/hooks/useAnimals';
import { facilityConfigs, ZoneConfig } from '@/components/map/zoneConfig';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type QRTargetType = 'animal' | 'facility';

export interface QRPrintItem {
  id: string | number;
  type: QRTargetType;
  title: string;
  subtitle?: string | null; // Latin name or facility details
  category: string;
  categoryLabel: string;
  zoneOrLocation: string;
  description?: string | null;
  qrUrl: string;
  icon?: string;
  badgeColor?: string;
  conservationStatus?: string;
}

export type PrintTemplateSize = 'grid3x3' | 'grid2x2' | 'grid4x4' | 'grid1x1';
export type PrintThemeColor = 'emerald' | 'sky' | 'monochrome';

export interface QRCodeBulkGeneratorProps {
  animals?: Animal[];
  facilities?: ZoneConfig[];
  baseUrl?: string;
  onClose: () => void;
  defaultTab?: 'animals' | 'facilities' | 'all';
}

// Map facility category to human-readable labels
const FACILITY_CATEGORIES: Record<string, { label: string; icon: string; badge: string }> = {
  all: { label: 'Semua Fasilitas', icon: '🏢', badge: 'bg-slate-700' },
  toilet: { label: 'Toilet & Laktasi', icon: '🚻', badge: 'bg-sky-600' },
  musholla: { label: 'Musholla & Ibadah', icon: '🕌', badge: 'bg-emerald-600' },
  transportasi: { label: 'Halte Kereta Tram', icon: '🚎', badge: 'bg-green-700' },
  pintu: { label: 'Pintu & Loket Masuk', icon: '🎫', badge: 'bg-teal-700' },
  ticket: { label: 'Loket Tiket JakCard', icon: '💳', badge: 'bg-indigo-600' },
  kuliner: { label: 'Kuliner & Pujasera', icon: '🍲', badge: 'bg-amber-600' },
  medis: { label: 'Pos Medis & P3K', icon: '🚑', badge: 'bg-rose-600' },
  informasi: { label: 'Pusat Informasi & CS', icon: 'ℹ️', badge: 'bg-blue-600' },
  rental: { label: 'Rental Sepeda & Golf', icon: '🚲', badge: 'bg-lime-700' },
  parkir: { label: 'Titik Parkir Resmi', icon: '🅿️', badge: 'bg-slate-600' },
};

// Additional comprehensive zoo facility points to ensure 100% full coverage of Ragunan
const SUPPLEMENTAL_FACILITIES: ZoneConfig[] = [
  {
    id: 'medis_plaza_utara',
    name: 'Pos Medis & P3K Plaza Utama',
    nameEn: 'Main Plaza First Aid & Medical Post',
    color: '#e11d48',
    position: { x: 50, y: 20 },
    description: 'Layanan darurat medis, dokter jaga, tandu, tabung oksigen, dan pertolongan pertama pengunjung.',
    descriptionEn: 'Emergency first aid station, on-duty medic, and patient care.',
    type: 'medis' as any,
    category: 'medis',
  },
  {
    id: 'info_center_ragunan',
    name: 'Customer Care & Pusat Informasi',
    nameEn: 'Customer Service & Visitor Information Center',
    color: '#2563eb',
    position: { x: 49, y: 15 },
    description: 'Pusat pengaduan, penitipan barang, peminjaman kursi roda gratis, dan informasi jadwal edukasi.',
    descriptionEn: 'Visitor assistance, lost & found, free wheelchair lending, and schedule info.',
    type: 'info' as any,
    category: 'informasi',
  },
  {
    id: 'rental_sepeda_utara',
    name: 'Rental Sepeda & Mobil Golf Ramah Lingkungan',
    nameEn: 'Bike & Eco Golf Cart Rental Station',
    color: '#4d7c0f',
    position: { x: 53, y: 17 },
    description: 'Penyewaan sepeda tunggal, sepeda ganda (tandem), dan mobil golf keliling santai.',
    descriptionEn: 'Rental of single bicycles, tandem bikes, and eco electric golf carts.',
    type: 'rental' as any,
    category: 'rental',
  },
  {
    id: 'parkir_utama_utara',
    name: 'Area Parkir Resmi Gerbang Utara',
    nameEn: 'Main North Gate Vehicle Parking Area',
    color: '#475569',
    position: { x: 48, y: 8 },
    description: 'Kapasitas 1.500 mobil, 3.000 sepeda motor, dan bus pariwisata dengan pembayaran non-tunai.',
    descriptionEn: 'Official parking lot for cars, motorcycles, and tour buses.',
    type: 'parking' as any,
    category: 'parkir',
  },
  {
    id: 'pujasera_pusat_primata',
    name: 'Sentra Kuliner & Rest Area Schmutzer',
    nameEn: 'Schmutzer Primate Food Court & Rest Area',
    color: '#d97706',
    position: { x: 25, y: 48 },
    description: 'Aneka kuliner tradisional, minuman segar kelapa muda, dan area tempat istirahat teduh.',
    descriptionEn: 'Shaded food court offering traditional dishes and fresh beverages.',
    type: 'food' as any,
    category: 'kuliner',
  },
];

export default function QRCodeBulkGenerator({
  animals: initialAnimals,
  facilities: initialFacilities,
  baseUrl,
  onClose,
  defaultTab = 'all',
}: QRCodeBulkGeneratorProps) {
  // Determine site base URL
  const effectiveBaseUrl = useMemo(() => {
    if (baseUrl && baseUrl.trim() !== '') return baseUrl.replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://ragunanzoo.jakarta.go.id';
  }, [baseUrl]);

  // Active Main Tab: 'all' | 'animals' | 'facilities'
  const [activeTab, setActiveTab] = useState<'all' | 'animals' | 'facilities'>(defaultTab);

  // Data states
  const [animalsData, setAnimalsData] = useState<Animal[]>(initialAnimals || []);
  const [isLoadingAnimals, setIsLoadingAnimals] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [animalCategoryFilter, setAnimalCategoryFilter] = useState('all');
  const [facilityCategoryFilter, setFacilityCategoryFilter] = useState('all');

  // Print Template & Customization States
  const [templateSize, setTemplateSize] = useState<PrintTemplateSize>('grid3x3');
  const [themeColor, setThemeColor] = useState<PrintThemeColor>('emerald');
  const [showCutGuides, setShowCutGuides] = useState(true);
  const [showLogoHeader, setShowLogoHeader] = useState(true);
  const [showLocationPill, setShowLocationPill] = useState(true);
  const [showScanHint, setShowScanHint] = useState(true);

  // Load animals if not provided through props
  useEffect(() => {
    if (!initialAnimals || initialAnimals.length === 0) {
      const fetchAnimals = async () => {
        setIsLoadingAnimals(true);
        try {
          const { data, error } = await supabase
            .from('animals')
            .select('*')
            .eq('is_published', true)
            .order('name');
          if (!error && data) {
            setAnimalsData(data as Animal[]);
          }
        } catch (err) {
          console.error('Failed to load animals for bulk QR generator:', err);
        } finally {
          setIsLoadingAnimals(false);
        }
      };
      fetchAnimals();
    } else {
      setAnimalsData(initialAnimals);
    }
  }, [initialAnimals]);

  // Combine facility points from zoneConfig and supplementals
  const facilitiesData: ZoneConfig[] = useMemo(() => {
    const baseList = initialFacilities && initialFacilities.length > 0 ? initialFacilities : facilityConfigs;
    const combined = [...baseList];
    for (const sup of SUPPLEMENTAL_FACILITIES) {
      if (!combined.some(f => f.id === sup.id)) {
        combined.push(sup);
      }
    }
    return combined;
  }, [initialFacilities]);

  // Normalize all items into standard QRPrintItem list
  const allPrintItems: QRPrintItem[] = useMemo(() => {
    const animalItems: QRPrintItem[] = animalsData.map((animal) => ({
      id: `animal-${animal.id}`,
      type: 'animal',
      title: animal.name,
      subtitle: animal.latin_name || (animal as any).scientific_name || null,
      category: animal.category || 'Satwa',
      categoryLabel: animal.category ? `Kelompok ${animal.category}` : 'Satwa Koleksi Ragunan',
      zoneOrLocation: animal.zone || animal.location || 'Kawasan Satwa Ragunan',
      description: animal.habitat ? `Habitat Alami: ${animal.habitat}` : animal.description || null,
      qrUrl: `${effectiveBaseUrl}/animals/${animal.id}`,
      icon: '🐾',
      badgeColor: 'bg-emerald-700',
      conservationStatus: (animal as any).conservation_status || animal.status || 'Konservasi TM Ragunan',
    }));

    const facilityItems: QRPrintItem[] = facilitiesData.map((fac) => {
      const catKey = fac.category || (fac.type as string) || 'lainnya';
      const catMeta = FACILITY_CATEGORIES[catKey] || { label: 'Fasilitas Umum', icon: '📍', badge: 'bg-slate-700' };

      // Facility target QR URL opens map centered on this facility with directions & issue reporting
      const targetUrl = `${effectiveBaseUrl}/map?facility=${fac.id}&highlight=true`;

      return {
        id: `fac-${fac.id}`,
        type: 'facility',
        title: fac.name,
        subtitle: fac.nameEn || fac.description || null,
        category: catKey,
        categoryLabel: catMeta.label,
        zoneOrLocation: fac.name.includes('(') ? fac.name.split('(')[1].replace(')', '') : 'Kawasan Ragunan',
        description: fac.description || null,
        qrUrl: targetUrl,
        icon: catMeta.icon,
        badgeColor: catMeta.badge,
      };
    });

    return [...animalItems, ...facilityItems];
  }, [animalsData, facilitiesData, effectiveBaseUrl]);

  // Extract animal categories for filter pills
  const animalCategories = useMemo(() => {
    const cats = new Set<string>();
    animalsData.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [animalsData]);

  // Extract facility categories for filter pills
  const facilityCategories = useMemo(() => {
    const cats = new Set<string>();
    facilitiesData.forEach((f) => {
      if (f.category) cats.add(f.category);
    });
    return Array.from(cats);
  }, [facilitiesData]);

  // Selected Item IDs state (defaults to all items)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Initialize selected IDs once items are available
  useEffect(() => {
    if (allPrintItems.length > 0) {
      setSelectedIds((prev) => (prev.length === 0 ? allPrintItems.map((i) => String(i.id)) : prev));
    }
  }, [allPrintItems]);

  // Filtered items based on Tab, Search, and Category filters
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allPrintItems.filter((item) => {
      // 1. Tab match
      if (activeTab === 'animals' && item.type !== 'animal') return false;
      if (activeTab === 'facilities' && item.type !== 'facility') return false;

      // 2. Category match
      if (item.type === 'animal' && animalCategoryFilter !== 'all') {
        if (item.category.toLowerCase() !== animalCategoryFilter.toLowerCase()) return false;
      }
      if (item.type === 'facility' && facilityCategoryFilter !== 'all') {
        if (item.category.toLowerCase() !== facilityCategoryFilter.toLowerCase()) return false;
      }

      // 3. Search query match
      if (q !== '') {
        const titleMatch = item.title.toLowerCase().includes(q);
        const subtitleMatch = (item.subtitle || '').toLowerCase().includes(q);
        const locMatch = item.zoneOrLocation.toLowerCase().includes(q);
        const catMatch = item.categoryLabel.toLowerCase().includes(q);
        if (!titleMatch && !subtitleMatch && !locMatch && !catMatch) return false;
      }

      return true;
    });
  }, [allPrintItems, activeTab, animalCategoryFilter, facilityCategoryFilter, searchQuery]);

  // Currently selected items for printing
  const selectedItems = useMemo(() => {
    return allPrintItems.filter((item) => selectedIds.includes(String(item.id)));
  }, [allPrintItems, selectedIds]);

  // Selection toggles
  const toggleSelect = (id: string | number) => {
    const strId = String(id);
    setSelectedIds((prev) =>
      prev.includes(strId) ? prev.filter((i) => i !== strId) : [...prev, strId]
    );
  };

  const toggleSelectAllFiltered = () => {
    const filteredIdStrings = filteredItems.map((i) => String(i.id));
    const allFilteredAreSelected = filteredIdStrings.every((id) => selectedIds.includes(id));

    if (allFilteredAreSelected) {
      // Deselect filtered items
      setSelectedIds((prev) => prev.filter((id) => !filteredIdStrings.includes(id)));
    } else {
      // Add all filtered items to selection
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIdStrings])));
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Theme color styling specs
  const themeStyles = useMemo(() => {
    switch (themeColor) {
      case 'sky':
        return {
          primaryHex: '#0284c7',
          borderClass: 'border-sky-700',
          bgHeaderClass: 'bg-sky-700 text-white',
          textClass: 'text-sky-950',
          badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
          qrFgColor: '#0284c7',
          cutBorder: '#38bdf8',
        };
      case 'monochrome':
        return {
          primaryHex: '#111827',
          borderClass: 'border-slate-900',
          bgHeaderClass: 'bg-slate-900 text-white',
          textClass: 'text-slate-950',
          badgeClass: 'bg-slate-100 text-slate-900 border-slate-400',
          qrFgColor: '#000000',
          cutBorder: '#64748b',
        };
      case 'emerald':
      default:
        return {
          primaryHex: '#1b5e20',
          borderClass: 'border-emerald-800',
          bgHeaderClass: 'bg-emerald-800 text-white',
          textClass: 'text-emerald-950',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          qrFgColor: '#1b5e20',
          cutBorder: '#10b981',
        };
    }
  }, [themeColor]);

  // Grid column CSS for preview and print based on template size
  const templateConfig = useMemo(() => {
    switch (templateSize) {
      case 'grid2x2':
        return {
          colsClass: 'grid-cols-1 sm:grid-cols-2',
          printCols: 2,
          printRows: 2,
          qrSize: 130,
          labelTitleClass: 'text-base font-extrabold',
          labelDescClass: 'text-xs',
          perSheet: 4,
          name: 'Papan Kandang & Rambu Besar (2x2 - 4 label/A4)',
        };
      case 'grid4x4':
        return {
          colsClass: 'grid-cols-2 sm:grid-cols-4',
          printCols: 4,
          printRows: 4,
          qrSize: 68,
          labelTitleClass: 'text-xs font-bold truncate',
          labelDescClass: 'text-[10px] truncate',
          perSheet: 16,
          name: 'Stiker Kompak / Tag Bilik (4x4 - 16 label/A4)',
        };
      case 'grid1x1':
        return {
          colsClass: 'grid-cols-1 max-w-lg mx-auto',
          printCols: 1,
          printRows: 1,
          qrSize: 220,
          labelTitleClass: 'text-2xl font-black',
          labelDescClass: 'text-sm',
          perSheet: 1,
          name: 'Poster Display Tunggal (1x1 - 1 label penuh A4)',
        };
      case 'grid3x3':
      default:
        return {
          colsClass: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
          printCols: 3,
          printRows: 3,
          qrSize: 95,
          labelTitleClass: 'text-sm font-extrabold',
          labelDescClass: 'text-xs',
          perSheet: 9,
          name: 'Plat Akrilik / Stiker Sedang (3x3 - 9 label/A4)',
        };
    }
  }, [templateSize]);

  // High-Quality Print Trigger
  const handlePrint = () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih minimal 1 item untuk dicetak.');
      return;
    }

    const printWindow = window.open('', '_blank', 'height=850,width=1250');
    if (!printWindow) {
      toast.error('Pop-up terblokir oleh browser. Harap izinkan pop-up untuk mencetak.');
      return;
    }

    const primaryColor = themeStyles.primaryHex;
    const cutBorder = showCutGuides ? `1px dashed ${themeStyles.cutBorder}` : 'none';

    // Generate HTML for each label
    const labelsHtml = selectedItems
      .map((item) => {
        const isAnimal = item.type === 'animal';
        const ctaText = isAnimal
          ? 'Pindai untuk Edukasi Satwa, Audio Suara, 3D AR, & Kuis'
          : 'Pindai untuk Peta Navigasi, Rute Jalan, & Lapor Kendala';
        const typeBadge = isAnimal ? 'KANDANG SATWA KOLEKSI' : 'TITIK FASILITAS PENGUNJUNG';

        return `
          <div class="label-card">
            ${
              showLogoHeader
                ? `
              <div class="label-header">
                <div class="header-brand">
                  <span class="emblem">🌿</span>
                  <div>
                    <div class="brand-title">TAMAN MARGASATWA RAGUNAN</div>
                    <div class="brand-sub">${typeBadge}</div>
                  </div>
                </div>
                <div class="header-type-icon">${item.icon || '📍'}</div>
              </div>
            `
                : ''
            }

            <div class="label-body">
              <h2 class="item-name">${item.title}</h2>
              ${
                item.subtitle
                  ? `<div class="item-sub">${item.subtitle}</div>`
                  : ''
              }

              <div class="qr-wrapper">
                <div class="qr-box">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=${templateConfig.qrSize * 2}x${templateConfig.qrSize * 2}&data=${encodeURIComponent(item.qrUrl)}&margin=1"
                    width="${templateConfig.qrSize}"
                    height="${templateConfig.qrSize}"
                    alt="QR ${item.title}"
                  />
                </div>
              </div>

              ${
                showLocationPill
                  ? `
                <div class="location-badge">
                  <span>📍</span>
                  <span>${item.zoneOrLocation}</span>
                </div>
              `
                  : ''
              }

              ${
                showScanHint
                  ? `
                <div class="cta-banner">
                  <div class="cta-arrow">📲 KAMERA HP / QR SCANNER</div>
                  <div class="cta-desc">${ctaText}</div>
                </div>
              `
                  : ''
              }

              <div class="label-footer">
                <span>ragunanzoo.jakarta.go.id</span>
                <span>${item.categoryLabel}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>Cetak Label QR Code Ragunan - ${selectedItems.length} Titik</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 7mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              color: #0f172a;
              background: #fff;
              padding: 0;
            }
            .page-container {
              display: grid;
              grid-template-columns: repeat(${templateConfig.printCols}, 1fr);
              gap: 4mm;
              align-content: start;
              page-break-inside: avoid;
            }
            .label-card {
              border: 2px solid ${primaryColor};
              border-radius: 12px;
              padding: 10px;
              background: #fff;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
              outline: ${cutBorder};
              outline-offset: 2mm;
              margin-bottom: ${templateSize === 'grid1x1' ? '0' : '4mm'};
              box-shadow: 0 1px 3px rgba(0,0,0,0.05);
              text-align: center;
            }
            .label-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-bottom: 6px;
              border-bottom: 1.5px solid ${primaryColor};
              margin-bottom: 6px;
            }
            .header-brand {
              display: flex;
              align-items: center;
              gap: 6px;
              text-align: left;
            }
            .header-brand .emblem {
              font-size: 16px;
            }
            .brand-title {
              font-size: 8pt;
              font-weight: 800;
              color: ${primaryColor};
              letter-spacing: 0.5px;
              line-height: 1.1;
            }
            .brand-sub {
              font-size: 6pt;
              font-weight: 700;
              color: #475569;
              letter-spacing: 0.3px;
            }
            .header-type-icon {
              font-size: 14px;
            }
            .label-body {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .item-name {
              font-size: ${templateSize === 'grid1x1' ? '24pt' : templateSize === 'grid2x2' ? '14pt' : templateSize === 'grid4x4' ? '8.5pt' : '11pt'};
              font-weight: 800;
              color: ${primaryColor};
              margin-bottom: 2px;
              line-height: 1.2;
            }
            .item-sub {
              font-size: ${templateSize === 'grid4x4' ? '6.5pt' : '7.5pt'};
              color: #475569;
              font-style: italic;
              margin-bottom: 6px;
              line-height: 1.2;
            }
            .qr-wrapper {
              display: flex;
              justify-content: center;
              margin: 4px 0;
            }
            .qr-box {
              padding: 4px;
              background: #fff;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              display: inline-block;
            }
            .location-badge {
              display: inline-flex;
              align-items: center;
              gap: 3px;
              font-size: ${templateSize === 'grid4x4' ? '6.5pt' : '7.5pt'};
              font-weight: 700;
              color: ${primaryColor};
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 6px;
              padding: 2px 6px;
              margin-top: 4px;
            }
            .cta-banner {
              margin-top: 5px;
              padding: 4px;
              background: #f8fafc;
              border-radius: 6px;
              border: 1px dashed #cbd5e1;
              width: 100%;
            }
            .cta-arrow {
              font-size: 6.5pt;
              font-weight: 800;
              color: ${primaryColor};
              letter-spacing: 0.2px;
            }
            .cta-desc {
              font-size: 5.5pt;
              color: #64748b;
              font-weight: 600;
              line-height: 1.1;
            }
            .label-footer {
              display: flex;
              justify-content: space-between;
              width: 100%;
              font-size: 5.5pt;
              font-weight: 600;
              color: #94a3b8;
              margin-top: 6px;
              padding-top: 4px;
              border-top: 1px dotted #e2e8f0;
            }
            @media print {
              .label-card {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body onload="setTimeout(function(){ window.print(); }, 400);">
          <div class="page-container">
            ${labelsHtml}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    toast.success(`Menyiapkan ${selectedItems.length} label QR untuk dicetak.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border rounded-3xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden transition-all">
        {/* ══════════ TOP MODAL HEADER ══════════ */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black shadow-2xs">
              <AppIcon name="solar:qr-code-bold-duotone" className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-foreground">
                  Generator QR Code Massal Ragunan
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Siap Cetak Fisik A4
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cetak label stiker dan plat akrilik siap pasang untuk kandang satwa serta titik fasilitas pengunjung.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
              title="Tutup Modal"
            >
              <AppIcon name="solar:close-circle-bold" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ══════════ CONTROL BAR & SETTINGS ══════════ */}
        <div className="p-4 border-b border-border bg-card space-y-3 flex-shrink-0">
          {/* Tabs and Quick Selection Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Main Tabs */}
            <div className="inline-flex p-1 rounded-2xl bg-muted/70 border border-border/70 text-xs font-bold">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'all'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <AppIcon name="solar:layers-bold-duotone" className="w-3.5 h-3.5" />
                <span>Semua Titik ({allPrintItems.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('animals')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'animals'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <AppIcon name="fluent-emoji-flat:paw-prints" className="w-3.5 h-3.5" />
                <span>Kandang Satwa ({animalsData.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('facilities')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'facilities'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <AppIcon name="solar:buildings-2-bold-duotone" className="w-3.5 h-3.5" />
                <span>Titik Fasilitas ({facilitiesData.length})</span>
              </button>
            </div>

            {/* Selection Status & Batch Selection Actions */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={toggleSelectAllFiltered}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold border border-border/80 transition-all"
              >
                <AppIcon name="solar:check-square-bold" className="w-3.5 h-3.5 text-primary" />
                <span>Pilih Tampil ({filteredItems.length})</span>
              </button>

              <button
                onClick={clearSelection}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all font-semibold"
                title="Batalkan seluruh pilihan"
              >
                <AppIcon name="solar:stop-bold" className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-xs">
                {selectedItems.length} label dipilih
              </span>
            </div>
          </div>

          {/* Search Bar + Dynamic Category Filter */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <div className="relative flex-1">
              <AppIcon name="solar:magnifer-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'animals'
                    ? 'Cari nama satwa, nama latin, atau zona kandang...'
                    : activeTab === 'facilities'
                    ? 'Cari fasilitas (toilet, musholla, halte, loket, pos medis)...'
                    : 'Cari kandang satwa atau titik fasilitas kebun binatang...'
                }
                className="w-full bg-muted/40 border border-border rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category Filter Pills */}
            {activeTab === 'animals' && (
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full sm:max-w-xs scrollbar-none">
                <button
                  onClick={() => setAnimalCategoryFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    animalCategoryFilter === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Semua
                </button>
                {animalCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAnimalCategoryFilter(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      animalCategoryFilter === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'facilities' && (
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full sm:max-w-md scrollbar-none">
                <button
                  onClick={() => setFacilityCategoryFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    facilityCategoryFilter === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Semua
                </button>
                {facilityCategories.map((cat) => {
                  const meta = FACILITY_CATEGORIES[cat] || { label: cat, icon: '📍' };
                  return (
                    <button
                      key={cat}
                      onClick={() => setFacilityCategoryFilter(cat)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                        facilityCategoryFilter === cat
                          ? 'bg-sky-600 text-white'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Template Format & Design Controls Strip */}
          <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Format Layout Selector */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-muted-foreground flex items-center gap-1">
                <AppIcon name="solar:widget-5-bold-duotone" className="w-3.5 h-3.5" />
                <span>Format:</span>
              </span>
              <div className="inline-flex p-0.5 bg-muted rounded-xl border border-border">
                <button
                  onClick={() => setTemplateSize('grid3x3')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    templateSize === 'grid3x3' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
                  }`}
                  title="9 label per lembar A4 (ideal untuk stiker plat sedang)"
                >
                  A4 3x3 (9 Label)
                </button>
                <button
                  onClick={() => setTemplateSize('grid2x2')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    templateSize === 'grid2x2' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
                  }`}
                  title="4 label per lembar A4 (ideal untuk papan kandang besar)"
                >
                  A4 2x2 (4 Papan)
                </button>
                <button
                  onClick={() => setTemplateSize('grid4x4')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    templateSize === 'grid4x4' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
                  }`}
                  title="16 label per lembar A4 (stiker kompak)"
                >
                  A4 4x4 (16 Mini)
                </button>
                <button
                  onClick={() => setTemplateSize('grid1x1')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    templateSize === 'grid1x1' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
                  }`}
                  title="1 poster display penuh A4"
                >
                  A4 1x1 (Poster)
                </button>
              </div>
            </div>

            {/* Theme Color Selector */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-muted-foreground flex items-center gap-1">
                <AppIcon name="solar:palette-bold-duotone" className="w-3.5 h-3.5" />
                <span>Warna Tema:</span>
              </span>
              <div className="inline-flex gap-1">
                <button
                  onClick={() => setThemeColor('emerald')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
                    themeColor === 'emerald'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                      : 'bg-card text-muted-foreground border-border'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Hijau Ragunan</span>
                </button>
                <button
                  onClick={() => setThemeColor('sky')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
                    themeColor === 'sky'
                      ? 'bg-sky-600 text-white border-sky-700 shadow-2xs'
                      : 'bg-card text-muted-foreground border-border'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span>Biru Fasilitas</span>
                </button>
                <button
                  onClick={() => setThemeColor('monochrome')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
                    themeColor === 'monochrome'
                      ? 'bg-slate-900 text-white border-slate-950 shadow-2xs'
                      : 'bg-card text-muted-foreground border-border'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-black" />
                  <span>Hitam-Putih</span>
                </button>
              </div>
            </div>

            {/* Signage Detail Toggles */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={showCutGuides}
                  onChange={(e) => setShowCutGuides(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-0"
                />
                <span>Garis Potong</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={showScanHint}
                  onChange={(e) => setShowScanHint(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-0"
                />
                <span>Petunjuk Scan</span>
              </label>
            </div>
          </div>
        </div>

        {/* ══════════ MAIN PREVIEW AREA ══════════ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <span>Preview Cetak Label:</span>
              <span className="text-foreground">{templateConfig.name}</span>
              <span>• Total Halaman: ~{Math.ceil(selectedItems.length / templateConfig.perSheet)} Lembar A4</span>
            </p>

            <span className="text-[11px] text-muted-foreground">
              Menampilkan {filteredItems.length} hasil
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-2">
              <AppIcon name="solar:qr-code-bold-duotone" className="w-12 h-12 mx-auto opacity-30 animate-pulse" />
              <p className="font-bold text-sm">Tidak ada titik satwa atau fasilitas yang cocok</p>
              <p className="text-xs">Coba ubah kata kunci pencarian atau bersihkan filter kategori.</p>
            </div>
          ) : (
            <div className={`grid ${templateConfig.colsClass} gap-4`}>
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(String(item.id));
                const isAnimal = item.type === 'animal';

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`relative rounded-2xl border-2 transition-all cursor-pointer p-4 flex flex-col justify-between bg-card text-card-foreground select-none group ${
                      isSelected
                        ? `${themeStyles.borderClass} shadow-md`
                        : 'border-border/60 opacity-60 hover:opacity-100 hover:border-primary/50'
                    }`}
                    style={{
                      borderStyle: showCutGuides ? 'dashed' : 'solid',
                    }}
                  >
                    {/* Top Selection Checkbox Pill */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-muted border border-border text-transparent'
                        }`}
                      >
                        <AppIcon name="solar:check-read-linear" className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Signage Official Header */}
                    {showLogoHeader && (
                      <div className="flex items-center justify-between pb-2 border-b border-border/80 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0 pr-6">
                          <span className="text-base flex-shrink-0">🌿</span>
                          <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-wider text-primary truncate">
                              TM Ragunan
                            </p>
                            <p className="text-[8px] font-semibold text-muted-foreground truncate">
                              {isAnimal ? 'KANDANG SATWA KOLEKSI' : 'FASILITAS PUBLIK'}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm flex-shrink-0">{item.icon || '📍'}</span>
                      </div>
                    )}

                    {/* Card Content & Title */}
                    <div className="text-center py-1 flex-1 flex flex-col items-center justify-center">
                      <h3 className={`${templateConfig.labelTitleClass} text-foreground leading-tight`}>
                        {item.title}
                      </h3>

                      {item.subtitle && (
                        <p className={`${templateConfig.labelDescClass} text-muted-foreground italic mt-0.5 line-clamp-1`}>
                          {item.subtitle}
                        </p>
                      )}

                      {/* QR Code SVG Vector */}
                      <div className="my-3 p-2 bg-white rounded-xl border border-border/80 shadow-2xs inline-block">
                        <QRCodeSVG
                          value={item.qrUrl}
                          size={templateConfig.qrSize}
                          level="H"
                          includeMargin={false}
                          fgColor={themeStyles.qrFgColor}
                        />
                      </div>

                      {/* Location Pill */}
                      {showLocationPill && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-muted text-[10px] font-bold text-foreground max-w-full truncate mt-1">
                          <AppIcon name="solar:map-point-bold-duotone" className="w-3 h-3 text-primary flex-shrink-0" />
                          <span className="truncate">{item.zoneOrLocation}</span>
                        </div>
                      )}

                      {/* Call-to-action Hint */}
                      {showScanHint && (
                        <div className="mt-2.5 w-full p-1.5 rounded-lg bg-muted/60 border border-border/60 text-[9px] font-semibold text-muted-foreground text-center line-clamp-2">
                          {isAnimal
                            ? '📲 Pindai dengan Kamera HP untuk Edukasi Satwa, Suara, AR & Kuis'
                            : '📲 Pindai dengan Kamera HP untuk Peta Rute & Info Layanan'}
                        </div>
                      )}
                    </div>

                    {/* Footer Domain & Badge */}
                    <div className="pt-2 mt-2 border-t border-border/60 flex items-center justify-between text-[9px] text-muted-foreground font-semibold">
                      <span className="truncate">ragunanzoo.jakarta.go.id</span>
                      <span className="font-bold text-foreground truncate">{item.categoryLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══════════ BOTTOM ACTION FOOTER ══════════ */}
        <div className="p-4 sm:p-5 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-muted-foreground text-center sm:text-left">
            <span className="font-bold text-foreground">{selectedItems.length} dari {allPrintItems.length}</span> label dipilih
            {selectedItems.length > 0 && (
              <span className="ml-1">
                (Membutuhkan ~{Math.ceil(selectedItems.length / templateConfig.perSheet)} lembar kertas A4)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 sm:flex-none rounded-xl"
            >
              Tutup
            </Button>

            <Button
              onClick={handlePrint}
              disabled={selectedItems.length === 0}
              className="flex-1 sm:flex-none gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold text-xs sm:text-sm px-6"
            >
              <AppIcon name="solar:printer-bold-duotone" className="w-4 h-4" />
              <span>Cetak {selectedItems.length} Label Sekarang</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
