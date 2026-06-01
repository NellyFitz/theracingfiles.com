'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  MessageSquare, Search, ChevronRight, Flame,
  Clock, Users, Pin, Zap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Thread {
  id: string;
  title: string;
  author_name: string;
  reply_count: number;
  view_count: number;
  last_activity_at: string;
  pinned: boolean;
  hot: boolean;
  tag: string;
}

interface Section {
  id: string;
  label: string;
}

interface Forum {
  id: string;
  make: string;
  sections: Section[];
  icon: string;
  threads: Thread[];
  member_count: number;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ForumPage() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeForumId, setActiveForumId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('forum_categories').select('*').order('sort_order'),
      supabase.from('forum_sections').select('*').order('sort_order'),
      supabase.from('forum_threads').select('*').order('last_activity_at', { ascending: false }),
    ]).then(([cats, secs, threads]) => {
      if (cats.data) {
        const assembled: Forum[] = cats.data.map((cat) => ({
          id: cat.id,
          make: cat.make,
          icon: cat.icon,
          member_count: cat.member_count,
          sections: (secs.data ?? []).filter((s) => s.category_id === cat.id),
          threads: (threads.data ?? []).filter((t) => t.category_id === cat.id),
        }));
        setForums(assembled);
      }
      setLoading(false);
    });
  }, []);

  const filteredForums = useMemo(() => {
    if (!search.trim()) return forums;
    const q = search.toLowerCase();
    return forums
      .map((f) => ({
        ...f,
        threads: f.threads.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.tag.toLowerCase().includes(q) ||
            t.author_name.toLowerCase().includes(q)
        ),
      }))
      .filter(
        (f) =>
          f.make.toLowerCase().includes(q) ||
          f.sections.some((s) => s.label.toLowerCase().includes(q)) ||
          f.threads.length > 0
      );
  }, [search, forums]);

  const totalThreads = forums.reduce((s, f) => s + f.threads.length, 0);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="relative border-b border-[#1e1e1e] overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-5xl">
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
            <div className="relative max-w-3xl">
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
              { icon: MessageSquare, label: `${totalThreads} threads` },
              { icon: Users, label: `${forums.reduce((s, f) => s + f.member_count, 0).toLocaleString()} members` },
              { icon: Flame, label: `${forums.length} vehicle forums` },
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
        {loading ? (
          <div className="flex items-center justify-center py-32 text-zinc-600 text-sm">
            Loading forums…
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">

            {/* Sidebar */}
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
                      <p className="text-[10px] text-zinc-600">{f.member_count.toLocaleString()} members</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main content */}
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
                            <p className="text-[10px] text-zinc-500">{forum.sections.map((s) => s.label).join(' · ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-zinc-600">
                          <span>{forum.threads.length} threads</span>
                          <span>{forum.member_count.toLocaleString()} members</span>
                        </div>
                      </div>

                      {/* Thread list */}
                      <div className="divide-y divide-[#1e1e1e]">
                        {forum.threads.map((thread) => (
                          <div
                            key={thread.id}
                            className="flex items-start gap-4 px-5 py-4 hover:bg-[#181818] transition-colors cursor-pointer group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center shrink-0 mt-0.5">
                              {thread.pinned
                                ? <Pin className="w-3.5 h-3.5 text-[#E8000D]" />
                                : thread.hot
                                ? <Flame className="w-3.5 h-3.5 text-orange-400" />
                                : <MessageSquare className="w-3.5 h-3.5 text-zinc-600" />
                              }
                            </div>

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
                                by <span className="text-zinc-500">{thread.author_name}</span> · {relativeTime(thread.last_activity_at)}
                              </p>
                            </div>

                            <div className="shrink-0 text-right hidden sm:block">
                              <p className="text-sm font-bold text-white">{thread.reply_count}</p>
                              <p className="text-[10px] text-zinc-600">replies</p>
                              <p className="text-[10px] text-zinc-700 mt-0.5">{thread.view_count.toLocaleString()} views</p>
                            </div>
                          </div>
                        ))}
                      </div>

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
        )}
      </div>
    </main>
  );
}
