-- ============================================================
-- Ragunan Zoo — Database Initialization Script
-- Untuk PostgreSQL biasa (TANPA Supabase)
-- Jalankan sekali saat setup pertama kali
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS TABLE (menggantikan auth.users dari Supabase)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE,
  name TEXT,
  raw_user_meta_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 2. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT,
  name TEXT,
  email TEXT,
  child_mode BOOLEAN DEFAULT false,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 3. USER ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'visitor' CHECK (role IN ('visitor', 'staff', 'admin')),
  UNIQUE (user_id, role)
);

-- ============================================================
-- 4. USER PERMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  is_allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, permission_key)
);

-- ============================================================
-- 5. ANIMALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.animals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  latin_name TEXT,
  species TEXT,
  zone TEXT,
  status TEXT DEFAULT 'Dilindungi',
  description TEXT,
  description_en TEXT,
  image_url TEXT,
  health_status TEXT DEFAULT 'Sehat',
  habitat TEXT,
  habitat_en TEXT,
  location TEXT,
  latitude FLOAT,
  longitude FLOAT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  category TEXT,
  category_en TEXT,
  category_id UUID,
  model_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 6. PLANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.plants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  latin_name TEXT,
  species TEXT,
  zone TEXT,
  category TEXT,
  category_en TEXT,
  category_id UUID,
  location TEXT,
  habitat TEXT,
  habitat_en TEXT,
  description TEXT,
  description_en TEXT,
  status TEXT DEFAULT 'Aman',
  health_status TEXT DEFAULT 'Sehat',
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 7. CATEGORIES (flora & fauna)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_id TEXT NOT NULL,
  name_en TEXT,
  type TEXT NOT NULL DEFAULT 'fauna' CHECK (type IN ('flora', 'fauna')),
  icon TEXT DEFAULT '🐾',
  description_id TEXT,
  description_en TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_id TEXT,
  title_en TEXT,
  description TEXT,
  description_id TEXT,
  description_en TEXT,
  event_date DATE,
  time TEXT,
  zone TEXT,
  location TEXT,
  type TEXT DEFAULT 'feeding',
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 9. TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  visit_date DATE NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  ticket_type TEXT DEFAULT 'regular',
  price NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'active',
  code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 11. REMINDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reminders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_id INT REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, event_id)
);

-- ============================================================
-- 12. VENUES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.venues (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER,
  price_per_hour NUMERIC(12, 2),
  price_per_day NUMERIC(12, 2),
  image_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  facilities TEXT[],
  is_available BOOLEAN DEFAULT true,
  phone_number TEXT,
  whatsapp_number TEXT,
  panorama_url TEXT,
  has_panorama BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. SITE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  logo_url TEXT,
  logo_mobile_url TEXT,
  loading_logo_url TEXT,
  favicon_url TEXT,
  hero_image_url TEXT,
  mascot_image_url TEXT,
  map_image_url TEXT,
  site_name TEXT DEFAULT 'Taman Margasatwa Ragunan',
  -- Floating ticket button
  floating_ticket_enabled BOOLEAN DEFAULT true,
  floating_ticket_text_id TEXT DEFAULT 'Beli Tiket',
  floating_ticket_text_en TEXT DEFAULT 'Buy Ticket',
  floating_ticket_position TEXT DEFAULT 'center',
  floating_ticket_custom_icon_url TEXT,
  floating_ticket_icon_size TEXT DEFAULT 'medium',
  floating_ticket_use_schedule BOOLEAN DEFAULT false,
  floating_ticket_start_time TIME DEFAULT '08:00',
  floating_ticket_end_time TIME DEFAULT '17:00',
  -- Chat Us button
  chat_us_enabled BOOLEAN DEFAULT true,
  chat_us_number TEXT,
  chat_us_position TEXT DEFAULT 'center',
  chat_us_icon_url TEXT,
  chat_us_start_time TIME DEFAULT '08:00',
  chat_us_end_time TIME DEFAULT '17:00',
  chat_us_timezone TEXT DEFAULT 'Asia/Jakarta',
  chat_us_use_schedule BOOLEAN DEFAULT false,
  -- Hero ticket button
  hero_ticket_enabled BOOLEAN DEFAULT true,
  hero_ticket_use_schedule BOOLEAN DEFAULT false,
  hero_ticket_start_time TIME DEFAULT '08:00',
  hero_ticket_end_time TIME DEFAULT '17:00',
  -- Contact & External
  whatsapp_number TEXT,
  venue_whatsapp_number TEXT,
  venue_phone_number TEXT,
  ticket_external_url TEXT,
  -- Navbar visibility
  navbar_show_map BOOLEAN DEFAULT true,
  navbar_show_animals BOOLEAN DEFAULT true,
  navbar_show_tickets BOOLEAN DEFAULT true,
  navbar_show_events BOOLEAN DEFAULT true,
  navbar_show_qr_scan BOOLEAN DEFAULT true,
  navbar_show_profile BOOLEAN DEFAULT true,
  navbar_show_venues BOOLEAN DEFAULT true,
  navbar_show_news BOOLEAN DEFAULT true,
  navbar_show_gallery3d BOOLEAN DEFAULT true,
  -- Carousel
  carousel_autoplay_duration INTEGER DEFAULT 6000,
  -- Footer & Social Media
  footer_logo_url TEXT,
  footer_description_id TEXT,
  footer_description_en TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  social_twitter TEXT,
  social_youtube TEXT,
  social_tiktok TEXT,
  floating_ticket_icon TEXT,
  zoo_map_image_url TEXT,
  contact_address TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

-- ============================================================
-- 14. NEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_id TEXT,
  title_en TEXT,
  description TEXT,
  description_id TEXT,
  description_en TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT news_title_length CHECK (length(title) <= 500)
);

-- ============================================================
-- 15. VISITOR DATA
-- ============================================================
CREATE TABLE IF NOT EXISTS public.visitor_data (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  jumlah_pengunjung INTEGER DEFAULT 0,
  jumlah_kendaraan INTEGER DEFAULT 0,
  pengunjung_wahana INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 16. ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_id TEXT,
  title_en TEXT,
  content TEXT NOT NULL,
  content_id TEXT,
  content_en TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT announcements_title_length CHECK (length(title) <= 500)
);

