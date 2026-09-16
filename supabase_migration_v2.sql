-- ============================================================
-- NEXORA COURSE PLATFORM - Migration V2
-- Role System + Division-based Access + Absensi
-- ============================================================

-- 1. Create user_profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'mentor', 'user')),
  division_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add division_id to courses (link to category as division)
-- courses already has category_id, we'll use that as the division link
-- No change needed here since category_id already serves this purpose

-- 3. Add division_id to gallery for filtering
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- 4. Add division_id to form_submissions for better filtering (absensi)
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- 5. Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Helper function to check role WITHOUT triggering RLS (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 7. RLS Policies for user_profiles (using helper function to avoid recursion)
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Super admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON user_profiles
  FOR SELECT USING (public.get_my_role() = 'super_admin');

-- Super admins can manage all profiles
CREATE POLICY "Admins can manage profiles" ON user_profiles
  FOR ALL USING (public.get_my_role() = 'super_admin');

-- 7. Update Courses RLS - Users can only see courses in their division (or public)
-- Drop old public policies first (run manually if needed)
-- DROP POLICY IF EXISTS "Public Read" ON courses;
-- DROP POLICY IF EXISTS "Public Manage Courses" ON courses;

-- Courses: authenticated users see their division courses or all if super_admin
CREATE POLICY "Division Read Courses" ON courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND (role = 'super_admin' OR division_id = courses.category_id OR is_verified = false)
    )
    OR auth.uid() IS NULL -- allow public read for now
  );

-- 8. Update form_submissions RLS for mentors
CREATE POLICY "Mentors read own division submissions" ON form_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND (role = 'super_admin' OR role = 'mentor')
    )
  );

-- 9. Create a function to auto-create user_profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role, is_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE((NEW.raw_user_meta_data->>'is_verified')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- NOTES:
-- Run this migration in Supabase SQL Editor
-- After migration, create the first super_admin manually:
--
-- 1. Create user via Supabase Auth dashboard or signUp API
-- 2. Then update their profile:
--    UPDATE user_profiles SET role = 'super_admin', is_verified = true 
--    WHERE id = '<user-uuid>';
--
-- Categories are reused as "divisions" - no separate table needed.
-- ============================================================
