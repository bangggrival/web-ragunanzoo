"use client";

import React, { useState, useEffect } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TicketSettings, AdditionalTariffItem } from '@/hooks/useTicketContent';
import { updateTariffSettingsAction } from './actions';
import Link from 'next/link';

export default function ManageTariffsClient() {
  const [settings, setSettings] = useState<TicketSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Main Form State
  const [formData, setFormData] = useState({
    id: '',
    adult_price: 4000,
    child_price: 3000,
    schmutzer_weekday_price: 6000,
    schmutzer_weekend_price: 7500,
    parking_bike: 1000,
    parking_motor: 5000,
    parking_car: 10000,
    parking_bus: 15000,
    jakcard_card_price: 25000,
    jakcard_tier_1_balance: 20000,
    jakcard_tier_1_total: 45000,
    jakcard_tier_2_balance: 50000,
    jakcard_tier_2_total: 75000,
    legal_basis_text: 'Peraturan Daerah Provinsi DKI Jakarta No. 1 Tahun 2024 tentang Pajak Daerah dan Retribusi Daerah',
    tariff_notes_id: 'Pembayaran tiket masuk dan wahana di Taman Margasatwa Ragunan wajib menggunakan kartu JakCard Bank DKI atau kartu uang elektronik perbankan lainnya (Cashless).',
    tariff_notes_en: 'Payment for entrance and rides at Ragunan Zoo requires Bank DKI JakCard or other approved electronic money cards (Cashless).',
    additional_tariffs: [] as AdditionalTariffItem[],
  });

  // Modal State for adding/editing additional tariffs (Wahana & Sewa)
  const [isRideModalOpen, setIsRideModalOpen] = useState(false);
  const [editingRideIndex, setEditingRideIndex] = useState<number | null>(null);
  const [rideForm, setRideForm] = useState<AdditionalTariffItem>({
    id: '',
    name_id: '',
    name_en: '',
    price: 10000,
    unit_id: 'orang / putaran',
    unit_en: 'person / round',
    category: 'wahana'
  });

  // Live simulation state to preview calculations immediately
  const [simAdults, setSimAdults] = useState(2);
  const [simChildren, setSimChildren] = useState(1);
  const [simVehicle, setSimVehicle] = useState<'bike' | 'motor' | 'car' | 'bus'>('car');
  const [simSchmutzer, setSimSchmutzer] = useState(true);
  const [simDay, setSimDay] = useState<'weekday' | 'weekend'>('weekend');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticket_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data as TicketSettings);

        let parsedRides: AdditionalTariffItem[] = [];
        if (Array.isArray(data.additional_tariffs)) {
          parsedRides = data.additional_tariffs;
        } else if (typeof data.additional_tariffs === 'string') {
          try {
            const res = JSON.parse(data.additional_tariffs);
            parsedRides = Array.isArray(res) ? res : [];
          } catch {
            parsedRides = [];
          }
        }

        setFormData({
          id: data.id,
          adult_price: Number(data.adult_price) || 4000,
          child_price: Number(data.child_price) || 3000,
          schmutzer_weekday_price: Number(data.schmutzer_weekday_price) || 6000,
          schmutzer_weekend_price: Number(data.schmutzer_weekend_price) || 7500,
          parking_bike: Number(data.parking_bike) || 1000,
          parking_motor: Number(data.parking_motor) || 5000,
          parking_car: Number(data.parking_car) || 10000,
          parking_bus: Number(data.parking_bus) || 15000,
          jakcard_card_price: Number(data.jakcard_card_price) || 25000,
          jakcard_tier_1_balance: Number(data.jakcard_tier_1_balance) || 20000,
          jakcard_tier_1_total: Number(data.jakcard_tier_1_total) || 45000,
          jakcard_tier_2_balance: Number(data.jakcard_tier_2_balance) || 50000,
          jakcard_tier_2_total: Number(data.jakcard_tier_2_total) || 75000,
          legal_basis_text: data.legal_basis_text || 'Peraturan Daerah Provinsi DKI Jakarta No. 1 Tahun 2024 tentang Pajak Daerah dan Retribusi Daerah',
          tariff_notes_id: data.tariff_notes_id || '',
          tariff_notes_en: data.tariff_notes_en || '',
          additional_tariffs: parsedRides,
        });
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      toast.error('Gagal mengambil data tarif: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleRealtime = (e: any) => {
      if (e.detail?.table === 'ticket_settings') {
        fetchSettings();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, []);

  // Format currency helper
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  // Live simulation calculations
  const simEntryTotal = (simAdults * formData.adult_price) + (simChildren * formData.child_price);
  const simParkingRate = 
    simVehicle === 'bike' ? formData.parking_bike :
    simVehicle === 'motor' ? formData.parking_motor :
    simVehicle === 'car' ? formData.parking_car : formData.parking_bus;
  const simSchmutzerRate = simDay === 'weekend' ? formData.schmutzer_weekend_price : formData.schmutzer_weekday_price;
  const simSchmutzerTotal = simSchmutzer ? (simAdults + simChildren) * simSchmutzerRate : 0;
  const simGrandTotal = simEntryTotal + simParkingRate + simSchmutzerTotal;

  // Handle Save with dual resilience (Server Action + Client Fallback)
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sb-token') : null;
      
      const payload = {
        ...formData,
        token: token || undefined,
      };

      const result = await updateTariffSettingsAction(payload);
      if (!result.success) {
        // Fallback: If server action has cookie/auth issue, update directly via client Supabase
        if (formData.id) {
          const { id, ...dataToUpdate } = formData;
          const { error: clientError } = await supabase
            .from('ticket_settings')
            .update({
              ...dataToUpdate,
              adult_price: Number(dataToUpdate.adult_price) || 4000,
              child_price: Number(dataToUpdate.child_price) || 3000,
              schmutzer_weekday_price: Number(dataToUpdate.schmutzer_weekday_price) || 6000,
              schmutzer_weekend_price: Number(dataToUpdate.schmutzer_weekend_price) || 7500,
              parking_bike: Number(dataToUpdate.parking_bike) || 1000,
              parking_motor: Number(dataToUpdate.parking_motor) || 5000,
              parking_car: Number(dataToUpdate.parking_car) || 10000,
              parking_bus: Number(dataToUpdate.parking_bus) || 15000,
              jakcard_card_price: Number(dataToUpdate.jakcard_card_price) || 25000,
              jakcard_tier_1_balance: Number(dataToUpdate.jakcard_tier_1_balance) || 20000,
              jakcard_tier_1_total: Number(dataToUpdate.jakcard_tier_1_total) || 45000,
              jakcard_tier_2_balance: Number(dataToUpdate.jakcard_tier_2_balance) || 50000,
              jakcard_tier_2_total: Number(dataToUpdate.jakcard_tier_2_total) || 75000,
              legal_basis_text: dataToUpdate.legal_basis_text || '',
              tariff_notes_id: dataToUpdate.tariff_notes_id || '',
              tariff_notes_en: dataToUpdate.tariff_notes_en || '',
              additional_tariffs: JSON.stringify(dataToUpdate.additional_tariffs || []),
              updated_at: new Date().toISOString()
            })
            .eq('id', formData.id);

          if (clientError) {
            throw new Error(clientError.message || result.error);
          }
        } else {
          throw new Error(result.error);
        }
      }

      toast.success('Tarif dan harga tiket berhasil disimpan!');
      fetchSettings();
    } catch (err: any) {
      console.error('Save tariff error:', err);
      toast.error('Gagal menyimpan tarif: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setSaving(false);
    }
  };

  // Additional ride modal handlers
  const openAddRide = () => {
    setRideForm({
      id: `ride_${Date.now()}`,
      name_id: '',
      name_en: '',
      price: 10000,
      unit_id: 'orang / putaran',
      unit_en: 'person / round',
      category: 'wahana'
    });
    setEditingRideIndex(null);
    setIsRideModalOpen(true);
  };

  const openEditRide = (index: number) => {
    setRideForm({ ...formData.additional_tariffs[index] });
    setEditingRideIndex(index);
    setIsRideModalOpen(true);
  };

  const handleSaveRide = () => {
    if (!rideForm.name_id.trim()) {
      toast.error('Nama wahana (Indonesia) wajib diisi');
      return;
    }

    const updated = [...formData.additional_tariffs];
    if (editingRideIndex !== null) {
      updated[editingRideIndex] = rideForm;
    } else {
      updated.push(rideForm);
    }

    setFormData(prev => ({ ...prev, additional_tariffs: updated }));
    setIsRideModalOpen(false);
    toast.success(editingRideIndex !== null ? 'Wahana berhasil diubah' : 'Wahana baru ditambahkan');
  };

  const handleDeleteRide = (index: number) => {
    const updated = formData.additional_tariffs.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, additional_tariffs: updated }));
    toast.info('Wahana dihapus dari daftar');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4 md:p-8">
        <div className="h-10 bg-slate-200 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl border" />
          ))}
        </div>
        <div className="h-96 bg-slate-50 rounded-2xl border" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/20">
              <AppIcon icon="DollarSign" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <span>Pengaturan Tarif & Harga Tiket</span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Resmi Perda DKI
                </span>
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Kelola tarif tiket masuk, Pusat Primata Schmutzer, parkir kendaraan, kartu JakCard, dan wahana rekreasi.
              </p>
            </div>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <Link
            href="/tickets"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-sm font-semibold text-foreground transition-all shadow-2xs"
          >
            <AppIcon icon="Eye" className="w-4 h-4 text-emerald-600" />
            <span>Lihat Halaman Tiket</span>
            <AppIcon icon="ExternalLink" className="w-3.5 h-3.5 text-muted-foreground" />
          </Link>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-700/20 px-6 py-2.5 h-auto text-sm flex items-center gap-2"
          >
            <AppIcon icon="Save" className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Semua Tarif'}</span>
          </Button>
        </div>
      </div>

      {/* Metric / Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tiket Dewasa</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <AppIcon icon="Users" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{formatRupiah(formData.adult_price)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Per orang / kunjungan</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tiket Anak</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center">
              <AppIcon icon="Baby" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{formatRupiah(formData.child_price)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Per anak / kunjungan</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Parkir Mobil</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <AppIcon icon="Car" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{formatRupiah(formData.parking_car)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Sekali masuk / hari</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Wahana Tambahan</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <AppIcon icon="Sparkles" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{formData.additional_tariffs.length} Layanan</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Kereta, perahu, sepeda, dll.</p>
        </div>
      </div>

      {/* Main Grid: Forms Left (7 cols), Live Simulation Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Tabs: Tariff Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Tabs defaultValue="entrance" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-muted rounded-2xl gap-1">
              <TabsTrigger value="entrance" className="rounded-xl py-2.5 text-xs font-bold">
                Tiket Masuk
              </TabsTrigger>
              <TabsTrigger value="parking" className="rounded-xl py-2.5 text-xs font-bold">
                Parkir
              </TabsTrigger>
              <TabsTrigger value="jakcard" className="rounded-xl py-2.5 text-xs font-bold">
                JakCard
              </TabsTrigger>
              <TabsTrigger value="rides" className="rounded-xl py-2.5 text-xs font-bold">
                Wahana & Sewa
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: TIKET MASUK & SCHMUTZER */}
            <TabsContent value="entrance" className="space-y-5 pt-4">
              <Card className="rounded-3xl border border-border/80 shadow-xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2">
                    <AppIcon icon="Ticket" className="w-5 h-5 text-emerald-600" />
                    <span>Tarif Masuk Pintu Gerbang Utama</span>
                  </CardTitle>
                  <CardDescription>
                    Tarif resmi yang dibebankan per orang saat tap kartu masuk turnstile pintu gerbang Ragunan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                      <Label className="text-xs font-bold text-foreground">Pengunjung Dewasa (Rp)</Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={formData.adult_price}
                          onChange={(e) => setFormData({ ...formData, adult_price: Number(e.target.value) || 0 })}
                          className="pl-10 h-11 bg-card rounded-xl font-bold text-foreground"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Default DKI: Rp 4.000 / orang</p>
                    </div>

                    <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                      <Label className="text-xs font-bold text-foreground">Pengunjung Anak-Anak (Rp)</Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={formData.child_price}
                          onChange={(e) => setFormData({ ...formData, child_price: Number(e.target.value) || 0 })}
                          className="pl-10 h-11 bg-card rounded-xl font-bold text-foreground"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Anak usia 3 tahun ke atas (Default: Rp 3.000)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Schmutzer Primate Center */}
              <Card className="rounded-3xl border border-border/80 shadow-xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2">
                    <AppIcon icon="ShieldCheck" className="w-5 h-5 text-teal-600" />
                    <span>Pusat Primata Schmutzer</span>
                  </CardTitle>
                  <CardDescription>
                    Tarif tambahan untuk masuk kompleks konservasi primata Schmutzer (dibayar di loket Schmutzer).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                      <Label className="text-xs font-bold text-foreground">Hari Kerja / Weekday (Rp)</Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={formData.schmutzer_weekday_price}
                          onChange={(e) => setFormData({ ...formData, schmutzer_weekday_price: Number(e.target.value) || 0 })}
                          className="pl-10 h-11 bg-card rounded-xl font-bold text-foreground"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Selasa s.d. Jumat (Default: Rp 6.000)</p>
                    </div>

                    <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                      <Label className="text-xs font-bold text-foreground">Akhir Pekan & Libur / Weekend (Rp)</Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={formData.schmutzer_weekend_price}
                          onChange={(e) => setFormData({ ...formData, schmutzer_weekend_price: Number(e.target.value) || 0 })}
                          className="pl-10 h-11 bg-card rounded-xl font-bold text-foreground"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Sabtu, Minggu & Libur Nasional (Default: Rp 7.500)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Legal & Regulation Notes */}
              <Card className="rounded-3xl border border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <AppIcon icon="Scale" className="w-4 h-4 text-muted-foreground" />
                    <span>Dasar Hukum Regulasi Tarif</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={formData.legal_basis_text}
                    onChange={(e) => setFormData({ ...formData, legal_basis_text: e.target.value })}
                    className="h-10 bg-card rounded-xl text-xs font-medium"
                    placeholder="Contoh: Peraturan Daerah Provinsi DKI Jakarta..."
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Teks ini tampil sebagai catatan kaki legalitas resmi pada kalkulator dan halaman tiket pengunjung.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: PARKIR KENDARAAN */}
            <TabsContent value="parking" className="space-y-5 pt-4">
              <Card className="rounded-3xl border border-border/80 shadow-xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2">
                    <AppIcon icon="Car" className="w-5 h-5 text-amber-600" />
                    <span>Retribusi Parkir Kendaraan</span>
                  </CardTitle>
                  <CardDescription>
                    Tarif retribusi parkir sekali masuk untuk berbagai tipe kendaraan pengunjung.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sepeda */}
                    <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <AppIcon icon="Bike" className="w-4 h-4 text-emerald-600" />
                        <span>Sepeda Gowes (Rp)</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={formData.parking_bike}
                          onChange={(e) => setFormData({ ...formData, parking_bike: Number(e.target.value) || 0 })}
                          className="pl-10 h-11 bg-card rounded-xl font-bold text-foreground"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Default: Rp 1.000 / hari</p>
                    </div>

                    {/* Sepeda Motor */}
                    <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <AppIcon icon="Bike" className="w-4 h-4 text-amber-600" />
                        <span>Sepeda Motor / Roda Tiga (Rp)</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={formData.parking_motor}
                          onChange={(e) => setFormData({ ...formData, parking_motor: Number(e.target.value) || 0 })}
                          className="pl-10 h-11 bg-card rounded-xl font-bold text-foreground"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Default: Rp 5.000 / hari</p>
                    </div>

                    {/* Mobil / Minibus */}
                    <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <AppIcon icon="Car" className="w-4 h-4 text-teal-600" />
                        <span>Mobil Pribadi / Minibus (Rp)</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={formData.parking_car}
                          onChange={(e) => setFormData({ ...formData, parking_car: Number(e.target.value) || 0 })}
                          className="pl-10 h-11 bg-card rounded-xl font-bold text-foreground"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Sedan, Minibus, Pickup (Default: Rp 10.000)</p>
                    </div>

                    {/* Bus Pariwisata */}
                    <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <AppIcon icon="Bus" className="w-4 h-4 text-indigo-600" />
                        <span>Bus Besar / Truk (Rp)</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={formData.parking_bus}
                          onChange={(e) => setFormData({ ...formData, parking_bus: Number(e.target.value) || 0 })}
                          className="pl-10 h-11 bg-card rounded-xl font-bold text-foreground"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Bus Wisata & Truk (Default: Rp 15.000)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: JAKCARD & TOP-UP */}
            <TabsContent value="jakcard" className="space-y-5 pt-4">
              <Card className="rounded-3xl border border-border/80 shadow-xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2">
                    <AppIcon icon="CreditCard" className="w-5 h-5 text-amber-500" />
                    <span>Paket Penjualan Kartu JakCard Bank DKI</span>
                  </CardTitle>
                  <CardDescription>
                    Atur harga kartu fisik perdana dan paket saldo yang dijual di loket tiket Ragunan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                    <Label className="text-xs font-bold text-foreground">Biaya Cetak Kartu Fisik (Rp)</Label>
                    <div className="relative mt-1.5 max-w-xs">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                      <Input
                        type="number"
                        value={formData.jakcard_card_price}
                        onChange={(e) => setFormData({ ...formData, jakcard_card_price: Number(e.target.value) || 0 })}
                        className="pl-10 h-11 bg-card rounded-xl font-bold text-foreground"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">Biaya non-refundable kartu fisik Bank DKI (Default: Rp 25.000)</p>
                  </div>

                  {/* Tier 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-1">
                        Paket Starter 1 (Total Rp 45.000)
                      </span>
                      <Label className="text-xs font-semibold text-muted-foreground">Saldo Terisi (Rp)</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={formData.jakcard_tier_1_balance}
                          onChange={(e) => {
                            const bal = Number(e.target.value) || 0;
                            setFormData({
                              ...formData,
                              jakcard_tier_1_balance: bal,
                              jakcard_tier_1_total: bal + formData.jakcard_card_price
                            });
                          }}
                          className="pl-10 h-11 bg-card rounded-xl font-bold text-foreground"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mt-5 sm:mt-6 block">Total Bayar di Loket (Rp)</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={formData.jakcard_tier_1_total}
                          onChange={(e) => setFormData({ ...formData, jakcard_tier_1_total: Number(e.target.value) || 0 })}
                          className="pl-10 h-11 bg-card rounded-xl font-bold text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tier 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20">
                    <div>
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-1">
                        Paket Starter 2 (Total Rp 75.000)
                      </span>
                      <Label className="text-xs font-semibold text-muted-foreground">Saldo Terisi (Rp)</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={formData.jakcard_tier_2_balance}
                          onChange={(e) => {
                            const bal = Number(e.target.value) || 0;
                            setFormData({
                              ...formData,
                              jakcard_tier_2_balance: bal,
                              jakcard_tier_2_total: bal + formData.jakcard_card_price
                            });
                          }}
                          className="pl-10 h-11 bg-card rounded-xl font-bold text-foreground"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mt-5 sm:mt-6 block">Total Bayar di Loket (Rp)</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={formData.jakcard_tier_2_total}
                          onChange={(e) => setFormData({ ...formData, jakcard_tier_2_total: Number(e.target.value) || 0 })}
                          className="pl-10 h-11 bg-card rounded-xl font-bold text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: WAHANA REKREASI & SEWA */}
            <TabsContent value="rides" className="space-y-5 pt-4">
              <Card className="rounded-3xl border border-border/80 shadow-xs">
                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2">
                      <AppIcon icon="Sparkles" className="w-5 h-5 text-indigo-500" />
                      <span>Daftar Tarif Wahana & Penyewaan</span>
                    </CardTitle>
                    <CardDescription>
                      Tarif wahana rekreasi satwa, sewa sepeda, perahu air, dan fasilitas pendukung.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={openAddRide}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 h-9"
                  >
                    <AppIcon icon="Plus" className="w-3.5 h-3.5" />
                    <span>Tambah Wahana</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border/60">
                    {formData.additional_tariffs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Belum ada data wahana tambahan. Klik tombol di atas untuk menambah.
                      </div>
                    ) : (
                      formData.additional_tariffs.map((ride, idx) => (
                        <div key={ride.id || idx} className="py-3.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">{ride.name_id}</p>
                            <p className="text-xs text-muted-foreground">
                              {ride.name_en} • <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatRupiah(ride.price)}</span> / {ride.unit_id}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditRide(idx)}
                              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                            >
                              <AppIcon icon="Edit3" className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRide(idx)}
                              className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <AppIcon icon="Trash2" className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sticky Preview: Live Simulation Calculator (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <Card className="rounded-3xl border border-border/80 shadow-md overflow-hidden bg-card">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                    <AppIcon icon="Sparkles" className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Live Simulator Pengunjung</h3>
                    <p className="text-[11px] text-white/70">Pratinjau otomatis sesuai input formulir</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-emerald-300 border border-white/15">
                  Realtime
                </span>
              </div>
            </div>

            <CardContent className="p-5 space-y-5">
              {/* Simulator Controls */}
              <div className="space-y-3.5 text-xs">
                {/* Adults & Children Stepper */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">Dewasa</p>
                      <p className="text-[10px] text-muted-foreground">{formatRupiah(formData.adult_price)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSimAdults(Math.max(1, simAdults - 1))}
                        className="w-6 h-6 rounded bg-card border flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-bold">{simAdults}</span>
                      <button
                        onClick={() => setSimAdults(simAdults + 1)}
                        className="w-6 h-6 rounded bg-card border flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">Anak</p>
                      <p className="text-[10px] text-muted-foreground">{formatRupiah(formData.child_price)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSimChildren(Math.max(0, simChildren - 1))}
                        className="w-6 h-6 rounded bg-card border flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-bold">{simChildren}</span>
                      <button
                        onClick={() => setSimChildren(simChildren + 1)}
                        className="w-6 h-6 rounded bg-card border flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5">Kendaraan</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { key: 'bike', label: 'Sepeda', price: formData.parking_bike },
                      { key: 'motor', label: 'Motor', price: formData.parking_motor },
                      { key: 'car', label: 'Mobil', price: formData.parking_car },
                      { key: 'bus', label: 'Bus', price: formData.parking_bus }
                    ].map(v => (
                      <button
                        key={v.key}
                        onClick={() => setSimVehicle(v.key as any)}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          simVehicle === v.key
                            ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-2xs'
                            : 'bg-card hover:bg-muted text-foreground border-border/60'
                        }`}
                      >
                        <p className="text-[11px]">{v.label}</p>
                        <p className="text-[9px] opacity-80">{formatRupiah(v.price)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schmutzer & Day */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="sim-schmutzer"
                        checked={simSchmutzer}
                        onChange={(e) => setSimSchmutzer(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                      <label htmlFor="sim-schmutzer" className="font-bold text-xs cursor-pointer">
                        Termasuk Schmutzer
                      </label>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600">
                      {formatRupiah(simSchmutzerRate)} / org
                    </span>
                  </div>

                  {simSchmutzer && (
                    <div className="flex items-center gap-2 pt-1.5 border-t border-border/60">
                      <span className="text-[10px] text-muted-foreground">Hari:</span>
                      <div className="inline-flex p-0.5 rounded-lg bg-muted text-[10px]">
                        <button
                          onClick={() => setSimDay('weekday')}
                          className={`px-2 py-0.5 rounded ${simDay === 'weekday' ? 'bg-card font-bold text-foreground shadow-2xs' : 'text-muted-foreground'}`}
                        >
                          Weekday ({formatRupiah(formData.schmutzer_weekday_price)})
                        </button>
                        <button
                          onClick={() => setSimDay('weekend')}
                          className={`px-2 py-0.5 rounded ${simDay === 'weekend' ? 'bg-card font-bold text-foreground shadow-2xs' : 'text-muted-foreground'}`}
                        >
                          Weekend ({formatRupiah(formData.schmutzer_weekend_price)})
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Calculation */}
              <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/60 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tiket Masuk ({simAdults + simChildren} org)</span>
                  <span className="font-semibold text-foreground">{formatRupiah(simEntryTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Parkir ({simVehicle.toUpperCase()})</span>
                  <span className="font-semibold text-foreground">{formatRupiah(simParkingRate)}</span>
                </div>
                {simSchmutzer && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Pusat Primata Schmutzer</span>
                    <span className="font-semibold text-foreground">{formatRupiah(simSchmutzerTotal)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-border/80 flex items-center justify-between text-sm">
                  <span className="font-bold text-foreground">Total Estimasi Tiket</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                    {formatRupiah(simGrandTotal)}
                  </span>
                </div>
              </div>

              {/* JakCard Recommendation Simulator */}
              <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-1">
                <p className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <AppIcon icon="CreditCard" className="w-3.5 h-3.5" />
                  <span>Rekomendasi JakCard di Loket:</span>
                </p>
                <p className="font-bold text-foreground">
                  {simGrandTotal <= formData.jakcard_tier_1_balance 
                    ? `Paket Rp ${formatRupiah(formData.jakcard_tier_1_total).replace('Rp', '').trim()} (Saldo ${formatRupiah(formData.jakcard_tier_1_balance)})`
                    : simGrandTotal <= formData.jakcard_tier_2_balance
                    ? `Paket Rp ${formatRupiah(formData.jakcard_tier_2_total).replace('Rp', '').trim()} (Saldo ${formatRupiah(formData.jakcard_tier_2_balance)})`
                    : `Paket Rp ${formatRupiah(formData.jakcard_tier_2_total).replace('Rp', '').trim()} + Top-up Saldo`}
                </p>
              </div>

              {/* Save Prompt */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11"
              >
                {saving ? 'Menyimpan Pengaturan...' : 'Terapkan & Simpan Tarif'}
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Modal Dialog for Add/Edit Ride */}
      <Dialog open={isRideModalOpen} onOpenChange={setIsRideModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">
              {editingRideIndex !== null ? 'Ubah Wahana / Layanan' : 'Tambah Wahana / Layanan Rekreasi'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nama Wahana (Indonesia)</Label>
              <Input
                value={rideForm.name_id}
                onChange={(e) => setRideForm({ ...rideForm, name_id: e.target.value })}
                placeholder="Contoh: Kereta Keliling Satwa"
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nama Wahana (English)</Label>
              <Input
                value={rideForm.name_en}
                onChange={(e) => setRideForm({ ...rideForm, name_en: e.target.value })}
                placeholder="Contoh: Sightseeing Train"
                className="h-10 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tarif (Rp)</Label>
                <Input
                  type="number"
                  value={rideForm.price}
                  onChange={(e) => setRideForm({ ...rideForm, price: Number(e.target.value) || 0 })}
                  className="h-10 rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Satuan (ID)</Label>
                <Input
                  value={rideForm.unit_id}
                  onChange={(e) => setRideForm({ ...rideForm, unit_id: e.target.value })}
                  placeholder="orang / putaran"
                  className="h-10 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kategori</Label>
              <select
                value={rideForm.category}
                onChange={(e) => setRideForm({ ...rideForm, category: e.target.value as any })}
                className="w-full h-10 px-3 rounded-xl border bg-card text-foreground text-xs"
              >
                <option value="wahana">Wahana Rekreasi</option>
                <option value="sewa">Penyewaan (Sepeda/Perahu)</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsRideModalOpen(false)} className="rounded-xl">
              Batal
            </Button>
            <Button onClick={handleSaveRide} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Simpan Wahana
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
