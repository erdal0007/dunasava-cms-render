import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Layers3, ShieldCheck, Wrench } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import WatermarkedImage from '../components/WatermarkedImage';
import { useGalleryImages, type GalleryImage } from '../lib/galleryAssets';

gsap.registerPlugin(ScrollTrigger);

const fallbackGallery: GalleryImage[] = [
  { key: 'pvc-01', src: '/assets/images/pvc-geomembrane/img-4854.jpg', alt: 'PVC Geomembran temel yalıtımı uygulaması' },
  { key: 'pvc-02', src: '/assets/images/pvc-geomembrane/img-3051.jpg', alt: 'PVC Geomembran ile detay çözümü' },
  { key: 'pvc-03', src: '/assets/images/pvc-geomembrane/img-6989.jpg', alt: 'PVC membran yüzey uygulaması' },
  { key: 'pvc-04', src: '/assets/images/pvc-geomembrane/img-4557.jpg', alt: 'PVC Geomembran şantiyesi' },
  { key: 'pvc-05', src: '/assets/images/pvc-geomembrane/img-0667.jpg', alt: 'PVC geomembran kaynak işleri' },
  { key: 'pvc-06', src: '/assets/images/pvc-geomembrane/img-9108.jpg', alt: 'PVC membran geniş alan kaplama' },
  { key: 'pvc-07', src: '/assets/images/pvc-geomembrane/img-6032.jpg', alt: 'PVC geomembran işçiligi' },
  { key: 'pvc-08', src: '/assets/images/pvc-geomembrane/img-7176.jpg', alt: 'PVC geomembran iş detayı' },
  { key: 'pvc-09', src: '/assets/images/pvc-geomembrane/img-6203.jpg', alt: 'PVC geomembran proje görünümü' },
];

export default function PvcGeomembraneSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const galleryImages = useGalleryImages('pvc-geomembrane', fallbackGallery, 'PVC Geomembran uygulama fotoğrafı');

  const stats = useMemo(
    () => [
      { value: 'PVC', label: t('Geomembran sistemi', 'Geomembran sistemi', 'Geomembrane system') },
      { value: '01', label: t('Temel yalıtımı', 'Temel yalıtımı', 'Foundation waterproofing') },
      { value: String(galleryImages.length).padStart(2, '0'), label: t('Saha fotoğrafı', 'Saha fotoğrafı', 'Field photos') },
    ],
    [galleryImages.length, t]
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pvc-eyebrow', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, scrollTrigger: { trigger: sectionRef.current, start: 'top 74%' } });
      gsap.fromTo('.pvc-title', { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' } });
      gsap.fromTo('.pvc-copy', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, delay: 0.1, scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' } });
      gsap.fromTo('.pvc-card', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, scrollTrigger: { trigger: '.pvc-grid', start: 'top 80%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="pvc-geomembrane" className="section-shell section-padding">
      <div className="content-max">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="max-w-2xl">
            <span className="pvc-eyebrow section-kicker opacity-0">{t('PROJE VİTRİNİ', 'PROJE VİTRİNİ', 'PROJECT SHOWCASE')}</span>
            <h2 className="pvc-title section-title mt-4 opacity-0" style={{ fontSize: 'clamp(2.2rem, 4vw, 4.2rem)' }}>
              PVC Geomembran
            </h2>
            <p className="pvc-copy section-copy mt-5 text-base md:text-lg opacity-0">
              {t(
                'PVC Geomembran ile temel yalıtımı için yapılmış uygulamaları burada görebilirsiniz. Bu bölüm, sahadaki işçiligi ve detay kalitesini fotoğraflarla gösterir.',
                'PVC Geomembran ile temel yalıtımı için yapılmış uygulamaları burada görebilirsiniz. Bu bölüm, sahadaki işçiligi ve detay kalitesini fotoğraflarla gösterir.',
                'Here you can see PVC geomembrane foundation waterproofing work in the field. This section shows workmanship and detail quality through site photos.'
              )}
            </p>
          </div>

          <div className="surface rounded-[2rem] p-5 md:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-[1.25rem] border border-black/8 bg-white/70 p-4 text-center">
                  <div className="font-display text-2xl text-[#101010]">{item.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#7a746c]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pvc-grid grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {galleryImages.map((item, index) => {
            const wide = index === 0 || index === 4 || index === 7;
            return (
              <article
                key={item.key}
                className={`pvc-card surface overflow-hidden rounded-[1.8rem] opacity-0 ${wide ? 'md:col-span-2 xl:col-span-2' : ''}`}
              >
                <div className={wide ? 'aspect-[16/10]' : 'aspect-[4/3]'}>
                  <WatermarkedImage
                    src={item.src}
                    alt={item.alt}
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                    loading={index < 2 ? 'eager' : 'lazy'}
                  />
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 surface-dark rounded-[2rem] p-6 md:p-8 lg:p-10 text-white">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="section-kicker text-[#9DBC92]">{t('DETAYLAR', 'DETAYLAR', 'DETAILS')}</span>
              <h3 className="mt-4 font-display text-white" style={{ fontSize: 'clamp(1.8rem, 3vw, 3rem)', lineHeight: 1.08 }}>
                PVC Geomembran ile temel yalıtımı
              </h3>
              <p className="mt-4 max-w-2xl text-white/72 leading-8">
                {t(
                  'Bu proje vitrini, temel yalıtımında PVC geomembran çözümünün nasıl uygulandığını göstermektedir. Fotoğraflar, saha hazırlığı, membran serimi, kaynak işlemleri ve bitmiş yüzeyi ayrı ayrı gösterir.',
                  'Bu proje vitrini, temel yalıtımında PVC geomembran çözümünün nasıl uygulandığını göstermektedir. Fotoğraflar, saha hazırlığı, membran serimi, kaynak işlemleri ve bitmiş yüzeyi ayrı ayrı gösterir.',
                  'This showcase demonstrates how PVC geomembrane is applied for foundation waterproofing. The photos separately show site preparation, membrane placement, welding operations and finished surfaces.'
                )}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, title: t('Su sızdırmazlık', 'Su sızdırmazlık', 'Waterproofing') },
                { icon: Layers3, title: t('Katman kontrolü', 'Katman kontrolü', 'Layer control') },
                { icon: Wrench, title: t('Saha detayı', 'Saha detayı', 'Site detail') },
              ].map(({ icon: Icon, title }) => (
                <div key={title} className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#9DBC92]">
                    <Icon size={18} />
                  </div>
                  <div className="mt-4 text-sm font-semibold uppercase tracking-[0.08em] text-white">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-white/68">
                    {t('Kurulum ve kalite tek akışta.', 'Kurulum ve kalite tek akışta.', 'Installation and quality in one flow.')}
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
