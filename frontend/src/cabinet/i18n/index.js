import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { ka } from "./ka";
import { en } from "./en";

const dictionaries = { ka, en };
const LS_KEY = "smartpaw_lang";

const I18nContext = createContext({ lang: "ka", t: (k) => k, setLang: () => {} });

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === "undefined") return "ka";
    return localStorage.getItem(LS_KEY) || "ka";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next);
    try { localStorage.setItem(LS_KEY, next); } catch (_) {}
  }, []);

  const t = useCallback(
    (key, vars) => {
      const dict = dictionaries[lang] || dictionaries.ka;
      const value = key.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), dict);
      let str = typeof value === "string" ? value : key;
      if (vars && typeof str === "string") {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return str;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function localized(obj, lang, key) {
  // expects obj like { name_en, name_ka } and key like 'name'
  const langKey = `${key}_${lang}`;
  return obj?.[langKey] || obj?.[`${key}_en`] || obj?.[key] || "";
}
