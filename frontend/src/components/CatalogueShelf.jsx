import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, PawPrint, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { api } from '@/lib/api';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured first' },
  { value: 'alpha-asc', label: 'A → Z' },
  { value: 'alpha-desc', label: 'Z → A' },
];

function applyFilters(products, filters, sort) {
  let list = products;
  if (filters.petType !== 'all') {
    list = list.filter((p) => p.pet_type === filters.petType || p.pet_type === 'both');
  }
  if (filters.brands.length) {
    list = list.filter((p) => filters.brands.includes(p.brand));
  }
  if (filters.tags.length) {
    list = list.filter((p) => (p.tags || []).some((t) => filters.tags.includes(t)));
  }
  if (filters.featured) {
    list = list.filter((p) => p.featured);
  }

  const sorted = [...list];
  if (sort === 'alpha-asc') sorted.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'alpha-desc') sorted.sort((a, b) => b.name.localeCompare(a.name));
  else if (sort === 'featured')
    sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  return sorted;
}

/**
 * Catalogue shelf: left filter sidebar + sort bar + responsive product grid.
 * Modelled on smartpet.ge's filter UX, with SmartPaw-relevant groups.
 */
export default function CatalogueShelf({ subCategory, category = 'catalogue' }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', category, subCategory],
    queryFn: () => api.listProducts({ category, sub_category: subCategory }),
    enabled: Boolean(subCategory),
  });

  const [filters, setFilters] = useState({ petType: 'all', brands: [], tags: [], featured: false });
  const [sort, setSort] = useState('featured');
  const [mobileOpen, setMobileOpen] = useState(false);

  const products = data || [];

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort((a, b) => a.localeCompare(b)),
    [products],
  );
  const tags = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.tags || []))).sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const filtered = useMemo(() => applyFilters(products, filters, sort), [products, filters, sort]);

  const testIdGrid = `${category}-${subCategory}-grid`;

  if (isLoading) {
    return (
      <div
        data-testid={`${testIdGrid}-loading`}
        className="flex items-center justify-center py-16 text-[#465B70]"
      >
        <Loader2 className="w-6 h-6 animate-spin text-[#F25C05]" />
        <span className="ml-3 font-medium">Loading the shelf…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div data-testid={`${testIdGrid}-error`} className="card-soft p-7 text-center">
        <p className="font-bold text-[#05223D]">We couldn’t load this shelf just now.</p>
        <p className="text-sm text-[#465B70] mt-2">
          Please refresh, or message us on WhatsApp — we’ll send you the list directly.
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div data-testid={`${testIdGrid}-empty`} className="card-soft p-10 text-center">
        <PawPrint className="w-8 h-8 text-[#F25C05] mx-auto" />
        <p className="font-display font-bold text-[#05223D] text-xl mt-3">This shelf is being stocked.</p>
        <p className="text-sm text-[#465B70] mt-2 max-w-md mx-auto">
          We’re finalising listings with our partner brands. Register interest and we’ll tailor your first box around your pet.
        </p>
      </div>
    );
  }

  const filtersNode = (
    <ProductFilters
      filters={filters}
      setFilters={setFilters}
      brands={brands}
      tags={tags}
      totalCount={products.length}
      filteredCount={filtered.length}
      onClose={mobileOpen ? () => setMobileOpen(false) : undefined}
    />
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 xl:gap-10">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-28">{filtersNode}</div>
      </div>

      {/* Main column */}
      <div>
        {/* Sort bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              data-testid="filters-toggle-button"
              className="lg:hidden inline-flex items-center gap-2 rounded-full border border-[#0A4D8C26] px-4 py-2 text-sm font-bold text-[#0A4D8C] hover:bg-[#0A4D8C] hover:text-white transition-all"
            >
              <SlidersHorizontal size={14} />
              Filters
              {(filters.brands.length + filters.tags.length + (filters.featured ? 1 : 0) + (filters.petType !== 'all' ? 1 : 0)) > 0 && (
                <span className="ml-1 bg-[#F25C05] text-white rounded-full text-[10px] font-bold w-5 h-5 inline-flex items-center justify-center">
                  {filters.brands.length + filters.tags.length + (filters.featured ? 1 : 0) + (filters.petType !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>
            <p
              data-testid="shelf-result-count"
              className="text-sm text-[#465B70]"
            >
              <span className="font-bold text-[#05223D]">{filtered.length}</span>
              {' '}/ {products.length} products
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#465B70]">
            <span className="hidden sm:inline">Sort:</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                data-testid="sort-select"
                className="appearance-none bg-white border border-[#0A4D8C26] rounded-full pl-4 pr-9 py-2 text-sm font-bold text-[#05223D] cursor-pointer hover:border-[#0A4D8C] focus:outline-none focus:ring-2 focus:ring-[#F25C05]/30 transition-all"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#0A4D8C] text-xs">▾</span>
            </div>
          </label>
        </div>

        {/* Grid or empty-after-filter */}
        {filtered.length === 0 ? (
          <div
            data-testid={`${testIdGrid}-no-results`}
            className="card-soft p-10 text-center"
          >
            <PawPrint className="w-8 h-8 text-[#F25C05] mx-auto" />
            <p className="font-display font-bold text-[#05223D] text-xl mt-3">
              Nothing matches those filters.
            </p>
            <p className="text-sm text-[#465B70] mt-2">
              Try clearing a filter — or switch to ‘All’ pet types.
            </p>
          </div>
        ) : (
          <div
            data-testid={testIdGrid}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-7"
          >
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[88%] max-w-sm overflow-y-auto p-0 border-r-0 bg-[#FDFBF7]">
          <SheetTitle className="sr-only">Filters</SheetTitle>
          <div className="p-5">{filtersNode}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
