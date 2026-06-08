import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { useReveal } from '@/lib/useReveal';
import { TID } from '@/constants/testIds';

const IMAGES = {
  f1: 'https://images.pexels.com/photos/20109380/pexels-photo-20109380.jpeg?auto=compress&cs=tinysrgb&w=1400',
  f2: 'https://images.pexels.com/photos/31254347/pexels-photo-31254347.jpeg?auto=compress&cs=tinysrgb&w=1400',
  f3: 'https://images.pexels.com/photos/35620584/pexels-photo-35620584.jpeg?auto=compress&cs=tinysrgb&w=1400',
  f4: 'https://images.pexels.com/photos/36040900/pexels-photo-36040900.jpeg?auto=compress&cs=tinysrgb&w=1400',
};

export default function Features({ onOpenSignup }) {
  const { t } = useLang();
  const items = [
    { key: 'f1', img: IMAGES.f1, ...t.features.f1, flip: false },
    { key: 'f2', img: IMAGES.f2, ...t.features.f2, flip: true },
    { key: 'f3', img: IMAGES.f3, ...t.features.f3, flip: false },
    { key: 'f4', img: IMAGES.f4, ...t.features.f4, flip: true },
  ];

  return (
    <section id="catalogue" data-testid={TID.features.section} className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-10 flex flex-col gap-20 md:gap-28">
        {items.map((it) => (
          <FeatureRow key={it.key} item={it} onOpenSignup={onOpenSignup} />
        ))}
      </div>
    </section>
  );
}

function FeatureRow({ item, onOpenSignup }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
        item.flip ? 'lg:[&>div:first-child]:order-2' : ''
      }`}
    >
      <div className="lg:col-span-6">
        <div className="relative aspect-[5/4] rounded-[2rem] overflow-hidden card-soft group">
          <img
            src={item.img}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>
      <div className="lg:col-span-6">
        <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{item.kicker}</p>
        <h2 className="font-display font-bold text-[#05223D] text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] leading-[1.05] mt-3">
          {item.title}
        </h2>
        <p className="text-[#465B70] text-lg leading-relaxed mt-5 max-w-xl">
          {item.body}
        </p>
        <button
          data-testid={TID.features.cta(item.key)}
          onClick={onOpenSignup}
          className="mt-7 inline-flex items-center gap-2 text-[#0A4D8C] font-bold hover:text-[#F25C05] transition-colors group"
        >
          {item.cta}
          <span className="w-9 h-9 rounded-full border-2 border-[#0A4D8C] flex items-center justify-center group-hover:bg-[#F25C05] group-hover:border-[#F25C05] group-hover:text-white transition-all">
            <ArrowUpRight size={16} />
          </span>
        </button>
      </div>
    </div>
  );
}
