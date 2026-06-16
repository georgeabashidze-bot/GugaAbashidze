import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { ROUTES } from '@/constants/routes';
import { useLang } from '@/lib/LangContext';

const SUB_IMAGES = {
  food: 'https://images.pexels.com/photos/8434637/pexels-photo-8434637.jpeg?auto=compress&cs=tinysrgb&w=1200',
  hygiene: 'https://images.pexels.com/photos/1436139/pexels-photo-1436139.jpeg?auto=compress&cs=tinysrgb&w=1200',
  vitamins: 'https://images.pexels.com/photos/8434641/pexels-photo-8434641.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

export default function CataloguePage() {
  const { t } = useLang();
  const subs = Object.entries(ROUTES.catalogue.children);
  const items = t.products?.regular?.items || [];
  const byKey = items.reduce((acc, it) => ({ ...acc, [it.key]: it }), {});

  return (
    <PageShell>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7 mt-4">
        {subs.map(([key, sub]) => {
          const tr = byKey[key] || {};
          const title = tr.title || sub.label;
          const desc = tr.desc || '';
          return (
            <Link
              key={key}
              to={sub.path}
              data-testid={`catalogue-${key}-card`}
              className="group card-soft p-0 overflow-hidden hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(10,77,140,0.10)] transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                <img
                  src={SUB_IMAGES[key]}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="p-6 md:p-7 flex items-start justify-between gap-3 flex-1">
                <div>
                  <h3 className="font-display font-bold text-[#05223D] text-2xl tracking-tight">{title}</h3>
                  <p className="text-sm text-[#465B70] mt-2 leading-relaxed">{desc}</p>
                </div>
                <span className="mt-1 w-10 h-10 shrink-0 rounded-full border border-[#0A4D8C33] flex items-center justify-center text-[#0A4D8C] group-hover:bg-[#F25C05] group-hover:border-[#F25C05] group-hover:text-white transition-all">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
