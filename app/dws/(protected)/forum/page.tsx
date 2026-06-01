import { MessagesSquare, ChevronRight, Users, MessageSquare, Plus, Pencil, Trash2 } from 'lucide-react';
import DwsNav from '@/components/DwsNav';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminForumPage() {
  const admin = createAdminClient();

  const [catsRes, secsRes, threadsRes, msgsRes] = await Promise.all([
    admin.from('forum_categories').select('*').order('sort_order'),
    admin.from('forum_sections').select('*').order('sort_order'),
    admin.from('forum_threads').select('id, category_id, section_id'),
    admin.from('forum_messages').select('id, thread_id'),
  ]);

  const categories = catsRes.data ?? [];
  const sections = secsRes.data ?? [];
  const threads = threadsRes.data ?? [];
  const messages = msgsRes.data ?? [];

  // Pre-compute counts
  const threadsBySectionId: Record<string, string[]> = {};
  for (const t of threads) {
    if (t.section_id) {
      (threadsBySectionId[t.section_id] ??= []).push(t.id);
    }
  }
  const messagesByThreadId: Record<string, number> = {};
  for (const m of messages) {
    messagesByThreadId[m.thread_id] = (messagesByThreadId[m.thread_id] ?? 0) + 1;
  }

  const forumData = categories.map((cat) => {
    const catSections = sections.filter((s) => s.category_id === cat.id);
    const catThreads = threads.filter((t) => t.category_id === cat.id);
    const subcategories = catSections.map((sec) => {
      const secThreadIds = threadsBySectionId[sec.id] ?? [];
      const posts = secThreadIds.reduce((sum, tid) => sum + (messagesByThreadId[tid] ?? 0), 0);
      return { id: sec.id, label: sec.label, threads: secThreadIds.length, posts };
    });
    return {
      id: cat.id,
      make: cat.make,
      icon: cat.icon,
      totalThreads: catThreads.length,
      totalMembers: cat.member_count,
      subcategories,
    };
  });

  const totalThreads = threads.length;
  const totalMembers = categories.reduce((s, c) => s + c.member_count, 0);
  const totalSubcats = sections.length;

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
              { label: 'Forum Categories', value: categories.length, icon: MessagesSquare },
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
            {forumData.map((forum) => (
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
                      <div className="col-span-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E8000D]/40 shrink-0" />
                        <span className="text-sm text-zinc-300">{sub.label}</span>
                        {sub.threads === 0 && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-700 bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                            Empty
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 text-center">
                        <span className={`text-sm font-bold ${sub.threads > 0 ? 'text-white' : 'text-zinc-700'}`}>
                          {sub.threads}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className={`text-sm font-bold ${sub.posts > 0 ? 'text-white' : 'text-zinc-700'}`}>
                          {sub.posts}
                        </span>
                      </div>
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
