import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

import type { WBSSubmission } from '@/hooks/useWBSSubmissions';
import { COLORS, getCategoryLabel, getStatusColor, getStatusLabel } from '@/utils/wbsPdf/pdfConstants';
import {
  addTextWatermark,
  getImageFormatFromDataUrl,
  imageToBase64,
  optimizeImageDataUrl,
} from '@/utils/wbsPdf/pdfHelpers';
import type { ExportOptions as ExportOptionsType } from '@/utils/wbsPdf/pdfTypes';

export type ExportOptions = ExportOptionsType;

export async function exportWBSToPDF(
  submissions: WBSSubmission[],
  options: ExportOptions = { includeImages: true, detailed: true }
): Promise<void> {
  if (!submissions || submissions.length === 0) {
    throw new Error('Tidak ada data untuk di-export');
  }

  let doc: jsPDF;
  
  try {
    doc = new jsPDF('p', 'mm', 'a4');
  } catch (error) {
    console.error('Failed to create jsPDF instance:', error);
    throw new Error('Gagal membuat dokumen PDF');
  }
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  const opts = {
    includeImages: options.includeImages ?? true,
    detailed: options.detailed ?? true,
    includeWatermark: options.includeWatermark ?? false,
    includeLogo: options.includeLogo ?? true,
    logoUrl: options.logoUrl,
    organizationName: options.organizationName,
    dateRange: options.dateRange,
  };

  /**
   * jsPDF bisa melempar RangeError("Invalid string length") saat dokumen terlalu besar
   * (biasanya karena terlalu banyak halaman/gambar base64).
   * Jadi kita pasang guard supaya export tetap berhasil dengan menurunkan “beban”.
   */
  const LIMITS = {
    maxSubmissionsForPdf: 300,
    maxDetailedSubmissions: 25,
    maxEmbeddedEvidenceImages: 30,
  } as const;

  const totalEvidenceFiles = submissions.reduce((acc, s) => acc + (s.evidence_urls?.length ?? 0), 0);

  const needsHardLimit = submissions.length > LIMITS.maxSubmissionsForPdf;
  const exportSubmissions = needsHardLimit ? submissions.slice(0, LIMITS.maxSubmissionsForPdf) : submissions;

  const needsReduceImages = opts.includeImages && totalEvidenceFiles > LIMITS.maxEmbeddedEvidenceImages;
  const includeImagesEffective = opts.includeImages && !needsReduceImages;

  const needsReduceDetails = opts.detailed && exportSubmissions.length > LIMITS.maxDetailedSubmissions;
  const detailedEffective = opts.detailed;

  // Try to load logo but don't fail if it doesn't work
  let logoBase64: string | null = null;
  let logoAspectRatio = 1; // width / height
  let logoIsPng = false; // Track if logo has transparency
  if (opts.includeLogo && opts.logoUrl) {
    try {
      const raw = await imageToBase64(opts.logoUrl);
      if (raw) {
        // Check if original is PNG (likely has transparency)
        logoIsPng = raw.includes('image/png');
        
        // Get original aspect ratio before optimizing
        const tempImg = new Image();
        await new Promise<void>((resolve) => {
          tempImg.onload = () => {
            const w = tempImg.naturalWidth || tempImg.width;
            const h = tempImg.naturalHeight || tempImg.height;
            if (w && h) logoAspectRatio = w / h;
            resolve();
          };
          tempImg.onerror = () => resolve();
          tempImg.src = raw;
        });

        // Keep PNG format to preserve transparency, use JPEG for others
        logoBase64 = await optimizeImageDataUrl(raw, {
          maxWidth: 300,
          maxHeight: 300,
          quality: 0.9,
          mimeType: logoIsPng ? 'image/png' : 'image/jpeg',
        });
      }
    } catch (error) {
      console.warn('Failed to load logo, continuing without it:', error);
    }
  }

  // ===== HEADER SECTION =====
  const drawHeader = () => {
    const headerHeight = 42;
    
    // Header background with gradient effect (simulated with multiple rectangles)
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    
    // Add subtle gradient overlay at bottom of header
    doc.setFillColor(0, 0, 0);
    doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
    doc.rect(0, headerHeight - 5, pageWidth, 5, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    // Calculate logo dimensions
    let logoAreaWidth = 0;
    let finalLogoWidth = 0;
    let finalLogoHeight = 0;
    
    if (logoBase64) {
      const targetLogoHeight = 18;
      const calculatedWidth = targetLogoHeight * logoAspectRatio;
      const maxLogoWidth = 40;
      finalLogoWidth = Math.min(calculatedWidth, maxLogoWidth);
      finalLogoHeight = finalLogoWidth / logoAspectRatio;
      logoAreaWidth = finalLogoWidth + 8; // Logo width + padding
    }

    // Calculate content area (centered between logo and right margin)
    const contentCenterX = logoBase64 
      ? margin + logoAreaWidth + (pageWidth - margin * 2 - logoAreaWidth) / 2
      : pageWidth / 2;

    // Draw logo on the left with professional styling
    if (logoBase64) {
      try {
        const imgFormat = getImageFormatFromDataUrl(logoBase64);
        const logoX = margin + 3;
        const logoY = (headerHeight - finalLogoHeight) / 2;
        
        // White background container with subtle shadow
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.2);
        const containerPadding = 3;
        doc.roundedRect(
          logoX - containerPadding,
          logoY - containerPadding,
          finalLogoWidth + containerPadding * 2,
          finalLogoHeight + containerPadding * 2,
          2, 2, 'FD'
        );
        
        // Draw the logo
        doc.addImage(logoBase64, imgFormat, logoX, logoY, finalLogoWidth, finalLogoHeight);
      } catch {
        // ignore logo errors
      }
    }

    // Title - centered in content area
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('LAPORAN WHISTLEBLOWING SYSTEM', contentCenterX, 15, { align: 'center' });

    // Subtitle
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistem Pelaporan Pengaduan', contentCenterX, 23, { align: 'center' });

    // Organization name if provided
    if (opts.organizationName) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(opts.organizationName, contentCenterX, 30, { align: 'center' });
    }

    // Date & period info
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const printedAt = `Dicetak: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: localeId })}`;
    const periodText = opts.dateRange
      ? `Periode: ${format(opts.dateRange.start, 'dd MMMM yyyy', { locale: localeId })} - ${format(
          opts.dateRange.end,
          'dd MMMM yyyy',
          { locale: localeId }
        )}`
      : null;
    const bottomLine = periodText ? `${printedAt}  •  ${periodText}` : printedAt;
    doc.text(bottomLine, contentCenterX, opts.organizationName ? 37 : 32, { align: 'center' });

    yPos = headerHeight + 8;
  };

  // ===== STATISTICS SECTION =====
  const drawStatistics = () => {
    // Section title with underline
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.secondary);
    doc.text('Ringkasan Statistik', margin, yPos);
    
    // Subtle underline
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.8);
    doc.line(margin, yPos + 2, margin + 45, yPos + 2);
    yPos += 12;

    const stats = {
      total: exportSubmissions.length,
      pending: exportSubmissions.filter((s) => s.status === 'pending').length,
      investigating: exportSubmissions.filter((s) => s.status === 'investigating').length,
      resolved: exportSubmissions.filter((s) => s.status === 'resolved').length,
      dismissed: exportSubmissions.filter((s) => s.status === 'dismissed').length,
    };

    const boxWidth = (pageWidth - margin * 2 - 15) / 4;
    const boxHeight = 24;
    let boxX = margin;

    const statItems = [
      { label: 'Total Laporan', value: stats.total, color: COLORS.primary, icon: '📊' },
      { label: 'Menunggu', value: stats.pending, color: COLORS.pending, icon: '⏳' },
      { label: 'Investigasi', value: stats.investigating, color: COLORS.investigating, icon: '🔍' },
      { label: 'Selesai', value: stats.resolved, color: COLORS.resolved, icon: '✅' },
    ];

    statItems.forEach((item) => {
      // Box shadow effect
      doc.setFillColor(230, 230, 230);
      doc.roundedRect(boxX + 0.5, yPos + 0.5, boxWidth, boxHeight, 3, 3, 'F');
      
      // Box background with border
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.3);
      doc.roundedRect(boxX, yPos, boxWidth, boxHeight, 3, 3, 'FD');

      // Colored top border accent
      doc.setFillColor(...item.color);
      doc.roundedRect(boxX, yPos, boxWidth, 3, 3, 3, 'F');
      doc.rect(boxX, yPos + 1.5, boxWidth, 1.5, 'F'); // Fill corner gap

      // Value - larger and bold
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...item.color);
      doc.text(item.value.toString(), boxX + boxWidth / 2, yPos + 13, { align: 'center' });

      // Label - smaller and muted
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(item.label, boxX + boxWidth / 2, yPos + 19, { align: 'center' });

      boxX += boxWidth + 5;
    });

    yPos += boxHeight + 18;
  };

  // ===== SUMMARY TABLE =====
  const drawSummaryTable = () => {
    // Section title with underline
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.secondary);
    doc.text('Daftar Laporan', margin, yPos);
    
    // Subtle underline
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.8);
    doc.line(margin, yPos + 2, margin + 35, yPos + 2);
    yPos += 10;

    const tableData = exportSubmissions.map((sub, index) => [
      (index + 1).toString(),
      format(new Date(sub.created_at), 'dd/MM/yyyy'),
      getCategoryLabel(sub.category),
      sub.is_anonymous ? 'Anonim' : sub.reporter_name || '-',
      sub.reported_person_name || '-',
      sub.description.length > 35 ? `${sub.description.substring(0, 35)}...` : sub.description,
      '', // Status will be drawn as badge
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Tanggal', 'Kategori', 'Pelapor', 'Terlapor', 'Deskripsi', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        cellPadding: 4,
        lineWidth: 0.1,
        lineColor: [255, 255, 255],
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 4,
        lineWidth: 0.1,
        lineColor: [220, 220, 220],
        valign: 'middle',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10, fontStyle: 'bold' },
        1: { halign: 'center', cellWidth: 20 },
        2: { cellWidth: 26, halign: 'left' },
        3: { cellWidth: 24, halign: 'left' },
        4: { cellWidth: 24, halign: 'left' },
        5: { cellWidth: 'auto', halign: 'left' },
        6: { halign: 'center', cellWidth: 22 },
      },
      alternateRowStyles: {
        fillColor: [250, 250, 252],
      },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
      },
      margin: { left: margin, right: margin },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.2,
      didDrawCell: (data) => {
        // Color status cells with rounded badge
        if (data.column.index === 6 && data.section === 'body') {
          const status = exportSubmissions[data.row.index]?.status;
          if (status) {
            const color = getStatusColor(status);
            const badgeWidth = data.cell.width - 4;
            const badgeHeight = 6;
            const badgeX = data.cell.x + 2;
            const badgeY = data.cell.y + (data.cell.height - badgeHeight) / 2;
            
            doc.setFillColor(...color);
            doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.text(
              getStatusLabel(status),
              data.cell.x + data.cell.width / 2,
              badgeY + badgeHeight / 2 + 1,
              { align: 'center' }
            );
            doc.setFont('helvetica', 'normal');
          }
        }
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Catatan jika data dipotong (untuk mencegah PDF terlalu besar)
    if (needsHardLimit) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Catatan: demi menjaga ukuran file, PDF ini hanya memuat ${LIMITS.maxSubmissionsForPdf} laporan pertama dari total ${submissions.length} laporan.`,
        margin,
        yPos
      );
      yPos += 8;
    }
  };

  // ===== DETAILED REPORTS =====
  const drawDetailedReports = async () => {
    let embeddedImagesCount = 0;

    const detailSubmissions = needsReduceDetails
      ? exportSubmissions.slice(0, LIMITS.maxDetailedSubmissions)
      : exportSubmissions;

    for (let i = 0; i < detailSubmissions.length; i++) {
      const sub = detailSubmissions[i];

      // Check if we need a new page
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = margin;
      }

      // Report header with colored border
      const statusColor = getStatusColor(sub.status);
      doc.setFillColor(...statusColor);
      doc.rect(margin, yPos, pageWidth - margin * 2, 3, 'F');

      doc.setFillColor(...COLORS.light);
      doc.rect(margin, yPos + 3, pageWidth - margin * 2, 22, 'F');

      // Report number and date
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.secondary);
      doc.text(`Laporan #${i + 1}`, margin + 5, yPos + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(format(new Date(sub.created_at), 'dd MMMM yyyy, HH:mm', { locale: localeId }), margin + 5, yPos + 19);

      // Status badge
      doc.setFillColor(...statusColor);
      const statusText = getStatusLabel(sub.status);
      const statusWidth = doc.getTextWidth(statusText) + 10;
      doc.roundedRect(pageWidth - margin - statusWidth - 5, yPos + 9, statusWidth, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(statusText, pageWidth - margin - statusWidth / 2 - 5, yPos + 15.5, { align: 'center' });

      yPos += 30;

      // Content area
      const contentStartY = yPos;
      const leftColX = margin + 5;
      const rightColX = pageWidth / 2 + 5;
      const labelColor: [number, number, number] = [107, 114, 128];
      const valueColor = COLORS.secondary;

      // Left column - Pelapor info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.primary);
      doc.text('INFORMASI PELAPOR', leftColX, yPos);
      yPos += 7;

      const reporterInfo: Array<[string, string]> = [
        ['Nama', sub.is_anonymous ? 'Anonim' : sub.reporter_name || '-'],
        ['Email', sub.is_anonymous ? '-' : sub.reporter_email || '-'],
        ['Telepon', sub.is_anonymous ? '-' : sub.reporter_phone || '-'],
      ];

      reporterInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...labelColor);
        doc.text(`${label}:`, leftColX, yPos);
        doc.setTextColor(...valueColor);
        doc.text(value, leftColX + 20, yPos);
        yPos += 5;
      });

      // Right column - Reported Person & Incident info
      let rightY = contentStartY;
      
      // Identitas Terlapor section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.primary);
      doc.text('IDENTITAS TERLAPOR', rightColX, rightY);
      rightY += 7;

      const reportedPersonInfo: Array<[string, string]> = [
        ['Nama', sub.reported_person_name || '-'],
        ['Jabatan', sub.reported_person_position || '-'],
      ];

      reportedPersonInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...labelColor);
        doc.text(`${label}:`, rightColX, rightY);
        doc.setTextColor(...valueColor);
        doc.text(value, rightColX + 20, rightY);
        rightY += 5;
      });

      rightY += 5;
      
      // Detail Kejadian section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.primary);
      doc.text('DETAIL KEJADIAN', rightColX, rightY);
      rightY += 7;

      const incidentInfo: Array<[string, string]> = [
        ['Kategori', getCategoryLabel(sub.category)],
        [
          'Tanggal',
          sub.incident_date ? format(new Date(sub.incident_date), 'dd MMMM yyyy', { locale: localeId }) : '-',
        ],
        ['Lokasi', sub.incident_location || '-'],
      ];

      incidentInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...labelColor);
        doc.text(`${label}:`, rightColX, rightY);
        doc.setTextColor(...valueColor);
        const maxWidth = pageWidth - rightColX - margin - 25;
        const lines = doc.splitTextToSize(value, maxWidth);
        doc.text(lines, rightColX + 22, rightY);
        rightY += lines.length * 4 + 2;
      });

      yPos = Math.max(yPos, rightY) + 5;

      // Description
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.primary);
      doc.text('DESKRIPSI LAPORAN', leftColX, yPos);
      yPos += 6;

      doc.setFillColor(250, 250, 250);
      const descLines = doc.splitTextToSize(sub.description, pageWidth - margin * 2 - 10);
      const descHeight = Math.min(descLines.length * 4 + 6, 40);
      doc.roundedRect(margin, yPos - 2, pageWidth - margin * 2, descHeight, 2, 2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...valueColor);
      doc.text(descLines.slice(0, 8), leftColX, yPos + 3);
      yPos += descHeight + 5;

      // Admin notes
      if (sub.admin_notes) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.primary);
        doc.text('CATATAN ADMIN', leftColX, yPos);
        yPos += 6;

        doc.setFillColor(255, 251, 235);
        const noteLines = doc.splitTextToSize(sub.admin_notes, pageWidth - margin * 2 - 10);
        const noteHeight = Math.min(noteLines.length * 4 + 6, 25);
        doc.roundedRect(margin, yPos - 2, pageWidth - margin * 2, noteHeight, 2, 2, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...valueColor);
        doc.text(noteLines.slice(0, 4), leftColX, yPos + 3);
        yPos += noteHeight + 5;
      }

      // Evidence images
      if (includeImagesEffective && sub.evidence_urls && sub.evidence_urls.length > 0) {
        // Check space
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.primary);
        doc.text(`BUKTI PENDUKUNG (${sub.evidence_urls.length} file)`, leftColX, yPos);
        yPos += 8;

        const imageWidth = 40;
        const imageHeight = 30;
        let imgX = margin;

        for (let j = 0; j < Math.min(sub.evidence_urls.length, 6); j++) {
          const url = sub.evidence_urls[j];
          if (!url) continue;

          // Global cap agar dokumen tidak membengkak
          if (embeddedImagesCount >= LIMITS.maxEmbeddedEvidenceImages) {
            break;
          }
          
          const isImage = url.match(/\.(jpg|jpeg|png|webp|gif)$/i);

          if (isImage) {
            try {
               const base64 = await imageToBase64(url);
               if (base64) {
                 // Kompres / downscale agar PDF tidak terlalu besar
                 const optimized = await optimizeImageDataUrl(base64, {
                   maxWidth: 1280,
                   maxHeight: 1280,
                   quality: base64.length > 900_000 ? 0.6 : 0.72,
                   mimeType: 'image/jpeg',
                 });
                // Check if new row needed
                if (imgX + imageWidth > pageWidth - margin) {
                  imgX = margin;
                  yPos += imageHeight + 5;
                }

                // Check if new page needed
                if (yPos + imageHeight > pageHeight - margin) {
                  doc.addPage();
                  yPos = margin;
                  imgX = margin;
                }

                // Draw image border
                doc.setDrawColor(...COLORS.primary);
                doc.setLineWidth(0.5);
                doc.roundedRect(imgX - 1, yPos - 1, imageWidth + 2, imageHeight + 2, 2, 2, 'S');

                // Add image with safe format detection
                 const imgFormat = getImageFormatFromDataUrl(optimized);
                try {
                   doc.addImage(optimized, imgFormat, imgX, yPos, imageWidth, imageHeight);
                  embeddedImagesCount += 1;
                } catch (imgErr) {
                  // Try with JPEG as fallback
                  console.warn('Failed to add image with format', imgFormat, ', trying JPEG fallback');
                  try {
                     doc.addImage(optimized, 'JPEG', imgX, yPos, imageWidth, imageHeight);
                    embeddedImagesCount += 1;
                  } catch {
                    console.warn('Image could not be added to PDF');
                  }
                }
                imgX += imageWidth + 5;
              }
            } catch (e) {
              console.warn('Failed to load evidence image:', e);
              // Continue with next image, don't fail the whole export
            }
          } else {
            // PDF indicator
            doc.setFillColor(...COLORS.light);
            doc.roundedRect(imgX, yPos, imageWidth, imageHeight, 2, 2, 'F');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...COLORS.secondary);
            doc.text('PDF File', imgX + imageWidth / 2, yPos + imageHeight / 2, { align: 'center' });
            imgX += imageWidth + 5;
          }
        }

        if (sub.evidence_urls.length > 6) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7);
          doc.setTextColor(107, 114, 128);
          doc.text(`+${sub.evidence_urls.length - 6} file lainnya`, imgX, yPos + imageHeight / 2);
        }

        yPos += imageHeight + 10;
      }

      // Separator line
      doc.setDrawColor(...COLORS.light);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
    }

    // Catatan jika detail dibatasi
    if (needsReduceDetails) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Catatan: demi menjaga ukuran file, halaman detail dibatasi hingga ${LIMITS.maxDetailedSubmissions} laporan.`,
        margin,
        yPos
      );
      yPos += 8;
    }

    // Catatan jika gambar dimatikan/dibatasi
    if (needsReduceImages) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Catatan: demi menjaga ukuran file, gambar bukti tidak disertakan karena jumlah file bukti terlalu banyak.`,
        margin,
        yPos
      );
      yPos += 8;
    }
  };

  // ===== FOOTER (+ WATERMARK) =====
  const addFootersAndWatermark = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      if (opts.includeWatermark) {
        const org = opts.organizationName?.trim();
        addTextWatermark(doc, pageWidth, pageHeight, org && org.length > 0 ? org : 'RAHASIA');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(230, 230, 230);
        doc.text('RAHASIA', pageWidth / 2, pageHeight / 2 + 25, {
          align: 'center',
          angle: 35,
        } as any);
      }

      // Footer line
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

      // Footer text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.secondary);
      doc.text('Dokumen ini bersifat RAHASIA', margin, pageHeight - 10);
      doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
  };

  // ===== GENERATE PDF =====
  try {
    drawHeader();
    drawStatistics();
    drawSummaryTable();

    if (detailedEffective) {
      doc.addPage();
      yPos = margin;

      // Detail section header
      doc.setFillColor(...COLORS.primary);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('DETAIL LAPORAN', pageWidth / 2, 13, { align: 'center' });
      yPos = 30;

      // Info ringkas jika kita melakukan pengurangan beban
      if (needsReduceDetails || needsReduceImages) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.secondary);
        const notes: string[] = [];
        if (needsReduceDetails) notes.push(`Detail dibatasi: max ${LIMITS.maxDetailedSubmissions} laporan`);
        if (needsReduceImages) notes.push('Gambar bukti dinonaktifkan (jumlah terlalu banyak)');
        doc.text(`Catatan export: ${notes.join(' • ')}`, margin, yPos);
        yPos += 8;
      }

      await drawDetailedReports();
    }

    addFootersAndWatermark();

    // Save PDF
    const filename = `WBS_Report_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Gagal membuat PDF. Silakan coba lagi.');
  }
}
