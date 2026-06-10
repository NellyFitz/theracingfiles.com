'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Download, ShoppingBag, Wrench, ArrowRight, Loader2,
  FileDown, Printer, Package, Settings, Mail, MapPin, Star, CheckCircle2, Bookmark,
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
  avatar_url: string | null;
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

type Tab = 'overview' | 'downloads' | 'saved' | 'profile' | 'creator';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [savedParts, setSavedParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
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
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/creator/login'); return; }
      setUser(user);

      const [{ data: prof }, { data: purch }, { data: saved }] = await Promise.all([
        supabase.from('profiles').select('first_name,last_name,address_line1,city,state,zip,role,avatar_url').eq('id', user.id).single(),
        supabase
          .from('user_purchases')
          .select('*, part_submissions(stl_url, threemf_url, step_url)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_saved_parts')
          .select('id, submission_id, created_at, part_submissions(id, name, category, make, model, file_price, images, slug:id)')
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
      setSavedParts(saved ?? []);
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
    { id: 'saved', label: `Saved (${savedParts.length})`, icon: <Bookmark className="w-3.5 h-3.5" /> },
    { id: 'profile', label: 'Profile', icon: <Settings className="w-3.5 h-3.5" /> },
    { id: 'creator', label: 'Become a Creator', icon: <Wrench className="w-3.5 h-3.5" /> },
  ];

  return (
    <main className="min-h-screen">

      {/* Header */}
      <section className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-700/20 border border-zinc-700/30 flex items-center justify-center shrink-0 overflow-hidden">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                : <User className="w-8 h-8 text-zinc-400" />}
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
                  <Link href="/creator/apply" className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 text-xs rounded-xl">
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

        {/* ── Saved ── */}
        {tab === 'saved' && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Saved Parts</h2>
            {savedParts.length === 0 ? (
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-10 text-center">
                <Bookmark className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500 mb-4">No saved parts yet.</p>
                <Link href="/browse" className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 text-xs rounded-xl">
                  Browse Marketplace <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedParts.map((s) => {
                  const part = s.part_submissions;
                  if (!part) return null;
                  const image = part.images?.[0] ?? null;
                  return (
                    <div key={s.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden group">
                      {/* Image */}
                      <div className="relative h-36 bg-[#1a1a1a] overflow-hidden">
                        {image
                          ? <img src={image} alt={part.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Printer className="w-8 h-8 text-zinc-700" /></div>}
                        {/* Unsave button */}
                        <button
                          onClick={async () => {
                            const supabase = createClient();
                            await supabase.from('user_saved_parts').delete().eq('id', s.id);
                            setSavedParts((prev) => prev.filter((p) => p.id !== s.id));
                          }}
                          title="Remove from saved"
                          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-[#E8000D] border border-[#E8000D] flex items-center justify-center"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-white fill-white" />
                        </button>
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{part.category}</p>
                        <Link
                          href={`/products/${part.id}`}
                          className="text-sm font-bold text-white group-hover:text-[#E8000D] transition-colors line-clamp-2 block mb-2"
                        >
                          {part.name}
                        </Link>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-zinc-500">{part.make} {part.model}</p>
                          <p className="text-sm font-black text-white">${part.file_price}</p>
                        </div>
                      </div>
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
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">My Profile</h2>
              {!editMode && (
                <button
                  onClick={() => {
                    setEditFirstName(profile?.first_name ?? '');
                    setEditLastName(profile?.last_name ?? '');
                    setEditAddress(profile?.address_line1 ?? '');
                    setEditCity(profile?.city ?? '');
                    setEditState(profile?.state ?? '');
                    setEditZip(profile?.zip ?? '');
                    setEditEmail(user?.email ?? '');
                    setsaveError('');
                    setEditMode(true);
                  }}
                  className="text-xs font-bold text-zinc-400 hover:text-white border border-[#2a2a2a] hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {/* ── Avatar upload (always visible) ── */}
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-zinc-700/20 border border-zinc-700/30 flex items-center justify-center shrink-0 overflow-hidden">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  : <User className="w-8 h-8 text-zinc-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white mb-0.5">Profile Picture</p>
                <p className="text-[11px] text-zinc-500 mb-3">JPG or PNG, max 2 MB</p>
                <label className={`inline-flex items-center gap-2 border border-[#2a2a2a] hover:border-zinc-600 text-zinc-400 hover:text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer ${avatarUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {avatarUploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</> : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !user) return;
                      setAvatarUploading(true);
                      const supabase = createClient();
                      const ext = file.name.split('.').pop();
                      const path = `${user.id}/avatar.${ext}`;
                      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
                      if (!upErr) {
                        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
                        const url = `${data.publicUrl}?t=${Date.now()}`;
                        await supabase.from('profiles').upsert({ id: user.id, avatar_url: url, role: profile?.role ?? 'member' });
                        setProfile((p) => p ? { ...p, avatar_url: url } : p);
                      }
                      setAvatarUploading(false);
                      e.target.value = '';
                    }}
                  />
                </label>
                {profile?.avatar_url && (
                  <button
                    onClick={async () => {
                      const supabase = createClient();
                      await supabase.from('profiles').upsert({ id: user!.id, avatar_url: null, role: profile?.role ?? 'member' });
                      setProfile((p) => p ? { ...p, avatar_url: null } : p);
                    }}
                    className="ml-2 text-[11px] text-zinc-600 hover:text-[#E8000D] transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* ── Read-only display ── */}
            {!editMode && (
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] divide-y divide-[#1e1e1e]">
                <div className="p-4 flex items-center gap-3">
                  <Mail className="w-4 h-4 text-zinc-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Email</p>
                    <p className="text-sm text-white">{user?.email}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-3">
                  <User className="w-4 h-4 text-zinc-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Name</p>
                    <p className="text-sm text-white">
                      {profile?.first_name
                        ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
                        : <span className="text-zinc-600">Not set</span>}
                    </p>
                  </div>
                </div>
                {(profile?.address_line1 || profile?.city) && (
                  <div className="p-4 flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-zinc-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Address</p>
                      <p className="text-sm text-white">
                        {[profile.address_line1, profile.city, profile.state, profile.zip].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
                <div className="p-4 flex items-center gap-3">
                  <Star className="w-4 h-4 text-zinc-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Account Type</p>
                    <p className="text-sm text-white capitalize">{profile?.role ?? 'Member'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Edit form ── */}
            {editMode && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  setsaveError('');
                  setSaveSuccess(false);
                  const supabase = createClient();

                  if (editEmail !== user?.email) {
                    const { error } = await supabase.auth.updateUser({ email: editEmail });
                    if (error) { setsaveError(error.message); setSaving(false); return; }
                  }

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
                  setEditMode(false);
                }}
                className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">First Name</label>
                    <input type="text" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} placeholder="Alex" className="w-full rounded-lg px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Last Name</label>
                    <input type="text" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} placeholder="Reyes" className="w-full rounded-lg px-3 py-2.5 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm" />
                  {editEmail !== user?.email && (
                    <p className="text-[10px] text-amber-400 mt-1">A confirmation link will be sent to your new email.</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Street Address</label>
                  <input type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="123 Main St" className="w-full rounded-lg px-3 py-2.5 text-sm" />
                </div>

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

                {saveError && <p className="text-xs text-[#E8000D]">{saveError}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setEditMode(false); setsaveError(''); }}
                    className="flex-1 border border-[#2a2a2a] hover:border-zinc-600 text-zinc-400 hover:text-white text-xs font-bold py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 btn-primary py-3 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {saveSuccess && (
              <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Profile updated successfully.
              </div>
            )}
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
              href="/creator/apply"
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
