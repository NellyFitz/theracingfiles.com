'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquare, Search, ChevronRight, Flame,
  Clock, Users, Pin, ArrowRight, Zap,
} from 'lucide-react';

interface Thread {
  id: string;
  title: string;
  author: string;
  replies: number;
  views: number;
  lastActivity: string;
  pinned?: boolean;
  hot?: boolean;
  tag: string;
}

interface Forum {
  id: string;
  make: string;
  models: string[];
  icon: string;
  threads: Thread[];
  memberCount: number;
  color: string;
}

const forums: Forum[] = [
  {
    id: 'miata',
    make: 'Mazda Miata',
    models: ['NA (1989–1997)', 'NB (1998–2005)', 'NC (2006–2015)', 'ND (2016–present)'],
    icon: '🏎️',
    memberCount: 3840,
    color: '#E8000D',
    threads: [
      { id: 'm1', title: 'NA hardtop latch rattle fix — printed bracket finally works', author: 'Carlos_M', replies: 42, views: 1820, lastActivity: '2h ago', pinned: true, tag: 'NA' },
      { id: 'm2', title: 'Best filament for underhood parts? ASA vs. PA-CF', author: 'Jess_T', replies: 31, views: 940, lastActivity: '5h ago', hot: true, tag: 'General' },
      { id: 'm3', title: 'NB headlight trim ring — anyone have fitment data?', author: 'Drift_Andre', replies: 17, views: 610, lastActivity: '1d ago', tag: 'NB' },
      { id: 'm4', title: 'ND soft top drain clip replacement print settings', author: 'Miata_UK', replies: 8, views: 290, lastActivity: '2d ago', tag: 'ND' },
      { id: 'm5', title: 'Trunk weatherstrip retainer — NA dimensions needed', author: 'Garage_Builds', replies: 23, views: 780, lastActivity: '3d ago', tag: 'NA' },
    ],
  },
  {
    id: 'skyline',
    make: 'Nissan Skyline',
    models: ['R32 (1989–1994)', 'R33 (1993–1998)', 'R34 (1998–2002)'],
    icon: '🔥',
    memberCount: 2190,
    color: '#E8000D',
    threads: [
      { id: 's1', title: 'R32 interior trim clips — full set modeled and uploaded', author: 'GTR_Yoshi', replies: 58, views: 2400, lastActivity: '1h ago', pinned: true, hot: true, tag: 'R32' },
      { id: 's2', title: 'RB26 coolant sensor bung cover — anyone printed this?', author: 'Boost_NZ', replies: 19, views: 730, lastActivity: '6h ago', tag: 'R32' },
      { id: 's3', title: 'R34 ATTESA harness bracket cracked — replacement options?', author: 'HKS_Fan', replies: 11, views: 405, lastActivity: '1d ago', tag: 'R34' },
      { id: 's4', title: 'R33 glovebox hinge pin — nylon or PETG?', author: 'JDM_Import', replies: 6, views: 200, lastActivity: '4d ago', tag: 'R33' },
    ],
  },
  {
    id: 'supra',
    make: 'Toyota Supra',
    models: ['A60 (1981–1986)', 'A70 (1986–1992)', 'A80 (1993–2002)', 'A90 (2019–present)'],
    icon: '⚡',
    memberCount: 1760,
    color: '#E8000D',
    threads: [
      { id: 'su1', title: 'A80 pop-up headlight motor mount — printed fix that actually holds', author: 'Turbo_Kyle', replies: 37, views: 1560, lastActivity: '3h ago', hot: true, tag: 'A80' },
      { id: 'su2', title: '2JZ cam cover breather bung replacement — dimensions?', author: 'BPU_Life', replies: 14, views: 520, lastActivity: '8h ago', tag: 'A80' },
      { id: 'su3', title: 'A90 OEM part integration — using printed adapters', author: 'MKV_Owner', replies: 9, views: 310, lastActivity: '2d ago', tag: 'A90' },
    ],
  },
  {
    id: 's2000',
    make: 'Honda S2000',
    models: ['AP1 (1999–2003)', 'AP2 (2004–2009)'],
    icon: '🏁',
    memberCount: 1320,
    color: '#E8000D',
    threads: [
      { id: 'h1', title: 'Soft top latch mechanism — full rebuild with printed parts', author: 'VTEC_Dave', replies: 29, views: 1100, lastActivity: '4h ago', pinned: true, tag: 'AP1' },
      { id: 'h2', title: 'F20C air box resonator delete — does the print hold at high RPM?', author: 'Track_S2k', replies: 22, views: 840, lastActivity: '1d ago', hot: true, tag: 'General' },
      { id: 'h3', title: 'AP2 hardtop headliner clip replacements', author: 'S2k_Forum', replies: 7, views: 195, lastActivity: '3d ago', tag: 'AP2' },
    ],
  },
  {
    id: 'ducati',
    make: 'Ducati',
    models: ['Monster', 'Panigale', '916/996/998', 'Hypermotard', 'Scrambler'],
    icon: '🏍️',
    memberCount: 980,
    color: '#E8000D',
    threads: [
      { id: 'd1', title: 'Monster 696 fairing bracket — cracked OEM? Print this instead', author: 'Moto_Lorenzo', replies: 33, views: 1280, lastActivity: '2h ago', hot: true, tag: 'Monster' },
      { id: 'd2', title: 'Panigale V4 front fairing clip set — ABS filament test results', author: 'Superbike_IT', replies: 18, views: 670, lastActivity: '1d ago', tag: 'Panigale' },
      { id: 'd3', title: '916 belly pan fastener replacement — anyone have specs?', author: 'Ducatisti', replies: 12, views: 440, lastActivity: '2d ago', tag: '916' },
    ],
  },
  {
    id: 'subaru',
    make: 'Subaru',
    models: ['WRX/STI (GC/GD/GE/VA)', 'BRZ', 'Legacy/Outback', 'Forester'],
    icon: '🌲',
    memberCount: 2450,
    color: '#E8000D',
    threads: [
      { id: 'sub1', title: 'GD WRX intercooler scoop rattle fix — printed spacer works', author: 'WRX_Blue', replies: 44, views: 1740, lastActivity: '1h ago', hot: true, tag: 'WRX' },
      { id: 'sub2', title: 'VA STI rear diffuser end cap replacement', author: 'Prodrive_Fan', replies: 16, views: 590, lastActivity: '7h ago', tag: 'STI' },
      { id: 'sub3', title: 'BRZ interior trim clip set — community model thread', author: 'BRZ_Kai', replies: 21, views: 810, lastActivity: '1d ago', pinned: true, tag: 'BRZ' },
      { id: 'sub4', title: 'EJ engine bay cable guide replacement — which material?', author: 'STI_WA', replies: 9, views: 340, lastActivity: '3d ago', tag: 'General' },
    ],
  },
];

