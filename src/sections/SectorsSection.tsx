import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import { resolveCmsAssetUrl } from '@/lib/assetUrl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SectorsSection() {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const { data: sectorList } = trpc.cms.sectorList.useQuery();

  const activeSectors = sectorList?.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.sectors-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.sectors-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      const cards = gsap.utils.toArray<HTMLElement>('.sector-card');
      cards.forEach((card, i) => {
        gsap.fromTo(card, { x: i % 2 === 0 ? -40 : 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 85%' } });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [activeSectors]);

  const getT = (s: typeof activeSectors extends (infer U)[] ? NonNullable<U> : never, field: 'title' | 'description') => {
    if (language === 'sr') return s[`${field}Sr`] || s[`${field}En`];
    if (language === 'tr') return s[`${field}Tr`] || s[`${field}En`];
    return s[`${field}En`];
  };

  const title = language === 'sr' ? 'Rešenja za Svaku Industriju' : language === 'tr' ? 'Her Endüstri için Çözümler' : 'Solutions for Every Industry';
  const eyebrow = language === 'sr' ? 'NAŠI SEKTORI' : language === 'tr' ? 'SEKTÖRLERİMİZ' : 'OUR SECTORS';

  return (
    <section ref={sectionRef} id="sectors" className="bg-[#0A1628] section-padding">
      <div className="content-max">
        <div className="text-center mb-16">
          <span className="sectors-eyebrow text-label text-[#4A7C59] block mb-4 opacity-0">{eyebrow}</span>
          <h2 className="sectors-title font-display text-white opacity-0" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.15 }}>{title}</h2>
        </div>
        <div className="space-y-16 lg:space-y-24">
          {activeSectors?.map((sector, i) => (
            <div key={sector.id} className={`sector-card grid lg:grid-cols-2 gap-8 lg:gap-16 items-center opacity-0`}>
              <div className={`relative overflow-hidden rounded-lg aspect-video group ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                {sector.imageUrl && <img src={resolveCmsAssetUrl(sector.imageUrl)} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/60 via-transparent to-transparent" />
                <span className="absolute top-4 right-4 font-display text-6xl md:text-8xl text-[#4A7C59]/15 select-none pointer-events-none">{sector.number}</span>
              </div>
              <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <span className="text-label text-[#4A7C59]/60 text-xs mb-2 block">{sector.number}</span>
                <h3 className="font-display text-white mb-5" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', lineHeight: 1.15 }}>{getT(sector, 'title')}</h3>
                <p className="text-sm text-[#E8E4DF]/60 leading-relaxed mb-6">{getT(sector, 'description')}</p>
                <button className="text-cta text-[#4A7C59] border border-[#4A7C59]/40 px-6 py-2.5 hover:bg-[#4A7C59] hover:text-white transition-all duration-300 text-xs">
                  {language === 'sr' ? 'Saznaj Više' : language === 'tr' ? 'Daha Fazla' : 'Learn More'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
