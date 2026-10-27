"use client";

import { useState, useRef, useEffect } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SiteSettings } from '@/hooks/useSiteSettings';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { updateSiteSettingsAction } from '../branding/actions'; // Reusing action

const TICKET_ICON_OPTIONS = [
  { value: 'Ticket', label: 'Tiket' },
  { value: 'TicketCheck', label: 'Tiket Check' },
  { value: 'TicketPercent', label: 'Tiket Diskon' },
  { value: 'TicketPlus', label: 'Tiket Plus' },
  { value: 'CreditCard', label: 'Kartu Kredit' },
  { value: 'ShoppingCart', label: 'Keranjang' },
  { value: 'ShoppingBag', label: 'Tas Belanja' },
  { value: 'Wallet', label: 'Dompet' },
  { value: 'BadgePercent', label: 'Badge Diskon' },
  { value: 'Gift', label: 'Hadiah' },
  { value: 'Star', label: 'Bintang' },
  { value: 'Heart', label: 'Hati' },
  { value: 'Sparkles', label: 'Kilau' },
  { value: 'CalendarCheck', label: 'Kalender' },
  { value: 'QrCode', label: 'QR Code' },
];

import { Badge } from '@/components/ui/badge';

export default function ManageFloatingButtonClient() {
  const [saving, setSaving] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingTicketIcon, setUploadingTicketIcon] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ticketIconInputRef = useRef<HTMLInputElement>(null);
  
  const [ticketEnabled, setTicketEnabled] = useState(true);
  const [textId, setTextId] = useState('Beli Tiket');
  const [textEn, setTextEn] = useState('Buy Ticket');
  const [ticketPosition, setTicketPosition] = useState<'left' | 'center' | 'right'>('center');
  const [ticketUrl, setTicketUrl] = useState('https://ragunanzoo.agathis.fun/');
  const [ticketIcon, setTicketIcon] = useState('Ticket');
  const [ticketCustomIconUrl, setTicketCustomIconUrl] = useState<string | null>(null);
  const [ticketIconType, setTicketIconType] = useState<'lucide' | 'custom'>('lucide');
  const [ticketIconSize, setTicketIconSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [ticketUseSchedule, setTicketUseSchedule] = useState(false);
  const [ticketStartTime, setTicketStartTime] = useState('08:00');
  const [ticketEndTime, setTicketEndTime] = useState('17:00');
  
  const [chatUsEnabled, setChatUsEnabled] = useState(true);
  const [chatUsNumber, setChatUsNumber] = useState('');
  const [chatUsPosition, setChatUsPosition] = useState<'left' | 'center' | 'right'>('center');
  const [chatUsIconUrl, setChatUsIconUrl] = useState<string | null>(null);
  const [chatUsUseSchedule, setChatUsUseSchedule] = useState(false);
  const [chatUsStartTime, setChatUsStartTime] = useState('08:00');
  const [chatUsEndTime, setChatUsEndTime] = useState('17:00');
  
  const [venueWhatsappNumber, setVenueWhatsappNumber] = useState('');
  const [venuePhoneNumber, setVenuePhoneNumber] = useState('');
  
  const [heroTicketEnabled, setHeroTicketEnabled] = useState(true);
  const [heroTicketUseSchedule, setHeroTicketUseSchedule] = useState(false);
  const [heroTicketStartTime, setHeroTicketStartTime] = useState('08:00');
  const [heroTicketEndTime, setHeroTicketEndTime] = useState('17:00');

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('site_settings').select('*').single();
        if (data) {
          setTicketEnabled(data.floating_ticket_enabled !== false);
          setTextId(data.floating_ticket_text_id || 'Beli Tiket');
          setTextEn(data.floating_ticket_text_en || 'Buy Ticket');
          setTicketPosition(data.floating_ticket_position || 'center');
          setChatUsEnabled(data.chat_us_enabled !== false);
          setChatUsNumber(data.chat_us_number || data.whatsapp_number || '');
          setChatUsPosition(data.chat_us_position || data.floating_ticket_position || 'center');
          setChatUsIconUrl(data.chat_us_icon_url || null);
          setChatUsUseSchedule(data.chat_us_use_schedule || false);
          setChatUsStartTime(data.chat_us_start_time || '08:00');
          setChatUsEndTime(data.chat_us_end_time || '17:00');
          setTicketUrl(data.ticket_external_url || '');

          setTicketCustomIconUrl(data.floating_ticket_custom_icon_url || null);
          setTicketIconType(data.floating_ticket_custom_icon_url ? 'custom' : 'lucide');
          setTicketIconSize(data.floating_ticket_icon_size || 'medium');
          setTicketUseSchedule(data.floating_ticket_use_schedule || false);
          setTicketStartTime(data.floating_ticket_start_time || '08:00');
          setTicketEndTime(data.floating_ticket_end_time || '17:00');
          setVenueWhatsappNumber(data.venue_whatsapp_number || data.whatsapp_number || '');
          setVenuePhoneNumber(data.venue_phone_number || '');
          setHeroTicketEnabled(data.hero_ticket_enabled !== false);
          setHeroTicketUseSchedule(data.hero_ticket_use_schedule || false);
          setHeroTicketStartTime(data.hero_ticket_start_time || '08:00');
          setHeroTicketEndTime(data.hero_ticket_end_time || '17:00');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'site_settings') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }
  , []);

  const handleSave = async () => {
    if (!textId.trim() || !textEn.trim()) {
      toast.error('Teks tombol tiket tidak boleh kosong');
      return;
    }

    if (ticketUrl.trim() && !ticketUrl.startsWith('http://') && !ticketUrl.startsWith('https://')) {
      toast.error('URL tiket harus dimulai dengan http:// atau https://');
      return;
    }

    const cleanedChatUs = chatUsNumber.trim().replace(/[^\d+]/g, '');
    const cleanedVenueWa = venueWhatsappNumber.trim().replace(/[^\d+]/g, '');
    const cleanedVenuePhone = venuePhoneNumber.trim().replace(/[^\d+]/g, '');

    try {
      setSaving(true);
      const result = await updateSiteSettingsAction({
        floating_ticket_enabled: ticketEnabled,
        floating_ticket_text_id: textId.trim(),
        floating_ticket_text_en: textEn.trim(),
        floating_ticket_position: ticketPosition,
        floating_ticket_icon: ticketIconType === 'lucide' ? ticketIcon : null,
        floating_ticket_custom_icon_url: ticketIconType === 'custom' ? ticketCustomIconUrl : null,
        floating_ticket_icon_size: ticketIconSize,
        ticket_external_url: ticketUrl.trim() || null,
        floating_ticket_use_schedule: ticketUseSchedule,
        floating_ticket_start_time: ticketStartTime || '08:00',
        floating_ticket_end_time: ticketEndTime || '17:00',
        chat_us_enabled: chatUsEnabled,
        chat_us_number: cleanedChatUs || null,
        chat_us_position: chatUsPosition,
        chat_us_icon_url: chatUsIconUrl,
        chat_us_use_schedule: chatUsUseSchedule,
        chat_us_start_time: chatUsStartTime || '08:00',
        chat_us_end_time: chatUsEndTime || '17:00',
        venue_whatsapp_number: cleanedVenueWa || null,
        venue_phone_number: cleanedVenuePhone || null,
        hero_ticket_enabled: heroTicketEnabled,
        hero_ticket_use_schedule: heroTicketUseSchedule,
        hero_ticket_start_time: heroTicketStartTime || '08:00',
        hero_ticket_end_time: heroTicketEndTime || '17:00',
      });
      if (!result.success) throw new Error(result.error);
      toast.success('Pengaturan berhasil disimpan');
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    if (file.size > 500 * 1024) {
      toast.error('Ukuran file maksimal 500KB');
      return;
    }

    try {
      setUploadingIcon(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `chat-us-icon-${Date.now()}.${fileExt}`;
      const filePath = `icons/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage.from('branding').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('branding').getPublicUrl(uploadData.path);
      setChatUsIconUrl(publicUrl);
      toast.success('Icon berhasil diupload');
    } catch (err: any) {
      toast.error('Gagal mengupload icon: ' + err.message);
    } finally {
      setUploadingIcon(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveIcon = () => {
    setChatUsIconUrl(null);
    toast.success('Icon dihapus, akan menggunakan icon default');
  };

  const handleTicketIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    if (file.size > 500 * 1024) {
      toast.error('Ukuran file maksimal 500KB');
      return;
    }

    try {
      setUploadingTicketIcon(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `ticket-icon-${Date.now()}.${fileExt}`;
      const filePath = `icons/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage.from('branding').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('branding').getPublicUrl(uploadData.path);
      setTicketCustomIconUrl(publicUrl);
      setTicketIconType('custom');
      toast.success('Icon tiket berhasil diupload');
    } catch (err: any) {
      toast.error('Gagal mengupload icon tiket: ' + err.message);
    } finally {
      setUploadingTicketIcon(false);
      if (ticketIconInputRef.current) ticketIconInputRef.current.value = '';
    }
  };

  const handleRemoveTicketIcon = () => {
    setTicketCustomIconUrl(null);
    setTicketIconType('lucide');
    toast.success('Icon custom dihapus, kembali ke icon bawaan');
  };
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
              <AppIcon icon="LayoutTemplate" className="w-5 h-5 text-green-500" />
            </div>
            Pengaturan Tombol & Kontak
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola widget tombol tiket, tombol Chat Us, dan kontak WhatsApp</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-violet-500 text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-bold shadow-[0_2px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 disabled:opacity-50">
          {saving ? <AppIcon icon="Loader2" className="w-5 h-5 animate-spin" /> : <AppIcon icon="Save" className="w-5 h-5" />}
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <AppIcon icon="Ticket" className="w-4 h-4 text-green-500" />
              </div>
              Tombol Tiket Mengambang
            </h3>

            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                {ticketEnabled ? <AppIcon icon="Eye" className="w-5 h-5 text-green-500" /> : <AppIcon icon="EyeOff" className="w-5 h-5 text-slate-400" />}
                <div>
                  <Label htmlFor="ticketEnabled" className="text-sm font-bold text-slate-800 cursor-pointer">Tampilkan Tombol</Label>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{ticketEnabled ? 'Aktif di halaman Explorer' : 'Disembunyikan'}</p>
                </div>
              </div>
              <Switch id="ticketEnabled" checked={ticketEnabled} onCheckedChange={setTicketEnabled} className="data-[state=checked]:bg-green-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1.5">
                <Label htmlFor="textId" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">🇮🇩 Teks Indonesia</Label>
                <Input id="textId" value={textId} onChange={e => setTextId(e.target.value)} placeholder="Beli Tiket" disabled={!ticketEnabled} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="textEn" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">🇬🇧 Text English</Label>
                <Input id="textEn" value={textEn} onChange={e => setTextEn(e.target.value)} placeholder="Buy Ticket" disabled={!ticketEnabled} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500" />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tipe Icon</Label>
              <RadioGroup value={ticketIconType} onValueChange={(v) => setTicketIconType(v as 'lucide' | 'custom')} className="grid grid-cols-2 gap-3" disabled={!ticketEnabled}>
                <Label htmlFor="icon-type-lucide" className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${ticketIconType === 'lucide' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-200'} ${!ticketEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <RadioGroupItem value="lucide" id="icon-type-lucide" className="sr-only" />
                  <AppIcon icon="Ticket" className={`w-6 h-6 ${ticketIconType === 'lucide' ? 'text-green-600' : 'text-slate-400'}`} />
                  <span className={`text-xs font-bold ${ticketIconType === 'lucide' ? 'text-green-700' : 'text-slate-500'}`}>Icon Bawaan</span>
                </Label>
                <Label htmlFor="icon-type-custom" className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${ticketIconType === 'custom' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-200'} ${!ticketEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <RadioGroupItem value="custom" id="icon-type-custom" className="sr-only" />
                  <AppIcon icon="Image" className={`w-6 h-6 ${ticketIconType === 'custom' ? 'text-green-600' : 'text-slate-400'}`} />
                  <span className={`text-xs font-bold ${ticketIconType === 'custom' ? 'text-green-700' : 'text-slate-500'}`}>Upload Gambar</span>
                </Label>
              </RadioGroup>
            </div>

            {ticketIconType === 'lucide' && (
              <div className="space-y-1.5 mb-6">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pilih Icon</Label>
                <Select value={ticketIcon} onValueChange={setTicketIcon} disabled={!ticketEnabled}>
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl h-11">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <AppIcon icon={ticketIcon} className="w-4 h-4 text-slate-600" />
                        <span className="font-bold text-slate-700">{TICKET_ICON_OPTIONS.find(o => o.value === ticketIcon)?.label || ticketIcon}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    {TICKET_ICON_OPTIONS.map((option) => {
                      return (
                        <SelectItem key={option.value} value={option.value} className="focus:bg-slate-100 cursor-pointer rounded-lg">
                          <div className="flex items-center gap-2 font-medium">
                            <AppIcon icon={option.value} className="w-4 h-4 text-slate-500" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {ticketIconType === 'custom' && (
              <div className="space-y-2 mb-6">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Upload Icon Custom</Label>
                {ticketCustomIconUrl ? (
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-green-200 shadow-sm">
                      <img src={ticketCustomIconUrl} alt="Custom icon" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">Icon Custom</p>
                      <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mt-0.5">Berhasil diupload</p>
                    </div>
                    <button type="button" onClick={handleRemoveTicketIcon} disabled={!ticketEnabled} className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors">
                      <AppIcon icon="X" className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => ticketEnabled && ticketIconInputRef.current?.click()} disabled={!ticketEnabled || uploadingTicketIcon} className={`w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${ticketEnabled ? 'border-slate-300 hover:border-green-400 bg-slate-50 hover:bg-green-50/50' : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'}`}>
                    {uploadingTicketIcon ? (
                      <AppIcon icon="Loader2" className="w-8 h-8 animate-spin text-green-500" />
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                          <AppIcon icon="Upload" className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">Klik untuk upload icon</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">PNG, JPG, SVG (Max 500KB, disarankan 64x64px)</p>
                        </div>
                      </>
                    )}
                  </button>
                )}
                <input ref={ticketIconInputRef} type="file" accept="image/*" onChange={handleTicketIconUpload} className="hidden" disabled={!ticketEnabled} />
              </div>
            )}

            <div className="space-y-3 mb-6">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ukuran Icon</Label>
              <RadioGroup value={ticketIconSize} onValueChange={(v) => setTicketIconSize(v as 'small' | 'medium' | 'large')} className="grid grid-cols-3 gap-3" disabled={!ticketEnabled}>
                {[
                  { value: 'small', label: 'Kecil', size: 'w-3 h-3' },
                  { value: 'medium', label: 'Sedang', size: 'w-4 h-4' },
                  { value: 'large', label: 'Besar', size: 'w-5 h-5' },
                ].map((option) => (
                  <Label key={option.value} htmlFor={`icon-size-${option.value}`} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${ticketIconSize === option.value ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-200'} ${!ticketEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <RadioGroupItem value={option.value} id={`icon-size-${option.value}`} className="sr-only" />
                    <div className={`${option.size} bg-slate-400 rounded-sm`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${ticketIconSize === option.value ? 'text-green-700' : 'text-slate-500'}`}>{option.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3 mb-6">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Posisi Tombol</Label>
              <RadioGroup value={ticketPosition} onValueChange={(v) => setTicketPosition(v as 'left' | 'center' | 'right')} className="grid grid-cols-3 gap-3" disabled={!ticketEnabled}>
                {['left', 'center', 'right'].map((pos) => (
                  <Label key={pos} htmlFor={`ticket-pos-${pos}`} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${ticketPosition === pos ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-200'} ${!ticketEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <RadioGroupItem value={pos} id={`ticket-pos-${pos}`} className="sr-only" />
                    <div className="w-full h-8 bg-slate-200 rounded relative">
                      <div className={`absolute bottom-1 w-5 h-2 bg-slate-400 rounded ${pos === 'left' ? 'left-1' : pos === 'right' ? 'right-1' : 'left-1/2 -translate-x-1/2'}`} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${ticketPosition === pos ? 'text-green-700' : 'text-slate-500'}`}>{pos === 'left' ? 'Kiri' : pos === 'right' ? 'Kanan' : 'Tengah'}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-1.5 mb-6 pt-6 border-t border-slate-100">
              <Label htmlFor="ticketUrl" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><AppIcon icon="Link" className="w-3.5 h-3.5" /> URL Tiket Eksternal</Label>
              <Input id="ticketUrl" value={ticketUrl} onChange={e => setTicketUrl(e.target.value)} placeholder="https://ragunanzoo.agathis.fun/" type="url" disabled={!ticketEnabled} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Pengunjung akan diarahkan ke link ini saat klik tombol.</p>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <AppIcon icon="Clock" className="w-5 h-5 text-amber-500" />
                  <div>
                    <Label className="text-sm font-bold text-amber-900 cursor-pointer">Gunakan Jadwal Operasional</Label>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Batasi waktu tampil tombol</p>
                  </div>
                </div>
                <Switch checked={ticketUseSchedule} onCheckedChange={setTicketUseSchedule} disabled={!ticketEnabled} className="data-[state=checked]:bg-amber-500" />
              </div>
              
              {ticketUseSchedule && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="space-y-1.5">
                    <Label htmlFor="ticketStartTime" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jam Buka</Label>
                    <Input id="ticketStartTime" type="time" value={ticketStartTime} onChange={e => setTicketStartTime(e.target.value)} disabled={!ticketEnabled} className="bg-white border-slate-200 rounded-xl focus-visible:ring-green-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ticketEndTime" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jam Tutup</Label>
                    <Input id="ticketEndTime" type="time" value={ticketEndTime} onChange={e => setTicketEndTime(e.target.value)} disabled={!ticketEnabled} className="bg-white border-slate-200 rounded-xl focus-visible:ring-green-500" />
                  </div>
                  <p className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center pt-2">Waktu WIB (Asia/Jakarta)</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <AppIcon icon="Ticket" className="w-4 h-4 text-teal-500" />
              </div>
              Tombol Beli Tiket (Di Bawah Hero)
            </h3>

            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                {heroTicketEnabled ? <AppIcon icon="Eye" className="w-5 h-5 text-teal-500" /> : <AppIcon icon="EyeOff" className="w-5 h-5 text-slate-400" />}
                <div>
                  <Label htmlFor="heroTicketEnabled" className="text-sm font-bold text-slate-800 cursor-pointer">Tampilkan Tombol</Label>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{heroTicketEnabled ? 'Aktif di bawah Hero Banner' : 'Disembunyikan'}</p>
                </div>
              </div>
              <Switch id="heroTicketEnabled" checked={heroTicketEnabled} onCheckedChange={setHeroTicketEnabled} className="data-[state=checked]:bg-teal-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <AppIcon icon="Clock" className="w-5 h-5 text-amber-500" />
                <div>
                  <Label className="text-sm font-bold text-amber-900 cursor-pointer">Gunakan Jadwal Operasional</Label>
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Batasi waktu tampil tombol</p>
                </div>
              </div>
              <Switch checked={heroTicketUseSchedule} onCheckedChange={setHeroTicketUseSchedule} disabled={!heroTicketEnabled} className="data-[state=checked]:bg-amber-500" />
            </div>
            
            {heroTicketUseSchedule && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1.5">
                  <Label htmlFor="heroTicketStartTime" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jam Buka</Label>
                  <Input id="heroTicketStartTime" type="time" value={heroTicketStartTime} onChange={e => setHeroTicketStartTime(e.target.value)} disabled={!heroTicketEnabled} className="bg-white border-slate-200 rounded-xl focus-visible:ring-teal-500" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="heroTicketEndTime" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jam Tutup</Label>
                  <Input id="heroTicketEndTime" type="time" value={heroTicketEndTime} onChange={e => setHeroTicketEndTime(e.target.value)} disabled={!heroTicketEnabled} className="bg-white border-slate-200 rounded-xl focus-visible:ring-teal-500" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <AppIcon icon="MessageCircle" className="w-4 h-4 text-green-500" />
              </div>
              Tombol Chat Us (WhatsApp)
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                {chatUsEnabled ? <AppIcon icon="Eye" className="w-5 h-5 text-green-500" /> : <AppIcon icon="EyeOff" className="w-5 h-5 text-slate-400" />}
                <div>
                  <Label htmlFor="chatUsEnabled" className="text-sm font-bold text-slate-800 cursor-pointer">Tampilkan Tombol Chat Us</Label>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{chatUsEnabled ? 'Tampil di bawah tombol tiket' : 'Disembunyikan'}</p>
                </div>
              </div>
              <Switch id="chatUsEnabled" checked={chatUsEnabled} onCheckedChange={setChatUsEnabled} className="data-[state=checked]:bg-green-500" />
            </div>

            <div className="space-y-1.5 mb-6">
              <Label htmlFor="chatUsNumber" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nomor WhatsApp Chat Us</Label>
              <Input id="chatUsNumber" value={chatUsNumber} onChange={e => setChatUsNumber(e.target.value)} placeholder="+6281234567890" type="tel" disabled={!chatUsEnabled} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Gunakan format +62xxxxxxxxxx atau 08xxxxxxxxxx</p>
            </div>

            <div className="space-y-3 mb-6">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Posisi Tombol Chat Us</Label>
              <RadioGroup value={chatUsPosition} onValueChange={(v) => setChatUsPosition(v as 'left' | 'center' | 'right')} className="grid grid-cols-3 gap-3" disabled={!chatUsEnabled}>
                {['left', 'center', 'right'].map((pos) => (
                  <Label key={pos} htmlFor={`chat-pos-${pos}`} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${chatUsPosition === pos ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-200'} ${!chatUsEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <RadioGroupItem value={pos} id={`chat-pos-${pos}`} className="sr-only" />
                    <div className="w-full h-8 bg-slate-200 rounded relative">
                      <div className={`absolute bottom-1 w-5 h-2 bg-slate-400 rounded ${pos === 'left' ? 'left-1' : pos === 'right' ? 'right-1' : 'left-1/2 -translate-x-1/2'}`} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${chatUsPosition === pos ? 'text-green-700' : 'text-slate-500'}`}>{pos === 'left' ? 'Kiri' : pos === 'right' ? 'Kanan' : 'Tengah'}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2 mb-6">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                Icon Chat Us Custom
                {chatUsIconUrl && <Badge variant="outline" className="text-[10px] border-green-200 text-green-700 bg-green-50 px-2 rounded-md h-5">Custom Icon Aktif</Badge>}
              </Label>
              
              <div className="flex gap-4">
                {chatUsIconUrl ? (
                  <div className="flex-1 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-1 shadow-sm">
                      <img src={chatUsIconUrl} alt="Chat Icon" className="max-w-full max-h-full object-contain" />
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemoveIcon} disabled={!chatUsEnabled} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg h-8">
                      <AppIcon icon="X" className="w-4 h-4 mr-1" /> Hapus Icon
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center shadow-sm">
                      <AppIcon icon="MessageCircle" className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-500">Icon WhatsApp Bawaan</span>
                  </div>
                )}
                
                <div className="shrink-0">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleIconUpload} className="hidden" disabled={!chatUsEnabled} />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingIcon || !chatUsEnabled} className="h-full rounded-xl border-slate-200 hover:bg-slate-50 bg-white font-bold">
                    {uploadingIcon ? <AppIcon icon="Loader2" className="w-4 h-4 animate-spin mr-2" /> : <AppIcon icon="Upload" className="w-4 h-4 mr-2" />}
                    {uploadingIcon ? '...' : 'Upload'}
                  </Button>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Opsional: Upload gambar icon khusus (.PNG, .SVG, Maks 500KB)</p>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <AppIcon icon="Clock" className="w-5 h-5 text-amber-500" />
                  <div>
                    <Label className="text-sm font-bold text-amber-900 cursor-pointer">Jadwal Chat Us</Label>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Tampilkan sesuai jam kerja</p>
                  </div>
                </div>
                <Switch checked={chatUsUseSchedule} onCheckedChange={setChatUsUseSchedule} disabled={!chatUsEnabled} className="data-[state=checked]:bg-amber-500" />
              </div>
              
              {chatUsUseSchedule && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="space-y-1.5">
                    <Label htmlFor="chatUsStartTime" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jam Buka</Label>
                    <Input id="chatUsStartTime" type="time" value={chatUsStartTime} onChange={e => setChatUsStartTime(e.target.value)} disabled={!chatUsEnabled} className="bg-white border-slate-200 rounded-xl focus-visible:ring-green-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="chatUsEndTime" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jam Tutup</Label>
                    <Input id="chatUsEndTime" type="time" value={chatUsEndTime} onChange={e => setChatUsEndTime(e.target.value)} disabled={!chatUsEnabled} className="bg-white border-slate-200 rounded-xl focus-visible:ring-green-500" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <AppIcon icon="Building2" className="w-4 h-4 text-orange-500" />
              </div>
              Kontak Sewa Tempat (Venue)
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="venueWhatsappNumber" className="text-xs font-bold text-slate-700 uppercase tracking-wider">WhatsApp Sewa Tempat</Label>
                <Input id="venueWhatsappNumber" value={venueWhatsappNumber} onChange={e => setVenueWhatsappNumber(e.target.value)} placeholder="+6281234567890" type="tel" className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-orange-500" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Akan terhubung ke tombol WhatsApp di halaman detail venue</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="venuePhoneNumber" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Telepon Kantor (Opsional)</Label>
                <Input id="venuePhoneNumber" value={venuePhoneNumber} onChange={e => setVenuePhoneNumber(e.target.value)} placeholder="(021) 7806975" type="tel" className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
