import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Save, Search, Sparkles } from 'lucide-react';
import { resolveCmsAssetUrl } from '@/lib/assetUrl';
import {
  CMS_SECTION_META,
  CMS_SECTION_TYPES,
  getCmsSectionLabel,
  type CmsSectionType,
} from '@contracts/cms';

const sectionTypes = CMS_SECTION_TYPES;

type SectionType = CmsSectionType;

type SectionForm = {
  id: number;
  slug: string;
  titleSr: string;
  titleTr: string;
  titleEn: string;
  contentSr: string;
  contentTr: string;
  contentEn: string;
  eyebrowSr: string;
  eyebrowTr: string;
  eyebrowEn: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  sectionType: SectionType;
};

const emptyForm: SectionForm = {
  id: 0,
  slug: '',
  titleSr: '',
  titleTr: '',
  titleEn: '',
  contentSr: '',
  contentTr: '',
  contentEn: '',
  eyebrowSr: '',
  eyebrowTr: '',
  eyebrowEn: '',
  imageUrl: '',
  sortOrder: CMS_SECTION_META.content.defaultSortOrder,
  isActive: true,
  sectionType: 'content',
};

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Bilinmeyen hata';
}

export default function AdminSections() {
  const utils = trpc.useUtils();
  const { data: sections, isLoading } = trpc.cms.sectionList.useQuery();
  const { data: assetList } = trpc.cms.assetList.useQuery();
  const [editing, setEditing] = useState<SectionForm | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const createMut = trpc.cms.sectionCreate.useMutation();
  const updateMut = trpc.cms.sectionUpdate.useMutation();
  const deleteMut = trpc.cms.sectionDelete.useMutation({
    onSuccess: async () => {
      await utils.cms.sectionList.invalidate();
      toast.success('Bölüm silindi.');
    },
    onError: (error) => {
      toast.error(`Bölüm silinemedi: ${getErrorMessage(error)}`);
    },
  });
  const toggleMut = trpc.cms.sectionToggle.useMutation({
    onSuccess: async () => {
      await utils.cms.sectionList.invalidate();
    },
  });
  const autoTranslateMut = trpc.cms.autoTranslate.useMutation();

  const searchTerm = search.toLowerCase();
  const selectableAssets = (assetList || []).filter((asset) => asset.isVisible !== false);
  const filtered = sections?.filter((section) => {
    const typeLabel = getCmsSectionLabel(section.sectionType, 'tr').toLowerCase();
    return [
      section.titleEn || '',
      section.titleTr || '',
      section.titleSr || '',
      section.slug || '',
      typeLabel,
    ].some((value) => value.toLowerCase().includes(searchTerm));
  });

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.slug.trim()) {
      setStatus('error');
      setStatusMessage('Slug boş olamaz.');
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
      await utils.cms.sectionList.invalidate();
      setStatus('success');
      setStatusMessage('Bölüm başarıyla kaydedildi.');
      setEditing(null);
    } catch (error) {
      setStatus('error');
      setStatusMessage(`Kaydetme hatası: ${getErrorMessage(error)}`);
    }
  };

  const autoTranslateFromTr = async () => {
    if (!editing) return;
    const titleBase = editing.titleTr?.trim();
    const contentBase = editing.contentTr?.trim();
    const eyebrowBase = editing.eyebrowTr?.trim();
    if (!titleBase && !contentBase && !eyebrowBase) return;

    const [titleResp, contentResp, eyebrowResp] = await Promise.all([
      titleBase ? autoTranslateMut.mutateAsync({ text: titleBase }) : Promise.resolve(null),
      contentBase ? autoTranslateMut.mutateAsync({ text: contentBase }) : Promise.resolve(null),
      eyebrowBase ? autoTranslateMut.mutateAsync({ text: eyebrowBase }) : Promise.resolve(null),
    ]);

    setEditing({
      ...editing,
      titleEn: titleResp?.en || editing.titleEn,
      titleSr: titleResp?.sr || editing.titleSr,
      contentEn: contentResp?.en || editing.contentEn,
      contentSr: contentResp?.sr || editing.contentSr,
      eyebrowEn: eyebrowResp?.en || editing.eyebrowEn,
      eyebrowSr: eyebrowResp?.sr || editing.eyebrowSr,
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display text-white mb-1">Bölümler</h1>
          <p className="text-[#8A9BAE] text-sm">Site bölümlerini yönetin.</p>
        </div>
        <button
          onClick={() => {
            setEditing({ ...emptyForm });
            setStatus('idle');
            setStatusMessage('');
          }}
          className="flex items-center gap-2 bg-[#4A7C59] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5A8C69] transition-colors"
        >
          <Plus size={16} /> Yeni Bölüm
        </button>
      </div>

      {status !== 'idle' && (
        <div
          className={`mb-4 rounded-lg border px-3 py-2 text-xs ${
            status === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : status === 'error'
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                : 'border-slate-500/30 bg-slate-500/10 text-slate-300'
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9BAE]" />
        <input
          type="text"
          placeholder="Ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0D1F2D] border border-[#1A3A4A] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-[#4A7C59] focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1A3A4A]">
              <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Sıra</th>
              <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Slug</th>
              <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Başlık (EN)</th>
              <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Tip</th>
              <th className="text-left text-[#8A9BAE] text-xs font-medium px-4 py-3">Durum</th>
              <th className="text-right text-[#8A9BAE] text-xs font-medium px-4 py-3">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center text-[#8A9BAE] py-8">Yükleniyor...</td></tr>
            ) : filtered?.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-[#8A9BAE] py-8">Veri yok.</td></tr>
            ) : filtered?.map((section) => (
              <tr key={section.id} className="border-b border-[#1A3A4A] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-white text-sm">{section.sortOrder}</td>
                <td className="px-4 py-3 text-white text-sm">{section.slug}</td>
                <td className="px-4 py-3 text-white text-sm">{section.titleEn}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] bg-[#1A3A4A] text-[#8A9BAE] px-2 py-0.5 rounded uppercase">{getCmsSectionLabel(section.sectionType, 'tr')}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleMut.mutate({ id: section.id, isActive: !section.isActive })}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                      section.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {section.isActive ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setEditing({
                      id: section.id, slug: section.slug, titleSr: section.titleSr || '', titleTr: section.titleTr || '',
                      titleEn: section.titleEn || '', contentSr: section.contentSr || '', contentTr: section.contentTr || '',
                      contentEn: section.contentEn || '', eyebrowSr: section.eyebrowSr || '', eyebrowTr: section.eyebrowTr || '',
                      eyebrowEn: section.eyebrowEn || '', imageUrl: section.imageUrl || '', sortOrder: section.sortOrder,
                      isActive: section.isActive, sectionType: section.sectionType as SectionType,
                    })} className="text-[#8A9BAE] hover:text-[#4A7C59] transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => { if (confirm('Silmek istediğinize emin misiniz?')) deleteMut.mutate({ id: section.id }); }} className="text-[#8A9BAE] hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between p-6 border-b border-[#1A3A4A]">
              <h2 className="text-white font-medium">{editing.id ? 'Bölüm Düzenle' : 'Yeni Bölüm'}</h2>
              <button onClick={() => setEditing(null)} className="text-[#8A9BAE] hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#8A9BAE] text-xs mb-1 block">Slug</label>
                  <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
                </div>
                <div>
                  <label className="text-[#8A9BAE] text-xs mb-1 block">Tip</label>
                  <select value={editing.sectionType} onChange={(e) => setEditing({ ...editing, sectionType: e.target.value as SectionType })} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none">
                    {sectionTypes.map((type) => <option key={type} value={type}>{getCmsSectionLabel(type, 'tr')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[#8A9BAE] text-xs mb-1 block">Başlık Sırpça</label>
                <input value={editing.titleSr} onChange={(e) => setEditing({ ...editing, titleSr: e.target.value })} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              </div>
              <div>
                <label className="text-[#8A9BAE] text-xs mb-1 block">Başlık Türkçe</label>
                <input value={editing.titleTr} onChange={(e) => setEditing({ ...editing, titleTr: e.target.value })} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              </div>
              <div>
                <label className="text-[#8A9BAE] text-xs mb-1 block">Başlık İngilizce *</label>
                <input value={editing.titleEn} onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              </div>
              <div>
                <label className="text-[#8A9BAE] text-xs mb-1 block">İçerik Sırpça</label>
                <textarea value={editing.contentSr} onChange={(e) => setEditing({ ...editing, contentSr: e.target.value })} rows={3} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none resize-none" />
              </div>
              <div>
                <label className="text-[#8A9BAE] text-xs mb-1 block">İçerik Türkçe</label>
                <textarea value={editing.contentTr} onChange={(e) => setEditing({ ...editing, contentTr: e.target.value })} rows={3} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none resize-none" />
              </div>
              <div>
                <label className="text-[#8A9BAE] text-xs mb-1 block">İçerik İngilizce</label>
                <textarea value={editing.contentEn} onChange={(e) => setEditing({ ...editing, contentEn: e.target.value })} rows={3} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none resize-none" />
              </div>
              <button
                onClick={autoTranslateFromTr}
                className="flex items-center gap-2 bg-[#1A3A4A] text-[#D9E5F2] px-3 py-2 rounded-lg text-xs hover:bg-[#24495F]"
              >
                <Sparkles size={14} /> Türkçeden EN + SR otomatik üret
              </button>
              <div>
                <label className="text-[#8A9BAE] text-xs mb-1 block">Görsel URL</label>
                <input value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: resolveCmsAssetUrl(e.target.value) })} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
              </div>
              <select
                value=""
                onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none"
              >
                <option value="">Medya kütüphanesinden seç...</option>
                {selectableAssets.map((a) => (
                  <option key={a.id} value={resolveCmsAssetUrl(a.url)}>
                    {a.originalName} - {a.category}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#8A9BAE] text-xs mb-1 block">Sıra</label>
                  <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="w-4 h-4 accent-[#4A7C59]" />
                  <label className="text-white text-sm">Aktif</label>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1A3A4A]">
              <button onClick={() => setEditing(null)} className="text-[#8A9BAE] hover:text-white text-sm px-4 py-2">İptal</button>
              <button onClick={handleSave} disabled={status === 'saving'} className="flex items-center gap-2 bg-[#4A7C59] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5A8C69] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                <Save size={14} /> {status === 'saving' ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
