import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import PriceRangeSlider from '@/components/PriceRangeSlider';
import { LIFE_STAGE_LABELS } from '@/lib/productFacets';

const BRAND_VISIBLE_LIMIT = 8;
const SIZE_VISIBLE_LIMIT = 8;

// Display labels for product_type values, scoped by sub_category.
const PRODUCT_TYPE_LABELS = {
  // Food
  'dry-food': 'Dry food',
  'wet-food': 'Wet food',
  'snacks': 'Snacks',
  // Hygiene
  'teeth-care': 'Teeth care',
  'grooming': 'Grooming',
  'pads': 'Pads',
  // Shared
  'other': 'Other',
};

// Canonical display order per sub_category.
const PRODUCT_TYPE_ORDER = {
  food: ['dry-food', 'wet-food', 'snacks', 'other'],
  hygiene: ['teeth-care', 'grooming', 'pads', 'other'],
};

function FilterGroup({ title, count, children, defaultOpen = true, testId }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-5 border-b border-[#0A4D8C14] last:border-0" data-testid={testId}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-[11px] tracking-[0.22em] uppercase font-bold text-[#05223D]">
          {title}
          {count > 0 && (
            <span className="ml-2 text-[#F25C05]">· {count}</span>
          )}
        </span>
        <ChevronDown
          size={15}
          className={`text-[#0A4D8C] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function CheckRow({ label, checked, onToggle, testId }) {
  return (
    <label
      className="flex items-center gap-3 py-1.5 cursor-pointer text-[14px] text-[#05223D] hover:text-[#F25C05] transition-colors"
      data-testid={testId}
    >
      <span
        className={`w-[18px] h-[18px] rounded-md border flex items-center justify-center transition-all ${
          checked ? 'bg-[#F25C05] border-[#F25C05] text-white' : 'border-[#0A4D8C40]'
        }`}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />
      <span className="flex-1 leading-tight">{label}</span>
    </label>
  );
}

/**
 * Left-sidebar filter panel modelled after smartpet.ge.
 *
 * Filter state shape (controlled by parent):
 *   {
 *     petType: 'all' | 'dog' | 'cat',
 *     lifeStages: string[],
 *     brands: string[],
 *     sizes: string[],
 *     priceRange: [number, number],   // current [low, high]
 *     featured: boolean,
 *   }
 */
export default function ProductFilters({
  filters,
  setFilters,
  brands,
  sizes,
  lifeStages,
  productTypes = [],
  subCategory,
  priceBounds, // [absMin, absMax]
  totalCount,
  filteredCount,
  onClose,
}) {
  const [brandSearch, setBrandSearch] = useState('');
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllSizes, setShowAllSizes] = useState(false);

  const togglePetType = (value) => setFilters((f) => ({ ...f, petType: value }));
  const toggleArr = (key, value) =>
    setFilters((f) => {
      const arr = f[key];
      return {
        ...f,
        [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value],
      };
    });
  const setPriceRange = (range) => setFilters((f) => ({ ...f, priceRange: range }));
  const clear = () =>
    setFilters({
      petType: 'all',
      lifeStages: [],
      brands: [],
      sizes: [],
      productTypes: [],
      priceRange: priceBounds.slice(),
      featured: false,
    });

  const [pMin, pMax] = priceBounds;
  const [curMin, curMax] = filters.priceRange;
  const priceDirty = curMin > pMin || curMax < pMax;

  const isDirty =
    filters.petType !== 'all' ||
    filters.lifeStages.length > 0 ||
    filters.brands.length > 0 ||
    filters.sizes.length > 0 ||
    (filters.productTypes && filters.productTypes.length > 0) ||
    filters.featured ||
    priceDirty;

  // Brand list with search + show-all collapse
  const filteredBrands = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.toLowerCase().includes(q));
  }, [brandSearch, brands]);
  const visibleBrands = showAllBrands ? filteredBrands : filteredBrands.slice(0, BRAND_VISIBLE_LIMIT);
  const hiddenBrandCount = filteredBrands.length - visibleBrands.length;

  // Sizes with show-all collapse
  const visibleSizes = showAllSizes ? sizes : sizes.slice(0, SIZE_VISIBLE_LIMIT);
  const hiddenSizeCount = sizes.length - visibleSizes.length;

  // Product type — only relevant for food / hygiene sub-categories. Order by canonical list.
  const showTypeFilter =
    (subCategory === 'food' || subCategory === 'hygiene') && productTypes.length > 0;
  const orderedProductTypes = showTypeFilter
    ? (PRODUCT_TYPE_ORDER[subCategory] || []).filter((t) => productTypes.includes(t))
    : [];

  return (
    <aside
      data-testid="filters-panel"
      className="card-soft p-5 md:p-6 bg-white/95 backdrop-blur"
    >
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#0A4D8C14]">
        <div>
          <p className="font-display font-bold text-[#05223D] text-lg leading-tight">Filters</p>
          <p data-testid="filters-result-count" className="text-xs text-[#465B70] mt-0.5">
            Showing <span className="font-bold text-[#0A4D8C]">{filteredCount}</span> of {totalCount}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden w-9 h-9 rounded-full border border-[#0A4D8C26] flex items-center justify-center text-[#0A4D8C]"
            aria-label="Close filters"
            data-testid="filters-close-button"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Clear button at top, smartpet-style */}
      <button
        type="button"
        onClick={clear}
        disabled={!isDirty}
        data-testid="filter-clear-button"
        className={`mt-4 w-full text-xs font-bold py-2 rounded-full border transition-all ${
          isDirty
            ? 'border-[#F25C05] text-[#F25C05] hover:bg-[#F25C05] hover:text-white'
            : 'border-[#0A4D8C1A] text-[#465B70]/60 cursor-not-allowed'
        }`}
      >
        ↺ Clear all filters
      </button>

      {/* Price */}
      {pMax > pMin && (
        <FilterGroup
          title="Price"
          count={priceDirty ? 1 : 0}
          testId="filter-group-price"
        >
          <PriceRangeSlider
            min={pMin}
            max={pMax}
            value={filters.priceRange}
            onChange={setPriceRange}
            suffix="₾"
          />
        </FilterGroup>
      )}

      {/* Pet type */}
      <FilterGroup
        title="Pet type"
        count={filters.petType !== 'all' ? 1 : 0}
        testId="filter-group-pet-type"
      >
        <div className="flex bg-[#F5F2EB] rounded-full p-1" role="radiogroup" aria-label="Pet type">
          {[
            { v: 'all', l: 'All' },
            { v: 'dog', l: 'Dogs' },
            { v: 'cat', l: 'Cats' },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              role="radio"
              aria-checked={filters.petType === opt.v}
              onClick={() => togglePetType(opt.v)}
              data-testid={`filter-pet-type-${opt.v}`}
              className={`flex-1 py-1.5 text-sm font-bold rounded-full transition-all ${
                filters.petType === opt.v
                  ? 'bg-[#0A4D8C] text-white shadow-sm'
                  : 'text-[#465B70] hover:text-[#0A4D8C]'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Type (food / hygiene only) */}
      {showTypeFilter && (
        <FilterGroup
          title="Type"
          count={filters.productTypes ? filters.productTypes.length : 0}
          testId="filter-group-product-type"
        >
          <div className="space-y-0.5">
            {orderedProductTypes.map((t) => (
              <CheckRow
                key={t}
                label={PRODUCT_TYPE_LABELS[t] || t}
                checked={(filters.productTypes || []).includes(t)}
                onToggle={() => toggleArr('productTypes', t)}
                testId={`filter-product-type-${t}`}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      {/* Life stage */}
      {lifeStages.length > 0 && (
        <FilterGroup
          title="Life stage"
          count={filters.lifeStages.length}
          testId="filter-group-life-stage"
        >
          <div className="space-y-0.5">
            {lifeStages.map((stage) => (
              <CheckRow
                key={stage}
                label={LIFE_STAGE_LABELS[stage] || stage}
                checked={filters.lifeStages.includes(stage)}
                onToggle={() => toggleArr('lifeStages', stage)}
                testId={`filter-life-stage-${stage}`}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      {/* Brand with search + show all */}
      {brands.length > 0 && (
        <FilterGroup
          title="Brand"
          count={filters.brands.length}
          testId="filter-group-brand"
        >
          {brands.length > 6 && (
            <div className="relative mb-3">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#465B70]" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brand"
                data-testid="filter-brand-search"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-[#0A4D8C26] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F25C05]/30"
              />
            </div>
          )}
          <div className="space-y-0.5">
            {visibleBrands.map((b) => (
              <CheckRow
                key={b}
                label={b}
                checked={filters.brands.includes(b)}
                onToggle={() => toggleArr('brands', b)}
                testId={`filter-brand-${b.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
              />
            ))}
            {filteredBrands.length === 0 && (
              <p className="text-xs text-[#465B70] py-2">No brand matches “{brandSearch}”</p>
            )}
          </div>
          {hiddenBrandCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllBrands(true)}
              data-testid="filter-brand-show-all"
              className="mt-2 text-xs font-bold text-[#0A4D8C] hover:text-[#F25C05] transition"
            >
              Show all ({filteredBrands.length}) ↓
            </button>
          )}
          {showAllBrands && filteredBrands.length > BRAND_VISIBLE_LIMIT && (
            <button
              type="button"
              onClick={() => setShowAllBrands(false)}
              className="mt-2 text-xs font-bold text-[#0A4D8C] hover:text-[#F25C05] transition"
            >
              Collapse ↑
            </button>
          )}
        </FilterGroup>
      )}

      {/* Weight / Size */}
      {sizes.length > 0 && (
        <FilterGroup
          title="Weight"
          count={filters.sizes.length}
          testId="filter-group-size"
        >
          <div className="space-y-0.5">
            {visibleSizes.map((s) => (
              <CheckRow
                key={s}
                label={s}
                checked={filters.sizes.includes(s)}
                onToggle={() => toggleArr('sizes', s)}
                testId={`filter-size-${s.replace(/[^a-z0-9]+/gi, '-')}`}
              />
            ))}
          </div>
          {hiddenSizeCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllSizes(true)}
              data-testid="filter-size-show-all"
              className="mt-2 text-xs font-bold text-[#0A4D8C] hover:text-[#F25C05] transition"
            >
              Show all ({sizes.length}) ↓
            </button>
          )}
          {showAllSizes && sizes.length > SIZE_VISIBLE_LIMIT && (
            <button
              type="button"
              onClick={() => setShowAllSizes(false)}
              className="mt-2 text-xs font-bold text-[#0A4D8C] hover:text-[#F25C05] transition"
            >
              Collapse ↑
            </button>
          )}
        </FilterGroup>
      )}

      {/* Featured */}
      <FilterGroup title="Status" defaultOpen={false} testId="filter-group-featured">
        <CheckRow
          label="Featured only"
          checked={filters.featured}
          onToggle={() => setFilters((f) => ({ ...f, featured: !f.featured }))}
          testId="filter-featured-toggle"
        />
      </FilterGroup>
    </aside>
  );
}
