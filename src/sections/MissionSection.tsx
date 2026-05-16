import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function MissionSection() {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const { data: missionSection } = trpc.cms.sectionByType.useQuery({ type: 'mission' });
  const section = missionSection?.[0];

  const eyebrow = section ? (language === 'sr' ? section.eyebrowSr : language === 'tr' ? section.eyebrowTr : section.eyebrowEn) || '' : language === 'sr' ? 'NAŠA MISIJA' : language === 'tr' ? 'MİSYONUMUZ' : 'OUR MISSION';
  const title = section ? (language === 'sr' ? section.titleSr : language === 'tr' ? section.titleTr : section.titleEn) || '' : language === 'sr' ? 'Kvalitet i Pouzdanost u Svakom Projektu' : language === 'tr' ? 'Her Projede Kalite ve Güvenilirlik' : 'Quality and Reliability in Every Project';
  const desc = section ? (language === 'sr' ? section.contentSr : language === 'tr' ? section.contentTr : section.contentEn) || '' : language === 'sr' ? 'Naša misija je pružanje visokokvalitetnih geosintetičkih rešenja.' : language === 'tr' ? 'Misyonumuz, her proje için yüksek kaliteli geosentetik çözümler sunmaktır.' : 'Our mission is to provide high-quality geosynthetic solutions for every project.';

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.mission-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.mission-title', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.mission-line', { scaleX: 0 }, { scaleX: 1, duration: 0.6, delay: 0.4, stagger: 0.1, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.mission-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [section]);

  return (
    <section ref={sectionRef} className="bg-[#0F2A1D] section-padding">
      <div className="content-max text-center max-w-3xl mx-auto">
        <span className="mission-eyebrow text-label text-[#6B8F5E] block mb-6 opacity-0">{eyebrow}</span>
        <h2 className="mission-title font-display text-white mb-8" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.15 }}>{title}</h2>
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="mission-line w-10 h-[1px] bg-[#4A7C59]/30 origin-left" />
          <div className="w-2 h-2 rotate-45 border border-[#4A7C59]/40" />
          <div className="mission-line w-10 h-[1px] bg-[#4A7C59]/30 origin-right" />
        </div>
        <p className="mission-desc text-[#E8E4DF]/80 text-base leading-relaxed opacity-0">{desc}</p>
      </div>
    </section>
  );
}
