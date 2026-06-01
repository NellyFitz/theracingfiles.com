'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, FileBox, Users, Database } from 'lucide-react';

const links = [
  { href: '/dws', label: 'Scans', icon: FileBox },
  { href: '/dws/accounts', label: 'Accounts', icon: Users },
  { href: '/dws/assign', label: 'Assign Data', icon: Database },
];

export default function DwsNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#E8000D]" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#E8000D]">Admin Panel</p>
          </div>
          <nav className="flex gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/dws' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-[#E8000D]/10 text-[#E8000D]'
                      : 'text-zinc-500 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <form action="/api/dws-logout" method="POST">
            <button type="submit" className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
