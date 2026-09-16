-- ============================================================
-- DEBUG: Jalankan ini di Supabase > SQL Editor
-- ============================================================

-- 1. CEK DATA RIIL
SELECT 'exams' as tabel, count(*) FROM exams
UNION ALL SELECT 'exam_questions', count(*) FROM exam_questions
UNION ALL SELECT 'exam_attempts', count(*) FROM exam_attempts
UNION ALL SELECT 'exam_answers', count(*) FROM exam_answers
UNION ALL SELECT 'user_profiles', count(*) FROM user_profiles;

-- 2. TAMPILKAN USER YANG ADA
SELECT u.email, u.email_confirmed_at, p.role, p.full_name
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 3. TAMPILKAN SEMUA EXAM ATTEMPTS (jika ada)
SELECT ea.*, e.title as exam_title
FROM exam_attempts ea
LEFT JOIN exams e ON ea.exam_id = e.id
ORDER BY ea.started_at DESC;

-- 4. RESET PASSWORD admin@nexora.id & SET ROLE SUPER_ADMIN
UPDATE auth.users 
SET encrypted_password = crypt('admin123', gen_salt('bf')),
    email_confirmed_at = now()
WHERE email = 'admin@nexora.id';

UPDATE public.user_profiles 
SET role = 'super_admin', is_verified = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@nexora.id');

SELECT 'Done! Login: admin@nexora.id / admin123' as status;
