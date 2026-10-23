import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

import type { ServiceRegistration } from '@/hooks/useServiceRegistrations';
import {
  imageToBase64,
  getImageFormatFromDataUrl,
  optimizeImageDataUrl,
} from '@/utils/wbsPdf/pdfHelpers';

// Colors for PDF
const COLORS = {
  primary: [59, 167, 118] as [number, number, number], // Green
  secondary: [45, 55, 72] as [number, number, number], // Dark gray
  light: [247, 250, 252] as [number, number, number], // Light gray
  white: [255, 255, 255] as [number, number, number],
  pending: [251, 191, 36] as [number, number, number], // Yellow
  reviewing: [59, 130, 246] as [number, number, number], // Blue
  approved: [34, 197, 94] as [number, number, number], // Green
  rejected: [239, 68, 68] as [number, number, number], // Red
  completed: [139, 92, 246] as [number, number, number], // Purple
};

const STATUS_CONFIG = {
  pending: { label: 'Menunggu', color: COLORS.pending },
  reviewing: { label: 'Ditinjau', color: COLORS.reviewing },
  approved: { label: 'Disetujui', color: COLORS.approved },
  rejected: { label: 'Ditolak', color: COLORS.rejected },
  completed: { label: 'Selesai', color: COLORS.completed },
};

const getStatusLabel = (status: string) => 
  STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status;

const getStatusColor = (status: string): [number, number, number] => 
  STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || COLORS.secondary;

export interface ServicePdfExportOptions {
  includeLogo?: boolean;
  logoUrl?: string;
  organizationName?: string;
  dateRange?: { start: Date; end: Date };
  detailed?: boolean;
}

