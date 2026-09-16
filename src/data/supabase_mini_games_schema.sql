-- ============================================================
-- SUPABASE MINI GAMES REALTIME DATABASE SCHEMA & SEED DATA
-- Salin dan paste seluruh isi script ini ke Supabase SQL Editor
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)
-- ============================================================

-- 1. Tabel Mini Games (Daftar game divisi & kuis)
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
-- INITIAL SEED DATA (Menggunakan Dollar-Quoting $$ agar aman)
-- ============================================================

INSERT INTO public.mini_games (id, title, game_type, course_id, division_slug, description, prompt_instruction, questions)
VALUES
  (
    'mg-prompt-01',
    'AI Prompting Pegunungan Showcase',
    'prompt_vote',
    'c-fe-001',
    'front-end',
    'Buatlah gambar pemandangan pegunungan terbaik menggunakan AI image generator favoritmu!',
    'Buat gambar pegunungan megah di sore hari dengan efek pemandangan memukau menggunakan AI (Midjourney/DALL-E/Bing AI/Ideogram).',
    '[]'::jsonb
  ),
  (
    'mg-quiz-01',
    'Cerdas Cermat Web Tech Battle',
    'cerdas_cermat',
    'c-fe-001',
    'front-end',
    'Pertarungan pengetahuan cepat seputar HTML, CSS, JavaScript, dan React!',
    '',
    $$[
      {"id":"q1","question":"Manakah tag HTML yang digunakan untuk membuat judul utama halaman?","options":["<h1>","<heading>","<head>","<title>"],"correctAnswer":0,"timeLimit":15},
      {"id":"q2","question":"Sifat CSS manakah yang digunakan untuk membuat elemen fleksibel di satu baris?","options":["display: block","display: flex","position: absolute","float: left"],"correctAnswer":1,"timeLimit":15},
      {"id":"q3","question":"Hook React manakah yang digunakan untuk menyimpan state lokal pada komponen?","options":["useEffect","useMemo","useState","useContext"],"correctAnswer":2,"timeLimit":15},
      {"id":"q4","question":"Apakah singkatan dari DOM dalam pengembangan web?","options":["Data Object Model","Document Object Model","Digital Oriented Module","Desktop Order Method"],"correctAnswer":1,"timeLimit":15},
      {"id":"q5","question":"Manakah perintah git yang digunakan untuk mengunggah perubahan ke remote repository?","options":["git commit","git clone","git push","git pull"],"correctAnswer":2,"timeLimit":15}
    ]$$::jsonb
  ),
  (
    'mg-quiz-mobile-01',
    'Cerdas Cermat Mobile Dev & React Native / Flutter',
    'cerdas_cermat',
    'c-mb-001',
    'mobile-dev',
    'Pertarungan pengetahuan seputar React Native, Flutter, mobile architecture & cross-platform!',
    '',
    $$[
      {"id":"mq1","question":"Komponen utama React Native yang digunakan untuk membungkus tampilan UI adalah?","options":["<View>","<div>","<Container>","<Layout>"],"correctAnswer":0,"timeLimit":15},
      {"id":"mq2","question":"Bahasa pemrograman utama yang digunakan dalam pengembangan aplikasi Flutter adalah?","options":["Java","Swift","Dart","TypeScript"],"correctAnswer":2,"timeLimit":15},
      {"id":"mq3","question":"Perintah CLI untuk membuat build APK/bundle pada React Native (Expo) adalah?","options":["npx expo build","eas build","react-native run-android","npm run build-apk"],"correctAnswer":1,"timeLimit":15},
      {"id":"mq4","question":"Widget utama di Flutter yang nilainya tidak pernah berubah setelah di-render adalah?","options":["StatefulWidget","StatelessWidget","InheritedWidget","FlexibleWidget"],"correctAnswer":1,"timeLimit":15}
    ]$$::jsonb
  ),
  (
    'mg-prompt-mobile-01',
    'Mobile App UI/UX Mockup Challenge',
    'prompt_vote',
    'c-mb-001',
    'mobile-dev',
    'Buatlah prompt AI terbaik untuk mendesain antarmuka aplikasi mobile modern (iOS/Android)!',
    'Hasilkan gambar desain antarmuka aplikasi mobile E-Commerce / Fintech yang futuristik dan elegan menggunakan AI.',
    '[]'::jsonb
  ),
  (
    'mg-quiz-backend-01',
    'Back End & Database Battle',
    'cerdas_cermat',
    'c-be-001',
    'back-end',
    'Uji pemahaman REST API, Node.js, PostgreSQL & SQL queries!',
    '',
    $$[
      {"id":"bq1","question":"HTTP method manakah yang digunakan untuk memperbarui sebagian data resource?","options":["GET","POST","PUT","PATCH"],"correctAnswer":3,"timeLimit":15},
      {"id":"bq2","question":"Perintah SQL untuk mengambil data tanpa duplikasi adalah?","options":["SELECT UNIQUE","SELECT DISTINCT","SELECT DIFFERENT","SELECT FILTER"],"correctAnswer":1,"timeLimit":15}
    ]$$::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  game_type = EXCLUDED.game_type,
  division_slug = EXCLUDED.division_slug,
  description = EXCLUDED.description,
  prompt_instruction = EXCLUDED.prompt_instruction,
  questions = EXCLUDED.questions;
