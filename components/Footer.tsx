import Link from 'next/link';
import { Zap, GitBranch, Send, Camera } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#1e1e1e] bg-[#090909] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#39ff14] rounded flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#0d0d0d]" fill="currentColor" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Print<span className="text-[#39ff14]">Shift</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-[200px]">
              The digital parts bin for enthusiast vehicles. Download, print, or order.
            </p>
            <div className="flex gap-3 mt-4">
              {[GitBranch, Send, Camera].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded border border-[#2a2a2a] flex items-center justify-center text-zinc-500 hover:text-[#39ff14] hover:border-[#39ff14] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Marketplace</h4>
            <ul className="space-y-2.5">
              {[
                ['Parts Marketplace', '/browse'],
                ['Featured Drops', '/browse'],
                ['New Arrivals', '/browse'],
                ['Request a Part', '/request'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-zinc-500 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Creators */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Creators</h4>
            <ul className="space-y-2.5">
              {[
                ['Sell Your Designs', '/creator'],
                ['Creator Program', '/creator'],
                ['Fulfillment', '/creator'],
                ['Creator Docs', '/creator'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-zinc-500 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                ['About', '/about'],
                ['Blog', '#'],
                ['Privacy', '#'],
                ['Terms', '#'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-zinc-500 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1e1e1e] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            © 2025 PrintShift. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600 text-center">
            STL files are for personal use only. Resale of printed parts may be subject to creator licensing.
          </p>
        </div>
      </div>
    </footer>
  );
}
