import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import { resolveCmsAssetUrl } from '@/lib/assetUrl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Factory, ClipboardCheck, Truck, ArrowRight } from 'lucide-react';
import WatermarkedImage from '../components/WatermarkedImage';

gsap.registerPlugin(ScrollTrigger);

export default function ProductionSection() {
  const { language, t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const { data: productionSection } = trpc.cms.sectionByType.useQuery({ type: 'production' });

  const section = productionSection?.[0];
  const eyebrow = section ? (language === 'sr' ? section.eyebrowSr : language === 'tr' ? section.eyebrowTr : section.eyebrowEn) || '' : t('PRODUCTION', 'ÜRETİM', 'PRODUCTION');
  const title = section ? (language === 'sr' ? section.titleSr : language === 'tr' ? section.titleTr : section.titleEn) || '' : t('Kontrollü üretim, ölçülebilir sonuç', 'Kontrollü üretim, ölçülebilir sonuç', 'Controlled production, measurable output');
  const desc = section ? (language === 'sr' ? section.contentSr : language === 'tr' ? section.contentTr : section.contentEn) || '' : t(
    'Her üretim hattı kalite, hız ve izlenebilirlik dengesine göre kurgulanır. Bu yapı, sahadaki performansı öngörülebilir hale getirir.',
    'Her üretim hattı kalite, hız ve izlenebilirlik dengesine göre kurgulanır. Bu yapı, sahadaki performansı öngörülebilir hale getirir.',
    'Every production line is designed around quality, speed and traceability. That keeps site performance predictable.'
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.production-copy', { x: -32, opacity: 0 }, { x: 0, opacity: 1, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' } });
      gsap.fromTo('.production-card', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [section]);

  const steps = [
    { icon: Factory, title: t('Üretim hattı', 'Üretim hattı', 'Production line'), text: t('Kontrollü proses ve sabit kalite.', 'Kontrollü proses ve sabit kalite.', 'Controlled process and steady quality.') },
    { icon: ClipboardCheck, title: t('Kalite kontrol', 'Kalite kontrol', 'Quality control'), text: t('Her parti için kayıt ve izleme.', 'Her parti için kayıt ve izleme.', 'Records and inspection for every batch.') },
    { icon: Truck, title: t('Lojistik planı', 'Lojistik planı', 'Logistics plan'), text: t('Zamanında sevk ve proje ritmi.', 'Zamanında sevk ve proje ritmi.', 'On-time dispatch matched to project rhythm.') },
  ];

  return (
    <section ref={sectionRef} id="production" className="section-shell section-padding">
      <div className="content-max">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-stretch">
          <div className="production-copy surface-dark rounded-[2rem] p-8 md:p-10 text-white">
            <span className="section-kicker text-[#9DBC92]">{eyebrow}</span>
            <h2 className="mt-5 font-display text-white tracking-[-0.04em]" style={{ fontSize: 'clamp(2.2rem, 4.2vw, 4.2rem)', lineHeight: 1.02 }}>
              {title}
            </h2>
            <p className="mt-6 text-white/74 text-base md:text-lg leading-8">
              {desc}
            </p>
            <button
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/7 px-5 py-3 text-xs font-semibold tracking-[0.22em] uppercase text-white/88 transition-colors hover:bg-white/12"
            >
              {t('Üretim hakkında konuş', 'Üretim hakkında konuş', 'Talk production')}
              <ArrowRight size={16} />
            </button>

            <div className="mt-10 grid gap-3">
              {steps.map(({ icon: Icon, title: cardTitle, text }) => (
                <div key={cardTitle} className="production-card flex items-start gap-4 rounded-2xl border border-white/10 bg-white/6 p-4 opacity-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#9DBC92]">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold tracking-[0.08em] uppercase text-white">{cardTitle}</div>
                    <div className="mt-1 text-sm leading-6 text-white/70">{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="production-card opacity-0 grid gap-4 rounded-[2rem] border border-black/8 bg-white/75 p-4 md:p-5">
            <div className="overflow-hidden rounded-[1.5rem]">
              <WatermarkedImage
                src={resolveCmsAssetUrl(section?.imageUrl) || '/assets/images/production-geomembrane-roll.jpg'}
                alt=""
                className="h-[300px] w-full md:h-[420px]"
                imgClassName="h-[300px] w-full object-cover md:h-[420px]"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-black/8 bg-white p-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a746c]">{t('Hedef', 'Hedef', 'Goal')}</p>
                <p className="mt-2 font-display text-2xl text-[#101010]">{t('Öngörülebilir teslimat', 'Öngörülebilir teslimat', 'Predictable delivery')}</p>
              </div>
              <div className="rounded-2xl border border-black/8 bg-white p-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a746c]">{t('Kontrol', 'Kontrol', 'Control')}</p>
                <p className="mt-2 font-display text-2xl text-[#101010]">{t('Parti bazlı izleme', 'Parti bazlı izleme', 'Batch-level tracking')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
