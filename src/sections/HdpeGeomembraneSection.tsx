import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Droplets, Layers3, ShieldCheck, Sprout } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import WatermarkedImage from '../components/WatermarkedImage';
import { useGalleryImages, type GalleryImage } from '../lib/galleryAssets';

gsap.registerPlugin(ScrollTrigger);

const getHdpeImageSrc = (index: number) => {
  const suffix = index < 100 ? String(index).padStart(2, '0') : String(index);
  return `/assets/images/hdpe-geomembrane/hdpe-${suffix}.jpg`;
};

const fallbackGallery: GalleryImage[] = Array.from({ length: 116 }, (_, index) => {
  const number = index + 1;
  return {
    key: `hdpe-${String(number).padStart(3, '0')}`,
    src: getHdpeImageSrc(number),
    alt: `HDPE Geomembran uygulama fotoğrafı ${number}`,
  };
});

export default function HdpeGeomembraneSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const galleryImages = useGalleryImages('hdpe-geomembrane', fallbackGallery, 'HDPE Geomembran uygulama fotoğrafı');
  const featuredImages = useMemo(() => galleryImages.slice(0, 4), [galleryImages]);

  const stats = useMemo(
    () => [
      { value: t('Maden', 'Maden', 'Mining'), label: t('atık havuzu', 'atık havuzu', 'waste pond') },
      { value: t('Sulama', 'Sulama', 'Irrigation'), label: t('göleti', 'göleti', 'pond') },
      { value: t('Tarımsal', 'Tarımsal', 'Agricultural'), label: t('su toplama', 'su toplama', 'water collection') },
      { value: t('HDPE', 'HDPE', 'HDPE'), label: t('geomembran', 'geomembran', 'geomembrane') },
    ],
    [t]
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hdpe-eyebrow', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' } });
      gsap.fromTo('.hdpe-title', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.hdpe-copy', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.05, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.hdpe-panel', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, scrollTrigger: { trigger: '.hdpe-stats', start: 'top 80%' } });
      gsap.fromTo('.hdpe-feature', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, scrollTrigger: { trigger: '.hdpe-feature-grid', start: 'top 82%' } });
      gsap.fromTo('.hdpe-gallery-card', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.015, scrollTrigger: { trigger: '.hdpe-gallery', start: 'top 84%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="hdpe-geomembrane" className="section-shell section-padding">
      <div className="content-max">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div className="max-w-3xl">
            <span className='hdpe-eyebrow section-kicker opacity-0'>
              {t('PROJE VİTRİNİ', 'PROJE VİTRİNİ', 'PROJECT SHOWCASE')}
            </span>
            <h2 className="hdpe-title section-title mt-4 opacity-0" style={{ fontSize: "clamp(2.2rem, 4vw, 4.3rem)" }}>
              HDPE Geomembran
            </h2>
            <p className="hdpe-copy section-copy mt-5 max-w-2xl text-base md:text-lg opacity-0">
              {t(
                'Maden atık havuzu, sulama göleti ve tarımsal amaçlı su toplama çukuru uygulamalarını tek başlık altında topladık. Bu galeri, HDPE geomembranın geniş alanlarda nasıl çözüldüğünü ve saha detaylarını gösterir.',
                'Maden atık havuzu, sulama göleti ve tarımsal amaçlı su toplama çukuru uygulamalarını tek başlık altında topladık. Bu galeri, HDPE geomembranın geniş alanlarda nasıl çözüldüğünü ve saha detaylarını gösterir.',
                'This gallery brings together mining waste ponds, irrigation ponds and agricultural water collection pits under one heading. It shows how HDPE geomembrane is applied across large areas and the associated site details.'
              )}
            </p>
          </div>

          <div className="surface rounded-[2rem] p-5 md:p-6">
            <div className="hdpe-stats grid gap-3 sm:grid-cols-2">
              {stats.map((item) => (
                <div key={item.value + '-' + item.label} className='hdpe-panel rounded-[1.25rem] border border-black/8 bg-white/70 p-4 text-center opacity-0'>
                  <div className='font-display text-2xl text-[#101010]'>{item.value}</div>
                  <div className='mt-1 text-[10px] uppercase tracking-[0.22em] text-[#7a746c]'>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hdpe-feature-grid mt-8 grid gap-4 lg:grid-cols-2">
          {[
            { icon: ShieldCheck, title: t('Maden atık havuzu', 'Maden atık havuzu', 'Mining waste pond'), copy: t('Büyük hacimli depolama alanları için sızdırmazlık ve dayanım odaklı uygulama.', 'Büyük hacimli depolama alanları için sızdırmazlık ve dayanım odaklı uygulama.', 'A sealing and durability focused application for large-volume storage areas.') },
            { icon: Droplets, title: t('Sulama göleti', 'Sulama göleti', 'Irrigation pond'), copy: t('Tarımsal sulamada su kaybını azaltan, düzenli yüzey ve birleşim detayları.', 'Tarımsal sulamada su kaybını azaltan, düzenli yüzey ve birleşim detayları.', 'Regular surface and seam details that reduce water loss in agricultural irrigation.') },
            { icon: Sprout, title: t('Tarımsal amaçlı su toplama çukuru', 'Tarımsal amaçlı su toplama çukuru', 'Agricultural water collection pit'), copy: t('Sezonluk kullanım ve yağış toplama senaryoları için pratik HDPE çözümü.', 'Sezonluk kullanım ve yağış toplama senaryoları için pratik HDPE çözümü.', 'A practical HDPE solution for seasonal use and rainfall collection scenarios.') },
            { icon: Layers3, title: t('Katman ve detay kontrolü', 'Katman ve detay kontrolü', 'Layer and detail control'), copy: t('Geotekstil, membran ve sabitleme detayları tek yapıda gösterilir.', 'Geotekstil, membran ve sabitleme detayları tek yapıda gösterilir.', 'Geotextile, membrane and anchoring details are shown in one structure.') },
          ].map(({ icon: Icon, title, copy }) => (
            <article key={title} className='hdpe-feature surface rounded-[2rem] p-5 md:p-6 opacity-0'>
              <div className='flex h-11 w-11 items-center justify-center rounded-full bg-[#101010] text-[#9DBC92]'>
                <Icon size={20} />
              </div>
              <h3 className='mt-4 font-display text-2xl text-[#101010]'>{title}</h3>
              <p className='mt-3 max-w-xl text-sm leading-7 text-[#615c55]'>{copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredImages.map((item, index) => (
            <article key={item.key} className='hdpe-feature surface overflow-hidden rounded-[1.8rem] opacity-0'>
              <div className='aspect-[4/3]'>
                <WatermarkedImage
                  src={item.src}
                  alt={item.alt}
                  className='h-full w-full'
                  imgClassName='h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]'
                  loading={index < 2 ? 'eager' : 'lazy'}
                />
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 surface-dark rounded-[2rem] p-6 md:p-8 lg:p-10 text-white">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className='section-kicker text-[#9DBC92]'>
                {t('GÖRSEL KAYIT', 'GÖRSEL KAYIT', 'VISUAL RECORD')}
              </span>
              <h3 className='mt-4 font-display text-white' style={{ fontSize: 'clamp(1.8rem, 3vw, 3rem)', lineHeight: 1.08 }}>
                {t('Saha uygulamalarının tamamı', 'Saha uygulamalarının tamamı', 'Complete field applications')}
              </h3>
              <p className='mt-4 max-w-2xl text-white/72 leading-8'>
                {t(
                  'Aşağıdaki galeri, HDPE geomembranın farklı eğimlerde, farklı zemin tiplerinde ve farklı depo formasyonlarında nasıl uygulandığını gösterir. Tüm görsellerde DUNASAVA filigramı görünür.',
                  'Aşağıdaki galeri, HDPE geomembranın farklı eğimlerde, farklı zemin tiplerinde ve farklı depo formasyonlarında nasıl uygulandığını gösterir. Tüm görsellerde DUNASAVA filigramı görünür.',
                  'The gallery below shows how HDPE geomembrane is applied on different slopes, soil types and reservoir geometries. Every image displays the DUNASAVA watermark.'
                )}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: t('Sızdırmazlık', 'Sızdırmazlık', 'Sealing') },
                { title: t('Büyük alan', 'Büyük alan', 'Large area') },
                { title: t('Saha detayı', 'Saha detayı', 'Site detail') },
              ].map(({ title }) => (
                <div key={title} className='rounded-[1.25rem] border border-white/10 bg-white/6 p-4'>
                  <div className='text-sm font-semibold uppercase tracking-[0.08em] text-white'>{title}</div>
                  <div className='mt-2 text-sm leading-6 text-white/68'>
                    {t('HDPE çözümü gerçek saha fotoğraflarıyla.', 'HDPE çözümü gerçek saha fotoğraflarıyla.', 'HDPE solution shown with real site photos.')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hdpe-gallery mt-8 columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4 [column-fill:_balance]">
          {galleryImages.map((item, index) => {
            const tall = index % 11 === 0 || index % 17 === 0;
            return (
              <article
                key={item.key}
                className={'hdpe-gallery-card mb-4 break-inside-avoid overflow-hidden rounded-[1.5rem] border border-black/8 bg-white/75 shadow-[0_18px_50px_rgba(15,15,15,0.08)] opacity-0 ' + (tall ? 'aspect-[3/4]' : 'aspect-[4/3]')}
              >
                <WatermarkedImage
                  src={item.src}
                  alt={item.alt}
                  className='h-full w-full'
                  imgClassName='h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]'
                  loading={index < 6 ? 'eager' : 'lazy'}
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
