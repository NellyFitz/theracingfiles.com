import { MessagesSquare, ChevronRight, Pin, Flame, Users, MessageSquare, Plus, Pencil, Trash2 } from 'lucide-react';
import DwsNav from '@/components/DwsNav';

interface SubCategory {
  id: string;
  label: string;
  threads: number;
  posts: number;
}

interface ForumCategory {
  id: string;
  make: string;
  icon: string;
  totalThreads: number;
  totalMembers: number;
  subcategories: SubCategory[];
}

const forumCategories: ForumCategory[] = [
  {
    id: 'miata',
    make: 'Mazda Miata',
    icon: '🏎️',
    totalThreads: 5,
    totalMembers: 3840,
    subcategories: [
      { id: 'miata-na', label: 'NA (1989–1997)', threads: 2, posts: 65 },
      { id: 'miata-nb', label: 'NB (1998–2005)', threads: 1, posts: 17 },
      { id: 'miata-nc', label: 'NC (2006–2015)', threads: 0, posts: 0 },
      { id: 'miata-nd', label: 'ND (2016–present)', threads: 1, posts: 8 },
      { id: 'miata-gen', label: 'General / All Miatas', threads: 1, posts: 31 },
    ],
  },
  {
    id: 'skyline',
    make: 'Nissan Skyline',
    icon: '🔥',
    totalThreads: 4,
    totalMembers: 2190,
    subcategories: [
      { id: 'sky-r32', label: 'R32 (1989–1994)', threads: 2, posts: 77 },
      { id: 'sky-r33', label: 'R33 (1993–1998)', threads: 1, posts: 6 },
      { id: 'sky-r34', label: 'R34 (1998–2002)', threads: 1, posts: 11 },
    ],
  },
  {
    id: 'supra',
    make: 'Toyota Supra',
    icon: '⚡',
    totalThreads: 3,
    totalMembers: 1760,
    subcategories: [
      { id: 'supra-a60', label: 'A60 (1981–1986)', threads: 0, posts: 0 },
      { id: 'supra-a70', label: 'A70 (1986–1992)', threads: 0, posts: 0 },
      { id: 'supra-a80', label: 'A80 (1993–2002)', threads: 2, posts: 51 },
      { id: 'supra-a90', label: 'A90 (2019–present)', threads: 1, posts: 9 },
    ],
  },
  {
    id: 's2000',
    make: 'Honda S2000',
    icon: '🏁',
    totalThreads: 3,
    totalMembers: 1320,
    subcategories: [
      { id: 's2k-ap1', label: 'AP1 (1999–2003)', threads: 2, posts: 51 },
      { id: 's2k-ap2', label: 'AP2 (2004–2009)', threads: 1, posts: 7 },
      { id: 's2k-gen', label: 'General / Both', threads: 0, posts: 0 },
    ],
  },
  {
    id: 'ducati',
    make: 'Ducati',
    icon: '🏍️',
    totalThreads: 3,
    totalMembers: 980,
    subcategories: [
      { id: 'duc-monster', label: 'Monster', threads: 1, posts: 33 },
      { id: 'duc-panigale', label: 'Panigale', threads: 1, posts: 18 },
      { id: 'duc-916', label: '916 / 996 / 998', threads: 1, posts: 12 },
      { id: 'duc-hyper', label: 'Hypermotard', threads: 0, posts: 0 },
      { id: 'duc-scrambler', label: 'Scrambler', threads: 0, posts: 0 },
    ],
  },
  {
    id: 'subaru',
    make: 'Subaru',
    icon: '🌲',
    totalThreads: 4,
    totalMembers: 2450,
    subcategories: [
      { id: 'sub-wrx-gc', label: 'WRX GC (1992–2001)', threads: 0, posts: 0 },
      { id: 'sub-wrx-gd', label: 'WRX GD (2002–2007)', threads: 1, posts: 44 },
      { id: 'sub-wrx-va', label: 'WRX/STI VA (2015–2021)', threads: 1, posts: 16 },
      { id: 'sub-brz', label: 'BRZ', threads: 1, posts: 21 },
      { id: 'sub-gen', label: 'General / EJ Engine', threads: 1, posts: 9 },
    ],
  },
];

const totalThreads = forumCategories.reduce((s, f) => s + f.totalThreads, 0);
const totalMembers = forumCategories.reduce((s, f) => s + f.totalMembers, 0);
const totalSubcats = forumCategories.reduce((s, f) => s + f.subcategories.length, 0);

export default function AdminForumPage() {
  return (
    <>
      <DwsNav />
      <main className="min-h-screen bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Page header */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center">
                <MessagesSquare className="w-5 h-5 text-[#E8000D]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Forum Management</h1>
                <p className="text-xs text-zinc-500 mt-0.5">Manage categories, subcategories, and pinned threads</p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-[#E8000D] hover:bg-[#c0000b] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Forum Category
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Forum Categories', value: forumCategories.length, icon: MessagesSquare },
              { label: 'Subcategories', value: totalSubcats, icon: ChevronRight },
              { label: 'Total Threads', value: totalThreads, icon: MessageSquare },
              { label: 'Total Members', value: totalMembers.toLocaleString(), icon: Users },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                <Icon className="w-4 h-4 text-[#E8000D] mb-3" />
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Forum categories */}
          <div className="space-y-5">
            {forumCategories.map((forum) => (
              <div key={forum.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">

                {/* Category header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#111] border-b border-[#2a2a2a]">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{forum.icon}</span>
                    <div>
                      <h2 className="text-sm font-black text-white">{forum.make}</h2>
                      <div className="flex items-center gap-4 mt-0.5 text-[10px] text-zinc-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {forum.totalThreads} threads
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {forum.totalMembers.toLocaleString()} members
                        </span>
                        <span className="flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" /> {forum.subcategories.length} subcategories
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white border border-[#2a2a2a] hover:border-[#3a3a3a] px-3 py-1.5 rounded-lg transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add Sub
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white border border-[#2a2a2a] hover:border-[#3a3a3a] px-3 py-1.5 rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-red-500/60 hover:text-red-400 border border-[#2a2a2a] hover:border-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

                {/* Subcategories table */}
                <div className="divide-y divide-[#1e1e1e]">
                  {/* Table head */}
                  <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    <span className="col-span-6">Subcategory</span>
                    <span className="col-span-2 text-center">Threads</span>
                    <span className="col-span-2 text-center">Posts</span>
                    <span className="col-span-2 text-right">Actions</span>
                  </div>

                  {forum.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="grid grid-cols-12 items-center px-6 py-3.5 hover:bg-[#181818] transition-colors"
                    >
                      {/* Label */}
                      <div className="col-span-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E8000D]/40 shrink-0" />
                        <span className="text-sm text-zinc-300">{sub.label}</span>
                        {sub.threads === 0 && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-700 bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                            Empty
                          </span>
                        )}
                      </div>

                      {/* Threads */}
                      <div className="col-span-2 text-center">
                        <span className={`text-sm font-bold ${sub.threads > 0 ? 'text-white' : 'text-zinc-700'}`}>
                          {sub.threads}
                        </span>
                      </div>

                      {/* Posts */}
                      <div className="col-span-2 text-center">
                        <span className={`text-sm font-bold ${sub.posts > 0 ? 'text-white' : 'text-zinc-700'}`}>
                          {sub.posts}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <button className="text-zinc-600 hover:text-white transition-colors" title="Edit subcategory">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-zinc-600 hover:text-red-400 transition-colors" title="Delete subcategory">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
