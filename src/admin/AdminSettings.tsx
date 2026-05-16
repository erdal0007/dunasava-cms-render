import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { Save, AlertTriangle } from 'lucide-react';

export default function AdminSettings() {
  const utils = trpc.useUtils();
  const { data: settings } = trpc.cms.settingList.useQuery();
  const upsertMut = trpc.cms.settingUpsert.useMutation({ onSuccess: () => utils.cms.settingList.invalidate() });

  const [siteName, setSiteName] = useState(settings?.find(s => s.key === 'site_name')?.value || 'DunaSava');
  const [siteTagline, setSiteTagline] = useState(settings?.find(s => s.key === 'site_tagline')?.value || 'Snaga za Konstrukcije');
  const [contactEmail, setContactEmail] = useState(settings?.find(s => s.key === 'contact_email')?.value || 'isakov@dunasava.com');
  const [contactPhone, setContactPhone] = useState(settings?.find(s => s.key === 'contact_phone')?.value || '+381 63 8201207');
  const [address, setAddress] = useState(settings?.find(s => s.key === 'contact_address')?.value || 'Luke Celovica Trabinjca 18, BW Kings Park, Office 319, Beograd, Srbija');
  const [whatsapp, setWhatsapp] = useState(settings?.find(s => s.key === 'whatsapp')?.value || '381638201207');

  const handleSave = () => {
    const items = [
      { key: 'site_name', value: siteName, group: 'general' },
      { key: 'site_tagline', value: siteTagline, group: 'general' },
      { key: 'contact_email', value: contactEmail, group: 'contact' },
      { key: 'contact_phone', value: contactPhone, group: 'contact' },
      { key: 'contact_address', value: address, group: 'contact' },
      { key: 'whatsapp', value: whatsapp, group: 'contact' },
    ];
    items.forEach(item => upsertMut.mutate(item));
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

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-amber-400/80 text-xs">Değişiklikler kaydedildiğinde site anında güncellenir. Lütfen dikkatli olun.</p>
      </div>

      <button onClick={handleSave} className="flex items-center gap-2 bg-[#4A7C59] text-white px-6 py-2.5 rounded-lg text-sm hover:bg-[#5A8C69] transition-colors">
        <Save size={16} /> Ayarları Kaydet
      </button>
    </div>
  );
}
