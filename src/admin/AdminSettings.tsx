import { useEffect, useMemo, useState } from 'react';
import { trpc } from '@/providers/trpc';
import { Save, AlertTriangle } from 'lucide-react';

const DEFAULTS = {
  siteName: 'DunaSava',
  siteTagline: 'Snaga za Konstrukcije',
  contactEmail: 'isakov@dunasava.com',
  contactPhone: '+381 63 8201207',
  address: 'Luke Celovica Trabinjca 18, BW Kings Park, Office 319, Beograd, Srbija',
  whatsapp: '381638201207',
};

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export default function AdminSettings() {
  const utils = trpc.useUtils();
  const { data: settings } = trpc.cms.settingList.useQuery();
  const upsertMut = trpc.cms.settingUpsert.useMutation();

  const [siteName, setSiteName] = useState(DEFAULTS.siteName);
  const [siteTagline, setSiteTagline] = useState(DEFAULTS.siteTagline);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [contactPhone, setContactPhone] = useState(DEFAULTS.contactPhone);
  const [address, setAddress] = useState(DEFAULTS.address);
  const [whatsapp, setWhatsapp] = useState(DEFAULTS.whatsapp);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const settingsMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of settings ?? []) {
      map.set(item.key, item.value ?? '');
    }
    return map;
  }, [settings]);

  useEffect(() => {
    if (!settings) return;
    setSiteName(settingsMap.get('site_name') || DEFAULTS.siteName);
    setSiteTagline(settingsMap.get('site_tagline') || DEFAULTS.siteTagline);
    setContactEmail(settingsMap.get('contact_email') || DEFAULTS.contactEmail);
    setContactPhone(settingsMap.get('contact_phone') || DEFAULTS.contactPhone);
    setAddress(settingsMap.get('contact_address') || DEFAULTS.address);
    setWhatsapp(settingsMap.get('whatsapp') || DEFAULTS.whatsapp);
  }, [settings, settingsMap]);

  const handleSave = async () => {
    setStatus('saving');
    setStatusMessage('Kaydediliyor...');

    const items = [
      { key: 'site_name', value: siteName, group: 'general' },
      { key: 'site_tagline', value: siteTagline, group: 'general' },
      { key: 'contact_email', value: contactEmail, group: 'contact' },
      { key: 'contact_phone', value: contactPhone, group: 'contact' },
      { key: 'contact_address', value: address, group: 'contact' },
      { key: 'whatsapp', value: whatsapp, group: 'contact' },
    ];

    try {
      await Promise.all(items.map((item) => upsertMut.mutateAsync(item)));
      await utils.cms.settingList.invalidate();
      setStatus('success');
      setStatusMessage('Ayarlar başarıyla kaydedildi.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
      setStatus('error');
      setStatusMessage(`Kaydetme hatası: ${message}`);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-display text-white mb-1">Ayarlar</h1>
        <p className="text-[#8A9BAE] text-sm">Site genel ayarlarını yapılandırın.</p>
      </div>

      <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#4A7C59] rounded-full" /> Genel Ayarlar
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-[#8A9BAE] text-xs mb-1 block">Site Adı</label>
            <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
          </div>
          <div>
            <label className="text-[#8A9BAE] text-xs mb-1 block">Site Sloganı</label>
            <input value={siteTagline} onChange={(e) => setSiteTagline(e.target.value)} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#4A7C59] rounded-full" /> İletişim Bilgileri
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-[#8A9BAE] text-xs mb-1 block">E-posta</label>
            <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
          </div>
          <div>
            <label className="text-[#8A9BAE] text-xs mb-1 block">Telefon</label>
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
          </div>
          <div>
            <label className="text-[#8A9BAE] text-xs mb-1 block">Adres</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none resize-none" />
          </div>
          <div>
            <label className="text-[#8A9BAE] text-xs mb-1 block">WhatsApp Numarası</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="381638201207" className="w-full bg-[#0A1628] border border-[#1A3A4A] rounded px-3 py-2 text-white text-sm focus:border-[#4A7C59] focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-amber-400/80 text-xs">Değişiklikler kaydedildiğinde site anında güncellenir. Lütfen dikkatli olun.</p>
      </div>

      {status !== 'idle' && (
        <div
          className={`mb-6 rounded-lg border px-3 py-2 text-xs ${
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

      <button
        onClick={handleSave}
        disabled={status === 'saving'}
        className="flex items-center gap-2 bg-[#4A7C59] text-white px-6 py-2.5 rounded-lg text-sm hover:bg-[#5A8C69] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Save size={16} /> {status === 'saving' ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
      </button>
    </div>
  );
}
