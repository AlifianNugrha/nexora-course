-- ============================================================
-- HAPUS SEMUA BADGE — Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Hapus dulu semua relasi user_badges (foreign key)
DELETE FROM user_badges;

-- 2. Hapus semua badge di tabel master
DELETE FROM badges;

-- 3. (Opsional) Reset active_title semua user ke NULL
UPDATE user_profiles SET active_title = NULL;

-- 4. Verifikasi: semua harus 0
SELECT 
  (SELECT COUNT(*) FROM badges)      AS total_badges,
  (SELECT COUNT(*) FROM user_badges) AS total_user_badges;

-- ============================================================
-- DONE! Semua badge dihapus. Kamu bisa buat badge baru di Admin.
-- ============================================================
