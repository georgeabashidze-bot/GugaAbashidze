import React from 'react';
import { ArrowRight, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { TID } from '@/constants/testIds';

const HERO_IMG = 'https://images.pexels.com/photos/30769356/pexels-photo-30769356.jpeg?auto=compress&cs=tinysrgb&w=1600';
const HERO_IMG_2 = 'https://images.pexels.com/photos/20109380/pexels-photo-20109380.jpeg?auto=compress&cs=tinysrgb&w=1200';

export default function Hero({ onOpenSignup, onBrowse, onSpecials }) {
  const { t } = useLang();

  return (
    <section id="home" className="relative pt-32 md:pt-40 pb-16 md:pb-28 overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-[#F25C05]/10 blur-3xl pointer-events-none" aria-hidden />
      <div className="absolute bottom-0 -left-32 w-[420px] h-[420px] rounded-full bg-[#0A4D8C]/10 blur-3xl pointer-events-none" aria-hidden />

      <div className="max-w-7xl mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left text */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#0A4D8C1A] text-xs font-bold tracking-[0.18em] uppercase text-[#0A4D8C] mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F25C05]" />
            {t.hero.eyebrow}
          </div>

          <h1 className="font-display font-extrabold text-[#05223D] text-[26px] sm:text-[34px] lg:text-[44px] leading-[1.1] tracking-[-0.02em]">
            {t.hero.titleA}
            <br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-[#0A4D8C]">{t.hero.titleB}</span>
              <span className="absolute left-0 right-0 bottom-1 h-3 md:h-3.5 bg-[#F25C05]/30 -z-0 rounded-full" aria-hidden />
            </span>
          </h1>

          <p className="mt-7 text-[#465B70] text-lg leading-relaxed max-w-2xl">
            {t.hero.sub}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              data-testid={TID.hero.ctaPrimary}
              onClick={onOpenSignup}
              className="btn-primary"
            >
              {t.hero.ctaPrimary}
              <ArrowRight size={18} />
            </button>
            <button
              data-testid={TID.hero.ctaSecondary}
              onClick={onBrowse}
              className="btn-secondary"
            >
              {t.hero.ctaSecondary}
            </button>
            <button
              data-testid="hero-special-offers-button"
              onClick={onSpecials}
              className="btn-secondary"
            >
              {t.hero.ctaSpecials}
            </button>
          </div>

          <div className="mt-12 flex flex-wrap gap-6 text-sm">
            <Stat icon={<Sparkles size={16} />} label={t.hero.stat1} />
            <Stat icon={<Truck size={16} />} label={t.hero.stat2} />
            <Stat icon={<ShieldCheck size={16} />} label={t.hero.stat3} />
          </div>
        </div>

        {/* Right collage */}
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden card-soft floaty">
            <img
              src={HERO_IMG}
              alt="Dog eating from a SmartPaw feeder"
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05223D]/40 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
              <div className="bg-white/95 backdrop-blur rounded-2xl px-4 py-3 shadow-lg">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#465B70] font-bold">Next box</p>
                <p className="text-sm font-bold text-[#05223D]">Tuesday · 09:00</p>
              </div>
              <div className="bg-[#0A4D8C] text-white rounded-2xl px-4 py-3 shadow-lg">
                <p className="text-[10px] tracking-[0.2em] uppercase opacity-70 font-bold">Saved</p>
                <p className="text-sm font-bold">3 store runs</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block absolute -bottom-8 -left-8 w-44 h-44 rounded-3xl overflow-hidden border-4 border-[#FDFBF7] shadow-xl rotate-[-6deg]">
            <img src={HERO_IMG_2} alt="Curious cat" className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:flex absolute -top-6 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl border border-[#0A4D8C1A] items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F25C05]/15 flex items-center justify-center">
              <Sparkles size={14} className="text-[#F25C05]" />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.18em] uppercase text-[#465B70] font-bold">Smart-dispenser</p>
              <p className="text-xs font-bold text-[#05223D]">Free with every plan</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, label }) {
  return (
    <div className="flex items-center gap-2 text-[#05223D]">
      <span className="w-8 h-8 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#0A4D8C]">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}
