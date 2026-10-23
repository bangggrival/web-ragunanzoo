"use client";

import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, QrCode, Check, Download, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export interface QRPrintItem {
  id: number | string;
  name: string;
  subName?: string | null; // e.g. latin name
  categoryOrZone?: string | null;
  qrUrl: string;
  typeLabel?: string; // e.g. "SATWA RAGUNAN" or "FLORA RAGUNAN"
}

interface UniversalBulkQRPrintModalProps {
  title: string;
  items: QRPrintItem[];
  defaultSelectedIds?: (number | string)[];
  onClose: () => void;
}

export default function UniversalBulkQRPrintModal({
  title,
  items,
  defaultSelectedIds,
  onClose
}: UniversalBulkQRPrintModalProps) {
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>(
    defaultSelectedIds && defaultSelectedIds.length > 0 
      ? defaultSelectedIds 
      : items.map(i => i.id)
  );

  const printRef = useRef<HTMLDivElement>(null);

  const selectedItems = items.filter(item => selectedIds.includes(item.id));

  const toggleSelect = (id: number | string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  const handlePrint = () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih minimal 1 item untuk dicetak.');
      return;
    }

    const printWindow = window.open('', '', 'height=850,width=1200');
    if (!printWindow) {
      toast.error('Pop-up terblokir. Izinkan pop-up di browser Anda.');
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Taman Margasatwa Ragunan</title>
          <meta charset="utf-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
              padding: 12mm;
              color: #1e293b;
              background: #fff;
            }
            .sheet-header {
              text-align: center;
              margin-bottom: 8mm;
              padding-bottom: 4mm;
              border-bottom: 2px solid #1B5E20;
            }
            .sheet-header h1 {
              font-size: 16pt;
              color: #1B5E20;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .sheet-header p {
              font-size: 9pt;
              color: #64748b;
              margin-top: 2px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8mm;
            }
            .qr-card {
              border: 1.5px solid #1B5E20;
              border-radius: 12px;
              padding: 12px;
              text-align: center;
              page-break-inside: avoid;
              background: #fff;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              min-height: 180px;
            }
            .badge-type {
              font-size: 7.5pt;
              font-weight: 700;
              color: #1B5E20;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .item-name {
              font-size: 11pt;
              font-weight: 700;
              color: #0f172a;
              line-height: 1.2;
              margin-bottom: 2px;
            }
            .latin-name {
              font-size: 8.5pt;
              color: #64748b;
              font-style: italic;
              margin-bottom: 8px;
            }
            .qr-wrap {
              margin: 4px 0;
              display: flex;
              justify-content: center;
            }
            .zone-tag {
              font-size: 8pt;
              font-weight: 600;
              color: #1B5E20;
              background: #f0fdf4;
              padding: 2px 8px;
              border-radius: 999px;
              border: 1px solid #bbf7d0;
              margin-top: 6px;
            }
            .footer-tag {
              font-size: 6.5pt;
              color: #94a3b8;
              margin-top: 4px;
            }
            @media print {
              body { padding: 8mm; }
              @page { margin: 8mm; size: A4 portrait; }
            }
          </style>
        </head>
        <body>
          <div class="sheet-header">
            <h1>Taman Margasatwa Ragunan</h1>
            <p>Lembar Label QR Code Resmi • ${title} • Total: ${selectedItems.length} Label</p>
          </div>
          <div class="grid">
            ${selectedItems.map(item => `
              <div class="qr-card">
                <div>
                  <div class="badge-type">${item.typeLabel || 'RAGUNAN ZOO'}</div>
                  <div class="item-name">${item.name}</div>
                  ${item.subName ? `<div class="latin-name">${item.subName}</div>` : ''}
                </div>
                <div class="qr-wrap">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(item.qrUrl)}" width="115" height="115" alt="QR Code" />
                </div>
                <div>
                  ${item.categoryOrZone ? `<div class="zone-tag">${item.categoryOrZone}</div>` : ''}
                  <div class="footer-tag">ragunanzoo.jakarta.go.id</div>
                </div>
              </div>
            `).join('')}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-slide-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">
                Pilih data untuk dicetak sebagai lembar label QR Code siap tempel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="p-4 border-b border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              className="rounded-xl text-xs font-semibold"
            >
              {selectedIds.length === items.length ? 'Batalkan Semua' : 'Pilih Semua'}
            </Button>
            <span className="text-xs font-medium text-muted-foreground">
              <strong className="text-foreground">{selectedItems.length}</strong> dari {items.length} label dipilih
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              disabled={selectedItems.length === 0}
              className="rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 btn-interactive"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF ({selectedItems.length})
            </Button>
          </div>
        </div>

        {/* Grid of Selectable Items with QR Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative ${
                  isSelected
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/20'
                    : 'bg-card border-border hover:border-border/80 opacity-75'
                }`}
              >
                {/* QR Code thumbnail */}
                <div className="w-14 h-14 bg-white p-1 rounded-xl border border-slate-200 flex-shrink-0 flex items-center justify-center shadow-2xs">
                  <QRCodeSVG value={item.qrUrl} size={48} level="M" />
                </div>

                {/* Info text */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-foreground truncate">{item.name}</p>
                  {item.subName && (
                    <p className="text-[11px] text-muted-foreground italic truncate">{item.subName}</p>
                  )}
                  {item.categoryOrZone && (
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {item.categoryOrZone}
                    </span>
                  )}
                </div>

                {/* Checkbox */}
                <div className="flex-shrink-0">
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(item.id)} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Ukuran standar cetak otomatis disesuaikan ke A4 (Grid 3 Kolom)
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
