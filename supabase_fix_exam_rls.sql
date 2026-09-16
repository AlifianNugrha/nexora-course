-- ============================================================
-- FIX: exam_attempts RLS agar Admin bisa lihat semua hasil
-- Jalankan ini di Supabase > SQL Editor
-- ============================================================

-- 1. Hapus SEMUA policy lama di exam_attempts
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'exam_attempts'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON exam_attempts', pol.policyname);
  END LOOP;
END;
$$;

-- 2. Pastikan RLS aktif
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- 3. Buat policy SELECT: semua user yang login bisa baca semua attempt
CREATE POLICY "exam_attempts_select_all"
  ON exam_attempts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 4. Buat policy INSERT: user hanya bisa insert attempt milik sendiri
CREATE POLICY "exam_attempts_insert_own"
  ON exam_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Buat policy UPDATE: user hanya bisa update attempt milik sendiri, atau super_admin
CREATE POLICY "exam_attempts_update_own"
  ON exam_attempts FOR UPDATE
  USING (auth.uid() = user_id OR public.get_my_role() = 'super_admin')
  WITH CHECK (auth.uid() = user_id OR public.get_my_role() = 'super_admin');

-- 6. Buat policy DELETE: hanya super_admin
CREATE POLICY "exam_attempts_delete_admin"
  ON exam_attempts FOR DELETE
  USING (public.get_my_role() = 'super_admin');

-- 7. Cek data yang ada (untuk verifikasi)
SELECT 
  ea.id,
  ea.exam_id,
  ea.user_id,
  ea.score,
  ea.is_submitted,
  ea.finished_at,
  e.title as exam_title
FROM exam_attempts ea
LEFT JOIN exams e ON ea.exam_id = e.id
ORDER BY ea.finished_at DESC
LIMIT 20;
