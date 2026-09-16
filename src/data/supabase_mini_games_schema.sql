-- ============================================================
-- SUPABASE MINI GAMES - RESET & BERSIHKAN DATA LAMA
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- PERINGATAN: Script ini akan HAPUS SEMUA data mini games lama!
-- ============================================================

-- STEP 1: Hapus semua data (urutan penting karena constraint relasi)
-- Menggunakan DO block agar aman jika tabel belum ada
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_votes') THEN
    TRUNCATE TABLE public.game_votes RESTART IDENTITY CASCADE;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_participants') THEN
    TRUNCATE TABLE public.game_participants RESTART IDENTITY CASCADE;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_rooms') THEN
    TRUNCATE TABLE public.game_rooms RESTART IDENTITY CASCADE;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mini_games') THEN
    TRUNCATE TABLE public.mini_games RESTART IDENTITY CASCADE;
  END IF;
END $$;

-- ============================================================
-- STEP 2: Buat ulang tabel (aman, tidak akan error jika sudah ada)
-- ============================================================

-- 1. Tabel Mini Games (Daftar game divisi & kuis yang dibuat Admin)
CREATE TABLE IF NOT EXISTS public.mini_games (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  game_type TEXT NOT NULL, -- 'prompt_vote' ATAU 'cerdas_cermat'
  course_id TEXT,
  division_slug TEXT, -- 'front-end', 'back-end', 'mobile-dev', 'ui-ux', 'devops', 'all'
  description TEXT,
  prompt_instruction TEXT,
  questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Game Rooms (Multiplayer Room Status & Kode Room)
CREATE TABLE IF NOT EXISTS public.game_rooms (
  id TEXT PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  game_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'submission', 'voting', 'playing', 'finished'
  current_index INT DEFAULT 0,
  game_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Game Participants (Peserta terhubung, Poin & Gambar AI)
CREATE TABLE IF NOT EXISTS public.game_participants (
  id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  score INT DEFAULT 0,
  image_url TEXT,
  is_ready BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_room_user UNIQUE (room_code, user_id)
);

-- 4. Tabel Game Votes (Voting Realtime Karya AI)
CREATE TABLE IF NOT EXISTS public.game_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  voter_user_id TEXT NOT NULL,
  reaction TEXT NOT NULL, -- 'bagus_sekali', 'absolute_cinema', 'kurang', 'jelek'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_room_target_voter UNIQUE (room_code, target_user_id, voter_user_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.mini_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access on mini_games" ON public.mini_games;
CREATE POLICY "Public access on mini_games" ON public.mini_games FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on game_rooms" ON public.game_rooms;
CREATE POLICY "Public access on game_rooms" ON public.game_rooms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on game_participants" ON public.game_participants;
CREATE POLICY "Public access on game_participants" ON public.game_participants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on game_votes" ON public.game_votes;
CREATE POLICY "Public access on game_votes" ON public.game_votes FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- ENABLE SUPABASE REALTIME MULTIPLAYER SYNC
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_participants;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_votes;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mini_games;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- STEP 5: Verifikasi - semua tabel harus menunjukkan 0 data
-- ============================================================
SELECT 'mini_games'        AS tabel, COUNT(*) AS jumlah_data FROM public.mini_games
UNION ALL
SELECT 'game_rooms'        AS tabel, COUNT(*) AS jumlah_data FROM public.game_rooms
UNION ALL
SELECT 'game_participants' AS tabel, COUNT(*) AS jumlah_data FROM public.game_participants
UNION ALL
SELECT 'game_votes'        AS tabel, COUNT(*) AS jumlah_data FROM public.game_votes;
