'use client';

import { useState, useEffect } from 'react';
import { useSystemConfigs } from '@/hooks/useSystemConfigs';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { AppIcon } from '@/components/ui/AppIcon';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function ManageSystemConfigsClient() {
  const { loading, getConfig, updateConfig } = useSystemConfigs();
  const { 
    arEnabled, 
    audioEnabled, 
    loading: flagsLoading, 
    saving: flagsSaving, 
    updateFeatureFlags 
  } = useFeatureFlags();

  const [greetings, setGreetings] = useState({
    intro_id: '',
    intro_en: '',
    outro_id: '',
    outro_en: '',
    fallback_id: '',
    fallback_en: '',
  });

  useEffect(() => {
    const fetchConfigs = async () => {
      const data = await getConfig('chatbot_greetings');
      if (data) {
        setGreetings({
          intro_id: (data.intro_id || []).join('\n'),
          intro_en: (data.intro_en || []).join('\n'),
          outro_id: (data.outro_id || []).join('\n'),
          outro_en: (data.outro_en || []).join('\n'),
          fallback_id: (data.fallback_id || []).join('\n'),
          fallback_en: (data.fallback_en || []).join('\n'),
        });
      }
    };
    fetchConfigs();
  }, [getConfig]);

  const handleToggleAr = async (checked: boolean) => {
    const res = await updateFeatureFlags({ ar_enabled: checked });
    if (res.success) {
      toast.success(checked ? '✨ Fitur AR & 3D berhasil Diaktifkan' : '🔒 Fitur AR & 3D berhasil Dinonaktifkan');
    } else {
      toast.error('Gagal memperbarui status fitur AR');
    }
  };

  const handleToggleAudio = async (checked: boolean) => {
    const res = await updateFeatureFlags({ audio_enabled: checked });
    if (res.success) {
      toast.success(checked ? '🔊 Fitur Suara Satwa berhasil Diaktifkan' : '🔇 Fitur Suara Satwa berhasil Dinonaktifkan');
    } else {
      toast.error('Gagal memperbarui status fitur Suara Satwa');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert back to arrays (split by newline)
    const payload = {
      intro_id: greetings.intro_id.split('\n').filter(Boolean),
      intro_en: greetings.intro_en.split('\n').filter(Boolean),
      outro_id: greetings.outro_id.split('\n').filter(Boolean),
      outro_en: greetings.outro_en.split('\n').filter(Boolean),
      fallback_id: greetings.fallback_id.split('\n').filter(Boolean),
      fallback_en: greetings.fallback_en.split('\n').filter(Boolean),
    };

    const result = await updateConfig('chatbot_greetings', payload, 'Chatbot varied greetings and fallbacks');
    if (result.success) {
      toast.success('Konfigurasi Chatbot berhasil disimpan');
    } else {
      toast.error('Gagal menyimpan konfigurasi');
    }
  };

  if (loading && !greetings.intro_id) {
    return <div className="p-10 text-center">Memuat konfigurasi...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <AppIcon icon="Sliders" className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan Sistem & Fitur</h1>
          <p className="text-muted-foreground">Kelola sakelar fitur interaktif (AR & Suara Satwa) serta pengaturan teks Chatbot.</p>
        </div>
      </div>

      {/* Feature Flags Toggle Section */}
      <div className="bg-card border rounded-xl shadow-sm p-6 space-y-6">
        <div className="border-b pb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AppIcon icon="Sparkles" className="w-5 h-5 text-amber-500" />
            Kontrol Fitur Interaktif (Feature Flags)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Aktifkan atau nonaktifkan modul interaktif di seluruh website pengunjung secara real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AR Toggle Card */}
          <div className={`p-4 rounded-xl border transition-all ${arEnabled ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-muted/50 border-muted'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${arEnabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                  <AppIcon icon="Camera" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Fitur AR & 3D Viewer</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {arEnabled ? '🟢 Aktif — Pengunjung dapat melihat model 3D & AR satwa.' : '🔴 Nonaktif — Fitur 3D & AR disembunyikan.'}
                  </p>
                </div>
              </div>
              <Switch
                checked={arEnabled}
                disabled={flagsLoading || flagsSaving}
                onCheckedChange={handleToggleAr}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>

          {/* Audio Toggle Card */}
          <div className={`p-4 rounded-xl border transition-all ${audioEnabled ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-muted/50 border-muted'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${audioEnabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                  <AppIcon icon="Volume2" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Fitur Suara Satwa & Audio Guide</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {audioEnabled ? '🟢 Aktif — Pemutar audio & panduan suara berjalan.' : '🔴 Nonaktif — Fitur audio disembunyikan.'}
                  </p>
                </div>
              </div>
              <Switch
                checked={audioEnabled}
                disabled={flagsLoading || flagsSaving}
                onCheckedChange={handleToggleAudio}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Config Section */}
      <div className="bg-card border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
          <AppIcon icon="Bot" className="w-5 h-5 text-primary" />
          Konfigurasi Teks Chatbot
        </h2>
        <p className="text-sm text-muted-foreground mb-6">Setiap baris baru (enter) akan dianggap sebagai variasi teks yang berbeda. Sistem akan memilih salah satu baris secara acak setiap kali Chatbot muncul.</p>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sapaan Awal (Intro) - ID</label>
              <textarea
                value={greetings.intro_id}
                onChange={(e) => setGreetings({...greetings, intro_id: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg h-24 focus:ring-primary/50"
                placeholder="Halo, ada yang bisa saya bantu?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sapaan Awal (Intro) - EN</label>
              <textarea
                value={greetings.intro_en}
                onChange={(e) => setGreetings({...greetings, intro_en: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg h-24 focus:ring-primary/50"
                placeholder="Hello, how can I help you?"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sapaan Penutup (Outro) - ID</label>
              <textarea
                value={greetings.outro_id}
                onChange={(e) => setGreetings({...greetings, outro_id: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg h-24 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sapaan Penutup (Outro) - EN</label>
              <textarea
                value={greetings.outro_en}
                onChange={(e) => setGreetings({...greetings, outro_en: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg h-24 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesan Gagal Paham (Fallback) - ID</label>
              <textarea
                value={greetings.fallback_id}
                onChange={(e) => setGreetings({...greetings, fallback_id: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg h-24 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesan Gagal Paham (Fallback) - EN</label>
              <textarea
                value={greetings.fallback_en}
                onChange={(e) => setGreetings({...greetings, fallback_en: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg h-24 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50"
            >
              <AppIcon icon="Save" className="w-4 h-4" />
              {loading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
