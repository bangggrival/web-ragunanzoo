import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useFooterInView } from '@/hooks/useFooterInView';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { AppIcon } from '@/components/ui/AppIcon';

const FloatingTicketButton = React.forwardRef<HTMLAnchorElement, React.HTMLAttributes<HTMLAnchorElement>>(
  (props, ref) => {
    const { language } = useLanguage();
    const { settings } = useSiteSettings();
    const isFooterVisible = useFooterInView();
    const { isVisible: isScrollVisible } = useScrollDirection();
    const [mounted, setMounted] = React.useState(false);
    const [isChatbotOpen, setIsChatbotOpen] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
      const handleChatbotToggle = (e: Event) => {
        const customEvent = e as CustomEvent<{ open: boolean }>;
        setIsChatbotOpen(!!customEvent.detail?.open);
      };
      window.addEventListener('chatbot-modal-toggle', handleChatbotToggle);
      return () => {
        window.removeEventListener('chatbot-modal-toggle', handleChatbotToggle);
      };
    }, []);
    
    // Check if button is enabled (default to true if not set)
    const isEnabled = settings?.floating_ticket_enabled !== false;
    
    // Schedule settings
    const useSchedule = settings?.floating_ticket_use_schedule || false;
    const startTime = settings?.floating_ticket_start_time || '08:00';
    const endTime = settings?.floating_ticket_end_time || '17:00';
    
    // Check if current time is within operating hours (WIB - Asia/Jakarta)
    const isWithinOperatingHours = () => {
      if (!useSchedule) return true;
      
      try {
        const now = new Date();
        const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
        const currentHours = jakartaTime.getHours();
        const currentMinutes = jakartaTime.getMinutes();
        const currentTimeMinutes = currentHours * 60 + currentMinutes;
        
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const startTimeMinutes = startHours * 60 + startMinutes;
        const endTimeMinutes = endHours * 60 + endMinutes;
        
        return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes;
      } catch {
        return true;
      }
    };
    
    if (!isEnabled || !isWithinOperatingHours()) return null;
    
    const text = language === 'id' 
      ? (settings?.floating_ticket_text_id || 'Pesan Tiket Online')
      : (settings?.floating_ticket_text_en || 'Book Tickets Online');
    
    const position = settings?.floating_ticket_position || 'right';
    const externalUrl = settings?.ticket_external_url || 'https://ragunanzoo.agathis.fun/';
    
    const customIconUrl = settings?.floating_ticket_custom_icon_url;
    const iconName = settings?.floating_ticket_icon || 'solar:ticket-bold-duotone';
    const resolvedIcon = customIconUrl || (iconName === 'Ticket' ? 'solar:ticket-bold-duotone' : iconName);
    
    const iconSize = settings?.floating_ticket_icon_size || 'medium';
    const iconSizeClasses: Record<string, string> = {
      small: 'w-3.5 h-3.5 md:w-4 md:h-4',
      medium: 'w-4 h-4 md:w-5 md:h-5',
      large: 'w-5 h-5 md:w-6 md:h-6',
    };
    const currentIconSize = iconSizeClasses[iconSize] || iconSizeClasses.medium;
    
    // Horizontal positions matching site_settings (left | center | right)
    const positionClasses: Record<string, string> = {
      left: 'left-4 md:left-6',
      center: 'left-1/2 -translate-x-1/2',
      right: 'right-4 md:right-6',
    };

    // Responsive vertical positions:
    // - 'right': On mobile, placed cleanly above FloatingChatbot (bottom-24) at bottom-40 (160px, 16px gap).
    //   On desktop, placed at md:bottom-28 (112px, 24px gap above the 64px chatbot).
    // - 'center': On mobile, bottom-28 (clears mobile BottomNav elevated center icon). On desktop, bottom-8.
    // - 'left': On mobile, bottom-24 (above mobile BottomNav). On desktop, bottom-28 (above AccessibilityWidget).
    const verticalClasses: Record<string, string> = {
      right: 'bottom-40 md:bottom-28',
      center: 'bottom-28 md:bottom-8',
      left: 'bottom-24 md:bottom-28',
    };

    const posClass = positionClasses[position] || positionClasses.right;
    const vertClass = verticalClasses[position] || verticalClasses.right;

    const shouldHide = !isScrollVisible || isFooterVisible || isChatbotOpen;
    const shiftClass = (mounted && shouldHide)
      ? 'opacity-0 scale-90 translate-y-28 pointer-events-none'
      : 'opacity-100 scale-100 translate-y-0 pointer-events-auto';

    const buttonContent = (
      <div className="relative group animate-gentle-float">
        {/* Soft Ambient Glow */}
        <div 
          className="absolute -inset-1 rounded-2xl bg-primary/20 animate-soft-glow blur-sm pointer-events-none" 
        />

        {/* Ticket Coupon Container */}
        <div className="relative flex items-center bg-primary text-primary-foreground px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/30">
          {/* Left Ticket Notch */}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-background rounded-full border-r border-white/20" />
          
          {/* Right Ticket Notch */}
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-background rounded-full border-l border-white/20" />
          
          {/* Dashed Cut Line */}
          <div className="absolute left-3.5 md:left-4.5 top-0 bottom-0 w-px border-l border-dashed border-white/30" />

          {/* Ticket Icon & Label */}
          <div className="flex items-center gap-2 md:gap-3 pl-2.5 md:pl-3">
            <div className="bg-white/20 p-1 md:p-1.5 rounded-lg flex items-center justify-center">
              <AppIcon 
                name={resolvedIcon} 
                className={currentIconSize} 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[10px] opacity-85 leading-tight font-medium uppercase tracking-wider">
                {language === 'id' ? 'Beli Online' : 'Buy Online'}
              </span>
              <span className="font-bold text-[10px] md:text-sm leading-tight">{text}</span>
            </div>
          </div>
        </div>
      </div>
    );

    if (externalUrl) {
      return (
        <a
          ref={ref}
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`fixed ${vertClass} ${posClass} z-40 group transition-all duration-300 ease-spring ${shiftClass}`}
          aria-label={text}
          {...props}
        >
          {buttonContent}
        </a>
      );
    }

    return (
      <Link
        href="/tickets?tab=online"
        className={`fixed ${vertClass} ${posClass} z-40 group transition-all duration-300 ease-spring ${shiftClass}`}
        aria-label={text}
      >
        {buttonContent}
      </Link>
    );
  }
);

FloatingTicketButton.displayName = 'FloatingTicketButton';

export default FloatingTicketButton;
