'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { filterProducts } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';
import { subToProduct } from '@/lib/productHelpers';
import ProductCard from '@/components/ProductCard';
import SkeletonCard from '@/components/SkeletonCard';
import type { FilterState, Product } from '@/lib/types';

/* ── Data ─────────────────────────────────────────────────────────── */

const VEHICLE_TYPES = ['All', 'Car', 'Motorcycle', 'Truck', 'Tool'];

const MAKE_MODELS: Record<string, string[]> = {
  All: [],
  Mazda: ['All Models', 'Miata NA', 'Miata NB', 'Miata NC', 'Miata ND', 'RX-7', 'RX-8', 'MX-5'],
  Nissan: ['All Models', 'Skyline R32', 'Skyline R33', 'Skyline R34', 'GT-R (R35)', '370Z', '350Z', 'S13', 'S14', 'S15'],
  Toyota: ['All Models', 'Supra A80', 'Supra A90', 'AE86', 'GR86', 'Celica', 'MR2'],
  Honda: ['All Models', 'S2000 AP1', 'S2000 AP2', 'Civic EG', 'Civic EK', 'Civic Type R', 'Integra DC2'],
  Subaru: ['All Models', 'WRX GC', 'WRX GD', 'WRX VA', 'STI', 'BRZ', 'Impreza', 'Forester'],
  Mitsubishi: ['All Models', 'Evo IV–VI', 'Evo VII–IX', 'Evo X', 'Eclipse', '3000GT'],
  Yamaha: ['All Models', 'R1', 'R6', 'MT-07', 'MT-09', 'YZF'],
  Ducati: ['All Models', 'Monster 696', 'Monster 797', 'Panigale V2', 'Panigale V4', '916', '996', 'Hypermotard', 'Scrambler'],
  Kawasaki: ['All Models', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Z900', 'Z650'],
  BMW: ['All Models', 'E30', 'E36', 'E46', 'E92', 'F80 M3', 'G80 M3'],
  Ford: ['All Models', 'Mustang GT', 'Mustang GT500', 'Focus RS', 'Fiesta ST'],
  Chevrolet: ['All Models', 'C5 Corvette', 'C6 Corvette', 'C7 Corvette', 'Camaro SS'],
  Jeep: ['All Models', 'Wrangler JK', 'Wrangler JL', 'Gladiator'],
  Other: ['All Models'],
};

const MAKES = Object.keys(MAKE_MODELS);

const CATEGORIES = ['All', 'Aero & Body', 'Interior', 'Truck & Off-Road', 'Motorcycle', 'Exterior', 'Garage'];
const FILE_TYPES = ['All', 'STL', '3MF', 'STEP'];
const YEAR_MIN = 1970;
const YEAR_MAX = 2025;

/* ── Default state ────────────────────────────────────────────────── */

const defaultFilters: FilterState = {
  vehicleType: 'All',
  yearMin: '',
  yearMax: '',
  make: 'All',
  model: '',
  category: 'All',
  fileType: 'All',
  verifiedOnly: false,
  printedAvailable: false,
  search: '',
};

/* ── Sub-components ──────────────────────────────────────────────── */

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#1e1e1e] pb-4 last:border-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
          {title}
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-zinc-600" />
          : <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
        }
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  );
}