-- ============================================================
-- 17. HERO BANNER
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hero_banner (
  id SERIAL PRIMARY KEY,
  title TEXT,
  title_id TEXT,
  title_en TEXT,
  subtitle TEXT,
  subtitle_id TEXT,
  subtitle_en TEXT,
  description_id TEXT,
  description_en TEXT,
  image_url TEXT,
  video_url TEXT,
  media_type TEXT DEFAULT 'image',
  link_url TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 18. ZONE MARKERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.zone_markers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  color TEXT NOT NULL DEFAULT '#3BA776',
  position_x NUMERIC NOT NULL DEFAULT 50,
  position_y NUMERIC NOT NULL DEFAULT 50,
  description TEXT,
  description_en TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 19. NAVBAR ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.navbar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id TEXT NOT NULL,
  label_en TEXT,
  path TEXT NOT NULL,
  path_en TEXT,
  icon TEXT DEFAULT 'Link',
  order_index INTEGER DEFAULT 0,
  show_in_top_nav BOOLEAN DEFAULT true,
  show_in_bottom_nav BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  is_dropdown BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.navbar_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 20. CUSTOM PAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.custom_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_id TEXT NOT NULL,
  title_en TEXT,
  content_id TEXT,
  content_en TEXT,
  image_urls TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  show_in_navbar BOOLEAN DEFAULT false,
  navbar_icon TEXT DEFAULT 'FileText',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 21. FEEDING SCHEDULES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feeding_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_id TEXT NOT NULL,
  name_en TEXT,
  times TEXT[] DEFAULT '{}',
  image_url TEXT,
  color TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 22. SYSTEM CONFIGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.system_configs (
  key TEXT PRIMARY KEY,
  value JSONB,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 23. TRIVIA QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trivia_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_id TEXT NOT NULL,
  text_en TEXT,
  type TEXT NOT NULL DEFAULT 'multiple_choice',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 24. PAGE VIEWS (Analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  session_id TEXT,
  user_id UUID,
  ip_hash TEXT,
  device_type TEXT DEFAULT 'desktop',
  browser TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 25. ANALYTICS DAILY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_views INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  top_pages JSONB DEFAULT '[]'::jsonb,
  devices JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 26. MEDIA GALLERY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.media_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  alt_text TEXT,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 27. WBS SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wbs_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  category TEXT NOT NULL,
  incident_date DATE,
  incident_location TEXT,
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  reported_person_name TEXT,
  reported_person_position TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 28. SERVICE REGISTRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.service_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code TEXT UNIQUE NOT NULL,
  program_type TEXT NOT NULL CHECK (program_type = ANY (ARRAY['pkl', 'research', 'koas', 'interview'])),
  -- Institution data
  institution_name TEXT NOT NULL,
  institution_address TEXT,
  institution_phone TEXT,
  institution_email TEXT,
  -- Participant data
  participant_name TEXT NOT NULL,
  participant_nim TEXT,
  participant_phone TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  study_program TEXT,
  -- Program details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  research_title TEXT,
  participant_count INTEGER DEFAULT 1,
  -- Documents
  cover_letter_url TEXT,
  proposal_url TEXT,
  student_id_url TEXT,
  -- Koas-specific
  faculty TEXT,
  rotation_department TEXT,
  supervisor_name TEXT,
  supervisor_phone TEXT,
  recommendation_letter_url TEXT,
  -- Interview-specific
  media_organization TEXT,
  interview_topic TEXT,
  target_interviewee TEXT,
  equipment_used TEXT,
  interview_date DATE,
  interview_time TEXT,
  journalist_id_url TEXT,
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 29. SERVICE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.service_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  admin_whatsapp TEXT,
  admin_email TEXT,
  cover_letter_template_url TEXT,
  proposal_template_url TEXT,
  required_documents_pkl JSONB DEFAULT '["Surat Pengantar dari Institusi", "Kartu Tanda Mahasiswa"]'::jsonb,
  required_documents_research JSONB DEFAULT '["Surat Pengantar dari Institusi", "Proposal Penelitian", "Kartu Tanda Mahasiswa"]'::jsonb,
  required_documents_koas JSONB DEFAULT '["Surat Pengantar dari Fakultas", "Surat Rekomendasi", "Kartu Tanda Mahasiswa"]'::jsonb,
  required_documents_interview JSONB DEFAULT '["Surat Pengantar dari Media", "Kartu Identitas Jurnalis"]'::jsonb,
  limit_pkl INTEGER,
  limit_research INTEGER,
  limit_koas INTEGER,
  limit_interview INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 30. SERVICE FAQS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.service_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('general', 'pkl', 'research', 'koas', 'interview')),
  question_id TEXT NOT NULL,
  question_en TEXT,
  answer_id TEXT NOT NULL,
  answer_en TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 31. SERVICE AVAILABILITY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.service_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  program_type TEXT NOT NULL CHECK (program_type IN ('pkl', 'research', 'koas', 'interview')),
  max_slots INTEGER NOT NULL DEFAULT 5,
  booked_slots INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, program_type)
);

-- ============================================================
-- 32. TOUR GUIDES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tour_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT,
  specialization TEXT[],
  languages TEXT[] DEFAULT ARRAY['id'],
  bio_id TEXT,
  bio_en TEXT,
  hourly_rate INTEGER NOT NULL DEFAULT 75000,
  rating NUMERIC(2,1) DEFAULT 5.0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 33. TOUR PACKAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tour_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_id TEXT NOT NULL,
  name_en TEXT,
  description_id TEXT,
  description_en TEXT,
  duration_hours NUMERIC(3,1) NOT NULL,
  min_participants INTEGER DEFAULT 1,
  max_participants INTEGER DEFAULT 20,
  icon TEXT DEFAULT 'Users',
  color_class TEXT DEFAULT 'primary',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 34. TOUR GUIDE SCHEDULES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tour_guide_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID REFERENCES public.tour_guides(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guide_id, date, start_time)
);

