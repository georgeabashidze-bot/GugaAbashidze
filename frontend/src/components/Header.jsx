import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Instagram, Facebook } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { LANGS } from '@/lib/i18n';
import { TID } from '@/constants/testIds';

const LOGO = 'https://customer-assets.emergentagent.com/job_smart-feed-pets/artifacts/ygio5kkm_1Smartpaw%20Post%20-%2035%20copy.PNG';

const SOCIALS = [
  { name: 'Instagram', href: 'https://www.instagram.com/smartpaw__/', icon: Instagram },
  { name: 'Facebook', href: 'https://www.facebook.com/yoursmartpaw', icon: Facebook },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@smartpaw__?is_from_webapp=1&sender_device=pc',
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3a8.5 8.5 0 0 1-4.5-1.3v6.6a6.2 6.2 0 1 1-6.2-6.2c.35 0 .69.03 1.02.09v3.1a3.2 3.2 0 1 0 2.18 3.02V3h3z" />
      </svg>
    ),
  },
];

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
    { to: '/', label: t.nav.home, tid: TID.header.navHome, end: true },
    { to: '/catalogue', label: t.nav.catalogue, tid: TID.header.navCatalogue },
    { to: '/special-offers', label: t.nav.specials, tid: TID.header.navSpecials },
    { to: '/plans', label: t.nav.plans, tid: 'nav-plans-link' },
    { to: '/how-it-works', label: t.nav.how, tid: TID.header.navHow },
    { to: '/blog', label: t.nav.blog, tid: TID.header.navBlog },
    { to: '/contact', label: t.nav.contact, tid: TID.header.navContact },
  ];

  const closeMobile = () => setOpen(false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FDFBF7]/85 backdrop-blur-xl border-b border-[#0A4D8C1A]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10 h-24 md:h-28 flex items-center justify-between gap-4">
        <Link
          data-testid={TID.header.logo}
          to="/"
          onClick={closeMobile}
          className="flex items-center gap-3 group shrink-0"
          aria-label="SmartPaw Food"
        >
          <img
            src={LOGO}
            alt="SmartPaw Food"
            className="h-16 w-16 md:h-20 md:w-20 object-contain transition-transform duration-300 group-hover:rotate-[-6deg]"
          />
          <span className="font-display font-extrabold text-[#0A4D8C] text-xl md:text-2xl tracking-tight hidden sm:block leading-none">
            SmartPaw <span className="text-[#F25C05]">Food</span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-0.5">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              data-testid={it.tid}
              className={({ isActive }) =>
                `px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive ? 'text-[#F25C05]' : 'text-[#05223D] hover:text-[#F25C05]'
                }`
              }
            >
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Socials (desktop only) */}
          <div className="hidden 2xl:flex items-center gap-1 mr-1" aria-label="Social links">
            {SOCIALS.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  data-testid={`social-${s.name.toLowerCase()}-link`}
                  className="w-9 h-9 rounded-full border border-[#0A4D8C1A] text-[#0A4D8C] flex items-center justify-center hover:bg-[#0A4D8C] hover:text-white hover:border-[#0A4D8C] transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>

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

          <Link
            to="/cabinet/login"
            data-testid="header-signin-link"
            className="hidden md:inline-flex text-sm font-bold text-[#0A4D8C] hover:text-[#F25C05] transition-colors whitespace-nowrap"
          >
            {lang === 'ka' ? 'შესვლა' : 'Sign in'}
          </Link>

          <button
            data-testid={TID.header.cta}
            onClick={onOpenSignup}
            className="hidden md:inline-flex btn-primary text-sm whitespace-nowrap"
          >
            {t.nav.cta}
          </button>

          <button
            data-testid={TID.header.mobileMenu}
            onClick={() => setOpen((v) => !v)}
            className="xl:hidden w-11 h-11 rounded-full border border-[#0A4D8C33] flex items-center justify-center text-[#0A4D8C]"
            aria-label="Open menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="xl:hidden bg-[#FDFBF7] border-t border-[#0A4D8C1A] px-5 py-6">
          <div className="flex flex-col gap-1">
            {navItems.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                onClick={closeMobile}
                data-testid={`${it.tid}-mobile`}
                className={({ isActive }) =>
                  `text-left px-3 py-3 rounded-xl font-medium ${
                    isActive ? 'bg-[#F5F2EB] text-[#F25C05]' : 'text-[#05223D] hover:bg-[#F5F2EB]'
                  }`
                }
              >
                {it.label}
              </NavLink>
            ))}
            <button
              onClick={() => { onOpenSignup(); closeMobile(); }}
              className="btn-primary mt-3 justify-center"
              data-testid={`${TID.header.cta}-mobile`}
            >
              {t.nav.cta}
            </button>
            <Link
              to="/cabinet/login"
              onClick={closeMobile}
              data-testid="header-signin-link-mobile"
              className="mt-2 text-center text-sm font-bold text-[#0A4D8C] hover:text-[#F25C05]"
            >
              {lang === 'ka' ? 'შესვლა' : 'Sign in'}
            </Link>
            <div className="flex items-center justify-center gap-2 mt-5">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="w-10 h-10 rounded-full border border-[#0A4D8C1A] text-[#0A4D8C] flex items-center justify-center hover:bg-[#0A4D8C] hover:text-white hover:border-[#0A4D8C] transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
