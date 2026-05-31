import Link from 'next/link';
import Image from 'next/image';
import { GitBranch, Send, Camera } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#111] bg-[#050505] mt-auto">
      <div className="h-px bg-gradient-to-r from-[#E8000D] via-[#E8000D]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <Image src="/rf-logo.png" alt="The Racing Files" width={36} height={36} className="object-contain" />
              <span className="font-black tracking-tight text-white text-base uppercase" style={{ letterSpacing: '-0.01em' }}>
                The Racing <span className="text-[#E8000D]">Files</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-600 leading-relaxed max-w-[200px] mb-5">
              The digital parts bin for enthusiast vehicles. Download, print, or order.
            </p>
            <div className="flex gap-2">
              {[GitBranch, Send, Camera].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-7 h-7 border border-[#1e1e1e] flex items-center justify-center text-zinc-600 hover:text-[#E8000D] hover:border-[#E8000D]/40 transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-5">Marketplace</h4>
            <ul className="space-y-3">
              {[['Parts Marketplace','/browse'],['Featured Drops','/browse'],['New Arrivals','/browse'],['Request a Part','/request']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-xs text-zinc-600 hover:text-white transition-colors uppercase tracking-wide">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Creators */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-5">Creators</h4>
            <ul className="space-y-3">
              {[['Sell Your Designs','/creator'],['Creator Program','/creator'],['Fulfillment','/creator'],['Creator Docs','/creator']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-xs text-zinc-600 hover:text-white transition-colors uppercase tracking-wide">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-5">Company</h4>
            <ul className="space-y-3">
              {[['About','/about'],['Blog','#'],['Privacy','#'],['Terms','#']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-xs text-zinc-600 hover:text-white transition-colors uppercase tracking-wide">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#111] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-zinc-700 uppercase tracking-widest">
            © 2025 The Racing Files. All rights reserved.
          </p>
          <p className="text-[10px] text-zinc-700 text-center uppercase tracking-wide">
            STL files for personal use only. Printed part resale subject to creator licensing.
          </p>
        </div>
      </div>
    </footer>
  );
}
