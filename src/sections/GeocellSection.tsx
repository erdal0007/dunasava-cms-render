import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Leaf, Layers3, Route, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import WatermarkedImage from '../components/WatermarkedImage';
import { useGalleryImages, type GalleryImage } from '../lib/galleryAssets';

gsap.registerPlugin(ScrollTrigger);

const fallbackGallery: GalleryImage[] = [
  { key: 'geocell-01', src: '/assets/images/geocell/geocell-01.jpg', alt: 'Geocell uygulama fotoğrafı 1' },
  { key: 'geocell-02', src: '/assets/images/geocell/geocell-02.jpg', alt: 'Geocell uygulama fotoğrafı 2' },
  { key: 'geocell-03', src: '/assets/images/geocell/geocell-03.jpg', alt: 'Geocell uygulama fotoğrafı 3' },
  { key: 'geocell-04', src: '/assets/images/geocell/geocell-04.jpg', alt: 'Geocell uygulama fotoğrafı 4' },
  { key: 'geocell-05', src: '/assets/images/geocell/geocell-05.jpg', alt: 'Geocell uygulama fotoğrafı 5' },
  { key: 'geocell-06', src: '/assets/images/geocell/geocell-06.jpg', alt: 'Geocell uygulama fotoğrafı 6' },
  { key: 'geocell-07', src: '/assets/images/geocell/geocell-07.jpg', alt: 'Geocell uygulama fotoğrafı 7' },
  { key: 'geocell-08', src: '/assets/images/geocell/geocell-08.jpg', alt: 'Geocell uygulama fotoğrafı 8' },
  { key: 'geocell-09', src: '/assets/images/geocell/geocell-09.jpg', alt: 'Geocell uygulama fotoğrafı 9' },
  { key: 'geocell-10', src: '/assets/images/geocell/geocell-10.jpg', alt: 'Geocell uygulama fotoğrafı 10' },
];

