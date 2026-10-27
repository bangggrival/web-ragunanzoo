import { AppIcon } from '@/components/ui/AppIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PlantPageHeaderProps {
  onAdd: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onBulkQR: () => void;
}

export default function PlantPageHeader({ 
  onAdd,
  onExportExcel,
  onExportPdf,
  onBulkQR
}: PlantPageHeaderProps) {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <AppIcon name="fluent-emoji-flat:herb" className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-manager-foreground">
            {language === 'en' ? 'Plant Data (Flora)' : 'Data Koleksi Flora'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === 'en' 
              ? 'Manage botanical and plant collection data at Ragunan Zoo' 
              : 'Kelola data botani dan koleksi tumbuhan di Taman Margasatwa Ragunan'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold shadow-2xs btn-interactive text-xs sm:text-sm"
            >
              <AppIcon name="solar:download-bold" className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Laporan</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl">
            <DropdownMenuItem 
              onClick={onExportExcel}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer"
            >
              <AppIcon name="solar:table-bold-duotone" className="w-4 h-4 text-emerald-600" />
              <span>Ekspor ke Excel (.xlsx)</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onExportPdf}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer"
            >
              <AppIcon name="solar:document-text-bold-duotone" className="w-4 h-4 text-rose-600" />
              <span>Cetak Dokumen PDF (.pdf)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Bulk QR Print */}
        <button 
          onClick={onBulkQR}
          className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold shadow-2xs btn-interactive text-xs sm:text-sm"
        >
          <AppIcon name="solar:printer-bold-duotone" className="w-4 h-4 text-slate-500" />
          <span>Cetak QR Massal</span>
        </button>

        {/* Add Plant Button */}
        <button 
          onClick={onAdd} 
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 transition-all shadow-md shadow-emerald-500/20 btn-interactive"
        >
          <AppIcon name="solar:add-circle-bold" className="w-4 h-4" />
          {language === 'en' ? 'Add Plant' : 'Tambah Tumbuhan'}
        </button>
      </div>
    </div>
  );
}
