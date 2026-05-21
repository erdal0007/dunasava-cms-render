import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SmartImage from '../components/SmartImage';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const { language, t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const { data: aboutSection } = trpc.cms.sectionByType.useQuery({ type: 'about' });
  const { data: stats } = trpc.cms.statisticList.useQuery();

  const section = aboutSection?.[0];

  const eyebrow = section ? (language === 'sr' ? section.eyebrowSr : language === 'tr' ? section.eyebrowTr : section.eyebrowEn) || '' : t('O NAMA', 'HAKKIMIZDA', 'ABOUT US');
  const title = section ? (language === 'sr' ? section.titleSr : language === 'tr' ? section.titleTr : section.titleEn) || '' : t('Inženjerska Rešenja za Svaki Teren', 'Her Arazi için Mühendislik Çözümleri', 'Engineering Solutions for Every Terrain');
  const desc = section ? (language === 'sr' ? section.contentSr : language === 'tr' ? section.contentTr : section.contentEn) || '' : t('DunaSava je jedan od vodećih proizvođača geomembrana i geosintetičkih proizvoda. Kompanija izvozi u više od 30 zemalja.', 'DunaSava, geomembran ve geosentetik ürünlerin önde gelen üreticilerinden biridir.', 'DunaSava is one of the leading manufacturers of geomembranes and geosynthetic products, exporting to more than 30 countries.');

  const topStats = stats?.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 3);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.about-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.about-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.about-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.about-image', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.about-stat', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.15, delay: 0.5, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [section]);

  const getStatLabel = (s: any) => language === 'sr' ? s.labelSr : language === 'tr' ? s.labelTr : s.labelEn;

  return (
    <section ref={sectionRef} id="about" className="bg-white section-padding">
      <div className="content-max">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="about-image relative overflow-hidden rounded opacity-0 aspect-[4/3] lg:aspect-[5/4]">
            <SmartImage
              src={section?.imageUrl || '/assets/images/about-mining-installation.jpg'}
              alt=""
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover scale-110"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="lg:pl-8">
            <span className="about-eyebrow text-label text-[#4A7C59] block mb-4 opacity-0">{eyebrow}</span>
            <h2 className="about-title font-display text-[#1A1A1A] mb-6 opacity-0" style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', lineHeight: 1.1 }}>{title}</h2>
            <p className="about-desc text-[#8A8680] text-base leading-relaxed mb-8 max-w-lg opacity-0">{desc}</p>
            <div className="flex flex-wrap gap-8 mb-8">
              {topStats?.map((stat, i) => (
                <div key={i} className="about-stat opacity-0">
                  <div className="font-display text-2xl md:text-3xl text-[#1A1A1A] mb-1">{stat.value}{stat.suffix}</div>
                  <div className="text-label text-[#8A8680] text-[10px]">{getStatLabel(stat)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
