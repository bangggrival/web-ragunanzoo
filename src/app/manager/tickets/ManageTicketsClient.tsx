"use client";

import { Ticket, Search, Eye, CheckCircle, XCircle, Clock, Download, TicketIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TablePagination, usePagination } from '@/components/ui/TablePagination';
import { TicketData } from './actions';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

interface ManageTicketsClientProps {
  initialTickets: TicketData[];
}

export default function ManageTicketsClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState<TicketData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
        if (data) setTickets(data as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'tickets') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTickets = tickets.filter(ticket => {
    const query = debouncedSearchQuery.toLowerCase();
    const matchesSearch = !query || Object.values(ticket).some(val => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(query)
    );
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredTickets, 10);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-50 text-green-600 border-green-200', icon: CheckCircle, label: 'Aktif' };
      case 'used':
        return { color: 'bg-slate-100 text-slate-500 border-slate-200', icon: Clock, label: 'Terpakai' };
      case 'expired':
        return { color: 'bg-rose-50 text-rose-600 border-rose-200', icon: XCircle, label: 'Kadaluarsa' };
      default:
        return { color: 'bg-slate-100 text-slate-500 border-slate-200', icon: Clock, label: status || 'Unknown' };
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Kode', 'Tanggal Kunjungan', 'Jumlah', 'Tipe', 'Harga', 'Total', 'Status', 'Dibuat'];
    const rows = filteredTickets.map(t => [
      t.id,
      t.code || '',
      t.visit_date,
      t.quantity,
      t.ticket_type || '',
      t.price,
      t.total,
      t.status || '',
      t.created_at
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tiket_ragunan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Data tiket berhasil diexport!');
  };

  const totalRevenue = tickets.reduce((acc, t) => acc + Number(t.total), 0);
  const activeTickets = tickets.filter(t => t.status === 'active').length;
  const usedTickets = tickets.filter(t => t.status === 'used').length;

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-3 w-32 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm">
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm p-8">
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <TicketIcon className="w-5 h-5 text-green-500" />
            </div>
            Tiket & Transaksi
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola penjualan tiket dan transaksi</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-bold shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Transaksi</p>
          <p className="text-3xl font-black text-slate-800">{tickets.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-violet-600 p-5 rounded-[1.5rem] shadow-lg shadow-green-500/20 text-white flex flex-col justify-between">
          <p className="text-sm font-bold text-green-100 uppercase tracking-wider mb-2">Total Pendapatan</p>
          <p className="text-2xl font-black">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <p className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2">Tiket Aktif</p>
          <p className="text-3xl font-black text-green-500">{activeTickets}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Tiket Terpakai</p>
          <p className="text-3xl font-black text-slate-400">{usedTickets}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/60 backdrop-blur-xl rounded-[1.5rem] border border-white/80 shadow-sm">
        <div className="relative flex-1 ml-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode tiket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <div className="w-px h-8 bg-slate-200 hidden sm:block self-center"></div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="mr-2 px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="used">Terpakai</option>
          <option value="expired">Kadaluarsa</option>
        </select>
      </div>

      <div className="manager-table-shell">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <Ticket className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak ada tiket</h3>
            <p className="text-slate-500 max-w-md mx-auto">Tidak ada data tiket yang sesuai dengan pencarian Anda.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block manager-table-scroll">
              <table className="manager-table">
                <thead className="manager-table-head">
                  <tr>
                    <th className="manager-table-th rounded-tl-[1rem]">Kode Tiket</th>
                    <th className="manager-table-th">Tanggal</th>
                    <th className="manager-table-th">Jumlah</th>
                    <th className="manager-table-th">Total</th>
                    <th className="manager-table-th">Status</th>
                    <th className="manager-table-th manager-table-th-right rounded-tr-[1rem]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((ticket) => {
                    const status = getStatusBadge(ticket.status);
                    const StatusIcon = status.icon;
                    return (
                      <tr key={ticket.id} className="manager-table-row">
                        <td className="manager-table-td">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/60 shadow-sm">
                              <Ticket className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="font-mono font-bold text-sm text-slate-800">{ticket.code || `TKT-${ticket.id}`}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ID: {ticket.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="manager-table-td">
                          <p className="text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
                            {new Date(ticket.visit_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="manager-table-td">
                          <p className="text-sm font-bold text-slate-700">
                            {ticket.quantity}× <span className="text-slate-400 font-medium">{ticket.ticket_type === 'vip' ? 'VIP' : 'Regular'}</span>
                          </p>
                        </td>
                        <td className="manager-table-td">
                          <p className="font-black text-slate-800">{formatPrice(Number(ticket.total))}</p>
                        </td>
                        <td className="manager-table-td">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </span>
                        </td>
                        <td className="manager-table-td manager-table-td-right">
                          <div className="manager-table-actions justify-end">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Fallback View */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedItems.map((ticket) => {
                const status = getStatusBadge(ticket.status);
                const StatusIcon = status.icon;
                return (
                  <div key={ticket.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/60 shadow-sm flex-shrink-0">
                          <Ticket className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono font-bold text-sm text-slate-800 truncate">{ticket.code || `TKT-${ticket.id}`}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ID: {ticket.id}</p>
                        </div>
                      </div>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Tanggal</p>
                        <p className="font-bold text-slate-700">{new Date(ticket.visit_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Jumlah</p>
                        <p className="font-bold text-slate-700">{ticket.quantity}× <span className="text-slate-400 font-medium">{ticket.ticket_type === 'vip' ? 'VIP' : 'Reg'}</span></p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Bayar</p>
                        <p className="font-black text-slate-800">{formatPrice(Number(ticket.total))}</p>
                      </div>
                      <button className="px-3 py-1.5 text-xs font-bold rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-slate-200/50 mt-2 pt-4">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
