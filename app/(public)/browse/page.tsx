'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { filterProducts } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';
import { subToProduct } from '@/lib/productHelpers';
import ProductCard from '@/components/ProductCard';
import SkeletonCard from '@/components/SkeletonCard';
import { VehicleAutocomplete } from '@/components/VehicleAutocomplete';
import type { FilterState, Product } from '@/lib/types';

/* ── Static data ──────────────────────────────────────────────────── */

const VEHICLE_TYPES = ['All', 'Car', 'Motorcycle', 'Truck', 'Tool'];

// Curated popular US makes — shown immediately before any NHTSA call
const POPULAR_MAKES = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'BMW', 'Bentley', 'Buick',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ducati', 'Ferrari', 'Fiat',
  'Ford', 'GMC', 'Genesis', 'Harley-Davidson', 'Honda', 'Hyundai', 'Infiniti',
  'Jaguar', 'Jeep', 'Kawasaki', 'Kia', 'KTM', 'Lamborghini', 'Land Rover',
  'Lexus', 'Lincoln', 'Lotus', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz',
  'Mini', 'Mitsubishi', 'Nissan', 'Pontiac', 'Porsche', 'Ram', 'Rolls-Royce',
  'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Yamaha',
];

const CATEGORIES = ['All', 'Aero & Body', 'Interior', 'Truck & Off-Road', 'Motorcycle', 'Exterior', 'Garage'];
const FILE_TYPES = ['All', 'STL', '3MF', 'STEP'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => String(CURRENT_YEAR - i));

/* ── Enthusiast models not in NHTSA ──────────────────────────────── */

const ENTHUSIAST_MODELS: Record<string, string[]> = {
  Nissan: ['Skyline R32 GT-R','Skyline R32 GTS-T','Skyline R33 GT-R','Skyline R34 GT-R','Silvia S13','Silvia S14','Silvia S15','180SX','200SX','300ZX Z31','300ZX Z32'],
  Toyota: ['AE86 Corolla Trueno','AE86 Sprinter Trueno','AE86 Levin','Supra A60','Supra A70','MR2 AW11','MR2 SW20','Celica GT-Four ST185','Celica GT-Four ST205','Chaser JZX100','Mark II JZX90'],
  Honda: ['Civic EG','Civic EK','Civic EF','Integra DC2 Type R','Integra DC5 Type R','NSX NA1','NSX NA2','Beat','CR-X'],
  Mazda: ['RX-7 SA22C','RX-7 FC3S','RX-7 FD3S','Miata NA','Miata NB'],
  Mitsubishi: ['Lancer Evolution I','Lancer Evolution II','Lancer Evolution III','Lancer Evolution IV','Lancer Evolution V','Lancer Evolution VI','Eclipse 1G','Eclipse 2G','GTO / 3000GT','Starion'],
  Subaru: ['Impreza WRX GC8','Impreza WRX STI GC8','Impreza WRX GD','Legacy GT','Alcyone SVX'],
  BMW: ['E21','E30','E30 M3','E36 M3','E46 M3','E92 M3','E28 M5','E34 M5','2002 Turbo','2002 Tii'],
  Volkswagen: ['Golf Mk1','Golf Mk2','Golf Mk3','Golf Mk4','Corrado','Scirocco','Polo G40'],
  Porsche: ['356','911 964','911 993','911 996','911 997','914','944','968'],
  Datsun: ['240Z','260Z','280Z','280ZX','510','1200','620 Pickup','Roadster 2000'],
  'Mercedes-Benz': ['190E 2.3-16','190E 2.5-16 Evo','C36 AMG','C43 AMG','W124 E500'],
  'Alfa Romeo': ['GTV6','Spider Series 1','Spider Series 2','155 GTA','156 GTA'],
  Suzuki: ['Cappuccino','Swift GTi','Alto Works','Jimny SJ'],
  Acura: ['Integra GS-R','Integra Type R DC2','Integra Type R DC5','RSX Type-S'],
};

/* ── NHTSA helpers ────────────────────────────────────────────────── */

