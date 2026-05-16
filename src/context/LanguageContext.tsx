import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type Language = 'sr' | 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (sr?: string | null, tr?: string | null, en?: string | null) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'sr',
  setLanguage: () => {},
  t: (sr, tr, en) => en || tr || sr || '',
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem('dunasava-lang');
    return (stored === 'tr' ? 'tr' : stored === 'en' ? 'en' : 'sr') as Language;
  });

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    localStorage.setItem('dunasava-lang', lang);
  }, []);

  const t = useCallback((sr?: string | null, tr?: string | null, en?: string | null): string => {
    if (language === 'sr') return sr || tr || en || '';
    if (language === 'tr') return tr || sr || en || '';
    return en || tr || sr || '';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
