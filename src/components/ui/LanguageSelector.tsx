import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Flag images for better cross-browser compatibility
const FLAGS = {
  id: 'https://flagcdn.com/w40/id.png',
  en: 'https://flagcdn.com/w40/gb.png',
};

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const currentFlag = FLAGS[language];
  const currentLabel = language === 'id' ? 'ID' : 'EN';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="group flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:border-primary/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
        >
          <img 
            src={currentFlag} 
            alt={language === 'id' ? 'Indonesia' : 'English'}
            className="w-4.5 h-3.5 object-cover rounded-xs transition-transform duration-200 group-hover:scale-110 shadow-2xs"
          />
          <span className="hidden sm:inline transition-colors duration-200 group-hover:text-primary font-bold">{currentLabel}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 group-hover:rotate-180 group-hover:text-primary" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        sideOffset={8}
        className="bg-card dark:bg-[#111C16] border border-border/90 shadow-2xl shadow-black/20 rounded-2xl min-w-[170px] p-1.5 z-50 ring-1 ring-black/5 dark:ring-white/10"
      >
        <DropdownMenuItem
          onClick={() => setLanguage('id')}
          className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer text-sm font-semibold transition-all ${
            language === 'id'
              ? 'bg-primary text-white shadow-xs'
              : 'text-foreground hover:bg-muted hover:text-primary'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <img 
              src={FLAGS.id} 
              alt="Indonesia"
              className="w-5 h-3.5 object-cover rounded-xs shadow-2xs"
            />
            <span>Indonesia</span>
          </div>
          {language === 'id' && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer text-sm font-semibold transition-all ${
            language === 'en'
              ? 'bg-primary text-white shadow-xs'
              : 'text-foreground hover:bg-muted hover:text-primary'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <img 
              src={FLAGS.en} 
              alt="English"
              className="w-5 h-3.5 object-cover rounded-xs shadow-2xs"
            />
            <span>English</span>
          </div>
          {language === 'en' && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
