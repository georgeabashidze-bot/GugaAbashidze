import React, { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

/**
 * Left-sidebar filter panel modelled after smartpet.ge.
 * Pure presentation — receives values + setters from parent.
 */
function FilterGroup({ title, children, defaultOpen = true, testId }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-5 border-b border-[#0A4D8C14] last:border-0" data-testid={testId}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-[11px] tracking-[0.22em] uppercase font-bold text-[#05223D]">{title}</span>
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
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />
      <span className="flex-1 leading-tight">{label}</span>
    </label>
  );
}

export default function ProductFilters({
  filters,
  setFilters,
  brands,
  tags,
  totalCount,
  filteredCount,
  onClose, // optional, mobile sheet close handler
}) {
  const togglePetType = (value) => setFilters((f) => ({ ...f, petType: value }));
  const toggleArr = (key, value) =>
    setFilters((f) => {
      const arr = f[key];
      return { ...f, [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] };
    });
  const clear = () =>
    setFilters({ petType: 'all', brands: [], tags: [], featured: false });

  const isDirty =
    filters.petType !== 'all' || filters.brands.length > 0 || filters.tags.length > 0 || filters.featured;

  return (
    <aside
      data-testid="filters-panel"
      className="card-soft p-5 md:p-6 bg-white/95 backdrop-blur"
    >
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#0A4D8C14]">
        <div>
          <p className="font-display font-bold text-[#05223D] text-lg leading-tight">Filters</p>
          <p
            data-testid="filters-result-count"
            className="text-xs text-[#465B70] mt-0.5"
          >
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

      <FilterGroup title="Pet type" testId="filter-group-pet-type">
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

      {brands.length > 0 && (
        <FilterGroup title={`Brand${filters.brands.length ? ` · ${filters.brands.length}` : ''}`} testId="filter-group-brand">
          <div className="space-y-0.5">
            {brands.map((b) => (
              <CheckRow
                key={b}
                label={b}
                checked={filters.brands.includes(b)}
                onToggle={() => toggleArr('brands', b)}
                testId={`filter-brand-${b.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      {tags.length > 0 && (
        <FilterGroup title={`Type${filters.tags.length ? ` · ${filters.tags.length}` : ''}`} testId="filter-group-tag">
          <div className="space-y-0.5">
            {tags.map((tag) => (
              <CheckRow
                key={tag}
                label={tag.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                checked={filters.tags.includes(tag)}
                onToggle={() => toggleArr('tags', tag)}
                testId={`filter-tag-${tag}`}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Status" defaultOpen={false} testId="filter-group-featured">
        <CheckRow
          label="Featured only"
          checked={filters.featured}
          onToggle={() => setFilters((f) => ({ ...f, featured: !f.featured }))}
          testId="filter-featured-toggle"
        />
      </FilterGroup>

      <button
        type="button"
        onClick={clear}
        disabled={!isDirty}
        data-testid="filter-clear-button"
        className={`mt-5 w-full text-sm font-bold py-3 rounded-full border-2 transition-all ${
          isDirty
            ? 'border-[#F25C05] text-[#F25C05] hover:bg-[#F25C05] hover:text-white'
            : 'border-[#0A4D8C1A] text-[#465B70] cursor-not-allowed'
        }`}
      >
        Clear filters
      </button>
    </aside>
  );
}
