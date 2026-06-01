import { Database } from 'lucide-react';
import DwsNav from '@/components/DwsNav';

export default function AssignDataPage() {
  return (
    <>
      <DwsNav />
      <main className="min-h-screen bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-[#E8000D]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Assign Data</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Link scans and parts to creator accounts</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Assign Scan to Creator */}
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6">
              <h2 className="text-sm font-bold text-white mb-1">Assign Scan to Creator</h2>
              <p className="text-xs text-zinc-500 mb-6">Link a submitted vehicle scan to a creator account</p>
              <form className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Scan / Submission ID</label>
                  <input
                    type="text"
                    placeholder="e.g. sub_abc123"
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8000D]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Creator Account</label>
                  <input
                    type="text"
                    placeholder="Username or email"
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8000D]/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#E8000D] hover:bg-[#c0000b] text-white text-sm font-bold py-2.5 rounded-lg transition-colors"
                >
                  Assign Scan
                </button>
              </form>
            </div>

            {/* Assign Part to Vehicle */}
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6">
              <h2 className="text-sm font-bold text-white mb-1">Assign Part to Vehicle</h2>
              <p className="text-xs text-zinc-500 mb-6">Map a marketplace part to a specific vehicle fitment</p>
              <form className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Part ID</label>
                  <input
                    type="text"
                    placeholder="e.g. part_xyz456"
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8000D]/50"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Year</label>
                    <input
                      type="text"
                      placeholder="2004"
                      className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8000D]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Make</label>
                    <input
                      type="text"
                      placeholder="Mazda"
                      className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8000D]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Model</label>
                    <input
                      type="text"
                      placeholder="Miata"
                      className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E8000D]/50"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#E8000D] hover:bg-[#c0000b] text-white text-sm font-bold py-2.5 rounded-lg transition-colors"
                >
                  Assign Fitment
                </button>
              </form>
            </div>

            {/* Recent Assignments */}
            <div className="lg:col-span-2 rounded-xl border border-[#2a2a2a] bg-[#141414] p-6">
              <h2 className="text-sm font-bold text-white mb-1">Recent Assignments</h2>
              <p className="text-xs text-zinc-500 mb-6">History of data assignments made by admins</p>
              <div className="text-center py-12 text-zinc-600 text-sm">
                No assignments yet — use the forms above to link scans and parts.
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
