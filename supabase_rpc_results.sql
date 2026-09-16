-- ============================================================
-- FIX: Fungsi untuk Admin membaca semua hasil ujian
-- Bypass RLS via SECURITY DEFINER
-- Jalankan di Supabase > SQL Editor
-- ============================================================

-- Fungsi 1: Ambil semua attempt untuk satu exam (admin only)
CREATE OR REPLACE FUNCTION get_exam_results(p_exam_id UUID)
RETURNS TABLE (
  id UUID,
  score NUMERIC,
  finished_at TIMESTAMPTZ,
  user_id UUID,
  exam_id UUID,
  is_submitted BOOLEAN,
  total_correct INTEGER,
  total_questions INTEGER,
  time_spent_seconds INTEGER,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  active_title TEXT,
  active_frame TEXT
)
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT 
    ea.id,
    ea.score,
    ea.finished_at,
    ea.user_id,
    ea.exam_id,
    ea.is_submitted,
    ea.total_correct,
    ea.total_questions,
    ea.time_spent_seconds,
    up.full_name,
    up.email,
    up.avatar_url,
    up.active_title,
    up.active_frame
  FROM exam_attempts ea
  LEFT JOIN user_profiles up ON ea.user_id = up.id
  WHERE ea.exam_id = p_exam_id
    AND ea.finished_at IS NOT NULL
  ORDER BY ea.score DESC;
$$;

-- Fungsi 2: Hitung jumlah attempt per exam (untuk list view)
CREATE OR REPLACE FUNCTION get_exam_attempt_count(p_exam_id UUID)
RETURNS INTEGER
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT count(*)::INTEGER
  FROM exam_attempts
  WHERE exam_id = p_exam_id
    AND finished_at IS NOT NULL;
$$;

-- Test
SELECT * FROM get_exam_results('80e29c3d-31f0-4730-ba67-dfb249801264');
SELECT get_exam_attempt_count('80e29c3d-31f0-4730-ba67-dfb249801264');
