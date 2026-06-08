import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useReveal } from '@/lib/useReveal';

// Section accepts: id, eyebrow, title, body, items (3), images map, accentReverse for visual variety, testIdPrefix
export default function ProductSection({
  id,
  eyebrow,
  title,
  body,
  items,
  images,
  onOpenSignup,
  testIdPrefix = 'product',
  surface = 'light',
}) {
  const headerRef = useReveal();

  const bg =
    surface === 'alt'
      ? 'bg-[#F5F2EB]'
      : 'bg-transparent';

  return (
    <section id={id} data-testid={`${testIdPrefix}-section`} className={`py-20 md:py-28 ${bg}`}>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div ref={headerRef} className="reveal max-w-3xl mb-12 md:mb-16">
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{eyebrow}</p>
          <h2 className="font-display font-bold text-[#05223D] text-4xl sm:text-5xl tracking-[-0.02em] leading-[1.05] mt-3">
            {title}
          </h2>
          {body && (
            <p className="text-[#465B70] text-lg leading-relaxed mt-5 max-w-2xl">{body}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
          {items.map((it) => (
            <button
              key={it.key}
              data-testid={`${testIdPrefix}-${it.key}-card`}
              onClick={onOpenSignup}
              className="group text-left card-soft p-0 overflow-hidden hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(10,77,140,0.10)] transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                <img
                  src={images[it.key]}
                  alt={it.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-[#0A4D8C] text-[10px] font-bold tracking-[0.22em] uppercase rounded-full px-3 py-1.5">
                  {eyebrow}
                </span>
              </div>
              <div className="p-6 md:p-7 flex items-start justify-between gap-3 flex-1">
                <div>
                  <h3 className="font-display font-bold text-[#05223D] text-2xl tracking-tight">{it.title}</h3>
                  <p className="text-sm text-[#465B70] mt-2 leading-relaxed">{it.desc}</p>
                </div>
                <span className="mt-1 w-10 h-10 shrink-0 rounded-full border border-[#0A4D8C33] flex items-center justify-center text-[#0A4D8C] group-hover:bg-[#F25C05] group-hover:border-[#F25C05] group-hover:text-white transition-all">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
