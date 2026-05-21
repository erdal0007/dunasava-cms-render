import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import { Linkedin, Instagram, Facebook, MapPin, Mail, Phone, ChevronUp } from 'lucide-react';

export default function Footer() {
  const { language } = useLanguage();
  const { data: settings } = trpc.cms.settingList.useQuery();
  const { data: products } = trpc.cms.productList.useQuery();

  const getSetting = (key: string) => settings?.find(s => s.key === key)?.value || '';
  const tagline = language === 'sr' ? 'Snaga za Konstrukcije' : language === 'tr' ? 'Yapılar için Güç' : 'Strength for Constructions';
  const copyright = language === 'sr' ? '© 2025 DunaSava. Sva prava zadržana.' : language === 'tr' ? '© 2025 DunaSava. Tüm hakları saklıdır.' : '© 2025 DunaSava. All rights reserved.';

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { label: language === 'sr' ? 'Početna' : language === 'tr' ? 'Ana Sayfa' : 'Home', href: '#hero' },
    { label: language === 'sr' ? 'O Nama' : language === 'tr' ? 'Hakkımızda' : 'About', href: '#about' },
    { label: language === 'sr' ? 'Proizvodi' : language === 'tr' ? 'Ürünler' : 'Products', href: '#products' },
    { label: language === 'sr' ? 'Sektori' : language === 'tr' ? 'Sektörler' : 'Sectors', href: '#sectors' },
    { label: language === 'sr' ? 'Proizvodnja' : language === 'tr' ? 'Üretim' : 'Production', href: '#production' },
    { label: language === 'sr' ? 'Kontakt' : language === 'tr' ? 'İletişim' : 'Contact', href: '#contact' },
  ];

  return (
    <footer className="relative overflow-hidden">
      <div className="relative bg-[#0A1628] py-20">
        <div className="absolute inset-0 opacity-40">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 18% 22%, rgba(74,124,89,0.18), transparent 22%), radial-gradient(circle at 78% 28%, rgba(255,255,255,0.08), transparent 18%), radial-gradient(circle at 52% 68%, rgba(74,124,89,0.12), transparent 24%), linear-gradient(180deg, rgba(7,15,26,0.5), rgba(10,22,40,0.9))",
            }}
          />
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628] via-transparent to-[#0A1628]" />
        </div>
        <div className="content-max relative z-10 text-center px-6">
          <span className="text-label text-[#4A7C59] text-xs tracking-[0.15em] block mb-4">
            {language === 'sr' ? 'GLOBALNA PRISUTNOST' : language === 'tr' ? 'KÜRESEL VARLIK' : 'GLOBAL PRESENCE'}
          </span>
          <h3 className="font-display text-white mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>30+ {language === 'sr' ? 'Zemalja' : language === 'tr' ? 'Ülke' : 'Countries'}</h3>
          <p className="text-[#E8E4DF]/60 text-sm max-w-lg mx-auto mb-8">
            {language === 'sr' ? 'DunaSava izvozi u više od 30 zemalja širom sveta.' : language === 'tr' ? 'DunaSava, dünya çapında 30\'dan fazla ülkeye ihraç etmektedir.' : 'DunaSava exports to more than 30 countries worldwide.'}
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[{ v: '50+', l: language === 'sr' ? 'Godina' : language === 'tr' ? 'Yıl' : 'Years' }, { v: '30+', l: language === 'sr' ? 'Zemalja' : language === 'tr' ? 'Ülke' : 'Countries' }, { v: '4000m²', l: language === 'sr' ? 'Proizvodnja' : language === 'tr' ? 'Üretim' : 'Production' }, { v: '6', l: language === 'sr' ? 'Proizvoda' : language === 'tr' ? 'Ürün' : 'Products' }].map((s, i) => (
              <div key={i} className="text-center"><div className="font-display text-2xl md:text-3xl text-white mb-1">{s.v}</div><div className="text-label text-[#4A7C59]/70 text-[9px]">{s.l}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative bg-[#060F1A] border-t border-[#4A7C59]/10">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-display text-[#4A7C59]/[0.03] whitespace-nowrap" style={{ fontSize: '18vw' }}>DUNASAVA</span>
        </div>
        <div className="content-max py-16 px-6 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <div>
              <span className="text-label text-white tracking-[0.15em] text-sm block mb-3">DUNASAVA</span>
              <p className="text-sm text-[#8A8680] mb-4">{tagline}</p>
              <div className="flex items-center gap-3">{[Linkedin, Instagram, Facebook].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-full border border-[#E8E4DF]/15 flex items-center justify-center text-[#E8E4DF]/50 hover:text-[#4A7C59] hover:border-[#4A7C59]/40 transition-all duration-300" aria-label="Social"><Icon size={14} /></button>
              ))}</div>
            </div>
            <div>
              <span className="text-label text-[#4A7C59] text-[10px] tracking-[0.12em] block mb-5">{language === 'sr' ? 'NAVIGACIJA' : language === 'tr' ? 'NAVİGASYON' : 'NAVIGATION'}</span>
              <ul className="space-y-3">{navItems.map((item) => (
                <li key={item.href}><button onClick={() => handleNavClick(item.href)} className="text-nav text-[#E8E4DF]/60 hover:text-[#4A7C59] transition-colors duration-300 text-xs flex items-center gap-2 group"><span className="w-0 group-hover:w-3 h-[1px] bg-[#4A7C59] transition-all duration-300" />{item.label}</button></li>
              ))}</ul>
            </div>
            <div>
              <span className="text-label text-[#4A7C59] text-[10px] tracking-[0.12em] block mb-5">{language === 'sr' ? 'PROIZVODI' : language === 'tr' ? 'ÜRÜNLER' : 'PRODUCTS'}</span>
              <ul className="space-y-3">{products?.filter(p => p.isActive).slice(0, 6).map(p => (
                <li key={p.id}><span className="text-nav text-[#8A8680] hover:text-[#4A7C59] transition-colors duration-300 text-xs cursor-default flex items-center gap-2 group"><span className="w-0 group-hover:w-3 h-[1px] bg-[#4A7C59] transition-all duration-300" />{p.titleEn}</span></li>
              )) || <li className="text-[#8A8680] text-xs">-</li>}</ul>
            </div>
            <div>
              <span className="text-label text-[#4A7C59] text-[10px] tracking-[0.12em] block mb-5">{language === 'sr' ? 'KONTAKT' : language === 'tr' ? 'İLETİŞİM' : 'CONTACT'}</span>
              <div className="space-y-4">
                <div className="flex items-start gap-3"><MapPin size={14} className="text-[#4A7C59] mt-0.5 flex-shrink-0" /><span className="text-xs text-[#8A8680] leading-relaxed">{getSetting('contact_address') || 'Luke Celovica Trabinjca 18, BW Kings Park, Office 319, Beograd, Srbija'}</span></div>
                <div className="flex items-center gap-3"><Mail size={14} className="text-[#4A7C59] flex-shrink-0" /><a href={`mailto:${getSetting('contact_email') || 'isakov@dunasava.com'}`} className="text-xs text-[#4A7C59] hover:underline">{getSetting('contact_email') || 'isakov@dunasava.com'}</a></div>
                <div className="flex items-start gap-3"><Phone size={14} className="text-[#4A7C59] mt-0.5 flex-shrink-0" /><div className="text-xs text-[#8A8680]">{(getSetting('contact_phone') || '+381 63 8201207').split('/').map((p, i) => <a key={i} href={`tel:${p.trim().replace(/\s/g, '')}`} className="block hover:text-[#4A7C59] transition-colors">{p.trim()}</a>)}</div></div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#E8E4DF]/5">
          <div className="content-max py-6 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#8A8680]/50">{copyright}</p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-[#8A8680]/50 hover:text-[#4A7C59] cursor-pointer transition-colors">{language === 'sr' ? 'Politika Privatnosti' : language === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}</span>
              <span className="text-xs text-[#8A8680]/40">|</span>
              <span className="text-xs text-[#8A8680]/50 hover:text-[#4A7C59] cursor-pointer transition-colors">{language === 'sr' ? 'Uslovi Korišćenja' : language === 'tr' ? 'Kullanım Koşulları' : 'Terms of Use'}</span>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-8 h-8 rounded-full border border-[#E8E4DF]/15 flex items-center justify-center text-[#8A8680]/50 hover:text-[#4A7C59] hover:border-[#4A7C59]/40 transition-all duration-300" aria-label="Top"><ChevronUp size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
