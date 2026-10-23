'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, Clock, CheckCircle2, AlertCircle, FileWarning, Loader2 } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

function TrackReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTicket = searchParams.get('ticket') || '';
  
  const [ticketNumber, setTicketNumber] = useState(initialTicket);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load history from local storage
    try {
      const saved = JSON.parse(localStorage.getItem('ragunan_facility_tickets') || '[]');
      setHistory(saved.reverse());
    } catch (e) {
      console.error(e);
    }

    if (initialTicket) {
      fetchReport(initialTicket);
    }
  }, [initialTicket]);

  const fetchReport = async (ticket: string) => {
    if (!ticket) return;
    setLoading(true);
    setError('');
    setReport(null);
    
    try {
      const { data, error } = await supabase
        .from('facility_reports')
        .select('*')
        .eq('ticket_number', ticket)
        .single();
        
      if (error) throw error;
      if (!data) throw new Error('Tiket tidak ditemukan');
      
      setReport(data);
    } catch (err: any) {
      setError('Laporan tidak ditemukan. Pastikan nomor tiket Anda benar.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/track-report?ticket=${ticketNumber}`);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'menunggu': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'diproses': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'selesai': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'ditolak': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'menunggu': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'diproses': return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'selesai': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'ditolak': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <AnimatedSection>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Lacak Laporan Anda</h1>
          <p className="text-muted-foreground">
            Masukkan Nomor Tiket untuk melihat status perbaikan fasilitas yang Anda laporkan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cari Tiket</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <Input 
                    placeholder="RAG-RPT-XXXXX" 
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
                    required
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                    Cari Laporan
                  </Button>
                </form>
              </CardContent>
            </Card>

            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Riwayat Anda</CardTitle>
                  <CardDescription>Laporan yang tersimpan di perangkat ini</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {history.map((item, idx) => (
                      <li key={idx}>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => {
                            setTicketNumber(item.ticket_number);
                            fetchReport(item.ticket_number);
                            router.push(`/track-report?ticket=${item.ticket_number}`);
                          }}
                        >
                          <div>
                            <div className="font-semibold">{item.ticket_number}</div>
                            <div className="text-xs text-muted-foreground">{item.category}</div>
                          </div>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-2">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 flex items-center">
                <AlertCircle className="w-5 h-5 mr-3" />
                {error}
              </div>
            )}

            {!report && !error && !loading && (
              <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                <FileWarning className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">Silakan masukkan nomor tiket</h3>
              </div>
            )}

            {loading && !report && (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            )}

            {report && (
              <AnimatedSection>
                <Card className="overflow-hidden border-2 shadow-sm">
                  <div className="bg-muted p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Nomor Tiket</p>
                      <h2 className="text-2xl font-bold tracking-tight">{report.ticket_number}</h2>
                    </div>
                    <div className={`px-4 py-2 rounded-full border flex items-center gap-2 font-semibold ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      {report.status}
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tanggal Dilaporkan</p>
                        <p className="font-medium">{new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Kategori Masalah</p>
                        <p className="font-medium">{report.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Pelapor</p>
                        <p className="font-medium">{report.is_anonymous ? 'Anonim' : (report.reporter_name || 'Hamba Allah')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Lokasi Kejadian</p>
                        <p className="font-medium flex items-center">
                          {report.location_name || 'Tidak ada spesifikasi lokasi'}
                          {report.latitude && (
                            <MapPin className="w-4 h-4 ml-2 text-primary" />
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Deskripsi Kerusakan</p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{report.description}</p>
                    </div>

                    {report.image_url && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Bukti Foto</p>
                        <img 
                          src={report.image_url} 
                          alt="Bukti fasilitas" 
                          className="rounded-lg border w-full max-w-md object-cover"
                        />
                      </div>
                    )}

                    {report.admin_notes && (
                      <div className="pt-4 border-t">
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <p className="text-sm font-semibold text-primary mb-2 flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Tanggapan Petugas:
                          </p>
                          <p className="text-sm leading-relaxed">{report.admin_notes}</p>
                        </div>
                      </div>
                    )}

                  </CardContent>
                </Card>
              </AnimatedSection>
            )}
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}

export default function TrackReportPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center">Memuat data...</div>}>
      <TrackReportContent />
    </Suspense>
  );
}
