import { AppIcon } from '@/components/ui/AppIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories, Category } from '@/hooks/useCategories';

interface PlantFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function PlantFilterBar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  onClearFilters,
}: PlantFilterBarProps) {
  const { language } = useLanguage();
  const { getFloraCategories, getCategoryDisplay } = useCategories();
  const floraCategories = getFloraCategories();
  
  const selectedCategory = floraCategories.find(c => c.id === categoryFilter);
  const hasFilters = searchQuery || categoryFilter;

  return (
    <div className="space-y-3">
      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <AppIcon name="solar:magnifer-linear" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={language === 'en' ? 'Search plants...' : 'Cari tumbuhan...'}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="manager-input pl-12"
          />
        </div>
        <div className="relative sm:min-w-[200px]">
          <AppIcon name="solar:filter-bold-duotone" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="manager-select pl-12"
          >
            <option value="">{language === 'en' ? 'All Categories' : 'Semua Kategori'}</option>
            {floraCategories.map(c => (
              <option key={c.id} value={c.id}>{getCategoryDisplay(c, language)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Chips */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {language === 'en' ? 'Filters:' : 'Filter:'}
          </span>
          
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {language === 'en' ? 'Search' : 'Pencarian'}: "{searchQuery}"
              <button 
                onClick={() => onSearchChange('')} 
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <AppIcon name="solar:close-circle-bold" className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {categoryFilter && selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
              {getCategoryDisplay(selectedCategory, language)}
              <button 
                onClick={() => onCategoryChange('')} 
                className="hover:bg-accent/20 rounded-full p-0.5 transition-colors"
              >
                <AppIcon name="solar:close-circle-bold" className="w-3 h-3" />
              </button>
            </span>
          )}
          
          <button 
            onClick={onClearFilters}
            className="text-xs text-destructive hover:underline font-medium"
          >
            {language === 'en' ? 'Clear all' : 'Hapus semua'}
          </button>
        </div>
      )}
    </div>
  );
}
