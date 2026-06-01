-- ============================================================
-- Forum tables for The Racing Files
-- ============================================================

-- 1. Categories (top-level vehicle forums)
CREATE TABLE forum_categories (
  id           text PRIMARY KEY,
  make         text NOT NULL,
  icon         text NOT NULL DEFAULT '💬',
  member_count integer NOT NULL DEFAULT 0,
  color        text NOT NULL DEFAULT '#E8000D',
  sort_order   integer NOT NULL DEFAULT 0
);

-- 2. Sections (subcategories / model-year groups)
CREATE TABLE forum_sections (
  id          text PRIMARY KEY,
  category_id text NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  label       text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0
);

-- 3. Threads
CREATE TABLE forum_threads (
  id               text PRIMARY KEY,
  category_id      text NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  section_id       text REFERENCES forum_sections(id) ON DELETE SET NULL,
  title            text NOT NULL,
  author_name      text NOT NULL,
  author_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  pinned           boolean NOT NULL DEFAULT false,
  hot              boolean NOT NULL DEFAULT false,
  tag              text NOT NULL DEFAULT 'General',
  view_count       integer NOT NULL DEFAULT 0,
  reply_count      integer NOT NULL DEFAULT 0,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- 4. Messages
CREATE TABLE forum_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   text NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  body        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_sections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_messages    ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "public read forum_categories" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "public read forum_sections"   ON forum_sections   FOR SELECT USING (true);
CREATE POLICY "public read forum_threads"    ON forum_threads     FOR SELECT USING (true);
CREATE POLICY "public read forum_messages"   ON forum_messages    FOR SELECT USING (true);

-- Authenticated users can post threads and messages
CREATE POLICY "auth insert threads"  ON forum_threads  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth insert messages" ON forum_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- Seed: Categories
-- ============================================================
INSERT INTO forum_categories (id, make, icon, member_count, sort_order) VALUES
  ('miata',   'Mazda Miata',    '🏎️', 3840, 1),
  ('skyline',  'Nissan Skyline', '🔥', 2190, 2),
  ('supra',    'Toyota Supra',   '⚡', 1760, 3),
  ('s2000',    'Honda S2000',    '🏁', 1320, 4),
  ('ducati',   'Ducati',         '🏍️', 980,  5),
  ('subaru',   'Subaru',         '🌲', 2450, 6);

-- ============================================================
-- Seed: Sections
-- ============================================================
INSERT INTO forum_sections (id, category_id, label, sort_order) VALUES
  -- Miata
  ('miata-na',  'miata', 'NA (1989–1997)',        1),
  ('miata-nb',  'miata', 'NB (1998–2005)',        2),
  ('miata-nc',  'miata', 'NC (2006–2015)',        3),
  ('miata-nd',  'miata', 'ND (2016–present)',     4),
  ('miata-gen', 'miata', 'General / All Miatas',  5),
  -- Skyline
  ('sky-r32', 'skyline', 'R32 (1989–1994)', 1),
  ('sky-r33', 'skyline', 'R33 (1993–1998)', 2),
  ('sky-r34', 'skyline', 'R34 (1998–2002)', 3),
  -- Supra
  ('supra-a60', 'supra', 'A60 (1981–1986)',   1),
  ('supra-a70', 'supra', 'A70 (1986–1992)',   2),
  ('supra-a80', 'supra', 'A80 (1993–2002)',   3),
  ('supra-a90', 'supra', 'A90 (2019–present)', 4),
  -- S2000
  ('s2k-ap1', 's2000', 'AP1 (1999–2003)',  1),
  ('s2k-ap2', 's2000', 'AP2 (2004–2009)',  2),
  ('s2k-gen', 's2000', 'General / Both',   3),
  -- Ducati
  ('duc-monster',  'ducati', 'Monster',       1),
  ('duc-panigale', 'ducati', 'Panigale',      2),
  ('duc-916',      'ducati', '916 / 996 / 998', 3),
  ('duc-hyper',    'ducati', 'Hypermotard',   4),
  ('duc-scrambler','ducati', 'Scrambler',     5),
  -- Subaru
  ('sub-wrx-gc', 'subaru', 'WRX GC (1992–2001)',   1),
  ('sub-wrx-gd', 'subaru', 'WRX GD (2002–2007)',   2),
  ('sub-wrx-va', 'subaru', 'WRX/STI VA (2015–2021)', 3),
  ('sub-brz',    'subaru', 'BRZ',                   4),
  ('sub-gen',    'subaru', 'General / EJ Engine',   5);

-- ============================================================
-- Seed: Threads
-- ============================================================
INSERT INTO forum_threads (id, category_id, section_id, title, author_name, pinned, hot, tag, view_count, reply_count, last_activity_at) VALUES
  -- Miata
  ('m1', 'miata', 'miata-na',  'NA hardtop latch rattle fix — printed bracket finally works', 'Carlos_M',    true,  false, 'NA',      1820, 42, now() - interval '2 hours'),
  ('m2', 'miata', 'miata-gen', 'Best filament for underhood parts? ASA vs. PA-CF',            'Jess_T',      false, true,  'General', 940,  31, now() - interval '5 hours'),
  ('m3', 'miata', 'miata-nb',  'NB headlight trim ring — anyone have fitment data?',           'Drift_Andre', false, false, 'NB',      610,  17, now() - interval '1 day'),
  ('m4', 'miata', 'miata-nd',  'ND soft top drain clip replacement print settings',            'Miata_UK',    false, false, 'ND',      290,  8,  now() - interval '2 days'),
  ('m5', 'miata', 'miata-na',  'Trunk weatherstrip retainer — NA dimensions needed',           'Garage_Builds',false,false, 'NA',      780,  23, now() - interval '3 days'),
  -- Skyline
  ('s1', 'skyline', 'sky-r32', 'R32 interior trim clips — full set modeled and uploaded',      'GTR_Yoshi',  true,  true,  'R32', 2400, 58, now() - interval '1 hour'),
  ('s2', 'skyline', 'sky-r32', 'RB26 coolant sensor bung cover — anyone printed this?',        'Boost_NZ',   false, false, 'R32', 730,  19, now() - interval '6 hours'),
  ('s3', 'skyline', 'sky-r34', 'R34 ATTESA harness bracket cracked — replacement options?',    'HKS_Fan',    false, false, 'R34', 405,  11, now() - interval '1 day'),
  ('s4', 'skyline', 'sky-r33', 'R33 glovebox hinge pin — nylon or PETG?',                     'JDM_Import', false, false, 'R33', 200,  6,  now() - interval '4 days'),
  -- Supra
  ('su1','supra', 'supra-a80', 'A80 pop-up headlight motor mount — printed fix that actually holds', 'Turbo_Kyle', false, true, 'A80', 1560, 37, now() - interval '3 hours'),
  ('su2','supra', 'supra-a80', '2JZ cam cover breather bung replacement — dimensions?',              'BPU_Life',   false, false,'A80', 520,  14, now() - interval '8 hours'),
  ('su3','supra', 'supra-a90', 'A90 OEM part integration — using printed adapters',                  'MKV_Owner',  false, false,'A90', 310,  9,  now() - interval '2 days'),
  -- S2000
  ('h1', 's2000', 's2k-ap1', 'Soft top latch mechanism — full rebuild with printed parts',      'VTEC_Dave',  true,  false, 'AP1',     1100, 29, now() - interval '4 hours'),
  ('h2', 's2000', 's2k-gen', 'F20C air box resonator delete — does the print hold at high RPM?','Track_S2k',  false, true,  'General', 840,  22, now() - interval '1 day'),
  ('h3', 's2000', 's2k-ap2', 'AP2 hardtop headliner clip replacements',                         'S2k_Forum',  false, false, 'AP2',     195,  7,  now() - interval '3 days'),
  -- Ducati
  ('d1', 'ducati', 'duc-monster',  'Monster 696 fairing bracket — cracked OEM? Print this instead',    'Moto_Lorenzo', false, true, 'Monster',  1280, 33, now() - interval '2 hours'),
  ('d2', 'ducati', 'duc-panigale', 'Panigale V4 front fairing clip set — ABS filament test results',   'Superbike_IT', false, false,'Panigale', 670,  18, now() - interval '1 day'),
  ('d3', 'ducati', 'duc-916',      '916 belly pan fastener replacement — anyone have specs?',           'Ducatisti',    false, false,'916',      440,  12, now() - interval '2 days'),
  -- Subaru
  ('sub1','subaru','sub-wrx-gd', 'GD WRX intercooler scoop rattle fix — printed spacer works',      'WRX_Blue',    false, true,  'WRX',     1740, 44, now() - interval '1 hour'),
  ('sub2','subaru','sub-wrx-va', 'VA STI rear diffuser end cap replacement',                         'Prodrive_Fan',false, false, 'STI',     590,  16, now() - interval '7 hours'),
  ('sub3','subaru','sub-brz',    'BRZ interior trim clip set — community model thread',              'BRZ_Kai',     true,  false, 'BRZ',     810,  21, now() - interval '1 day'),
  ('sub4','subaru','sub-gen',    'EJ engine bay cable guide replacement — which material?',          'STI_WA',      false, false, 'General', 340,  9,  now() - interval '3 days');
