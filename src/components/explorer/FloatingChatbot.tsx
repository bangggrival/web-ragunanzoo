import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChatbotFaqs } from '@/hooks/useChatbotFaqs';
import { useSystemConfigs } from '@/hooks/useSystemConfigs';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useFooterInView } from '@/hooks/useFooterInView';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  showWhatsApp?: boolean;
  isStreaming?: boolean;
  rating?: 'up' | 'down' | null;
  faqCategory?: string;
}

// ============================================================
// PERSONA HELPERS
// ============================================================
function getTimeGreeting(lang: 'id' | 'en'): string {
  const hour = new Date().getHours();
  if (lang === 'en') {
    if (hour < 11) return 'Good morning';
    if (hour < 15) return 'Good afternoon';
    if (hour < 19) return 'Good evening';
    return 'Good evening';
  }
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Fallback hardcoded defaults if DB is empty
const INTRO_VARIATIONS_ID = ['Tentu! ', 'Baik, ', 'Sip! ', 'Oke! '];
const OUTRO_VARIATIONS_ID = ['\n\nSemoga membantu! 😊', '\n\nAda hal lain yang ingin ditanyakan?'];
const INTRO_VARIATIONS_EN = ['Sure! ', 'Great question! ', 'Of course! '];
const OUTRO_VARIATIONS_EN = ['\n\nHope that helps! 😊', '\n\nFeel free to ask anything else!'];
const FALLBACK_ID = ['Mohon maaf, pertanyaan Anda belum ada di database saya. Untuk mendapatkan jawaban yang akurat, silakan hubungi tim admin kami melalui WhatsApp di **021-78847114**.'];
const FALLBACK_EN = ['We apologize, but your question is not in my database yet. For an accurate answer, please contact our admin team via WhatsApp at **021-78847114**.'];

// ============================================================
// MARKDOWN RENDERER (simple subset: **bold**, *italic*, - list)
// ============================================================
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Bullet list items
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const content = trimmed.replace(/^[-•]\s+/, '');
      elements.push(
        <li key={lineIdx} className="ml-3 list-disc text-[13px] leading-relaxed">
          {renderInline(content)}
        </li>
      );
    } else if (trimmed === '') {
      elements.push(<br key={lineIdx} />);
    } else {
      elements.push(
        <span key={lineIdx} className="block text-[13px] leading-relaxed break-words">
          {renderInline(trimmed)}
        </span>
      );
    }
  });

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// ============================================================
// TYPEWRITER HOOK
// ============================================================
function useTypewriter(onComplete?: () => void) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetRef = useRef('');
  const indexRef = useRef(0);

  const startTyping = useCallback((text: string, thinkDelay = 400) => {
    // Clear any active typing
    if (intervalRef.current) clearInterval(intervalRef.current);

    setDisplayedText('');
    setIsTyping(true);
    targetRef.current = text;
    indexRef.current = 0;

    // Think delay before starting to type
    setTimeout(() => {
      intervalRef.current = setInterval(() => {
        const current = indexRef.current;
        if (current >= targetRef.current.length) {
          clearInterval(intervalRef.current!);
          setIsTyping(false);
          onComplete?.();
          return;
        }

        // Vary speed: faster on spaces, slightly slower on punctuation
        const char = targetRef.current[current];
        const baseDelay = char === ' ' ? 8 : char.match(/[.,!?]/) ? 60 : 18;
        indexRef.current = current + 1;
        setDisplayedText(targetRef.current.slice(0, current + 1));
      }, 18 + Math.random() * 12);
    }, thinkDelay);
  }, [onComplete]);

  const stopTyping = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayedText(targetRef.current);
    setIsTyping(false);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { displayedText, isTyping, startTyping, stopTyping };
}

