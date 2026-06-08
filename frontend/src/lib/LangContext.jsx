import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations } from './i18n';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('sp-lang') || 'en';
    } catch (e) {
      return 'en';
    }
  });

  useEffect(() => {
    try { localStorage.setItem('sp-lang', lang); } catch (e) { /* ignore */ }
    document.documentElement.lang = lang;
  }, [lang]);

  const t = translations[lang] || translations.en;
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
