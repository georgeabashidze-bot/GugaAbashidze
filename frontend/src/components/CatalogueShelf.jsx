import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, PawPrint, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { api } from '@/lib/api';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useLang } from '@/lib/LangContext';
import {
  deriveLifeStage,
  deriveSizeBucket,
  compareSizes,
  LIFE_STAGE_ORDER,
} from '@/lib/productFacets';

function applyFilters(productsWithFacets, filters, sort) {
  let list = productsWithFacets;

  if (filters.petType !== 'all') {
    list = list.filter((p) => p.pet_type === filters.petType || p.pet_type === 'both');
  }
  if (filters.lifeStages.length) {
    list = list.filter((p) => p._lifeStage && filters.lifeStages.includes(p._lifeStage));
  }
  if (filters.brands.length) {
    list = list.filter((p) => filters.brands.includes(p.brand));
  }
  if (filters.sizes.length) {
    list = list.filter((p) => p._sizeBucket && filters.sizes.includes(p._sizeBucket));
  }
  if (filters.productTypes && filters.productTypes.length) {
    list = list.filter((p) => p.product_type && filters.productTypes.includes(p.product_type));
  }
  if (filters.featured) {
    list = list.filter((p) => p.featured);
  }
  // Price filter — only when product has a numeric price; otherwise include.
  const [lo, hi] = filters.priceRange;
  list = list.filter((p) => {
    if (p.price == null) return true;
    return p.price >= lo && p.price <= hi;
  });

  const sorted = [...list];
  if (sort === 'alpha-asc') sorted.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'alpha-desc') sorted.sort((a, b) => b.name.localeCompare(a.name));
  else if (sort === 'price-asc')
    sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  else if (sort === 'price-desc')
    sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  else if (sort === 'featured')
    sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  return sorted;
}

/**
 * Catalogue shelf: left filter sidebar + sort bar + responsive product grid.
 * Filter UX is modelled on smartpet.ge.
 */
