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
    gsap.to(obj, { val: numVal, duration: 1.5, ease: 'power2.out', snap: { val: 1 }, onUpdate: () => setCount(Math.round(obj.val)) });
  }, [triggered, numVal]);

  return <span className="tabular-nums">{count}{suffix}</span>;
}

export default function StatisticsSection() {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [triggered, setTriggered] = useState(false);
  const { data: statList } = trpc.cms.statisticList.useQuery();

  const activeStats = statList?.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: sectionRef.current, start: 'top 60%', onEnter: () => setTriggered(true), once: true });
      gsap.fromTo('.stat-item', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [activeStats]);

  const getLabel = (s: any) => language === 'sr' ? s.labelSr : language === 'tr' ? s.labelTr : s.labelEn;

  return (
    <section ref={sectionRef} id="statistics" className="bg-[#0F2A1D] section-padding">
      <div className="content-max">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {activeStats?.map((stat, i) => (
            <div key={stat.id} className="stat-item text-center opacity-0">
              <div className="font-body font-bold text-white mb-3" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} triggered={triggered} />
              </div>
              <div className="stat-line w-10 h-[1px] bg-[#4A7C59]/30 mx-auto mb-3 origin-center" />
              <div className="text-label text-[#6B8F5E] text-[10px]">{getLabel(stat)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
