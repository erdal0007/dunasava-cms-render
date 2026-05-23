import { useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import gsap from 'gsap';
import { ArrowRight, ChevronDown, ShieldCheck, Factory, Layers3 } from 'lucide-react';
import WatermarkedImage from '../components/WatermarkedImage';

export default function HeroSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const { data: statList } = trpc.cms.statisticList.useQuery();

  const activeStats = useMemo(
    () => statList?.filter(stat => stat.isActive).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 3) || [],
    [statList]
  );

  const eyebrow = t('GLOBALNA GRAĐEVINSKA REŠENJA', 'KÜRESEL MÜHENDİSLİK ÇÖZÜMLERİ', 'GLOBAL ENGINEERING SOLUTIONS');
  const title = t(
    'Geosintetička infrastruktura za industriju koja ne trpi kompromis',
    'Taviz kabul etmeyen endüstriler için geosentetik altyapı',
    'Geosynthetic infrastructure for industries that do not accept compromise'
  );
  const description = t(
    'DunaSava projelerine malzeme değil, sahada çalışan sistemler sunar. Üretimden uygulamaya kadar kalite, izlenebilirlik ve teslim disiplinini tek hatta toplar.',
    'DunaSava projelerine malzeme değil, sahada çalışan sistemler sunar. Üretimden uygulamaya kadar kalite, izlenebilirlik ve teslim disiplinini tek hatta toplar.',
    'DunaSava delivers systems that perform in the field, not just materials on paper. Quality, traceability and delivery discipline stay aligned from production to application.'
  );
  const heroStats = (activeStats.length > 0 ? activeStats : [
    { value: '30+', suffix: '', labelEn: 'Countries', labelTr: 'Ülke', labelSr: 'Zemalja' },
    { value: '4000', suffix: 'm²', labelEn: 'Production', labelTr: 'Üretim', labelSr: 'Proizvodnja' },
    { value: '6', suffix: '+', labelEn: 'Product lines', labelTr: 'Ürün hattı', labelSr: 'Linije' },
  ]).map((stat: any) => (
    <div key={`${stat.labelEn}-${stat.value}`} className="rounded-[1.1rem] border border-white/10 bg-white/6 p-4">
      <div className="font-display text-2xl text-white">{stat.value}{stat.suffix}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/45">
        {language === 'sr' ? stat.labelSr : language === 'tr' ? stat.labelTr : stat.labelEn}
      </div>
    </div>
  ));

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.25 });
      tl.fromTo('.hero-badge', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' })
        .fromTo('.hero-title', { y: 52, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.1)
        .fromTo('.hero-copy', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.45)
        .fromTo('.hero-actions', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.7)
        .fromTo('.hero-facts', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 }, 0.85)
        .fromTo('.hero-visual', { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.35);
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const scrollTo = (selector: string) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative overflow-hidden min-h-[100dvh] pt-28 pb-16 lg:pt-32 lg:pb-20"
    >
      <div className="absolute inset-0">
        <WatermarkedImage
          src="/assets/images/hero-reservoir-drone.jpg"
          alt=""
          className="w-full h-full"
          imgClassName="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),linear-gradient(115deg,rgba(8,17,29,0.96),rgba(8,17,29,0.72)_54%,rgba(13,36,28,0.5))]" />
      </div>

      <div className="content-max relative z-10 px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 xl:gap-16 items-center min-h-[calc(100vh-9rem)]">
          <div className="text-white max-w-3xl">
            <div className="hero-badge inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-4 py-2 backdrop-blur-md opacity-0">
              <span className="w-2 h-2 rounded-full bg-[#7D9A68]" />
              <span className="text-label text-[10px] tracking-[0.26em] text-white/75">{eyebrow}</span>
            </div>
            <h1
              className="hero-title mt-7 font-display text-white tracking-[-0.04em] leading-[0.95] opacity-0"
              style={{ fontSize: 'clamp(3rem, 7.4vw, 7.6rem)' }}
            >
              {title}
            </h1>
            <p className="hero-copy mt-6 max-w-2xl text-white/78 text-base md:text-lg xl:text-xl leading-8 opacity-0">
              {description}
            </p>

            <div className="hero-actions mt-8 flex flex-wrap items-center gap-4 opacity-0">
              <button
                onClick={() => scrollTo('#products')}
                className="inline-flex items-center gap-2 rounded-full bg-[#4B7C5B] px-6 py-3 text-sm font-medium tracking-[0.08em] uppercase text-white transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#5f8f6e]"
              >
                {t('Ürünlere Bak', 'Ürünleri İncele', 'Explore Products')}
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => scrollTo('#contact')}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium tracking-[0.08em] uppercase text-white/90 backdrop-blur-md transition-colors duration-300 hover:bg-white/12"
              >
                {t('İletişime Geç', 'İletişime Geç', 'Contact Us')}
              </button>
            </div>

            <div className="hero-facts mt-10 grid gap-3 sm:grid-cols-3 opacity-0">
              {[
                { icon: ShieldCheck, label: t('Kalite ve izlenebilirlik', 'Kalite ve izlenebilirlik', 'Quality and traceability') },
                { icon: Factory, label: t('Üretim odaklı yapı', 'Üretim odaklı yapı', 'Production-led structure') },
                { icon: Layers3, label: t('Saha performansı', 'Saha performansı', 'Field performance') },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 backdrop-blur-md">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#B7C8B4]">
                    <Icon size={18} />
                  </span>
                  <span className="text-sm text-white/76 leading-5">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual opacity-0">
            <div className="surface-dark relative overflow-hidden rounded-[2rem] p-4 md:p-5">
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),transparent_32%)]" />
              <div className="relative grid gap-4">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
                  <WatermarkedImage
                    src="/assets/images/production-facility.jpg"
                    alt=""
                    className="h-[330px] w-full md:h-[390px]"
                    imgClassName="h-[330px] w-full object-cover md:h-[390px]"
                    loading="eager"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/7 p-5">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/45">{t('Referans', 'Referans', 'Reference')}</p>
                    <p className="mt-2 font-display text-2xl text-white">Industrial-grade</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">
                      {t(
                        'Kurumsal projeler için temiz, kontrollü ve tekrar edilebilir teslimat.',
                        'Kurumsal projeler için temiz, kontrollü ve tekrar edilebilir teslimat.',
                        'Clean, controlled, repeatable delivery for institutional projects.'
                      )}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-[#0E241B]/70 p-5">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-[#9DBC92]">{t('Odak Alanları', 'Odak Alanları', 'Focus Areas')}</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/76">
                      <li className="flex items-center justify-between border-b border-white/8 pb-2"><span>{t('Atık', 'Atık', 'Waste')}</span><span className="text-[#9DBC92]">01</span></li>
                      <li className="flex items-center justify-between border-b border-white/8 pb-2"><span>{t('Madencilik', 'Madencilik', 'Mining')}</span><span className="text-[#9DBC92]">02</span></li>
                      <li className="flex items-center justify-between"><span>{t('Su', 'Su', 'Water')}</span><span className="text-[#9DBC92]">03</span></li>
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">{heroStats}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={() => scrollTo('#about')}
          className="group flex flex-col items-center gap-2 rounded-full border border-white/12 bg-white/6 px-5 py-3 text-white/75 backdrop-blur-md transition-colors hover:bg-white/12"
        >
          <span className="text-label text-[10px] text-white/55">{t('Aşağı İn', 'Aşağı İn', 'Scroll')}</span>
          <ChevronDown size={18} className="transition-transform duration-300 group-hover:translate-y-1" />
        </button>
      </div>
    </section>
  );
}
