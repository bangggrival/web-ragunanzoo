import { AppIcon } from '@/components/ui/AppIcon';
import { Plant } from '@/hooks/usePlants';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';

interface PlantMobileCardProps {
  plant: Plant;
  onEdit: (plant: Plant) => void;
  onDelete: (id: number) => void;
  onTogglePublish: (id: number, is_published: boolean) => void;
  onImageClick?: (plant: Plant) => void;
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'Dilindungi':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'Rentan':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-green-100 text-green-700 border-green-200';
  }
};

const getHealthColor = (health: string | null) => {
  switch (health) {
    case 'Sehat':
      return 'bg-green-100 text-green-700';
    case 'Sakit':
      return 'bg-rose-100 text-rose-700';
    case 'Perawatan':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function PlantMobileCard({ 
  plant, 
  onEdit, 
  onDelete, 
  onTogglePublish,
  onImageClick 
}: PlantMobileCardProps) {
  const { language } = useLanguage();

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      {/* Header: Image + Name */}
      <div className="flex items-start gap-3">
        {plant.image_url ? (
          <button
            type="button"
            onClick={() => onImageClick?.(plant)}
            className="relative group/img flex-shrink-0 cursor-pointer"
            title="Klik untuk pratinjau foto resolusi penuh"
          >
            <img
              src={plant.image_url}
              alt={(language === 'en' && plant.name_en) ? plant.name_en : plant.name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200"
            />
            <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
              <AppIcon name="solar:magnifer-zoom-in-bold" className="w-4 h-4" />
            </div>
          </button>
        ) : (
          <div className="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-600">
            <AppIcon name="fluent-emoji-flat:herb" className="w-8 h-8" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base truncate">{(language === 'en' && plant.name_en) ? plant.name_en : plant.name}</h3>
          {plant.latin_name && (
            <p className="text-sm italic font-medium text-slate-500 truncate">{plant.latin_name}</p>
          )}
          {plant.location && (
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
              <AppIcon name="solar:map-point-bold-duotone" className="w-3.5 h-3.5 text-emerald-500" />
              <span className="truncate">{plant.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(plant.status)}`}>
          <AppIcon name="solar:shield-check-bold" className="w-3 h-3" />
          {plant.status || 'Aman'}
        </span>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getHealthColor(plant.health_status)}`}>
          <AppIcon name="solar:pulse-2-bold" className="w-3 h-3" />
          {plant.health_status || 'Sehat'}
        </span>
      </div>

      {/* Toggle Publish */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {language === 'en' ? 'Show on Website:' : 'Tampil di Web:'}
        </span>
        <Switch 
          checked={plant.is_published !== false}
          onCheckedChange={(checked) => onTogglePublish(plant.id, checked)}
          className="data-[state=checked]:bg-emerald-500 scale-90 origin-right"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border/50">
        <button 
          onClick={() => onEdit(plant)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
        >
          <AppIcon name="solar:pen-new-square-bold-duotone" className="w-4 h-4" />
          {language === 'en' ? 'Edit' : 'Edit'}
        </button>
        <button 
          onClick={() => onDelete(plant.id)}
          className="flex items-center justify-center p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
          title={language === 'en' ? 'Delete' : 'Hapus'}
        >
          <AppIcon name="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
