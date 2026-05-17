import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import { resolveCmsAssetUrl } from '@/lib/assetUrl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ProductsSection() {
  const { language, t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const { data: productList } = trpc.cms.productList.useQuery();

  const activeProducts = productList?.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  const title = t('Geosintetička Rešenja Svetske Klase', 'Dünya Standartlarında Geosentetik Çözümler', 'World-Class Geosynthetic Solutions');
  const eyebrow = t('NAŠI PROIZVODI', 'ÜRÜNLERİMİZ', 'OUR PRODUCTS');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.products-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.products-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.product-card', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.products-grid', start: 'top 80%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [activeProducts]);

  const getTitle = (p: any) => language === 'sr' ? p.titleSr : language === 'tr' ? p.titleTr : p.titleEn;
  const getDesc = (p: any) => language === 'sr' ? p.descriptionSr : language === 'tr' ? p.descriptionTr : p.descriptionEn;

  return (
    <section ref={sectionRef} id="products" className="bg-white section-padding">
      <div className="content-max">
        <div className="text-center mb-16">
          <span className="products-eyebrow text-label text-[#4A7C59] block mb-4 opacity-0">{eyebrow}</span>
          <h2 className="products-title font-display text-[#1A1A1A] opacity-0" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.15 }}>{title}</h2>
        </div>
        <div className="products-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeProducts?.map((product) => (
            <div key={product.id} className="product-card group cursor-pointer opacity-0">
              <div className="relative overflow-hidden rounded mb-4 aspect-[4/3]">
                {product.imageUrl && <img src={resolveCmsAssetUrl(product.imageUrl)} alt={getTitle(product)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />}
              </div>
              <h3 className="font-display text-lg text-[#1A1A1A] group-hover:text-[#4A7C59] transition-colors duration-300 mb-2 relative inline-block">
                {getTitle(product)}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#4A7C59] transition-all duration-400 group-hover:w-full" />
              </h3>
              <p className="text-sm text-[#8A8680] leading-relaxed line-clamp-2">{getDesc(product)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
