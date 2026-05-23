import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router';
import { buildCmsSectionNavItems, getDefaultCmsSectionRows } from '@contracts/cms';

export default function Navigation() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const { data: sectionList } = trpc.cms.sectionList.useQuery();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const sectionSource = useMemo(
    () => (sectionList?.length ? sectionList : getDefaultCmsSectionRows()),
    [sectionList]
  );
  const navItems = useMemo(
    () => [
      { href: '#hero', label: t('Ana Sayfa', 'Ana Sayfa', 'Home') },
      ...buildCmsSectionNavItems(sectionSource, language),
    ],
    [sectionSource, language, t]
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sectionIds = useMemo(() => navItems.map((item) => item.href.slice(1)), [navItems]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      }),
      { threshold: 0.35 }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sectionIds]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace(/^#/, '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const langOrder: Array<'sr' | 'tr' | 'en'> = ['sr', 'tr', 'en'];
  const nextLang = () => {
    const idx = langOrder.indexOf(language);
    setLanguage(langOrder[(idx + 1) % 3]);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-[#08111d]/88 backdrop-blur-2xl border-b border-white/8 shadow-[0_12px_40px_rgba(8,17,29,0.16)]' : 'bg-transparent'
        }`}
      >
        <div className="content-max flex items-center justify-between h-20 px-6 lg:px-10">
          <button onClick={() => handleNavClick('#hero')} className="group flex items-center gap-3 text-left">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/8 text-[#9DBC92] text-xs font-semibold tracking-[0.18em]">
              DS
            </span>
            <span className="flex flex-col">
              <span className="text-label text-[10px] tracking-[0.28em] text-white/85">DUNASAVA</span>
              <span className="text-[10px] tracking-[0.18em] text-white/45 uppercase">{t('Mühendislik ürünleri', 'Mühendislik ürünleri', 'Engineering products')}</span>
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-7 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`group relative text-nav transition-colors ${
                  activeSection === item.href.slice(1) ? 'text-white' : 'text-white/65 hover:text-white'
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-2 left-0 h-[1px] bg-[#9DBC92] transition-all duration-300 ${
                    activeSection === item.href.slice(1) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={nextLang}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 text-[10px] text-white/80 transition-colors hover:border-[#9DBC92]/50 hover:text-[#9DBC92]"
            >
              {language.toUpperCase()}
            </button>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="hidden lg:inline-flex items-center rounded-full border border-[#9DBC92]/25 bg-[#9DBC92]/10 px-4 py-2 text-[10px] font-semibold tracking-[0.2em] text-[#BFD0B7] transition-colors hover:bg-[#9DBC92]/18"
              >
                ADMIN
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#08111d]/96 backdrop-blur-2xl px-6 pt-24 lg:hidden">
          <div className="mx-auto flex max-w-xl flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left text-2xl font-display text-white transition-colors hover:bg-white/10"
              >
                {item.label}
              </button>
            ))}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-2xl border border-[#9DBC92]/25 bg-[#9DBC92]/10 px-5 py-4 text-center text-sm font-semibold tracking-[0.18em] text-[#D7E3D3]"
              >
                ADMIN PANEL
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
