-- Script untuk membuat 5 Mentor Accounts
-- Jalankan di Supabase SQL Editor

DO $$
DECLARE
  uiux_id UUID;
  backend_id UUID;
  frontend_id UUID;
  mobile_id UUID;
  
  uid1 UUID := gen_random_uuid();
  uid2 UUID := gen_random_uuid();
  uid3 UUID := gen_random_uuid();
  uid4 UUID := gen_random_uuid();
  uid5 UUID := gen_random_uuid();
BEGIN
  -- 1. Ambil UUID divisi dari tabel categories
  SELECT id INTO uiux_id FROM categories WHERE name ILIKE '%UI/UX%' OR name ILIKE '%UI%' LIMIT 1;
  SELECT id INTO backend_id FROM categories WHERE name ILIKE '%Backend%' OR name ILIKE '%Back End%' LIMIT 1;
  SELECT id INTO frontend_id FROM categories WHERE name ILIKE '%Frontend%' OR name ILIKE '%Front End%' LIMIT 1;
  SELECT id INTO mobile_id FROM categories WHERE name ILIKE '%Mobile%' OR name ILIKE '%Android%' LIMIT 1;

  -- 2. Insert ke auth.users (Supabase Auth)
  -- Dhani (UI/UX)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (uid1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dhani@nexora.id', crypt('dhani123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dhani"}', now(), now());

  -- Pilip (Backend)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (uid2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pilip@nexora.id', crypt('pilip123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pilip"}', now(), now());

  -- Fian (Frontend)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (uid3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fian@nexora.id', crypt('fian123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fian"}', now(), now());

  -- Bima (Mobile)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (uid4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bima@nexora.id', crypt('bima123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Bima"}', now(), now());

  -- Rifqi (Frontend)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (uid5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rifqi@nexora.id', crypt('rifqi123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rifqi"}', now(), now());

  -- 3. Update user_profiles untuk set Role & Divisi
  -- (Trigger on_auth_user_created sudah jalan, kita tinggal update)
  UPDATE public.user_profiles SET role = 'mentor', division_id = uiux_id, is_verified = true WHERE id = uid1;
  UPDATE public.user_profiles SET role = 'mentor', division_id = backend_id, is_verified = true WHERE id = uid2;
  UPDATE public.user_profiles SET role = 'mentor', division_id = frontend_id, is_verified = true WHERE id = uid3;
  UPDATE public.user_profiles SET role = 'mentor', division_id = mobile_id, is_verified = true WHERE id = uid4;
  UPDATE public.user_profiles SET role = 'mentor', division_id = frontend_id, is_verified = true WHERE id = uid5;

END $$;
