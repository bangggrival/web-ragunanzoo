import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { ServiceRegistration } from '@/hooks/useServiceRegistrations';

export interface DispositionPdfOptions {
  organizationName?: string;
  supervisorName?: string;
  supervisorTitle?: string;
}

export function generateServiceDispositionPdf(
  registration: ServiceRegistration,
  options: DispositionPdfOptions = {}
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Kop Surat Resmi Pemprov DKI / Ragunan Zoo
  doc.setFillColor(27, 94, 32); // Emerald Green
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PEMERINTAH PROVINSI DKI JAKARTA', pageWidth / 2, 10, { align: 'center' });

  doc.setFontSize(11);
  doc.text('UNIT PENGELOLA TAMAN MARGASATWA RAGUNAN', pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Jl. Harsono RM No. 1, Ragunan, Pasar Minggu, Jakarta Selatan 12550 • Telp: (021) 7800065', pageWidth / 2, 22, { align: 'center' });

  // Gold accent separator bar
  doc.setFillColor(217, 119, 6); // Amber gold
  doc.rect(0, 28, pageWidth, 2, 'F');

  // 2. Title Document
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('LEMBAR DISPOSISI & BUKTI PENDAFTARAN LAYANAN', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Nomor Registrasi: ${registration.tracking_code}`, pageWidth / 2, 46, { align: 'center' });

  // 3. Status Badge Box
  let statusText = 'MENUNGGU VERIFIKASI';
  let statusFill = [254, 243, 199]; // Amber light
  let statusTextCol = [146, 64, 14]; // Amber dark

  if (registration.status === 'approved') {
    statusText = 'PERMOHONAN DISETUJUI / DITERIMA';
    statusFill = [220, 252, 231];
    statusTextCol = [22, 101, 52];
  } else if (registration.status === 'reviewing') {
    statusText = 'SEDANG DALAM PENINJAUAN BERKAS';
    statusFill = [219, 234, 254];
    statusTextCol = [30, 64, 175];
  } else if (registration.status === 'rejected') {
    statusText = 'PERMOHONAN DITOLAK / TIDAK DAPAT DITERIMA';
    statusFill = [254, 226, 226];
    statusTextCol = [153, 27, 27];
  } else if (registration.status === 'completed') {
    statusText = 'PROGRAM SELESAI';
    statusFill = [243, 232, 255];
    statusTextCol = [107, 33, 168];
  }

  doc.setFillColor(statusFill[0], statusFill[1], statusFill[2]);
  doc.roundedRect(14, 52, pageWidth - 28, 10, 2, 2, 'F');
  doc.setTextColor(statusTextCol[0], statusTextCol[1], statusTextCol[2]);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`STATUS: ${statusText}`, pageWidth / 2, 58.5, { align: 'center' });

  // 4. Data Pemohon Table
  const programLabel = registration.program_type === 'pkl' 
    ? 'Praktik Kerja Lapangan (PKL) / Magang' 
    : registration.program_type === 'research' 
    ? 'Penelitian Ilmiah / Skripsi' 
    : registration.program_type === 'koas' 
    ? 'Koasistensi Dokter Hewan' 
    : 'Wawancara / Liputan';

  const startDateFormatted = registration.start_date 
    ? format(new Date(registration.start_date), 'dd MMMM yyyy', { locale: localeId }) 
    : '-';
  const endDateFormatted = registration.end_date 
    ? format(new Date(registration.end_date), 'dd MMMM yyyy', { locale: localeId }) 
    : '-';

  autoTable(doc, {
    startY: 67,
    head: [['I. INFORMASI IDENTITAS PEMOHON', '']],
    body: [
      ['Nama Lengkap Peserta', `: ${registration.participant_name}`],
      ['Nomor Induk (NIM / NIS)', `: ${registration.participant_nim || '-'}`],
      ['Asal Institusi / Universitas', `: ${registration.institution_name}`],
      ['Program Studi / Jurusan', `: ${registration.study_program || '-'}`],
      ['Email Pemohon', `: ${registration.participant_email}`],
      ['No. WhatsApp / Telepon', `: ${registration.participant_phone}`],
      ['Jenis Permohonan Program', `: ${programLabel}`],
      ['Rencana Periode Pelaksanaan', `: ${startDateFormatted} s/d ${endDateFormatted}`],
      ['Judul / Fokus Penelitian (jika ada)', `: ${registration.research_title || '-'}`],
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'bold', textColor: [71, 85, 105] },
      1: { cellWidth: pageWidth - 28 - 65 }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY1 = (doc as any).lastAutoTable.finalY || 135;

  // 5. Catatan Disposisi & Instruksi Pelaksanaan
  autoTable(doc, {
    startY: finalY1 + 5,
    head: [['II. CATATAN DISPOSISI & KETENTUAN PENGELOLA', '']],
    body: [
      ['Catatan / Rekomendasi Pengelola', `: ${registration.admin_notes || 'Menunggu verifikasi berkas lengkap.'}`],
      ['Instruksi Masuk & Tata Tertib', ': Peserta wajib mengenakan pakaian rapi, bersepatu tertutup, membawa tanda pengenal, serta mematuhi protokol konservasi satwa selama beraktivitas di area Ragunan Zoo.'],
      ['Kontak Bantuan & Informasi', ': Subbagian Tata Usaha & Pendidikan Konservasi (021-7800065) • email: ragunanzoo@jakarta.go.id']
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'bold', textColor: [71, 85, 105] },
      1: { cellWidth: pageWidth - 28 - 65 }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY2 = (doc as any).lastAutoTable.finalY || 190;

  // 6. Signature Area
  const nowStr = format(new Date(), 'dd MMMM yyyy', { locale: localeId });
  const sigY = Math.min(finalY2 + 10, pageHeight - 50);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  doc.text(`Jakarta, ${nowStr}`, pageWidth - 70, sigY);
  doc.text('a.n. Kepala Unit Pengelola TM Ragunan', pageWidth - 70, sigY + 5);
  doc.text('Sub Bagian Pendidikan & Konservasi,', pageWidth - 70, sigY + 9);

  // Official Signature Placeholder
  doc.setFont('helvetica', 'bold');
  doc.text(options.supervisorName || 'Pengelola Layanan Terpadu', pageWidth - 70, sigY + 30);
  doc.setFont('helvetica', 'normal');
  doc.text(options.supervisorTitle || 'NIP. 198504122010011005', pageWidth - 70, sigY + 34);

  // 7. Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Dokumen resmi ini digenerate otomatis oleh Sistem Informasi Layanan Terpadu Ragunan Zoo pada ${format(new Date(), 'dd/MM/yyyy HH:mm')} WIB`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  const cleanFileName = `Surat_Disposisi_${registration.tracking_code}_${registration.participant_name.replace(/\s+/g, '_')}.pdf`;
  doc.save(cleanFileName);
}

// ==========================================
// WhatsApp Message Link Generator
// ==========================================
export function generateWhatsAppMessageUrl(
  phoneNumber: string,
  registration: ServiceRegistration
): string {
  // Clean phone number (convert 08... or 62... to standard 62...)
  let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }

  const programName = registration.program_type === 'pkl' 
    ? 'Praktik Kerja Lapangan (PKL)' 
    : registration.program_type === 'research' 
    ? 'Penelitian / Riset' 
    : registration.program_type === 'koas' 
    ? 'Koasistensi Dokter Hewan' 
    : 'Layanan Pendidikan';

  let message = '';

  switch (registration.status) {
    case 'approved':
      message = `Halo ${registration.participant_name},\n\n` +
        `Selamat! Permohonan *${programName}* Anda di *Taman Margasatwa Ragunan* dengan Kode Registrasi *#${registration.tracking_code}* telah *DISETUJUI*.\n\n` +
        `📅 Tanggal Pelaksanaan: ${registration.start_date || '-'} s/d ${registration.end_date || '-'}\n` +
        `📝 Catatan: ${registration.admin_notes || 'Silakan hadir pada hari pertama dengan membawa berkas surat pengantar asli dan fotokopi KTP/Kartu Mahasiswa.'}\n\n` +
        `Terima kasih.\n_Pengelola Taman Margasatwa Ragunan_`;
      break;

    case 'reviewing':
      message = `Halo ${registration.participant_name},\n\n` +
        `Berkas permohonan *${programName}* Anda di *Taman Margasatwa Ragunan* (Kode: *#${registration.tracking_code}*) saat ini *SEDANG DITINJAU* oleh tim evaluasi.\n\n` +
        `Mohon menunggu konfirmasi persetujuan lebih lanjut.\n\n` +
        `_Pengelola Taman Margasatwa Ragunan_`;
      break;

    case 'rejected':
      message = `Halo ${registration.participant_name},\n\n` +
        `Terima kasih atas minat Anda mengajukan permohonan *${programName}* di *Taman Margasatwa Ragunan* (Kode: *#${registration.tracking_code}*).\n\n` +
        `Mohon maaf, permohonan Anda *belum dapat disetujui* saat ini karena alasan berikut:\n` +
        `"${registration.admin_notes || 'Kuota peserta untuk periode yang diajukan telah penuh.'}"\n\n` +
        `_Pengelola Taman Margasatwa Ragunan_`;
      break;

    case 'completed':
      message = `Halo ${registration.participant_name},\n\n` +
        `Program *${programName}* Anda di *Taman Margasatwa Ragunan* telah *SELESAI*.\n\n` +
        `Terima kasih banyak atas dedikasi dan kontribusi Anda selama berkegiatan di Ragunan Zoo. Sukses selalu untuk studi/karier Anda ke depan!\n\n` +
        `_Pengelola Taman Margasatwa Ragunan_`;
      break;

    default:
      message = `Halo ${registration.participant_name},\n\n` +
        `Permohonan *${programName}* Anda (Kode: *#${registration.tracking_code}*) telah terdaftar di sistem kami dan sedang menunggu giliran verifikasi berkas.\n\n` +
        `_Pengelola Taman Margasatwa Ragunan_`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
