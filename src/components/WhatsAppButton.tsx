import { Phone } from 'lucide-react';
import { trpc } from '@/providers/trpc';

export default function WhatsAppButton() {
  const { data: settings } = trpc.cms.settingList.useQuery();
  const whatsapp = settings?.find(s => s.key === 'whatsapp')?.value || '381638201207';

  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 group"
      aria-label="WhatsApp"
    >
      <Phone size={24} className="text-white" />
      <span className="absolute right-full mr-3 bg-white text-[#1A1A1A] text-xs font-medium px-3 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        WhatsApp
      </span>
    </a>
  );
}
