import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router';

const navKeys = [
  { key: 'home', href: '#hero' },
  { key: 'about', href: '#about' },
  { key: 'products', href: '#products' },
  { key: 'sectors', href: '#sectors' },
  { key: 'production', href: '#production' },
  { key: 'contact', href: '#contact' },
] as const;

export default function Navigation() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const { data: translations } = trpc.cms.translationList.useQuery();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const getT = (key: string) => {
    const tr = translations?.find(tr => tr.key === key);
    return t(tr?.sr, tr?.tr, tr?.en) || key;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id); }),
      { threshold: 0.3 }
    );
    navKeys.forEach(item => { const el = document.querySelector(item.href); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const langOrder: Array<'sr' | 'tr' | 'en'> = ['sr', 'tr', 'en'];
  const nextLang = () => {
    const idx = langOrder.indexOf(language);
    setLanguage(langOrder[(idx + 1) % 3]);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0F2A1D]/95 backdrop-blur-xl shadow-lg' : 'bg-transparent'}`}>
        <div className="content-max flex items-center justify-between h-20 px-6 lg:px-10">
          <button onClick={() => handleNavClick('#hero')} className="text-white text-label tracking-[0.15em] text-sm hover:text-[#4A7C59] transition-colors">DUNASAVA</button>
          <div className="hidden lg:flex items-center gap-8">
            {navKeys.map((item) => (
              <button key={item.key} onClick={() => handleNavClick(item.href)}
                className={`text-nav transition-colors relative group ${activeSection === item.href.slice(1) ? 'text-[#4A7C59]' : 'text-white/80 hover:text-[#4A7C59]'}`}>
                {getT(`nav.${item.key}`)}
                <span className={`absolute -bottom-1 left-0 h-[1px] bg-[#4A7C59] transition-all duration-300 ${activeSection === item.href.slice(1) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={nextLang} className="text-nav text-white/80 hover:text-[#4A7C59] transition-colors text-[10px] w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
              {language.toUpperCase()}
            </button>
            {user?.role === 'admin' && (
              <Link to="/admin" className="hidden lg:block text-nav text-[#4A7C59] hover:text-[#6B8F5E] transition-colors text-[10px]">ADMIN</Link>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-white p-2" aria-label="Menu">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#0A1628] flex flex-col items-center justify-center gap-8 pt-20">
          {navKeys.map((item) => (
            <button key={item.key} onClick={() => handleNavClick(item.href)} className="text-white font-display text-3xl hover:text-[#4A7C59] transition-colors">
              {getT(`nav.${item.key}`)}
            </button>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-[#4A7C59] font-display text-2xl hover:text-[#6B8F5E]">Admin Panel</Link>
          )}
        </div>
      )}
    </>
  );
}
