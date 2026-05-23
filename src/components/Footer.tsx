import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import { Linkedin, Instagram, Facebook, MapPin, Mail, Phone, ChevronUp } from 'lucide-react';
import WatermarkedImage from './WatermarkedImage';
import { buildCmsSectionNavItems, getDefaultCmsSectionRows } from '@contracts/cms';
import { useMemo } from 'react';

export default function Footer() {
  const { t } = useLanguage();
  const { data: settings } = trpc.cms.settingList.useQuery();
  const { data: products } = trpc.cms.productList.useQuery();
  const { data: sectionList } = trpc.cms.sectionList.useQuery();

  const getSetting = (key: string) => settings?.find(s => s.key === key)?.value || '';
  const tagline = t('Yapılar için Güç', 'Yapılar için Güç', 'Strength for Constructions');
  const copyright = t('© 2026 DunaSava. Tüm hakları saklıdır.', '© 2026 DunaSava. Tüm hakları saklıdır.', '© 2026 DunaSava. All rights reserved.');
  const sectionSource = useMemo(
    () => (sectionList?.length ? sectionList : getDefaultCmsSectionRows()),
    [sectionList]
  );
  const navItems = useMemo(
    () => [
      { href: '#hero', label: t('Ana Sayfa', 'Ana Sayfa', 'Home') },
      ...buildCmsSectionNavItems(sectionSource, 'tr'),
    ],
    [sectionSource, t]
  );

  const handleNavClick = (href: string) => {
    const id = href.replace(/^#/, '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="relative overflow-hidden bg-[#08111d] text-white">
      <div className="absolute inset-0 opacity-25">
        <WatermarkedImage
          src="/assets/images/production-facility.jpg"
          alt=""
          className="h-full w-full"
          imgClassName="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(157,188,146,0.12),transparent_30%),linear-gradient(180deg,rgba(8,17,29,0.92),rgba(8,17,29,0.98))]" />
      </div>

      <div className="content-max relative z-10 px-6 py-16 md:px-10 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div>
            <span className="section-kicker text-[#9DBC92]">DUNASAVA</span>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/68">{tagline}</p>
            <div className="mt-6 flex items-center gap-3">
              {[Linkedin, Instagram, Facebook].map((Icon, i) => (
                <button key={i} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/60 transition-colors hover:border-[#9DBC92]/40 hover:text-[#BFD0B7]" aria-label="Social">
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="section-kicker text-[#9DBC92]">{t('NAVİGASYON', 'NAVİGASYON', 'NAVIGATION')}</span>
            <ul className="mt-5 space-y-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <button onClick={() => handleNavClick(item.href)} className="text-left text-sm text-white/62 transition-colors hover:text-[#BFD0B7]">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="section-kicker text-[#9DBC92]">{t('ÜRÜNLER', 'ÜRÜNLER', 'PRODUCTS')}</span>
            <ul className="mt-5 space-y-3">
              {products?.filter(p => p.isActive).slice(0, 6).map(p => (
                <li key={p.id} className="text-sm text-white/60">{p.titleEn}</li>
              )) || <li className="text-sm text-white/45">-</li>}
            </ul>
          </div>

          <div>
            <span className="section-kicker text-[#9DBC92]">{t('KONTAKT', 'KONTAKT', 'CONTACT')}</span>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3"><MapPin size={15} className="mt-0.5 text-[#9DBC92]" /><span className="text-sm leading-7 text-white/60">{getSetting('contact_address') || 'Luke Celovica Trabinjca 18, BW Kings Park, Office 319, Beograd, Srbija'}</span></div>
              <div className="flex items-center gap-3"><Mail size={15} className="text-[#9DBC92]" /><a href={`mailto:${getSetting('contact_email') || 'isakov@dunasava.com'}`} className="text-sm text-white/70 hover:text-[#BFD0B7]">{getSetting('contact_email') || 'isakov@dunasava.com'}</a></div>
              <div className="flex items-start gap-3"><Phone size={15} className="mt-0.5 text-[#9DBC92]" /><div className="text-sm text-white/60">{(getSetting('contact_phone') || '+381 63 8201207').split('/').map((p, i) => <a key={i} href={`tel:${p.trim().replace(/\s/g, '')}`} className="block hover:text-[#BFD0B7]">{p.trim()}</a>)}</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="content-max flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10">
          <p className="text-xs text-white/42">{copyright}</p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-white/42">{t('Gizlilik Politikası', 'Gizlilik Politikası', 'Privacy Policy')}</span>
            <span className="text-xs text-white/20">|</span>
            <span className="text-xs text-white/42">{t('Kullanım Koşulları', 'Kullanım Koşulları', 'Terms of Use')}</span>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/60 transition-colors hover:border-[#9DBC92]/40 hover:text-[#BFD0B7]" aria-label="Top">
              <ChevronUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
