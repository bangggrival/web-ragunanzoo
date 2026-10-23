export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'investigating', label: 'Investigasi' },
  { value: 'resolved', label: 'Selesai' },
  { value: 'dismissed', label: 'Ditolak' },
];

export const WBS_CATEGORIES = [
  { value: 'korupsi', label: 'Korupsi' },
  { value: 'penipuan', label: 'Penipuan' },
  { value: 'pelanggaran_etika', label: 'Pelanggaran Etika' },
  { value: 'penyalahgunaan_wewenang', label: 'Penyalahgunaan Wewenang' },
  { value: 'diskriminasi', label: 'Diskriminasi' },
  { value: 'pelecehan', label: 'Pelecehan' },
  { value: 'keselamatan_kerja', label: 'Keselamatan Kerja' },
  { value: 'lingkungan', label: 'Pelanggaran Lingkungan' },
  { value: 'lainnya', label: 'Lainnya' },
];

// Colors for PDF
export const COLORS = {
  primary: [59, 167, 118] as [number, number, number], // Green
  secondary: [45, 55, 72] as [number, number, number], // Dark gray
  light: [247, 250, 252] as [number, number, number], // Light gray
  white: [255, 255, 255] as [number, number, number],
  pending: [251, 191, 36] as [number, number, number], // Yellow
  investigating: [59, 130, 246] as [number, number, number], // Blue
  resolved: [34, 197, 94] as [number, number, number], // Green
  dismissed: [156, 163, 175] as [number, number, number], // Gray
};

export const getStatusLabel = (status: string) =>
  STATUS_OPTIONS.find((s) => s.value === status)?.label || status;

export const getCategoryLabel = (category: string) =>
  WBS_CATEGORIES.find((c) => c.value === category)?.label || category;

export const getStatusColor = (status: string): [number, number, number] => {
  switch (status) {
    case 'pending':
      return COLORS.pending;
    case 'investigating':
      return COLORS.investigating;
    case 'resolved':
      return COLORS.resolved;
    case 'dismissed':
      return COLORS.dismissed;
    default:
      return COLORS.secondary;
  }
};
