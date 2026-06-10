import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, PawPrint } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { api } from '@/lib/api';

/**
 * Loads & renders the live product grid for a given sub-category.
 * Backed by TanStack Query so refetches, retries and caching are handled
 * outside of useEffect.
 */
export default function ProductGrid({ subCategory, category = 'catalogue', testIdPrefix = 'product-grid' }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', category, subCategory],
    queryFn: () => api.listProducts({ category, sub_category: subCategory }),
    enabled: Boolean(subCategory),
  });

  if (isLoading) {
    return (
      <div
        data-testid={`${testIdPrefix}-loading`}
        className="flex items-center justify-center py-16 text-[#465B70]"
      >
        <Loader2 className="w-6 h-6 animate-spin text-[#F25C05]" />
        <span className="ml-3 font-medium">Loading the shelf…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-testid={`${testIdPrefix}-error`}
        className="card-soft p-7 text-center"
      >
        <p className="font-bold text-[#05223D]">We couldn’t load this shelf just now.</p>
        <p className="text-sm text-[#465B70] mt-2">
          Please refresh, or message us on WhatsApp — we’ll send you the list directly.
        </p>
      </div>
    );
  }

  const products = data || [];
  if (products.length === 0) {
    return (
      <div
        data-testid={`${testIdPrefix}-empty`}
        className="card-soft p-10 text-center"
      >
        <PawPrint className="w-8 h-8 text-[#F25C05] mx-auto" />
        <p className="font-display font-bold text-[#05223D] text-xl mt-3">
          This shelf is being stocked.
        </p>
        <p className="text-sm text-[#465B70] mt-2 max-w-md mx-auto">
          We’re finalising listings with our partner brands. Register interest and we’ll tailor your first box around your pet.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid={testIdPrefix}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7"
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
