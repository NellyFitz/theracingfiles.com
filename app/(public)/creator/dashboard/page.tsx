'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, FileText, CheckCircle, Clock, XCircle, Printer, DollarSign,
  Store, List, Settings, Loader2, Camera, ImagePlus, LogOut,
  Bookmark, Zap,
} from 'lucide-react';
import DashboardCart from '@/components/DashboardCart';
import SubmissionStatusBadge from '@/components/SubmissionStatusBadge';
import { createClient } from '@/lib/supabase/client';
import type { PartSubmission } from '@/lib/supabase/db-types';

type Tab = 'main' | 'storefront' | 'listings' | 'saved' | 'settings';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CreatorDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('main');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<PartSubmission[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [savedListings, setSavedListings] = useState<any[]>([]);

  // Settings edit state
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editSpecialties, setEditSpecialties] = useState('');
  const [editSoftware, setEditSoftware] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Store front edit state
  const [sfEditMode, setSfEditMode] = useState(false);
  const [sfBio, setSfBio] = useState('');
  const [sfWebsite, setSfWebsite] = useState('');
  const [sfSpecialties, setSfSpecialties] = useState('');
  const [sfAvatarUploading, setSfAvatarUploading] = useState(false);
  const [sfBannerUploading, setSfBannerUploading] = useState(false);
  const [sfSaving, setSfSaving] = useState(false);
  const [sfMsg, setSfMsg] = useState('');

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.push('/creator/login');
    });

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/creator/login'); return; }

      const [
        { data: prof },
        { data: subs },
        { count: followerCount },
        { count: followingCount },
        { data: saved },
      ] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('part_submissions').select('*').eq('creator_id', user.id).order('created_at', { ascending: false }),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
        supabase
          .from('saved_listings')
          .select('*, part_submissions(*, user_profiles(name, handle))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (!prof) { router.push('/account'); return; }

      setProfile(prof);
      setSubmissions((subs ?? []) as PartSubmission[]);
      setFollowers(followerCount ?? 0);
      setFollowing(followingCount ?? 0);
      setSavedListings(saved ?? []);
      setEditName(prof.name ?? '');
      setEditHandle(prof.handle ?? '');
      setEditBio(prof.bio ?? '');
      setEditWebsite(prof.website ?? '');
      setEditSpecialties(prof.vehicle_specialties ?? '');
      setEditSoftware(prof.software ?? '');
      setEditExperience(prof.experience_level ?? '');
      setSfBio(prof.bio ?? '');
      setSfWebsite(prof.website ?? '');
      setSfSpecialties(prof.vehicle_specialties ?? '');
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/creator/login');
  };

  const uploadStorefrontImage = async (file: File, bucket: 'creator-avatars' | 'creator-banners', field: 'avatar_url' | 'banner_url') => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${field}.${ext}`;
    if (field === 'avatar_url') setSfAvatarUploading(true);
    else setSfBannerUploading(true);
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      await supabase.from('user_profiles').update({ [field]: publicUrl }).eq('id', user.id);
      setProfile((p: any) => ({ ...p, [field]: publicUrl }));
    }
    if (field === 'avatar_url') setSfAvatarUploading(false);
    else setSfBannerUploading(false);
  };

  const saveStorefront = async () => {
    setSfSaving(true);
    setSfMsg('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('user_profiles').update({
      bio: sfBio || null,
      website: sfWebsite || null,
      vehicle_specialties: sfSpecialties || null,
    }).eq('id', user.id);
    setSfSaving(false);
    if (error) { setSfMsg('Failed to save: ' + error.message); return; }
    setProfile((p: any) => ({ ...p, bio: sfBio, website: sfWebsite, vehicle_specialties: sfSpecialties }));
    setSfMsg('Saved!');
    setSfEditMode(false);
    setTimeout(() => setSfMsg(''), 3000);
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveMsg('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('user_profiles').update({
      name: editName,
      handle: editHandle.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      bio: editBio || null,
      website: editWebsite || null,
      vehicle_specialties: editSpecialties || null,
      software: editSoftware || null,
      experience_level: editExperience || null,
    }).eq('id', user.id);

    setSaving(false);
    if (error) { setSaveMsg('Failed to save: ' + error.message); return; }
    setProfile((p: any) => ({ ...p, name: editName, handle: editHandle, bio: editBio, website: editWebsite, vehicle_specialties: editSpecialties, software: editSoftware, experience_level: editExperience }));
    setSaveMsg('Saved!');
    setEditMode(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  const allSubs = submissions;
  const pending = allSubs.filter((s) => s.status === 'pending' || s.status === 'under_review');
  const approved = allSubs.filter((s) => s.status === 'approved');
  const rejected = allSubs.filter((s) => s.status === 'rejected');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'main', label: 'Main', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'storefront', label: 'Store Front', icon: <Store className="w-3.5 h-3.5" /> },
    { id: 'listings', label: 'Listings', icon: <List className="w-3.5 h-3.5" /> },
    { id: 'saved', label: 'Saved', icon: <Bookmark className="w-3.5 h-3.5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#39ff14] mb-1">Creator Dashboard</p>
              <h1 className="text-3xl font-black text-white">Hey, {profile.name?.split(' ')[0]} 👋</h1>
              <p className="text-zinc-500 text-sm mt-1">@{profile.handle}</p>
            </div>

            {/* Followers / Following */}
            <div className="flex items-center gap-4 shrink-0 mt-1">
              <button
                onClick={() => {}}
                className="text-center group"
                title="Followers"
              >
                <p className="text-xl font-black text-white group-hover:text-[#39ff14] transition-colors">{followers}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Followers</p>
              </button>
              <div className="w-px h-8 bg-[#2a2a2a]" />
              <button
                onClick={() => {}}
                className="text-center group"
                title="Following"
              >
                <p className="text-xl font-black text-white group-hover:text-[#39ff14] transition-colors">{following}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Following</p>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs + Request Portal link */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                    tab === id
                      ? 'border-[#39ff14] text-[#39ff14]'
                      : 'border-transparent text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
            <Link
              href="/creator/requests"
              className="shrink-0 mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#E8000D] hover:text-red-400 transition-colors border border-[#E8000D]/20 hover:border-[#E8000D]/40 px-3 py-1.5 rounded-lg bg-[#E8000D]/5"
            >
              <Zap className="w-3 h-3" fill="currentColor" />
              Request Portal
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── MAIN ── */}
        {tab === 'main' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Total Submitted', value: allSubs.length, icon: FileText, color: 'text-zinc-400' },
                { label: 'Pending Review', value: pending.length, icon: Clock, color: 'text-amber-400' },
                { label: 'Approved', value: approved.length, icon: CheckCircle, color: 'text-[#39ff14]' },
                { label: 'Rejected', value: rejected.length, icon: XCircle, color: 'text-red-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                  <Icon className={`w-5 h-5 ${color} mb-3`} />
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {!profile.verified && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 mb-8 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-400 mb-1">Profile Under Review</p>
                  <p className="text-xs text-zinc-400">Our team is reviewing your creator application. You can submit parts now — they'll be reviewed once your profile is verified.</p>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-3">
                <h2 className="text-lg font-black text-white mb-5">Recent Scans</h2>
                {allSubs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#2a2a2a] p-12 text-center">
                    <Printer className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-base font-bold text-white mb-2">No submissions yet</h3>
                    <p className="text-sm text-zinc-500 mb-6">Upload your first part to get started.</p>
                    <Link href="/creator/submit" className="btn-primary px-6 py-3 text-sm rounded-lg inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Submit a Scan
                    </Link>
                  </div>
                ) : (
                  allSubs.slice(0, 5).map((sub) => (
                    <Link key={sub.id} href={`/creator/submissions/${sub.id}`}
                      className="flex items-center gap-4 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 hover:border-[#39ff14]/30 transition-colors group">
                      <div className="w-12 h-12 rounded-lg bg-[#252525] border border-[#2a2a2a] flex items-center justify-center shrink-0 overflow-hidden">
                        {sub.images?.[0]
                          ? <img src={sub.images[0]} alt={sub.name} className="w-full h-full object-cover" />
                          : <Printer className="w-6 h-6 text-zinc-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white group-hover:text-[#39ff14] transition-colors truncate">{sub.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">{sub.make} · {sub.model} · {sub.category}</p>
                        <p className="text-[10px] text-zinc-700 mt-0.5">{formatDate(sub.created_at)}</p>
                      </div>
                      <SubmissionStatusBadge status={sub.status} />
                    </Link>
                  ))
                )}
                {allSubs.length > 5 && (
                  <button onClick={() => setTab('listings')} className="text-xs text-zinc-500 hover:text-[#39ff14] transition-colors mt-2">
                    View all {allSubs.length} listings →
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <DashboardCart />
                <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Earnings</h3>
                  <DollarSign className="w-6 h-6 text-zinc-700 mb-2" />
                  <p className="text-sm text-zinc-500">Earnings dashboard coming soon.</p>
                </div>
                <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Submission Tips</h3>
                  <ul className="space-y-3">
                    {['Include both STL and 3MF formats', 'Validated print settings = faster approval', 'Fitment photos speed up verification', 'Clear install notes = better reviews'].map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-xs text-zinc-400">
                        <span className="text-[#39ff14] mt-0.5 shrink-0">→</span>{tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── STORE FRONT ── */}
        {tab === 'storefront' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-black text-white mb-1">Store Front</h2>
                <p className="text-sm text-zinc-500">Customize what buyers see on your public store page.</p>
              </div>
              {!sfEditMode ? (
                <button onClick={() => setSfEditMode(true)} className="text-xs font-bold border border-[#2a2a2a] text-zinc-400 hover:text-white hover:border-zinc-600 px-4 py-2 rounded-lg transition-colors">
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setSfEditMode(false); setSfMsg(''); }} className="text-xs font-bold border border-[#2a2a2a] text-zinc-500 hover:text-white px-4 py-2 rounded-lg transition-colors">Cancel</button>
                  <button onClick={saveStorefront} disabled={sfSaving} className="text-xs font-bold btn-primary px-4 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-50">
                    {sfSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Save
                  </button>
                </div>
              )}
            </div>

            {sfMsg && (
              <div className={`rounded-lg border px-3 py-2 mb-4 text-xs font-bold ${sfMsg === 'Saved!' ? 'border-[#39ff14]/30 bg-[#39ff14]/5 text-[#39ff14]' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                {sfMsg}
              </div>
            )}

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden mb-4">
              <div className="relative h-36 bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
                {profile.banner_url
                  ? <img src={profile.banner_url} alt="banner" className="w-full h-full object-cover" />
                  : <div className="absolute inset-0 bg-gradient-to-br from-[#39ff14]/5 to-transparent" />
                }
                <label className={`absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer group transition-colors ${profile.banner_url ? 'bg-black/0 hover:bg-black/50' : 'hover:bg-black/20'} ${sfBannerUploading ? 'pointer-events-none' : ''}`}>
                  {sfBannerUploading
                    ? <Loader2 className="w-6 h-6 animate-spin text-white" />
                    : <>
                        <ImagePlus className={`w-6 h-6 transition-opacity ${profile.banner_url ? 'opacity-0 group-hover:opacity-100' : 'opacity-40 group-hover:opacity-80'} text-white`} />
                        <span className={`text-xs font-bold text-white transition-opacity ${profile.banner_url ? 'opacity-0 group-hover:opacity-100' : 'opacity-40 group-hover:opacity-80'}`}>
                          {profile.banner_url ? 'Change Banner' : 'Upload Banner Image'}
                        </span>
                      </>
                  }
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadStorefrontImage(f, 'creator-banners', 'banner_url'); }} />
                </label>

                <div className="absolute -bottom-8 left-6">
                  <div className="relative w-16 h-16 rounded-2xl border-2 border-[#141414] overflow-hidden bg-[#252525]">
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xl font-black text-[#39ff14]">{profile.name?.charAt(0) ?? '?'}</span>
                        </div>
                    }
                    <label className={`absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/60 cursor-pointer transition-colors ${sfAvatarUploading ? 'pointer-events-none' : ''}`}>
                      {sfAvatarUploading
                        ? <Loader2 className="w-4 h-4 animate-spin text-white" />
                        : <Camera className="w-4 h-4 text-white opacity-0 hover:opacity-100" />
                      }
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadStorefrontImage(f, 'creator-avatars', 'avatar_url'); }} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-12 pb-6 px-6">
                <div className="mb-4">
                  <h3 className="text-xl font-black text-white">{profile.name}</h3>
                  <p className="text-sm text-zinc-500">@{profile.handle}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${profile.verified ? 'bg-[#39ff14]/10 text-[#39ff14]' : 'bg-amber-500/10 text-amber-400'}`}>
                    {profile.verified ? '✓ Verified Creator' : 'Pending Verification'}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5">Bio</p>
                  {sfEditMode
                    ? <textarea value={sfBio} onChange={(e) => setSfBio(e.target.value)} rows={3} placeholder="Tell buyers about yourself..." className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#39ff14]/50 resize-none" />
                    : <p className="text-sm text-zinc-400 leading-relaxed">{profile.bio || <span className="text-zinc-700 italic">No bio yet — click Edit to add one.</span>}</p>
                  }
                </div>

                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5">Vehicle Specialties</p>
                  {sfEditMode
                    ? <input value={sfSpecialties} onChange={(e) => setSfSpecialties(e.target.value)} placeholder="e.g. Japanese sports cars, trucks..." className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#39ff14]/50" />
                    : <p className="text-sm text-zinc-400">{profile.vehicle_specialties || <span className="text-zinc-700 italic">None set</span>}</p>
                  }
                </div>

                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5">Website</p>
                  {sfEditMode
                    ? <input value={sfWebsite} onChange={(e) => setSfWebsite(e.target.value)} placeholder="https://yoursite.com" className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#39ff14]/50" />
                    : profile.website
                      ? <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#39ff14] hover:underline">{profile.website}</a>
                      : <span className="text-zinc-700 italic text-sm">None set</span>
                  }
                </div>

                <div className="pt-4 border-t border-[#1e1e1e]">
                  <p className="text-xs text-zinc-600">{approved.length} approved listing{approved.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-zinc-600">Click the banner or avatar to upload a new image. Changes save instantly.</p>
          </div>
        )}

        {/* ── LISTINGS ── */}
        {tab === 'listings' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-black text-white mb-1">Listings</h2>
                <p className="text-sm text-zinc-500">{allSubs.length} total submission{allSubs.length !== 1 ? 's' : ''}</p>
              </div>
              <Link href="/creator/submit" className="btn-primary px-5 py-2.5 text-xs rounded-xl flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" /> New Listing
              </Link>
            </div>

            {allSubs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#2a2a2a] p-12 text-center">
                <Printer className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-base font-bold text-white mb-2">No submissions yet</h3>
                <p className="text-sm text-zinc-500 mb-6">Upload your first part to get started.</p>
                <Link href="/creator/submit" className="btn-primary px-6 py-3 text-sm rounded-lg inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Submit a Scan
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {allSubs.map((sub) => (
                  <Link key={sub.id} href={`/creator/submissions/${sub.id}`}
                    className="flex items-center gap-4 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 hover:border-[#39ff14]/30 transition-colors group">
                    <div className="w-12 h-12 rounded-lg bg-[#252525] border border-[#2a2a2a] flex items-center justify-center shrink-0 overflow-hidden">
                      {sub.images?.[0]
                        ? <img src={sub.images[0]} alt={sub.name} className="w-full h-full object-cover" />
                        : <Printer className="w-6 h-6 text-zinc-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-[#39ff14] transition-colors truncate">{sub.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">{sub.make} · {sub.model} · {sub.category}</p>
                      <p className="text-[10px] text-zinc-700 mt-0.5">{formatDate(sub.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold text-zinc-400">${sub.file_price}</span>
                      <SubmissionStatusBadge status={sub.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SAVED ── */}
        {tab === 'saved' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-black text-white mb-1">Saved</h2>
              <p className="text-sm text-zinc-500">Marketplace listings you've bookmarked.</p>
            </div>

            {savedListings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#2a2a2a] p-16 text-center">
                <Bookmark className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-base font-bold text-white mb-2">No saved listings yet</h3>
                <p className="text-sm text-zinc-500 mb-6">Browse the marketplace and save parts you like.</p>
                <Link href="/browse" className="btn-primary px-6 py-3 text-sm rounded-lg inline-flex items-center gap-2">
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedListings.map((saved) => {
                  const sub = saved.part_submissions;
                  if (!sub) return null;
                  return (
                    <Link key={saved.id} href={`/products/${sub.id}`}
                      className="flex items-center gap-4 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 hover:border-[#39ff14]/30 transition-colors group">
                      <div className="w-12 h-12 rounded-lg bg-[#252525] border border-[#2a2a2a] flex items-center justify-center shrink-0 overflow-hidden">
                        {sub.images?.[0]
                          ? <img src={sub.images[0]} alt={sub.name} className="w-full h-full object-cover" />
                          : <Printer className="w-6 h-6 text-zinc-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white group-hover:text-[#39ff14] transition-colors truncate">{sub.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">{sub.make} · {sub.model}</p>
                        {sub.user_profiles?.name && (
                          <p className="text-[10px] text-zinc-600 mt-0.5">by {sub.user_profiles.name}</p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-zinc-400 shrink-0">${sub.file_price}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <div className="max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-black text-white mb-1">Settings</h2>
                <p className="text-sm text-zinc-500">Update your creator profile details.</p>
              </div>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="text-xs font-bold border border-[#2a2a2a] text-zinc-400 hover:text-white hover:border-zinc-600 px-4 py-2 rounded-lg transition-colors">
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setEditMode(false); setSaveMsg(''); }} className="text-xs font-bold border border-[#2a2a2a] text-zinc-500 hover:text-white px-4 py-2 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button onClick={saveSettings} disabled={saving} className="text-xs font-bold btn-primary px-4 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-50">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Save
                  </button>
                </div>
              )}
            </div>

            {saveMsg && (
              <div className={`rounded-lg border px-3 py-2 mb-4 text-xs font-bold ${saveMsg === 'Saved!' ? 'border-[#39ff14]/30 bg-[#39ff14]/5 text-[#39ff14]' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                {saveMsg}
              </div>
            )}

            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] divide-y divide-[#1e1e1e] mb-6">
              {[
                { label: 'Store Name', value: editName, set: setEditName, key: 'name' },
                { label: 'Handle', value: editHandle, set: setEditHandle, key: 'handle', prefix: '@' },
                { label: 'Website', value: editWebsite, set: setEditWebsite, key: 'website' },
              ].map(({ label, value, set, prefix }) => (
                <div key={label} className="flex items-center justify-between px-5 py-4 gap-4">
                  <span className="text-xs text-zinc-500 shrink-0 w-28">{label}</span>
                  {editMode ? (
                    <div className="flex items-center gap-1 flex-1">
                      {prefix && <span className="text-zinc-600 text-sm">{prefix}</span>}
                      <input
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#39ff14]/50"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-200 text-right">{prefix}{value || '—'}</span>
                  )}
                </div>
              ))}

              <div className="flex items-start justify-between px-5 py-4 gap-4">
                <span className="text-xs text-zinc-500 shrink-0 w-28 mt-1">Bio</span>
                {editMode ? (
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#39ff14]/50 resize-none"
                  />
                ) : (
                  <span className="text-xs text-zinc-200 text-right flex-1">{editBio || '—'}</span>
                )}
              </div>

              {[
                { label: 'Specialties', value: editSpecialties, set: setEditSpecialties },
                { label: 'Software', value: editSoftware, set: setEditSoftware },
                { label: 'Experience', value: editExperience, set: setEditExperience },
              ].map(({ label, value, set }) => (
                <div key={label} className="flex items-center justify-between px-5 py-4 gap-4">
                  <span className="text-xs text-zinc-500 shrink-0 w-28">{label}</span>
                  {editMode ? (
                    <input
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#39ff14]/50"
                    />
                  ) : (
                    <span className="text-xs text-zinc-200 text-right">{value || '—'}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Logout */}
            <div className="rounded-xl border border-red-500/20 bg-[#141414] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Account</h3>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
