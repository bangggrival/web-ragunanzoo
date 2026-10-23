// ==========================================
// Generic Excel Export Function (Dynamic Loaded)
// ==========================================
export interface ExcelExportOptions {
  fileName: string;
  sheetName?: string;
  data: Record<string, any>[];
  headerMapping?: Record<string, string>; // { originalKey: 'Nama Kolom Cantik' }
}

export async function exportToExcel({
  fileName,
  sheetName = 'Sheet1',
  data,
  headerMapping
}: ExcelExportOptions) {
  if (!data || data.length === 0) {
    throw new Error('Tidak ada data untuk diekspor.');
  }

  // Dynamically import xlsx only when user initiates export (saves ~800KB bundle)
  const XLSX = await import('xlsx');

  // Map keys to friendly Indonesian headers if provided
  const formattedData = data.map((item, index) => {
    const row: Record<string, any> = { 'No': index + 1 };
    
    if (headerMapping) {
      Object.entries(headerMapping).forEach(([key, label]) => {
        row[label] = item[key] !== null && item[key] !== undefined ? item[key] : '-';
      });
    } else {
      Object.entries(item).forEach(([key, val]) => {
        row[key] = val !== null && val !== undefined ? val : '-';
      });
    }
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Auto-size columns width
  const colWidths = Object.keys(formattedData[0] || {}).map(key => {
    const maxLen = Math.max(
      key.length,
      ...formattedData.map(r => String(r[key] || '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const cleanFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, cleanFileName);
}

// ==========================================
// Generic PDF Export Function (Dynamic Loaded)
// ==========================================
export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  fileName: string;
  headers: string[];
  rows: (string | number)[][];
  orientation?: 'portrait' | 'landscape';
}

export async function exportToPdf({
  title,
  subtitle,
  fileName,
  headers,
  rows,
  orientation = 'portrait'
}: PdfExportOptions) {
  if (!rows || rows.length === 0) {
    throw new Error('Tidak ada data untuk diekspor.');
  }

  // Dynamically import jspdf & autotable only when needed (saves ~350KB bundle)
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner / Letterhead
  doc.setFillColor(27, 94, 32); // Emerald dark green #1B5E20
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Title in Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TAMAN MARGASATWA RAGUNAN', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Jl. Harsono RM No.1, Ragunan, Ps. Minggu, Jakarta Selatan • Panel Manajemen', 14, 18);

  // Report Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 34);

  // Subtitle / Metadata
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const sub = subtitle || `Dicetak pada: ${dateStr} WIB • Total Data: ${rows.length} entri`;
  doc.text(sub, 14, 40);

  // AutoTable
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 45,
    theme: 'grid',
    headStyles: {
      fillColor: [27, 94, 32],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14, bottom: 18 },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageCount = (doc.internal as any).getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Halaman ${data.pageNumber} dari ${pageCount} — Dokumen Resmi Panel Pengelola Ragunan Zoo`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    }
  });

  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  doc.save(cleanFileName);
}

// ==========================================
// Helper Specific Exporters
// ==========================================

export async function exportAnimalsData(animals: any[], format: 'excel' | 'pdf') {
  const timestamp = new Date().toISOString().split('T')[0];

  if (format === 'excel') {
    const mapping = {
      name: 'Nama Satwa',
      latin_name: 'Nama Ilmiah (Latin)',
      category: 'Kategori / Kelas',
      species: 'Spesies',
      zone: 'Zona Kandang',
      health_status: 'Status Kesehatan',
      status: 'Status Konservasi',
      habitat: 'Habitat Asal'
    };

    await exportToExcel({
      fileName: `Laporan_Data_Satwa_Ragunan_${timestamp}`,
      sheetName: 'Data Satwa',
      data: animals,
      headerMapping: mapping
    });
  } else {
    const headers = ['No', 'Nama Satwa', 'Nama Latin', 'Kategori', 'Zona', 'Kesehatan', 'Status'];
    const rows = animals.map((a, i) => [
      i + 1,
      a.name || '-',
      a.latin_name || '-',
      a.category || a.species || '-',
      a.zone || '-',
      a.health_status || 'Sehat',
      a.status || 'Aktif'
    ]);

    await exportToPdf({
      title: 'LAPORAN DATA KOLEKSI SATWA (FAUNA)',
      fileName: `Laporan_Data_Satwa_Ragunan_${timestamp}`,
      headers,
      rows,
      orientation: 'landscape'
    });
  }
}

export async function exportPlantsData(plants: any[], format: 'excel' | 'pdf') {
  const timestamp = new Date().toISOString().split('T')[0];

  if (format === 'excel') {
    const mapping = {
      name: 'Nama Tumbuhan',
      latin_name: 'Nama Ilmiah (Latin)',
      category: 'Kategori / Kelompok',
      species: 'Spesies',
      zone: 'Zona Taman',
      status: 'Status Konservasi',
      habitat: 'Habitat Asal / Daerah'
    };

    await exportToExcel({
      fileName: `Laporan_Data_Flora_Ragunan_${timestamp}`,
      sheetName: 'Data Flora',
      data: plants,
      headerMapping: mapping
    });
  } else {
    const headers = ['No', 'Nama Tumbuhan', 'Nama Latin', 'Kategori', 'Zona', 'Status', 'Habitat'];
    const rows = plants.map((p, i) => [
      i + 1,
      p.name || '-',
      p.latin_name || '-',
      p.category || p.species || '-',
      p.zone || p.location || '-',
      p.status || p.health_status || 'Terawat',
      p.habitat || '-'
    ]);

    await exportToPdf({
      title: 'LAPORAN DATA KOLEKSI TUMBUHAN & POHON (FLORA)',
      fileName: `Laporan_Data_Flora_Ragunan_${timestamp}`,
      headers,
      rows,
      orientation: 'landscape'
    });
  }
}

export async function exportServiceRegistrationsData(registrations: any[], format: 'excel' | 'pdf') {
  const timestamp = new Date().toISOString().split('T')[0];

  if (format === 'excel') {
    const mapping = {
      full_name: 'Nama Lengkap',
      institution: 'Universitas / Sekolah',
      program_type: 'Jenis Program (PKL/Riset)',
      email: 'Email',
      phone: 'No. WhatsApp/Telepon',
      start_date: 'Tanggal Mulai',
      end_date: 'Tanggal Selesai',
      status: 'Status Permohonan',
      created_at: 'Waktu Pengajuan'
    };

    await exportToExcel({
      fileName: `Laporan_Permohonan_PKL_Riset_${timestamp}`,
      sheetName: 'Permohonan Layanan',
      data: registrations,
      headerMapping: mapping
    });
  } else {
    const headers = ['No', 'Nama Pemohon', 'Institusi / Kampus', 'Program', 'Mulai', 'Selesai', 'Status', 'Kontak'];
    const rows = registrations.map((r, i) => [
      i + 1,
      r.full_name || r.name || '-',
      r.institution || '-',
      r.program_type || 'PKL/Magang',
      r.start_date || '-',
      r.end_date || '-',
      r.status || 'Pending',
      r.phone || r.email || '-'
    ]);

    await exportToPdf({
      title: 'LAPORAN PENDAFTARAN LAYANAN PKL, MAGANG & RISET',
      fileName: `Laporan_Permohonan_PKL_Riset_${timestamp}`,
      headers,
      rows,
      orientation: 'landscape'
    });
  }
}
