-- 1. Create Categories Table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Courses Table
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  level TEXT,
  duration TEXT,
  lessons INTEGER DEFAULT 0,
  thumbnail TEXT,
  description TEXT,
  long_description TEXT,
  instructor TEXT,
  syllabus JSONB,
  is_gated BOOLEAN DEFAULT false,
  material_link TEXT,
  featured BOOLEAN DEFAULT false,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Schedules Table
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  time TEXT,
  topic TEXT,
  mentor TEXT,
  date DATE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Materials Table
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  link TEXT,
  content TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Form Submissions Table
CREATE TABLE form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course TEXT NOT NULL,
  event_name TEXT,
  email TEXT,
  phone TEXT,
  class_name TEXT,
  name TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create Events Table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  event_date DATE,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create Gallery Table
CREATE TABLE gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- 7. Create Public Read Policies
CREATE POLICY "Public Read" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read" ON courses FOR SELECT USING (true);
CREATE POLICY "Public Read" ON schedules FOR SELECT USING (true);
CREATE POLICY "Public Read" ON materials FOR SELECT USING (true);
CREATE POLICY "Public Read" ON events FOR SELECT USING (true);
CREATE POLICY "Public Read" ON gallery FOR SELECT USING (true);

-- 8. Create Public Insert Policy for Form Submissions
CREATE POLICY "Public Insert" ON form_submissions FOR INSERT WITH CHECK (true);

-- 9. Storage Setup (Run these manually if needed)
-- Create bucket for thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 10. Admin Access Policies (Allow anyone to manage for now)
-- Categories
CREATE POLICY "Public Manage Categories" ON categories FOR ALL USING (true) WITH CHECK (true);
-- Courses
CREATE POLICY "Public Manage Courses" ON courses FOR ALL USING (true) WITH CHECK (true);
-- Schedules
CREATE POLICY "Public Manage Schedules" ON schedules FOR ALL USING (true) WITH CHECK (true);
-- Materials
CREATE POLICY "Public Manage Materials" ON materials FOR ALL USING (true) WITH CHECK (true);
-- Form Submissions
CREATE POLICY "Public Manage Submissions" ON form_submissions FOR ALL USING (true) WITH CHECK (true);
-- Events
CREATE POLICY "Public Manage Events" ON events FOR ALL USING (true) WITH CHECK (true);
-- Gallery
CREATE POLICY "Public Manage Gallery" ON gallery FOR ALL USING (true) WITH CHECK (true);

-- 11. Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');
CREATE POLICY "Public Manage" ON storage.objects FOR ALL USING (bucket_id = 'thumbnails') WITH CHECK (bucket_id = 'thumbnails');