-- ============================================================
-- 35. TOUR BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tour_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code TEXT NOT NULL UNIQUE,
  guide_id UUID REFERENCES public.tour_guides(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.tour_packages(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_hours NUMERIC(3,1) NOT NULL,
  participants INTEGER DEFAULT 1,
  total_price INTEGER NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 36. TOUR GALLERY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tour_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption_id TEXT,
  caption_en TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 37. BOOKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id TEXT NOT NULL,
  title_en TEXT,
  author TEXT,
  description_id TEXT,
  description_en TEXT,
  category TEXT NOT NULL DEFAULT 'umum',
  cover_url TEXT,
  file_url TEXT,
  file_type TEXT DEFAULT 'pdf',
  page_count INTEGER,
  year_published INTEGER,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  price INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 38. USER PURCHASES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 39. WHATSAPP TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL,
  message_en TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 40. WHATS NEW ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.whats_new_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('animal', 'event', 'news', 'venue')),
  item_id TEXT NOT NULL,
  title_id TEXT NOT NULL,
  title_en TEXT,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 41. CHATBOT FAQS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chatbot_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL,
  question_en TEXT,
  answer_id TEXT NOT NULL,
  answer_en TEXT,
  keywords TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'umum',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 42. TICKET CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ticket_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_id TEXT NOT NULL,
  title_en TEXT,
  description_id TEXT,
  description_en TEXT,
  image_url TEXT,
  content_type TEXT DEFAULT 'info',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 43. TICKET SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ticket_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_image_url TEXT,
  hero_title_id TEXT,
  hero_title_en TEXT,
  hero_subtitle_id TEXT,
  hero_subtitle_en TEXT,
  show_pricing BOOLEAN DEFAULT true,
  regular_price INTEGER DEFAULT 25000,
  vip_price INTEGER DEFAULT 50000,
  child_discount NUMERIC(3,2) DEFAULT 0.5,
  external_ticket_url TEXT,
  regular_title_id TEXT DEFAULT 'Regular',
  regular_title_en TEXT DEFAULT 'Regular',
  regular_description_id TEXT DEFAULT 'Akses standar ke semua zona',
  regular_description_en TEXT DEFAULT 'Standard access to all zones',
  regular_link TEXT,
  regular_image_url TEXT,
  vip_title_id TEXT DEFAULT 'VIP',
  vip_title_en TEXT DEFAULT 'VIP',
  vip_description_id TEXT DEFAULT 'Akses prioritas + feeding time',
  vip_description_en TEXT DEFAULT 'Priority access + feeding time',
  vip_link TEXT,
  vip_image_url TEXT,
  section_title_id TEXT DEFAULT 'Pilih Jenis Pembelian Tiket',
  section_title_en TEXT DEFAULT 'Select Ticket Purchase Type',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID
);

-- ============================================================
-- 44. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 45. ZOO HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.zoo_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_id TEXT NOT NULL,
  title_en TEXT,
  content_id TEXT NOT NULL,
  content_en TEXT,
  year INTEGER,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 46. SERVICE STANDARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.service_standards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name_id TEXT NOT NULL,
  service_name_en TEXT,
  requirements_id TEXT,
  requirements_en TEXT,
  procedure_id TEXT,
  procedure_en TEXT,
  duration TEXT,
  cost TEXT,
  complaint_mechanism_id TEXT,
  complaint_mechanism_en TEXT,
  icon TEXT DEFAULT 'FileText',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 47. JDIH DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jdih_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_number TEXT NOT NULL,
  title_id TEXT NOT NULL,
  title_en TEXT,
  type TEXT NOT NULL DEFAULT 'peraturan',
  year INTEGER NOT NULL,
  date_enacted DATE,
  date_promulgated DATE,
  status TEXT NOT NULL DEFAULT 'berlaku',
  description_id TEXT,
  description_en TEXT,
  file_url TEXT,
  source_url TEXT,
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 48. ORGANIZATION MEMBERSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  full_name TEXT,
  logo_url TEXT,
  website_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_animals_category_id ON public.animals(category_id);
CREATE INDEX IF NOT EXISTS idx_animals_is_featured ON public.animals(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_animals_is_published ON public.animals(is_published);
CREATE INDEX IF NOT EXISTS idx_animals_name ON public.animals(name);

CREATE INDEX IF NOT EXISTS idx_plants_category_id ON public.plants(category_id);
CREATE INDEX IF NOT EXISTS idx_plants_is_featured ON public.plants(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_plants_is_published ON public.plants(is_published);
CREATE INDEX IF NOT EXISTS idx_plants_name ON public.plants(name);

CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON public.events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(type);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_visit_date ON public.tickets(visit_date);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_reg_tracking_code ON public.service_registrations(tracking_code);
CREATE INDEX IF NOT EXISTS idx_service_reg_status ON public.service_registrations(status);
CREATE INDEX IF NOT EXISTS idx_service_reg_program_type ON public.service_registrations(program_type);

CREATE INDEX IF NOT EXISTS idx_wbs_status ON public.wbs_submissions(status);
CREATE INDEX IF NOT EXISTS idx_wbs_created_at ON public.wbs_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);

CREATE INDEX IF NOT EXISTS idx_news_created_at ON public.news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_is_published ON public.news(is_published);

CREATE INDEX IF NOT EXISTS idx_tour_schedules_guide_date ON public.tour_guide_schedules(guide_id, date);
CREATE INDEX IF NOT EXISTS idx_custom_pages_slug ON public.custom_pages(slug);
CREATE INDEX IF NOT EXISTS idx_custom_pages_published ON public.custom_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_media_gallery_category ON public.media_gallery(category);
CREATE INDEX IF NOT EXISTS idx_media_gallery_created ON public.media_gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_navbar_items_parent_id ON public.navbar_items(parent_id);

-- ============================================================
-- FOREIGN KEYS (deferred — added after all tables exist)
-- ============================================================
DO $$
BEGIN
  -- animals.category_id → categories.id
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'animals_category_id_fkey') THEN
    ALTER TABLE public.animals ADD CONSTRAINT animals_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
  -- plants.category_id → categories.id
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'plants_category_id_fkey') THEN
    ALTER TABLE public.plants ADD CONSTRAINT plants_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Generate ticket code
CREATE OR REPLACE FUNCTION public.generate_ticket_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.code = 'TKT-' || LPAD(NEW.id::TEXT, 6, '0') || '-' || TO_CHAR(NEW.visit_date, 'YYMMDD');
  RETURN NEW;
END;
$$;

