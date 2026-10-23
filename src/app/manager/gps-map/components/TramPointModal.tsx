import { Train, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { TramRoutePoint } from '../types';

interface TramFormData {
  lat: number;
  lng: number;
  is_halt: boolean;
  halt_name: string;
}

interface TramPointModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingPoint: TramRoutePoint | null;
  formData: TramFormData;
  setFormData: React.Dispatch<React.SetStateAction<TramFormData>>;
  onSave: (e: React.FormEvent) => void;
}

export function TramPointModal({
  isOpen,
  onOpenChange,
  editingPoint,
  formData,
  setFormData,
  onSave
}: TramPointModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Train className="w-5 h-5 text-amber-600" />
            {editingPoint ? 'Edit Titik Jalur Kereta' : 'Tambah Titik Jalur Kereta'}
          </DialogTitle>
          <DialogDescription>
            Tentukan koordinat titik rute perjalanan kereta wisata keliling.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Latitude *</Label>
              <Input
                type="number"
                step="0.000001"
                value={formData.lat}
                onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                required
                className="rounded-xl font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Longitude *</Label>
              <Input
                type="number"
                step="0.000001"
                value={formData.lng}
                onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                required
                className="rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          {formData.lat != null && formData.lng != null && !isNaN(formData.lat) && !isNaN(formData.lng) && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium px-1">
              {formData.lat >= -6.3250 && formData.lat <= -6.3000 && formData.lng >= 106.8100 && formData.lng <= 106.8350 ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Koordinat berada di dalam kawasan Ragunan
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  Peringatan: Koordinat berada di luar kawasan resmi Ragunan!
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-200">
            <span className="text-xs font-semibold text-amber-900">Titik Ini Adalah Halte Resmi?</span>
            <Switch
              checked={formData.is_halt}
              onCheckedChange={checked => setFormData({ ...formData, is_halt: checked })}
            />
          </div>

          {formData.is_halt && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nama Halte *</Label>
              <Input
                value={formData.halt_name}
                onChange={e => setFormData({ ...formData, halt_name: e.target.value })}
                placeholder="e.g. Halte Pintu Utama Utara"
                required
                className="rounded-xl text-sm"
              />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Batal
            </Button>
            <Button type="submit" className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white">
              Simpan Titik Jalur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
