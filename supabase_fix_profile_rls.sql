-- ============================================================
-- FIX: user_profiles RLS — Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Pastikan kolom active_title ada
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS active_title TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Hapus SEMUA policy lama di user_profiles (bersih total)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON user_profiles', pol.policyname);
  END LOOP;
END;
$$;

-- 3. Pastikan RLS aktif
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Buat policy baru yang lengkap, berkinerja tinggi, dan bebas rekursi

-- SELECT: Semua user yang login (authenticated) bisa membaca data profile (untuk leaderboard, dll)
CREATE POLICY "user_profiles_select"
  ON user_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT: User hanya bisa memasukkan baris profil milik mereka sendiri
CREATE POLICY "user_profiles_insert"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: User hanya bisa memperbarui profil mereka sendiri
CREATE POLICY "user_profiles_update"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: Hanya super_admin yang bisa menghapus profil
CREATE POLICY "user_profiles_delete"
  ON user_profiles FOR DELETE
  USING (public.get_my_role() = 'super_admin');

-- 5. Redefinisikan get_my_role() untuk membaca database secara aman (tanpa rekursi)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 6. PERBAIKAN: RLS exam_attempts agar leaderboard bisa diakses oleh semua user yang login
DROP POLICY IF EXISTS "Users manage own attempts" ON exam_attempts;

CREATE POLICY "exam_attempts_select" ON exam_attempts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "exam_attempts_write" ON exam_attempts
  FOR ALL USING (auth.uid() = user_id OR public.get_my_role() = 'super_admin')
  WITH CHECK (auth.uid() = user_id OR public.get_my_role() = 'super_admin');

-- 7. Sinkronisasikan profil yang hilang dari tabel auth.users
INSERT INTO public.user_profiles (id, full_name, role, is_verified, email)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), 'user', false, email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 7. Verifikasi policy yang aktif saat ini
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY cmd;
