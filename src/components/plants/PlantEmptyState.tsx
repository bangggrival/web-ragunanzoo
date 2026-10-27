import { AppIcon } from '@/components/ui/AppIcon';
import { useLanguage } from '@/contexts/LanguageContext';

interface PlantEmptyStateProps {
  hasFilters: boolean;
}

export default function PlantEmptyState({ hasFilters }: PlantEmptyStateProps) {
  const { language } = useLanguage();

  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <AppIcon name="fluent-emoji-flat:herb" className="w-10 h-10 opacity-60" />
      </div>
      <h3 className="text-lg font-semibold text-muted-foreground mb-1">
        {hasFilters 
          ? (language === 'en' ? 'No plants found' : 'Tidak ada tumbuhan ditemukan')
          : (language === 'en' ? 'No plant data yet' : 'Belum ada data tumbuhan')
        }
      </h3>
      <p className="text-sm text-muted-foreground/70">
        {hasFilters
          ? (language === 'en' ? 'Try adjusting your search or filters' : 'Coba ubah pencarian atau filter')
          : (language === 'en' ? 'Start by adding your first plant' : 'Mulai dengan menambahkan tumbuhan pertama')
        }
      </p>
    </div>
  );
}
