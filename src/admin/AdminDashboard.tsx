import { trpc } from '@/providers/trpc';
import { getCmsSectionLabel } from '@contracts/cms';
import {
  Layers, Package, Factory, Languages, BarChart3, Image, Globe,
} from 'lucide-react';

export default function AdminDashboard() {
  const { data: sections } = trpc.cms.sectionList.useQuery();
  const { data: products } = trpc.cms.productList.useQuery();
  const { data: sectors } = trpc.cms.sectorList.useQuery();
  const { data: translations } = trpc.cms.translationList.useQuery();
  const { data: stats } = trpc.cms.statisticList.useQuery();
  const { data: assets } = trpc.cms.assetList.useQuery();

  const cards = [
    { label: 'Bölümler', count: sections?.length || 0, icon: Layers, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Ürünler', count: products?.length || 0, icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Sektörler', count: sectors?.length || 0, icon: Factory, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Çeviriler', count: translations?.length || 0, icon: Languages, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'İstatistikler', count: stats?.length || 0, icon: BarChart3, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { label: 'Görseller', count: assets?.length || 0, icon: Image, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display text-white mb-1">Dashboard</h1>
        <p className="text-[#8A9BAE] text-sm">DunaSava web sitesi yönetim paneline hoş geldiniz.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl p-5">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={card.color} />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{card.count}</div>
              <div className="text-[#8A9BAE] text-xs">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Info */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-[#4A7C59]" />
            <h2 className="text-white font-medium">Dil Desteği</h2>
          </div>
          <div className="space-y-3">
            {[
              { code: 'SR', name: 'Sırpça', flag: '🇷🇸', status: 'Aktif' },
              { code: 'TR', name: 'Türkçe', flag: '🇹🇷', status: 'Aktif' },
              { code: 'EN', name: 'İngilizce', flag: '🇬🇧', status: 'Aktif' },
            ].map((lang) => (
              <div key={lang.code} className="flex items-center justify-between py-2 border-b border-[#1A3A4A] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{lang.flag}</span>
                  <div>
                    <div className="text-white text-sm">{lang.name}</div>
                    <div className="text-[#8A9BAE] text-[10px]">{lang.code}</div>
                  </div>
                </div>
                <span className="text-[10px] bg-[#4A7C59]/15 text-[#4A7C59] px-2 py-0.5 rounded-full">{lang.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0D1F2D] border border-[#1A3A4A] rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">Site Bölümleri Durumu</h2>
          <div className="space-y-2">
            {sections?.map((section) => (
              <div key={section.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${section.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className="text-white text-sm">{section.titleEn}</span>
                </div>
                <span className="text-[#8A9BAE] text-[10px] uppercase">{getCmsSectionLabel(section.sectionType, 'tr')}</span>
              </div>
            )) || <p className="text-[#8A9BAE] text-sm">Veri yok</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