function FilterChip({
  label, active, onClick,
}: {
  label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
        active
          ? 'bg-[#E8000D]/10 border-[#E8000D]/40 text-[#E8000D]'
          : 'bg-[#141414] border-[#2a2a2a] text-zinc-400 hover:border-[#E8000D]/30 hover:text-zinc-200'
      }`}
    >
      {label}
    </button>
  );
}

function SelectFilter({
  label, value, options, onChange, placeholder,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg px-3 py-2 pr-8 text-sm appearance-none cursor-pointer"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
      </div>
    </div>
  );
}

function Checkbox({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group" onClick={onChange}>
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
        checked ? 'bg-[#E8000D] border-[#E8000D]' : 'border-[#3a3a3a] group-hover:border-[#E8000D]/50'
      }`}>
        {checked && <span className="text-white text-[9px] font-black">✓</span>}
      </div>
      <span className="text-xs text-zinc-400 group-hover:text-white transition-colors leading-tight">{label}</span>
    </label>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#2a2a2a] flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-zinc-600" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">No parts found</h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-xs">Try adjusting your filters or search.</p>
      <button onClick={onReset} className="btn-outline px-6 py-2.5 text-sm rounded-lg">Clear All Filters</button>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default function BrowsePage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    createClient()
      .from('part_submissions')
      .select('*, user_profiles(name, handle)')
      .eq('status', 'approved')
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setDbProducts((data ?? []).map(subToProduct));
        setLoadingProducts(false);
      });
  }, []);

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const reset = () => setFilters(defaultFilters);

  const modelOptions = filters.make !== 'All'
    ? (MAKE_MODELS[filters.make] ?? ['All Models'])
    : [];

  const hasActiveFilters =
    filters.vehicleType !== 'All' ||
    filters.yearMin !== '' ||
    filters.yearMax !== '' ||
    filters.make !== 'All' ||
    filters.model !== '' ||
    filters.category !== 'All' ||
    filters.fileType !== 'All' ||
    filters.verifiedOnly ||
    filters.printedAvailable ||
    filters.search !== '';

  const activeCount = [
    filters.vehicleType !== 'All',
    filters.yearMin !== '' || filters.yearMax !== '',
    filters.make !== 'All',
    filters.model !== '',
    filters.category !== 'All',
    filters.fileType !== 'All',
    filters.verifiedOnly,
    filters.printedAvailable,
  ].filter(Boolean).length;

  const results = useMemo(
    () => filterProducts(dbProducts, {
      search: filters.search,
      vehicleType: filters.vehicleType,
      make: filters.make,
      category: filters.category,
      verifiedOnly: filters.verifiedOnly,
      printedAvailable: filters.printedAvailable,
    }),
    [filters, dbProducts]
  );

  const sidebar = (
    <div className="sticky top-24 space-y-0 rounded-xl border border-[#2a2a2a] bg-[#141414] p-5 divide-y divide-[#1e1e1e] space-y-4">

      <div className="flex items-center justify-between pb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white">Filters</h3>
        {hasActiveFilters && (
          <button onClick={reset} className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-[#E8000D] transition-colors">
            <X className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Vehicle */}
      <FilterSection title="Vehicle">
        <SelectFilter
          label="Vehicle Type"
          value={filters.vehicleType}
          options={VEHICLE_TYPES}
          onChange={(v) => update('vehicleType', v)}
        />

        {/* Year range */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5">Year Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={YEAR_MIN}
              max={YEAR_MAX}
              value={filters.yearMin}
              onChange={(e) => update('yearMin', e.target.value)}
              placeholder="From"
              className="w-full rounded-lg px-3 py-2 text-sm text-center"
            />
            <span className="text-zinc-600 shrink-0 text-xs">—</span>
            <input
              type="number"
              min={YEAR_MIN}
              max={YEAR_MAX}
              value={filters.yearMax}
              onChange={(e) => update('yearMax', e.target.value)}
              placeholder="To"
              className="w-full rounded-lg px-3 py-2 text-sm text-center"
            />
          </div>
        </div>

        <SelectFilter
          label="Make"
          value={filters.make}
          options={MAKES}
          onChange={(v) => { update('make', v); update('model', ''); }}
        />

        {filters.make !== 'All' && modelOptions.length > 0 && (
          <SelectFilter
            label="Model"
            value={filters.model}
            options={modelOptions}
            placeholder="All Models"
            onChange={(v) => update('model', v === 'All Models' ? '' : v)}
          />
        )}
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              label={c}
              active={filters.category === c}
              onClick={() => update('category', c)}
            />
          ))}
        </div>
      </FilterSection>

      {/* File Type */}
      <FilterSection title="File Type">
        <div className="flex flex-wrap gap-2">
          {FILE_TYPES.map((ft) => (
            <FilterChip
              key={ft}
              label={ft}
              active={filters.fileType === ft}
              onClick={() => update('fileType', ft)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen={true}>
        <Checkbox
          label="Verified Fitment Only"
          checked={filters.verifiedOnly}
          onChange={() => update('verifiedOnly', !filters.verifiedOnly)}
        />
        <Checkbox
          label="Printed Version Available"
          checked={filters.printedAvailable}
          onChange={() => update('printedAvailable', !filters.printedAvailable)}
        />
      </FilterSection>
    </div>
  );

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-4xl font-black text-[#E8000D] mb-6">Marketplace</h1>
          <div className="relative w-full">
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">{sidebar}</aside>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-40 flex">
              <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
              <div className="relative w-80 bg-[#0d0d0d] p-5 overflow-y-auto ml-auto">
                <button
                  className="flex items-center gap-2 mb-5 text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-4 h-4" /> Close
                </button>
                {sidebar}
              </div>
            </div>
          )}

          {/* Main grid */}
          <div className="flex-1 min-w-0">
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
                {activeCount > 0 && (
                  <span className="bg-[#E8000D] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {loadingProducts
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : results.length > 0
                ? results.map((p) => <ProductCard key={p.id} product={p} />)
                : <EmptyState onReset={reset} />
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
