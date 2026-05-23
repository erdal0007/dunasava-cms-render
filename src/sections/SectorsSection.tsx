import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import { resolveCmsAssetUrl } from '@/lib/assetUrl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import WatermarkedImage from '../components/WatermarkedImage';

gsap.registerPlugin(ScrollTrigger);

export default function SectorsSection() {
  const { language, t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const { data: sectorList } = trpc.cms.sectorList.useQuery();

  const activeSectors = sectorList?.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder) || [];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.sectors-heading', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' } });
      gsap.fromTo('.sector-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, scrollTrigger: { trigger: '.sectors-grid', start: 'top 80%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [activeSectors]);

  const getT = (s: typeof activeSectors extends (infer U)[] ? NonNullable<U> : never, field: 'title' | 'description') => {
    if (language === 'sr') return s[`${field}Sr`] || s[`${field}En`];
    if (language === 'tr') return s[`${field}Tr`] || s[`${field}En`];
    return s[`${field}En`];
  };

  const title = t('Sektörün ihtiyacına göre yapılandırılmış çözümler', 'Sektörün ihtiyacına göre yapılandırılmış çözümler', 'Solutions structured around sector needs');
  const eyebrow = t('SEKTÖRLER', 'SEKTÖRLER', 'SECTORS');

  return (
    <section ref={sectionRef} id="sectors" className="section-shell section-padding">
      <div className="content-max">
        <div className="sectors-heading mb-10 md:mb-14 max-w-3xl opacity-0">
          <span className="section-kicker">{eyebrow}</span>
          <h2 className="section-title mt-4" style={{ fontSize: 'clamp(2.1rem, 4vw, 4rem)' }}>{title}</h2>
        </div>

        <div className="sectors-grid space-y-5 md:space-y-6">
          {activeSectors.map((sector, i) => (
            <article key={sector.id} className={`sector-card surface rounded-[2rem] overflow-hidden opacity-0 grid lg:grid-cols-[0.95fr_1.05fr] ${i % 2 === 1 ? 'lg:[&>div:first-child]:order-2' : ''}`}>
              <div className="relative min-h-[280px]">
                {sector.imageUrl ? (
                  <WatermarkedImage
                    src={resolveCmsAssetUrl(sector.imageUrl)}
                    alt=""
                    className="h-full w-full min-h-[280px]"
                    imgClassName="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[280px] items-center justify-center bg-[#08111d] text-white/50">
                    {t('Görsel yok', 'Görsel yok', 'No image')}
                  </div>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,29,0.05),rgba(8,17,29,0.72))]" />
                <span className="absolute bottom-4 left-4 font-display text-[clamp(4rem,10vw,8rem)] leading-none text-white/15 select-none">
                  {sector.number}
                </span>
              </div>

              <div className="p-7 md:p-10 flex flex-col justify-between">
                <div>
                  <div className="text-label text-[#7D9A68]">{sector.number}</div>
                  <h3 className="mt-4 font-display text-3xl md:text-4xl text-[#101010]">
                    {getT(sector, 'title')}
                  </h3>
                  <p className="mt-5 max-w-2xl text-sm md:text-base leading-7 text-[#625d56]">
                    {getT(sector, 'description')}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#6b645e]">
                    {t('Kurumsal odak', 'Kurumsal odak', 'Corporate focus')}
                  </span>
                  <button className="inline-flex items-center gap-2 rounded-full bg-[#0d241c] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-transform hover:-translate-y-0.5">
                    {t('Daha fazla', 'Daha fazla', 'Learn more')}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