export default function GeocellSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const galleryImages = useGalleryImages('geocell', fallbackGallery, 'Geocell uygulama fotoğrafı');

  const stats = useMemo(
    () => [
      { value: t('Geocell', 'Geocell', 'Geocell'), label: t('zemin güçlendirme', 'zemin güçlendirme', 'ground reinforcement') },
      { value: t('Eğim', 'Eğim', 'Slope'), label: t('stabilizasyonu', 'stabilizasyonu', 'stabilization') },
      { value: t('Yol', 'Yol', 'Road'), label: t('alt temel', 'alt temel', 'subgrade') },
      { value: t('Şev', 'Şev', 'Slope'), label: t('koruma', 'koruma', 'protection') },
    ],
    [t]
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.geocell-eyebrow', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' } });
      gsap.fromTo('.geocell-title', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 76%' } });
      gsap.fromTo('.geocell-copy', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.06, scrollTrigger: { trigger: sectionRef.current, start: 'top 76%' } });
      gsap.fromTo('.geocell-stat', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, scrollTrigger: { trigger: '.geocell-stats', start: 'top 80%' } });
      gsap.fromTo('.geocell-feature', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, scrollTrigger: { trigger: '.geocell-feature-grid', start: 'top 82%' } });
      gsap.fromTo('.geocell-gallery-card', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.02, scrollTrigger: { trigger: '.geocell-gallery', start: 'top 84%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="geocell" className="section-shell section-padding">
      <div className="content-max">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div className="max-w-3xl">
            <span className="geocell-eyebrow section-kicker opacity-0">{t('PROJE VİTRİNİ', 'PROJE VİTRİNİ', 'PROJECT SHOWCASE')}</span>
            <h2 className="geocell-title section-title mt-4 opacity-0" style={{ fontSize: 'clamp(2.2rem, 4vw, 4.3rem)' }}>
              GEOCELL
            </h2>
            <p className="geocell-copy section-copy mt-5 max-w-2xl text-base md:text-lg opacity-0">
              {t(
                'Geocell uygulamalarını zemin güçlendirme, yol alt temel stabilizasyonu ve şev koruma odağında bir araya getirdik. Bu bölümdeki tüm görsellerde boydan DUNASAVA filigramı kullanılır.',
                'Geocell uygulamalarını zemin güçlendirme, yol alt temel stabilizasyonu ve şev koruma odağında bir araya getirdik. Bu bölümdeki tüm görsellerde boydan DUNASAVA filigramı kullanılır.',
                'We gathered geocell applications around ground reinforcement, road subgrade stabilization and slope protection. Every image in this section uses a full-height DUNASAVA watermark.'
              )}
            </p>
          </div>

          <div className="surface rounded-[2rem] p-5 md:p-6">
            <div className="geocell-stats grid gap-3 sm:grid-cols-2">
              {stats.map((item) => (
                <div key={item.value + item.label} className="geocell-stat rounded-[1.25rem] border border-black/8 bg-white/70 p-4 text-center opacity-0">
                  <div className="font-display text-2xl text-[#101010]">{item.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#7a746c]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="geocell-feature-grid mt-8 grid gap-4 lg:grid-cols-2">
          {[
            { icon: ShieldCheck, title: t('Zemin güçlendirme', 'Zemin güçlendirme', 'Ground reinforcement'), copy: t('Taşıma kapasitesi düşük zeminlerde hücresel kısıtlama ile stabil performans.', 'Taşıma kapasitesi düşük zeminlerde hücresel kısıtlama ile stabil performans.', 'Stable performance through cellular confinement on weak subgrades.') },
            { icon: Route, title: t('Yol alt temel', 'Yol alt temel', 'Road subgrade'), copy: t('Yol ve demiryolu tabakalarında dağılımı düzenleyen esnek altyapı çözümü.', 'Yol ve demiryolu tabakalarında dağılımı düzenleyen esnek altyapı çözümü.', 'A flexible infrastructure solution that distributes loads in road and rail layers.') },
            { icon: Layers3, title: t('Katman davranışı', 'Katman davranışı', 'Layer behavior'), copy: t('Dolgu, geotekstil ve geocell birlikte çalışarak daha dengeli bir yüzey oluşturur.', 'Dolgu, geotekstil ve geocell birlikte çalışarak daha dengeli bir yüzey oluşturur.', 'Fill, geotextile and geocell work together to create a more stable surface.') },
            { icon: Leaf, title: t('Şev koruma', 'Şev koruma', 'Slope protection'), copy: t('Yeşillendirme ve erozyon kontrolüyle birleşen dayanıklı yüzey yaklaşımı.', 'Yeşillendirme ve erozyon kontrolüyle birleşen dayanıklı yüzey yaklaşımı.', 'A durable surface approach combined with greening and erosion control.') },
          ].map(({ icon: Icon, title, copy }) => (
            <article key={title} className="geocell-feature surface rounded-[2rem] p-5 md:p-6 opacity-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#101010] text-[#9DBC92]">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 font-display text-2xl text-[#101010]">{title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#615c55]">{copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {galleryImages.slice(0, 4).map((item, index) => (
            <article key={item.key} className="geocell-gallery-card surface overflow-hidden rounded-[1.8rem] opacity-0">
              <div className="aspect-[4/3]">
                <WatermarkedImage
                  src={item.src}
                  alt={item.alt}
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  watermarkStyle="vertical"
                  loading={index < 2 ? 'eager' : 'lazy'}
                />
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 surface-dark rounded-[2rem] p-6 md:p-8 lg:p-10 text-white">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="section-kicker text-[#9DBC92]">{t('GÖRSEL KAYIT', 'GÖRSEL KAYIT', 'VISUAL RECORD')}</span>
              <h3 className="mt-4 font-display text-white" style={{ fontSize: 'clamp(1.8rem, 3vw, 3rem)', lineHeight: 1.08 }}>
                {t('Geocell uygulama detayları', 'Geocell uygulama detayları', 'Geocell application details')}
              </h3>
              <p className="mt-4 max-w-2xl text-white/72 leading-8">
                {t(
                  'Aşağıdaki galeri; katman yerleşimi, hücresel yüzey davranışı ve saha uygulama çeşitlerini gösterir. Dikey filigran, görsellerin tamamında korunur.',
                  'Aşağıdaki galeri; katman yerleşimi, hücresel yüzey davranışı ve saha uygulama çeşitlerini gösterir. Dikey filigran, görsellerin tamamında korunur.',
                  'The gallery below shows layer placement, cellular surface behavior and different field applications. The vertical watermark is preserved on every image.'
                )}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                t('Saha çözümü', 'Saha çözümü', 'Field solution'),
                t('Eğim stabilizasyonu', 'Eğim stabilizasyonu', 'Slope stabilization'),
                t('Alt temel', 'Alt temel', 'Subgrade'),
              ].map((label) => (
                <div key={label} className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.08em] text-white">{label}</div>
                  <div className="mt-2 text-sm leading-6 text-white/68">
                    {t('Gerçek uygulama kareleriyle birlikte.', 'Gerçek uygulama kareleriyle birlikte.', 'Shown together with real application photos.')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="geocell-gallery mt-8 columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4 [column-fill:_balance]">
          {galleryImages.map((item, index) => (
            <article
              key={item.key}
              className="geocell-gallery-card mb-4 break-inside-avoid overflow-hidden rounded-[1.5rem] border border-black/8 bg-white/75 shadow-[0_18px_50px_rgba(15,15,15,0.08)] opacity-0 aspect-[4/3]"
            >
              <WatermarkedImage
                src={item.src}
                alt={item.alt}
                className="h-full w-full"
                imgClassName="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                watermarkStyle="vertical"
                loading={index < 6 ? 'eager' : 'lazy'}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
