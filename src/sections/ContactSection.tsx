import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trpc } from '@/providers/trpc';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Mail, Phone, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const { data: settings } = trpc.cms.settingList.useQuery();

  const getSetting = (key: string) => settings?.find(s => s.key === key)?.value || '';

  const title = t('Proje konuşalım', 'Proje konuşalım', 'Let’s talk project');
  const desc = t(
    'Teknik ekipler, ürün seçimi ve saha ihtiyaçları için doğrudan iletişim kurabilirsiniz.',
    'Teknik ekipler, ürün seçimi ve saha ihtiyaçları için doğrudan iletişim kurabilirsiniz.',
    'Talk to us directly about technical teams, product selection and field requirements.'
  );
  const sendLabel = t('Gönder', 'Gönder', 'Send');
  const nameLabel = t('Ad', 'Ad', 'Name');
  const emailLabel = t('E-posta', 'E-posta', 'Email');
  const messageLabel = t('Mesaj', 'Mesaj', 'Message');
  const successMsg = t('Teşekkürler! Mesaj gönderildi.', 'Teşekkürler! Mesaj gönderildi.', 'Thank you! Your message was sent.');
  const requiredMsg = t('Bu alan zorunludur.', 'Bu alan zorunludur.', 'This field is required.');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-panel', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' } });
      gsap.fromTo('.contact-field', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formState.name.trim()) newErrors.name = requiredMsg;
    if (!formState.email.trim()) newErrors.email = requiredMsg;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) newErrors.email = t('Geçersiz e-posta.', 'Geçersiz e-posta.', 'Invalid email.');
    if (!formState.message.trim()) newErrors.message = requiredMsg;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormState({ name: '', email: '', message: '' });
      }, 3000);
    }
  };

  return (
    <section ref={sectionRef} id="contact" className="section-shell section-padding">
      <div className="content-max">
        <div className="contact-panel surface-dark rounded-[2rem] overflow-hidden">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="p-8 md:p-10 lg:p-12 text-white border-b lg:border-b-0 lg:border-r border-white/8">
              <span className="section-kicker text-[#9DBC92]">{t('İLETİŞİM', 'İLETİŞİM', 'CONTACT')}</span>
              <h2 className="mt-4 font-display text-white" style={{ fontSize: 'clamp(2rem, 4vw, 4rem)', lineHeight: 1.05 }}>
                {title}
              </h2>
              <p className="mt-5 max-w-xl text-white/72 text-base md:text-lg leading-8">
                {desc}
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex items-start gap-4">
                  <MapPin size={18} className="mt-1 text-[#9DBC92]" />
                  <span className="text-sm leading-7 text-white/70">
                    {getSetting('contact_address') || 'Luke Celovica Trabinjca 18, BW Kings Park, Office 319, Beograd, Srbija'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Mail size={18} className="text-[#9DBC92]" />
                  <a href={`mailto:${getSetting('contact_email') || 'isakov@dunasava.com'}`} className="text-sm text-white/80 hover:text-[#BFD0B7]">
                    {getSetting('contact_email') || 'isakov@dunasava.com'}
                  </a>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={18} className="mt-1 text-[#9DBC92]" />
                  <div className="text-sm text-white/70">
                    {(getSetting('contact_phone') || '+381 63 8201207').split('/').map((p, i) => (
                      <div key={i}>{p.trim()}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 lg:p-12 bg-white/95">
              {submitted ? (
                <div className="flex min-h-[360px] items-center justify-center">
                  <div className="text-center">
                    <p className="font-display text-3xl text-[#101010]">{successMsg}</p>
                    <p className="mt-3 text-sm text-[#6d6a63]">{t('En kısa sürede dönüş yapılacak.', 'En kısa sürede dönüş yapılacak.', 'We will get back to you shortly.')}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="contact-field opacity-0">
                    <label className="section-kicker text-[10px]">{nameLabel}</label>
                    <input
                      type="text"
                      value={formState.name}
                      onChange={(e) => setFormState(p => ({ ...p, name: e.target.value }))}
                      className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${errors.name ? 'border-red-400 bg-red-50' : 'border-black/10 bg-white focus:border-[#4B7C5B]'}`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div className="contact-field opacity-0">
                    <label className="section-kicker text-[10px]">{emailLabel}</label>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(e) => setFormState(p => ({ ...p, email: e.target.value }))}
                      className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${errors.email ? 'border-red-400 bg-red-50' : 'border-black/10 bg-white focus:border-[#4B7C5B]'}`}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div className="contact-field opacity-0">
                    <label className="section-kicker text-[10px]">{messageLabel}</label>
                    <textarea
                      value={formState.message}
                      onChange={(e) => setFormState(p => ({ ...p, message: e.target.value }))}
                      rows={6}
                      className={`mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${errors.message ? 'border-red-400 bg-red-50' : 'border-black/10 bg-white focus:border-[#4B7C5B]'}`}
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    className="contact-field inline-flex items-center gap-2 rounded-full bg-[#0d241c] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-transform hover:-translate-y-0.5 opacity-0"
                  >
                    {sendLabel}
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
