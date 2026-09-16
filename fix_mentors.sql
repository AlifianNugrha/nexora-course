-- Script Fix untuk Update/Reset Password & Set Role Mentor
-- Jalankan di Supabase SQL Editor

DO $$
DECLARE
  uiux_id UUID;
  backend_id UUID;
  frontend_id UUID;
  mobile_id UUID;
BEGIN
  -- 1. Ambil UUID divisi dari tabel categories
  SELECT id INTO uiux_id FROM categories WHERE name ILIKE '%UI/UX%' OR name ILIKE '%UI%' LIMIT 1;
  SELECT id INTO backend_id FROM categories WHERE name ILIKE '%Backend%' OR name ILIKE '%Back End%' LIMIT 1;
  SELECT id INTO frontend_id FROM categories WHERE name ILIKE '%Frontend%' OR name ILIKE '%Front End%' LIMIT 1;
  SELECT id INTO mobile_id FROM categories WHERE name ILIKE '%Mobile%' OR name ILIKE '%Android%' LIMIT 1;

  -- 2. Paksa Update Password di auth.users (jika akun sudah ada)
  UPDATE auth.users SET encrypted_password = crypt('dhani123', gen_salt('bf')), email_confirmed_at = now() WHERE email = 'dhani@nexora.id';
  UPDATE auth.users SET encrypted_password = crypt('pilip123', gen_salt('bf')), email_confirmed_at = now() WHERE email = 'pilip@nexora.id';
  UPDATE auth.users SET encrypted_password = crypt('fian123', gen_salt('bf')), email_confirmed_at = now() WHERE email = 'fian@nexora.id';
  UPDATE auth.users SET encrypted_password = crypt('bima123', gen_salt('bf')), email_confirmed_at = now() WHERE email = 'bima@nexora.id';
  UPDATE auth.users SET encrypted_password = crypt('rifqi123', gen_salt('bf')), email_confirmed_at = now() WHERE email = 'rifqi@nexora.id';

  -- 3. Update Profile mereka menjadi Mentor dan set Divisinya
  UPDATE public.user_profiles SET role = 'mentor', division_id = uiux_id, is_verified = true 
  WHERE id = (SELECT id FROM auth.users WHERE email = 'dhani@nexora.id');

  UPDATE public.user_profiles SET role = 'mentor', division_id = backend_id, is_verified = true 
  WHERE id = (SELECT id FROM auth.users WHERE email = 'pilip@nexora.id');

  UPDATE public.user_profiles SET role = 'mentor', division_id = frontend_id, is_verified = true 
  WHERE id = (SELECT id FROM auth.users WHERE email = 'fian@nexora.id');

  UPDATE public.user_profiles SET role = 'mentor', division_id = mobile_id, is_verified = true 
  WHERE id = (SELECT id FROM auth.users WHERE email = 'bima@nexora.id');

  UPDATE public.user_profiles SET role = 'mentor', division_id = frontend_id, is_verified = true 
  WHERE id = (SELECT id FROM auth.users WHERE email = 'rifqi@nexora.id');

END $$;
