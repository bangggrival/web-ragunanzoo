'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppIcon } from '@/components/ui/AppIcon';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function ReportFacilityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reporter_name: '',
    is_anonymous: false,
    category: '',
    description: '',
    location_name: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [file, setFile] = useState<File | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Browser Anda tidak mendukung fitur lokasi (GPS).');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        toast.success('Lokasi GPS berhasil didapatkan.');
      },
      (error) => {
        toast.error('Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.description) {
      toast.error('Kategori dan Deskripsi masalah wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      let imageUrl: string | null = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('facility-reports')
          .upload(filePath, file);

        if (uploadError) throw new Error(uploadError.message);
        
        const { data: urlData } = supabase.storage
          .from('facility-reports')
          .getPublicUrl(uploadData.path);
          
        imageUrl = urlData.publicUrl;
      }

      // Generate Ticket Number (Client side for simplicity, though server could do it too)
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const ticketNumber = `RAG-RPT-${randomStr}`;

      const { data, error } = await supabase.from('facility_reports').insert({
        ticket_number: ticketNumber,
        reporter_name: formData.is_anonymous ? null : formData.reporter_name,
        is_anonymous: formData.is_anonymous,
        category: formData.category,
        description: formData.description,
        location_name: formData.location_name,
        latitude: formData.latitude,
        longitude: formData.longitude,
        image_url: imageUrl,
      });

      if (error) throw new Error(error.message);

      // Save ticket to localStorage
      const savedTickets = JSON.parse(localStorage.getItem('ragunan_facility_tickets') || '[]');
      savedTickets.push({
        ticket_number: ticketNumber,
        created_at: new Date().toISOString(),
        category: formData.category
      });
      localStorage.setItem('ragunan_facility_tickets', JSON.stringify(savedTickets));

      toast.success('Laporan berhasil dikirim!');
      router.push(`/track-report?ticket=${ticketNumber}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Terjadi kesalahan saat mengirim laporan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <AnimatedSection>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <AppIcon icon="FileWarning" className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Lapor Kerusakan Fasilitas</h1>
          <p className="text-muted-foreground mb-4">
            Bantu kami menjaga kenyamanan Taman Margasatwa Ragunan. Laporkan fasilitas yang rusak atau perlu perbaikan.
          </p>
          <Button variant="outline" onClick={() => router.push('/track-report')} className="mx-auto rounded-full">
            <AppIcon icon="Search" className="w-4 h-4 mr-2" />
            Lacak Status Laporan Saya
          </Button>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              
              <div className="flex items-center space-x-2 bg-muted/50 p-4 rounded-lg">
                <Checkbox 
                  id="anonymous" 
                  checked={formData.is_anonymous}
                  onCheckedChange={(checked) => setFormData({...formData, is_anonymous: checked as boolean})}
                />
                <Label htmlFor="anonymous" className="cursor-pointer">Sembunyikan identitas saya (Lapor Anonim)</Label>
              </div>

              {!formData.is_anonymous && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Anda (Opsional)</Label>
                  <Input 
                    id="name" 
                    placeholder="Masukkan nama Anda"
                    value={formData.reporter_name}
                    onChange={(e) => setFormData({...formData, reporter_name: e.target.value})}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category">Kategori Laporan <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori masalah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kelistrikan & Penerangan">Kelistrikan & Penerangan</SelectItem>
                    <SelectItem value="Kebersihan & Sampah">Kebersihan & Sampah</SelectItem>
                    <SelectItem value="Infrastruktur & Bangunan">Infrastruktur & Bangunan</SelectItem>
                    <SelectItem value="Kandang & Fasilitas Satwa">Kandang & Fasilitas Satwa</SelectItem>
                    <SelectItem value="Fasilitas Umum (Toilet/Bangku)">Fasilitas Umum (Toilet/Bangku)</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Masalah <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="description" 
                  placeholder="Ceritakan detail kerusakan yang Anda temukan..."
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasi (Patokan Tempat)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="location" 
                    placeholder="Contoh: Dekat kandang Gajah"
                    value={formData.location_name}
                    onChange={(e) => setFormData({...formData, location_name: e.target.value})}
                  />
                  <Button type="button" variant="outline" onClick={handleGetLocation} className="shrink-0" title="Dapatkan Lokasi GPS">
                    <AppIcon icon="MapPin" className="w-4 h-4 mr-2" />
                    GPS
                  </Button>
                </div>
                {formData.latitude && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    ✓ Koordinat GPS berhasil direkam ({formData.latitude.toFixed(4)}, {formData.longitude?.toFixed(4)})
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Bukti Foto</Label>
                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" className="w-full relative" onClick={() => document.getElementById('photo-upload')?.click()}>
                    <AppIcon icon="Camera" className="w-4 h-4 mr-2" />
                    {file ? file.name : 'Ambil / Pilih Foto'}
                    <input 
                      type="file" 
                      id="photo-upload" 
                      accept="image/*" 
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFile(e.target.files[0]);
                        }
                      }}
                    />
                  </Button>
                </div>
              </div>

            </CardContent>
            <CardFooter className="bg-muted/30 pt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <AppIcon icon="Loader2" className="w-4 h-4 mr-2 animate-spin" /> : null}
                {loading ? 'Mengirim Laporan...' : 'Kirim Laporan'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </AnimatedSection>
    </div>
  );
}
