import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Save, Search, Sparkles } from 'lucide-react';

const emptyForm = { id: 0, key: '', sr: '', tr: '', en: '', category: 'general' };

const categories = ['general', 'nav', 'hero', 'about', 'mission', 'products', 'sectors', 'production', 'contact', 'footer', 'statistics'];

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Bilinmeyen hata';
}

export default function AdminTranslations() {
  const utils = trpc.useUtils();
  const { data: translationList, isLoading } = trpc.cms.translationList.useQuery();
  const [editing, setEditing] = useState<typeof emptyForm | null>(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const createMut = trpc.cms.translationCreate.useMutation();
  const updateMut = trpc.cms.translationUpdate.useMutation();
  const deleteMut = trpc.cms.translationDelete.useMutation({
    onSuccess: async () => {
      await utils.cms.translationList.invalidate();
      toast.success('Çeviri silindi.');
    },
    onError: (error) => {
      toast.error(`Çeviri silinemedi: ${getErrorMessage(error)}`);
    },
  });
  const autoTranslateMut = trpc.cms.autoTranslate.useMutation();

  const filtered = translationList?.filter(t => {
    const matchSearch = t.key.toLowerCase().includes(search.toLowerCase()) ||
      (t.en?.toLowerCase() || '').includes(search.toLowerCase());
    const matchCat = !catFilter || t.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.key.trim()) {
      setStatus('error');
      setStatusMessage('Key boş olamaz.');
      return;
    }
    if (!editing.en.trim()) {
      setStatus('error');
      setStatusMessage('İngilizce çeviri zorunlu.');
      return;
    }

    setStatus('saving');
    setStatusMessage('Kaydediliyor...');

    const { id, ...data } = editing;
    try {
      if (id) {
        await updateMut.mutateAsync({ id, ...data });
      } else {
        await createMut.mutateAsync(data);
      }
      await utils.cms.translationList.invalidate();
      setStatus('success');
      setStatusMessage('Çeviri başarıyla kaydedildi.');
      setEditing(null);
    } catch (error) {
      setStatus('error');
      setStatusMessage(`Kaydetme hatası: ${getErrorMessage(error)}`);
    }
  };

  const autoTranslateFromTr = async () => {
    if (!editing?.tr?.trim()) return;
    const resp = await autoTranslateMut.mutateAsync({ text: editing.tr.trim() });
    setEditing({ ...editing, en: resp.en, sr: resp.sr });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-display text-white mb-1">Çeviriler</h1><p className="text-[#8A9BAE] text-sm">3 dil destekli çeviri yönetimi (SR/TR/EN).</p></div>
        <button onClick={() => { setEditing({ ...emptyForm }); setStatus('idle'); setStatusMessage(''); }} className="flex items-center gap-2 bg-[#4A7C59] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5A8C69]"><Plus size={16} /> Yeni Çeviri</button>
      </div>

      {status !== 'idle' && (
        <div className={`mb-4 rounded-lg border px-3 py-2 text-xs ${status === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : status === 'error' ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-slate-500/30 bg-slate-500/10 text-slate-300'}`}>
          {statusMessage}
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9BAE]" />
          <input type="text" placeholder="Ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#0D1F2D] border border-[#1A3A4A] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#4A7C59] focus:outline-none">
          <option value="">Tüm Kategoriler</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-[#1A3A4A]">
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Key</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Sırpça</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Türkçe</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">İngilizce</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Kategori</th>
            <th className="text-right text-[#8A9BAE] text-xs font-medium px-4 py-3">İşlemler</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} className="text-center text-[#8A9BAE] py-8">Yükleniyor...</td></tr> :
             filtered?.length === 0 ? <tr><td colSpan={6} className="text-center text-[#8A9BAE] py-8">Veri yok.</td></tr> :
             filtered?.map((t) => (
              <tr key={t.id} className="border-b border-[#1A3A4A] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-[#4A7C59] text-sm font-mono">{t.key}</td>
                <td className="px-4 py-3 text-white text-sm max-w-[200px] truncate">{t.sr}</td>
                <td className="px-4 py-3 text-white text-sm max-w-[200px] truncate">{t.tr}</td>
                <td className="px-4 py-3 text-white text-sm max-w-[200px] truncate font-medium">{t.en}</td>
                <td className="px-4 py-3"><span className="text-[10px] bg-[#1A3A4A] text-[#8A9BAE] px-2 py-0.5 rounded">{t.category}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setEditing({ id: t.id, key: t.key, sr: t.sr||'', tr: t.tr||'', en: t.en||'', category: t.category })} className="text-[#8A9BAE] hover:text-[#4A7C59]"><Pencil size={15} /></button>
                    <button onClick={() => { if (confirm('Silmek istediğinize emin misiniz?')) deleteMut.mutate({ id: t.id }); }} className="text-[#8A9BAE] hover:text-red-400"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-[#1A3A4A]"><h2 className="text-white font-medium">{editing.id ? 'Çeviri Düzenle' : 'Yeni Çeviri'}</h2><button onClick={() => setEditing(null)} className="text-[#8A9BAE] hover:text-white"><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <input value={editing.key} onChange={(e) => setEditing({...editing, key: e.target.value})} placeholder="Key (örn: nav.home)" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              <select value={editing.category} onChange={(e) => setEditing({...editing, category: e.target.value})} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea value={editing.sr} onChange={(e) => setEditing({...editing, sr: e.target.value})} placeholder="Sırpça" rows={2} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none resize-none" />
              <textarea value={editing.tr} onChange={(e) => setEditing({...editing, tr: e.target.value})} placeholder="Türkçe" rows={2} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none resize-none" />
              <button
                onClick={autoTranslateFromTr}
                className="flex items-center gap-2 bg-[#1A3A4A] text-[#D9E5F2] px-3 py-2 rounded-lg text-xs hover:bg-[#24495F]"
              >
                <Sparkles size={14} /> Türkçeden EN + SR otomatik üret
              </button>
              <textarea value={editing.en} onChange={(e) => setEditing({...editing, en: e.target.value})} placeholder="İngilizce *" rows={2} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none resize-none" />
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1A3A4A]">
              <button onClick={() => setEditing(null)} className="text-[#8A9BAE] hover:text-white text-sm px-4 py-2">İptal</button>
              <button onClick={handleSave} disabled={status === 'saving'} className="flex items-center gap-2 bg-[#4A7C59] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5A8C69] disabled:opacity-60 disabled:cursor-not-allowed"><Save size={14} /> {status === 'saving' ? 'Kaydediliyor...' : 'Kaydet'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
