export type DateRange = {
  start: Date;
  end: Date;
};

export interface ExportOptions {
  detailed: boolean;
  includeImages: boolean;

  includeWatermark?: boolean;
  includeLogo?: boolean;
  /** URL logo organisasi (biasanya dari pengaturan branding). */
  logoUrl?: string;
  /** Nama organisasi untuk watermark/header. */
  organizationName?: string;
  /** Jika ada, akan ditampilkan pada header sebagai periode laporan. */
  dateRange?: DateRange;
}
