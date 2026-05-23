import { useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import { resolveCmsAssetUrl } from '@/lib/assetUrl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle2, ShieldCheck, BarChart3 } from 'lucide-react';
import WatermarkedImage from '../components/WatermarkedImage';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const { language, t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const { data: aboutSection } = trpc.cms.sectionByType.useQuery({ type: 'about' });
  const { data: stats } = trpc.cms.statisticList.useQuery();

  const section = aboutSection?.[0];
  const activeStats = useMemo(
    () => stats?.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 3) || [],
    [stats]
  );

  const eyebrow = section ? (language === 'sr' ? section.eyebrowSr : language === 'tr' ? section.eyebrowTr : section.eyebrowEn) || '' : t('O NAMA', 'HAKKIMIZDA', 'ABOUT US');
  const title = section ? (language === 'sr' ? section.titleSr : language === 'tr' ? section.titleTr : section.titleEn) || '' : t('Mühendislik disipliniyle kurulmuş bir üretim markası', 'Mühendislik disipliniyle kurulmuş bir üretim markası', 'A production brand built with engineering discipline');
  const desc = section ? (language === 'sr' ? section.contentSr : language === 'tr' ? section.contentTr : section.contentEn) || '' : t(
    'DunaSava, geosentetik çözümleri yalnızca satmaz; üretim kalitesinden saha performansına kadar yönetir. Kurulum, izlenebilirlik ve tutarlılık temel standartlardır.',
    'DunaSava, geosentetik çözümleri yalnızca satmaz; üretim kalitesinden saha performansına kadar yönetir. Kurulum, izlenebilirlik ve tutarlılık temel standartlardır.',
    'DunaSava does not only sell geosynthetic solutions; it manages them from production quality to field performance. Installation, traceability and consistency are the baseline.'
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.about-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' } });
      gsap.fromTo('.about-panel', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
      gsap.fromTo('.about-feature', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [section]);

  const getStatLabel = (s: any) => language === 'sr' ? s.labelSr : language === 'tr' ? s.labelTr : s.labelEn;

  return (
    <section ref={sectionRef} id="about" className="section-shell section-padding">
      <div className="content-max">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-center">
          <div className="about-card surface rounded-[2rem] overflow-hidden opacity-0">
            <div className="relative">
              <WatermarkedImage
                src={resolveCmsAssetUrl(section?.imageUrl) || '/assets/images/about-mining-installation.jpg'}
                alt=""
                className="h-[420px] w-full md:h-[560px]"
                imgClassName="h-[420px] w-full object-cover md:h-[560px]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,17,29,0.62))]" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/12 bg-[#08111d]/55 p-4 text-white backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-[#9DBC92]" />
                  <span className="text-[10px] uppercase tracking-[0.24em] text-white/55">{t('Saha güvenilirliği', 'Saha güvenilirliği', 'Field reliability')}</span>
                </div>
                <p className="mt-2 text-sm text-white/78 leading-6">
                  {t(
                    'Büyük ölçekli altyapılarda minimum risk, maksimum süreklilik.',
                    'Büyük ölçekli altyapılarda minimum risk, maksimum süreklilik.',
                    'Minimum risk, maximum continuity for large-scale infrastructure.'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="about-panel opacity-0">
            <span className="section-kicker">{eyebrow}</span>
            <h2 className="section-title mt-5 max-w-2xl" style={{ fontSize: 'clamp(2.3rem, 4.4vw, 4.4rem)' }}>
              {title}
            </h2>
            <p className="section-copy mt-6 max-w-2xl text-base md:text-lg">
              {desc}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: CheckCircle2, title: t('Sertifikalı süreç', 'Sertifikalı süreç', 'Certified process'), text: t('Tekrarlanabilir kalite kontrol.', 'Tekrarlanabilir kalite kontrol.', 'Repeatable quality control.') },
                { icon: BarChart3, title: t('Veri odaklı yönetim', 'Veri odaklı yönetim', 'Data-led management'), text: t('İzlenebilir üretim ve teslimat.', 'İzlenebilir üretim ve teslimat.', 'Traceable production and delivery.') },
                { icon: ShieldCheck, title: t('Uzun ömür', 'Uzun ömür', 'Long life'), text: t('Sahada kalıcı performans.', 'Sahada kalıcı performans.', 'Persistent field performance.') },
              ].map(({ icon: Icon, title: cardTitle, text }) => (
                <div key={cardTitle} className="about-feature rounded-2xl border border-black/8 bg-white/72 p-5 opacity-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0D241C]/6 text-[#4B7C5B]">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold tracking-[0.08em] uppercase text-[#101010]">{cardTitle}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#605b55]">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {activeStats.map((stat) => (
                <div key={stat.id} className="rounded-2xl border border-black/8 bg-white/70 p-5">
                  <div className="font-display text-3xl text-[#101010]">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#7a746c]">
                    {getStatLabel(stat)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
