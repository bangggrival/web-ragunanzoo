import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceStandard {
  id: string;
  service_name_id: string;
  service_name_en: string | null;
  requirements_id: string | null;
  requirements_en: string | null;
  procedure_id: string | null;
  procedure_en: string | null;
  duration: string | null;
  cost: string | null;
  complaint_mechanism_id: string | null;
  complaint_mechanism_en: string | null;
  icon: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const MOCK_SERVICE_STANDARDS: ServiceStandard[] = [
  {
    id: 'c56a4180-65aa-42ec-a945-5f21edd00001',
    service_name_id: 'Layanan Praktik Kerja Lapangan (PKL) & Magang',
    service_name_en: 'Field Work Practice (PKL) & Internship Services',
    requirements_id: '- Surat Pengantar Resmi dari Sekolah/Perguruan Tinggi\n- Proposal Kegiatan PKL/Magang\n- Pas Foto 3x4 (2 Lembar)\n- Fotokopi Kartu Pelajar/Mahasiswa (KTP/KTM)',
    requirements_en: '- Official Cover Letter from School/University\n- Internship/PKL Proposal\n- 3x4 Photograph (2 copies)\n- Student ID Card Copy',
    procedure_id: '- Mengajukan permohonan melalui portal layanan online\n- Verifikasi berkas oleh Tim Diklit TMR (maks 3 hari kerja)\n- Penerbitan Surat Persetujuan & Penjadwalan\n- Pembekalan tata tertib & pelaksanaan kegiatan',
    procedure_en: '- Submit application via online service portal\n- File verification by TMR Education Team (max 3 working days)\n- Issuance of Approval Letter & Scheduling\n- Orientation & program execution',
    duration: '1 - 3 Bulan',
    cost: 'Gratis (Sesuai Ketentuan Pergub)',
    complaint_mechanism_id: 'Melalui email pengaduan humas.ragunan@jakarta.go.id atau WhatsApp Layanan Informasi TMR.',
    complaint_mechanism_en: 'Via email humas.ragunan@jakarta.go.id or TMR Information WhatsApp Service.',
    icon: 'GraduationCap',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c56a4180-65aa-42ec-a945-5f21edd00002',
    service_name_id: 'Layanan Penelitian Karya Tulis / Skripsi / Tesis',
    service_name_en: 'Academic Research & Thesis Services',
    requirements_id: '- Surat Permohonan Izin Penelitian dari Kampus\n- Proposal Penelitian Lengkap (Judul, Metodologi, Jadwal)\n- Surat Pernyataan Menyerahkan Hasil Penelitian\n- Fotokopi KTM & KTP Peneliti',
    requirements_en: '- Official Research Permit Letter from University\n- Complete Research Proposal\n- Statement Letter of Research Results Submission\n- Copy of Student & Citizen ID',
    procedure_id: '- Mengisi formulir penelitian di portal layanan\n- Review kelayakan metodologi & etika satwa oleh Tim Ahli\n- Penandatanganan Komitmen Etika Satwa\n- Pelaksanaan penelitian di lapangan',
    procedure_en: '- Complete research form on service portal\n- Methodology & animal ethics review by Expert Team\n- Signing Animal Ethics Commitment\n- Field research execution',
    duration: 'Sesuai Proposal (Maks 6 Bulan)',
    cost: 'Gratis / Sesuai Retribusi Daerah',
    complaint_mechanism_id: 'Melalui Pengaduan Resmi UP TMR atau Layanan Informasi Online.',
    complaint_mechanism_en: 'Via Official TMR Complaint Desk or Online Information Center.',
    icon: 'FlaskConical',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c56a4180-65aa-42ec-a945-5f21edd00003',
    service_name_id: 'Layanan Dokter Hewan Praktik (KOAS)',
    service_name_en: 'Veterinary Co-Assistance (KOAS) Services',
    requirements_id: '- Surat Rekomendasi Fakultas Kedokteran Hewan (FKH)\n- Jadwal Rotasi Klinis Kedokteran Hewan\n- Asuransi Kesehatan & Sertifikat Vaksinasi\n- Pas Foto Formal Background Merah',
    requirements_en: '- Recommendation Letter from Faculty of Veterinary Medicine\n- Clinical Rotation Schedule\n- Health Insurance & Vaccination Certificate\n- Formal Photo Red Background',
    procedure_id: '- Pengajuan berkas KOAS via portal layanan online\n- Konfirmasi kuota dokter hewan pendamping\n- Penyerahan SK Rotasi dan Pengenalan Rumah Sakit Hewan TMR',
    procedure_en: '- Submission of KOAS files via online service portal\n- Confirmation of supervising vet quota\n- Rotation Assignment & TMR Veterinary Hospital Orientation',
    duration: '2 - 4 Minggu per Stase',
    cost: 'Sesuai Ketentuan Retribusi FKH',
    complaint_mechanism_id: 'Kontak Langsung Koordinator Pendidikan Dokter Hewan TMR.',
    complaint_mechanism_en: 'Direct contact with TMR Veterinary Education Coordinator.',
    icon: 'Stethoscope',
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c56a4180-65aa-42ec-a945-5f21edd00004',
    service_name_id: 'Layanan Wawancara, Liputan & Peliputan Media',
    service_name_en: 'Interview, Media Coverage & Filming Services',
    requirements_id: '- Surat Tugas Liputan dari Redaksi Media / Kampus\n- Daftar Pertanyaan Wawancara / Brief Concept Note\n- Daftar Peralatan Kamera / Video yang Digunakan\n- ID Card Pers / Kartu Identitas Peliput',
    requirements_en: '- Media Assignment Letter from Editorial/University\n- List of Interview Questions / Concept Note\n- List of Camera/Video Equipment Used\n- Press ID / Reporter Identification Card',
    procedure_id: '- Pengajuan izin liputan minimal H-3 kegiatan\n- Penjadwalan waktu narasumber pengelola / dokter hewan\n- Penerbitan Pass Liputan Media dan pendampingan di lapangan',
    procedure_en: '- Submit coverage permit at least H-3 before activity\n- Scheduling session with management / vet speaker\n- Issuance of Media Pass and field escorting',
    duration: '1 - 2 Hari Kerja',
    cost: 'Bebas Biaya untuk Liputan Berita / Edukasi',
    complaint_mechanism_id: 'Hubungi Unit Subbagian Humas TMR via WhatsApp / Email.',
    complaint_mechanism_en: 'Contact TMR Public Relations Sub-division via WhatsApp / Email.',
    icon: 'Mic',
    order_index: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export function useServiceStandards() {
  return useQuery({
    queryKey: ['service-standards'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('service_standards')
          .select('*')
          .order('order_index', { ascending: true });

        if (error || !data) {
          return [];
        }
        return data as ServiceStandard[];
      } catch (err) {
        return [];
      }
    },
  });
}

export function useManageServiceStandards() {
  const queryClient = useQueryClient();

  const createStandard = useMutation({
    mutationFn: async (standard: Omit<ServiceStandard, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('service_standards')
        .insert(standard)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-standards'] });
    },
  });

  const updateStandard = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceStandard> & { id: string }) => {
      const { data, error } = await supabase
        .from('service_standards')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-standards'] });
    },
  });

  const deleteStandard = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_standards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-standards'] });
    },
  });

  return { createStandard, updateStandard, deleteStandard };
}
