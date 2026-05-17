import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { Plus, Pencil, Trash2, X, Save, Search, Sparkles } from 'lucide-react';

const emptyForm = {
  id: 0, slug: '', number: '', titleSr: '', titleTr: '', titleEn: '',
  descriptionSr: '', descriptionTr: '', descriptionEn: '',
  imageUrl: '', imageUrl2: '', sortOrder: 0, isActive: true,
};

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Bilinmeyen hata';
}

export default function AdminSectors() {
  const utils = trpc.useUtils();
  const { data: sectorList, isLoading } = trpc.cms.sectorList.useQuery();
  const { data: assetList } = trpc.cms.assetList.useQuery();
  const [editing, setEditing] = useState<typeof emptyForm | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const createMut = trpc.cms.sectorCreate.useMutation();
  const updateMut = trpc.cms.sectorUpdate.useMutation();
  const deleteMut = trpc.cms.sectorDelete.useMutation({ onSuccess: () => utils.cms.sectorList.invalidate() });
  const autoTranslateMut = trpc.cms.autoTranslate.useMutation();

  const filtered = sectorList?.filter(s =>
    s.titleEn?.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.slug.trim()) {
      setStatus('error');
      setStatusMessage('Slug boş olamaz.');
      return;
    }
    if (!editing.number.trim()) {
      setStatus('error');
      setStatusMessage('No alanı boş olamaz.');
      return;
    }
    if (!editing.titleEn.trim()) {
      setStatus('error');
      setStatusMessage('Başlık İngilizce zorunlu.');
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
      await utils.cms.sectorList.invalidate();
      setStatus('success');
      setStatusMessage('Sektör başarıyla kaydedildi.');
      setEditing(null);
    } catch (error) {
      setStatus('error');
      setStatusMessage(`Kaydetme hatası: ${getErrorMessage(error)}`);
    }
  };

  const autoTranslateFromTr = async () => {
    if (!editing) return;
    const titleBase = editing.titleTr?.trim();
    const descBase = editing.descriptionTr?.trim();
    if (!titleBase && !descBase) return;

    const [titleResp, descResp] = await Promise.all([
      titleBase ? autoTranslateMut.mutateAsync({ text: titleBase }) : Promise.resolve(null),
      descBase ? autoTranslateMut.mutateAsync({ text: descBase }) : Promise.resolve(null),
    ]);

    setEditing({
      ...editing,
      titleEn: titleResp?.en || editing.titleEn,
      titleSr: titleResp?.sr || editing.titleSr,
      descriptionEn: descResp?.en || editing.descriptionEn,
      descriptionSr: descResp?.sr || editing.descriptionSr,
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-display text-white mb-1">Sektörler</h1><p className="text-[#8A9BAE] text-sm">Site sektörlerini yönetin.</p></div>
        <button onClick={() => { setEditing({ ...emptyForm }); setStatus('idle'); setStatusMessage(''); }} className="flex items-center gap-2 bg-[#4A7C59] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5A8C69]"><Plus size={16} /> Yeni Sektör</button>
      </div>
      {status !== 'idle' && (
        <div className={`mb-4 rounded-lg border px-3 py-2 text-xs ${status === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : status === 'error' ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-slate-500/30 bg-slate-500/10 text-slate-300'}`}>
          {statusMessage}
        </div>
      )}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9BAE]" />
        <input type="text" placeholder="Ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#0D1F2D] border border-[#1A3A4A] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
      </div>
      <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-[#1A3A4A]">
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">No</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Slug</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Başlık (EN)</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Görsel</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Durum</th>
            <th className="text-right text-[#8A9BAE] text-xs font-medium px-4 py-3">İşlemler</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} className="text-center text-[#8A9BAE] py-8">Yükleniyor...</td></tr> :
             filtered?.length === 0 ? <tr><td colSpan={6} className="text-center text-[#8A9BAE] py-8">Veri yok.</td></tr> :
             filtered?.map((s) => (
              <tr key={s.id} className="border-b border-[#1A3A4A] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-white text-sm">{s.number}</td>
                <td className="px-4 py-3 text-white text-sm">{s.slug}</td>
                <td className="px-4 py-3 text-white text-sm">{s.titleEn}</td>
                <td className="px-4 py-3">{s.imageUrl && <img src={s.imageUrl} alt="" className="w-12 h-8 object-cover rounded" />}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{s.isActive ? 'Aktif' : 'Pasif'}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setEditing({ id: s.id, slug: s.slug, number: s.number, titleSr: s.titleSr||'', titleTr: s.titleTr||'', titleEn: s.titleEn||'', descriptionSr: s.descriptionSr||'', descriptionTr: s.descriptionTr||'', descriptionEn: s.descriptionEn||'', imageUrl: s.imageUrl||'', imageUrl2: s.imageUrl2||'', sortOrder: s.sortOrder, isActive: s.isActive })} className="text-[#8A9BAE] hover:text-[#4A7C59]"><Pencil size={15} /></button>
                    <button onClick={() => { if (confirm('Silmek istediğinize emin misiniz?')) deleteMut.mutate({ id: s.id }); }} className="text-[#8A9BAE] hover:text-red-400"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between p-6 border-b border-[#1A3A4A]"><h2 className="text-white font-medium">{editing.id ? 'Sektör Düzenle' : 'Yeni Sektör'}</h2><button onClick={() => setEditing(null)} className="text-[#8A9BAE] hover:text-white"><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input value={editing.slug} onChange={(e) => setEditing({...editing, slug: e.target.value})} placeholder="Slug" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
                <input value={editing.number} onChange={(e) => setEditing({...editing, number: e.target.value})} placeholder="No (01)" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              </div>
              <input value={editing.titleSr} onChange={(e) => setEditing({...editing, titleSr: e.target.value})} placeholder="Başlık Sırpça" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              <input value={editing.titleTr} onChange={(e) => setEditing({...editing, titleTr: e.target.value})} placeholder="Başlık Türkçe" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              <input value={editing.titleEn} onChange={(e) => setEditing({...editing, titleEn: e.target.value})} placeholder="Başlık İngilizce *" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              <textarea value={editing.descriptionSr} onChange={(e) => setEditing({...editing, descriptionSr: e.target.value})} placeholder="Açıklama Sırpça" rows={2} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none resize-none" />
              <textarea value={editing.descriptionTr} onChange={(e) => setEditing({...editing, descriptionTr: e.target.value})} placeholder="Açıklama Türkçe" rows={2} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none resize-none" />
              <textarea value={editing.descriptionEn} onChange={(e) => setEditing({...editing, descriptionEn: e.target.value})} placeholder="Açıklama İngilizce" rows={2} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none resize-none" />
              <button
                onClick={autoTranslateFromTr}
                className="flex items-center gap-2 bg-[#1A3A4A] text-[#D9E5F2] px-3 py-2 rounded-lg text-xs hover:bg-[#24495F]"
              >
                <Sparkles size={14} /> Türkçeden EN + SR otomatik üret
              </button>
              <div className="grid grid-cols-2 gap-4">
                <input value={editing.imageUrl} onChange={(e) => setEditing({...editing, imageUrl: e.target.value})} placeholder="Görsel URL 1" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
                <input value={editing.imageUrl2} onChange={(e) => setEditing({...editing, imageUrl2: e.target.value})} placeholder="Görsel URL 2" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value=""
                  onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                  className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none"
                >
                  <option value="">Medya kütüphanesinden seç (1)...</option>
                  {(assetList || []).map((a) => (
                    <option key={a.id} value={a.url}>{a.originalName} - {a.category}</option>
                  ))}
                </select>
                <select
                  value=""
                  onChange={(e) => setEditing({ ...editing, imageUrl2: e.target.value })}
                  className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none"
                >
                  <option value="">Medya kütüphanesinden seç (2)...</option>
                  {(assetList || []).map((a) => (
                    <option key={a.id} value={a.url}>{a.originalName} - {a.category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({...editing, sortOrder: Number(e.target.value)})} placeholder="Sıra" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
                <div className="flex items-center gap-2 pt-2"><input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({...editing, isActive: e.target.checked})} className="w-4 h-4 accent-[#4A7C59]" /><label className="text-white text-sm">Aktif</label></div>
              </div>
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
