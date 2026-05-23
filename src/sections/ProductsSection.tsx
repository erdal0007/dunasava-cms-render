import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import { resolveCmsAssetUrl } from '@/lib/assetUrl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import WatermarkedImage from '../components/WatermarkedImage';

gsap.registerPlugin(ScrollTrigger);

export default function ProductsSection() {
  const { language, t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const { data: productList } = trpc.cms.productList.useQuery();

  const activeProducts = productList?.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder) || [];
  const title = t('Endüstriyel uygulamalar için ürün ailesi', 'Endüstriyel uygulamalar için ürün ailesi', 'A product family for industrial applications');
  const eyebrow = t('ÜRÜNLER', 'ÜRÜNLER', 'PRODUCTS');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.products-heading', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' } });
      gsap.fromTo('.product-card', { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.products-grid', start: 'top 80%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [activeProducts]);

  const getTitle = (p: any) => language === 'sr' ? p.titleSr : language === 'tr' ? p.titleTr : p.titleEn;
  const getDesc = (p: any) => language === 'sr' ? p.descriptionSr : language === 'tr' ? p.descriptionTr : p.descriptionEn;

  return (
    <section ref={sectionRef} id="products" className="section-shell section-padding">
      <div className="content-max">
        <div className="products-heading mb-10 md:mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between opacity-0">
          <div className="max-w-2xl">
            <span className="section-kicker">{eyebrow}</span>
            <h2 className="section-title mt-4" style={{ fontSize: 'clamp(2.1rem, 4vw, 4rem)' }}>{title}</h2>
          </div>
          <p className="section-copy max-w-xl text-base md:text-lg">
            {t(
              'Her ürün ailesi belirli bir saha ihtiyacına göre konumlanır: sızdırmazlık, koruma, ayırma ve drenaj.',
              'Her ürün ailesi belirli bir saha ihtiyacına göre konumlanır: sızdırmazlık, koruma, ayırma ve drenaj.',
              'Each product family is positioned around a field need: containment, protection, separation and drainage.'
            )}
          </p>
        </div>

        <div className="products-grid grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {activeProducts.length > 0 ? activeProducts.map((product, index) => (
            <article key={product.id} className={`product-card surface rounded-[1.75rem] overflow-hidden opacity-0 ${index === 0 ? 'md:col-span-2 xl:col-span-1' : ''}`}>
              <div className={`relative overflow-hidden ${index === 0 ? 'aspect-[16/12]' : 'aspect-[16/11]'}`}>
                {product.imageUrl ? (
                  <WatermarkedImage
                    src={resolveCmsAssetUrl(product.imageUrl)}
                    alt={getTitle(product)}
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0d241c] to-[#08111d] text-white/45">
                    {t('Görsel yok', 'Görsel yok', 'No image')}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08111d]/65 via-transparent to-transparent" />
                <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/75 backdrop-blur-md">
                  {index + 1}
                </div>
              </div>
              <div className="p-5 md:p-6">
                <h3 className="font-display text-2xl text-[#101010]">{getTitle(product)}</h3>
                <p className="mt-3 text-sm leading-7 text-[#625d56] line-clamp-3">{getDesc(product)}</p>
                <div className="mt-5 flex items-center justify-between border-t border-black/8 pt-4">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#7a746c]">{t('Detay', 'Detay', 'Detail')}</span>
                  <ArrowUpRight size={16} className="text-[#4B7C5B]" />
                </div>
              </div>
            </article>
          )) : (
            <div className="surface rounded-[1.75rem] p-8 text-[#625d56]">Veri yok.</div>
          )}
        </div>
      </div>
    </section>
  );
}
