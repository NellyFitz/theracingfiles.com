'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { products, filterProducts } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import SkeletonCard from '@/components/SkeletonCard';
import type { FilterState } from '@/lib/types';

const VEHICLE_TYPES = ['All', 'Car', 'Motorcycle', 'Truck', 'Tool'];
const MAKES = ['All', 'Mazda', 'Nissan', 'Toyota', 'Yamaha', 'Ducati'];
const CATEGORIES = ['All', 'Aero & Body', 'Interior', 'Truck & Off-Road', 'Motorcycle', 'Exterior', 'Garage'];

const defaultFilters: FilterState = {
  vehicleType: 'All',
  make: 'All',
  model: '',
  category: 'All',
  fileType: 'All',
  verifiedOnly: false,
  printedAvailable: false,
  search: '',
};

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 whitespace-nowrap ${
        active
          ? 'bg-[#39ff14]/10 border-[#39ff14]/40 text-[#39ff14]'
          : 'bg-[#141414] border-[#2a2a2a] text-zinc-400 hover:border-[#39ff14]/30 hover:text-zinc-200'
      }`}
    >
      {label}
    </button>
  );
}

function SelectFilter({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg px-3 py-2 pr-8 text-sm appearance-none cursor-pointer"
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#2a2a2a] flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-zinc-600" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">No parts found</h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-xs">
        Try adjusting your filters or search to find what you're looking for.
      </p>
      <button onClick={onReset} className="btn-outline px-6 py-2.5 text-sm rounded-lg">
        Clear All Filters
      </button>
    </div>
  );
}

export default function BrowsePage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading] = useState(false);

  const update = (key: keyof FilterState, value: string | boolean) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const reset = () => setFilters(defaultFilters);

  const hasActiveFilters =
    filters.vehicleType !== 'All' ||
    filters.make !== 'All' ||
    filters.category !== 'All' ||
    filters.verifiedOnly ||
    filters.printedAvailable ||
    filters.search !== '';

  const results = useMemo(
    () =>
      filterProducts(products, {
        search: filters.search,
        vehicleType: filters.vehicleType,
        make: filters.make,
        category: filters.category,
        verifiedOnly: filters.verifiedOnly,
        printedAvailable: filters.printedAvailable,
      }),
    [filters]
  );

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#39ff14] mb-2">Marketplace</p>
          <h1 className="text-4xl font-black text-white mb-6">Parts Marketplace</h1>

          {/* Search bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by part, vehicle, make, model..."
              value={filters.search}
              onChange={(e) => update('search', e.target.value)}
              className="w-full rounded-xl pl-12 pr-4 py-4 text-sm"
            />
            {filters.search && (
              <button
                onClick={() => update('search', '')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick filter chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-zinc-600 flex items-center">Vehicle:</span>
            {VEHICLE_TYPES.map((vt) => (
              <FilterChip
                key={vt}
                label={vt}
                active={filters.vehicleType === vt}
                onClick={() => update('vehicleType', vt)}
              />
            ))}
            <div className="w-px h-5 bg-[#2a2a2a] mx-1 self-center" />
            <FilterChip
              label="✓ Verified Fitment"
              active={filters.verifiedOnly}
              onClick={() => update('verifiedOnly', !filters.verifiedOnly)}
            />
            <FilterChip
              label="🖨 Printed Available"
              active={filters.printedAvailable}
              onClick={() => update('printedAvailable', !filters.printedAvailable)}
            />
            {hasActiveFilters && (
              <button
                onClick={reset}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`
            ${sidebarOpen ? 'block' : 'hidden'} lg:block
            fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-auto
            w-72 lg:w-64 shrink-0
            bg-[#0d0d0d] lg:bg-transparent
            p-6 lg:p-0
            overflow-y-auto lg:overflow-visible
          `}>
            {/* Mobile close */}
            <button
              className="lg:hidden flex items-center gap-2 mb-6 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" /> Close
            </button>

            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5 space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Filters</h3>

                <SelectFilter
                  label="Make"
                  value={filters.make}
                  options={MAKES}
                  onChange={(v) => update('make', v)}
                />

                <SelectFilter
                  label="Category"
                  value={filters.category}
                  options={CATEGORIES}
                  onChange={(v) => update('category', v)}
                />

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    File Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'STL', '3MF', 'STEP'].map((ft) => (
                      <FilterChip
                        key={ft}
                        label={ft}
                        active={filters.fileType === ft}
                        onClick={() => update('fileType', ft)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#2a2a2a]">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => update('verifiedOnly', !filters.verifiedOnly)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        filters.verifiedOnly ? 'bg-[#39ff14] border-[#39ff14]' : 'border-[#3a3a3a]'
                      }`}
                    >
                      {filters.verifiedOnly && <span className="text-[#0d0d0d] text-xs font-black">✓</span>}
                    </div>
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                      Verified Fitment Only
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => update('printedAvailable', !filters.printedAvailable)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        filters.printedAvailable ? 'bg-[#39ff14] border-[#39ff14]' : 'border-[#3a3a3a]'
                      }`}
                    >
                      {filters.printedAvailable && <span className="text-[#0d0d0d] text-xs font-black">✓</span>}
                    </div>
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                      Printed Version Available
                    </span>
                  </label>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={reset}
                    className="w-full text-xs text-zinc-500 hover:text-white transition-colors pt-2 flex items-center gap-1.5"
                  >
                    <X className="w-3 h-3" /> Reset all filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main grid */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-zinc-500">
                <span className="text-white font-bold">{results.length}</span> parts found
              </p>
              <button
                className="lg:hidden flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors border border-[#2a2a2a] rounded-lg px-3 py-2"
                onClick={() => setSidebarOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-[#39ff14] text-[#0d0d0d] text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    !
                  </span>
                )}
              </button>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {results.length > 0
                  ? results.map((p) => <ProductCard key={p.id} product={p} />)
                  : <EmptyState onReset={reset} />
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
