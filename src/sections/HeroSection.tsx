import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import gsap from 'gsap';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const topLineRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const line1 = t('Snaga za', 'Yapılar için', 'Strength for');
  const line2 = t('Konstrukcije', 'Güç', 'Constructions');
  const subtitle = t('Pouzdanje za Budućnost', 'Geleceğe Güven', 'Trust for the Future');
  const scrollText = t('Skrolujte', 'Aşağı Kaydır', 'Scroll');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.5 });
      if (line1Ref.current) {
        tl.fromTo(line1Ref.current.querySelectorAll('.hero-word'), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, 0);
      }
      if (line2Ref.current) {
        tl.fromTo(line2Ref.current.querySelectorAll('.hero-word'), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, 0.3);
      }
      tl.fromTo(topLineRef.current, { width: '0%' }, { width: '60%', duration: 1.2, ease: 'power2.inOut' }, 1.5);
      tl.fromTo(bottomLineRef.current, { width: '0%' }, { width: '60%', duration: 1.2, ease: 'power2.inOut' }, 1.5);
      tl.fromTo('.hero-subtitle', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2);
      tl.fromTo(scrollRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 2.5);
      const bounceEl = scrollRef.current?.querySelector('.bounce-icon');
      if (bounceEl) gsap.to(bounceEl, { y: 8, duration: 1.5, ease: 'power1.inOut', yoyo: true, repeat: -1 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="hero" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="/assets/images/hero-reservoir-drone.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 20%, rgba(10,22,40,0.88) 100%)' }} />
      </div>
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div ref={line1Ref} className="overflow-hidden mb-2">
          <h1 className="font-display text-white leading-[0.95] tracking-[-0.02em]" style={{ fontSize: 'clamp(2.5rem, 9vw, 10rem)' }}>
            {line1.split(' ').map((word, i) => <span key={i} className="hero-word inline-block mr-[0.25em]">{word}</span>)}
          </h1>
        </div>
        <div ref={line2Ref} className="overflow-hidden mb-8">
          <h1 className="font-display text-white leading-[0.95] tracking-[-0.02em]" style={{ fontSize: 'clamp(2.5rem, 9vw, 10rem)' }}>
            {line2.split(' ').map((word, i) => <span key={i} className="hero-word inline-block mr-[0.25em]">{word}</span>)}
          </h1>
        </div>
        <div className="flex justify-center mb-6"><div ref={topLineRef} className="h-[1px] bg-white/60" style={{ width: '0%' }} /></div>
        <p className="hero-subtitle text-white/90 text-label tracking-[0.1em] text-sm md:text-base">{subtitle}</p>
        <div className="flex justify-center mt-6"><div ref={bottomLineRef} className="h-[1px] bg-white/60" style={{ width: '0%' }} /></div>
      </div>
      <div ref={scrollRef} onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer opacity-0">
        <span className="text-label text-white/60 text-xs">{scrollText}</span>
        <ChevronDown className="bounce-icon text-white/60" size={20} />
      </div>
    </section>
  );
}
