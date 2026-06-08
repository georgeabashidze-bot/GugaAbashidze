import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { useReveal } from '@/lib/useReveal';
import { TID } from '@/constants/testIds';

const IMGS = [
  'https://images.pexels.com/photos/8498561/pexels-photo-8498561.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/32137302/pexels-photo-32137302.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/12441164/pexels-photo-12441164.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

export default function Blog() {
  const { t } = useLang();
  const ref = useReveal();
  return (
    <section id="blog" data-testid={TID.blog.section} className="py-20 md:py-28 bg-[#F5F2EB]">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div ref={ref} className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-12">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{t.blog.eyebrow}</p>
            <h2 className="font-display font-bold text-[#05223D] text-4xl sm:text-5xl tracking-[-0.02em] leading-[1.05] mt-3">
              {t.blog.title}
            </h2>
          </div>
          <a
            href="#blog"
            data-testid={TID.blog.readAll}
            className="inline-flex items-center gap-2 text-[#0A4D8C] font-bold hover:text-[#F25C05] transition-colors group self-start md:self-end"
          >
            {t.blog.readAll}
            <span className="w-9 h-9 rounded-full border-2 border-[#0A4D8C] flex items-center justify-center group-hover:bg-[#F25C05] group-hover:border-[#F25C05] group-hover:text-white transition-all">
              <ArrowUpRight size={16} />
            </span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7">
          {t.blog.items.map((it, i) => (
            <article
              key={i}
              data-testid={TID.blog.card(i)}
              className="card-soft p-0 overflow-hidden hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(10,77,140,0.10)] transition-all duration-300 group cursor-pointer"
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                <img
                  src={IMGS[i]}
                  alt={it.t}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-[#0A4D8C] text-xs font-bold tracking-wider uppercase rounded-full px-3 py-1.5">
                  {it.tag}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display font-bold text-[#05223D] text-xl leading-snug tracking-tight">{it.t}</h3>
                <p className="text-sm text-[#465B70] mt-3 leading-relaxed">{it.d}</p>
                <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05] mt-5">{it.read}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
