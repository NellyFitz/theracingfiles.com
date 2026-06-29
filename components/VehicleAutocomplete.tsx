'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  suggestions: string[];
  loading?: boolean;
}

export function VehicleAutocomplete({ value, onChange, placeholder, suggestions, loading }: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep query in sync when value is set externally (e.g. VIN decode)
  useEffect(() => { setQuery(value); }, [value]);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const filtered = query.trim().length === 0
    ? suggestions.slice(0, 8)
    : suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase())).slice(0, 10);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };

  const select = (s: string) => {
    setQuery(s);
    onChange(s);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setOpen(false); }
    if (e.key === 'Enter' && filtered.length === 1) { select(filtered[0]); }
  };

  return (
    <div ref={ref} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInput}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg px-4 py-3 pr-10 text-sm"
        autoComplete="off"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        {loading
          ? <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
          : <ChevronDown className="w-4 h-4 text-zinc-600" />
        }
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-xl max-h-60 overflow-y-auto">
          {filtered.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); select(s); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#E8000D]/10 hover:text-white ${
                  s === value ? 'text-[#E8000D] bg-[#E8000D]/5' : 'text-zinc-300'
                }`}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
