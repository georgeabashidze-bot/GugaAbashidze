import React from 'react';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { TID } from '@/constants/testIds';

const LOGO = 'https://customer-assets.emergentagent.com/job_smart-feed-pets/artifacts/ygio5kkm_1Smartpaw%20Post%20-%2035%20copy.PNG';

export default function Footer({ onOpenSignup }) {
  const { t } = useLang();
  return (
    <footer id="contact" data-testid={TID.footer} className="bg-[#05223D] text-white pt-20 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 grain pointer-events-none" aria-hidden />
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-[#0A4D8C]/40 blur-3xl" aria-hidden />

      <div className="max-w-7xl mx-auto px-5 md:px-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <img src={LOGO} alt="" className="h-12 w-12 object-contain bg-white rounded-2xl p-1.5" />
              <span className="font-display font-extrabold text-xl">
                SmartPaw <span className="text-[#F25C05]">Food</span>
              </span>
            </div>
            <p className="mt-5 text-white/70 text-lg max-w-md leading-relaxed">
              {t.footer.tagline}
            </p>
            <button
              onClick={onOpenSignup}
              className="btn-primary mt-7"
              data-testid="footer-cta-button"
            >
              {t.nav.cta}
            </button>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase font-bold text-white/50 mb-4">{t.footer.sections.company}</p>
              <ul className="space-y-3">
                {t.footer.company.map((s, i) => (
                  <li key={i}>
                    <a href="#" className="text-white/85 hover:text-[#F25C05] transition-colors">{s}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs tracking-[0.22em] uppercase font-bold text-white/50 mb-4">{t.footer.sections.explore}</p>
              <ul className="space-y-3">
                {t.footer.explore.map((s, i) => (
                  <li key={i}>
                    <a href="#" className="text-white/85 hover:text-[#F25C05] transition-colors">{s}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs tracking-[0.22em] uppercase font-bold text-white/50 mb-4">{t.footer.sections.contact}</p>
              <ul className="space-y-3 text-white/85">
                <li className="flex items-center gap-2"><MapPin size={15} /> {t.footer.address}</li>
                <li className="flex items-center gap-2"><Phone size={15} /> +995 591 96 99 01</li>
                <li className="flex items-center gap-2"><Mail size={15} /> hello@smartpaw.ge</li>
              </ul>
              <div className="flex items-center gap-3 mt-5">
                <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#F25C05] hover:border-[#F25C05] transition-all">
                  <Instagram size={16} />
                </a>
                <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#F25C05] hover:border-[#F25C05] transition-all">
                  <Facebook size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/60">
          <p>© {new Date().getFullYear()} SmartPaw Food. {t.footer.rights}</p>
          <p className="text-white/40">Made with care in Tbilisi</p>
        </div>
      </div>
    </footer>
  );
}
