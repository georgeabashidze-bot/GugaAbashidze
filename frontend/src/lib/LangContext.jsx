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

  /**
   * Pick the active locale's value from a {field, field_ka} pair.
   *   pick(product, 'name')  → product.name_ka when lang=ka & present, else product.name
   *   pick(product, 'description')
   *   pick(plan, 'tagline')
   */
  const pick = (obj, base) => {
    if (!obj) return '';
    if (lang === 'ka') {
      const ka = obj[`${base}_ka`];
      if (ka != null && ka !== '') return ka;
    }
    return obj[base] ?? '';
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t, pick }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