export async function exportServiceRegistrationsToPDF(
  registrations: ServiceRegistration[],
  options: ServicePdfExportOptions = {}
): Promise<void> {
  if (!registrations || registrations.length === 0) {
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
    includeLogo: options.includeLogo ?? true,
    logoUrl: options.logoUrl,
    organizationName: options.organizationName,
    dateRange: options.dateRange,
    detailed: options.detailed ?? true,
  };

  // Try to load logo
  let logoBase64: string | null = null;
  let logoAspectRatio = 1;
  let logoIsPng = false;
  
  if (opts.includeLogo && opts.logoUrl) {
    try {
      const raw = await imageToBase64(opts.logoUrl);
      if (raw) {
        logoIsPng = raw.includes('image/png');
        
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

        logoBase64 = await optimizeImageDataUrl(raw, {
          maxWidth: 300,
          maxHeight: 300,
          quality: 0.9,
          mimeType: logoIsPng ? 'image/png' : 'image/jpeg',
        });
      }
    } catch (error) {
      console.warn('Failed to load logo:', error);
    }
  }

  // ===== HEADER SECTION =====
  const drawHeader = () => {
    const headerHeight = 42;
    
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    
    doc.setFillColor(0, 0, 0);
    doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
    doc.rect(0, headerHeight - 5, pageWidth, 5, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    let logoAreaWidth = 0;
    let finalLogoWidth = 0;
    let finalLogoHeight = 0;
    
    if (logoBase64) {
      const targetLogoHeight = 18;
      const calculatedWidth = targetLogoHeight * logoAspectRatio;
      const maxLogoWidth = 40;
      finalLogoWidth = Math.min(calculatedWidth, maxLogoWidth);
      finalLogoHeight = finalLogoWidth / logoAspectRatio;
      logoAreaWidth = finalLogoWidth + 8;
    }

    const contentCenterX = logoBase64 
      ? margin + logoAreaWidth + (pageWidth - margin * 2 - logoAreaWidth) / 2
      : pageWidth / 2;

    if (logoBase64) {
      try {
        const imgFormat = getImageFormatFromDataUrl(logoBase64);
        const logoX = margin + 3;
        const logoY = (headerHeight - finalLogoHeight) / 2;
        
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
        
        doc.addImage(logoBase64, imgFormat, logoX, logoY, finalLogoWidth, finalLogoHeight);
      } catch {
        // ignore logo errors
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('LAPORAN PENDAFTARAN PKL & PENELITIAN', contentCenterX, 15, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Praktek Kerja Lapangan & Penelitian', contentCenterX, 23, { align: 'center' });

    if (opts.organizationName) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(opts.organizationName, contentCenterX, 30, { align: 'center' });
    }

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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.secondary);
    doc.text('Ringkasan Statistik', margin, yPos);
    
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.8);
    doc.line(margin, yPos + 2, margin + 45, yPos + 2);
    yPos += 12;

    const stats = {
      total: registrations.length,
      pending: registrations.filter((r) => r.status === 'pending').length,
      approved: registrations.filter((r) => r.status === 'approved').length,
      pkl: registrations.filter((r) => r.program_type === 'pkl').length,
      research: registrations.filter((r) => r.program_type === 'research').length,
    };

    const boxWidth = (pageWidth - margin * 2 - 20) / 5;
    const boxHeight = 24;
    let boxX = margin;

    const statItems = [
      { label: 'Total', value: stats.total, color: COLORS.primary },
      { label: 'Menunggu', value: stats.pending, color: COLORS.pending },
      { label: 'Disetujui', value: stats.approved, color: COLORS.approved },
      { label: 'PKL', value: stats.pkl, color: COLORS.reviewing },
      { label: 'Penelitian', value: stats.research, color: COLORS.completed },
    ];

    statItems.forEach((item) => {
      doc.setFillColor(230, 230, 230);
      doc.roundedRect(boxX + 0.5, yPos + 0.5, boxWidth, boxHeight, 3, 3, 'F');
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.3);
      doc.roundedRect(boxX, yPos, boxWidth, boxHeight, 3, 3, 'FD');

      doc.setFillColor(...item.color);
      doc.roundedRect(boxX, yPos, boxWidth, 3, 3, 3, 'F');
      doc.rect(boxX, yPos + 1.5, boxWidth, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...item.color);
      doc.text(item.value.toString(), boxX + boxWidth / 2, yPos + 13, { align: 'center' });

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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.secondary);
    doc.text('Daftar Pendaftaran', margin, yPos);
    
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.8);
    doc.line(margin, yPos + 2, margin + 42, yPos + 2);
    yPos += 10;

    const tableData = registrations.map((reg, index) => [
      (index + 1).toString(),
      reg.tracking_code,
      reg.program_type === 'pkl' ? 'PKL' : 'Penelitian',
      reg.participant_name,
      reg.institution_name.length > 25 ? `${reg.institution_name.substring(0, 25)}...` : reg.institution_name,
      `${format(new Date(reg.start_date), 'dd/MM/yy')} - ${format(new Date(reg.end_date), 'dd/MM/yy')}`,
      '', // Status will be drawn as badge
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Kode Tracking', 'Program', 'Nama Peserta', 'Institusi', 'Periode', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
        cellPadding: 3,
        lineWidth: 0.1,
        lineColor: [255, 255, 255],
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 3,
        lineWidth: 0.1,
        lineColor: [220, 220, 220],
        valign: 'middle',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8, fontStyle: 'bold' },
        1: { halign: 'center', cellWidth: 28 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 30, halign: 'left' },
        4: { cellWidth: 35, halign: 'left' },
        5: { cellWidth: 28, halign: 'center' },
        6: { halign: 'center', cellWidth: 20 },
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
        if (data.column.index === 6 && data.section === 'body') {
          const status = registrations[data.row.index]?.status;
          if (status) {
            const color = getStatusColor(status);
            const badgeWidth = data.cell.width - 4;
            const badgeHeight = 5;
            const badgeX = data.cell.x + 2;
            const badgeY = data.cell.y + (data.cell.height - badgeHeight) / 2;
            
            doc.setFillColor(...color);
            doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(6);
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
  };

  // ===== DETAILED REPORTS =====
  const drawDetailedReports = () => {
    for (let i = 0; i < registrations.length; i++) {
      const reg = registrations[i];

      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = margin;
      }

      const statusColor = getStatusColor(reg.status);
      doc.setFillColor(...statusColor);
      doc.rect(margin, yPos, pageWidth - margin * 2, 3, 'F');

      doc.setFillColor(...COLORS.light);
      doc.rect(margin, yPos + 3, pageWidth - margin * 2, 18, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.secondary);
      doc.text(`${reg.tracking_code}`, margin + 5, yPos + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(reg.program_type === 'pkl' ? 'Praktek Kerja Lapangan' : 'Penelitian', margin + 5, yPos + 17);

      // Status badge
      doc.setFillColor(...statusColor);
      const statusText = getStatusLabel(reg.status);
      const statusWidth = doc.getTextWidth(statusText) + 10;
      doc.roundedRect(pageWidth - margin - statusWidth - 5, yPos + 8, statusWidth, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text(statusText, pageWidth - margin - statusWidth / 2 - 5, yPos + 13, { align: 'center' });

      yPos += 26;

      const leftColX = margin + 5;
      const rightColX = pageWidth / 2 + 5;
      const labelColor: [number, number, number] = [107, 114, 128];
      const valueColor = COLORS.secondary;

      // Left column - Participant info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.primary);
      doc.text('DATA PESERTA', leftColX, yPos);
      yPos += 5;

      const participantInfo: Array<[string, string]> = [
        ['Nama', reg.participant_name],
        ['NIM/NIS', reg.participant_nim || '-'],
        ['Email', reg.participant_email],
        ['Telepon', reg.participant_phone],
        ['Prodi', reg.study_program || '-'],
      ];

      let leftY = yPos;
      participantInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...labelColor);
        doc.text(`${label}:`, leftColX, leftY);
        doc.setTextColor(...valueColor);
        const displayValue = value.length > 30 ? value.substring(0, 30) + '...' : value;
        doc.text(displayValue, leftColX + 18, leftY);
        leftY += 4;
      });

      // Right column - Institution info
      let rightY = yPos - 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.primary);
      doc.text('DATA INSTITUSI', rightColX, rightY);
      rightY += 5;

      const institutionInfo: Array<[string, string]> = [
        ['Institusi', reg.institution_name],
        ['Alamat', reg.institution_address || '-'],
        ['Telepon', reg.institution_phone || '-'],
        ['Email', reg.institution_email || '-'],
      ];

      institutionInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...labelColor);
        doc.text(`${label}:`, rightColX, rightY);
        doc.setTextColor(...valueColor);
        const displayValue = value.length > 30 ? value.substring(0, 30) + '...' : value;
        doc.text(displayValue, rightColX + 18, rightY);
        rightY += 4;
      });

      yPos = Math.max(leftY, rightY) + 3;

      // Period info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.primary);
      doc.text('PERIODE KEGIATAN', leftColX, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...labelColor);
      doc.text('Tanggal:', leftColX, yPos);
      doc.setTextColor(...valueColor);
      doc.text(
        `${format(new Date(reg.start_date), 'dd MMMM yyyy', { locale: localeId })} - ${format(new Date(reg.end_date), 'dd MMMM yyyy', { locale: localeId })}`,
        leftColX + 18, yPos
      );
      yPos += 4;

      if (reg.research_title) {
        doc.setTextColor(...labelColor);
        doc.text('Judul:', leftColX, yPos);
        doc.setTextColor(...valueColor);
        const titleLines = doc.splitTextToSize(reg.research_title, pageWidth - margin * 2 - leftColX - 18);
        doc.text(titleLines, leftColX + 18, yPos);
        yPos += titleLines.length * 4;
      }

      if (reg.admin_notes) {
        yPos += 2;
        doc.setTextColor(...labelColor);
        doc.text('Catatan Admin:', leftColX, yPos);
        doc.setTextColor(...valueColor);
        const notesLines = doc.splitTextToSize(reg.admin_notes, pageWidth - margin * 2 - leftColX);
        doc.text(notesLines, leftColX, yPos + 4);
        yPos += 4 + notesLines.length * 4;
      }

      yPos += 10;

      // Separator line
      if (i < registrations.length - 1) {
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
      }
    }
  };

  // ===== FOOTER =====
  const addFooters = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Laporan Pendaftaran PKL & Penelitian - ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}`,
        margin,
        pageHeight - 10
      );
    }
  };

  // Execute all sections
  drawHeader();
  drawStatistics();
  drawSummaryTable();
  
  if (opts.detailed) {
    drawDetailedReports();
  }
  
  addFooters();

  // Save PDF
  const fileName = `Laporan_Pendaftaran_PKL_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`;
  doc.save(fileName);
}
