"use client";

import { useState } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { useJdihDocuments, JDIH_TYPES, JDIH_STATUSES } from '@/hooks/useJdihDocuments';

function renderJdihTypeIcon(type: string, className: string = "w-5 h-5") {
  switch (type) {
    case 'peraturan':
      return <AppIcon icon="Scroll" className={className} />;
    case 'keputusan':
      return <AppIcon icon="ClipboardCheck" className={className} />;
    case 'instruksi':
      return <AppIcon icon="Pin" className={className} />;
    case 'surat_edaran':
      return <AppIcon icon="Mail" className={className} />;
    case 'pedoman':
      return <AppIcon icon="BookOpen" className={className} />;
    default:
      return <AppIcon icon="FileText" className={className} />;
  }
}
import { useLanguage } from '@/contexts/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Skeleton } from '@/components/ui/skeleton';

export default function JDIH() {
  const { language } = useLanguage();
  const { documents, loading, getTypeLabel, getStatusInfo } = useJdihDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const published = documents.filter(d => d.is_published);
  const years = [...new Set(published.map(d => d.year))].sort((a, b) => b - a);

  const filtered = published.filter(doc => {
    const title = language === 'en' && doc.title_en ? doc.title_en : doc.title_id;
    const matchesSearch =
      title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      doc.document_number.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    const matchesType = !typeFilter || doc.type === typeFilter;
    const matchesStatus = !statusFilter || doc.status === statusFilter;
    const matchesYear = !yearFilter || doc.year.toString() === yearFilter;
    return matchesSearch && matchesType && matchesStatus && matchesYear;
  });

  const getTitle = (doc: typeof documents[0]) =>
    language === 'en' && doc.title_en ? doc.title_en : doc.title_id;

  const getDescription = (doc: typeof documents[0]) =>
    language === 'en' && doc.description_en ? doc.description_en : doc.description_id;

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <AppIcon icon="Scale" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">JDIH</h1>
              <p className="text-white/80 text-sm">
                {language === 'en'
                  ? 'Legal Documentation and Information Network'
                  : 'Jaringan Dokumentasi dan Informasi Hukum'}
              </p>
            </div>
          </div>

          <div className="relative max-w-xl">
            <AppIcon icon="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search documents...' : 'Cari dokumen...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 px-4 rounded-xl border border-border bg-card text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option className="bg-card text-foreground" value="">{language === 'en' ? 'All Types' : 'Semua Jenis'}</option>
            {JDIH_TYPES.map(t => (
              <option className="bg-card text-foreground" key={t.value} value={t.value}>
                {language === 'en' ? t.label_en : t.label_id}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 rounded-xl border border-border bg-card text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option className="bg-card text-foreground" value="">{language === 'en' ? 'All Status' : 'Semua Status'}</option>
            {JDIH_STATUSES.map(s => (
              <option className="bg-card text-foreground" key={s.value} value={s.value}>
                {language === 'en' ? s.label_en : s.label_id}
              </option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="h-11 px-4 rounded-xl border border-border bg-card text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option className="bg-card text-foreground" value="">{language === 'en' ? 'All Years' : 'Semua Tahun'}</option>
            {years.map(y => (
              <option className="bg-card text-foreground" key={y} value={y.toString()}>{y}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <AppIcon icon="FileText" className="w-4 h-4" />
            {filtered.length} {language === 'en' ? 'documents' : 'dokumen'}
          </span>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-card rounded-xl border p-5 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <AppIcon icon="FileText" className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              {language === 'en' ? 'No documents found' : 'Tidak ada dokumen ditemukan'}
            </h3>
            <p className="text-sm text-muted-foreground/70">
              {language === 'en' ? 'Try adjusting your search or filters' : 'Coba ubah pencarian atau filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(doc => {
              const statusInfo = getStatusInfo(doc.status);
              const isExpanded = expandedId === doc.id;
              const description = getDescription(doc);

              return (
                <div
                  key={doc.id}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Clickable Header */}
                  <button
                    onClick={() => toggleExpand(doc.id)}
                    className="w-full text-left p-5 flex items-start gap-4"
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/15">
                      {renderJdihTypeIcon(doc.type, "w-5 h-5 text-primary")}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-muted/80 rounded-full text-xs font-semibold text-foreground/80">
                          {renderJdihTypeIcon(doc.type, "w-3 h-3 text-primary")}
                          <span>{getTypeLabel(doc.type, language)}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {language === 'en' ? statusInfo.label_en : statusInfo.label_id}
                        </span>
                        <span className="text-xs text-muted-foreground">{doc.year}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-base text-foreground">{getTitle(doc)}</h3>

                      {/* Document Number */}
                      <p className="text-sm text-muted-foreground font-mono mt-0.5">{doc.document_number}</p>
                    </div>

                    {/* Expand icon */}
                    <div className="flex-shrink-0 mt-1 text-muted-foreground">
                      {isExpanded ? <AppIcon icon="ChevronUp" className="w-5 h-5" /> : <AppIcon icon="ChevronDown" className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-border pt-4 space-y-4 animate-fade-in">
                      {/* Description */}
                      {description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                      )}

                      {/* Date info */}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {doc.date_enacted && (
                          <div className="flex items-center gap-1.5">
                            <AppIcon icon="Calendar" className="w-3.5 h-3.5" />
                            {language === 'en' ? 'Enacted: ' : 'Ditetapkan: '}
                            {new Date(doc.date_enacted).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        )}
                        {doc.date_promulgated && (
                          <div className="flex items-center gap-1.5">
                            <AppIcon icon="Calendar" className="w-3.5 h-3.5" />
                            {language === 'en' ? 'Promulgated: ' : 'Diundangkan: '}
                            {new Date(doc.date_promulgated).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-3">
                        {doc.file_url ? (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            <AppIcon icon="Download" className="w-4 h-4" />
                            {language === 'en' ? 'Download Document' : 'Unduh Dokumen'}
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium rounded-lg bg-muted text-muted-foreground cursor-not-allowed">
                            <AppIcon icon="FileText" className="w-4 h-4" />
                            {language === 'en' ? 'File not available' : 'File belum tersedia'}
                          </span>
                        )}
                        {doc.source_url && (
                          <a
                            href={doc.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                          >
                            <AppIcon icon="ExternalLink" className="w-4 h-4" />
                            {language === 'en' ? 'View Source' : 'Lihat Sumber'}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
