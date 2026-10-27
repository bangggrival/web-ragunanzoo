import React, { useState, useEffect, useRef } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const typeIcons: Record<string, string> = {
  animal: 'fluent-emoji-flat:paw-prints',
  event: 'solar:calendar-bold-duotone',
  news: 'solar:newspaper-bold-duotone',
  venue: 'solar:buildings-2-bold-duotone',
  page: 'solar:document-text-bold-duotone',
};

const typeLabels: Record<string, Record<string, string>> = {
  id: {
    animal: 'Satwa',
    event: 'Event',
    news: 'Berita',
    venue: 'Venue',
    page: 'Halaman',
  },
  en: {
    animal: 'Animal',
    event: 'Event',
    news: 'News',
    venue: 'Venue',
    page: 'Page',
  },
};

interface GlobalSearchProps {
  className?: string;
  variant?: 'icon' | 'expanded';
}

export function GlobalSearch({ className, variant = 'expanded' }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { results, isLoading } = useGlobalSearch(debouncedQuery);
  const { language } = useLanguage();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const placeholder = language === 'en' ? 'Search animals, events, news...' : 'Cari satwa, event, berita...';
  const placeholderShort = language === 'en' ? 'Search...' : 'Cari...';
  const noResults = language === 'en' ? 'No results found' : 'Tidak ada hasil';
  const searching = language === 'en' ? 'Searching...' : 'Mencari...';
  const typeHint = language === 'en' ? 'Type at least 2 characters' : 'Ketik minimal 2 karakter';

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery('');
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    return typeLabels[language][type];
  };

  // Icon-only variant (for mobile or compact views)
  if (variant === 'icon') {
    return (
      <div ref={containerRef} className={cn('relative', className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-9 w-9 text-foreground/70 hover:text-foreground hover:bg-accent"
          aria-label={language === 'en' ? 'Search' : 'Cari'}
        >
          <AppIcon name="solar:magnifer-linear" className="h-5 w-5" />
        </Button>

        {isOpen && (
          <SearchDropdown
            query={query}
            setQuery={setQuery}
            results={results}
            isLoading={isLoading}
            placeholder={placeholder}
            noResults={noResults}
            searching={searching}
            typeHint={typeHint}
            getTypeLabel={getTypeLabel}
            handleResultClick={handleResultClick}
            inputRef={inputRef}
          />
        )}
      </div>
    );
  }

  // Expanded variant (prominent search bar)
  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Always visible search bar */}
      <div 
        className={cn(
          "flex items-center gap-1.5 md:gap-2 bg-card border border-border rounded-full px-2.5 md:px-3.5 py-1.5 cursor-text transition-all duration-200 shadow-2xs",
          isOpen 
            ? "ring-2 ring-primary/30 border-primary/50" 
            : "hover:border-primary/40 hover:bg-muted/40"
        )}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <AppIcon name="solar:magnifer-linear" className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholderShort}
          className="bg-transparent border-0 outline-none text-sm w-20 md:w-28 lg:w-36 xl:w-40 placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <AppIcon name="solar:close-circle-bold" className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && query.length >= 2 && (
        <SearchDropdown
          query={query}
          setQuery={setQuery}
          results={results}
          isLoading={isLoading}
          placeholder={placeholder}
          noResults={noResults}
          searching={searching}
          typeHint={typeHint}
          getTypeLabel={getTypeLabel}
          handleResultClick={handleResultClick}
          inputRef={inputRef}
          showInput={false}
        />
      )}
    </div>
  );
}

// Extracted dropdown component
function SearchDropdown({
  query,
  setQuery,
  results,
  isLoading,
  placeholder,
  noResults,
  searching,
  typeHint,
  getTypeLabel,
  handleResultClick,
  inputRef,
  showInput = true,
}: {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  placeholder: string;
  noResults: string;
  searching: string;
  typeHint: string;
  getTypeLabel: (type: SearchResult['type']) => string;
  handleResultClick: (result: SearchResult) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  showInput?: boolean;
}) {
  return (
    <div className="absolute right-0 top-full mt-2 w-[300px] sm:w-[340px] md:w-[400px] lg:w-[440px] bg-card dark:bg-[#111C16] border border-border/90 rounded-2xl shadow-2xl shadow-black/25 z-[100] overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
      {/* Search Input - only show for icon variant */}
      {showInput && (
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <AppIcon name="solar:magnifer-linear" className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuery('')}
              className="h-6 w-6 shrink-0"
            >
              <AppIcon name="solar:close-circle-bold" className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Results */}
      <div className="max-h-[60vh] overflow-y-auto">
        {query.length < 2 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {typeHint}
          </div>
        ) : isLoading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {searching}
          </div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {noResults}
          </div>
        ) : (
          <div className="py-2">
            {results.map((result) => {
              const iconKey = typeIcons[result.type] || 'solar:document-text-bold-duotone';
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                >
                  {/* Image or Icon */}
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {result.image ? (
                      <img
                        src={result.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('icon-fallback');
                        }}
                      />
                    ) : (
                      <AppIcon name={iconKey} className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm text-foreground mt-1 truncate">
                      {result.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {result.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
