import { AppIcon } from '@/components/ui/AppIcon';
import { Plant } from '@/hooks/usePlants';
import { useLanguage } from '@/contexts/LanguageContext';
import { SkeletonTableRow } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

interface PlantTableProps {
  plants: Plant[];
  loading: boolean;
  onEdit: (plant: Plant) => void;
  onDelete: (id: number) => void;
  onTogglePublish: (id: number, is_published: boolean) => void;
  onImageClick?: (plant: Plant) => void;
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'Dilindungi':
      return 'bg-destructive/10 text-destructive';
    case 'Rentan':
      return 'bg-secondary/10 text-secondary';
    default:
      return 'bg-green-100 text-green-700';
  }
};

const getHealthColor = (health: string | null) => {
  switch (health) {
    case 'Sehat':
      return 'bg-green-100 text-green-700';
    case 'Sakit':
      return 'bg-destructive/10 text-destructive';
    case 'Perawatan':
      return 'bg-secondary/10 text-secondary';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function PlantTable({ 
  plants, 
  loading, 
  onEdit, 
  onDelete, 
  onTogglePublish,
  onImageClick 
}: PlantTableProps) {
  const { language } = useLanguage();

  if (loading) {
    return (
      <div className="divide-y divide-manager-border">
        {[1, 2, 3, 4, 5].map(i => (
          <SkeletonTableRow key={i} columns={5} />
        ))}
      </div>
    );
  }

  return (
    <div className="manager-table-scroll">
      <table className="manager-table min-w-[760px]">
        <thead className="manager-table-head">
          <tr>
            <th className="manager-table-th">
              {language === 'en' ? 'Plant' : 'Tumbuhan'}
            </th>
            <th className="manager-table-th hidden md:table-cell">
              {language === 'en' ? 'Latin Name' : 'Nama Latin'}
            </th>
            <th className="manager-table-th hidden lg:table-cell">
              {language === 'en' ? 'Location' : 'Lokasi'}
            </th>
            <th className="manager-table-th">
              {language === 'en' ? 'Status' : 'Status'}
            </th>
            <th className="manager-table-th hidden md:table-cell">
              {language === 'en' ? 'Health' : 'Kesehatan'}
            </th>
            <th className="manager-table-th text-center">
              {language === 'en' ? 'Show' : 'Tampil'}
            </th>
            <th className="manager-table-th manager-table-th-right">
              {language === 'en' ? 'Actions' : 'Aksi'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-manager-border">
          {plants.map((plant) => (
            <tr key={plant.id} className="manager-table-row">
              <td className="manager-table-td">
                <div className="flex items-center gap-3">
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
                        className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-slate-200 group-hover/img:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <AppIcon name="solar:magnifer-zoom-in-bold" className="w-3.5 h-3.5 drop-shadow" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-600">
                      <AppIcon name="fluent-emoji-flat:herb" className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{(language === 'en' && plant.name_en) ? plant.name_en : plant.name}</p>
                    <p className="text-xs text-muted-foreground md:hidden truncate">
                      {plant.latin_name || '-'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="manager-table-td hidden md:table-cell">
                <p className="text-sm italic text-muted-foreground">{plant.latin_name || '-'}</p>
              </td>
              <td className="manager-table-td hidden lg:table-cell">
                <div className="flex items-center gap-1.5 text-sm">
                  <AppIcon name="solar:map-point-bold-duotone" className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">{plant.location || plant.zone || '-'}</span>
                </div>
              </td>
              <td className="manager-table-td">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(plant.status)}`}>
                  <AppIcon name="solar:shield-check-bold" className="w-3 h-3" />
                  {plant.status || 'Aman'}
                </span>
              </td>
              <td className="manager-table-td hidden md:table-cell">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getHealthColor(plant.health_status)}`}>
                  {plant.health_status || 'Sehat'}
                </span>
              </td>
              <td className="manager-table-td text-center">
                <Switch 
                  checked={plant.is_published !== false}
                  onCheckedChange={(checked) => onTogglePublish(plant.id, checked)}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </td>
              <td className="manager-table-td manager-table-th-right">
                <div className="manager-table-actions">
                  <button 
                    onClick={() => onEdit(plant)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title={language === 'en' ? 'Edit' : 'Edit'}
                  >
                    <AppIcon name="solar:pen-new-square-bold-duotone" className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(plant.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title={language === 'en' ? 'Delete' : 'Hapus'}
                  >
                    <AppIcon name="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
