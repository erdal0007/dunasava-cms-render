import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function AnimatedCounter({ value, suffix, triggered }: { value: string; suffix: string; triggered: boolean }) {
  const [count, setCount] = useState(0);
  const numVal = parseInt(value) || 0;

  useEffect(() => {
    if (!triggered) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: numVal,
      duration: 1.3,
      ease: 'power2.out',
      snap: { val: 1 },
      onUpdate: () => setCount(Math.round(obj.val)),
    });
  }, [triggered, numVal]);

  return <span className="tabular-nums">{count}{suffix}</span>;
}

export default function StatisticsSection() {
  const { language, t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [triggered, setTriggered] = useState(false);
  const { data: statList } = trpc.cms.statisticList.useQuery();

  const activeStats = statList?.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder) || [];

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: sectionRef.current, start: 'top 65%', onEnter: () => setTriggered(true), once: true });
      gsap.fromTo('.stat-item', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 68%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [activeStats]);

  const getLabel = (s: any) => language === 'sr' ? s.labelSr : language === 'tr' ? s.labelTr : s.labelEn;

  return (
    <section ref={sectionRef} id="statistics" className="section-shell section-padding">
      <div className="content-max">
        <div className="surface-dark rounded-[2rem] px-6 py-10 md:px-10 md:py-12">
          <div className="mb-8 md:mb-10 max-w-2xl">
            <span className="section-kicker text-[#9DBC92]">{t('GÖSTERGELER', 'GÖSTERGELER', 'METRICS')}</span>
            <h2 className="mt-4 font-display text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 1.05 }}>
              {t('Operasyonun sayısal özeti', 'Operasyonun sayısal özeti', 'A numeric view of operations')}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {activeStats.map((stat) => (
              <div key={stat.id} className="stat-item rounded-[1.5rem] border border-white/10 bg-white/6 p-5 text-center opacity-0">
                <div className="font-display text-[clamp(2rem,4vw,3.7rem)] text-white leading-none">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} triggered={triggered} />
                </div>
                <div className="mt-3 h-px w-12 bg-[#9DBC92]/30 mx-auto" />
                <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-white/55">
                  {getLabel(stat)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