-- Increment book view count (SECURITY DEFINER equivalent — runs as DB owner)
CREATE OR REPLACE FUNCTION public.increment_book_view_count(book_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.books
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = book_id AND is_published = true;
END;
$$;

-- Increment book download count
CREATE OR REPLACE FUNCTION public.increment_book_download_count(book_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.books
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = book_id AND is_published = true;
END;
$$;

-- Simulate payment webhook
CREATE OR REPLACE FUNCTION public.simulate_payment_webhook(p_purchase_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_book_price INTEGER;
  v_purchase_amount INTEGER;
  v_status TEXT;
BEGIN
  SELECT b.price, u.amount, u.status 
  INTO v_book_price, v_purchase_amount, v_status
  FROM public.user_purchases u
  JOIN public.books b ON u.book_id = b.id
  WHERE u.id = p_purchase_id;

  IF v_status IS NULL OR v_status != 'pending' THEN
    RETURN false;
  END IF;

  IF p_amount = v_book_price AND v_purchase_amount = v_book_price THEN
    UPDATE public.user_purchases 
    SET status = 'success', updated_at = now()
    WHERE id = p_purchase_id;
    RETURN true;
  ELSE
    UPDATE public.user_purchases 
    SET status = 'failed', updated_at = now()
    WHERE id = p_purchase_id;
    RETURN false;
  END IF;
END;
$$;

-- Update availability when registration status changes
CREATE OR REPLACE FUNCTION public.update_availability_on_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.service_availability
    SET booked_slots = booked_slots + 1
    WHERE date = NEW.start_date AND program_type = NEW.program_type;
  END IF;
  
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE public.service_availability
    SET booked_slots = GREATEST(booked_slots - 1, 0)
    WHERE date = OLD.start_date AND program_type = OLD.program_type;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================================
-- CREATE TRIGGERS (safe with IF NOT EXISTS pattern)
-- ============================================================
DO $$
DECLARE
  triggers TEXT[][] := ARRAY[
    ARRAY['update_profiles_updated_at', 'profiles'],
    ARRAY['update_venues_updated_at', 'venues'],
    ARRAY['update_site_settings_updated_at', 'site_settings'],
    ARRAY['update_news_updated_at', 'news'],
    ARRAY['update_visitor_data_updated_at', 'visitor_data'],
    ARRAY['update_announcements_updated_at', 'announcements'],
    ARRAY['update_zone_markers_updated_at', 'zone_markers'],
    ARRAY['update_custom_pages_updated_at', 'custom_pages'],
    ARRAY['update_media_gallery_updated_at', 'media_gallery'],
    ARRAY['update_wbs_submissions_updated_at', 'wbs_submissions'],
    ARRAY['update_service_registrations_updated_at', 'service_registrations'],
    ARRAY['update_service_availability_updated_at', 'service_availability'],
    ARRAY['update_tour_guides_updated_at', 'tour_guides'],
    ARRAY['update_tour_packages_updated_at', 'tour_packages'],
    ARRAY['update_tour_bookings_updated_at', 'tour_bookings'],
    ARRAY['update_books_updated_at', 'books'],
    ARRAY['update_user_purchases_updated_at', 'user_purchases'],
    ARRAY['update_whatsapp_templates_updated_at', 'whatsapp_templates'],
    ARRAY['update_whats_new_items_updated_at', 'whats_new_items'],
    ARRAY['update_chatbot_faqs_updated_at', 'chatbot_faqs'],
    ARRAY['update_zoo_history_updated_at', 'zoo_history'],
    ARRAY['update_service_standards_updated_at', 'service_standards'],
    ARRAY['update_jdih_documents_updated_at', 'jdih_documents'],
    ARRAY['update_categories_updated_at', 'categories'],
    ARRAY['update_user_permissions_updated_at', 'user_permissions']
  ];
  t TEXT[];
BEGIN
  FOREACH t SLICE 1 IN ARRAY triggers
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = t[1]) THEN
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()',
        t[1], t[2]
      );
    END IF;
  END LOOP;

  -- Ticket code trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'generate_ticket_code_trigger') THEN
    CREATE TRIGGER generate_ticket_code_trigger
      BEFORE INSERT ON public.tickets
      FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_code();
  END IF;

  -- Service registration availability trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_availability_on_status_change') THEN
    CREATE TRIGGER update_availability_on_status_change
      AFTER UPDATE ON public.service_registrations
      FOR EACH ROW EXECUTE FUNCTION public.update_availability_on_registration();
  END IF;
END $$;

-- ============================================================
-- DEFAULT DATA (seed essential config)
-- ============================================================

-- Default site settings
INSERT INTO public.site_settings (id, site_name, footer_description_id, footer_description_en, contact_address, contact_phone, contact_email)
VALUES (
  'main',
  'Taman Margasatwa Ragunan',
  'Pusat konservasi kelas dunia, pusat edukasi, dan taman rekreasi yang didedikasikan untuk pelestarian satwa liar.',
  'A world-class conservation center, education hub, and recreation park dedicated to wildlife preservation.',
  'Jl. Harsono RM No. 1, Ragunan, Pasar Minggu, Jakarta Selatan 12550',
  '(021) 7884 7114',
  'info@ragunanzoo.jakarta.go.id'
) ON CONFLICT (id) DO NOTHING;

-- Default service settings
INSERT INTO public.service_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- Default ticket settings
INSERT INTO public.ticket_settings (
  hero_title_id, hero_title_en,
  hero_subtitle_id, hero_subtitle_en,
  regular_price, vip_price, child_discount
) VALUES (
  'Beli Tiket Masuk', 'Buy Entry Tickets',
  'Pesan tiket kunjungan Anda sekarang', 'Book your visit tickets now',
  25000, 50000, 0.5
) ON CONFLICT DO NOTHING;

-- Default categories
INSERT INTO public.categories (id, name_id, name_en, type, icon, description_id, description_en, order_index) VALUES
('c0000001-0000-0000-0000-000000000001', 'Mamalia', 'Mammals', 'fauna', '🦁', 'Hewan menyusui berdarah panas', 'Warm-blooded nursing animals', 1),
('c0000001-0000-0000-0000-000000000002', 'Reptil', 'Reptiles', 'fauna', '🦎', 'Hewan berdarah dingin bersisik', 'Cold-blooded scaly animals', 2),
('c0000001-0000-0000-0000-000000000003', 'Burung', 'Birds', 'fauna', '🦅', 'Hewan bersayap dan berbulu', 'Feathered winged animals', 3),
('c0000001-0000-0000-0000-000000000004', 'Primata', 'Primates', 'fauna', '🐒', 'Kelompok mamalia tingkat tinggi', 'Higher-order mammal group', 4),
('c0000001-0000-0000-0000-000000000005', 'Ikan', 'Fish', 'fauna', '🐟', 'Hewan air bertulang belakang', 'Aquatic vertebrates', 5),
('c0000001-0000-0000-0000-000000000006', 'Pohon', 'Trees', 'flora', '🌳', 'Tumbuhan berkayu besar', 'Large woody plants', 6),
('c0000001-0000-0000-0000-000000000007', 'Bunga', 'Flowers', 'flora', '🌸', 'Tumbuhan berbunga hias', 'Ornamental flowering plants', 7),
('c0000001-0000-0000-0000-000000000008', 'Tanaman Langka', 'Rare Plants', 'flora', '🌿', 'Tumbuhan yang dilindungi', 'Protected plant species', 8),
('c0000001-0000-0000-0000-000000000009', 'Anggrek', 'Orchids', 'flora', '🌸', 'Tanaman anggrek eksotis', 'Exotic orchid plants', 9),
('c0000001-0000-0000-0000-000000000010', 'Tanaman Karnivora', 'Carnivorous Plants', 'flora', '🪴', 'Tanaman pemakan serangga unik', 'Unique insect-eating plants', 10),
('c0000001-0000-0000-0000-000000000011', 'Bambu', 'Bamboo', 'flora', '🎋', 'Tanaman rumpun bambu raksasa', 'Giant bamboo grove plants', 11)
ON CONFLICT (id) DO UPDATE SET
  name_id = EXCLUDED.name_id,
  name_en = EXCLUDED.name_en,
  type = EXCLUDED.type,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;

