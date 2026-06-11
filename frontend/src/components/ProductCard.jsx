import React from 'react';
import { useSignup } from '@/lib/SignupContext';
import { useLang } from '@/lib/LangContext';
import { ArrowUpRight } from 'lucide-react';

// Re-usable card for a single product. Click → open Signup modal (no checkout yet).
export default function ProductCard({ product }) {
  const { openSignup } = useSignup();
  const { lang } = useLang();
  const { slug, name, name_ka, brand, image, description, description_ka, size, price, currency, pet_type, featured } = product;
  const displayName = lang === 'ka' && name_ka ? name_ka : name;
  const displayDesc = lang === 'ka' && description_ka ? description_ka : description;
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₾';
  const formattedPrice = price != null && price !== '' ? `${currencySymbol}${Number(price).toFixed(2)}` : null;

  return (
    <button
      type="button"
      onClick={openSignup}
      data-testid={`product-card-${slug}`}
      className="group text-left card-soft p-0 overflow-hidden hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(10,77,140,0.10)] transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        <img
          src={image}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-[#0A4D8C] text-[10px] font-bold tracking-[0.22em] uppercase rounded-full px-3 py-1.5">
          {brand}
        </span>
        {featured && (
          <span className="absolute top-4 right-4 bg-[#F25C05] text-white text-[10px] font-bold tracking-[0.22em] uppercase rounded-full px-3 py-1.5">
            Popular
          </span>
        )}
      </div>
      <div className="p-6 md:p-7 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-bold text-[#05223D] text-xl leading-tight tracking-tight">
            {displayName}
          </h3>
          <span className="mt-0.5 w-9 h-9 shrink-0 rounded-full border border-[#0A4D8C33] flex items-center justify-center text-[#0A4D8C] group-hover:bg-[#F25C05] group-hover:border-[#F25C05] group-hover:text-white transition-all">
            <ArrowUpRight size={15} />
          </span>
        </div>
        <p className="text-sm text-[#465B70] leading-relaxed">{displayDesc}</p>
        <div className="mt-auto pt-4 border-t border-[#0A4D8C0F] flex flex-wrap items-center gap-2">
          {formattedPrice && (
            <span className="text-base font-display font-extrabold text-[#F25C05] mr-auto" data-testid={`product-price-${slug}`}>
              {formattedPrice}
            </span>
          )}
          {size && (
            <span className="text-xs font-bold text-[#05223D] bg-[#F5F2EB] rounded-full px-3 py-1">
              {size}
            </span>
          )}
          <span
            className={`text-[10px] tracking-[0.22em] uppercase font-bold rounded-full px-2.5 py-1 ${
              pet_type === 'dog'
                ? 'bg-[#0A4D8C]/10 text-[#0A4D8C]'
                : pet_type === 'cat'
                ? 'bg-[#F25C05]/10 text-[#F25C05]'
                : 'bg-[#05223D]/10 text-[#05223D]'
            }`}
          >
            {pet_type === 'both' ? 'Dogs · Cats' : pet_type === 'dog' ? 'Dogs' : 'Cats'}
          </span>
        </div>
      </div>
    </button>
  );
}
