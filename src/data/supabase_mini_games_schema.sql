-- ============================================================
-- SUPABASE MINI GAMES REALTIME DATABASE SCHEMA
-- Salin dan paste seluruh isi script ini ke Supabase SQL Editor
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)
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
