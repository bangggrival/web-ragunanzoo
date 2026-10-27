import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Switch } from '@/components/ui/switch';
import { useCategories, type Category } from '@/hooks/useCategories';
import { FAUNA_ICONS, FLORA_ICONS } from '@/utils/animalIcons';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { AppIcon } from '@/components/ui/AppIcon';

const formSchema = z.object({
  name_id: z.string().min(1, 'Nama wajib diisi'),
  name_en: z.string().optional(),
  type: z.enum(['flora', 'fauna']),
  icon: z.string().optional(),
  description_id: z.string().optional(),
  description_en: z.string().optional(),
  image_url: z.string().optional(),
  is_active: z.boolean(),
  order_index: z.number(),
});

type FormData = z.infer<typeof formSchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSuccess?: () => void;
}

const EMOJI_OPTIONS = [
  '🦁', '🐯', '🐘', '🦒', '🐒', '🦎', '🐊', '🦅', '🦜', '🐟',
  '🦋', '🐍', '🦀', '🐢', '🦩', '🌳', '🌴', '🌸', '🌺', '🌿',
  '🍃', '🌱', '🌵', '🎋', '🪻', '🌼', '🌻', '💐', '🪷', '🐾',
];

export default function CategoryFormModal({ isOpen, onClose, category, onSuccess }: CategoryFormModalProps) {
  const { addCategory, updateCategory, categories } = useCategories();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name_id: '',
      name_en: '',
      type: 'fauna',
      icon: '🐾',
      description_id: '',
      description_en: '',
      image_url: '',
      is_active: true,
      order_index: 0,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name_id: category.name_id,
        name_en: category.name_en || '',
        type: category.type,
        icon: category.icon || '🐾',
        description_id: category.description_id || '',
        description_en: category.description_en || '',
        image_url: category.image_url || '',
        is_active: category.is_active,
        order_index: category.order_index,
      });
    } else {
      form.reset({
        name_id: '',
        name_en: '',
        type: 'fauna',
        icon: '🐾',
        description_id: '',
        description_en: '',
        image_url: '',
        is_active: true,
        order_index: categories.length,
      });
    }
  }, [category, categories.length, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (category) {
        await updateCategory.mutateAsync({
          id: category.id,
          updates: {
            name_id: data.name_id,
            name_en: data.name_en || null,
            type: data.type,
            icon: data.icon || null,
            description_id: data.description_id || null,
            description_en: data.description_en || null,
            image_url: data.image_url || null,
            is_active: data.is_active,
            order_index: data.order_index,
          },
        });
      } else {
        await addCategory.mutateAsync({
          name_id: data.name_id,
          name_en: data.name_en || null,
          type: data.type,
          icon: data.icon || null,
          description_id: data.description_id || null,
          description_en: data.description_en || null,
          image_url: data.image_url || null,
          is_active: data.is_active,
          order_index: data.order_index,
        });
      }
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const isLoading = addCategory.isPending || updateCategory.isPending;
  const selectedType = form.watch('type');
  const selectedIcon = form.watch('icon');
  const isActive = form.watch('is_active');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/45 backdrop-blur-md animate-in fade-in duration-300" 
      onClick={onClose}
    >
      <div 
        className="relative z-50 flex flex-col overflow-hidden w-full max-w-xl bg-white/85 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 rounded-[1.25rem] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12),_0_24px_64px_-12px_rgba(0,0,0,0.15)] animate-in zoom-in-95 fade-in duration-300"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="manager-modal-header shrink-0">
          <div className="manager-modal-title">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <AppIcon name="solar:folder-with-files-bold-duotone" className="w-4 h-4 text-primary" />
            </div>
            <span>{category ? 'Edit Kategori' : 'Tambah Kategori'}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <AppIcon name="solar:close-circle-bold" className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="manager-modal-body min-h-0 !block space-y-5">
          {/* Type */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">Tipe Kategori</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => form.setValue('type', 'fauna')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                  selectedType === 'fauna'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-muted/30 border-manager-border hover:bg-muted/50'
                }`}
              >
                <AppIcon name="fluent-emoji-flat:paw-prints" className="w-4 h-4" />
                <span className="text-sm font-medium">Fauna (Hewan)</span>
              </button>
              <button
                type="button"
                onClick={() => form.setValue('type', 'flora')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                  selectedType === 'flora'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-muted/30 border-manager-border hover:bg-muted/50'
                }`}
              >
                <AppIcon name="fluent-emoji-flat:herb" className="w-4 h-4" />
                <span className="text-sm font-medium">Flora (Tumbuhan)</span>
              </button>
            </div>
          </div>

          {/* Icon */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">
              Pilih Ikon Satwa / Flora (Iconify & Vektor)
            </p>

            <div className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                {selectedType === 'fauna' ? 'Koleksi Ikon Satwa (Iconify & Tim Desain):' : 'Koleksi Ikon Botani/Flora (Iconify & Tim Desain):'}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 p-3 border border-manager-border rounded-xl max-h-48 overflow-y-auto bg-muted/20">
                {(selectedType === 'fauna' ? FAUNA_ICONS : FLORA_ICONS).map((iconMeta) => (
                  <button
                    key={iconMeta.key}
                    type="button"
                    onClick={() => form.setValue('icon', iconMeta.iconifyIcon || iconMeta.key)}
                    title={`${iconMeta.nameId} (${iconMeta.nameEn})`}
                    className={`p-2 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedIcon === (iconMeta.iconifyIcon || iconMeta.key) || selectedIcon === iconMeta.key
                        ? 'bg-primary/20 ring-2 ring-primary scale-105 shadow-sm'
                        : 'hover:bg-muted bg-card shadow-2xs hover:scale-105'
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center">
                      <CategoryIcon icon={iconMeta.iconifyIcon || iconMeta.key} categoryName={iconMeta.nameId} type={selectedType} className="w-10 h-10 object-contain" />
                    </div>
                    <span className="text-[10px] font-medium text-foreground/75 truncate max-w-[56px] text-center">
                      {iconMeta.nameId}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Iconify Key Input */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Kustom Iconify Key (Opsional):
              </p>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-border">
                  <AppIcon icon={selectedIcon} className="w-5 h-5 text-primary" fallback={<AppIcon name="fluent-emoji-flat:paw-prints" className="w-4 h-4" />} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. fluent-emoji-flat:tiger atau /icons/categories/komodo.svg"
                  value={selectedIcon || ''}
                  onChange={(e) => form.setValue('icon', e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-manager-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Emoji Cepat:</p>
            <div className="flex flex-wrap gap-1.5 p-3 border border-manager-border rounded-lg max-h-24 overflow-y-auto bg-muted/20">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => form.setValue('icon', emoji)}
                  className={`text-xl p-1.5 rounded-lg transition-all ${
                    selectedIcon === emoji
                      ? 'bg-primary/20 ring-2 ring-primary scale-110'
                      : 'hover:bg-muted'
                  }`}
                >
                  <AppIcon icon={emoji} className="w-6 h-6" fallback={<span>{emoji}</span>} />
                </button>
              ))}
            </div>
          </div>

          {/* Nama */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">Nama Kategori</p>
            <div className="manager-form-grid">
              <div className="manager-form-grid-2">
                <div>
                  <label className="manager-input-label">Indonesia *</label>
                  <input
                    type="text"
                    {...form.register('name_id')}
                    placeholder="Contoh: Mamalia"
                    className="manager-input"
                  />
                  {form.formState.errors.name_id && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.name_id.message}</p>
                  )}
                </div>
                <div>
                  <label className="manager-input-label">English</label>
                  <input
                    type="text"
                    {...form.register('name_en')}
                    placeholder="Example: Mammals"
                    className="manager-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">Deskripsi</p>
            <div className="manager-form-grid">
              <div>
                <label className="manager-input-label">Indonesia</label>
                <textarea
                  {...form.register('description_id')}
                  placeholder="Deskripsi singkat kategori..."
                  rows={2}
                  className="manager-textarea"
                />
              </div>
              <div>
                <label className="manager-input-label">English</label>
                <textarea
                  {...form.register('description_en')}
                  placeholder="Short category description..."
                  rows={2}
                  className="manager-textarea"
                />
              </div>
            </div>
          </div>

          {/* Pengaturan */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">Pengaturan</p>
            <div className="manager-form-grid">
              <div>
                <label className="manager-input-label">URL Gambar</label>
                <input
                  type="text"
                  {...form.register('image_url')}
                  placeholder="https://..."
                  className="manager-input"
                />
              </div>
              <div>
                <label className="manager-input-label">Urutan</label>
                <input
                  type="number"
                  min={0}
                  {...form.register('order_index', { valueAsNumber: true })}
                  className="manager-input"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-manager-border bg-muted/20">
                <div>
                  <p className="text-sm font-medium">Status Aktif</p>
                  <p className="text-xs text-muted-foreground">Tampilkan di halaman explorer</p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => form.setValue('is_active', checked)}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="manager-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="manager-btn-secondary"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="manager-btn-primary"
          >
            {isLoading ? (
              <>
                <AppIcon name="solar:spinner-linear" className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              category ? 'Simpan Perubahan' : 'Tambah Kategori'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
