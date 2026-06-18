-- ============================================================
-- NEXORA COURSE PLATFORM - Exam + Badge System Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- 0. HELPER FUNCTION - Role check (prevents RLS recursion)
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT SECURITY DEFINER AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql;

-- ════════════════════════════════════════════════════════════
-- 1. EXAMS — Master exam table
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  passing_score INTEGER NOT NULL DEFAULT 70,
  is_published BOOLEAN DEFAULT false,
  shuffle_questions BOOLEAN DEFAULT true,
  shuffle_options BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 2. EXAM_QUESTIONS — Soal per exam
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a','b','c','d')),
  "order" INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 3. EXAM_ATTEMPTS — Percobaan user mengerjakan exam
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS exam_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score NUMERIC(5,2),
  total_correct INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  is_submitted BOOLEAN DEFAULT false,
  time_spent_seconds INTEGER
);

-- ════════════════════════════════════════════════════════════
-- 4. EXAM_ANSWERS — Jawaban user per soal per attempt
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS exam_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
  selected_answer TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 5. BADGES — Daftar badge yang tersedia
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  category TEXT NOT NULL DEFAULT 'exam'
    CHECK (category IN ('exam', 'course', 'special')),
  requirement JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 6. USER_BADGES — Badge yang dimiliki user
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id, exam_id)
);

-- ════════════════════════════════════════════════════════════
-- 7. ALTER user_profiles — tambah active_title & RLS Update Policies
-- ════════════════════════════════════════════════════════════
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS active_title TEXT;

-- Policy to allow users to update their own profiles (missing in V2)
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policy to allow users to insert/upsert their own profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ════════════════════════════════════════════════════════════
-- 8. Enable RLS
-- ════════════════════════════════════════════════════════════
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- ════════════════════════════════════════════════════════════
-- 9. RLS Policies
-- ════════════════════════════════════════════════════════════

-- EXAMS: Public read for published, admin manage all
CREATE POLICY "Public read published exams" ON exams
  FOR SELECT USING (is_published = true OR public.get_my_role() = 'super_admin');
CREATE POLICY "Admin manage exams" ON exams
  FOR ALL USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');

-- EXAM_QUESTIONS: Public read (for taking exams), admin manage
CREATE POLICY "Public read questions" ON exam_questions
  FOR SELECT USING (true);
CREATE POLICY "Admin manage questions" ON exam_questions
  FOR ALL USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');

-- EXAM_ATTEMPTS: Users manage own, admin read all
CREATE POLICY "Users manage own attempts" ON exam_attempts
  FOR ALL USING (auth.uid() = user_id OR public.get_my_role() = 'super_admin')
  WITH CHECK (auth.uid() = user_id OR public.get_my_role() = 'super_admin');

-- EXAM_ANSWERS: Users manage own, admin read all
CREATE POLICY "Users manage own answers" ON exam_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM exam_attempts
      WHERE exam_attempts.id = exam_answers.attempt_id
      AND (exam_attempts.user_id = auth.uid() OR public.get_my_role() = 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_attempts
      WHERE exam_attempts.id = exam_answers.attempt_id
      AND (exam_attempts.user_id = auth.uid() OR public.get_my_role() = 'super_admin')
    )
  );

-- BADGES: Public read
CREATE POLICY "Public read badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Admin manage badges" ON badges
  FOR ALL USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');

-- USER_BADGES: Users read own + public read for showcase, system insert
CREATE POLICY "Public read user badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "System manage user badges" ON user_badges
  FOR ALL USING (auth.uid() = user_id OR public.get_my_role() = 'super_admin')
  WITH CHECK (auth.uid() = user_id OR public.get_my_role() = 'super_admin');

-- ════════════════════════════════════════════════════════════
-- 10. Clean Up Default/Seed Badges (Keep only custom ones)
-- ════════════════════════════════════════════════════════════
DELETE FROM user_badges 
WHERE badge_id IN (
  SELECT id FROM badges 
  WHERE slug IN ('bronze', 'silver', 'gold', 'diamond', 'first_exam', 'five_exams', 'ten_exams', 'perfectionist', 'speed_demon', 'never_give_up', 'scholar')
);

DELETE FROM badges 
WHERE slug IN ('bronze', 'silver', 'gold', 'diamond', 'first_exam', 'five_exams', 'ten_exams', 'perfectionist', 'speed_demon', 'never_give_up', 'scholar');

-- ============================================================
-- DONE! Run this migration in Supabase SQL Editor.
-- ============================================================
