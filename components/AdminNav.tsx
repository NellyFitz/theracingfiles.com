'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, FileBox, Users } from 'lucide-react';

const links = [
  { href: '/admin', label: 'Scans', icon: FileBox },
  { href: '/admin/accounts', label: 'Accounts', icon: Users },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#39ff14]" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#39ff14]">Admin Panel</p>
          </div>
          <nav className="flex gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-[#39ff14]/10 text-[#39ff14]'
                      : 'text-zinc-500 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
