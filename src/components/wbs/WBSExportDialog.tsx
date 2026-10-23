import { useState, useMemo } from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, isAfter, isBefore } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { CalendarIcon, FileText, Image, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { exportWBSToPDF, ExportOptions } from '@/utils/wbsPdfExport';
import { WBSSubmission } from '@/hooks/useWBSSubmissions';
import { toast } from 'sonner';

interface WBSExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissions: WBSSubmission[];
}

type DatePreset = 'all' | '7days' | '30days' | 'this_month' | 'last_month' | 'this_year' | 'custom';

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'all', label: 'Semua Waktu' },
  { value: '7days', label: '7 Hari Terakhir' },
  { value: '30days', label: '30 Hari Terakhir' },
  { value: 'this_month', label: 'Bulan Ini' },
  { value: 'last_month', label: 'Bulan Lalu' },
  { value: 'this_year', label: 'Tahun Ini' },
  { value: 'custom', label: 'Rentang Kustom' },
];

export function WBSExportDialog({ open, onOpenChange, submissions }: WBSExportDialogProps) {
  const { settings } = useSiteSettings();
  
  // Export options state
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Compute date range based on preset
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (datePreset) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case 'this_month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last_month': {
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      }
      case 'this_year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        if (startDate && endDate) {
          return { start: startDate, end: endDate };
        }
        return null;
      case 'all':
      default:
        return null;
    }
  }, [datePreset, startDate, endDate]);

  // Filter submissions by date range
  const filteredSubmissions = useMemo(() => {
    if (!dateRange) return submissions;
    
    return submissions.filter((sub) => {
      const createdAt = new Date(sub.created_at);
      return !isBefore(createdAt, dateRange.start) && !isAfter(createdAt, dateRange.end);
    });
  }, [submissions, dateRange]);

  const handleExport = async () => {
    if (filteredSubmissions.length === 0) {
      toast.error('Tidak ada data untuk di-export pada rentang waktu yang dipilih');
      return;
    }

    setIsExporting(true);
    try {
      const options: ExportOptions = {
        includeImages,
        detailed: includeDetails,
        includeLogo,
        includeWatermark,
        logoUrl: includeLogo ? settings?.logo_url || undefined : undefined,
        organizationName: settings?.site_name || undefined,
        dateRange: dateRange || undefined,
      };

      await exportWBSToPDF(filteredSubmissions, options);
      toast.success(`PDF berhasil di-export (${filteredSubmissions.length} laporan)`);
      onOpenChange(false);
    } catch (error) {
      console.error('Export PDF error:', error);
      toast.error('Gagal mengexport PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const isCustomDateValid = datePreset !== 'custom' || (startDate && endDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export PDF Laporan WBS
          </DialogTitle>
          <DialogDescription>
            Pilih rentang waktu dan opsi export untuk laporan PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Date Range Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Rentang Waktu</Label>
            <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih rentang waktu" />
              </SelectTrigger>
              <SelectContent>
                {DATE_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Custom Date Range Pickers */}
            {datePreset === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Dari Tanggal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'dd MMM yyyy', { locale: localeId }) : 'Pilih'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) => (endDate ? isAfter(date, endDate) : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Sampai Tanggal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'dd MMM yyyy', { locale: localeId }) : 'Pilih'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => (startDate ? isBefore(date, startDate) : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Date Range Preview */}
            {dateRange && (
              <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                Periode: {format(dateRange.start, 'dd MMMM yyyy', { locale: localeId })} -{' '}
                {format(dateRange.end, 'dd MMMM yyyy', { locale: localeId })}
                <span className="ml-2 font-medium">({filteredSubmissions.length} laporan)</span>
              </p>
            )}
            {!dateRange && datePreset === 'all' && (
              <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                Semua laporan akan di-export ({submissions.length} laporan)
              </p>
            )}
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Opsi Export</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="includeDetails"
                  checked={includeDetails}
                  onCheckedChange={(checked) => setIncludeDetails(checked === true)}
                />
                <label htmlFor="includeDetails" className="text-sm cursor-pointer flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Sertakan halaman detail lengkap
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="includeImages"
                  checked={includeImages}
                  onCheckedChange={(checked) => setIncludeImages(checked === true)}
                />
                <label htmlFor="includeImages" className="text-sm cursor-pointer flex items-center gap-2">
                  <Image className="w-4 h-4 text-muted-foreground" />
                  Sertakan gambar bukti
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="includeLogo"
                  checked={includeLogo}
                  onCheckedChange={(checked) => setIncludeLogo(checked === true)}
                  disabled={!settings?.logo_url}
                />
                <label 
                  htmlFor="includeLogo" 
                  className={cn(
                    "text-sm cursor-pointer flex items-center gap-2",
                    !settings?.logo_url && "text-muted-foreground"
                  )}
                >
                  Logo organisasi di header
                  {!settings?.logo_url && <span className="text-xs">(belum dikonfigurasi)</span>}
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="includeWatermark"
                  checked={includeWatermark}
                  onCheckedChange={(checked) => setIncludeWatermark(checked === true)}
                />
                <label htmlFor="includeWatermark" className="text-sm cursor-pointer flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  Watermark "RAHASIA" di setiap halaman
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Batal
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || !isCustomDateValid || filteredSubmissions.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengexport...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
