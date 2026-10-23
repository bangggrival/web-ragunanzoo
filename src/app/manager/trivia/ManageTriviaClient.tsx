'use client';

import { useState, useEffect } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { useTrivia, TriviaQuestion } from '@/hooks/useTrivia';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageTriviaClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  const { trivia, loading, fetchTrivia, createTrivia, updateTrivia, deleteTrivia } = useTrivia();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrivia, setSelectedTrivia] = useState<TriviaQuestion | null>(null);
  const [formData, setFormData] = useState({
    text_id: '',
    text_en: '',
    type: 'animal',
    category: ''
  });

  useEffect(() => {
    fetchTrivia();
  }, [fetchTrivia]);

  const handleAdd = () => {
    setSelectedTrivia(null);
    setFormData({ text_id: '', text_en: '', type: 'animal', category: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: TriviaQuestion) => {
    setSelectedTrivia(item);
    setFormData({
      text_id: item.text_id,
      text_en: item.text_en,
      type: item.type,
      category: item.category || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if ((await confirm("Konfirmasi", 'Hapus fakta trivia ini?'))) {
      const result = await deleteTrivia(id);
      if (result.success) toast.success('Berhasil dihapus');
      else toast.error('Gagal menghapus');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTrivia) {
      const result = await updateTrivia(selectedTrivia.id, formData);
      if (result.success) {
        toast.success('Fakta diperbarui');
        setIsModalOpen(false);
      } else {
        toast.error('Gagal memperbarui');
      }
    } else {
      const result = await createTrivia(formData);
      if (result.success) {
        toast.success('Fakta ditambahkan');
        setIsModalOpen(false);
      } else {
        toast.error('Gagal menambahkan');
      }
    }
  };

  if (loading && trivia.length === 0) {
    return <div className="flex justify-center py-10">Memuat data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kuis Edukasi (Trivia)</h1>
          <p className="text-muted-foreground">Kelola fakta menarik yang akan muncul di game kuis pengunjung.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Fakta</span>
        </button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Tipe</th>
                <th className="px-6 py-4 font-medium">Teks Indonesia</th>
                <th className="px-6 py-4 font-medium">Teks Inggris</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {trivia.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Belum ada fakta trivia.
                  </td>
                </tr>
              ) : (
                trivia.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${item.type === 'animal' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {item.type === 'animal' ? 'Satwa' : 'Tanaman'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.text_id}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.text_en}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-muted-foreground hover:text-destructive rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">{selectedTrivia ? 'Edit Fakta' : 'Tambah Fakta'}</h2>
            </div>
            <div className="p-6">
              <form id="trivia-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipe Kuis</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  >
                    <option value="animal">Satwa</option>
                    <option value="plant">Tanaman (Flora)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fakta Bahasa Indonesia *</label>
                  <textarea
                    required
                    value={formData.text_id}
                    onChange={(e) => setFormData({ ...formData, text_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fakta Bahasa Inggris *</label>
                  <textarea
                    required
                    value={formData.text_en}
                    onChange={(e) => setFormData({ ...formData, text_en: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    rows={3}
                  />
                </div>
              </form>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/20">
              <button onClick={() => setIsModalOpen(false)} type="button" className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted">Batal</button>
              <button form="trivia-form" type="submit" className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90">Simpan</button>
            </div>
          </div>
        </div>
      )}
    {ConfirmComponent}
    </div>
  );
}
