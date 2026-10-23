import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'default' | 'destructive' | 'outline';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Hapus",
  cancelText = "Batal",
  confirmButtonVariant = 'destructive',
}: ConfirmDialogProps) {
  let actionClasses = "";
  if (confirmButtonVariant === 'destructive') {
    actionClasses = "bg-rose-500 hover:bg-rose-600 text-white shadow-sm rounded-xl";
  } else if (confirmButtonVariant === 'default') {
    actionClasses = "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl";
  } else {
    actionClasses = "rounded-xl";
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl" onClick={onClose}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={actionClasses}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
