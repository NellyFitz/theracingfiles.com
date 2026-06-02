import Link from 'next/link';
import { Star, Download, Printer, Wrench } from 'lucide-react';
import type { Product } from '@/lib/types';
import Badge from './Badge';

interface ProductCardProps {
  product: Product;
}

const categoryColors: Record<string, string> = {
  'Aero & Body': 'text-purple-400',
  'Interior': 'text-amber-400',
  'Truck & Off-Road': 'text-orange-400',
  'Motorcycle': 'text-sky-400',
  'Exterior': 'text-teal-400',
};

export default function ProductCard({ product }: ProductCardProps) {
  const catColor = categoryColors[product.category] ?? 'text-zinc-400';

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden card-hover"
    >
      {/* Image */}
      <div className="relative h-48 bg-[#1a1a1a] grid-bg overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-[#252525] border border-[#333] flex items-center justify-center">
                <Printer className="w-8 h-8 text-[#39ff14] opacity-60" />
              </div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{product.make} · {product.model}</p>
            </div>
          </div>
        )}
        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.badges.map((b) => (
            <Badge key={b.type} type={b.type} label={b.label} />
          ))}
        </div>
        {/* Year chip */}
        <div className="absolute bottom-3 right-3 bg-[#0d0d0d]/80 backdrop-blur-sm border border-[#2a2a2a] rounded px-2 py-0.5 text-[10px] text-zinc-400 font-mono">
          {product.yearStart}–{product.yearEnd}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${catColor}`}>
              {product.category}
            </p>
            <h3 className="text-sm font-bold text-white leading-tight group-hover:text-[#39ff14] transition-colors">
              {product.shortName}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs text-zinc-400 font-mono">{product.rating}</span>
            <span className="text-[10px] text-zinc-600">({product.reviewCount})</span>
          </div>
        </div>

        <p className="text-[10px] text-zinc-500 mb-3 truncate">
          Fits: {product.fitment}
        </p>

        {/* Pricing row */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#1e1e1e]">
          <div className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-[#39ff14]" />
            <span className="text-sm font-black text-white">${product.filePrice}</span>
            <span className="text-[10px] text-zinc-600">file</span>
          </div>
          {product.printedPrice && (
            <div className="flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5 text-[#00d4ff]" />
              <span className="text-sm font-black text-white">${product.printedPrice}</span>
              <span className="text-[10px] text-zinc-600">printed</span>
            </div>
          )}
          {product.finishedAvailable && (
            <div className="flex items-center gap-1.5 ml-auto">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-amber-400 font-semibold">Quote</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
