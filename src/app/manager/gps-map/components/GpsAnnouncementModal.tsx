import React from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { GpsPoi } from '../types';

interface GpsAnnouncementModalProps {
  poi: GpsPoi | null;
  onClose: () => void;
  text: string;
  setText: (val: string) => void;
  expiry: string;
  setExpiry: (val: string) => void;
  onSave: () => void;
}

export function GpsAnnouncementModal({
  poi,
  onClose,
  text,
  setText,
  expiry,
  setExpiry,
  onSave
}: GpsAnnouncementModalProps) {
  return (
    <Dialog open={!!poi} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <AppIcon icon="Sparkles" className="w-5 h-5 text-amber-600" />
            Pengumuman Khusus Lokasi
          </DialogTitle>
          <DialogDescription>
            Pesan pop-up yang akan tampil saat pengunjung membuka <b>{poi?.name}</b> di peta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Teks Pengumuman</Label>
            <Textarea
              rows={3}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="e.g. Panggung edukasi hari ini dipindahkan ke kanopi barat pukul 14.00."
              className="rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Berlaku Hingga</Label>
            <Input
              type="datetime-local"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              className="rounded-xl text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Batal
          </Button>
          <Button onClick={onSave} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
            Simpan Pengumuman
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
