import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);
  const [options, setOptions] = useState({ title: 'Konfirmasi', description: 'Apakah Anda yakin ingin melanjutkan aksi ini?' });

  const confirm = (title?: string, description?: string): Promise<boolean> => {
    if (title || description) {
      setOptions({
        title: title || 'Konfirmasi',
        description: description || 'Apakah Anda yakin ingin melanjutkan aksi ini?'
      });
    }
    setIsOpen(true);
    return new Promise<boolean>((res) => {
      setResolveCallback(() => res);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(false);
  };

  const ConfirmComponent = (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={options.title}
      description={options.description}
    />
  );

  return { confirm, ConfirmComponent };
}
