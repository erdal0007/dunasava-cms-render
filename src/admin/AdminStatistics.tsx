import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { Plus, Pencil, Trash2, X, Save, Search } from 'lucide-react';

const emptyForm = { id: 0, value: '', suffix: '', labelSr: '', labelTr: '', labelEn: '', sortOrder: 0, isActive: true };

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Bilinmeyen hata';
}

export default function AdminStatistics() {
  const utils = trpc.useUtils();
  const { data: statList, isLoading } = trpc.cms.statisticList.useQuery();
  const [editing, setEditing] = useState<typeof emptyForm | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const createMut = trpc.cms.statisticCreate.useMutation();
  const updateMut = trpc.cms.statisticUpdate.useMutation();
  const deleteMut = trpc.cms.statisticDelete.useMutation({ onSuccess: () => utils.cms.statisticList.invalidate() });

  const filtered = statList?.filter(s =>
    s.labelEn?.toLowerCase().includes(search.toLowerCase()) ||
    s.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.value.trim()) {
      setStatus('error');
      setStatusMessage('Değer boş olamaz.');
      return;
    }
    if (!editing.labelEn.trim()) {
      setStatus('error');
      setStatusMessage('Etiket İngilizce zorunlu.');
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
      await utils.cms.statisticList.invalidate();
      setStatus('success');
      setStatusMessage('İstatistik başarıyla kaydedildi.');
      setEditing(null);
    } catch (error) {
      setStatus('error');
      setStatusMessage(`Kaydetme hatası: ${getErrorMessage(error)}`);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-display text-white mb-1">İstatistikler</h1><p className="text-[#8A9BAE] text-sm">Site istatistiklerini yönetin.</p></div>
        <button onClick={() => { setEditing({ ...emptyForm }); setStatus('idle'); setStatusMessage(''); }} className="flex items-center gap-2 bg-[#4A7C59] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5A8C69]"><Plus size={16} /> Yeni İstatistik</button>
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
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Sıra</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Değer</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Sonek</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Etiket (EN)</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Durum</th>
            <th className="text-right text-[#8A9BAE] text-xs font-medium px-4 py-3">İşlemler</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} className="text-center text-[#8A9BAE] py-8">Yükleniyor...</td></tr> :
             filtered?.length === 0 ? <tr><td colSpan={6} className="text-center text-[#8A9BAE] py-8">Veri yok.</td></tr> :
             filtered?.map((s) => (
              <tr key={s.id} className="border-b border-[#1A3A4A] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-white text-sm">{s.sortOrder}</td>
                <td className="px-4 py-3 text-white text-sm font-bold">{s.value}</td>
                <td className="px-4 py-3 text-white text-sm">{s.suffix}</td>
                <td className="px-4 py-3 text-white text-sm">{s.labelEn}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{s.isActive ? 'Aktif' : 'Pasif'}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setEditing({ id: s.id, value: s.value, suffix: s.suffix, labelSr: s.labelSr||'', labelTr: s.labelTr||'', labelEn: s.labelEn||'', sortOrder: s.sortOrder, isActive: s.isActive })} className="text-[#8A9BAE] hover:text-[#4A7C59]"><Pencil size={15} /></button>
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
          <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-[#1A3A4A]"><h2 className="text-white font-medium">{editing.id ? 'İstatistik Düzenle' : 'Yeni İstatistik'}</h2><button onClick={() => setEditing(null)} className="text-[#8A9BAE] hover:text-white"><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <input value={editing.value} onChange={(e) => setEditing({...editing, value: e.target.value})} placeholder="Değer (50)" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
                <input value={editing.suffix} onChange={(e) => setEditing({...editing, suffix: e.target.value})} placeholder="Sonek (+)" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
                <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({...editing, sortOrder: Number(e.target.value)})} placeholder="Sıra" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              </div>
              <input value={editing.labelSr} onChange={(e) => setEditing({...editing, labelSr: e.target.value})} placeholder="Etiket Sırpça" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              <input value={editing.labelTr} onChange={(e) => setEditing({...editing, labelTr: e.target.value})} placeholder="Etiket Türkçe" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              <input value={editing.labelEn} onChange={(e) => setEditing({...editing, labelEn: e.target.value})} placeholder="Etiket İngilizce *" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              <div className="flex items-center gap-2"><input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({...editing, isActive: e.target.checked})} className="w-4 h-4 accent-[#4A7C59]" /><label className="text-white text-sm">Aktif</label></div>
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