-- Default zone markers
INSERT INTO public.zone_markers (id, name, name_en, color, position_x, position_y, description, description_en) VALUES
('primata', 'Primata', 'Primates', '#F7941D', 25, 35, 'Zona habitat orangutan, bekantan, dan primata lainnya', 'Habitat zone for orangutans, proboscis monkeys, and other primates'),
('mamalia', 'Mamalia', 'Mammals', '#3BA776', 50, 25, 'Zona gajah, rusa, dan mamalia besar lainnya', 'Zone for elephants, deer, and other large mammals'),
('karnivora', 'Karnivora', 'Carnivores', '#E53935', 75, 40, 'Zona harimau, singa, dan karnivora lainnya', 'Zone for tigers, lions, and other carnivores'),
('burung', 'Burung', 'Birds', '#53B4E6', 35, 65, 'Taman burung dengan berbagai spesies burung eksotis', 'Bird park with various exotic bird species'),
('reptil', 'Reptil', 'Reptiles', '#8E44AD', 65, 70, 'Zona komodo, ular, dan reptil lainnya', 'Zone for komodo dragons, snakes, and other reptiles')
ON CONFLICT (id) DO NOTHING;

-- Default navbar items (Modern Hierarchical Navigation - Model 1)
INSERT INTO public.navbar_items (id, label_id, label_en, path, icon, order_index, show_in_top_nav, show_in_bottom_nav, is_active, is_system, is_dropdown, parent_id) VALUES
-- 1. Beranda
('f333798b-cbe9-468f-9626-269482494208', 'Beranda', 'Home', '/', 'Home', 10, true, true, true, true, false, NULL),
-- 2. Tiket & Tarif
('15cd6ccd-0571-4c2e-a943-a0c7b46844a0', 'Tiket & Tarif', 'Tickets & Pricing', '/tickets', 'Ticket', 20, true, true, true, true, false, NULL),
-- 3. Jelajah & Children
('af0ec70a-6ef1-4503-b50e-657dec412cb9', 'Jelajah', 'Explore', '#', 'Compass', 30, true, true, true, false, true, NULL),
('bf4c6499-ff0b-4d4e-9850-1222239d3100', 'Fauna', 'Fauna', '/fauna', 'PawPrint', 31, true, true, true, false, false, 'af0ec70a-6ef1-4503-b50e-657dec412cb9'),
('3e7d5d34-d2ee-4cb5-9051-eac27e24f16e', 'Flora', 'Flora', '/flora', 'Leaf', 32, true, true, true, false, false, 'af0ec70a-6ef1-4503-b50e-657dec412cb9'),
('b58af999-fb4c-4d95-b81d-4e343534a5ee', 'Peta', 'Map', '/map', 'Map', 33, true, true, true, false, false, 'af0ec70a-6ef1-4503-b50e-657dec412cb9'),
('b1f6cb9e-dfd3-4956-aa86-82f9c2e88460', 'Panduan Suara', 'Audio Guide', '/audio-guide', 'Headphones', 34, true, true, true, false, false, 'af0ec70a-6ef1-4503-b50e-657dec412cb9'),
('75395cec-d5fd-4417-bb8a-d17d68671e8e', 'Galeri 3D', '3D Gallery', '/gallery-3d', 'Box', 35, true, true, true, false, false, 'af0ec70a-6ef1-4503-b50e-657dec412cb9'),
-- 4. Fasilitas & Children
('8d060c3e-4bdc-4917-9cdc-0ace1e1b7cc5', 'Fasilitas', 'Facilities', '#', 'Building2', 40, true, true, true, false, true, NULL),
('e8200ad5-2f13-4829-b3a1-11ce324cbf21', 'Layanan', 'Services', '/services', 'Info', 41, true, true, true, false, false, '8d060c3e-4bdc-4917-9cdc-0ace1e1b7cc5'),
('20e97d55-9744-40e6-ba67-07d710368c2a', 'Sewa Tempat', 'Rent Venue', '/venues', 'MapPin', 42, true, true, true, false, false, '8d060c3e-4bdc-4917-9cdc-0ace1e1b7cc5'),
('11d7cc42-f212-4739-8805-5d8de8c59737', 'Pemandu Wisata', 'Tour Guide', '/tour-guide', 'Users', 43, true, true, true, false, false, '8d060c3e-4bdc-4917-9cdc-0ace1e1b7cc5'),
('c6f91483-a6ec-4e35-b48a-5f71d847fea7', 'Standar Pelayanan', 'Service Standards', '/standar-pelayanan', 'CheckCircle', 44, true, true, true, false, false, '8d060c3e-4bdc-4917-9cdc-0ace1e1b7cc5'),
-- 5. Informasi & Children (including reporting features)
('721181f0-7634-4038-9bbf-a3435643c525', 'Informasi', 'Information', '#', 'Info', 50, true, true, true, false, true, NULL),
('ed7ea28f-2df1-44e7-a336-844b690baca7', 'Berita', 'News', '/news', 'Newspaper', 51, true, true, true, false, false, '721181f0-7634-4038-9bbf-a3435643c525'),
('2cc50b09-1bc3-42eb-98a5-96f7aabc1e19', 'Event', 'Events', '/events', 'Calendar', 52, true, true, true, false, false, '721181f0-7634-4038-9bbf-a3435643c525'),
('b1d8799f-8613-44bb-9e94-99da43a5e4aa', 'Sejarah', 'History', '/history', 'Landmark', 53, true, true, true, false, false, '721181f0-7634-4038-9bbf-a3435643c525'),
('4072ca4d-4916-41e0-b970-66b26b7274c8', 'Perpustakaan', 'Library', '/perpustakaan', 'Book', 54, true, true, true, false, false, '721181f0-7634-4038-9bbf-a3435643c525'),
('86e2548f-bcc4-4891-a1e0-b1213c25352a', 'JDIH', 'JDIH', '/jdih', 'Scale', 55, true, true, true, false, false, '721181f0-7634-4038-9bbf-a3435643c525'),
('99d770b9-c9ed-4ad7-a833-c78d61b9c900', 'Lapor Fasilitas', 'Facility Report', '/report-facility', 'AlertTriangle', 56, true, false, true, false, false, '721181f0-7634-4038-9bbf-a3435643c525'),
('e1c4fa91-e5df-4c7a-bf4b-abe99d00f225', 'Lacak Laporan', 'Track Report', '/track-report', 'Link', 57, true, false, true, false, false, '721181f0-7634-4038-9bbf-a3435643c525'),
('5bed0661-4248-473c-916d-562eaf0a1a88', 'WBS', 'WBS', '/wbs', 'ShieldAlert', 58, true, false, true, false, false, '721181f0-7634-4038-9bbf-a3435643c525')
ON CONFLICT (id) DO UPDATE SET
  label_id = EXCLUDED.label_id,
  label_en = EXCLUDED.label_en,
  path = EXCLUDED.path,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index,
  show_in_top_nav = EXCLUDED.show_in_top_nav,
  show_in_bottom_nav = EXCLUDED.show_in_bottom_nav,
  is_dropdown = EXCLUDED.is_dropdown,
  parent_id = EXCLUDED.parent_id;

