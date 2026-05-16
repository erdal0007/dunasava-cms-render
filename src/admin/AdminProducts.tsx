import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { Plus, Pencil, Trash2, X, Save, Search, Sparkles } from 'lucide-react';

const emptyForm = {
  id: 0, slug: '', titleSr: '', titleTr: '', titleEn: '',
  descriptionSr: '', descriptionTr: '', descriptionEn: '',
  imageUrl: '', sortOrder: 0, isActive: true,
};

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const { data: productList, isLoading } = trpc.cms.productList.useQuery();
  const { data: assetList } = trpc.cms.assetList.useQuery();
  const [editing, setEditing] = useState<typeof emptyForm | null>(null);
  const [search, setSearch] = useState('');

  const createMut = trpc.cms.productCreate.useMutation({ onSuccess: () => { utils.cms.productList.invalidate(); setEditing(null); } });
  const updateMut = trpc.cms.productUpdate.useMutation({ onSuccess: () => { utils.cms.productList.invalidate(); setEditing(null); } });
  const deleteMut = trpc.cms.productDelete.useMutation({ onSuccess: () => utils.cms.productList.invalidate() });
  const autoTranslateMut = trpc.cms.autoTranslate.useMutation();

  const filtered = productList?.filter(p =>
    p.titleEn?.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!editing) return;
    const { id, ...data } = editing;
    if (id) {
      updateMut.mutate({ id, ...data });
    } else {
      createMut.mutate(data);
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
        <div>
          <h1 className="text-2xl font-display text-white mb-1">Ürünler</h1>
          <p className="text-[#8A9BAE] text-sm">Site ürünlerini yönetin.</p>
        </div>
        <button onClick={() => setEditing({ ...emptyForm })} className="flex items-center gap-2 bg-[#4A7C59] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5A8C69] transition-colors">
          <Plus size={16} /> Yeni Ürün
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9BAE]" />
        <input type="text" placeholder="Ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#0D1F2D] border border-[#1A3A4A] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
      </div>

      <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-[#1A3A4A]">
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Sıra</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Slug</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Başlık (EN)</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Görsel</th>
            <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Durum</th>
            <th className="text-right text-[#8A9BAE] text-xs font-medium px-4 py-3">İşlemler</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} className="text-center text-[#8A9BAE] py-8">Yükleniyor...</td></tr> :
             filtered?.length === 0 ? <tr><td colSpan={6} className="text-center text-[#8A9BAE] py-8">Veri yok.</td></tr> :
             filtered?.map((p) => (
              <tr key={p.id} className="border-b border-[#1A3A4A] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-white text-sm">{p.sortOrder}</td>
                <td className="px-4 py-3 text-white text-sm">{p.slug}</td>
                <td className="px-4 py-3 text-white text-sm">{p.titleEn}</td>
                <td className="px-4 py-3">{p.imageUrl && <img src={p.imageUrl} alt="" className="w-12 h-8 object-cover rounded" />}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{p.isActive ? 'Aktif' : 'Pasif'}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setEditing({ id: p.id, slug: p.slug, titleSr: p.titleSr||'', titleTr: p.titleTr||'', titleEn: p.titleEn||'', descriptionSr: p.descriptionSr||'', descriptionTr: p.descriptionTr||'', descriptionEn: p.descriptionEn||'', imageUrl: p.imageUrl||'', sortOrder: p.sortOrder, isActive: p.isActive })} className="text-[#8A9BAE] hover:text-[#4A7C59]"><Pencil size={15} /></button>
                    <button onClick={() => { if (confirm('Silmek istediğinize emin misiniz?')) deleteMut.mutate({ id: p.id }); }} className="text-[#8A9BAE] hover:text-red-400"><Trash2 size={15} /></button>
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
            <div className="flex items-center justify-between p-6 border-b border-[#1A3A4A]">
              <h2 className="text-white font-medium">{editing.id ? 'Ürün Düzenle' : 'Yeni Ürün'}</h2>
              <button onClick={() => setEditing(null)} className="text-[#8A9BAE] hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <input value={editing.slug} onChange={(e) => setEditing({...editing, slug: e.target.value})} placeholder="Slug" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
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
              <input value={editing.imageUrl} onChange={(e) => setEditing({...editing, imageUrl: e.target.value})} placeholder="Görsel URL" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              <select
                value=""
                onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none"
              >
                <option value="">Medya kütüphanesinden seç...</option>
                {(assetList || []).map((a) => (
                  <option key={a.id} value={a.url}>{a.originalName} - {a.category}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({...editing, sortOrder: Number(e.target.value)})} placeholder="Sıra" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
                <div className="flex items-center gap-2 pt-2"><input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({...editing, isActive: e.target.checked})} className="w-4 h-4 accent-[#4A7C59]" /><label className="text-white text-sm">Aktif</label></div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1A3A4A]">
              <button onClick={() => setEditing(null)} className="text-[#8A9BAE] hover:text-white text-sm px-4 py-2">İptal</button>
              <button onClick={handleSave} className="flex items-center gap-2 bg-[#4A7C59] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5A8C69]"><Save size={14} /> Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