export default function CatalogueShelf({ subCategory, category = 'catalogue' }) {
  const { t } = useLang();
  const tc = t.catalogue;

  const SORT_OPTIONS = useMemo(
    () => [
      { value: 'featured', label: tc.sort.featured },
      { value: 'price-asc', label: tc.sort.priceAsc },
      { value: 'price-desc', label: tc.sort.priceDesc },
      { value: 'alpha-asc', label: tc.sort.alphaAsc },
      { value: 'alpha-desc', label: tc.sort.alphaDesc },
    ],
    [tc],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', category, subCategory],
    queryFn: () => api.listProducts({ category, sub_category: subCategory }),
    enabled: Boolean(subCategory),
  });

  const products = useMemo(() => data || [], [data]);

  // Augment each product once with derived facets (life-stage, size bucket).
  const productsWithFacets = useMemo(
    () =>
      products.map((p) => ({
        ...p,
        _lifeStage: deriveLifeStage(p),
        _sizeBucket: deriveSizeBucket(p),
      })),
    [products],
  );

  const brands = useMemo(
    () =>
      Array.from(new Set(productsWithFacets.map((p) => p.brand))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [productsWithFacets],
  );
  const sizes = useMemo(
    () =>
      Array.from(new Set(productsWithFacets.map((p) => p._sizeBucket).filter(Boolean))).sort(
        compareSizes,
      ),
    [productsWithFacets],
  );
  const lifeStages = useMemo(() => {
    const seen = new Set(
      productsWithFacets.map((p) => p._lifeStage).filter(Boolean),
    );
    // keep the canonical display order
    return LIFE_STAGE_ORDER.filter((k) => seen.has(k));
  }, [productsWithFacets]);

  // Distinct product_type values present in the current shelf (only relevant
  // for food / hygiene sub-categories). Other sub-categories will yield [].
  const productTypes = useMemo(() => {
    if (subCategory !== 'food' && subCategory !== 'hygiene') return [];
    const seen = new Set(
      productsWithFacets.map((p) => p.product_type).filter(Boolean),
    );
    return Array.from(seen);
  }, [productsWithFacets, subCategory]);

  const priceBounds = useMemo(() => {
    const prices = productsWithFacets.map((p) => p.price).filter((v) => typeof v === 'number');
    if (!prices.length) return [0, 0];
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [productsWithFacets]);

  const [filters, setFilters] = useState({
    petType: 'all',
    lifeStages: [],
    brands: [],
    sizes: [],
    productTypes: [],
    priceRange: priceBounds.slice(),
    featured: false,
  });

  // Re-anchor priceRange whenever the bounds shift (sub-category change)
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      priceRange: priceBounds.slice(),
    }));
    // Also clear narrower filters that may not exist for this new shelf
    setFilters((f) => ({
      ...f,
      brands: [],
      sizes: [],
      lifeStages: [],
      productTypes: [],
      featured: false,
      petType: 'all',
    }));
  }, [priceBounds[0], priceBounds[1], subCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const [sort, setSort] = useState('featured');
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = useMemo(
    () => applyFilters(productsWithFacets, filters, sort),
    [productsWithFacets, filters, sort],
  );

  const testIdGrid = `${category}-${subCategory}-grid`;

  if (isLoading) {
    return (
      <div
        data-testid={`${testIdGrid}-loading`}
        className="flex items-center justify-center py-16 text-[#465B70]"
      >
        <Loader2 className="w-6 h-6 animate-spin text-[#F25C05]" />
        <span className="ml-3 font-medium">{tc.shelf.loading}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div data-testid={`${testIdGrid}-error`} className="card-soft p-7 text-center">
        <p className="font-bold text-[#05223D]">{tc.shelf.loadErrorTitle}</p>
        <p className="text-sm text-[#465B70] mt-2">
          {tc.shelf.loadErrorBody}
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div data-testid={`${testIdGrid}-empty`} className="card-soft p-10 text-center">
        <PawPrint className="w-8 h-8 text-[#F25C05] mx-auto" />
        <p className="font-display font-bold text-[#05223D] text-xl mt-3">{tc.shelf.emptyTitle}</p>
        <p className="text-sm text-[#465B70] mt-2 max-w-md mx-auto">
          {tc.shelf.emptyBody}
        </p>
      </div>
    );
  }

  const filtersNode = (
    <ProductFilters
      filters={filters}
      setFilters={setFilters}
      brands={brands}
      sizes={sizes}
      lifeStages={lifeStages}
      productTypes={productTypes}
      subCategory={subCategory}
      priceBounds={priceBounds}
      totalCount={products.length}
      filteredCount={filtered.length}
      onClose={mobileOpen ? () => setMobileOpen(false) : undefined}
    />
  );

  const activeFilterCount =
    filters.brands.length +
    filters.sizes.length +
    filters.lifeStages.length +
    (filters.productTypes ? filters.productTypes.length : 0) +
    (filters.featured ? 1 : 0) +
    (filters.petType !== 'all' ? 1 : 0) +
    (filters.priceRange[0] > priceBounds[0] || filters.priceRange[1] < priceBounds[1] ? 1 : 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 xl:gap-10">
      <div className="hidden lg:block">
        <div className="sticky top-28">{filtersNode}</div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              data-testid="filters-toggle-button"
              className="lg:hidden inline-flex items-center gap-2 rounded-full border border-[#0A4D8C26] px-4 py-2 text-sm font-bold text-[#0A4D8C] hover:bg-[#0A4D8C] hover:text-white transition-all"
            >
              <SlidersHorizontal size={14} />
              {tc.filters.filtersButton}
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-[#F25C05] text-white rounded-full text-[10px] font-bold w-5 h-5 inline-flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <p data-testid="shelf-result-count" className="text-sm text-[#465B70]">
              <span className="font-bold text-[#05223D]">{filtered.length}</span>
              {' '}/ {products.length} {tc.shelf.products}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#465B70]">
            <span className="hidden sm:inline">{tc.sort.label}</span>
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

        {filtered.length === 0 ? (
          <div
            data-testid={`${testIdGrid}-no-results`}
            className="card-soft p-10 text-center"
          >
            <PawPrint className="w-8 h-8 text-[#F25C05] mx-auto" />
            <p className="font-display font-bold text-[#05223D] text-xl mt-3">
              {tc.shelf.noResultsTitle}
            </p>
            <p className="text-sm text-[#465B70] mt-2">
              {tc.shelf.noResultsBody}
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

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[88%] max-w-sm overflow-y-auto p-0 border-r-0 bg-[#FDFBF7]">
          <SheetTitle className="sr-only">{tc.filters.title}</SheetTitle>
          {mobileOpen && <div className="p-5">{filtersNode}</div>}
        </SheetContent>
      </Sheet>
    </div>
  );
}
