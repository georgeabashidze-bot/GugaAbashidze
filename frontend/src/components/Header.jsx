import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { LANGS } from '@/lib/i18n';
import { TID } from '@/constants/testIds';

const LOGO = 'https://customer-assets.emergentagent.com/job_smart-feed-pets/artifacts/ygio5kkm_1Smartpaw%20Post%20-%2035%20copy.PNG';

export default function Header({ onOpenSignup }) {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { id: 'home', label: t.nav.home, tid: TID.header.navHome },
    { id: 'catalogue', label: t.nav.catalogue, tid: TID.header.navCatalogue },
    { id: 'how', label: t.nav.how, tid: TID.header.navHow },
    { id: 'blog', label: t.nav.blog, tid: TID.header.navBlog },
    { id: 'contact', label: t.nav.contact, tid: TID.header.navContact },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FDFBF7]/85 backdrop-blur-xl border-b border-[#0A4D8C1A]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10 h-20 flex items-center justify-between gap-6">
        <button
          data-testid={TID.header.logo}
          onClick={() => scrollTo('home')}
          className="flex items-center gap-2.5 group"
          aria-label="SmartPaw Food"
        >
          <img
            src={LOGO}
            alt="SmartPaw Food"
            className="h-11 w-11 object-contain transition-transform duration-300 group-hover:rotate-[-6deg]"
          />
          <span className="font-display font-extrabold text-[#0A4D8C] text-lg tracking-tight hidden sm:block">
            SmartPaw <span className="text-[#F25C05]">Food</span>
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((it) => (
            <button
              key={it.id}
              data-testid={it.tid}
              onClick={() => scrollTo(it.id)}
              className="px-4 py-2 text-sm font-medium text-[#05223D] hover:text-[#F25C05] transition-colors"
            >
              {it.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div
            data-testid={TID.header.langToggle}
            className="hidden sm:flex items-center bg-white border border-[#0A4D8C1A] rounded-full p-1"
            role="group"
            aria-label="Language toggle"
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                data-testid={`lang-${l.code}-button`}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                  lang === l.code
                    ? 'bg-[#0A4D8C] text-white'
                    : 'text-[#465B70] hover:text-[#0A4D8C]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            data-testid={TID.header.cta}
            onClick={onOpenSignup}
            className="hidden md:inline-flex btn-primary text-sm"
          >
            {t.nav.cta}
          </button>

          <button
            data-testid={TID.header.mobileMenu}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden w-11 h-11 rounded-full border border-[#0A4D8C33] flex items-center justify-center text-[#0A4D8C]"
            aria-label="Open menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-[#FDFBF7] border-t border-[#0A4D8C1A] px-5 py-6">
          <div className="flex flex-col gap-1">
            {navItems.map((it) => (
              <button
                key={it.id}
                onClick={() => scrollTo(it.id)}
                className="text-left px-3 py-3 rounded-xl text-[#05223D] hover:bg-[#F5F2EB] font-medium"
              >
                {it.label}
              </button>
            ))}
            <button
              onClick={() => { onOpenSignup(); setOpen(false); }}
              className="btn-primary mt-3 justify-center"
            >
              {t.nav.cta}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