-- Default system config for maintenance mode
INSERT INTO public.system_configs (key, value, description)
VALUES ('maintenance_mode', '{"enabled": false}'::jsonb, 'Maintenance mode toggle')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Create default admin user (password: admin123)
-- CHANGE THIS IMMEDIATELY IN PRODUCTION!
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'admin') THEN
    INSERT INTO public.users (id, username, password_hash, email, name)
    VALUES (
      gen_random_uuid(),
      'admin',
      -- bcrypt hash of 'admin123' — will be verified by bcryptjs in the backend
      '$2a$10$rPEwI4q5T5bOYEjJ.wDQeeIcTmJdE7xGiKjy.LKMC0o4bKqYkmAi',
      'admin@ragunanzoo.jakarta.go.id',
      'Administrator'
    );
  END IF;
END $$;

-- Create admin profile and role
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM public.users WHERE username = 'admin';
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, name, email) VALUES (admin_id, 'Administrator', 'admin@ragunanzoo.jakarta.go.id') ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (admin_id, 'admin') ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- Triggers for multi-language and dual-column automatic synchronization
CREATE OR REPLACE FUNCTION sync_announcements_fields() RETURNS TRIGGER AS $$
BEGIN
    NEW.title := COALESCE(NEW.title, NEW.title_id, '');
    NEW.title_id := COALESCE(NEW.title_id, NEW.title, '');
    NEW.content := COALESCE(NEW.content, NEW.content_id, '');
    NEW.content_id := COALESCE(NEW.content_id, NEW.content, '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_announcements_fields ON public.announcements;
CREATE TRIGGER trg_sync_announcements_fields
BEFORE INSERT OR UPDATE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION sync_announcements_fields();

CREATE OR REPLACE FUNCTION sync_books_fields() RETURNS TRIGGER AS $$
BEGIN
    NEW.title := COALESCE(NEW.title, NEW.title_id, '');
    NEW.title_id := COALESCE(NEW.title_id, NEW.title, '');
    NEW.description := COALESCE(NEW.description, NEW.description_id, '');
    NEW.description_id := COALESCE(NEW.description_id, NEW.description, '');
    NEW.year := COALESCE(NEW.year, NEW.year_published);
    NEW.year_published := COALESCE(NEW.year_published, NEW.year);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_books_fields ON public.books;
CREATE TRIGGER trg_sync_books_fields
BEFORE INSERT OR UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION sync_books_fields();

CREATE OR REPLACE FUNCTION sync_custom_pages_fields() RETURNS TRIGGER AS $$
BEGIN
    NEW.title := COALESCE(NEW.title, NEW.title_id, '');
    NEW.title_id := COALESCE(NEW.title_id, NEW.title, '');
    NEW.content := COALESCE(NEW.content, NEW.content_id, '');
    NEW.content_id := COALESCE(NEW.content_id, NEW.content, '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_custom_pages_fields ON public.custom_pages;
CREATE TRIGGER trg_sync_custom_pages_fields
BEFORE INSERT OR UPDATE ON public.custom_pages
FOR EACH ROW EXECUTE FUNCTION sync_custom_pages_fields();

CREATE OR REPLACE FUNCTION sync_events_fields() RETURNS TRIGGER AS $$
BEGIN
    NEW.title := COALESCE(NEW.title, NEW.title_id, '');
    NEW.title_id := COALESCE(NEW.title_id, NEW.title, '');
    NEW.description := COALESCE(NEW.description, NEW.description_id, '');
    NEW.description_id := COALESCE(NEW.description_id, NEW.description, '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_events_fields ON public.events;
CREATE TRIGGER trg_sync_events_fields
BEFORE INSERT OR UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION sync_events_fields();

CREATE OR REPLACE FUNCTION sync_news_fields() RETURNS TRIGGER AS $$
BEGIN
    NEW.title := COALESCE(NEW.title, NEW.title_id, '');
    NEW.title_id := COALESCE(NEW.title_id, NEW.title, '');
    NEW.description := COALESCE(NEW.description, NEW.description_id, '');
    NEW.description_id := COALESCE(NEW.description_id, NEW.description, '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_news_fields ON public.news;
CREATE TRIGGER trg_sync_news_fields
BEFORE INSERT OR UPDATE ON public.news
FOR EACH ROW EXECUTE FUNCTION sync_news_fields();

CREATE OR REPLACE FUNCTION sync_hero_banner_fields() RETURNS TRIGGER AS $$
BEGIN
    NEW.title := COALESCE(NEW.title, NEW.title_id, '');
    NEW.title_id := COALESCE(NEW.title_id, NEW.title, '');
    NEW.subtitle := COALESCE(NEW.subtitle, NEW.subtitle_id, '');
    NEW.subtitle_id := COALESCE(NEW.subtitle_id, NEW.subtitle, '');
    NEW.description := COALESCE(NEW.description, NEW.description_id, '');
    NEW.description_id := COALESCE(NEW.description_id, NEW.description, '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_hero_banner_fields ON public.hero_banner;
CREATE TRIGGER trg_sync_hero_banner_fields
BEFORE INSERT OR UPDATE ON public.hero_banner
FOR EACH ROW EXECUTE FUNCTION sync_hero_banner_fields();

-- ============================================================
-- DONE! Database initialized successfully.
-- ============================================================

-- ============================================================
-- GPS MAP INTERACTIVE — TITIK POI & JALUR KERETA WISATA
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gps_pois (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL DEFAULT 'animal',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  color TEXT DEFAULT '#22c55e',
  emoji TEXT DEFAULT '📍',
  description TEXT,
  description_en TEXT,
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_temporarily_closed BOOLEAN DEFAULT false,
  closure_reason TEXT,
  closure_until DATE,
  -- Feeding (satwa)
  feeding_time TEXT,
  feeding_time_hour INT,
  feeding_time_minute INT,
  feeding_note TEXT,
  -- Operating hours (fasilitas)
  operating_hours_open TEXT,
  operating_hours_close TEXT,
  -- Capacity zone status
  capacity_status TEXT DEFAULT 'normal' CHECK (capacity_status IN ('normal','padat','sepi')),
  -- Local announcement
  local_announcement TEXT,
  announcement_expires_at TIMESTAMPTZ,
  -- Extra details
  latin_name TEXT,
  conservation_status TEXT,
  origin TEXT,
  diet TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tram_route_points (
  id SERIAL PRIMARY KEY,
  sequence_order INT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  halt_name TEXT,
  is_halt BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: GPS POIs from ragunan-data.js (animals)
INSERT INTO public.gps_pois (id, name, name_en, category, lat, lng, color, emoji, description, feeding_time, feeding_time_hour, feeding_time_minute, feeding_note, latin_name, conservation_status, sort_order)
VALUES
  ('gajah_sumatera','Gajah Sumatera','Sumatran Elephant','animal',-6.3125,106.8232,'#388e3c','🐘','Kandang gajah sumatera luas terbuka dengan panggung observasi kanopi teduh bertingkat dan kolam mandi alami.','14.00 WIB',14,0,'Atraksi Mandi & Pemberian Makan Gajah','Elephas maximus sumatranus','Kritis Terancam Punah (CR)',10),
  ('harimau_sumatera','Harimau Sumatera','Sumatran Tiger','animal',-6.3155,106.8208,'#e65100','🐅','Habitat replika hutan hujan lebat dengan selokan air dan bebatuan alami untuk melatih naluri berburu.','11.30 WIB',11,30,'Pemberian Pakan Daging Segar Predator','Panthera tigris sumatrae','Kritis Terancam Punah (CR)',20),
  ('schmutzer_primata','Pusat Primata Schmutzer (Gorila & Orangutan)','Schmutzer Primate Center','animal',-6.3138,106.8175,'#f57c00','🦍','Salah satu pusat konservasi primata termodern di dunia dengan area open-enclosure alami dan jembatan kanopi.','13.30 WIB',13,30,'Enrichment Buah & Sayuran Gorila','Gorilla gorilla & Pongo pygmaeus','Kritis Terancam Punah (CR)',30),
  ('komodo','Komodo & Taman Reptil','Komodo & Reptile Garden','animal',-6.3115,106.8170,'#6a1b9a','🦎','Zona reptil terlengkap dengan terarium kaca, kandang pasir savana komodo, serta koleksi ular piton raksasa.','10.30 WIB',10,30,'Atraksi Berburu Komodo (Rabu & Minggu)','Varanus komodoensis','Genteng (EN)',40),
  ('jerapah','Jerapah & Zebra Savana','Giraffe & Zebra Savanna','animal',-6.3102,106.8222,'#2e7d32','🦒','Padang rumput terbuka dengan pohon rindang tempat bermain keluarga jerapah bersanding dengan zebra.','15.00 WIB',15,0,'Pemberian Makan Panggung Leher Tinggi','Giraffa camelopardalis','Rentan (VU)',50),
  ('beruang_madu','Beruang Madu','Sun Bear','animal',-6.3145,106.8222,'#5d4037','🐻','Habitat tebing kayu dengan kolam pemandian khusus beruang madu Kalimantan.','09.30 WIB',9,30,'Pemberian Madu & Sarang Lebah Alami','Helarctos malayanus','Rentan (VU)',60),
  ('singa_afrika','Singa Afrika','African Lion','animal',-6.3158,106.8195,'#f9a825','🦁','Savana terbuka dengan tebing batu alam tempat singa jantan berteriak sambut pengunjung.','12.00 WIB',12,0,'Pemberian Daging Segar Singa','Panthera leo','Rentan (VU)',70),
  ('kuda_nil','Kuda Nil & Kolam Renang','Hippopotamus Pool','animal',-6.3172,106.8225,'#0277bd','🦛','Kolam raksasa transparan dengan panel kaca bawah air untuk menyaksikan kuda nil berenang.','11.00 WIB',11,0,'Pemberian Sayuran & Rumput Segar','Hippopotamus amphibius','Rentan (VU)',80),
  ('buaya','Buaya Muara & Taman Air','Saltwater Crocodile','animal',-6.3110,106.8185,'#33691e','🐊','Kolam buaya muara raksasa terbuka dengan pagar pengaman berlapis ganda.','10.00 WIB',10,0,'Pemberian Ikan Utuh (Rabu & Sabtu)','Crocodylus porosus','Rentang Luas',90),
  ('orangutan','Orangutan Sumatera & Kalimantan','Orangutan House','animal',-6.3128,106.8168,'#bf360c','🦧','Rumah orangutan dengan tali dan pohon panjat alami untuk enrichment harian.','10.00 WIB',10,0,'Enrichment Buah Hutan Segar','Pongo pygmaeus','Kritis Terancam Punah (CR)',100),
  ('elang_jawa','Elang Jawa & Kandang Aviarium','Javan Hawk-Eagle Aviary','animal',-6.3096,106.8238,'#1565c0','🦅','Aviarium megabesar dengan kondisi hutan mini untuk burung-burung raptor endemik Indonesia.','08.00 WIB',8,0,'Pemberian Tikus & Daging Mentah','Nisaetus bartelsi','Kritis Terancam Punah (CR)',110),
  ('taman_satwa_anak','Taman Satwa Anak & Akuarium','Children Animal Park','animal',-6.3075,106.8235,'#0097a7','🐇','Area rekreasi ramah keluarga dengan akuarium Arapaima gigas, panggung satwa jinak, dan wahana anak.','Sepanjang Hari',9,0,'Wahana Interaksi & Memberi Makan Kelinci/Kambing',NULL,NULL,120),
  ('tapir','Kandang Tapir Belang','Malayan Tapir','animal',-6.3142,106.8242,'#37474f','🦡','Area rindang berkanopi pohon beringin dengan kubangan air bersih tempat tapir suka berkubang.','10.15 WIB',10,15,'Pemberian Sayur & Buah Segar','Tapirus indicus','Genteng (EN)',130),
  -- Facilities: Gates
  ('pintu_utara','Pintu Masuk Utama (Pintu Utara)','Main Entrance (North)','ticket',-6.3045,106.8198,'#013a13','🚪','Pintu masuk gerbang utama Ragunan, terhubung dengan Halte TransJakarta dan loket JakCard.',NULL,NULL,NULL,NULL,NULL,NULL,200),
  ('pintu_barat','Pintu Masuk Barat','West Entrance','ticket',-6.3105,106.8130,'#013a13','🚪','Pintu masuk sisi barat (Jl. Kav Polri), dekat area parkir dan loket JakCard.',NULL,NULL,NULL,NULL,NULL,NULL,210),
  ('pintu_timur','Pintu Masuk Timur','East Entrance','ticket',-6.3132,106.8272,'#013a13','🚪','Pintu masuk koridor timur rindang, akses nyaman pejalan kaki.',NULL,NULL,NULL,NULL,NULL,NULL,220),
  ('pintu_selatan','Pintu Masuk Selatan','South Entrance','ticket',-6.3195,106.8235,'#013a13','🚪','Pintu gerbang selatan Ragunan dekat akses TB Simatupang.',NULL,NULL,NULL,NULL,NULL,NULL,230),
  -- Facilities: Toilet
  ('toilet_utara','Toilet & Laktasi Plaza Utara','Restroom & Nursing (North)','toilet',-6.3060,106.8205,'#00838f','🚻','Toilet bersih modern, ramah difabel, wastafel otomatis, dan ruang menyusui.',NULL,NULL,NULL,NULL,NULL,NULL,300),
  ('toilet_danau','Toilet & Wastafel Danau Pelikan','Restroom (Pelican Lake)','toilet',-6.3094,106.8195,'#00838f','🚻','Toilet umum berkapasitas besar di pinggir danau.',NULL,NULL,NULL,NULL,NULL,NULL,310),
  ('toilet_schmutzer','Toilet Difabel & Laktasi Schmutzer','Accessible Restroom (Schmutzer)','toilet',-6.3140,106.8168,'#00838f','🚻','Fasilitas sanitasi berstandar internasional ramah anak di gerbang Schmutzer.',NULL,NULL,NULL,NULL,NULL,NULL,320),
  ('toilet_gajah','Toilet Koridor Gajah & Mamalia','Restroom (Elephant Corridor)','toilet',-6.3120,106.8242,'#00838f','🚻','Toilet umum berkanopi bambu di sebelah panggung observasi gajah.',NULL,NULL,NULL,NULL,NULL,NULL,330),
  ('toilet_selatan','Toilet Paviliun Rimba Selatan','Restroom (South Jungle)','toilet',-6.3175,106.8218,'#00838f','🚻','Toilet umum dekat koridor harimau dan kuda nil.',NULL,NULL,NULL,NULL,NULL,NULL,340),
  -- Facilities: Musholla
  ('musholla_utama','Masjid Al-Falah & Tempat Wudhu','Al-Falah Mosque','musholla',-6.3070,106.8192,'#2e7d32','🕌','Masjid utama ber-AC dengan perlengkapan sholat lengkap dan tempat wudhu terpisah.',NULL,NULL,NULL,NULL,NULL,NULL,400),
  ('musholla_schmutzer','Musholla Paviliun Primata','Prayer Room (Schmutzer)','musholla',-6.3130,106.8165,'#2e7d32','🕌','Musholla asri di dekat pintu keluar Pusat Primata Schmutzer.',NULL,NULL,NULL,NULL,NULL,NULL,410),
  ('musholla_timur','Musholla Rindang Koridor Timur','Prayer Room (East Corridor)','musholla',-6.3135,106.8258,'#2e7d32','🕌','Musholla kayu rindang di bawah naungan pohon trembesi.',NULL,NULL,NULL,NULL,NULL,NULL,420),
  -- Facilities: Kuliner
  ('foodcourt_danau','Pujasera Danau Ragunan','Lake Food Court','kuliner',-6.3082,106.8188,'#ef6c00','🍜','Sentra kuliner: es kelapa muda, soto betawi, pecel ayam, dan aneka jajanan khas Jakarta.',NULL,NULL,NULL,NULL,NULL,NULL,500),
  ('foodcourt_schmutzer','Kafe Rindang Primata','Primate Café','kuliner',-6.3125,106.8180,'#ef6c00','☕','Kafe santai: kopi nusantara, gelato buah segar, dan roti bakar dengan pemandangan kanopi.',NULL,NULL,NULL,NULL,NULL,NULL,510),
  ('foodcourt_gajah','Kios Kuliner & Minuman Segar Gajah','Elephant Food Kiosk','kuliner',-6.3118,106.8220,'#ef6c00','🧃','Stand aneka minuman dingin, es krim, kentang goreng, dan air kelapa hijau.',NULL,NULL,NULL,NULL,NULL,NULL,520),
  -- Facilities: Tram
  ('halte_kereta_utara','Halte Kereta Keliling 1 (Plaza Utama)','Tram Stop 1 (Main Plaza)','tram',-6.3062,106.8195,'#1565c0','🚋','Titik awal naik kereta wisata keliling dengan tarif Rp 10.000/orang.',NULL,NULL,NULL,NULL,NULL,NULL,600),
  ('halte_kereta_danau','Halte Kereta Keliling 2 (Danau Pelikan)','Tram Stop 2 (Pelican Lake)','tram',-6.3090,106.8214,'#1565c0','🚋','Halte transit kereta wisata dekat area danau dan panggung satwa anak.',NULL,NULL,NULL,NULL,NULL,NULL,610),
  ('halte_kereta_gajah','Halte Kereta Keliling 3 (Gajah Sumatera)','Tram Stop 3 (Elephant)','tram',-6.3115,106.8240,'#1565c0','🚋','Halte pemberhentian bagi pengunjung yang ingin menyaksikan atraksi mandi gajah.',NULL,NULL,NULL,NULL,NULL,NULL,620),
  ('halte_kereta_harimau','Halte Kereta Keliling 4 (Karnivora Rimba)','Tram Stop 4 (Carnivore)','tram',-6.3160,106.8215,'#1565c0','🚋','Halte transit selatan dekat kandang harimau sumatera dan beruang madu.',NULL,NULL,NULL,NULL,NULL,NULL,630),
  -- Facilities: Medical
  ('pos_medis_p3k','Pos Medis & P3K Ragunan','Medical Post & First Aid','medical',-6.3065,106.8210,'#c62828','🏥','Posko darurat medis dengan tenaga perawat siap siaga, kotak P3K lengkap, oksigen, dan ambulans siaga.',NULL,NULL,NULL,NULL,NULL,NULL,700)
ON CONFLICT (id) DO NOTHING;

-- Seed: Tram Route Waypoints
INSERT INTO public.tram_route_points (sequence_order, lat, lng, halt_name, is_halt)
VALUES
  (1,  -6.3062, 106.8195, 'Halte 1 - Plaza Masuk Utara', true),
  (2,  -6.3075, 106.8210, NULL, false),
  (3,  -6.3090, 106.8214, 'Halte 2 - Danau Pelikan', true),
  (4,  -6.3100, 106.8228, NULL, false),
  (5,  -6.3115, 106.8240, 'Halte 3 - Gajah Sumatera', true),
  (6,  -6.3130, 106.8250, NULL, false),
  (7,  -6.3148, 106.8238, NULL, false),
  (8,  -6.3160, 106.8215, 'Halte 4 - Karnivora Rimba Selatan', true),
  (9,  -6.3165, 106.8195, NULL, false),
  (10, -6.3150, 106.8182, NULL, false),
  (11, -6.3135, 106.8172, NULL, false),
  (12, -6.3115, 106.8168, NULL, false),
  (13, -6.3095, 106.8180, NULL, false),
  (14, -6.3078, 106.8188, NULL, false),
  (15, -6.3062, 106.8195, NULL, false)
ON CONFLICT DO NOTHING;

