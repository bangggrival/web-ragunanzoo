import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { GpsPoi } from '../types';

interface GpsClosureModalProps {
  poi: GpsPoi | null;
  onClose: () => void;
  reason: string;
  setReason: (val: string) => void;
  until: string;
  setUntil: (val: string) => void;
  onSave: () => void;
}

export function GpsClosureModal({
  poi,
  onClose,
  reason,
  setReason,
  until,
  setUntil,
  onSave
}: GpsClosureModalProps) {
  return (
    <Dialog open={!!poi} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Tutup Sementara Zona / Fasilitas
          </DialogTitle>
          <DialogDescription>
            Tandai <b>{poi?.name}</b> sebagai tutup sementara di peta pengunjung.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Alasan Penutupan Sementara *</Label>
            <Input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Perawatan berkala, Renovasi kandang, Pembersihan"
              className="rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Perkiraan Selesai / Buka Kembali</Label>
            <Input
              type="date"
              value={until}
              onChange={e => setUntil(e.target.value)}
              className="rounded-xl text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Batal
          </Button>
          <Button onClick={onSave} className="rounded-xl bg-red-600 hover:bg-red-700 text-white">
            Tandai Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