async function fetchModels(make: string, year: string): Promise<string[]> {
  try {
    const url = year
      ? `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`
      : `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${encodeURIComponent(make)}?format=json`;
    const res = await fetch(url);
    const json = await res.json();
    const nhtsaNames: string[] = (json.Results ?? []).map((r: any) => r.Model_Name as string);
    const extras: string[] = ENTHUSIAST_MODELS[make] ?? [];
    return [...new Set<string>([...extras, ...nhtsaNames])].sort();
  } catch {
    return ENTHUSIAST_MODELS[make] ?? [];
  }
}

/* ── Default state ────────────────────────────────────────────────── */

const defaultFilters: FilterState = {
  vehicleType: 'All',
  year: '',
  make: '',
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
  label, value, options, onChange, placeholder, loading,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
  placeholder?: string; loading?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="w-full rounded-lg px-3 py-2 pr-8 text-sm appearance-none cursor-pointer disabled:opacity-50"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {loading
          ? <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 animate-spin" />
          : <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
        }
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

  // NHTSA state
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const modelsAbort = useRef<AbortController | null>(null);

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

  // Fetch models from NHTSA whenever make or year changes
  useEffect(() => {
    if (!filters.make) {
      setModels([]);
      return;
    }
    const currentMake = filters.make;
    modelsAbort.current?.abort();
    modelsAbort.current = new AbortController();
    setModelsLoading(true);
    fetchModels(currentMake, filters.year).then((list) => {
      if (filters.make === currentMake) {
        setModels(list);
        setModelsLoading(false);
      }
    });
  }, [filters.make, filters.year]);

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setFilters(defaultFilters);
    setModels([]);
  };

  const hasActiveFilters =
    filters.vehicleType !== 'All' ||
    filters.year !== '' ||
    filters.make !== '' ||
    filters.model !== '' ||
    filters.category !== 'All' ||
    filters.fileType !== 'All' ||
    filters.verifiedOnly ||
    filters.printedAvailable ||
    filters.search !== '';

  const activeCount = [
    filters.vehicleType !== 'All',
    filters.year !== '',
    filters.make !== '',
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
      year: filters.year,
      make: filters.make,
      model: filters.model,
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

        {/* Year */}
        <SelectFilter
          label="Year"
          value={filters.year}
          options={YEARS}
          placeholder="Any Year"
          onChange={(v) => {
            update('year', v);
            update('model', '');
          }}
        />

        {/* Make */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5">Make</label>
          <VehicleAutocomplete
            value={filters.make}
            suggestions={POPULAR_MAKES}
            placeholder="Any Make"
            onChange={(v) => {
              update('make', v);
              update('model', '');
              setModels(ENTHUSIAST_MODELS[v] ?? []);
            }}
          />
        </div>

        {/* Model — appears once make is selected */}
        {filters.make && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5">Model</label>
            <VehicleAutocomplete
              value={filters.model}
              suggestions={models}
              placeholder={modelsLoading ? 'Loading…' : 'Any Model'}
              loading={modelsLoading}
              onChange={(v) => update('model', v)}
            />
          </div>
        )}

        {/* Active vehicle filter summary pill */}
        {(filters.year || filters.make || filters.model) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {filters.year && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#E8000D]/10 text-[#E8000D] border border-[#E8000D]/20 px-2 py-1 rounded-full">
                {filters.year}
                <button onClick={() => { update('year', ''); update('model', ''); }} className="hover:text-white">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filters.make && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#E8000D]/10 text-[#E8000D] border border-[#E8000D]/20 px-2 py-1 rounded-full">
                {filters.make}
                <button onClick={() => { update('make', ''); update('model', ''); setModels([]); }} className="hover:text-white">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filters.model && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#E8000D]/10 text-[#E8000D] border border-[#E8000D]/20 px-2 py-1 rounded-full">
                {filters.model}
                <button onClick={() => update('model', '')} className="hover:text-white">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
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
      <FilterSection title="Availability">
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
