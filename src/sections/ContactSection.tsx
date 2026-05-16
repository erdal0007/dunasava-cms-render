import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Mail, Phone } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const { data: settings } = trpc.cms.settingList.useQuery();

  const getSetting = (key: string) => settings?.find(s => s.key === key)?.value || '';

  const title = language === 'sr' ? 'Stupite u Kontakt' : language === 'tr' ? 'Bize Ulaşın' : 'Get In Touch';
  const desc = language === 'sr' ? 'Tu smo da vam pomognemo sa svim vašim geosintetičkim potrebama.' : language === 'tr' ? 'Tüm geosentetik ihtiyaçlarınızda size yardımcı olmak için buradayız.' : 'We are here to help with all your geosynthetic needs.';
  const sendLabel = language === 'sr' ? 'POŠALJITE' : language === 'tr' ? 'GÖNDER' : 'SEND';
  const nameLabel = language === 'sr' ? 'Ime' : language === 'tr' ? 'Ad' : 'Name';
  const emailLabel = language === 'sr' ? 'Email' : language === 'tr' ? 'E-posta' : 'Email';
  const messageLabel = language === 'sr' ? 'Poruka' : language === 'tr' ? 'Mesaj' : 'Message';
  const successMsg = language === 'sr' ? 'Hvala! Poruka je poslata.' : language === 'tr' ? 'Teşekkürler! Mesaj gönderildi.' : 'Thank you! Message sent.';
  const requiredMsg = language === 'sr' ? 'Ovo polje je obavezno.' : language === 'tr' ? 'Bu alan zorunludur.' : 'This field is required.';

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.contact-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.contact-info-col', { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.contact-field', { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.3, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formState.name.trim()) newErrors.name = requiredMsg;
    if (!formState.email.trim()) newErrors.email = requiredMsg;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) newErrors.email = 'Invalid email';
    if (!formState.message.trim()) newErrors.message = requiredMsg;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) { setSubmitted(true); setTimeout(() => { setSubmitted(false); setFormState({ name: '', email: '', message: '' }); }, 3000); }
  };

  return (
    <section ref={sectionRef} id="contact" className="bg-[#0A1628] section-padding">
      <div className="content-max">
        <div className="mb-12">
          <span className="contact-eyebrow text-label text-[#4A7C59] block mb-4 opacity-0">{language === 'sr' ? 'KONTAKT' : language === 'tr' ? 'İLETİŞİM' : 'CONTACT'}</span>
          <h2 className="contact-title font-display text-white opacity-0" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.15 }}>{title}</h2>
        </div>
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-20">
          <div className="contact-info-col lg:col-span-2 opacity-0">
            <p className="text-[#E8E4DF]/80 text-base leading-relaxed mb-8">{desc}</p>
            <div className="space-y-6">
              <div className="flex items-start gap-4"><MapPin size={18} className="text-[#4A7C59] mt-1 flex-shrink-0" /><span className="text-sm text-[#E8E4DF]/70">{getSetting('contact_address') || 'Luke Celovica Trabinjca 18, BW Kings Park, Office 319, Beograd, Srbija'}</span></div>
              <div className="flex items-center gap-4"><Mail size={18} className="text-[#4A7C59] flex-shrink-0" /><a href={`mailto:${getSetting('contact_email') || 'isakov@dunasava.com'}`} className="text-sm text-[#4A7C59] hover:underline">{getSetting('contact_email') || 'isakov@dunasava.com'}</a></div>
              <div className="flex items-start gap-4"><Phone size={18} className="text-[#4A7C59] mt-1 flex-shrink-0" /><div className="text-sm text-[#E8E4DF]/70">{(getSetting('contact_phone') || '+381 63 8201207').split('/').map((p, i) => <div key={i}>{p.trim()}</div>)}</div></div>
            </div>
          </div>
          <div className="lg:col-span-3">
            {submitted ? <div className="flex items-center justify-center h-full min-h-[300px]"><p className="text-[#4A7C59] text-lg font-medium">{successMsg}</p></div> : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="contact-field opacity-0"><label className="text-label text-[#E8E4DF]/50 text-[10px] block mb-2">{nameLabel}</label><input type="text" value={formState.name} onChange={(e) => setFormState(p => ({ ...p, name: e.target.value }))} className={`w-full bg-white/5 border ${errors.name ? 'border-red-400' : 'border-[#4A7C59]/30'} rounded px-4 py-3 text-white text-sm focus:border-[#4A7C59] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/15 transition-all`} />{errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}</div>
                <div className="contact-field opacity-0"><label className="text-label text-[#E8E4DF]/50 text-[10px] block mb-2">{emailLabel}</label><input type="email" value={formState.email} onChange={(e) => setFormState(p => ({ ...p, email: e.target.value }))} className={`w-full bg-white/5 border ${errors.email ? 'border-red-400' : 'border-[#4A7C59]/30'} rounded px-4 py-3 text-white text-sm focus:border-[#4A7C59] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/15 transition-all`} />{errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}</div>
                <div className="contact-field opacity-0"><label className="text-label text-[#E8E4DF]/50 text-[10px] block mb-2">{messageLabel}</label><textarea value={formState.message} onChange={(e) => setFormState(p => ({ ...p, message: e.target.value }))} rows={5} className={`w-full bg-white/5 border ${errors.message ? 'border-red-400' : 'border-[#4A7C59]/30'} rounded px-4 py-3 text-white text-sm focus:border-[#4A7C59] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/15 transition-all resize-none`} />{errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}</div>
                <button type="submit" className="contact-field opacity-0 w-full bg-[#4A7C59] text-white text-cta py-4 rounded hover:bg-[#6B8F5E] hover:scale-[1.02] transition-all duration-300">{sendLabel}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
