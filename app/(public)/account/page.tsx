'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Download, ShoppingBag, Wrench, ArrowRight, Loader2,
  FileDown, Printer, Package, Settings, Mail, MapPin, Star, CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Profile {
  first_name: string | null;
  last_name: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  role: string;
}

interface Purchase {
  id: string;
  submission_id: string | null;
  product_name: string;
  tier: 'file' | 'printed' | 'finished';
  price_paid: number;
  created_at: string;
  // joined from part_submissions
  stl_url?: string | null;
  threemf_url?: string | null;
  step_url?: string | null;
}

const tierIcon = { file: FileDown, printed: Printer, finished: Wrench };
const tierLabel = { file: 'Digital File', printed: 'Pre-Printed', finished: 'Fully Finished' };
const tierColor = { file: '#E8000D', printed: '#00d4ff', finished: '#ffa500' };

function DownloadBtn({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      download
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 bg-[#E8000D]/10 hover:bg-[#E8000D]/20 border border-[#E8000D]/30 text-[#E8000D] text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors"
    >
      <Download className="w-3 h-3" /> {label}
    </a>
  );
}

type Tab = 'overview' | 'downloads' | 'profile' | 'creator';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  // Profile edit state
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editZip, setEditZip] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setsaveError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/creator/login'); return; }
      setUser(user);

      const [{ data: prof }, { data: purch }] = await Promise.all([
        supabase.from('profiles').select('first_name,last_name,address_line1,city,state,zip,role').eq('id', user.id).single(),
        supabase
          .from('user_purchases')
          .select('*, part_submissions(stl_url, threemf_url, step_url)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      setProfile(prof ?? null);
      setEditFirstName(prof?.first_name ?? '');
      setEditLastName(prof?.last_name ?? '');
      setEditAddress(prof?.address_line1 ?? '');
      setEditCity(prof?.city ?? '');
      setEditState(prof?.state ?? '');
      setEditZip(prof?.zip ?? '');
      setEditEmail(user.email ?? '');
      // Flatten joined part_submissions file URLs into each purchase row
      const flat = (purch ?? []).map((p: any) => ({
        ...p,
        stl_url: p.part_submissions?.stl_url ?? null,
        threemf_url: p.part_submissions?.threemf_url ?? null,
        step_url: p.part_submissions?.step_url ?? null,
      }));
      setPurchases(flat);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : user?.email ?? '';

  const fileDownloads = purchases.filter((p) => p.tier === 'file');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'downloads', label: `Downloads (${fileDownloads.length})`, icon: <Download className="w-3.5 h-3.5" /> },
    { id: 'profile', label: 'Profile', icon: <Settings className="w-3.5 h-3.5" /> },
    { id: 'creator', label: 'Become a Creator', icon: <Wrench className="w-3.5 h-3.5" /> },
  ];

  return (
    <main className="min-h-screen">

      {/* Header */}
      <section className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-700/20 border border-zinc-700/30 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-zinc-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 border border-zinc-700/40 px-2 py-0.5 rounded">
                  Member
                </span>
              </div>
              <h1 className="text-2xl font-black text-white leading-tight">{displayName}</h1>
              <p className="text-xs text-zinc-500 mt-0.5">{user?.email}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 mt-6">
            <div>
              <p className="text-xl font-black text-white">{purchases.length}</p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Orders</p>
            </div>
            <div className="w-px bg-[#1e1e1e]" />
            <div>
              <p className="text-xl font-black text-white">{fileDownloads.length}</p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Downloads</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-[#E8000D] text-white'
                    : 'border-transparent text-zinc-600 hover:text-zinc-400'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="space-y-5">

            {/* Quick cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <button
                onClick={() => setTab('downloads')}
                className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5 text-left hover:border-zinc-600 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center">
                    <FileDown className="w-5 h-5 text-[#E8000D]" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors" />
                </div>
                <p className="text-2xl font-black text-white">{fileDownloads.length}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Digital Files</p>
              </button>

              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-5 h-5 text-[#00d4ff]" />
                </div>
                <p className="text-2xl font-black text-white">{purchases.length}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Total Orders</p>
              </div>

            </div>

            {/* Recent purchases */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Recent Purchases</h2>
                {purchases.length > 3 && (
                  <button onClick={() => setTab('downloads')} className="text-xs text-[#E8000D] hover:underline">
                    View all
                  </button>
                )}
              </div>
              {purchases.length === 0 ? (
                <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-8 text-center">
                  <Package className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No purchases yet.</p>
                  <Link href="/browse" className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 text-xs rounded-xl mt-4">
                    Browse Marketplace <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {purchases.slice(0, 3).map((p) => {
                    const Icon = tierIcon[p.tier];
                    const color = tierColor[p.tier];
                    return (
                      <div key={p.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.product_name}</p>
                          <p className="text-[10px] text-zinc-600">{tierLabel[p.tier]} · {new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm font-black text-white shrink-0">${p.price_paid.toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Become a creator CTA */}
            <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#0d0d0d] p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#E8000D]/10 border border-[#E8000D]/20 flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5 text-[#E8000D]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-white mb-1">Want to sell parts?</p>
                  <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                    Apply for a Creator account to upload and sell 3D printable parts on the marketplace. Applications are reviewed within 48 hours.
                  </p>
                  <Link href="/creator/signup?type=creator" className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 text-xs rounded-xl">
                    Apply to Become a Creator <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Downloads ── */}
        {tab === 'downloads' && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">My Downloads</h2>
            {fileDownloads.length === 0 ? (
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-10 text-center">
                <FileDown className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500 mb-4">No digital files purchased yet.</p>
                <Link href="/browse" className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 text-xs rounded-xl">
                  Browse Marketplace <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((p) => {
                  const Icon = tierIcon[p.tier];
                  const color = tierColor[p.tier];
                  const hasFiles = p.stl_url || p.threemf_url || p.step_url;
                  return (
                    <div key={p.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{p.product_name}</p>
                          <p className="text-[10px] text-zinc-600">{tierLabel[p.tier]} · Purchased {new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm font-black text-white shrink-0">${p.price_paid.toFixed(2)}</p>
                      </div>
                      {hasFiles ? (
                        <div className="flex flex-wrap gap-2">
                          {p.stl_url && <DownloadBtn url={p.stl_url} label="STL" />}
                          {p.threemf_url && <DownloadBtn url={p.threemf_url} label="3MF" />}
                          {p.step_url && <DownloadBtn url={p.step_url} label="STEP" />}
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-600">
                          {p.tier === 'file' ? 'Files not yet attached by creator.' : 'Physical order — check your email for updates.'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Profile ── */}
        {tab === 'profile' && (
          <div className="max-w-lg space-y-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">My Profile</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                setsaveError('');
                setSaveSuccess(false);
                const supabase = createClient();

                // Update email if changed
                if (editEmail !== user?.email) {
                  const { error } = await supabase.auth.updateUser({ email: editEmail });
                  if (error) { setsaveError(error.message); setSaving(false); return; }
                }

                // Upsert profile row
                const { error } = await supabase.from('profiles').upsert({
                  id: user!.id,
                  first_name: editFirstName,
                  last_name: editLastName,
                  address_line1: editAddress,
                  city: editCity,
                  state: editState,
                  zip: editZip,
                  role: profile?.role ?? 'member',
                });
                if (error) { setsaveError(error.message); setSaving(false); return; }

                setProfile((p) => p ? { ...p, first_name: editFirstName, last_name: editLastName, address_line1: editAddress, city: editCity, state: editState, zip: editZip } : p);
                setSaveSuccess(true);
                setSaving(false);
                setTimeout(() => setSaveSuccess(false), 3000);
              }}
              className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 space-y-4"
            >
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Reyes"
                    className="w-full rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  <Mail className="w-3 h-3 inline mr-1" />Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm"
                />
                {editEmail !== user?.email && (
                  <p className="text-[10px] text-amber-400 mt-1">A confirmation link will be sent to your new email.</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  <MapPin className="w-3 h-3 inline mr-1" />Street Address
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="123 Main St"
                  className="w-full rounded-lg px-3 py-2.5 text-sm"
                />
              </div>

              {/* City / State / ZIP */}
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">City</label>
                  <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="Austin" className="w-full rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">State</label>
                  <input type="text" value={editState} onChange={(e) => setEditState(e.target.value)} placeholder="TX" maxLength={2} className="w-full rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">ZIP</label>
                  <input type="text" value={editZip} onChange={(e) => setEditZip(e.target.value)} placeholder="78701" className="w-full rounded-lg px-3 py-2.5 text-sm" />
                </div>
              </div>

              {/* Account type (read-only) */}
              <div className="flex items-center gap-2 pt-1">
                <Star className="w-3.5 h-3.5 text-zinc-600" />
                <p className="text-[11px] text-zinc-600">Account type: <span className="text-zinc-400 capitalize">{profile?.role ?? 'Member'}</span></p>
              </div>

              {saveError && (
                <p className="text-xs text-[#E8000D]">{saveError}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full btn-primary py-3 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : saveSuccess
                  ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                  : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* ── Become a Creator ── */}
        {tab === 'creator' && (
          <div className="max-w-lg space-y-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Become a Creator</h2>

            {/* What you get */}
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 space-y-4">
              <p className="text-sm font-black text-white">What Creator accounts unlock</p>
              {[
                { icon: <Wrench className="w-4 h-4 text-[#E8000D]" />, title: 'Upload & sell parts', desc: 'List STL, 3MF, and STEP files on the marketplace and earn from every sale.' },
                { icon: <Package className="w-4 h-4 text-[#00d4ff]" />, title: 'Creator dashboard', desc: 'Full analytics, submission management, and earnings overview.' },
                { icon: <Star className="w-4 h-4 text-amber-400" />, title: 'Creator profile page', desc: 'A public profile showcasing all your parts and vehicle specialties.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6">
              <p className="text-sm font-black text-white mb-4">How it works</p>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Fill out the creator application with your handle, bio, and vehicle specialties.' },
                  { step: '2', text: 'Our team reviews your application within 48 hours.' },
                  { step: '3', text: 'Once approved your account is upgraded and you can start uploading.' },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#E8000D]/10 border border-[#E8000D]/30 flex items-center justify-center shrink-0 text-[10px] font-black text-[#E8000D]">
                      {s.step}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed pt-0.5">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/creator/signup?type=creator"
              className="w-full btn-primary py-3.5 text-sm rounded-xl flex items-center justify-center gap-2"
            >
              Apply to Become a Creator <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
