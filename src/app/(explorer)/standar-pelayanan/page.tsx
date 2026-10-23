"use client";

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useServiceStandards } from '@/hooks/useServiceStandards';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Clock, 
  Banknote, 
  FileText, 
  ClipboardList, 
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { allIcons } from '@/components/ui/IconPicker';
import BackButton from '@/components/ui/BackButton';
import PageHeader from '@/components/ui/PageHeader';

export default function ServiceStandards() {
  const { language, t, getText } = useLanguage();
  const { data: standards, isLoading } = useServiceStandards();

  const getIcon = (iconName: string | null) => {
    if (!iconName) return FileText;
    return allIcons[iconName as keyof typeof allIcons] || FileText;
  };

  const renderList = (content: string | null) => {
    if (!content) return null;
    const items = content.split('\n').filter(item => item.trim() !== '');
    return (
      <ul className="space-y-1.5 text-xs sm:text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{item.replace(/^[-•*]\s*/, '')}</span>
          </li>
        ))}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8">
        <PageHeader
          icon={<FileText className="w-7 h-7 md:w-8 md:h-8" />}
          title={t('service_standards')}
          description={t('service_standards_subtitle')}
          backPath="/services"
        />
        <div className="container mx-auto px-4 py-4 md:py-6 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <PageHeader
        icon={<FileText className="w-7 h-7 md:w-8 md:h-8" />}
        title={t('service_standards')}
        description={t('service_standards_subtitle')}
        backPath="/services"
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        {standards && standards.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-2 md:space-y-3">
            {standards.map((standard, index) => {
              const Icon = getIcon(standard.icon);
              const serviceName = getText(standard.service_name_id, standard.service_name_en);
              const requirements = getText(standard.requirements_id, standard.requirements_en);
              const procedure = getText(standard.procedure_id, standard.procedure_en);
              const complaint = getText(standard.complaint_mechanism_id, standard.complaint_mechanism_en);

              return (
                <AccordionItem 
                  key={standard.id} 
                  value={standard.id}
                  className="border rounded-lg md:rounded-xl px-3 sm:px-4 md:px-5 bg-card shadow-sm"
                >
                  <AccordionTrigger className="hover:no-underline py-3 md:py-4">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-left w-full">
                      {/* Icon - scales with screen */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Service name with badge */}
                        <div className="flex items-start sm:items-center gap-1.5 sm:gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0 h-4 sm:h-5 flex-shrink-0">
                            {index + 1}
                          </Badge>
                          <span className="font-medium text-sm sm:text-base md:text-lg leading-tight">
                            {serviceName}
                          </span>
                        </div>
                        
                        {/* Quick info - duration & cost */}
                        {(standard.duration || standard.cost) && (
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mt-1 sm:mt-1.5">
                            {standard.duration && (
                              <span className="flex items-center gap-1 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="truncate max-w-[100px] sm:max-w-none">{standard.duration}</span>
                              </span>
                            )}
                            {standard.cost && (
                              <span className="flex items-center gap-1 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                                <Banknote className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="truncate max-w-[100px] sm:max-w-none">{standard.cost}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pb-3 sm:pb-4 md:pb-5">
                    <div className="space-y-3 sm:space-y-4 md:space-y-5 pt-2 sm:pt-3 border-t">
                      {/* Tablet/Desktop: 2-column grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                        {/* Requirements */}
                        {requirements && (
                          <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              <h4 className="font-semibold text-sm sm:text-base">{t('requirements')}</h4>
                            </div>
                            {renderList(requirements)}
                          </div>
                        )}

                        {/* Procedure */}
                        {procedure && (
                          <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              <h4 className="font-semibold text-sm sm:text-base">{t('procedure')}</h4>
                            </div>
                            {renderList(procedure)}
                          </div>
                        )}
                      </div>

                      {/* Complaint Mechanism - full width */}
                      {complaint && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            <h4 className="font-semibold text-sm sm:text-base">{t('complaint_mechanism')}</h4>
                          </div>
                          {renderList(complaint)}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="text-center py-12 md:py-16">
            <FileText className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-medium text-base md:text-lg mb-1">{t('no_service_standards')}</h3>
            <p className="text-sm md:text-base text-muted-foreground">{t('no_service_standards_desc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}