import { useState, useMemo } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: TablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-transparent">
      {/* Info & Page Size */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="hidden sm:inline">
          Menampilkan {startItem}-{endItem} dari {totalItems} data
        </span>
        <span className="sm:hidden">
          {startItem}-{endItem} / {totalItems}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs">Per halaman:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[72px] text-xs rounded-lg border-border bg-card text-foreground font-semibold shadow-2xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <AppIcon name="solar:double-alt-arrow-left-linear" className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <AppIcon name="solar:alt-arrow-left-linear" className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1 mx-2">
          {/* Page numbers */}
          {(() => {
            const pages: (number | string)[] = [];
            const maxVisible = 5;
            
            if (totalPages <= maxVisible) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
              } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
              } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
              }
            }
            
            return pages.map((page, idx) => (
              typeof page === 'number' ? (
                <Button
                  key={idx}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon"
                  className={`h-8 w-8 text-xs rounded-lg font-bold transition-all ${
                    currentPage === page 
                      ? 'bg-primary text-white border-transparent shadow-xs' 
                      : 'border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                  }`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              ) : (
                <span key={idx} className="px-1 text-muted-foreground">...</span>
              )
            ));
          })()}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <AppIcon name="solar:alt-arrow-right-linear" className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <AppIcon name="solar:double-alt-arrow-right-linear" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Custom hook for pagination logic
export function usePagination<T>(items: T[], defaultPageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [items, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  // Reset to page 1 when items change significantly
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange,
  };
}
