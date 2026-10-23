"use client";

import { useState } from 'react';
import { Book, Download, Search, BookOpen, Filter, Star, Eye, Leaf, PawPrint, Globe, GraduationCap, Compass, Scroll } from 'lucide-react';
import { useBooks, BOOK_CATEGORIES } from '@/hooks/useBooks';

function renderBookCategoryIcon(categoryValue: string, className: string = "w-3.5 h-3.5") {
  switch (categoryValue) {
    case 'flora':
      return <Leaf className={className} />;
    case 'fauna':
      return <PawPrint className={className} />;
    case 'konservasi':
      return <Globe className={className} />;
    case 'edukasi':
      return <GraduationCap className={className} />;
    case 'panduan':
      return <Compass className={className} />;
    case 'sejarah':
      return <Scroll className={className} />;
    case 'umum':
    default:
      return <BookOpen className={className} />;
  }
}
import { useLanguage } from '@/contexts/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { incrementBookViewAction } from '@/app/manager/library/actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function Library() {
  const { language } = useLanguage();
  const { books, loading, getCategoryLabel, getCategoryIcon, incrementViewCount, incrementDownloadCount } = useBooks();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedBook, setSelectedBook] = useState<typeof books[0] | null>(null);

  const publishedBooks = books.filter(b => b.is_published);
  const featuredBooks = publishedBooks.filter(b => b.is_featured);

  const filteredBooks = publishedBooks.filter(book => {
    const title = language === 'en' && book.title_en ? book.title_en : book.title_id;
    const matchesSearch = title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (book.author && book.author.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
    const matchesCategory = !categoryFilter || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getTitle = (book: typeof books[0]) => {
    return language === 'en' && book.title_en ? book.title_en : book.title_id;
  };

  const getDescription = (book: typeof books[0]) => {
    return language === 'en' && book.description_en ? book.description_en : book.description_id;
  };

  const handleReadBook = (book: typeof books[0]) => {
    if (book.file_url) {
      incrementViewCount(book.id);
      incrementBookViewAction(book.id);
      window.open(book.file_url, '_blank');
    }
  };

  const handleDownloadBook = (book: typeof books[0]) => {
    if (book.file_url) {
      incrementDownloadCount(book.id);
      const link = document.createElement('a');
      link.href = book.file_url;
      link.download = `${book.title_id}.${book.file_type || 'pdf'}`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {language === 'en' ? 'Digital Library' : 'Perpustakaan Digital'}
              </h1>
              <p className="text-white/80 text-sm">
                {language === 'en' 
                  ? 'Explore our collection about flora, fauna and conservation'
                  : 'Jelajahi koleksi tentang flora, fauna dan konservasi'}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Search books...' : 'Cari buku...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
              />
            </div>
            
            {/* My Library Link */}
            <button 
              onClick={() => window.location.href = '/my-library'}
              className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl backdrop-blur transition-all text-white font-medium shadow-sm w-max"
            >
              <Book className="w-5 h-5" />
              {language === 'en' ? 'My Library' : 'Koleksi Saya'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categoryFilter === '' 
                ? 'bg-primary text-white' 
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
          >
            {language === 'en' ? 'All' : 'Semua'}
          </button>
          {BOOK_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all flex items-center gap-2 border ${
                categoryFilter === cat.value 
                  ? 'bg-primary text-white border-primary shadow-sm' 
                  : 'bg-card/80 hover:bg-muted text-foreground border-border/70 hover:border-primary/40'
              }`}
            >
              <span className={`p-1 rounded-full flex items-center justify-center ${categoryFilter === cat.value ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                {renderBookCategoryIcon(cat.value, "w-3 h-3")}
              </span>
              <span>{language === 'en' ? cat.label_en : cat.label_id}</span>
            </button>
          ))}
        </div>

        {/* Featured Section */}
        {featuredBooks.length > 0 && !searchQuery && !categoryFilter && (
          <div className="mb-10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-secondary" />
              {language === 'en' ? 'Featured Books' : 'Buku Unggulan'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredBooks.slice(0, 4).map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  getTitle={getTitle}
                  getCategoryIcon={getCategoryIcon}
                  onRead={handleReadBook}
                  onDownload={handleDownloadBook}
                  language={language}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Book className="w-4 h-4" />
            {filteredBooks.length} {language === 'en' ? 'books' : 'buku'}
          </span>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-card rounded-xl border p-3 space-y-3">
                <Skeleton className="w-full aspect-[3/4] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Book className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              {language === 'en' ? 'No books found' : 'Tidak ada buku ditemukan'}
            </h3>
            <p className="text-sm text-muted-foreground/70">
              {language === 'en' ? 'Try adjusting your search or filters' : 'Coba ubah pencarian atau filter'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                getTitle={getTitle}
                getCategoryIcon={getCategoryIcon}
                onRead={handleReadBook}
                onDownload={handleDownloadBook}
                language={language}
              />
            ))}
          </div>
        )}


      </div>
    </div>
  );
}

// Book Card Component
function BookCard({
  book,
  getTitle,
  getCategoryIcon,
  onRead,
  onDownload,
  language,
}: {
  book: any;
  getTitle: (book: any) => string;
  getCategoryIcon: (cat: string) => string;
  onRead: (book: any) => void;
  onDownload: (book: any) => void;
  language: 'id' | 'en';
}) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Cover */}
      <div className="relative aspect-[3/4] bg-muted">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={getTitle(book)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Book className="w-12 h-12 text-primary/40" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5 px-2 py-1 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-sm border border-black/5 dark:border-white/10">
          <span className="text-primary">{renderBookCategoryIcon(book.category, "w-3 h-3")}</span>
          <span className="text-foreground/80 font-medium capitalize">{book.category}</span>
        </div>

          {/* Premium Badge */}
          {book.is_premium && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg border border-amber-300">
              <Star className="w-3 h-3 text-amber-950 fill-amber-950 mr-1" />
              <span className="text-[10px] font-black text-amber-950 tracking-wider">PREMIUM</span>
            </div>
          )}
          {/* Featured Badge (if not premium) */}
          {book.is_featured && !book.is_premium && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-2">
          <h3 className="font-extrabold text-sm line-clamp-2 leading-tight">
            {getTitle(book)}
          </h3>
          
          {book.author && (
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
              {book.author}
            </p>
          )}

          {/* Stats and Price */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {book.page_count && (
                <span>{book.page_count} {language === 'en' ? 'pages' : 'hal'}</span>
              )}
              <span className="flex items-center gap-0.5">
                <Eye className="w-3 h-3" />
                {book.view_count || 0}
              </span>
            </div>
            {book.is_premium && book.price > 0 && (
              <span className="text-xs font-bold text-amber-600">
                Rp {book.price.toLocaleString('id-ID')}
              </span>
            )}
            {!book.is_premium && (
              <span className="text-xs font-bold text-green-600">
                {language === 'en' ? 'Free' : 'Gratis'}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                if (book.is_premium) {
                  window.location.href = `/library/${book.id}`;
                } else {
                  onRead(book);
                }
              }}
              disabled={!book.is_premium && !book.file_url}
              className={`flex-1 h-8 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${
                book.is_premium 
                  ? 'bg-amber-500 hover:bg-amber-600 text-amber-950' 
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {book.is_premium ? (
                <>
                  <Book className="w-3 h-3" />
                  {language === 'en' ? 'Details' : 'Detail'}
                </>
              ) : (
                <>
                  <BookOpen className="w-3 h-3" />
                  {language === 'en' ? 'Read' : 'Baca'}
                </>
              )}
            </button>
            
            {!book.is_premium && (
              <button
                onClick={() => onDownload(book)}
                disabled={!book.file_url}
                className="h-8 w-8 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Download className="w-3 h-3" />
              </button>
            )}
          </div>
      </div>
    </div>
  );
}