export default function ForumPage() {
  const [search, setSearch] = useState('');
  const [activeForumId, setActiveForumId] = useState<string | null>(null);

  const filteredForums = useMemo(() => {
    if (!search.trim()) return forums;
    const q = search.toLowerCase();
    return forums
      .map((f) => ({
        ...f,
        threads: f.threads.filter(
          (t) => t.title.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q) || t.author.toLowerCase().includes(q)
        ),
      }))
      .filter((f) =>
        f.make.toLowerCase().includes(q) ||
        f.models.some((m) => m.toLowerCase().includes(q)) ||
        f.threads.length > 0
      );
  }, [search]);

  const activeCount = forums.reduce((s, f) => s + f.threads.length, 0);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="relative border-b border-[#1e1e1e] overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#E8000D]/10 border border-[#E8000D]/20 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-3.5 h-3.5 text-[#E8000D]" fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#E8000D]">Community Forum</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Talk shop.<br />
              <span className="text-[#E8000D]">By model.</span>
            </h1>
            <p className="text-zinc-400 leading-relaxed mb-8 max-w-xl">
              Technical discussions, fitment advice, print settings, and part requests — organized by vehicle so you find answers fast.
            </p>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search threads, models, or topics…"
                className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8000D]/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-8">
            {[
              { icon: MessageSquare, label: `${activeCount} threads` },
              { icon: Users, label: `${forums.reduce((s, f) => s + f.memberCount, 0).toLocaleString()} members` },
              { icon: Flame, label: '6 vehicle forums' },
              { icon: Clock, label: 'Updated daily' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-zinc-500">
                <Icon className="w-3.5 h-3.5 text-[#E8000D]" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Sidebar: forum list */}
          <div className="lg:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Vehicle Forums</p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveForumId(null)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm font-semibold ${
                  activeForumId === null ? 'bg-[#E8000D]/10 text-[#E8000D]' : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                }`}
              >
                <span>🌐</span> All Forums
              </button>
              {forums.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveForumId(f.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeForumId === f.id
                      ? 'bg-[#E8000D]/10 text-[#E8000D]'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <span className="text-base">{f.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{f.make}</p>
                    <p className="text-[10px] text-zinc-600">{f.memberCount.toLocaleString()} members</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main: forums + threads */}
          <div className="lg:col-span-3 space-y-6">
            {filteredForums.length === 0 ? (
              <div className="text-center py-20 text-zinc-600">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No threads match your search.</p>
              </div>
            ) : (
              filteredForums
                .filter((f) => !activeForumId || f.id === activeForumId)
                .map((forum) => (
                  <div key={forum.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">

                    {/* Forum header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a] bg-[#111]">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{forum.icon}</span>
                        <div>
                          <h2 className="text-sm font-black text-white">{forum.make}</h2>
                          <p className="text-[10px] text-zinc-500">{forum.models.join(' · ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-zinc-600">
                        <span>{forum.threads.length} threads</span>
                        <span>{forum.memberCount.toLocaleString()} members</span>
                      </div>
                    </div>

                    {/* Thread list */}
                    <div className="divide-y divide-[#1e1e1e]">
                      {forum.threads.map((thread) => (
                        <div
                          key={thread.id}
                          className="flex items-start gap-4 px-5 py-4 hover:bg-[#181818] transition-colors cursor-pointer group"
                        >
                          {/* Icon */}
                          <div className="w-8 h-8 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center shrink-0 mt-0.5">
                            {thread.pinned
                              ? <Pin className="w-3.5 h-3.5 text-[#E8000D]" />
                              : thread.hot
                              ? <Flame className="w-3.5 h-3.5 text-orange-400" />
                              : <MessageSquare className="w-3.5 h-3.5 text-zinc-600" />
                            }
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {thread.pinned && (
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#E8000D] bg-[#E8000D]/10 px-1.5 py-0.5 rounded">
                                  Pinned
                                </span>
                              )}
                              {thread.hot && (
                                <span className="text-[9px] font-bold uppercase tracking-widest text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">
                                  Hot
                                </span>
                              )}
                              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 bg-[#1e1e1e] px-1.5 py-0.5 rounded">
                                {thread.tag}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-white group-hover:text-[#E8000D] transition-colors leading-snug">
                              {thread.title}
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-1">
                              by <span className="text-zinc-500">{thread.author}</span> · {thread.lastActivity}
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="shrink-0 text-right hidden sm:block">
                            <p className="text-sm font-bold text-white">{thread.replies}</p>
                            <p className="text-[10px] text-zinc-600">replies</p>
                            <p className="text-[10px] text-zinc-700 mt-0.5">{thread.views.toLocaleString()} views</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Forum footer */}
                    <div className="px-5 py-3 border-t border-[#1e1e1e] flex items-center justify-between">
                      <button className="text-xs text-[#E8000D] hover:text-white transition-colors flex items-center gap-1.5 font-semibold">
                        + New Thread
                      </button>
                      <button
                        onClick={() => setActiveForumId(forum.id)}
                        className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1"
                      >
                        View all <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