// ============================================================
// FORMAT TIMESTAMP
// ============================================================
function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ============================================================
// COMPONENT
// ============================================================
const FloatingChatbot = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const { language } = useLanguage();
    const { faqs, findAnswer, getAnswerById, getFaqById, loading: faqsLoading } = useChatbotFaqs();
    const { settings } = useSiteSettings();
    const { getConfig } = useSystemConfigs();

    const [botConfig, setBotConfig] = useState<any>(null);

    useEffect(() => {
      getConfig('chatbot_greetings').then(setBotConfig);
    }, [getConfig]);

    const [isOpen, setIsOpen] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
    const [streamedContent, setStreamedContent] = useState('');
    const [usedSuggestionIds, setUsedSuggestionIds] = useState<Set<string>>(new Set());

    // Context awareness: remember last topic category
    const [lastCategory, setLastCategory] = useState<string | undefined>(undefined);

    // Collapsible suggestions panel — starts open, auto-closes when user chats
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const streamTargetRef = useRef('');
    const streamIndexRef = useRef(0);

    const lang = language as 'id' | 'en';

    // Handle open/close with animation & notify other floating elements to avoid overlap
    useEffect(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chatbot-modal-toggle', { detail: { open: isOpen } }));
      }
      if (isOpen) {
        setShouldRender(true);
      } else {
        const timer = setTimeout(() => setShouldRender(false), 200);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);

    // Get settings
    const customIconUrl = settings?.chat_us_icon_url;
    const position = settings?.chat_us_position || 'right';

    const positionClasses: Record<string, any> = {
      left: 'left-4 md:left-6',
      center: 'left-1/2 -translate-x-1/2',
      right: 'right-4 md:right-6',
    };

    const whatsappNumber = settings?.chat_us_number || settings?.whatsapp_number || '02178847114';

    const formatWhatsAppNumber = (num: string | null | undefined): string => {
      if (!num) return '';
      let cleaned = num.replace(/\D/g, '');
      if (cleaned.startsWith('0')) cleaned = '62' + cleaned.substring(1);
      return cleaned;
    };

    const formattedNumber = formatWhatsAppNumber(whatsappNumber);

    // UI texts
    const texts = {
      id: {
        title: 'Asisten Virtual',
        subtitle: 'Siap membantu Anda 😊',
        placeholder: 'Ketik pertanyaan Anda...',
        suggestions: 'Pertanyaan Populer',
        contactWhatsApp: 'Hubungi via WhatsApp',
        needMoreHelp: 'Butuh bantuan lebih?',
        clearChat: 'Hapus percakapan',
        rateUp: 'Jawaban membantu',
        rateDown: 'Tidak membantu',
      },
      en: {
        title: 'Virtual Assistant',
        subtitle: 'Ready to help you 😊',
        placeholder: 'Type your question...',
        suggestions: 'Popular Questions',
        contactWhatsApp: 'Contact via WhatsApp',
        needMoreHelp: 'Need more help?',
        clearChat: 'Clear chat',
        rateUp: 'Helpful answer',
        rateDown: 'Not helpful',
      },
    };

    const t = texts[lang] || texts.id;
    const isFooterVisible = useFooterInView();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    const { isVisible: isScrollVisible } = useScrollDirection();

    const shouldHide = (!isOpen && (!isScrollVisible || isFooterVisible));
    const shiftClass = (mounted && shouldHide)
      ? 'opacity-0 scale-90 translate-y-28 pointer-events-none'
      : 'opacity-100 scale-100 translate-y-0 pointer-events-auto';

    // Dynamic suggestions
    const suggestions = useMemo(() => {
      return faqs
        .filter(faq => !usedSuggestionIds.has(faq.id))
        .slice(0, 5)
        .map(faq => ({
          id: faq.id,
          question: lang === 'en' && faq.question_en ? faq.question_en : faq.question_id,
        }));
    }, [faqs, usedSuggestionIds, lang]);

    // Scroll to bottom
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamedContent, isThinking]);

    // Welcome message on open
    useEffect(() => {
      if (isOpen && messages.length === 0) {
        const greeting = getTimeGreeting(lang);
        const welcome =
          lang === 'en'
            ? `${greeting}! 👋 I'm Ragunan Zoo's virtual assistant. How can I help you today?`
            : `${greeting}! 👋 Saya asisten virtual Taman Margasatwa Ragunan. Ada yang bisa saya bantu hari ini?`;

        setMessages([
          {
            id: 'welcome',
            type: 'bot',
            content: welcome,
            timestamp: new Date(),
          },
        ]);
      }
    }, [isOpen, messages.length, lang]);

    // Focus input on open
    useEffect(() => {
      if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
    }, [isOpen]);

    // Cleanup stream interval on unmount
    useEffect(() => {
      return () => {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      };
    }, []);

    // ---- Streaming engine ----
    const startStreaming = useCallback((messageId: string, fullText: string) => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

      streamTargetRef.current = fullText;
      streamIndexRef.current = 0;
      setStreamingMessageId(messageId);
      setStreamedContent('');

      streamIntervalRef.current = setInterval(() => {
        const idx = streamIndexRef.current;
        if (idx >= streamTargetRef.current.length) {
          clearInterval(streamIntervalRef.current!);
          streamIntervalRef.current = null;

          // Commit streamed content to the message and stop streaming
          setMessages(prev =>
            prev.map(m =>
              m.id === messageId
                ? { ...m, content: streamTargetRef.current, isStreaming: false }
                : m
            )
          );
          setStreamingMessageId(null);
          setStreamedContent('');
          return;
        }

        streamIndexRef.current = idx + 1;
        setStreamedContent(streamTargetRef.current.slice(0, idx + 1));
      }, 18);
    }, []);

    const addBotResponse = useCallback(
      (rawAnswer: string, showWhatsApp = false, faqCategory?: string, thinkDelay = 600) => {
        setIsThinking(true);

        setTimeout(() => {
          setIsThinking(false);

          const introOptsId = botConfig?.intro_id?.length > 0 ? botConfig.intro_id : INTRO_VARIATIONS_ID;
          const introOptsEn = botConfig?.intro_en?.length > 0 ? botConfig.intro_en : INTRO_VARIATIONS_EN;
          const outroOptsId = botConfig?.outro_id?.length > 0 ? botConfig.outro_id : OUTRO_VARIATIONS_ID;
          const outroOptsEn = botConfig?.outro_en?.length > 0 ? botConfig.outro_en : OUTRO_VARIATIONS_EN;
          const fallbackOptsId = botConfig?.fallback_id?.length > 0 ? botConfig.fallback_id : FALLBACK_ID;
          const fallbackOptsEn = botConfig?.fallback_en?.length > 0 ? botConfig.fallback_en : FALLBACK_EN;

          const intro = showWhatsApp ? '' : pickRandom(lang === 'en' ? introOptsEn : introOptsId);
          const outro = showWhatsApp ? '' : pickRandom(lang === 'en' ? outroOptsEn : outroOptsId);

          const fullContent = (showWhatsApp
            ? pickRandom(lang === 'en' ? fallbackOptsEn : fallbackOptsId)
            : `${intro}${rawAnswer}${outro}`) as string;

          const msgId = `bot-${Date.now()}`;

          const newMsg: Message = {
            id: msgId,
            type: 'bot',
            content: '',
            timestamp: new Date(),
            showWhatsApp,
            isStreaming: true,
            rating: null,
            faqCategory,
          };

          setMessages(prev => [...prev, newMsg]);

          // Update last category context
          if (faqCategory) setLastCategory(faqCategory);

          startStreaming(msgId, fullContent);
        }, thinkDelay + Math.random() * 300);
      },
      [lang, startStreaming, botConfig]
    );

    const handleSend = useCallback(() => {
      const trimmed = inputValue.trim();
      if (!trimmed || isThinking || streamingMessageId) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMsg]);
      setInputValue('');
      // Auto-collapse suggestions when user starts chatting
      setIsSuggestionsOpen(false);

      const matched = findAnswer(trimmed, lang, lastCategory);

      if (matched) {
        const answer = lang === 'en' && matched.answer_en ? matched.answer_en : matched.answer_id;
        addBotResponse(answer, false, matched.category);
      } else {
        addBotResponse('', true);
      }
    }, [inputValue, isThinking, streamingMessageId, findAnswer, lang, lastCategory, addBotResponse]);

    const handleSuggestionClick = useCallback(
      (suggestionId: string) => {
        const faq = faqs.find(f => f.id === suggestionId);
        if (!faq || isThinking || streamingMessageId) return;

        const question = lang === 'en' && faq.question_en ? faq.question_en : faq.question_id;
        setUsedSuggestionIds(prev => new Set([...prev, suggestionId]));
        // Auto-collapse suggestions panel after picking one
        setIsSuggestionsOpen(false);

        const userMsg: Message = {
          id: `user-${Date.now()}`,
          type: 'user',
          content: question,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);

        const answer = getAnswerById(suggestionId, lang);
        if (answer) addBotResponse(answer, false, faq.category);
      },
      [faqs, lang, isThinking, streamingMessageId, getAnswerById, addBotResponse]
    );

    const handleRate = useCallback((messageId: string, rating: 'up' | 'down') => {
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, rating } : m))
      );
    }, []);

    const handleClearChat = useCallback(() => {
      setMessages([]);
      setUsedSuggestionIds(new Set());
      setLastCategory(undefined);
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      setStreamingMessageId(null);
      setStreamedContent('');
      setIsThinking(false);
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const openWhatsApp = (message?: string) => {
      if (!formattedNumber) return;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const baseUrl = isMobile
        ? `https://wa.me/${formattedNumber}`
        : `https://web.whatsapp.com/send?phone=${formattedNumber}`;
      const finalUrl = isMobile
        ? message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl
        : message ? `${baseUrl}&text=${encodeURIComponent(message)}` : baseUrl;

      const link = document.createElement('a');
      link.href = finalUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // ---- Message content renderer ----
    const renderMessageContent = (msg: Message) => {
      const isCurrentlyStreaming = msg.isStreaming && msg.id === streamingMessageId;
      const displayContent = isCurrentlyStreaming ? streamedContent : msg.content;

      if (msg.type === 'user') {
        return <p className="text-[13px] leading-relaxed break-words">{displayContent}</p>;
      }

      return (
        <div className="space-y-0.5">
          {renderMarkdown(displayContent)}
          {isCurrentlyStreaming && (
            <span className="inline-block w-0.5 h-3.5 bg-foreground/60 ml-0.5 animate-pulse align-middle" />
          )}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={`fixed bottom-24 md:bottom-6 ${positionClasses[position]} z-50 transition-all duration-300 ease-out ${shiftClass}`}
        {...props}
      >
        {/* ── Chat Window ── */}
        {shouldRender && (
          <div
            className={cn(
              'absolute bottom-20 right-0 w-[92vw] max-w-[380px] bg-card dark:bg-[#111C16] border border-border/90 rounded-2xl shadow-2xl shadow-black/25 overflow-hidden z-50 transition-all duration-200 ease-out flex flex-col ring-1 ring-black/5 dark:ring-white/10',
              isOpen
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
            )}
            style={{ maxHeight: '520px' }}
          >
            {/* Header */}
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between gap-2 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Animated bot avatar */}
                <div
                  className={cn(
                    'w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 transition-all duration-300',
                    isThinking && 'ring-2 ring-white/50 ring-offset-1 ring-offset-primary'
                  )}
                >
                  <AppIcon name="solar:chat-round-dots-bold-duotone" className={cn('w-5 h-5 text-white', isThinking && 'animate-pulse')} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-sm truncate text-white">{t.title}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
                    <p className="text-xs font-bold text-white/90 truncate">
                      {isThinking ? (lang === 'en' ? 'Thinking...' : 'Sedang berpikir...') : t.subtitle}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Clear chat button */}
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:text-white hover:bg-white/20 font-bold"
                    onClick={handleClearChat}
                    title={t.clearChat}
                  >
                    <AppIcon name="solar:trash-bin-trash-bold" className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 transition-transform hover:rotate-90 duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <AppIcon name="solar:close-circle-bold" className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-3 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id}>
                    {/* Message bubble */}
                    <div
                      className={cn(
                        'flex gap-2 items-end',
                        msg.type === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {msg.type === 'bot' && (
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mb-5 transition-all duration-300',
                            msg.isStreaming && msg.id === streamingMessageId && 'ring-2 ring-primary/30'
                          )}
                        >
                          <AppIcon name="solar:chat-round-dots-bold-duotone" className={cn('w-3.5 h-3.5 text-primary', msg.isStreaming && msg.id === streamingMessageId && 'animate-pulse')} />
                        </div>
                      )}

                      <div className="flex flex-col gap-1 max-w-[85%]">
                        <div
                          className={cn(
                            'rounded-2xl px-3 py-2',
                            msg.type === 'user'
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          )}
                        >
                          {renderMessageContent(msg)}
                        </div>

                        {/* Timestamp */}
                        <span
                          className={cn(
                            'text-[10px] text-muted-foreground/60 px-1',
                            msg.type === 'user' ? 'text-right' : 'text-left'
                          )}
                        >
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>

                      {msg.type === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mb-5">
                          <AppIcon name="solar:user-bold" className="w-3.5 h-3.5 text-secondary-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Rating buttons for bot messages (shown after streaming is done) */}
                    {msg.type === 'bot' && !msg.isStreaming && msg.id !== 'welcome' && (
                      <div className={cn('flex gap-1.5 ml-8 mt-1', msg.showWhatsApp ? 'mb-1' : '')}>
                        <button
                          onClick={() => handleRate(msg.id, 'up')}
                          className={cn(
                            'p-1 rounded-md transition-colors text-xs flex items-center gap-1',
                            msg.rating === 'up'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'text-muted-foreground/50 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                          )}
                          title={t.rateUp}
                        >
                          <AppIcon name="solar:like-bold" className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRate(msg.id, 'down')}
                          className={cn(
                            'p-1 rounded-md transition-colors text-xs flex items-center gap-1',
                            msg.rating === 'down'
                              ? 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400'
                              : 'text-muted-foreground/50 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                          )}
                          title={t.rateDown}
                        >
                          <AppIcon name="solar:dislike-bold" className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* WhatsApp CTA */}
                    {msg.showWhatsApp && !msg.isStreaming && whatsappNumber && (
                      <div className="ml-8 mt-2">
                        <button
                          onClick={() => openWhatsApp()}
                          className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 rounded-full text-xs font-medium transition-colors shadow-sm"
                        >
                          <AppIcon name="solar:phone-calling-rounded-bold" className="w-3.5 h-3.5" />
                          {t.contactWhatsApp}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Thinking indicator (3 animated dots) */}
                {isThinking && (
                  <div className="flex gap-2 justify-start items-end">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mb-5">
                      <AppIcon name="solar:chat-round-dots-bold-duotone" className="w-3.5 h-3.5 text-primary animate-pulse" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 mb-5">
                      <div className="flex gap-1 items-center h-3">
                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* ── Collapsible Suggestions Panel (outside scroll area) ── */}
            {suggestions.length > 0 && !isThinking && !streamingMessageId && (
              <div className="flex-shrink-0 border-t border-border">
                {/* Toggle button */}
                <button
                  onClick={() => setIsSuggestionsOpen(prev => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <AppIcon name="solar:stars-minimalistic-bold" className="w-3 h-3 text-primary" />
                    <span className="font-medium">{t.suggestions}</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                      {suggestions.length}
                    </span>
                  </div>
                  <AppIcon
                    name="solar:alt-arrow-down-linear"
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      isSuggestionsOpen ? 'rotate-180' : 'rotate-0'
                    )}
                  />
                </button>

                {/* Animated suggestions list */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-200 ease-in-out',
                    isSuggestionsOpen ? 'max-h-52 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="px-2 pb-2 space-y-1 overflow-y-auto max-h-52">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion.id)}
                        className="w-full text-left flex items-start gap-2 text-xs bg-muted/40 hover:bg-primary/8 text-foreground px-3 py-2 rounded-lg transition-all duration-150 leading-relaxed border border-transparent hover:border-primary/30 hover:shadow-sm group/item"
                      >
                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-semibold mt-0.5">
                          {index + 1}
                        </span>
                        <span className="flex-1">{suggestion.question}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t border-border bg-muted/30 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.placeholder}
                  className="flex-1 bg-background text-xs h-9 rounded-xl"
                  disabled={faqsLoading || isThinking || !!streamingMessageId}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || faqsLoading || isThinking || !!streamingMessageId}
                  className="shrink-0 h-9 w-9 rounded-xl"
                >
                  <AppIcon name="solar:plain-bold-duotone" className="w-4 h-4" />
                </Button>
              </div>

              {whatsappNumber && (
                <button
                  onClick={() => openWhatsApp()}
                  className="w-full mt-2 text-[11px] text-muted-foreground hover:text-[#25D366] flex items-center justify-center gap-1 py-1 transition-colors"
                >
                  <AppIcon name="solar:phone-bold" className="w-3 h-3" />
                  <span>{t.needMoreHelp} {t.contactWhatsApp}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Toggle Button ── */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'group relative',
            !isOpen && 'animate-gentle-float-delayed'
          )}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {/* Soft Ambient Glow Ring */}
          {!isOpen && (
            <div
              className="absolute -inset-1 rounded-full bg-primary/30 animate-soft-glow blur-sm pointer-events-none"
            />
          )}

          <div
            className={cn(
              'relative w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ease-out shadow-lg hover:shadow-2xl',
              isOpen
                ? 'bg-muted text-muted-foreground scale-95'
                : 'bg-primary text-white hover:scale-110 active:scale-95'
            )}
          >
            {isOpen ? (
              <AppIcon name="solar:close-circle-bold" className="w-5 h-5 md:w-7 md:h-7" />
            ) : customIconUrl ? (
              <img
                src={customIconUrl}
                alt="Chat"
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <AppIcon name="solar:chat-round-dots-bold-duotone" className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-sm" />
            )}
          </div>
        </button>
      </div>
    );
  }
);

FloatingChatbot.displayName = 'FloatingChatbot';

export default FloatingChatbot;
