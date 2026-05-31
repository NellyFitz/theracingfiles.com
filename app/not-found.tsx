import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-8xl font-black text-[#39ff14] mb-4 font-mono">404</p>
      <h1 className="text-2xl font-black text-white mb-3">Part Not Found</h1>
      <p className="text-zinc-500 text-sm mb-8 max-w-sm">
        This part doesn't exist in our library — yet. Submit a request and we'll find it.
      </p>
      <div className="flex gap-4">
        <Link href="/browse" className="btn-primary px-6 py-3 text-sm rounded-lg">
          Parts Marketplace
        </Link>
        <Link href="/request" className="btn-outline px-6 py-3 text-sm rounded-lg flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Request a Part
        </Link>
      </div>
    </div>
  );
}
