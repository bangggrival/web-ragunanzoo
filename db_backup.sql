--
-- PostgreSQL database dump
--

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP POLICY IF EXISTS "Validated page views insert" ON public.page_views;
DROP POLICY IF EXISTS "System insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Public read access" ON public.feeding_schedules;
DROP POLICY IF EXISTS "Enable read access for all users on trivia_questions" ON public.trivia_questions;
DROP POLICY IF EXISTS "Enable read access for all users on system_configs" ON public.system_configs;
DROP POLICY IF EXISTS "Enable all access for all users on trivia_questions" ON public.trivia_questions;
DROP POLICY IF EXISTS "Enable all access for all users on system_configs" ON public.system_configs;
DROP POLICY IF EXISTS "Anyone can view zone markers" ON public.zone_markers;
DROP POLICY IF EXISTS "Anyone can view venues" ON public.venues;
DROP POLICY IF EXISTS "Anyone can view ticket settings" ON public.ticket_settings;
DROP POLICY IF EXISTS "Anyone can view service settings" ON public.service_settings;
DROP POLICY IF EXISTS "Anyone can view service availability" ON public.service_availability;
DROP POLICY IF EXISTS "Anyone can view registration by tracking code" ON public.service_registrations;
DROP POLICY IF EXISTS "Anyone can view published news" ON public.news;
DROP POLICY IF EXISTS "Anyone can view published history" ON public.zoo_history;
DROP POLICY IF EXISTS "Anyone can view published custom pages" ON public.custom_pages;
DROP POLICY IF EXISTS "Anyone can view published books" ON public.books;
DROP POLICY IF EXISTS "Anyone can view published JDIH documents" ON public.jdih_documents;
DROP POLICY IF EXISTS "Anyone can view plants" ON public.plants;
DROP POLICY IF EXISTS "Anyone can view hero banners" ON public.hero_banner;
DROP POLICY IF EXISTS "Anyone can view booking by code" ON public.tour_bookings;
DROP POLICY IF EXISTS "Anyone can view available schedules" ON public.tour_guide_schedules;
DROP POLICY IF EXISTS "Anyone can view active whats new items" ON public.whats_new_items;
DROP POLICY IF EXISTS "Anyone can view active tour packages" ON public.tour_packages;
DROP POLICY IF EXISTS "Anyone can view active tour guides" ON public.tour_guides;
DROP POLICY IF EXISTS "Anyone can view active ticket content" ON public.ticket_content;
DROP POLICY IF EXISTS "Anyone can view active templates" ON public.whatsapp_templates;
DROP POLICY IF EXISTS "Anyone can view active service standards" ON public.service_standards;
DROP POLICY IF EXISTS "Anyone can view active organization memberships" ON public.organization_memberships;
DROP POLICY IF EXISTS "Anyone can view active navbar items" ON public.navbar_items;
DROP POLICY IF EXISTS "Anyone can view active gallery" ON public.tour_gallery;
DROP POLICY IF EXISTS "Anyone can view active chatbot FAQs" ON public.chatbot_faqs;
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.announcements;
DROP POLICY IF EXISTS "Anyone can view active FAQs" ON public.service_faqs;
DROP POLICY IF EXISTS "Anyone can submit tour bookings" ON public.tour_bookings;
DROP POLICY IF EXISTS "Anyone can submit service registrations" ON public.service_registrations;
DROP POLICY IF EXISTS "Anyone can submit WBS reports" ON public.wbs_submissions;
ALTER TABLE IF EXISTS ONLY public.venue_bookings DROP CONSTRAINT IF EXISTS venue_bookings_venue_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_permissions DROP CONSTRAINT IF EXISTS user_permissions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tour_guide_schedules DROP CONSTRAINT IF EXISTS tour_guide_schedules_guide_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tour_bookings DROP CONSTRAINT IF EXISTS tour_bookings_package_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tour_bookings DROP CONSTRAINT IF EXISTS tour_bookings_guide_id_fkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS ONLY public.plants DROP CONSTRAINT IF EXISTS plants_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.navbar_items DROP CONSTRAINT IF EXISTS navbar_items_parent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.animals DROP CONSTRAINT IF EXISTS animals_category_id_fkey;
DROP TRIGGER IF EXISTS update_zoo_history_updated_at ON public.zoo_history;
DROP TRIGGER IF EXISTS update_zone_markers_updated_at ON public.zone_markers;
DROP TRIGGER IF EXISTS update_whatsapp_templates_updated_at ON public.whatsapp_templates;
DROP TRIGGER IF EXISTS update_whats_new_items_updated_at ON public.whats_new_items;
DROP TRIGGER IF EXISTS update_wbs_submissions_updated_at ON public.wbs_submissions;
DROP TRIGGER IF EXISTS update_visitor_data_updated_at ON public.visitor_data;
DROP TRIGGER IF EXISTS update_venues_updated_at ON public.venues;
DROP TRIGGER IF EXISTS update_tour_packages_updated_at ON public.tour_packages;
DROP TRIGGER IF EXISTS update_tour_guides_updated_at ON public.tour_guides;
DROP TRIGGER IF EXISTS update_tour_bookings_updated_at ON public.tour_bookings;
DROP TRIGGER IF EXISTS update_service_standards_updated_at ON public.service_standards;
DROP TRIGGER IF EXISTS update_service_registrations_updated_at ON public.service_registrations;
DROP TRIGGER IF EXISTS update_service_availability_updated_at ON public.service_availability;
DROP TRIGGER IF EXISTS update_news_updated_at ON public.news;
DROP TRIGGER IF EXISTS update_jdih_documents_updated_at ON public.jdih_documents;
DROP TRIGGER IF EXISTS update_custom_pages_updated_at ON public.custom_pages;
DROP TRIGGER IF EXISTS update_chatbot_faqs_updated_at ON public.chatbot_faqs;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_books_updated_at ON public.books;
DROP TRIGGER IF EXISTS update_availability_on_status_change ON public.service_registrations;
DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
DROP INDEX IF EXISTS public.idx_user_roles_user_id;
DROP INDEX IF EXISTS public.idx_user_permissions_user_id;
DROP INDEX IF EXISTS public.idx_tickets_user_id;
DROP INDEX IF EXISTS public.idx_tickets_created_at;
DROP INDEX IF EXISTS public.idx_service_reg_status;
DROP INDEX IF EXISTS public.idx_service_reg_created;
DROP INDEX IF EXISTS public.idx_plants_published;
DROP INDEX IF EXISTS public.idx_plants_featured;
DROP INDEX IF EXISTS public.idx_plants_category_id;
DROP INDEX IF EXISTS public.idx_page_views_session_id;
DROP INDEX IF EXISTS public.idx_page_views_page_path;
DROP INDEX IF EXISTS public.idx_page_views_created_at;
DROP INDEX IF EXISTS public.idx_news_published;
DROP INDEX IF EXISTS public.idx_news_created_at;
DROP INDEX IF EXISTS public.idx_news_category;
DROP INDEX IF EXISTS public.idx_navbar_items_parent_id;
DROP INDEX IF EXISTS public.idx_media_gallery_created;
DROP INDEX IF EXISTS public.idx_media_gallery_category;
DROP INDEX IF EXISTS public.idx_hero_banner_active;
DROP INDEX IF EXISTS public.idx_facility_reports_status;
DROP INDEX IF EXISTS public.idx_facility_reports_created;
DROP INDEX IF EXISTS public.idx_events_type;
DROP INDEX IF EXISTS public.idx_events_date;
DROP INDEX IF EXISTS public.idx_custom_pages_slug;
DROP INDEX IF EXISTS public.idx_custom_pages_published;
DROP INDEX IF EXISTS public.idx_animals_zone;
DROP INDEX IF EXISTS public.idx_animals_published;
DROP INDEX IF EXISTS public.idx_animals_featured;
DROP INDEX IF EXISTS public.idx_animals_category_id;
DROP INDEX IF EXISTS public.idx_animals_category;
DROP INDEX IF EXISTS auth.idx_auth_users_username;
ALTER TABLE IF EXISTS ONLY public.zoo_history DROP CONSTRAINT IF EXISTS zoo_history_pkey;
ALTER TABLE IF EXISTS ONLY public.zone_markers DROP CONSTRAINT IF EXISTS zone_markers_pkey;
ALTER TABLE IF EXISTS ONLY public.whatsapp_templates DROP CONSTRAINT IF EXISTS whatsapp_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.whats_new_items DROP CONSTRAINT IF EXISTS whats_new_items_pkey;
ALTER TABLE IF EXISTS ONLY public.wbs_submissions DROP CONSTRAINT IF EXISTS wbs_submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.visitor_data DROP CONSTRAINT IF EXISTS visitor_data_pkey;
ALTER TABLE IF EXISTS ONLY public.visitor_data DROP CONSTRAINT IF EXISTS visitor_data_date_key;
ALTER TABLE IF EXISTS ONLY public.venues DROP CONSTRAINT IF EXISTS venues_pkey;
ALTER TABLE IF EXISTS ONLY public.venue_bookings DROP CONSTRAINT IF EXISTS venue_bookings_pkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.user_permissions DROP CONSTRAINT IF EXISTS user_permissions_user_id_permission_key_key;
ALTER TABLE IF EXISTS ONLY public.user_permissions DROP CONSTRAINT IF EXISTS user_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.trivia_questions DROP CONSTRAINT IF EXISTS trivia_questions_pkey;
ALTER TABLE IF EXISTS ONLY public.tram_route_points DROP CONSTRAINT IF EXISTS tram_route_points_pkey;
ALTER TABLE IF EXISTS ONLY public.tour_packages DROP CONSTRAINT IF EXISTS tour_packages_pkey;
ALTER TABLE IF EXISTS ONLY public.tour_guides DROP CONSTRAINT IF EXISTS tour_guides_pkey;
ALTER TABLE IF EXISTS ONLY public.tour_guide_schedules DROP CONSTRAINT IF EXISTS tour_guide_schedules_pkey;
ALTER TABLE IF EXISTS ONLY public.tour_guide_schedules DROP CONSTRAINT IF EXISTS tour_guide_schedules_guide_id_date_start_time_key;
ALTER TABLE IF EXISTS ONLY public.tour_gallery DROP CONSTRAINT IF EXISTS tour_gallery_pkey;
ALTER TABLE IF EXISTS ONLY public.tour_bookings DROP CONSTRAINT IF EXISTS tour_bookings_pkey;
ALTER TABLE IF EXISTS ONLY public.tour_bookings DROP CONSTRAINT IF EXISTS tour_bookings_booking_code_key;
ALTER TABLE IF EXISTS ONLY public.tickets DROP CONSTRAINT IF EXISTS tickets_pkey;
ALTER TABLE IF EXISTS ONLY public.ticket_settings DROP CONSTRAINT IF EXISTS ticket_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.ticket_content DROP CONSTRAINT IF EXISTS ticket_content_pkey;
ALTER TABLE IF EXISTS ONLY public.system_configs DROP CONSTRAINT IF EXISTS system_configs_pkey;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.service_standards DROP CONSTRAINT IF EXISTS service_standards_pkey;
ALTER TABLE IF EXISTS ONLY public.service_settings DROP CONSTRAINT IF EXISTS service_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.service_registrations DROP CONSTRAINT IF EXISTS service_registrations_tracking_code_key;
ALTER TABLE IF EXISTS ONLY public.service_registrations DROP CONSTRAINT IF EXISTS service_registrations_pkey;
ALTER TABLE IF EXISTS ONLY public.service_faqs DROP CONSTRAINT IF EXISTS service_faqs_pkey;
ALTER TABLE IF EXISTS ONLY public.service_availability DROP CONSTRAINT IF EXISTS service_availability_pkey;
ALTER TABLE IF EXISTS ONLY public.service_availability DROP CONSTRAINT IF EXISTS service_availability_date_program_type_key;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE IF EXISTS ONLY public.plants DROP CONSTRAINT IF EXISTS plants_pkey;
ALTER TABLE IF EXISTS ONLY public.page_views DROP CONSTRAINT IF EXISTS page_views_pkey;
ALTER TABLE IF EXISTS ONLY public.organization_memberships DROP CONSTRAINT IF EXISTS organization_memberships_pkey;
ALTER TABLE IF EXISTS ONLY public.news DROP CONSTRAINT IF EXISTS news_pkey;
ALTER TABLE IF EXISTS ONLY public.navbar_items DROP CONSTRAINT IF EXISTS navbar_items_pkey;
ALTER TABLE IF EXISTS ONLY public.media_gallery DROP CONSTRAINT IF EXISTS media_gallery_pkey;
ALTER TABLE IF EXISTS ONLY public.jdih_documents DROP CONSTRAINT IF EXISTS jdih_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.hero_banner DROP CONSTRAINT IF EXISTS hero_banner_pkey;
ALTER TABLE IF EXISTS ONLY public.gps_pois DROP CONSTRAINT IF EXISTS gps_pois_pkey;
ALTER TABLE IF EXISTS ONLY public.feeding_schedules DROP CONSTRAINT IF EXISTS feeding_schedules_pkey;
ALTER TABLE IF EXISTS ONLY public.facility_reports DROP CONSTRAINT IF EXISTS facility_reports_ticket_number_key;
ALTER TABLE IF EXISTS ONLY public.facility_reports DROP CONSTRAINT IF EXISTS facility_reports_pkey;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_pkey;
ALTER TABLE IF EXISTS ONLY public.custom_pages DROP CONSTRAINT IF EXISTS custom_pages_slug_key;
ALTER TABLE IF EXISTS ONLY public.custom_pages DROP CONSTRAINT IF EXISTS custom_pages_pkey;
ALTER TABLE IF EXISTS ONLY public.chatbot_faqs DROP CONSTRAINT IF EXISTS chatbot_faqs_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.books DROP CONSTRAINT IF EXISTS books_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_pkey;
ALTER TABLE IF EXISTS ONLY public.animals DROP CONSTRAINT IF EXISTS animals_pkey;
ALTER TABLE IF EXISTS ONLY public.analytics_daily DROP CONSTRAINT IF EXISTS analytics_daily_pkey;
ALTER TABLE IF EXISTS ONLY public.analytics_daily DROP CONSTRAINT IF EXISTS analytics_daily_date_key;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS public.visitor_data ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.venues ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tram_route_points ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.plants ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.news ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.hero_banner ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.announcements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.animals ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.zoo_history;
DROP TABLE IF EXISTS public.zone_markers;
DROP TABLE IF EXISTS public.whatsapp_templates;
DROP TABLE IF EXISTS public.whats_new_items;
DROP TABLE IF EXISTS public.wbs_submissions;
DROP SEQUENCE IF EXISTS public.visitor_data_id_seq;
DROP TABLE IF EXISTS public.visitor_data;
DROP SEQUENCE IF EXISTS public.venues_id_seq;
DROP TABLE IF EXISTS public.venues;
DROP TABLE IF EXISTS public.venue_bookings;
DROP TABLE IF EXISTS public.user_roles;
DROP TABLE IF EXISTS public.user_permissions;
DROP TABLE IF EXISTS public.trivia_questions;
DROP SEQUENCE IF EXISTS public.tram_route_points_id_seq;
DROP TABLE IF EXISTS public.tram_route_points;
DROP TABLE IF EXISTS public.tour_packages;
DROP TABLE IF EXISTS public.tour_guides;
DROP TABLE IF EXISTS public.tour_guide_schedules;
DROP TABLE IF EXISTS public.tour_gallery;
DROP TABLE IF EXISTS public.tour_bookings;
DROP TABLE IF EXISTS public.tickets;
DROP TABLE IF EXISTS public.ticket_settings;
DROP TABLE IF EXISTS public.ticket_content;
DROP TABLE IF EXISTS public.system_configs;
DROP TABLE IF EXISTS public.site_settings;
DROP TABLE IF EXISTS public.service_standards;
DROP TABLE IF EXISTS public.service_settings;
DROP TABLE IF EXISTS public.service_registrations;
DROP TABLE IF EXISTS public.service_faqs;
DROP TABLE IF EXISTS public.service_availability;
DROP TABLE IF EXISTS public.profiles;
DROP SEQUENCE IF EXISTS public.plants_id_seq;
DROP TABLE IF EXISTS public.plants;
DROP TABLE IF EXISTS public.page_views;
DROP TABLE IF EXISTS public.organization_memberships;
DROP SEQUENCE IF EXISTS public.news_id_seq;
DROP TABLE IF EXISTS public.news;
DROP TABLE IF EXISTS public.navbar_items;
DROP TABLE IF EXISTS public.media_gallery;
DROP TABLE IF EXISTS public.jdih_documents;
DROP SEQUENCE IF EXISTS public.hero_banner_id_seq;
DROP TABLE IF EXISTS public.hero_banner;
DROP TABLE IF EXISTS public.gps_pois;
DROP TABLE IF EXISTS public.feeding_schedules;
DROP TABLE IF EXISTS public.facility_reports;
DROP SEQUENCE IF EXISTS public.events_id_seq;
DROP TABLE IF EXISTS public.events;
DROP TABLE IF EXISTS public.custom_pages;
DROP TABLE IF EXISTS public.chatbot_faqs;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.books;
DROP TABLE IF EXISTS public.audit_logs;
DROP SEQUENCE IF EXISTS public.announcements_id_seq;
DROP TABLE IF EXISTS public.announcements;
DROP SEQUENCE IF EXISTS public.animals_id_seq;
DROP TABLE IF EXISTS public.animals;
DROP TABLE IF EXISTS public.analytics_daily;
DROP TABLE IF EXISTS auth.users;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.update_last_activity();
DROP FUNCTION IF EXISTS public.update_availability_on_registration();
DROP FUNCTION IF EXISTS public.simulate_payment_webhook(p_purchase_id uuid, p_amount integer);
DROP FUNCTION IF EXISTS public.log_sensitive_action();
DROP FUNCTION IF EXISTS public.increment_book_view_count(book_id uuid);
DROP FUNCTION IF EXISTS public.increment_book_download_count(book_id uuid);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.generate_ticket_code();
DROP FUNCTION IF EXISTS public.cleanup_old_page_views();
DROP FUNCTION IF EXISTS auth.uid();
DROP TYPE IF EXISTS public.app_role;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pgcrypto;
DROP SCHEMA IF EXISTS auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.app_role AS ENUM (
    'visitor',
    'staff',
    'admin'
);


ALTER TYPE public.app_role OWNER TO postgres;

--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: postgres
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$ SELECT NULL::uuid; $$;


ALTER FUNCTION auth.uid() OWNER TO postgres;

--
-- Name: cleanup_old_page_views(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_old_page_views() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Delete page views older than 90 days
  DELETE FROM public.page_views 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;


ALTER FUNCTION public.cleanup_old_page_views() OWNER TO postgres;

--
-- Name: generate_ticket_code(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_ticket_code() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.code = 'TKT-' || LPAD(NEW.id::TEXT, 6, '0') || '-' || TO_CHAR(NEW.visit_date, 'YYMMDD');
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_ticket_code() OWNER TO postgres;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  
  -- Create default visitor role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'visitor');
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: increment_book_download_count(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_book_download_count(book_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.books
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = book_id AND is_published = true;
END;
$$;


ALTER FUNCTION public.increment_book_download_count(book_id uuid) OWNER TO postgres;

--
-- Name: increment_book_view_count(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_book_view_count(book_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.books
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = book_id AND is_published = true;
END;
$$;


ALTER FUNCTION public.increment_book_view_count(book_id uuid) OWNER TO postgres;

--
-- Name: log_sensitive_action(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_sensitive_action() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_sensitive_action() OWNER TO postgres;

--
-- Name: simulate_payment_webhook(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.simulate_payment_webhook(p_purchase_id uuid, p_amount integer) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_book_price integer;
  v_purchase_amount integer;
  v_status text;
BEGIN
  -- Ambil harga asli buku dan amount tagihan
  SELECT b.price, u.amount, u.status 
  INTO v_book_price, v_purchase_amount, v_status
  FROM public.user_purchases u
  JOIN public.books b ON u.book_id = b.id
  WHERE u.id = p_purchase_id;

  -- Jika transaksi tidak ditemukan atau bukan pending, tolak
  IF v_status IS NULL OR v_status != 'pending' THEN
    RETURN false;
  END IF;

  -- Verifikasi keamanan super ketat:
  -- Uang yang dibayar (p_amount) HARUS SAMA PERSIS dengan harga buku asli di database!
  IF p_amount = v_book_price AND v_purchase_amount = v_book_price THEN
    -- Pembayaran sah, ubah status menjadi success
    UPDATE public.user_purchases 
    SET status = 'success', updated_at = now()
    WHERE id = p_purchase_id;
    
    RETURN true;
  ELSE
    -- Jika dicurangi (harga dimanipulasi), set jadi failed
    UPDATE public.user_purchases 
    SET status = 'failed', updated_at = now()
    WHERE id = p_purchase_id;
    
    RETURN false;
  END IF;
END;
$$;


ALTER FUNCTION public.simulate_payment_webhook(p_purchase_id uuid, p_amount integer) OWNER TO postgres;

--
-- Name: update_availability_on_registration(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_availability_on_registration() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- When registration status changes to approved, increment booked slots
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.service_availability
    SET booked_slots = booked_slots + 1
    WHERE date = NEW.start_date 
      AND program_type = NEW.program_type;
  END IF;
  
  -- When registration status changes from approved to something else, decrement
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE public.service_availability
    SET booked_slots = GREATEST(booked_slots - 1, 0)
    WHERE date = OLD.start_date 
      AND program_type = OLD.program_type;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_availability_on_registration() OWNER TO postgres;

--
-- Name: update_last_activity(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_last_activity() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.profiles 
  SET last_activity = now() 
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_last_activity() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.users (
    id uuid NOT NULL,
    username text,
    password_hash text,
    raw_user_meta_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE auth.users OWNER TO postgres;

--
-- Name: analytics_daily; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics_daily (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    total_views integer DEFAULT 0,
    unique_sessions integer DEFAULT 0,
    unique_users integer DEFAULT 0,
    top_pages jsonb DEFAULT '[]'::jsonb,
    devices jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.analytics_daily OWNER TO postgres;

--
-- Name: animals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animals (
    id integer NOT NULL,
    name text NOT NULL,
    latin_name text,
    species text,
    zone text,
    status text DEFAULT 'Dilindungi'::text,
    description text,
    image_url text,
    health_status text DEFAULT 'Sehat'::text,
    habitat text,
    location text,
    latitude double precision,
    longitude double precision,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    model_url text,
    audio_url text,
    category text,
    category_en text,
    category_id uuid,
    is_published boolean DEFAULT true,
    name_en text,
    description_en text,
    habitat_en text
);


ALTER TABLE public.animals OWNER TO postgres;

--
-- Name: COLUMN animals.category; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.animals.category IS 'Category of the animal (e.g., Mamalia, Reptil, Burung)';


--
-- Name: COLUMN animals.category_en; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.animals.category_en IS 'English category of the animal';


--
-- Name: animals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animals_id_seq OWNER TO postgres;

--
-- Name: animals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animals_id_seq OWNED BY public.animals.id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    title_id text,
    title_en text,
    content_id text,
    content_en text,
    image_url text,
    CONSTRAINT announcements_title_length CHECK ((length(title) <= 500))
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.announcements_id_seq OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action text NOT NULL,
    table_name text NOT NULL,
    record_id text,
    old_data jsonb,
    new_data jsonb,
    ip_address text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.books (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title_id text NOT NULL,
    title_en text,
    author text,
    description_id text,
    description_en text,
    category text DEFAULT 'umum'::text NOT NULL,
    cover_url text,
    file_url text,
    file_type text DEFAULT 'pdf'::text,
    page_count integer,
    year_published integer,
    is_featured boolean DEFAULT false,
    is_published boolean DEFAULT true,
    view_count integer DEFAULT 0,
    download_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_premium boolean DEFAULT false,
    price integer DEFAULT 0
);


ALTER TABLE public.books OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_id text NOT NULL,
    name_en text,
    type text DEFAULT 'fauna'::text NOT NULL,
    icon text DEFAULT '🐾'::text,
    description_id text,
    description_en text,
    image_url text,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT categories_type_check CHECK ((type = ANY (ARRAY['flora'::text, 'fauna'::text])))
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: chatbot_faqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chatbot_faqs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id text NOT NULL,
    question_en text,
    answer_id text NOT NULL,
    answer_en text,
    keywords text[] DEFAULT '{}'::text[],
    category text DEFAULT 'umum'::text,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.chatbot_faqs OWNER TO postgres;

--
-- Name: custom_pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title_id text NOT NULL,
    title_en text,
    content_id text,
    content_en text,
    is_published boolean DEFAULT true,
    show_in_navbar boolean DEFAULT false,
    navbar_icon text DEFAULT 'FileText'::text,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    image_urls text[] DEFAULT '{}'::text[]
);


ALTER TABLE public.custom_pages OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    event_date date,
    "time" text,
    zone text,
    location text,
    type text DEFAULT 'feeding'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title_id text,
    title_en text,
    description_id text,
    description_en text,
    image_url text,
    is_published boolean DEFAULT true
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: facility_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facility_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_number text NOT NULL,
    reporter_name text,
    is_anonymous boolean DEFAULT false,
    category text NOT NULL,
    description text NOT NULL,
    location_name text,
    latitude numeric,
    longitude numeric,
    image_url text,
    status text DEFAULT 'Menunggu'::text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.facility_reports OWNER TO postgres;

--
-- Name: feeding_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feeding_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_id text NOT NULL,
    name_en text NOT NULL,
    times text[] DEFAULT '{}'::text[] NOT NULL,
    image_url text,
    color text DEFAULT 'from-primary/20 to-secondary/20'::text,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.feeding_schedules OWNER TO postgres;

--
-- Name: gps_pois; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gps_pois (
    id text NOT NULL,
    name text NOT NULL,
    name_en text,
    category text DEFAULT 'animal'::text NOT NULL,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    color text DEFAULT '#22c55e'::text,
    emoji text DEFAULT '📍'::text,
    description text,
    description_en text,
    is_active boolean DEFAULT true,
    is_temporarily_closed boolean DEFAULT false,
    closure_reason text,
    closure_until date,
    feeding_time text,
    feeding_time_hour integer,
    feeding_time_minute integer,
    feeding_note text,
    operating_hours_open text,
    operating_hours_close text,
    capacity_status text DEFAULT 'normal'::text,
    local_announcement text,
    announcement_expires_at timestamp with time zone,
    latin_name text,
    conservation_status text,
    origin text,
    diet text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT gps_pois_capacity_status_check CHECK ((capacity_status = ANY (ARRAY['normal'::text, 'padat'::text, 'sepi'::text])))
);


ALTER TABLE public.gps_pois OWNER TO postgres;

--
-- Name: hero_banner; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hero_banner (
    id integer NOT NULL,
    title text,
    subtitle text,
    image_url text,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    title_id text,
    title_en text,
    subtitle_id text,
    subtitle_en text,
    description_id text,
    description_en text,
    link_url text,
    video_url text,
    media_type text DEFAULT 'image'::text
);


ALTER TABLE public.hero_banner OWNER TO postgres;

--
-- Name: COLUMN hero_banner.video_url; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hero_banner.video_url IS 'URL untuk video hero banner';


--
-- Name: COLUMN hero_banner.media_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hero_banner.media_type IS 'Tipe media: image atau video';


--
-- Name: hero_banner_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hero_banner_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hero_banner_id_seq OWNER TO postgres;

--
-- Name: hero_banner_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hero_banner_id_seq OWNED BY public.hero_banner.id;


--
-- Name: jdih_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jdih_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_number text NOT NULL,
    title_id text NOT NULL,
    title_en text,
    type text DEFAULT 'peraturan'::text NOT NULL,
    year integer NOT NULL,
    date_enacted date,
    date_promulgated date,
    status text DEFAULT 'berlaku'::text NOT NULL,
    description_id text,
    description_en text,
    file_url text,
    source_url text,
    is_published boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.jdih_documents OWNER TO postgres;

--
-- Name: media_gallery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_gallery (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    filename text NOT NULL,
    original_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    mime_type text,
    alt_text text,
    category text DEFAULT 'general'::text,
    tags text[] DEFAULT '{}'::text[],
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_published boolean DEFAULT true
);


ALTER TABLE public.media_gallery OWNER TO postgres;

--
-- Name: navbar_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.navbar_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    label_id text NOT NULL,
    label_en text,
    path text NOT NULL,
    icon text DEFAULT 'Link'::text,
    order_index integer DEFAULT 0,
    show_in_top_nav boolean DEFAULT true,
    show_in_bottom_nav boolean DEFAULT false,
    is_active boolean DEFAULT true,
    is_system boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    path_en text,
    is_dropdown boolean DEFAULT false,
    parent_id uuid
);


ALTER TABLE public.navbar_items OWNER TO postgres;

--
-- Name: COLUMN navbar_items.path_en; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.navbar_items.path_en IS 'English version of the path/URL. Falls back to path if not set.';


--
-- Name: news; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.news (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    image_url text,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    title_id text,
    title_en text,
    description_id text,
    description_en text,
    category text,
    read_time text,
    views_count integer DEFAULT 0,
    CONSTRAINT news_title_length CHECK ((length(title) <= 500))
);


ALTER TABLE public.news OWNER TO postgres;

--
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_id_seq OWNER TO postgres;

--
-- Name: news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.news_id_seq OWNED BY public.news.id;


--
-- Name: organization_memberships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_memberships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    full_name text,
    logo_url text,
    website_url text,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_published boolean DEFAULT true
);


ALTER TABLE public.organization_memberships OWNER TO postgres;

--
-- Name: page_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_path text NOT NULL,
    page_title text,
    referrer text,
    user_agent text,
    session_id text,
    user_id uuid,
    ip_hash text,
    device_type text DEFAULT 'desktop'::text,
    browser text,
    country text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.page_views OWNER TO postgres;

--
-- Name: plants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plants (
    id integer NOT NULL,
    name text NOT NULL,
    latin_name text,
    species text,
    zone text,
    category text,
    category_en text,
    category_id uuid,
    location text,
    habitat text,
    description text,
    status text DEFAULT 'Aman'::text,
    health_status text DEFAULT 'Sehat'::text,
    image_url text,
    is_featured boolean DEFAULT false,
    latitude double precision,
    longitude double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_published boolean DEFAULT true,
    name_en text,
    description_en text,
    habitat_en text
);


ALTER TABLE public.plants OWNER TO postgres;

--
-- Name: plants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plants_id_seq OWNER TO postgres;

--
-- Name: plants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plants_id_seq OWNED BY public.plants.id;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    name text,
    username text,
    child_mode boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_activity timestamp with time zone
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: service_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_availability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    program_type text NOT NULL,
    max_slots integer DEFAULT 5 NOT NULL,
    booked_slots integer DEFAULT 0 NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT service_availability_program_type_check CHECK ((program_type = ANY (ARRAY['pkl'::text, 'research'::text, 'koas'::text, 'interview'::text])))
);


ALTER TABLE public.service_availability OWNER TO postgres;

--
-- Name: service_faqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_faqs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    question_id text NOT NULL,
    question_en text,
    answer_id text NOT NULL,
    answer_en text,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT service_faqs_category_check CHECK ((category = ANY (ARRAY['general'::text, 'pkl'::text, 'research'::text, 'koas'::text, 'interview'::text])))
);


ALTER TABLE public.service_faqs OWNER TO postgres;

--
-- Name: service_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_registrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tracking_code text NOT NULL,
    program_type text NOT NULL,
    institution_name text NOT NULL,
    institution_address text,
    institution_phone text,
    institution_email text,
    participant_name text NOT NULL,
    participant_nim text,
    participant_phone text NOT NULL,
    participant_email text NOT NULL,
    study_program text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    research_title text,
    participant_count integer DEFAULT 1,
    cover_letter_url text,
    proposal_url text,
    student_id_url text,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_notes text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    faculty text,
    rotation_department text,
    supervisor_name text,
    supervisor_phone text,
    recommendation_letter_url text,
    media_organization text,
    interview_topic text,
    target_interviewee text,
    equipment_used text,
    interview_date date,
    interview_time text,
    journalist_id_url text,
    CONSTRAINT service_registrations_program_type_check CHECK ((program_type = ANY (ARRAY['pkl'::text, 'research'::text, 'koas'::text, 'interview'::text]))),
    CONSTRAINT service_registrations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'reviewing'::text, 'approved'::text, 'rejected'::text, 'completed'::text])))
);


ALTER TABLE public.service_registrations OWNER TO postgres;

--
-- Name: COLUMN service_registrations.faculty; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.service_registrations.faculty IS 'Faculty name for Koas program';


--
-- Name: COLUMN service_registrations.rotation_department; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.service_registrations.rotation_department IS 'Rotation/Department requested for Koas';


--
-- Name: COLUMN service_registrations.supervisor_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.service_registrations.supervisor_name IS 'Academic supervisor name for Koas';


--
-- Name: COLUMN service_registrations.supervisor_phone; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.service_registrations.supervisor_phone IS 'Academic supervisor phone for Koas';


--
-- Name: COLUMN service_registrations.recommendation_letter_url; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.service_registrations.recommendation_letter_url IS 'Recommendation letter URL for Koas';


--
-- Name: COLUMN service_registrations.media_organization; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.service_registrations.media_organization IS 'Media organization name for Interview';


--
-- Name: COLUMN service_registrations.interview_topic; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.service_registrations.interview_topic IS 'Interview topic/purpose';


--
-- Name: COLUMN service_registrations.target_interviewee; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.service_registrations.target_interviewee IS 'Target person to interview';


--
-- Name: COLUMN service_registrations.equipment_used; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.service_registrations.equipment_used IS 'Equipment that will be used for interview';


--
-- Name: COLUMN service_registrations.interview_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.service_registrations.interview_date IS 'Requested interview date';


--
-- Name: COLUMN service_registrations.interview_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.service_registrations.interview_time IS 'Requested interview time';


--
-- Name: COLUMN service_registrations.journalist_id_url; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.service_registrations.journalist_id_url IS 'Journalist/Media ID card URL';


--
-- Name: service_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_settings (
    id text DEFAULT 'main'::text NOT NULL,
    admin_whatsapp text,
    admin_email text,
    cover_letter_template_url text,
    proposal_template_url text,
    required_documents_pkl jsonb DEFAULT '["Surat Pengantar dari Institusi", "Kartu Tanda Mahasiswa"]'::jsonb,
    required_documents_research jsonb DEFAULT '["Surat Pengantar dari Institusi", "Proposal Penelitian", "Kartu Tanda Mahasiswa"]'::jsonb,
    required_documents_koas jsonb DEFAULT '["Surat Pengantar dari Fakultas", "Surat Rekomendasi", "Kartu Tanda Mahasiswa"]'::jsonb,
    required_documents_interview jsonb DEFAULT '["Surat Pengantar dari Media", "Kartu Identitas Jurnalis"]'::jsonb,
    limit_pkl integer,
    limit_research integer,
    limit_koas integer,
    limit_interview integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.service_settings OWNER TO postgres;

--
-- Name: service_standards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_standards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_name_id text NOT NULL,
    service_name_en text,
    requirements_id text,
    requirements_en text,
    procedure_id text,
    procedure_en text,
    duration text,
    cost text,
    complaint_mechanism_id text,
    complaint_mechanism_en text,
    icon text DEFAULT 'FileText'::text,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.service_standards OWNER TO postgres;

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_settings (
    id text DEFAULT 'main'::text NOT NULL,
    logo_url text,
    logo_mobile_url text,
    loading_logo_url text,
    hero_image_url text,
    mascot_image_url text,
    map_image_url text,
    site_name text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by text,
    floating_ticket_enabled boolean DEFAULT true,
    floating_ticket_text_id text DEFAULT 'Beli Tiket'::text,
    floating_ticket_text_en text DEFAULT 'Buy Ticket'::text,
    floating_ticket_position text DEFAULT 'right'::text,
    footer_description_id text,
    footer_description_en text,
    contact_address text,
    contact_phone text,
    contact_email text,
    floating_ticket_use_schedule boolean DEFAULT false,
    floating_ticket_start_time text,
    floating_ticket_end_time text,
    floating_ticket_icon text DEFAULT 'Ticket'::text,
    floating_ticket_custom_icon_url text,
    floating_ticket_icon_size text DEFAULT 'medium'::text,
    ticket_external_url text,
    whatsapp_number text,
    chat_us_enabled boolean DEFAULT true,
    chat_us_number text,
    chat_us_position text DEFAULT 'left'::text,
    chat_us_icon_url text,
    chat_us_start_time text,
    chat_us_end_time text,
    chat_us_timezone text,
    chat_us_use_schedule boolean DEFAULT false,
    venue_whatsapp_number text,
    venue_phone_number text,
    navbar_show_map boolean DEFAULT true,
    navbar_show_animals boolean DEFAULT true,
    navbar_show_tickets boolean DEFAULT true,
    navbar_show_events boolean DEFAULT true,
    navbar_show_qr_scan boolean DEFAULT true,
    navbar_show_profile boolean DEFAULT true,
    navbar_show_venues boolean DEFAULT true,
    navbar_show_donate boolean DEFAULT true,
    navbar_show_news boolean DEFAULT true,
    navbar_show_gallery3d boolean DEFAULT true,
    carousel_autoplay_duration integer DEFAULT 5000,
    hero_ticket_enabled boolean DEFAULT true,
    hero_ticket_use_schedule boolean DEFAULT false,
    hero_ticket_start_time text,
    hero_ticket_end_time text,
    social_instagram text,
    social_facebook text,
    social_twitter text,
    social_youtube text,
    social_tiktok text,
    footer_logo_url text,
    favicon_url text
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- Name: system_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_configs (
    key character varying(255) NOT NULL,
    value jsonb NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.system_configs OWNER TO postgres;

--
-- Name: ticket_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title_id text NOT NULL,
    title_en text,
    description_id text,
    description_en text,
    image_url text,
    content_type text DEFAULT 'info'::text,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.ticket_content OWNER TO postgres;

--
-- Name: ticket_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hero_image_url text,
    hero_title_id text,
    hero_title_en text,
    hero_subtitle_id text,
    hero_subtitle_en text,
    show_pricing boolean DEFAULT true,
    regular_price integer DEFAULT 25000,
    vip_price integer DEFAULT 50000,
    child_discount numeric(3,2) DEFAULT 0.5,
    external_ticket_url text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid,
    regular_title_id text DEFAULT 'Regular'::text,
    regular_title_en text DEFAULT 'Regular'::text,
    regular_description_id text DEFAULT 'Akses standar ke semua zona'::text,
    regular_description_en text DEFAULT 'Standard access to all zones'::text,
    regular_link text,
    vip_title_id text DEFAULT 'VIP'::text,
    vip_title_en text DEFAULT 'VIP'::text,
    vip_description_id text DEFAULT 'Akses prioritas + feeding time'::text,
    vip_description_en text DEFAULT 'Priority access + feeding time'::text,
    vip_link text,
    section_title_id text DEFAULT 'Pilih Jenis Pembelian Tiket'::text,
    section_title_en text DEFAULT 'Select Ticket Purchase Type'::text,
    regular_image_url text,
    vip_image_url text
);


ALTER TABLE public.ticket_settings OWNER TO postgres;

--
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    visit_date date NOT NULL,
    quantity integer NOT NULL,
    ticket_type text,
    price integer NOT NULL,
    total integer NOT NULL,
    status text,
    code text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- Name: tour_bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_code text NOT NULL,
    guide_id uuid,
    package_id uuid,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_email text,
    booking_date date NOT NULL,
    start_time time without time zone NOT NULL,
    duration_hours numeric(3,1) NOT NULL,
    participants integer DEFAULT 1,
    total_price integer NOT NULL,
    notes text,
    status text DEFAULT 'pending'::text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tour_bookings_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text])))
);


ALTER TABLE public.tour_bookings OWNER TO postgres;

--
-- Name: tour_gallery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_gallery (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_url text NOT NULL,
    caption_id text,
    caption_en text,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tour_gallery OWNER TO postgres;

--
-- Name: tour_guide_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_guide_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    guide_id uuid NOT NULL,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_available boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tour_guide_schedules OWNER TO postgres;

--
-- Name: tour_guides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_guides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    photo_url text,
    specialization text[],
    languages text[] DEFAULT ARRAY['id'::text],
    bio_id text,
    bio_en text,
    hourly_rate integer DEFAULT 75000 NOT NULL,
    rating numeric(2,1) DEFAULT 5.0,
    total_reviews integer DEFAULT 0,
    is_active boolean DEFAULT true,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tour_guides OWNER TO postgres;

--
-- Name: tour_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_id text NOT NULL,
    name_en text,
    description_id text,
    description_en text,
    duration_hours numeric(3,1) NOT NULL,
    min_participants integer DEFAULT 1,
    max_participants integer DEFAULT 20,
    icon text DEFAULT 'Users'::text,
    color_class text DEFAULT 'primary'::text,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tour_packages OWNER TO postgres;

--
-- Name: tram_route_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tram_route_points (
    id integer NOT NULL,
    sequence_order integer NOT NULL,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    halt_name text,
    is_halt boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tram_route_points OWNER TO postgres;

--
-- Name: tram_route_points_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tram_route_points_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tram_route_points_id_seq OWNER TO postgres;

--
-- Name: tram_route_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tram_route_points_id_seq OWNED BY public.tram_route_points.id;


--
-- Name: trivia_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trivia_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    text_id text NOT NULL,
    text_en text NOT NULL,
    type character varying(50) NOT NULL,
    category character varying(50),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.trivia_questions OWNER TO postgres;

--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_permissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    permission_key text NOT NULL,
    is_allowed boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_permissions OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'visitor'::public.app_role NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: venue_bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.venue_bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    venue_id integer NOT NULL,
    renter_name text NOT NULL,
    event_name text NOT NULL,
    institution_name text,
    contact_number text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_payment numeric,
    special_notes text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    transfer_receipt_url text,
    CONSTRAINT valid_date_range CHECK ((end_date >= start_date))
);


ALTER TABLE public.venue_bookings OWNER TO postgres;

--
-- Name: venues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.venues (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    capacity integer,
    price_per_hour numeric(12,2),
    price_per_day numeric(12,2),
    image_url text,
    facilities text[],
    is_available boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_urls text[] DEFAULT '{}'::text[],
    phone_number text,
    whatsapp_number text,
    panorama_url text,
    has_panorama boolean DEFAULT false
);


ALTER TABLE public.venues OWNER TO postgres;

--
-- Name: COLUMN venues.image_urls; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.venues.image_urls IS 'Array of image URLs for venue gallery';


--
-- Name: venues_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.venues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.venues_id_seq OWNER TO postgres;

--
-- Name: venues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.venues_id_seq OWNED BY public.venues.id;


--
-- Name: visitor_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitor_data (
    id integer NOT NULL,
    date date NOT NULL,
    jumlah_pengunjung integer DEFAULT 0,
    jumlah_kendaraan integer DEFAULT 0,
    pengunjung_wahana integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.visitor_data OWNER TO postgres;

--
-- Name: visitor_data_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.visitor_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.visitor_data_id_seq OWNER TO postgres;

--
-- Name: visitor_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.visitor_data_id_seq OWNED BY public.visitor_data.id;


--
-- Name: wbs_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wbs_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reporter_name text,
    reporter_email text,
    reporter_phone text,
    is_anonymous boolean DEFAULT false,
    category text NOT NULL,
    incident_date date,
    incident_location text,
    description text NOT NULL,
    evidence_urls text[] DEFAULT '{}'::text[],
    status text DEFAULT 'pending'::text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    reported_person_name text,
    reported_person_position text
);


ALTER TABLE public.wbs_submissions OWNER TO postgres;

--
-- Name: whats_new_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whats_new_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_type text NOT NULL,
    item_id text NOT NULL,
    title_id text NOT NULL,
    title_en text,
    subtitle text,
    image_url text,
    link_url text NOT NULL,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT whats_new_items_item_type_check CHECK ((item_type = ANY (ARRAY['animal'::text, 'event'::text, 'news'::text, 'venue'::text])))
);


ALTER TABLE public.whats_new_items OWNER TO postgres;

--
-- Name: whatsapp_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whatsapp_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id text NOT NULL,
    message_en text,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.whatsapp_templates OWNER TO postgres;

--
-- Name: zone_markers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.zone_markers (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    name_en text,
    color text DEFAULT '#3BA776'::text NOT NULL,
    position_x numeric DEFAULT 50 NOT NULL,
    position_y numeric DEFAULT 50 NOT NULL,
    description text,
    description_en text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.zone_markers OWNER TO postgres;

--
-- Name: zoo_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.zoo_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title_id text NOT NULL,
    title_en text,
    content_id text NOT NULL,
    content_en text,
    year integer,
    image_url text,
    order_index integer DEFAULT 0,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.zoo_history OWNER TO postgres;

--
-- Name: animals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals ALTER COLUMN id SET DEFAULT nextval('public.animals_id_seq'::regclass);


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: hero_banner id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hero_banner ALTER COLUMN id SET DEFAULT nextval('public.hero_banner_id_seq'::regclass);


--
-- Name: news id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news ALTER COLUMN id SET DEFAULT nextval('public.news_id_seq'::regclass);


--
-- Name: plants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants ALTER COLUMN id SET DEFAULT nextval('public.plants_id_seq'::regclass);


--
-- Name: tram_route_points id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tram_route_points ALTER COLUMN id SET DEFAULT nextval('public.tram_route_points_id_seq'::regclass);


--
-- Name: venues id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venues ALTER COLUMN id SET DEFAULT nextval('public.venues_id_seq'::regclass);


--
-- Name: visitor_data id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_data ALTER COLUMN id SET DEFAULT nextval('public.visitor_data_id_seq'::regclass);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.users (id, username, password_hash, raw_user_meta_data, created_at) FROM stdin;
a7db1c17-a0a8-4fdf-afe6-85c6042eb561	admin_rival	$2a$10$xoSR.7L7ZzZnivsjCFQQaO4KxLO/jz9/EtCMeYidi143qBiNJtRxm	{"name": "Admin Rival"}	2026-08-01 09:20:43.916683+07
ca06f5e1-881f-4179-b600-4a48ff473786	admin_kp3	$2a$10$xoSR.7L7ZzZnivsjCFQQaO4KxLO/jz9/EtCMeYidi143qBiNJtRxm	{"name": "Admin KP3"}	2026-08-05 16:06:15.797871+07
\.


--
-- Data for Name: analytics_daily; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analytics_daily (id, date, total_views, unique_sessions, unique_users, top_pages, devices, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: animals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.animals (id, name, latin_name, species, zone, status, description, image_url, health_status, habitat, location, latitude, longitude, is_featured, created_at, model_url, audio_url, category, category_en, category_id, is_published, name_en, description_en, habitat_en) FROM stdin;
1	Harimau Sumatera	Panthera tigris sumatrae	Harimau	Zona Predator	Kritis (CR)	Harimau Sumatera adalah subspesies harimau yang paling kecil dan satu-satunya harimau yang masih hidup di Indonesia. Mereka memiliki belang yang lebih rapat dan warna yang lebih gelap dibanding subspesies lain.	https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?auto=format&fit=crop&q=80	Sehat	Hutan tropis dataran rendah	Kandang 1	\N	\N	t	2026-06-30 19:57:25.550685+07	\N	\N	Mamalia	Mammals	\N	t	Sumatran Tiger	The Sumatran Tiger is the smallest tiger subspecies and the only surviving tiger in Indonesia. They have denser stripes and darker colors compared to other subspecies.	Tropical lowland forest
2	Orangutan	Pongo pygmaeus	Primata	Pusat Primata Schmutzer	Kritis (CR)	Orangutan Kalimantan adalah primata terbesar di dunia yang hidup di atas pohon. Mereka sangat cerdas dan menggunakan alat-alat sederhana untuk mencari makan.	https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&q=80	Sehat	Hutan hujan tropis	Kandang 2	\N	\N	t	2026-06-30 19:57:25.550685+07	\N	\N	Primata	Primates	\N	t	Bornean Orangutan	The Bornean Orangutan is the world's largest arboreal primate. They are highly intelligent and use simple tools to find food.	Tropical rainforest
4	Jerapah	Giraffa camelopardalis	Herbivora	Savana Afrika	Rentan (VU)	Jerapah adalah hewan darat tertinggi di dunia. Leher panjang mereka memungkinkan mereka menjangkau daun-daun pohon akasia di puncak pohon.	/uploads/branding/Screenshot_From_2026_08_02_10_29_20-1785641375554-356024750.png	Sehat	Sabana dan padang rumput Afrika	\N	\N	\N	t	2026-08-02 10:32:16.581591+07	\N	\N	Mamalia	Mammals	0b537b2d-ee09-476f-907c-0c5d474e7b0d	t	Giraffes	Giraffes are the tallest living terrestrial animals. Their long necks allow them to reach leaves at the tops of acacia trees.	African savannah and grasslands
5	Komodo	Varanus komodoensis	Reptil	Zona Reptil	Rentan (VU)	Komodo adalah kadal terbesar di dunia yang hanya ditemukan di Indonesia. Mereka adalah predator yang sangat efisien dengan kemampuan melacak mangsa dari jarak jauh.	https://images.unsplash.com/photo-1564518006159-eeea79c58e58?w=800&auto=format&fit=crop&q=80	Sehat	Hutan kering tropis	\N	\N	\N	t	2026-08-05 15:07:58.14351+07	\N	\N	Reptil	Reptiles	\N	t	Komodo Dragon	The Komodo dragon is the world's largest lizard, found only in Indonesia. They are highly efficient predators with the ability to track prey from great distances.	Tropical dry forest
6	Elang Jawa	Nisaetus bartelsi	Burung	Aviari	Terancam (EN)	Elang Jawa adalah salah satu spesies elang paling langka di dunia, endemik di Pulau Jawa.	https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=800&auto=format&fit=crop&q=80	Sehat	Hutan pegunungan	\N	\N	\N	t	2026-08-05 15:07:58.14351+07	\N	\N	Burung	Birds	\N	t	Javan Hawk-Eagle	The Javan Hawk-Eagle is one of the rarest eagle species in the world, endemic to Java Island.	Mountain forest
7	Beruang Madu	Helarctos malayanus	Mamalia	Zona Mamalia	Rentan (VU)	Beruang Madu adalah beruang terkecil di dunia dan merupakan satwa endemik Asia Tenggara.	https://images.unsplash.com/photo-1527526029430-319f3218b018?w=800&auto=format&fit=crop&q=80	Sehat	Hutan hujan tropis	\N	\N	\N	t	2026-08-05 15:07:58.14351+07	\N	\N	Mamalia	Mammals	\N	t	Sun Bear	The Sun Bear is the world's smallest bear species and endemic to Southeast Asia.	Tropical rainforest
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, title, content, is_active, created_at, updated_at, title_id, title_en, content_id, content_en, image_url) FROM stdin;
1	Pengumuman Penting	Kami buka setiap hari libur nasional. Pastikan membeli tiket online sebelumnya.	t	2026-06-30 19:57:25.545152+07	2026-08-12 17:51:23.002305+07	Pengumuman Penting	\N	Kami buka setiap hari libur nasional. Pastikan membeli tiket online sebelumnya.	\N	/uploads/announcement-images/WhatsApp_Image_2026_08_08_at_09_48_58-1786531879092-280328352.jpeg
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, table_name, record_id, old_data, new_data, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.books (id, title_id, title_en, author, description_id, description_en, category, cover_url, file_url, file_type, page_count, year_published, is_featured, is_published, view_count, download_count, created_at, updated_at, is_premium, price) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name_id, name_en, type, icon, description_id, description_en, image_url, is_active, order_index, created_at, updated_at) FROM stdin;
0b537b2d-ee09-476f-907c-0c5d474e7b0d	Mamalia	Mammals	fauna	🦁	Hewan menyusui berdarah panas	Warm-blooded nursing animals	\N	t	1	2026-06-30 19:57:23.896805+07	2026-06-30 19:57:23.896805+07
791c9bf0-6988-40c9-bae8-4b0f6d45d0c6	Reptil	Reptiles	fauna	🦎	Hewan berdarah dingin bersisik	Cold-blooded scaly animals	\N	t	2	2026-06-30 19:57:23.896805+07	2026-06-30 19:57:23.896805+07
c4950819-56d1-4264-b133-926b3021a5fc	Burung	Birds	fauna	🦅	Hewan bersayap dan berbulu	Feathered winged animals	\N	t	3	2026-06-30 19:57:23.896805+07	2026-06-30 19:57:23.896805+07
c181c346-d5bc-40b9-ae9b-4564a6ca9c96	Primata	Primates	fauna	🐒	Kelompok mamalia tingkat tinggi	Higher-order mammal group	\N	t	4	2026-06-30 19:57:23.896805+07	2026-06-30 19:57:23.896805+07
4ebecaa7-8ace-40d1-bfc2-278f0dc8e856	Ikan	Fish	fauna	🐟	Hewan air bertulang belakang	Aquatic vertebrates	\N	t	5	2026-06-30 19:57:23.896805+07	2026-06-30 19:57:23.896805+07
5786fa51-f9e2-4742-a962-2fb0265f42c9	Pohon	Trees	flora	🌳	Tumbuhan berkayu besar	Large woody plants	\N	t	6	2026-06-30 19:57:23.896805+07	2026-06-30 19:57:23.896805+07
4aee67f4-f8b0-4b11-b535-d0fa04d7c0f8	Bunga	Flowers	flora	🌸	Tumbuhan berbunga hias	Ornamental flowering plants	\N	t	7	2026-06-30 19:57:23.896805+07	2026-06-30 19:57:23.896805+07
4ae43b93-3df2-4e3a-ba63-d97dd1b899de	Tanaman Langka	Rare Plants	flora	🌿	Tumbuhan yang dilindungi	Protected plant species	\N	t	8	2026-06-30 19:57:23.896805+07	2026-06-30 19:57:23.896805+07
\.


--
-- Data for Name: chatbot_faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chatbot_faqs (id, question_id, question_en, answer_id, answer_en, keywords, category, order_index, is_active, created_at, updated_at) FROM stdin;
cd20ddc7-f447-40e7-a5e3-a620a51742be	Jam operasional kebun binatang?	What are the operating hours?	Kebun binatang buka setiap hari pukul 06:00 - 16:00 WIB. Loket tiket tutup pukul 15:00 WIB.	The zoo is open daily from 06:00 - 16:00 WIB. Ticket counter closes at 15:00 WIB.	{jam,buka,tutup,operasional,waktu,hours,open,close}	info	1	t	2026-06-30 19:57:24.731618+07	2026-06-30 19:57:24.731618+07
fa96a1c3-b21f-47b7-ac0b-cccbd6a68f3a	Berapa harga tiket masuk?	How much is the entrance ticket?	Tiket dewasa Rp 5.000, anak-anak Rp 3.000. Untuk kendaraan: Motor Rp 3.000, Mobil Rp 6.000.	Adult ticket Rp 5,000, children Rp 3,000. Vehicles: Motorcycle Rp 3,000, Car Rp 6,000.	{harga,tiket,biaya,bayar,price,ticket,cost,fee}	tiket	2	t	2026-06-30 19:57:24.731618+07	2026-06-30 19:57:24.731618+07
b97e7cfe-d46d-46de-9ea3-af33570375ed	Bagaimana cara ke Ragunan?	How to get to Ragunan?	Anda bisa naik TransJakarta koridor 6 (Ragunan - Dukuh Atas) atau koridor 12 (Penjaringan - Tanjung Priok). Turun di Halte Ragunan.	You can take TransJakarta corridor 6 (Ragunan - Dukuh Atas) or corridor 12 (Penjaringan - Tanjung Priok). Get off at Ragunan Station.	{arah,lokasi,alamat,rute,transportasi,direction,location,address,route}	lokasi	3	t	2026-06-30 19:57:24.731618+07	2026-06-30 19:57:24.731618+07
27a3f1d9-be87-4819-a17c-4220599281ca	Apakah boleh membawa makanan?	Can I bring food?	Ya, pengunjung diperbolehkan membawa makanan dan minuman sendiri. Tersedia juga kantin dan warung makan di dalam area kebun binatang.	Yes, visitors are allowed to bring their own food and drinks. There are also canteens and food stalls inside the zoo area.	{makanan,makan,bawa,food,eat,bring,snack}	fasilitas	4	t	2026-06-30 19:57:24.731618+07	2026-06-30 19:57:24.731618+07
7f111cbc-c807-4b8e-a719-f12814c9971d	Fasilitas apa saja yang tersedia?	What facilities are available?	Tersedia toilet umum, musholla, area parkir luas, penyewaan sepeda, kereta keliling, dan area piknik.	Available facilities include public toilets, prayer rooms, large parking area, bicycle rental, tour train, and picnic areas.	{fasilitas,toilet,parkir,sewa,facilities,parking,rental}	fasilitas	5	t	2026-06-30 19:57:24.731618+07	2026-06-30 19:57:24.731618+07
ee1dacdf-8db5-47e6-99db-91b86bfb6a4b	Apakah ada sewa sepeda?	Is bicycle rental available?	Ya, tersedia penyewaan sepeda dengan harga mulai Rp 20.000/jam. Lokasi penyewaan berada di dekat pintu masuk utama.	Yes, bicycle rental is available starting from Rp 20,000/hour. The rental location is near the main entrance.	{sepeda,sewa,rental,bicycle,bike}	fasilitas	6	t	2026-06-30 19:57:24.731618+07	2026-06-30 19:57:24.731618+07
2335f35c-61ac-4a1f-bf63-9d524b7e1988	Hewan apa saja yang ada?	What animals are there?	Taman Margasatwa Ragunan memiliki lebih dari 2.000 ekor satwa dari 270 spesies, termasuk orangutan, komodo, gajah, harimau, dan berbagai jenis burung.	Ragunan Zoo has more than 2,000 animals from 270 species, including orangutans, komodo dragons, elephants, tigers, and various bird species.	{hewan,satwa,binatang,animal,species,orangutan,gajah,harimau}	hewan	7	t	2026-06-30 19:57:24.731618+07	2026-06-30 19:57:24.731618+07
18b48054-208c-45ac-bf83-8155acf28ab4	Apakah ada pertunjukan satwa?	Are there animal shows?	Ya, ada pertunjukan edukasi satwa seperti feeding time untuk gajah dan orangutan. Jadwal bisa dilihat di papan informasi atau aplikasi.	Yes, there are educational animal shows such as feeding time for elephants and orangutans. Schedule can be seen on information boards or the app.	{pertunjukan,show,feeding,atraksi,jadwal,schedule}	event	8	t	2026-06-30 19:57:24.731618+07	2026-06-30 19:57:24.731618+07
15183927-151c-49be-837e-6828df5d3a8a	Bagaimana jika hujan?	What if it rains?	Area kebun binatang tetap buka saat hujan. Disarankan membawa payung atau jas hujan. Beberapa kandang memiliki atap untuk berlindung.	The zoo remains open during rain. It is recommended to bring an umbrella or raincoat. Some enclosures have roofs for shelter.	{hujan,cuaca,rain,weather,payung,umbrella}	info	9	t	2026-06-30 19:57:24.731618+07	2026-06-30 19:57:24.731618+07
eff92c4c-cfc6-417b-a8a8-df1d60c19714	Apakah ramah untuk anak-anak?	Is it child-friendly?	Sangat ramah anak! Tersedia playground, area sentuh hewan (petting zoo), dan kereta keliling yang cocok untuk keluarga.	Very child-friendly! There is a playground, petting zoo, and tour train suitable for families.	{anak,keluarga,child,family,kids,balita}	info	10	t	2026-06-30 19:57:24.731618+07	2026-06-30 19:57:24.731618+07
\.


--
-- Data for Name: custom_pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_pages (id, slug, title_id, title_en, content_id, content_en, is_published, show_in_navbar, navbar_icon, order_index, created_at, updated_at, image_urls) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, title, description, event_date, "time", zone, location, type, created_at, title_id, title_en, description_id, description_en, image_url, is_published) FROM stdin;
2	Festival Satwa Liar Ragunan 2026	Festival tahunan yang merayakan keanekaragaman hayati Indonesia dengan pertunjukan satwa, edukasi konservasi, dan pameran foto satwa liar.	2026-09-15	09:00 - 17:00	\N	Area Amphitheater Ragunan	Festival	2026-08-05 15:07:58.14351+07	Festival Satwa Liar Ragunan 2026	Ragunan Wildlife Festival 2026	Festival tahunan yang merayakan keanekaragaman hayati Indonesia dengan pertunjukan satwa, edukasi konservasi, dan pameran foto satwa liar.	Annual festival celebrating Indonesian biodiversity with animal shows, conservation education, and wildlife photo exhibitions.	https://images.unsplash.com/photo-1567334509922-399e93fad79d?w=800&auto=format&fit=crop&q=80	t
3	Feeding Time Gajah Sumatera	Saksikan langsung proses pemberian makan Gajah Sumatera oleh tim keeper berpengalaman. Program edukasi ini terbuka untuk semua pengunjung.	2026-08-10	10:00 - 11:00	\N	Kandang Gajah	Edukasi	2026-08-05 15:07:58.14351+07	Feeding Time Gajah Sumatera	Sumatran Elephant Feeding Time	Saksikan langsung proses pemberian makan Gajah Sumatera oleh tim keeper berpengalaman. Program edukasi ini terbuka untuk semua pengunjung.	Watch the feeding of Sumatran Elephants live by experienced keepers. This educational program is open to all visitors.	https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop&q=80	t
4	Workshop Fotografi Satwa Liar	Bergabunglah dengan fotografer profesional untuk belajar teknik terbaik memotret satwa liar di Kebun Binatang Ragunan.	2026-08-23	08:00 - 12:00	\N	Gerbang Utama - Area Meeting Point	Workshop	2026-08-05 15:07:58.14351+07	Workshop Fotografi Satwa Liar	Wildlife Photography Workshop	Bergabunglah dengan fotografer profesional untuk belajar teknik terbaik memotret satwa liar di Kebun Binatang Ragunan.	Join professional photographers to learn the best techniques for photographing wildlife at Ragunan Zoo.	https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80	t
5	Program Adopsi Satwa Ragunan	Daftarkan diri Anda dalam program adopsi simbolis satwa Ragunan. Kontribusi Anda langsung mendukung perawatan dan program konservasi satwa.	2026-08-01	09:00 - 16:00	\N	Kantor Administrasi Ragunan	Program	2026-08-05 15:07:58.14351+07	Program Adopsi Satwa Ragunan	Ragunan Animal Adoption Program	Daftarkan diri Anda dalam program adopsi simbolis satwa Ragunan. Kontribusi Anda langsung mendukung perawatan dan program konservasi satwa.	Register for Ragunan's symbolic animal adoption program. Your contribution directly supports animal care and conservation programs.	https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&auto=format&fit=crop&q=80	t
6	Konser Alam: Musik dan Satwa	Nikmati pertunjukan musik akustik di tengah alam terbuka Ragunan dengan pemandangan satwa yang memukau.	2026-09-05	18:00 - 21:00	\N	Taman Gajah Ragunan	Konser	2026-08-05 15:07:58.14351+07	Konser Alam: Musik dan Satwa	Nature Concert: Music and Wildlife	Nikmati pertunjukan musik akustik di tengah alam terbuka Ragunan dengan pemandangan satwa yang memukau.	Enjoy acoustic music performances in the open nature of Ragunan with stunning wildlife views.	https://images.unsplash.com/photo-1540573133985-780688d1728b?w=800&auto=format&fit=crop&q=80	t
\.


--
-- Data for Name: facility_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facility_reports (id, ticket_number, reporter_name, is_anonymous, category, description, location_name, latitude, longitude, image_url, status, admin_notes, created_at, updated_at) FROM stdin;
450c74d7-4723-452c-a671-fc1c416c04c3	RAG-RPT-IWO4GX	\N	t	Kelistrikan & Penerangan	Gelap	Kandang Gajah	\N	\N	http://100.126.123.106:5005/uploads/facility-reports/1783494560569-fv4az5.png	Menunggu	\N	2026-07-08 14:09:21.730295+07	2026-07-08 14:09:21.730295+07
77b78031-4cf6-42a9-9781-e96a75eabbce	RAG-RPT-4LOOUY	\N	t	Kebersihan & Sampah	sxas	asas	\N	\N	/uploads/facility-reports/Screenshot_2026_06_26_141704-1783498473860-955322942.png	Diproses		2026-07-08 15:14:36.372117+07	2026-07-08 15:54:30.841+07
5524221c-65a0-48b5-926b-a0c923fa81e3	RAG-RPT-M919AM	\N	t	Kandang & Fasilitas Satwa	rgrgrgrg	trgrgrgrg	\N	\N	\N	Menunggu	\N	2026-07-08 15:55:03.127909+07	2026-07-08 15:55:03.127909+07
41b9db58-b356-4f89-bce0-2fd50bb4f8a3	RAG-RPT-6VT3NN	\N	t	Infrastruktur & Bangunan	rfefefefef	fefefeferfef	\N	\N	/uploads/facility-reports/Screenshot_2026_06_26_140954-1783502622365-137075577.png	Menunggu	\N	2026-07-08 16:23:42.467028+07	2026-07-08 16:23:42.467028+07
39edd614-8f39-4112-9a46-dba86a1dfdab	RAG-RPT-3JSVI1	efefef	f	Fasilitas Umum (Toilet/Bangku)	efefefef	refefefef	\N	\N	/uploads/facility-reports/Screenshot_2026_06_26_140954-1783502668122-594168581.png	Menunggu	\N	2026-07-08 16:24:28.221237+07	2026-07-08 16:24:28.221237+07
08c279f0-c2ea-40f4-8566-56bfd8cec96a	RAG-RPT-4RUYLW	\N	t	Kandang & Fasilitas Satwa	wedwdwed	wddwdw	\N	\N	/uploads/facility-reports/Screenshot_2026_06_26_140954-1783503279925-847920397.png	Menunggu	\N	2026-07-08 16:34:40.026057+07	2026-07-08 16:34:40.026057+07
12ee9336-ab5a-4594-9381-656b51546400	RAG-RPT-D7V585	\N	t	Infrastruktur & Bangunan	sdsadadadadaddada	adadadadada	\N	\N	/uploads/facility-reports/Screenshot_2026_06_23_135942-1783504142316-687986338.png	Menunggu	\N	2026-07-08 16:49:03.124219+07	2026-07-08 16:49:03.124219+07
02b01915-d2b9-4dc7-aeab-e9e2832af95a	RAG-RPT-CL6XQU	\N	t	Kelistrikan & Penerangan	ABCD	CVDERS	\N	\N	/uploads/facility-reports/Screenshot_2026_06_23_144118-1783505636344-914433421.png	Menunggu	\N	2026-07-08 17:13:56.645381+07	2026-07-08 17:13:56.645381+07
4655ead1-b23e-437f-9ff0-6af5c2fd532e	RAG-RPT-0V4CVW	\N	t	Infrastruktur & Bangunan	AAAAAAAAAAAA	AAAAAA	\N	\N	/uploads/facility-reports/Screenshot_2026_06_23_161430-1783506564617-487415093.png	Menunggu	\N	2026-07-08 17:29:24.753794+07	2026-07-08 17:29:24.753794+07
\.


--
-- Data for Name: feeding_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feeding_schedules (id, name_id, name_en, times, image_url, color, is_published, created_at) FROM stdin;
cf987e34-445f-4dd8-9940-6b3724031643	Harimau Sumatera	Sumatran Tiger	{10:00,15:00}	https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&auto=format&fit=crop&q=80	from-orange-500/20 to-red-500/20	t	2026-08-01 08:15:42.68667+07
660d917b-7559-4f8c-9e5a-ad2aed3d4bec	Gajah Sumatera	Sumatran Elephant	{09:30,14:30}	https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop&q=80	from-slate-500/20 to-gray-500/20	t	2026-08-01 08:15:42.68667+07
85e1c89e-9d15-4599-9f19-f472cc064f0b	Orangutan	Orangutan	{11:30,15:30}	https://images.unsplash.com/photo-1503656142023-618e7d1f435a?w=800&auto=format&fit=crop&q=80	from-amber-500/20 to-orange-600/20	t	2026-08-01 08:15:42.68667+07
be684a09-a369-4e33-b836-1e5203a688ec	Komodo	Komodo Dragon	{11:00,14:00}	https://images.unsplash.com/photo-1503656142023-618e7d1f435a?w=800&auto=format&fit=crop&q=80	from-green-500/20 to-emerald-700/20	t	2026-08-01 08:15:42.68667+07
\.


--
-- Data for Name: gps_pois; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gps_pois (id, name, name_en, category, lat, lng, color, emoji, description, description_en, is_active, is_temporarily_closed, closure_reason, closure_until, feeding_time, feeding_time_hour, feeding_time_minute, feeding_note, operating_hours_open, operating_hours_close, capacity_status, local_announcement, announcement_expires_at, latin_name, conservation_status, origin, diet, sort_order, created_at, updated_at) FROM stdin;
gajah_sumatera	Gajah Sumatera	Sumatran Elephant	animal	-6.3125	106.8232	#388e3c	🐘	Kandang gajah sumatera luas terbuka dengan panggung observasi kanopi teduh bertingkat dan kolam mandi alami.	\N	t	f	\N	\N	14.00 WIB	14	0	Atraksi Mandi & Pemberian Makan Gajah	\N	\N	normal	\N	\N	Elephas maximus sumatranus	Kritis Terancam Punah (CR)	\N	\N	10	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
harimau_sumatera	Harimau Sumatera	Sumatran Tiger	animal	-6.3155	106.8208	#e65100	🐅	Habitat replika hutan hujan lebat dengan selokan air dan bebatuan alami untuk melatih naluri berburu.	\N	t	f	\N	\N	11.30 WIB	11	30	Pemberian Pakan Daging Segar Predator	\N	\N	normal	\N	\N	Panthera tigris sumatrae	Kritis Terancam Punah (CR)	\N	\N	20	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
schmutzer_primata	Pusat Primata Schmutzer (Gorila & Orangutan)	Schmutzer Primate Center	animal	-6.3138	106.8175	#f57c00	🦍	Salah satu pusat konservasi primata termodern di dunia dengan area open-enclosure alami dan jembatan kanopi.	\N	t	f	\N	\N	13.30 WIB	13	30	Enrichment Buah & Sayuran Gorila	\N	\N	normal	\N	\N	Gorilla gorilla & Pongo pygmaeus	Kritis Terancam Punah (CR)	\N	\N	30	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
komodo	Komodo & Taman Reptil	Komodo & Reptile Garden	animal	-6.3115	106.817	#6a1b9a	🦎	Zona reptil terlengkap dengan terarium kaca, kandang pasir savana komodo, serta koleksi ular piton raksasa.	\N	t	f	\N	\N	10.30 WIB	10	30	Atraksi Berburu Komodo (Rabu & Minggu)	\N	\N	normal	\N	\N	Varanus komodoensis	Genteng (EN)	\N	\N	40	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
jerapah	Jerapah & Zebra Savana	Giraffe & Zebra Savanna	animal	-6.3102	106.8222	#2e7d32	🦒	Padang rumput terbuka dengan pohon rindang tempat bermain keluarga jerapah bersanding dengan zebra.	\N	t	f	\N	\N	15.00 WIB	15	0	Pemberian Makan Panggung Leher Tinggi	\N	\N	normal	\N	\N	Giraffa camelopardalis	Rentan (VU)	\N	\N	50	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
beruang_madu	Beruang Madu	Sun Bear	animal	-6.3145	106.8222	#5d4037	🐻	Habitat tebing kayu dengan kolam pemandian khusus beruang madu Kalimantan.	\N	t	f	\N	\N	09.30 WIB	9	30	Pemberian Madu & Sarang Lebah Alami	\N	\N	normal	\N	\N	Helarctos malayanus	Rentan (VU)	\N	\N	60	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
singa_afrika	Singa Afrika	African Lion	animal	-6.3158	106.8195	#f9a825	🦁	Savana terbuka dengan tebing batu alam tempat singa jantan berteriak sambut pengunjung.	\N	t	f	\N	\N	12.00 WIB	12	0	Pemberian Daging Segar Singa	\N	\N	normal	\N	\N	Panthera leo	Rentan (VU)	\N	\N	70	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
kuda_nil	Kuda Nil & Kolam Renang	Hippopotamus Pool	animal	-6.3172	106.8225	#0277bd	🦛	Kolam raksasa transparan dengan panel kaca bawah air untuk menyaksikan kuda nil berenang.	\N	t	f	\N	\N	11.00 WIB	11	0	Pemberian Sayuran & Rumput Segar	\N	\N	normal	\N	\N	Hippopotamus amphibius	Rentan (VU)	\N	\N	80	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
buaya	Buaya Muara & Taman Air	Saltwater Crocodile	animal	-6.311	106.8185	#33691e	🐊	Kolam buaya muara raksasa terbuka dengan pagar pengaman berlapis ganda.	\N	t	f	\N	\N	10.00 WIB	10	0	Pemberian Ikan Utuh (Rabu & Sabtu)	\N	\N	normal	\N	\N	Crocodylus porosus	Rentang Luas	\N	\N	90	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
orangutan	Orangutan Sumatera & Kalimantan	Orangutan House	animal	-6.3128	106.8168	#bf360c	🦧	Rumah orangutan dengan tali dan pohon panjat alami untuk enrichment harian.	\N	t	f	\N	\N	10.00 WIB	10	0	Enrichment Buah Hutan Segar	\N	\N	normal	\N	\N	Pongo pygmaeus	Kritis Terancam Punah (CR)	\N	\N	100	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
elang_jawa	Elang Jawa & Kandang Aviarium	Javan Hawk-Eagle Aviary	animal	-6.3096	106.8238	#1565c0	🦅	Aviarium megabesar dengan kondisi hutan mini untuk burung-burung raptor endemik Indonesia.	\N	t	f	\N	\N	08.00 WIB	8	0	Pemberian Tikus & Daging Mentah	\N	\N	normal	\N	\N	Nisaetus bartelsi	Kritis Terancam Punah (CR)	\N	\N	110	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
taman_satwa_anak	Taman Satwa Anak & Akuarium	Children Animal Park	animal	-6.3075	106.8235	#0097a7	🐇	Area rekreasi ramah keluarga dengan akuarium Arapaima gigas, panggung satwa jinak, dan wahana anak.	\N	t	f	\N	\N	Sepanjang Hari	9	0	Wahana Interaksi & Memberi Makan Kelinci/Kambing	\N	\N	normal	\N	\N	\N	\N	\N	\N	120	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
tapir	Kandang Tapir Belang	Malayan Tapir	animal	-6.3142	106.8242	#37474f	🦡	Area rindang berkanopi pohon beringin dengan kubangan air bersih tempat tapir suka berkubang.	\N	t	f	\N	\N	10.15 WIB	10	15	Pemberian Sayur & Buah Segar	\N	\N	normal	\N	\N	Tapirus indicus	Genteng (EN)	\N	\N	130	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
pintu_utara	Pintu Masuk Utama (Pintu Utara)	Main Entrance (North)	ticket	-6.3045	106.8198	#013a13	🚪	Pintu masuk gerbang utama Ragunan, terhubung dengan Halte TransJakarta dan loket JakCard.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	200	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
pintu_barat	Pintu Masuk Barat	West Entrance	ticket	-6.3105	106.813	#013a13	🚪	Pintu masuk sisi barat (Jl. Kav Polri), dekat area parkir dan loket JakCard.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	210	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
pintu_timur	Pintu Masuk Timur	East Entrance	ticket	-6.3132	106.8272	#013a13	🚪	Pintu masuk koridor timur rindang, akses nyaman pejalan kaki.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	220	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
pintu_selatan	Pintu Masuk Selatan	South Entrance	ticket	-6.3195	106.8235	#013a13	🚪	Pintu gerbang selatan Ragunan dekat akses TB Simatupang.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	230	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
toilet_utara	Toilet & Laktasi Plaza Utara	Restroom & Nursing (North)	toilet	-6.306	106.8205	#00838f	🚻	Toilet bersih modern, ramah difabel, wastafel otomatis, dan ruang menyusui.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	300	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
toilet_danau	Toilet & Wastafel Danau Pelikan	Restroom (Pelican Lake)	toilet	-6.3094	106.8195	#00838f	🚻	Toilet umum berkapasitas besar di pinggir danau.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	310	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
toilet_schmutzer	Toilet Difabel & Laktasi Schmutzer	Accessible Restroom (Schmutzer)	toilet	-6.314	106.8168	#00838f	🚻	Fasilitas sanitasi berstandar internasional ramah anak di gerbang Schmutzer.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	320	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
toilet_gajah	Toilet Koridor Gajah & Mamalia	Restroom (Elephant Corridor)	toilet	-6.312	106.8242	#00838f	🚻	Toilet umum berkanopi bambu di sebelah panggung observasi gajah.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	330	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
toilet_selatan	Toilet Paviliun Rimba Selatan	Restroom (South Jungle)	toilet	-6.3175	106.8218	#00838f	🚻	Toilet umum dekat koridor harimau dan kuda nil.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	340	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
musholla_utama	Masjid Al-Falah & Tempat Wudhu	Al-Falah Mosque	musholla	-6.307	106.8192	#2e7d32	🕌	Masjid utama ber-AC dengan perlengkapan sholat lengkap dan tempat wudhu terpisah.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	400	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
musholla_schmutzer	Musholla Paviliun Primata	Prayer Room (Schmutzer)	musholla	-6.313	106.8165	#2e7d32	🕌	Musholla asri di dekat pintu keluar Pusat Primata Schmutzer.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	410	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
musholla_timur	Musholla Rindang Koridor Timur	Prayer Room (East Corridor)	musholla	-6.3135	106.8258	#2e7d32	🕌	Musholla kayu rindang di bawah naungan pohon trembesi.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	420	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
foodcourt_danau	Pujasera Danau Ragunan	Lake Food Court	kuliner	-6.3082	106.8188	#ef6c00	🍜	Sentra kuliner: es kelapa muda, soto betawi, pecel ayam, dan aneka jajanan khas Jakarta.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	500	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
foodcourt_schmutzer	Kafe Rindang Primata	Primate Cafe	kuliner	-6.3125	106.818	#ef6c00	☕	Kafe santai: kopi nusantara, gelato buah segar, dan roti bakar dengan pemandangan kanopi.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	510	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
foodcourt_gajah	Kios Kuliner & Minuman Segar Gajah	Elephant Food Kiosk	kuliner	-6.3118	106.822	#ef6c00	🧃	Stand aneka minuman dingin, es krim, kentang goreng, dan air kelapa hijau.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	520	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
halte_kereta_utara	Halte Kereta Keliling 1 (Plaza Utama)	Tram Stop 1 (Main Plaza)	tram	-6.3062	106.8195	#1565c0	🚋	Titik awal naik kereta wisata keliling dengan tarif Rp 10.000/orang.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	600	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
halte_kereta_danau	Halte Kereta Keliling 2 (Danau Pelikan)	Tram Stop 2 (Pelican Lake)	tram	-6.309	106.8214	#1565c0	🚋	Halte transit kereta wisata dekat area danau dan panggung satwa anak.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	610	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
halte_kereta_gajah	Halte Kereta Keliling 3 (Gajah Sumatera)	Tram Stop 3 (Elephant)	tram	-6.3115	106.824	#1565c0	🚋	Halte pemberhentian bagi pengunjung yang ingin menyaksikan atraksi mandi gajah.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	620	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
halte_kereta_harimau	Halte Kereta Keliling 4 (Karnivora Rimba)	Tram Stop 4 (Carnivore)	tram	-6.316	106.8215	#1565c0	🚋	Halte transit selatan dekat kandang harimau sumatera dan beruang madu.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	630	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
pos_medis_p3k	Pos Medis & P3K Ragunan	Medical Post & First Aid	medical	-6.3065	106.821	#c62828	🏥	Posko darurat medis dengan tenaga perawat siap siaga, kotak P3K lengkap, oksigen, dan ambulans siaga.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	700	2026-09-25 08:29:33.372558+07	2026-09-25 08:29:33.372558+07
\.


--
-- Data for Name: hero_banner; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hero_banner (id, title, subtitle, image_url, is_active, created_at, title_id, title_en, subtitle_id, subtitle_en, description_id, description_en, link_url, video_url, media_type) FROM stdin;
1	Selamat Datang di Ragunan Zoo	Jelajahi keajaiban satwa bersama kami	/uploads/hero-images/hero-1769323824165.jpg	t	2026-06-30 19:57:25.497222+07	\N	\N	\N	\N	\N	\N	\N	\N	image
2	Konservasi Satwa Liar	Mendukung kelestarian alam untuk generasi mendatang	/uploads/hero-images/hero-1769323966870.jpg	t	2026-06-30 19:57:25.497222+07	\N	\N	\N	\N	\N	\N	\N	\N	image
3	Video Profil Taman Margasatwa	Lihat keindahan alam secara langsung	\N	t	2026-06-30 21:19:47.496607+07	\N	\N	\N	\N	\N	\N	\N	/uploads/hero-images/hero-video-1769596582799.mp4	video
\.


--
-- Data for Name: jdih_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jdih_documents (id, document_number, title_id, title_en, type, year, date_enacted, date_promulgated, status, description_id, description_en, file_url, source_url, is_published, order_index, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: media_gallery; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_gallery (id, filename, original_name, file_url, file_size, mime_type, alt_text, category, tags, uploaded_by, created_at, updated_at, is_published) FROM stdin;
11963ca2-72a6-4919-9627-560a95983897	Screenshot_From_2026_08_05_16_10_43-1785921095072-48446549.png	Screenshot From 2026-08-05 16-10-43.png	/uploads/media-gallery/Screenshot_From_2026_08_05_16_10_43-1785921095072-48446549.png	274016	image/png	\N	news	{}	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	2026-08-05 16:11:35.116418+07	2026-08-05 16:11:35.116418+07	t
5ec3f953-4f88-4e74-a8e5-f8e5ff0e22a1	media-gallery/Screenshot_From_2026_08_05_16_10_43-1785921661135-251639695.png	Screenshot From 2026-08-05 16-10-43.png	/uploads/media-gallery/Screenshot_From_2026_08_05_16_10_43-1785921661135-251639695.png	274016	image/png	\N	news	{}	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	2026-08-05 16:21:01.171239+07	2026-08-05 16:21:01.171239+07	t
18abc6a9-9444-4b45-98d5-666148de00ed	media-gallery/Screenshot_From_2026_08_05_16_10_43-1785921770471-781918349.png	Screenshot From 2026-08-05 16-10-43.png	/uploads/media-gallery/Screenshot_From_2026_08_05_16_10_43-1785921770471-781918349.png	274016	image/png	\N	news	{}	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	2026-08-05 16:22:50.507516+07	2026-08-05 16:22:50.507516+07	t
\.


--
-- Data for Name: navbar_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.navbar_items (id, label_id, label_en, path, icon, order_index, show_in_top_nav, show_in_bottom_nav, is_active, is_system, created_at, updated_at, path_en, is_dropdown, parent_id) FROM stdin;
f333798b-cbe9-468f-9626-269482494208	Beranda	Home	/	Home	10	t	t	t	f	2026-06-30 19:57:26.15328+07	2026-06-30 19:57:26.15328+07	\N	f	\N
15cd6ccd-0571-4c2e-a943-a0c7b46844a0	Tiket & Tarif	Tickets & Pricing	/tickets	Ticket	20	t	t	t	f	2026-06-30 19:57:26.172629+07	2026-06-30 19:57:26.172629+07	\N	f	\N
af0ec70a-6ef1-4503-b50e-657dec412cb9	Jelajah	Explore	#	Compass	30	t	t	t	f	2026-06-30 19:57:26.159075+07	2026-06-30 19:57:26.159075+07	\N	t	\N
bf4c6499-ff0b-4d4e-9850-1222239d3100	Fauna	Fauna	/fauna	PawPrint	31	t	t	t	f	2026-06-30 19:57:26.181039+07	2026-06-30 19:57:26.181039+07	\N	f	af0ec70a-6ef1-4503-b50e-657dec412cb9
3e7d5d34-d2ee-4cb5-9051-eac27e24f16e	Flora	Flora	/flora	Leaf	32	t	t	t	f	2026-06-30 19:57:26.185922+07	2026-06-30 19:57:26.185922+07	\N	f	af0ec70a-6ef1-4503-b50e-657dec412cb9
b58af999-fb4c-4d95-b81d-4e343534a5ee	Peta	Map	/map	Map	33	t	t	t	f	2026-06-30 19:57:26.19192+07	2026-06-30 19:57:26.19192+07	\N	f	af0ec70a-6ef1-4503-b50e-657dec412cb9
b1f6cb9e-dfd3-4956-aa86-82f9c2e88460	Panduan Suara	Audio Guide	/audio-guide	Headphones	34	t	t	t	f	2026-06-30 19:57:26.196258+07	2026-06-30 19:57:26.196258+07	\N	f	af0ec70a-6ef1-4503-b50e-657dec412cb9
75395cec-d5fd-4417-bb8a-d17d68671e8e	Galeri 3D	3D Gallery	/gallery-3d	Box	35	t	t	t	f	2026-06-30 19:57:26.201136+07	2026-06-30 19:57:26.201136+07	\N	f	af0ec70a-6ef1-4503-b50e-657dec412cb9
8d060c3e-4bdc-4917-9cdc-0ace1e1b7cc5	Fasilitas	Facilities	#	Building2	40	t	t	t	f	2026-06-30 19:57:26.16434+07	2026-06-30 19:57:26.16434+07	\N	t	\N
e8200ad5-2f13-4829-b3a1-11ce324cbf21	Layanan	Services	/services	Info	41	t	t	t	f	2026-06-30 19:57:26.212784+07	2026-06-30 19:57:26.212784+07	\N	f	8d060c3e-4bdc-4917-9cdc-0ace1e1b7cc5
20e97d55-9744-40e6-ba67-07d710368c2a	Sewa Tempat	Rent Venue	/venues	MapPin	42	t	t	t	f	2026-06-30 19:57:26.204543+07	2026-06-30 19:57:26.204543+07	\N	f	8d060c3e-4bdc-4917-9cdc-0ace1e1b7cc5
11d7cc42-f212-4739-8805-5d8de8c59737	Pemandu Wisata	Tour Guide	/tour-guide	Users	43	t	t	t	f	2026-06-30 19:57:26.209456+07	2026-06-30 19:57:26.209456+07	\N	f	8d060c3e-4bdc-4917-9cdc-0ace1e1b7cc5
c6f91483-a6ec-4e35-b48a-5f71d847fea7	Standar Pelayanan	Service Standards	/standar-pelayanan	CheckCircle	44	t	t	t	f	2026-06-30 19:57:26.216841+07	2026-06-30 19:57:26.216841+07	\N	f	8d060c3e-4bdc-4917-9cdc-0ace1e1b7cc5
721181f0-7634-4038-9bbf-a3435643c525	Informasi	Information	#	Info	50	t	t	t	f	2026-06-30 19:57:26.167753+07	2026-06-30 19:57:26.167753+07	\N	t	\N
ed7ea28f-2df1-44e7-a336-844b690baca7	Berita	News	/news	Newspaper	51	t	t	t	f	2026-06-30 19:57:26.219972+07	2026-06-30 19:57:26.219972+07	\N	f	721181f0-7634-4038-9bbf-a3435643c525
2cc50b09-1bc3-42eb-98a5-96f7aabc1e19	Event	Events	/events	Calendar	52	t	t	t	f	2026-06-30 19:57:26.224524+07	2026-06-30 19:57:26.224524+07	\N	f	721181f0-7634-4038-9bbf-a3435643c525
b1d8799f-8613-44bb-9e94-99da43a5e4aa	Sejarah	History	/history	Landmark	53	t	t	t	f	2026-06-30 19:57:26.227401+07	2026-06-30 19:57:26.227401+07	\N	f	721181f0-7634-4038-9bbf-a3435643c525
4072ca4d-4916-41e0-b970-66b26b7274c8	Perpustakaan	Library	/perpustakaan	Book	54	t	t	t	f	2026-06-30 19:57:26.234717+07	2026-06-30 19:57:26.234717+07	\N	f	721181f0-7634-4038-9bbf-a3435643c525
86e2548f-bcc4-4891-a1e0-b1213c25352a	JDIH	JDIH	/jdih	Scale	55	t	t	t	f	2026-06-30 19:57:26.231568+07	2026-06-30 19:57:26.231568+07	\N	f	721181f0-7634-4038-9bbf-a3435643c525
99d770b9-c9ed-4ad7-a833-c78d61b9c900	Lapor Fasilitas	Facility Report	/report-facility	AlertTriangle	56	t	f	t	f	2026-07-02 16:30:10.99552+07	2026-07-02 16:30:10.99552+07	\N	f	721181f0-7634-4038-9bbf-a3435643c525
e1c4fa91-e5df-4c7a-bf4b-abe99d00f225	Lacak Laporan	Track Report	/track-report	Link	57	t	f	t	f	2026-07-08 16:17:10.652233+07	2026-07-08 16:17:10.652233+07	\N	f	721181f0-7634-4038-9bbf-a3435643c525
5bed0661-4248-473c-916d-562eaf0a1a88	WBS	WBS	/wbs	ShieldAlert	58	t	f	t	f	2026-06-30 19:57:26.176282+07	2026-06-30 19:57:26.176282+07	\N	f	721181f0-7634-4038-9bbf-a3435643c525
d9123ce5-e675-4d95-b225-d929c5de05ed	Pusat Pelaporan	Report Center	#	ShieldAlert	80	f	f	f	f	2026-07-07 17:39:37.043989+07	2026-07-07 17:39:37.043989+07	\N	t	\N
\.


--
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.news (id, title, description, image_url, is_published, created_at, updated_at, title_id, title_en, description_id, description_en, category, read_time, views_count) FROM stdin;
8	Night at Ragunanzoo	Halo Sahabat Ragunan, sekarang kamu bisa menikmati suasana Ragunan Malam mulai hari Selasa–Sabtu, lho!\nCek ketentuannya pada info jam operasional di atas ya 😁\n\n#nightatragunanzoo\n#ragunanzoo\n#tamanhutandki\n#dkijakarta	/uploads/media-gallery/Screenshot_From_2026_08_05_16_10_43-1785921770471-781918349.png	t	2026-08-05 16:22:53.281939+07	2026-08-06 08:23:55.96369+07	Night at Ragunanzoo	\N	Halo Sahabat Ragunan, sekarang kamu bisa menikmati suasana Ragunan Malam mulai hari Selasa–Sabtu, lho!\nCek ketentuannya pada info jam operasional di atas ya 😁\n\n#nightatragunanzoo\n#ragunanzoo\n#tamanhutandki\n#dkijakarta	\N	\N	\N	2
4	Tips Hindari Antrean Tiket Ragunan Jelang Akhir Pekan	Untuk kenyamanan pengunjung saat liburan, pengelola mengimbau masyarakat untuk memanfaatkan pemesanan tiket online dan datang lebih awal. Simak rincian jam operasional serta rute kantong parkir terbaru.	https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80	t	2026-08-05 14:51:06.333744+07	2026-08-05 14:51:06.333744+07	Tips Hindari Antrean Tiket Ragunan Jelang Akhir Pekan	Tips to Avoid Ticket Queues at Ragunan This Weekend	Untuk kenyamanan pengunjung saat liburan, pengelola mengimbau masyarakat untuk memanfaatkan pemesanan tiket online dan datang lebih awal. Simak rincian jam operasional serta rute kantong parkir terbaru.	To ensure a smooth holiday visit, management advises guests to book tickets online and arrive early. Check out updated opening hours and parking routes.	Pengumuman	2 min	980
6	Serunya Momen Feeding Time Gajah dan Komodo Setiap Akhir Pekan	Salah satu momen favorit pengunjung adalah menyaksikan tim keeper memberi makan satwa secara langsung. Agenda ini rutin hadir setiap hari Sabtu dan Minggu pagi mulai pukul 10.00 WIB.	https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop&q=80	t	2026-08-05 14:51:06.336332+07	2026-08-05 14:51:06.336332+07	Serunya Momen Feeding Time Gajah dan Komodo Setiap Akhir Pekan	Exciting Weekend Elephant & Komodo Dragon Feeding Sessions	Salah satu momen favorit pengunjung adalah menyaksikan tim keeper memberi makan satwa secara langsung. Agenda ini rutin hadir setiap hari Sabtu dan Minggu pagi mulai pukul 10.00 WIB.	A favorite visitor attraction is watching live feeding sessions by experienced keepers, held every Saturday and Sunday starting at 10:00 AM.	Kegiatan	3 min	890
1	Berita Terbaru Ragunan	Konten berita yang sangat panjang untuk Ragunan Zoo... Hari ini kami mengumumkan perbaikan kandang gajah.	/uploads/news-images/news-1769308845721.jpg	t	2026-06-30 19:57:25.53998+07	2026-08-05 14:58:36.997372+07	Perbaikan Kandang Gajah Ragunan Dimulai	Ragunan Elephant Enclosure Renovation Begins	Ragunan Zoo memulai proses perbaikan dan renovasi kandang gajah untuk memberikan lingkungan yang lebih nyaman dan alami bagi satwa.	Ragunan Zoo begins renovation of the elephant enclosure to provide a more comfortable and natural environment for the animals.	Fasilitas	2 min	512
5	Melihat Dari Dekat Kehidupan Primata di Pusat Schmutzer	Pusat Primata Schmutzer melengkapi area pamerannya dengan papan edukasi interaktif. Pengunjung kini bisa mempelajari perilaku, pakan, dan habitat alami gorila serta simpanse secara lebih jelas dan menarik.	https://images.unsplash.com/photo-1503656142023-618e7d1f435a?w=800&auto=format&fit=crop&q=80	t	2026-08-05 14:51:06.334994+07	2026-08-05 15:11:40.598543+07	Melihat Dari Dekat Kehidupan Primata di Pusat Schmutzer	A Closer Look at Primate Life at Schmutzer Center	Pusat Primata Schmutzer melengkapi area pamerannya dengan papan edukasi interaktif. Pengunjung kini bisa mempelajari perilaku, pakan, dan habitat alami gorila serta simpanse secara lebih jelas dan menarik.	Schmutzer Primate Center enhances its exhibit with interactive educational displays, allowing visitors to learn about gorilla and chimpanzee behaviors and natural habitats.	Edukasi	4 min	1150
7	Ragunan Tambah 500 Pohon Rindang untuk Kelestarian Burung Liar	Guna menjaga kesejukan area hijau dan area hinggap burung liar, pengelola bekerjasama dengan relawan menanam ratusan bibit pohon tropis di kawasan hutan kota Ragunan.	https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80	t	2026-08-05 14:51:06.337604+07	2026-08-08 09:08:04.321238+07	Ragunan Tambah 500 Pohon Rindang untuk Kelestarian Burung Liar	Ragunan Plants 500 Shade Trees for Wild Bird Conservation	Guna menjaga kesejukan area hijau dan area hinggap burung liar, pengelola bekerjasama dengan relawan menanam ratusan bibit pohon tropis di kawasan hutan kota Ragunan.	To preserve cool green canopies and nesting spots for wild birds, management and volunteers planted hundreds of tropical saplings across the urban forest.	Konservasi	3 min	671
3	Seekor Bayi Harimau Sumatera Lahir Selamat di Ragunan	Koleksi satwa dilindungi di Ragunan kembali bertambah. Tim medis mengonfirmasi kelahiran seekor anak harimau Sumatera jantan yang sehat. Saat ini, induk dan bayi masih dalam masa observasi serta perawatan intensif oleh tim keeper.	https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&auto=format&fit=crop&q=80	t	2026-08-05 14:51:06.330714+07	2026-08-07 17:47:35.320034+07	Seekor Bayi Harimau Sumatera Lahir Selamat di Ragunan	Healthy Sumatran Tiger Cub Born Safely at Ragunan Zoo	Koleksi satwa dilindungi di Ragunan kembali bertambah. Tim medis mengonfirmasi kelahiran seekor anak harimau Sumatera jantan yang sehat. Saat ini, induk dan bayi masih dalam masa observasi serta perawatan intensif oleh tim keeper.	Ragunan Zoo welcomes a new addition to its protected wildlife. Veterinarians confirmed the birth of a healthy male Sumatran Tiger cub, currently undergoing care under dedicated keepers.	Konservasi	3 min	1421
\.


--
-- Data for Name: organization_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization_memberships (id, name, full_name, logo_url, website_url, order_index, is_active, created_at, updated_at, is_published) FROM stdin;
aa3faa13-a114-48f3-a5b5-5c96ba964cbd	SEAZA	Southeast Asian Zoos and Aquariums Association	/uploads/org-logos/images-1786109513248-481732399.png	https://www.seaza.asia/	2	t	2026-08-07 20:32:43.033755+07	2026-08-07 20:32:43.033755+07	t
c37d740e-39d4-4075-97b0-39221f1dabb9	WAZA	World Association of Zoos and Aquariums	/uploads/org-logos/WAZA_logo_svg-1786109685193-104529687.webp	https://www.waza.org/	3	t	2026-08-07 20:35:54.681459+07	2026-08-07 20:35:54.681459+07	t
b81ae0f7-b3d6-4f8a-a931-47ff12f32be8	PKBSI	Persatuan Kebun Binatang Se-Indonesia	/uploads/org-logos/images-1786160974787-412315467.png	https://izaa.org/id	1	t	2026-08-07 19:57:21.042003+07	2026-08-07 19:57:21.042003+07	t
6a40e84d-634f-41cd-86a8-8076c705ff6d	DISTAMHUT	Dinas Pertamanan dan Hutan Kota Provinsi DKI Jakarta	/uploads/org-logos/logo_distamhut_remake_tanpa_background-1786603428184-442076747.png	https://pertamananpemakaman.jakarta.go.id/	4	t	2026-08-09 16:29:08.704886+07	2026-08-09 16:29:08.704886+07	t
\.


--
-- Data for Name: page_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.page_views (id, page_path, page_title, referrer, user_agent, session_id, user_id, ip_hash, device_type, browser, country, created_at) FROM stdin;
17c93047-d2ba-45b4-96ba-0c52b752cca9	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/149.0.7827.137 Mobile/15E148 Safari/604.1	1782826083144-kh50s082jec	\N	\N	mobile	Safari	\N	2026-06-30 20:42:01.585119+07
eac841bb-1acc-4c3e-975b-575488b6b1b1	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/149.0.7827.137 Mobile/15E148 Safari/604.1	1782826083144-kh50s082jec	\N	\N	mobile	Safari	\N	2026-06-30 20:42:07.880418+07
d7c37e86-6163-4d9a-a5cf-9b8373720312	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782826108591-4rbtq18e58f	\N	\N	desktop	Chrome	\N	2026-06-30 20:42:12.915506+07
b2c188e0-5288-42c4-92b1-4113de5e8a43	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782826394526-7p2cn2vddr7	\N	\N	desktop	Chrome	\N	2026-06-30 21:02:45.50799+07
b9eeb0b8-d145-4785-8287-8435df3d1b57	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782826108591-4rbtq18e58f	\N	\N	desktop	Chrome	\N	2026-06-30 21:02:57.161502+07
7dc0bcdf-abdf-4d7f-ad02-dd8e3d66c3e7	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782826108591-4rbtq18e58f	\N	\N	desktop	Chrome	\N	2026-06-30 21:03:23.750344+07
3d93eb55-9adc-4690-b7da-bddd92c62655	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782826394526-7p2cn2vddr7	\N	\N	desktop	Chrome	\N	2026-06-30 21:16:43.923481+07
8b09c6d3-7384-4776-a92d-5d70c55e5fdf	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782826394526-7p2cn2vddr7	\N	\N	desktop	Chrome	\N	2026-06-30 21:17:00.64172+07
8c513c11-4bb4-4de8-b3a0-358624f969fb	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782826394526-7p2cn2vddr7	\N	\N	desktop	Chrome	\N	2026-06-30 21:20:30.720089+07
bd1aac69-00c6-4192-ae79-6b9b43ddb5a1	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/149.0.7827.137 Mobile/15E148 Safari/604.1	1782829378293-xzsg6svllh	\N	\N	mobile	Safari	\N	2026-06-30 21:22:58.898762+07
a93ad4b4-5cf3-488a-9e81-601ff8f5fd33	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782829387034-vys1pqjsq3h	\N	\N	desktop	Chrome	\N	2026-06-30 21:23:07.417744+07
08627d5b-d36b-45c1-8e73-8ac8e9226e07	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782826394526-7p2cn2vddr7	\N	\N	desktop	Chrome	\N	2026-06-30 21:29:02.9887+07
d1352c07-7708-4b61-b9c8-f5a8eee8f80d	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782826394526-7p2cn2vddr7	\N	\N	desktop	Chrome	\N	2026-06-30 21:40:52.40441+07
2428afe9-739c-43fc-8fe8-98dc16ccd577	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782826394526-7p2cn2vddr7	\N	\N	desktop	Chrome	\N	2026-06-30 21:41:31.988209+07
3567a1b1-9cc0-4eea-a055-5e668cc6e1fa	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782826394526-7p2cn2vddr7	\N	\N	desktop	Chrome	\N	2026-06-30 21:42:00.619307+07
8c21dcbf-cba6-4162-8cbc-7a0ca8eda332	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782826394526-7p2cn2vddr7	\N	\N	desktop	Chrome	\N	2026-06-30 21:43:04.68041+07
007b4afc-b15d-4a94-88a1-1f82b8b7b5ab	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/149.0.7827.137 Mobile/15E148 Safari/604.1	1782830591565-j1043nwzucp	\N	\N	mobile	Safari	\N	2026-06-30 21:43:11.757741+07
9434c90a-98d2-493e-ad94-308c591afe17	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/149.0.7827.137 Mobile/15E148 Safari/604.1	1782830591565-j1043nwzucp	\N	\N	mobile	Safari	\N	2026-06-30 21:43:15.762746+07
f0c75d6a-6734-44d4-b72c-dbce60884dfa	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/149.0.7827.137 Mobile/15E148 Safari/604.1	1782830591565-j1043nwzucp	\N	\N	mobile	Safari	\N	2026-06-30 21:43:25.668849+07
649c3df1-026d-42fe-8beb-3d16120f86a9	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/149.0.7827.137 Mobile/15E148 Safari/604.1	1782830591565-j1043nwzucp	\N	\N	mobile	Safari	\N	2026-06-30 21:43:29.413441+07
d036e913-9f3f-4c66-9bcb-c51765381f6f	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782829387034-vys1pqjsq3h	\N	\N	desktop	Chrome	\N	2026-06-30 21:50:49.816356+07
a897af04-697a-434c-8dce-56b0104a3063	/animals/1	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782829387034-vys1pqjsq3h	\N	\N	desktop	Chrome	\N	2026-06-30 21:51:04.968647+07
8004c791-16bf-422e-ac80-29d94430ae91	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782829387034-vys1pqjsq3h	\N	\N	desktop	Chrome	\N	2026-06-30 21:51:10.006589+07
3768f6f4-b3c2-40ae-8ac3-abf945d91b99	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-01 08:20:26.868877+07
8fd3c66d-e69e-488a-9bb0-32255f99382c	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782869288035-06r46o0h8hge	\N	\N	mobile	Safari	\N	2026-07-01 08:28:12.742662+07
4fe8b0fc-1f63-42f5-885a-6761de8ea5a0	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782869288035-06r46o0h8hge	\N	\N	mobile	Safari	\N	2026-07-01 08:28:21.293653+07
d61ea50e-78c1-4b55-bea3-d475a4a89263	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782869288035-06r46o0h8hge	\N	\N	mobile	Safari	\N	2026-07-01 08:28:24.241789+07
03a963ca-599e-49a1-a335-43fb5aeab97f	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782869288035-06r46o0h8hge	\N	\N	mobile	Safari	\N	2026-07-01 08:28:27.308261+07
473d7421-00f2-4d0d-8f61-a61ccd086afb	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782869288035-06r46o0h8hge	\N	\N	mobile	Safari	\N	2026-07-01 08:31:08.856969+07
9645ccbb-910a-474a-adb0-8deb2517824c	/fauna	Ragunan Zoo	http://100.126.123.106:3002/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-01 08:41:37.699455+07
222f657b-b127-4ec3-82c7-251bcea72722	/flora	Taman Margasatwa Ragunan	http://100.126.123.106:3002/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-01 08:41:48.548431+07
329328d0-7024-4d13-9255-4b1349dcf74b	/map	Taman Margasatwa Ragunan	http://100.126.123.106:3002/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-01 08:41:51.242796+07
ed07e6fa-555f-439a-8506-8c0be9343219	/	Taman Margasatwa Ragunan	http://100.126.123.106:3002/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	1782866315527-79eiedunjh8	\N	\N	mobile	Chrome	\N	2026-07-01 08:42:42.45727+07
dd81dd6f-65bf-4e50-b333-fe1099c29642	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782873667273-3dmyei6anr9	\N	\N	mobile	Safari	\N	2026-07-01 09:41:09.496497+07
6bf7017a-3104-4cc6-afcf-e8640b5f8924	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782873667273-3dmyei6anr9	\N	\N	mobile	Safari	\N	2026-07-01 09:41:10.762214+07
d4078e61-158a-4b05-9e7f-4e66f6ee5883	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782873678632-ggey0915s8a	\N	\N	mobile	Safari	\N	2026-07-01 09:41:21.006717+07
4ab31e1a-ffb4-4950-899f-533f8d023155	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782889790572-cjfzupge3x4	\N	\N	mobile	Safari	\N	2026-07-01 14:09:51.929997+07
f19e626e-2cd9-4fa4-8e71-88c9e5579a82	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782889801206-aykv0ksiyf6	\N	\N	mobile	Safari	\N	2026-07-01 14:10:01.542195+07
7ad66d23-c764-4958-a44f-601f10051854	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782889804018-1vhi9ia10q8	\N	\N	mobile	Safari	\N	2026-07-01 14:10:04.301436+07
24ad924b-fde3-42d7-8152-aa3fd6d14a2c	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782889810503-06gyibxkd6bd	\N	\N	mobile	Safari	\N	2026-07-01 14:10:10.871934+07
86868056-2948-45fd-aff5-30ec5e0b0903	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782889810503-06gyibxkd6bd	\N	\N	mobile	Safari	\N	2026-07-01 14:10:13.202495+07
d05484f7-5bb2-45d8-b4b9-03d0cb2fd693	/	Ragunan Zoo	http://100.126.123.106:3002/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	1782866315527-79eiedunjh8	\N	\N	mobile	Chrome	\N	2026-07-01 15:46:56.494434+07
c8127208-314b-425c-873c-6adbffd2236c	/	Ragunan Zoo	http://100.126.123.106:3002/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	1782866315527-79eiedunjh8	\N	\N	mobile	Chrome	\N	2026-07-01 15:47:56.273902+07
c9f7a011-c6f2-41e5-b756-710504f5d709	/	Ragunan Zoo	http://100.126.123.106:3002/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	1782866315527-79eiedunjh8	\N	\N	mobile	Chrome	\N	2026-07-01 16:09:34.938664+07
c4402945-6bf2-4296-948a-aac8971f4c2b	/	Ragunan Zoo	http://100.126.123.106:3002/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	1782866315527-79eiedunjh8	\N	\N	mobile	Chrome	\N	2026-07-01 16:12:43.33249+07
534faf8d-ac84-4f96-9df9-dce8c900e713	/	Ragunan Zoo	http://100.126.123.106:3002/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	1782866315527-79eiedunjh8	\N	\N	mobile	Chrome	\N	2026-07-01 16:29:53.586281+07
5b91014e-a551-47cd-9a22-e548458eff6b	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782902336047-d5wdlcnzywp	\N	\N	mobile	Safari	\N	2026-07-01 17:38:56.85513+07
cab24782-cde8-4195-ac02-26a393a29b31	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782911819049-x7uk07rc4z	\N	\N	mobile	Safari	\N	2026-07-01 20:16:59.845921+07
c3dc07e0-15d2-45c4-a067-fd6d847ef646	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782911819049-x7uk07rc4z	\N	\N	mobile	Safari	\N	2026-07-01 20:17:04.181689+07
02c0bfa0-a471-4dca-b92a-bd1f3166dea7	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782911819049-x7uk07rc4z	\N	\N	mobile	Safari	\N	2026-07-01 20:17:45.063748+07
26e7f9eb-ca48-48c9-add4-220589427016	/animals/1	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782911819049-x7uk07rc4z	\N	\N	mobile	Safari	\N	2026-07-01 20:17:48.074662+07
5897e27a-d540-4392-9727-90e785e2b971	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782951804646-chd4jowly4	\N	\N	desktop	Chrome	\N	2026-07-02 07:23:24.900746+07
3169e585-ce20-4b25-9f7d-67b5cd1ffb55	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 08:08:54.483216+07
a59702bd-8bbe-4202-b1d0-25b68b55b86f	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 08:43:06.439335+07
eb4ee419-72bd-4131-a75f-1492a5d999f6	/animals/1	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 08:43:12.072264+07
9d1d0af7-9bc0-4873-825d-de456f97b5a6	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 08:43:15.879923+07
f1b4609e-dfb3-41d5-b7ee-7dcc37dc1825	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 08:45:25.755964+07
a66c8464-644c-4ff9-8c50-eec831218957	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 09:01:47.443225+07
9a541d75-265e-4042-9e5a-b429b9801532	/audio-guide	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 09:34:03.782836+07
f0de572d-64f7-4367-8dc4-0a0dd01cb207	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 09:34:41.617508+07
b831a8e9-eeac-4d1b-942a-15c28df01e24	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782968505575-e7nqcqtrenp	\N	\N	mobile	Safari	\N	2026-07-02 12:01:47.084254+07
6e27f641-62ae-4d6f-8711-72e45ca1615b	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 16:26:20.965325+07
604b0aa1-c917-488c-bcbf-43973d46eb83	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 16:32:26.49845+07
646dbd69-6a70-4b13-ab25-2d1ebe5aba50	/report-facility	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 16:32:29.476446+07
f5b1ddac-854e-45b1-a2f1-f0d8cc1ed751	/wbs	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 16:32:33.197281+07
66ba0fe7-6a78-4a04-8e1d-873b11c058d2	/report-facility	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 16:32:35.282841+07
114ab9c1-eeca-4286-8943-e8edd10c70ba	/tickets	Tiket & Harga | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 16:36:24.873085+07
cde2f477-6913-4ad9-a4f6-ebfb823020cc	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1782866315527-79eiedunjh8	\N	\N	desktop	Chrome	\N	2026-07-02 16:36:27.570224+07
93f1d44a-887a-4331-8fb6-70152226b3c9	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782986509472-e7yw05lskou	\N	\N	mobile	Safari	\N	2026-07-02 17:02:09.640415+07
ddea34d3-3449-4190-874f-37ac62fea1d8	/tickets	Tiket & Harga | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782986509472-e7yw05lskou	\N	\N	mobile	Safari	\N	2026-07-02 17:02:22.803959+07
a502a06f-ada4-4ca8-93da-3a9fa5d9b5bf	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1782986509472-e7yw05lskou	\N	\N	mobile	Safari	\N	2026-07-02 17:02:24.267638+07
d40cad0d-467d-4a3c-ad2d-9d07fcd6d760	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783036201961-pdljj24q8ea	\N	\N	desktop	Chrome	\N	2026-07-03 06:50:01.098192+07
3e1950de-a6af-4b5d-a83d-4a625d0af05d	/	Taman Margasatwa Ragunan	about://newtab	Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/150.0.7871.51 Mobile/15E148 Safari/604.1	1783062495492-m4i0577sgp	\N	\N	mobile	Safari	\N	2026-07-03 14:08:15.77016+07
ed025369-b583-416e-8a13-475e6f33f6fc	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783130564563-qe03j7qk8wi	\N	\N	mobile	Safari	\N	2026-07-04 09:02:45.552653+07
7a6731d3-60c4-45d7-80a6-1f4a6235d3f6	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783306440818-cv7sedi2h4o	\N	\N	mobile	Safari	\N	2026-07-06 09:54:00.979292+07
73793c78-ee6d-49c9-a2af-63fa18bc21d5	/map	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783306440818-cv7sedi2h4o	\N	\N	mobile	Safari	\N	2026-07-06 09:55:05.546347+07
3f18d53a-b287-4572-a390-e933639a568d	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783306440818-cv7sedi2h4o	\N	\N	mobile	Safari	\N	2026-07-06 09:55:26.896237+07
947a3873-8969-49e3-a278-2d96fb410e9a	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783306440818-cv7sedi2h4o	\N	\N	mobile	Safari	\N	2026-07-06 09:55:50.639454+07
f7869d1c-eea7-43f6-8435-7d491333cfbf	/tickets	Tiket & Harga | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783306440818-cv7sedi2h4o	\N	\N	mobile	Safari	\N	2026-07-06 09:55:59.01932+07
0979ee72-3c97-4380-877b-e46edea93675	/report-facility	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783306440818-cv7sedi2h4o	\N	\N	mobile	Safari	\N	2026-07-06 09:56:13.615984+07
bde6cbea-1f26-4f13-b334-dd352419b51d	/report-facility	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307636837-b9hv0xhu59v	\N	\N	mobile	Safari	\N	2026-07-06 10:13:56.967458+07
35d83572-c99b-4229-973a-bba5223d850f	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307641354-mzdo8jvcuq	\N	\N	mobile	Safari	\N	2026-07-06 10:14:01.438359+07
752c16e9-502e-4f8a-928d-ac8aaf96781b	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:17:13.792963+07
716ad882-2be5-4e9a-aed3-4ed7a9c1476f	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:17:14.9243+07
635b47f5-d5a9-4a82-b1d8-1fcd37ef3fda	/wbs	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:17:17.703626+07
8650fff1-b1da-499c-904d-d8027d98a218	/report-facility	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:18:13.326414+07
af703429-471f-4720-9ed3-219276b86b72	/jdih	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:18:59.84877+07
6f1546d4-6761-42a3-b9c3-495467802b58	/perpustakaan	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:19:21.005335+07
91e0eb18-ac35-4bc5-8bb0-55247424b930	/library	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:19:21.195536+07
46493f62-85a6-4fc9-87c6-36299080ee79	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:20:04.84974+07
c77db385-3691-4ee1-9b2c-7f1e906f367a	/tour-guide	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:20:19.568903+07
04756b80-03c6-47c4-b1dd-0c9309311c84	/services	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:21:52.204063+07
554131f2-d5f5-4240-95a8-c60a185e2dc0	/standar-pelayanan	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:22:56.664458+07
d0de50bf-d5db-4299-869c-7babbf22b85b	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:23:10.639921+07
07ee64db-132f-4d45-bc29-cbc0e1d6caa1	/animals/1	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:23:13.981878+07
96a6b513-785c-4213-8a72-c1c4ed790c8c	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:24:21.901888+07
fbb3265f-ebe9-45cf-87a3-de1e77ac53a7	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:24:25.986019+07
d367f41a-8e3a-41ab-a6aa-f377c4e1393a	/audio-guide	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:24:31.88595+07
9aecf504-37d9-4979-ae94-175822c2f801	/gallery-3d	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:25:03.372297+07
6a721737-8404-4bfe-920e-a1f139fe1828	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:25:36.366869+07
00090df6-126c-4f13-8d39-04bc610d86d3	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:26:06.50123+07
909d08b0-b13f-4faf-9ea6-512ee9e39e34	/services	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:26:17.15089+07
b61651c3-1fc5-43d5-8cd5-bdef24dcd5aa	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:27:07.544494+07
7e564442-64bd-4d94-80de-a7b495e9af97	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783307833567-lkxqoj5vwq9	\N	\N	mobile	Safari	\N	2026-07-06 10:27:44.679055+07
50eb1c24-ad52-488f-b3e8-07bb84d491ab	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783309830371-l7gugi9f5z	\N	\N	mobile	Safari	\N	2026-07-06 10:50:31.226004+07
5fb599f6-726f-4fe5-8cb9-f99422631166	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783309848329-aq3mafwdq8l	\N	\N	mobile	Safari	\N	2026-07-06 10:50:49.153889+07
2f9b6036-2b63-4dc1-b929-cfafbaf11c58	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783310623568-mrqvpg1p2kq	\N	\N	mobile	Safari	\N	2026-07-06 11:03:43.863416+07
5b785827-50c5-4e10-b9e8-0a3f7804231a	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783310628109-4ggn9atauuj	\N	\N	mobile	Safari	\N	2026-07-06 11:03:48.387165+07
1807b497-24e9-4088-ae71-3095c09a310f	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783310629080-riwghq60oc	\N	\N	mobile	Safari	\N	2026-07-06 11:03:49.359323+07
150e42b7-22ae-46c5-8cc3-a25a075be909	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783312512095-hg43ipz1l9e	\N	\N	mobile	Safari	\N	2026-07-06 11:35:12.404336+07
f1cb26be-cdfb-4a19-bf13-d8b91ff5149b	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783319003969-xlujhbqz9e9	\N	\N	mobile	Safari	\N	2026-07-06 13:23:24.209407+07
f1c61888-e24a-4c69-8534-76de9cf625d8	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/150.0.7871.51 Mobile/15E148 Safari/604.1	1783319051647-tq55vrf5sl	\N	\N	mobile	Safari	\N	2026-07-06 13:24:11.875089+07
5338185e-0127-4dee-b903-876116336463	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/150.0.7871.51 Mobile/15E148 Safari/604.1	1783319051647-tq55vrf5sl	\N	\N	mobile	Safari	\N	2026-07-06 13:24:20.04832+07
5dbd6c09-5bf5-4a06-9588-9191cb171628	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783319003969-xlujhbqz9e9	\N	\N	mobile	Safari	\N	2026-07-06 13:25:00.149683+07
3ee25918-626c-4c18-956a-06158ac61df6	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1 Brave	1783319127702-gosh8512ry	\N	\N	mobile	Safari	\N	2026-07-06 13:25:28.041422+07
1f749b81-5192-436e-b204-1c56952afc3c	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1 Brave	1783319127702-gosh8512ry	\N	\N	mobile	Safari	\N	2026-07-06 13:25:40.055913+07
e7e48d57-fd65-4edf-919a-d49bd3f7db9b	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1 Brave	1783319127702-gosh8512ry	\N	\N	mobile	Safari	\N	2026-07-06 13:25:44.646355+07
bbae22f9-264e-4ff6-aae3-951a89500bb4	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1 Brave	1783319127702-gosh8512ry	\N	\N	mobile	Safari	\N	2026-07-06 13:25:48.996209+07
4cda2b0d-2c6e-4233-9b9d-139bae56b777	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1 Brave	1783319127702-gosh8512ry	\N	\N	mobile	Safari	\N	2026-07-06 13:25:52.470964+07
043c2d4c-4cdb-458e-a7e8-4810eb3891d0	/map	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1 Brave	1783319127702-gosh8512ry	\N	\N	mobile	Safari	\N	2026-07-06 13:25:56.021188+07
6e61c8fe-dac9-4c5b-98ac-7e263a59bf37	/audio-guide	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1 Brave	1783319127702-gosh8512ry	\N	\N	mobile	Safari	\N	2026-07-06 13:25:57.76797+07
e8a80b09-3834-4515-baa8-26287bfedce6	/gallery-3d	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1 Brave	1783319127702-gosh8512ry	\N	\N	mobile	Safari	\N	2026-07-06 13:25:59.436921+07
c25b4353-064b-4541-8af0-9f8a84c4b959	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-06 14:09:04.420494+07
bc0a272c-6d34-4dae-965e-0e64a5aecc38	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-06 14:47:56.628263+07
07fadbc4-ce1c-4980-85eb-516171f47206	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-06 14:55:05.732714+07
8503d578-c771-4a41-9e4a-8bde05e3b1d7	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 14:55:23.165132+07
63db0d44-8843-4cab-b5ac-7677c4220eea	/	Taman Margasatwa Ragunan	http://100.126.123.106:3002/manager	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1 Brave	1783319127702-gosh8512ry	\N	\N	mobile	Safari	\N	2026-07-06 14:56:51.711908+07
40c2fe8f-7a6e-42b3-87c1-5e0233e415ae	/perpustakaan	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 14:58:31.044447+07
b8ac976f-508f-4dd0-b3f4-85928e19bc85	/library	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 14:58:31.24206+07
9f73a900-e487-4f4d-b6c9-d26d64fbad7e	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 14:58:40.670121+07
af3995bf-14de-4356-9712-bf8534d487ed	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 14:58:44.687252+07
0aa65761-c9a5-4cb3-af21-e0a56165ea49	/animals/2	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 14:58:47.681337+07
e110dae8-7caf-49ce-8c50-8269a9e0dd95	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 14:58:51.868044+07
cca5f0cc-5750-45a5-a2f0-9d9862419351	/animals/1	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 14:58:53.199277+07
31cfd750-9ffb-468a-97e7-cfdec0323ed3	/report-facility	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 14:59:02.399377+07
600943b6-5d53-4575-91e1-e0d343a5ed49	/wbs	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 14:59:04.119695+07
2aada0dc-39fc-414b-81df-3f4232f43586	/tickets	Tiket & Harga | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 14:59:06.799849+07
890e97db-a584-44d7-befa-2773ad90140b	/tickets	Tiket & Harga | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 15:00:09.20266+07
b6eb5cb0-bb6b-4c06-a073-c776a379d0cc	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 15:00:16.542746+07
3fc91f3c-bae4-4305-a407-1f3db9cd65b1	/events	Jadwal Acara | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 15:59:35.206885+07
47220881-3268-4608-b9da-e8b1b4771b4b	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 15:59:46.080962+07
a061097f-fa13-4be7-bb9d-ed2ccda62c8f	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:05:26.24634+07
b8f257bd-79ba-4546-921a-f4e2b67c075a	/animals/1	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:06:10.78952+07
c70fa937-281b-4f8d-9b14-1efa2f9d3a91	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:06:13.847574+07
e49730b5-f7e0-43e4-80d4-1d7e89f4a0e9	/animals/1	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:06:19.332977+07
7047f724-fe38-4621-a386-6ad9ba2da653	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:09:55.324596+07
02f7d5b1-eb01-4c8d-abe2-b81b7169d297	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:10:28.373047+07
611e5bb3-f283-4540-9a30-0f686bbd58b2	/map	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:11:29.12569+07
0c890797-b665-44d4-ac50-1621fd73cbb5	/audio-guide	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:12:43.432721+07
8fab585c-27bb-4280-a185-f86f68afe705	/gallery-3d	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:13:08.936395+07
fb66ae1c-4e47-424e-8874-018279f31caf	/audio-guide	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:13:14.65277+07
9a7d6e39-8cf1-4b26-944f-aaf3258ff69e	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:13:17.317484+07
f5ac934e-a358-4146-bae3-7d5cb2bd9db1	/tour-guide	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:14:06.798542+07
2ecd233c-e12d-4a4e-af0c-b87fee763cc3	/standar-pelayanan	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:15:41.039848+07
81ce1033-fbd9-483f-bfa4-7a8c6173a89d	/tour-guide	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:16:02.694827+07
620ae371-5300-4ec6-b1a5-2c728b96f0b2	/news	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:26:43.454664+07
b9fd398d-bc04-4734-9913-d7825f68fd8c	/news/1	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:26:56.486241+07
34831777-58ad-4cbf-b0b8-8095b46843a5	/news	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:27:00.936714+07
05489343-a9d8-4161-8492-454604d9d0a4	/events	Jadwal Acara | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:27:04.445006+07
756a143f-7288-4037-8226-eddd57bdd68a	/history	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:27:38.606122+07
376d0448-6dde-4ef0-aabe-bded052162aa	/jdih	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:27:55.34191+07
d580f176-142f-4e69-9c16-b8cdbcd9a2de	/library	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:28:44.406967+07
d27fe76b-cdab-45cc-934e-9889c15e050a	/wbs	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:30:56.674798+07
ad3efeaa-c193-4914-922e-eb6f537af0f6	/report-facility	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:31:11.875117+07
68ffea07-0ab0-4305-b26c-6545c1d3db1e	/wbs	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:31:23.228092+07
b83bf1a8-da5e-496c-b301-fa1d7232fada	/report-facility	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:31:31.934419+07
1d99a732-6b56-42f1-9cff-e06689569da9	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:32:36.823061+07
9b4a88f8-5d5f-4414-a3be-7adc1ab08e9c	/services	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:32:39.933643+07
211045cc-9802-4a46-bc72-76c15186a7ae	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:33:52.78757+07
99db2ef0-c018-4ff1-ad8c-60bfddb6df60	/services	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:33:57.372809+07
a5c7f2cb-b0a5-4053-b981-19a96b121b7a	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-06 16:42:04.555922+07
17740f22-7fce-4717-9b9b-05bebf3e779d	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783337391089-rmivofnibnq	\N	\N	mobile	Safari	\N	2026-07-06 18:29:52.02365+07
3cb7c830-83fb-419c-9ec5-65584dc83fdb	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783337391089-rmivofnibnq	\N	\N	mobile	Safari	\N	2026-07-06 18:29:53.240906+07
8416c2c4-c937-479f-a1a3-7f7c41f9dd1e	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783337391089-rmivofnibnq	\N	\N	mobile	Safari	\N	2026-07-06 18:29:57.519861+07
f7481691-9b3e-4dc9-89ef-b390064b69d6	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 08:39:08.63784+07
84fd280f-44bd-400a-b03c-f3a3cda8a9b2	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 08:53:56.448711+07
654f99b9-ec9f-4ce4-84ca-139f26848313	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	ab7047c3-61ca-45c1-a697-c53e1bd1a5bc	\N	desktop	Chrome	\N	2026-07-07 09:09:25.474881+07
1e474dfd-2f10-4de4-a267-1f2ff8ee6bd9	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 09:09:44.857396+07
4a05f7bd-a7c3-4039-a3ed-3bb5fcebbe07	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	ab7047c3-61ca-45c1-a697-c53e1bd1a5bc	\N	desktop	Chrome	\N	2026-07-07 09:09:58.025068+07
17e98457-ecf9-4d50-b88e-b77d7ecf8b16	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	ab7047c3-61ca-45c1-a697-c53e1bd1a5bc	\N	desktop	Chrome	\N	2026-07-07 09:16:44.961164+07
98348460-fbc9-472b-b6ec-c8e3e63481a2	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 09:23:40.631641+07
0a4d9d80-fae4-480a-9986-035ee3eac754	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	ab7047c3-61ca-45c1-a697-c53e1bd1a5bc	\N	desktop	Chrome	\N	2026-07-07 09:23:51.559563+07
fecba76d-4863-4749-8691-0065da618f83	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783392157226-hy5g1xeccxk	\N	\N	mobile	Safari	\N	2026-07-07 09:42:38.9073+07
5a23990f-b989-48d5-a432-db707a78a101	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 10:27:09.117696+07
794b7dbc-6cbd-4165-a775-c54598d2062d	/	Ragunan Zoo	http://100.126.123.106:3002/auth	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1 Brave	1783405165060-2d7i5f9j5uu	\N	\N	mobile	Safari	\N	2026-07-07 13:19:25.253629+07
9c32d57a-6faf-4be4-8816-c3e627394079	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	ab7047c3-61ca-45c1-a697-c53e1bd1a5bc	\N	desktop	Chrome	\N	2026-07-07 15:43:57.643895+07
4d0ce1cd-d160-4f72-b465-46e2d26c77ae	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 15:44:11.517221+07
4ab6a0e5-4030-41cb-b8e5-15159e1804ef	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	ab7047c3-61ca-45c1-a697-c53e1bd1a5bc	\N	desktop	Chrome	\N	2026-07-07 15:44:21.022144+07
e37164d3-313d-4a66-a74c-920ff6b1e11f	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 15:58:53.197858+07
d5372206-03e7-4ae0-a47d-7a8e31304ccd	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	ab7047c3-61ca-45c1-a697-c53e1bd1a5bc	\N	desktop	Chrome	\N	2026-07-07 15:59:05.955829+07
22bb5fd6-2a5a-4082-bf0f-90a9311a78f5	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 16:10:38.686355+07
ddead001-ae6e-4828-904d-2656df2581de	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 16:11:05.384787+07
2ed15b4e-ec4a-4605-9bb8-ca7b8cb0df68	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 16:11:24.604019+07
df6c67c3-6638-4c26-843b-406331fe2877	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 16:19:42.213053+07
d1a13abc-c99b-49a2-b18a-b3c47f1017c9	/services	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 16:21:52.255037+07
1f6b01dd-0292-4c10-a8e2-d6e85c234fc7	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 16:25:53.389813+07
1fbba00b-ee88-43d4-9174-b5a53715bc17	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 16:25:57.064697+07
663787ab-5c2f-487d-8265-860dc5320ba6	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 16:29:41.456489+07
f4daf4df-2972-4393-b387-088a86412bc4	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 16:38:24.30209+07
e9fb08bb-d2cc-4567-be41-6846e6f2dd70	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 16:38:30.365558+07
5fc172d0-5546-49a2-befb-fdd2807bfa47	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 16:40:23.804777+07
8ecd9ce5-115a-4cba-9b15-df69b7043b1c	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 16:44:32.45745+07
fcc6a4c2-82a7-4786-ba4f-fcc52dccb18c	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 17:01:01.221698+07
1540cc93-92f6-4ccd-8b2f-f4e995918959	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783419954685-phqpgjapghk	\N	\N	mobile	Safari	\N	2026-07-07 17:25:54.951399+07
74c3fc32-b59e-4020-a379-de8adcfb0e37	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783419954685-phqpgjapghk	\N	\N	mobile	Safari	\N	2026-07-07 17:25:57.988348+07
7c5c16d2-cbf6-4149-812b-e511e706fcbe	/map	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783419954685-phqpgjapghk	\N	\N	mobile	Safari	\N	2026-07-07 17:26:06.444359+07
130aac79-e544-4a32-afa4-2ed062c3065d	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783419954685-phqpgjapghk	\N	\N	mobile	Safari	\N	2026-07-07 17:26:10.870363+07
7cc279fa-7262-47f9-b193-1422d6201bc8	/events	Jadwal Acara | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783419954685-phqpgjapghk	\N	\N	mobile	Safari	\N	2026-07-07 17:26:23.713967+07
9ab84dfc-0875-40f2-b5c1-e75292aa24a5	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783419954685-phqpgjapghk	\N	\N	mobile	Safari	\N	2026-07-07 17:26:25.005035+07
aebd8626-cb51-4892-a90d-5c7c07fa732a	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 17:40:22.587989+07
c36aeb87-e91d-4e21-927a-a54d29ca0a46	/wbs	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 17:40:25.321292+07
96cc0635-3ad1-4c52-b862-ab58917d4e72	/wbs	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 17:48:45.542902+07
19e48ad8-7758-433f-a51e-8da236a6f78f	/report-facility	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 17:52:35.098662+07
7c5dd3f3-5231-4338-b153-1fdbf14acf49	/report-facility	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 18:11:52.3167+07
0e11627b-bf7d-4644-885d-3ddb4ab0a2ad	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 18:11:54.977889+07
cf416ce0-3537-4e4b-9143-3fc52216c633	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 18:23:46.510586+07
d6f9d0ac-7a66-4fb4-9abc-83d934f7fce8	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783321741842-1fhccmolcw	\N	\N	desktop	Chrome	\N	2026-07-07 18:43:11.075553+07
5f1a16cb-5591-412a-a0a3-759436cdeb6b	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-07 19:40:05.855425+07
6b716017-fa20-4d14-b05e-88e6b3e7a741	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-07 19:40:09.802892+07
1bc3b681-fd65-418d-a84f-cbb858f90c68	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-07 19:42:59.757059+07
c2c105c7-fba3-4d75-8a17-52894906294f	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-07 20:17:41.387785+07
95fabd40-240f-43e5-86a4-bdabf7111e5d	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783324520478-u4uv6ydyukp	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-07 20:17:43.763055+07
fb56bf2c-a9cc-49aa-9550-fe347d4bf809	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	1783321741842-1fhccmolcw	\N	\N	mobile	Chrome	\N	2026-07-07 21:40:44.074934+07
0e15c904-71de-49b3-a325-4c56fffc284b	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783492749412-9l1it0ga6sw	\N	\N	desktop	Chrome	\N	2026-07-08 13:39:09.287004+07
6b847d5a-e678-4410-9d39-b48b7a16b272	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783492787434-4bpyobkd465	\N	\N	desktop	Chrome	\N	2026-07-08 13:39:47.279198+07
0715e6ca-f617-4f8e-a70a-57c3d084a30e	/	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 14:08:44.062536+07
1a26af3d-feb9-4dfb-81c5-9a2238d9b4bb	/report-facility	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 14:08:49.592884+07
3357c02e-90f8-4dac-b555-9da85fcbda9d	/track-report	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 14:09:22.014389+07
ae0ed1e7-3cff-4610-a603-3f325571bb7c	/track-report	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 14:18:12.60424+07
9893871c-f64f-4c1a-8dce-826fe2850646	/track-report	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 14:19:23.159378+07
b3c4c4b8-2ad4-435d-bde7-407fccd7c18c	/report-facility	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 15:12:49.822503+07
aac4e18e-fe69-4cbe-a4e7-14b63ecb1ae1	/track-report	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 15:14:36.668655+07
c2c87ece-8310-4b97-926b-46816677d853	/track-report	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 15:14:47.1679+07
428910d1-f190-43c8-a12e-b7faa4038628	/track-report	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 15:42:48.632668+07
9e95d819-c230-48e8-9d72-f84858e4371c	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 15:44:40.971133+07
9d4e2645-f5ad-4f2e-ad71-870a28d1eb1e	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 15:51:47.923102+07
013d51ed-bafa-4aae-858d-d5c537a98cbe	/report-facility	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 15:54:35.63753+07
dd11d10a-ce04-4ebb-9c81-82d2c55870f3	/report-facility	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 15:54:50.5846+07
1d13a758-4d58-45eb-a98b-f81f8207035c	/track-report	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 15:55:03.365476+07
97162f2f-38a4-431c-a8c5-183695d113fa	/track-report	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:12:53.872605+07
8238f480-558f-4902-a0bc-78a0464b0ada	/track-report	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:23:02.454893+07
e08018c2-a71c-4522-bd56-841bae849b85	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:23:11.950101+07
72ae3e05-c238-4358-a313-c8c8bda8d4da	/track-report	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:23:14.070899+07
290a384a-2280-4c71-a01f-bd91fa32e5d7	/report-facility	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:23:16.219394+07
581d1128-8591-45c0-acd1-3b06e4d08579	/track-report	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:23:43.546593+07
cb668391-b269-40f6-8eda-e6306e96cc98	/report-facility	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:24:17.380791+07
f0feeb60-31f4-4c65-9211-7b01deb8c99f	/track-report	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:24:28.395+07
da38aba4-9eac-431f-8b1e-63de85fc4b12	/track-report	Taman Margasatwa Ragunan	http://100.126.123.106:3002/track-report?ticket=RAG-RPT-4LOOUY	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:33:23.549904+07
0fa32ce1-64fd-4265-8939-3b955e2fffb7	/report-facility	Taman Margasatwa Ragunan	http://100.126.123.106:3002/track-report?ticket=RAG-RPT-4LOOUY	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:34:27.132095+07
279e9d11-1e02-4493-926f-7a2f661a9874	/track-report	Taman Margasatwa Ragunan	http://100.126.123.106:3002/track-report?ticket=RAG-RPT-4LOOUY	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:34:40.226618+07
8c75d7f7-6725-4498-af01-7ac04fa8d583	/services	Taman Margasatwa Ragunan	http://100.126.123.106:3002/track-report?ticket=RAG-RPT-4LOOUY	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:41:52.51346+07
62eabc7d-102f-493e-bf2e-0b843a45de35	/track-report	Taman Margasatwa Ragunan	http://100.126.123.106:3002/services	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:48:30.732585+07
301dde54-71f3-47cd-bd07-63aaacab6e34	/report-facility	Taman Margasatwa Ragunan	http://100.126.123.106:3002/services	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:48:50.782357+07
c74a30c3-d8a6-4b26-bca8-fff15017e01c	/track-report	Taman Margasatwa Ragunan	http://100.126.123.106:3002/services	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:49:03.314258+07
e57ac5aa-47d9-471f-881d-65aca8f87cff	/track-report	Ragunan Zoo	http://100.126.123.106:3002/services	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:58:27.898071+07
88d79b13-1d0a-4bf4-808b-01f592ccb78d	/	Taman Margasatwa Ragunan	http://100.126.123.106:3002/services	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:58:30.27062+07
0ac0cd9f-080b-4ccd-82eb-1b31ef28d9c5	/services	Taman Margasatwa Ragunan	http://100.126.123.106:3002/services	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 16:58:32.386608+07
21ecbd68-b07c-4330-90a3-c495718e39b3	/services	Taman Margasatwa Ragunan	http://100.126.123.106:3002/services	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 17:13:37.658749+07
08b03a2c-8d86-4ff2-badb-dee386a71fe6	/report-facility	Taman Margasatwa Ragunan	http://100.126.123.106:3002/services	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 17:13:40.838213+07
184cc4cf-384c-4741-9b71-b6c61e565773	/track-report	Taman Margasatwa Ragunan	http://100.126.123.106:3002/services	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 17:13:56.817543+07
1fdab72d-6920-4c61-b617-cfb407cebe28	/report-facility	Ragunan Zoo	http://100.126.123.106:3002/track-report?ticket=RAG-RPT-CL6XQU	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 17:29:06.029108+07
8ff52bbd-70d2-4862-84a4-4a45e2c565f1	/track-report	Taman Margasatwa Ragunan	http://100.126.123.106:3002/track-report?ticket=RAG-RPT-CL6XQU	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783494524184-jm79ssgk779	\N	\N	desktop	Chrome	\N	2026-07-08 17:29:25.052764+07
548037a7-f80a-4f0c-8fc4-0e9574d0c018	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783507743610-j2yc1e8t5te	\N	\N	desktop	Chrome	\N	2026-07-08 17:49:03.710239+07
b0ed8e6a-b0e7-4622-a8dc-0f589bde0453	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783515049828-srptfizs63b	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-08 19:50:50.315583+07
fc190518-c943-47ee-8793-1854f56c6b73	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783515049828-srptfizs63b	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-08 19:50:54.441884+07
49b96f4a-8761-434e-82dc-5250d39470b9	/venues	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783515049828-srptfizs63b	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-08 20:03:07.784551+07
ee5d8223-0088-421d-9693-c42d7f8a3230	/venues	Ragunan Zoo	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	1783515049828-srptfizs63b	3862202b-f2aa-401d-afec-5ededc2c6335	\N	desktop	Chrome	\N	2026-07-08 20:54:20.899995+07
fefb6d37-4873-407d-be69-79096ecdc8b5	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783553898252-g0rozney0hh	\N	\N	mobile	Safari	\N	2026-07-09 06:38:18.698706+07
d7d7996e-7f83-43be-854c-0546205bc8f6	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783553898252-g0rozney0hh	\N	\N	mobile	Safari	\N	2026-07-09 06:38:24.903592+07
946c2b95-e02c-40d8-b7ac-38b7c73a7f8f	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783553898252-g0rozney0hh	\N	\N	mobile	Safari	\N	2026-07-09 06:38:29.141233+07
77930b74-caeb-49fd-8a15-697e40666a96	/gallery-3d	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783553898252-g0rozney0hh	\N	\N	mobile	Safari	\N	2026-07-09 06:38:35.668744+07
60e6700e-748f-49f4-b40a-c4353c91d794	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783553898252-g0rozney0hh	\N	\N	mobile	Safari	\N	2026-07-09 06:38:44.062692+07
bc91e537-e43c-4bf3-83b4-8bcff28dccdc	/map	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783553898252-g0rozney0hh	\N	\N	mobile	Safari	\N	2026-07-09 06:38:46.867242+07
21cb0d86-8465-4cd2-92ba-465fdeb3ecfa	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783553898252-g0rozney0hh	\N	\N	mobile	Safari	\N	2026-07-09 06:38:54.01099+07
0cac6b47-fcb8-4064-9b9b-7493908c636d	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783561025828-swgut6pf5hb	\N	\N	mobile	Safari	\N	2026-07-09 08:37:06.722744+07
008bc63c-64ba-47b5-89a6-27f05dbdc42c	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783562762376-fyvnss6156c	\N	\N	mobile	Safari	\N	2026-07-09 09:06:02.71896+07
4cff0d15-3283-4122-a660-38876be42cac	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783569433364-mczq2wvsljr	\N	\N	mobile	Safari	\N	2026-07-09 10:57:13.743356+07
6e773dd5-a1cb-4742-81ab-ccfc96313e9e	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783569433364-mczq2wvsljr	\N	\N	mobile	Safari	\N	2026-07-09 10:59:41.22816+07
fdfda655-c670-4d16-923b-3afc0724d492	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783569433364-mczq2wvsljr	\N	\N	mobile	Safari	\N	2026-07-09 10:59:45.220155+07
6f1256bc-d6a7-41d9-870b-6dff52127c9a	/animals/1	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783569433364-mczq2wvsljr	\N	\N	mobile	Safari	\N	2026-07-09 10:59:47.016354+07
75e45a20-669f-4adc-b22b-bc1f6dd25e90	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783604083734-srov6dxkoad	\N	\N	mobile	Safari	\N	2026-07-09 20:34:45.034371+07
61c1d638-0378-4994-b027-dfdf6a58cc2e	/	Ragunan Zoo	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:04:36.01318+07
ca786ff9-55fe-4c6a-8554-f801b901c19e	/map	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:05:32.600629+07
68cf36d5-5556-44f1-ac67-4287b107db15	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:06:08.986183+07
72965465-a75f-4b13-acfb-da055480886a	/events	Jadwal Acara | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:06:28.619486+07
39004b51-903a-4a4b-9216-973b96919de4	/tickets	Tiket & Harga | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:06:44.450903+07
d59477ff-dec6-4a86-b63f-c92fdba17e12	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:06:51.831915+07
ea32c608-e7b3-45c6-b816-3bb3834cd94d	/tickets	Tiket & Harga | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:07:16.094998+07
e016ed29-48fd-4c88-a68a-fb792d9e6e32	/history	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:07:26.690713+07
21130288-fea8-4318-b956-81c301f0f69f	/standar-pelayanan	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:07:39.59762+07
647d4a8f-3c92-460f-bcff-aa1a68075279	/gallery-3d	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:07:47.283972+07
415abdc9-201b-4c63-9fd7-7695414c6deb	/standar-pelayanan	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:07:52.649633+07
d19137b9-91e1-4081-975f-64cc6c909e24	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:08:00.512971+07
aba5458c-3a1c-49d4-bebc-d1b59b3b865d	/events	Jadwal Acara | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:08:04.554501+07
19743704-b4a2-4417-9f87-4a89650329f8	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:08:11.455705+07
8dd5b27b-11ad-47b3-818a-92d695e8208a	/animals/1	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:08:30.369858+07
3eb442af-62f6-4c06-b030-fc4a3cf6bd00	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:08:43.228941+07
566aa87e-0d6d-4c51-b801-90568c8ea4df	/animals/2	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:08:50.472339+07
8d771652-8e35-4092-a696-e67d5fa2cde0	/privacy	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:09:09.755367+07
f77e81e4-e52a-49c7-9995-4bd9b3a006c4	/terms	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:09:19.239775+07
d5be2002-2a52-42d9-954a-f87fca752eff	/wbs	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:09:28.128144+07
2ad96151-f0c5-4a73-8858-42fba6b75812	/track-report	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:09:58.99333+07
dd114eba-80ae-41b9-81ea-7b0aca0b997a	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:10:02.638747+07
3a423e9f-180e-4961-9dbc-644cb2846564	/track-report	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	1783605875412-ublo2qezxe	\N	\N	mobile	Chrome	\N	2026-07-09 21:14:58.62495+07
1ab8929d-96ca-4cb9-ad07-4d8c955574e4	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783743553993-dsnrc8noqg5	\N	\N	mobile	Safari	\N	2026-07-11 11:19:15.096693+07
2e0c66a4-6146-4cb4-ab77-63edda0af43f	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783994708902-zm51fvt2mj	\N	\N	mobile	Safari	\N	2026-07-14 09:05:09.702418+07
c93c7ad0-c597-47cc-bac8-b770555dfb32	/	Ragunan Zoo	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1	1783994708902-zm51fvt2mj	\N	\N	mobile	Safari	\N	2026-07-14 09:05:23.043146+07
eef1ee4f-87b9-4bc9-b239-def5443caa9d	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	\N	\N	desktop	Chrome	\N	2026-08-01 09:28:37.355005+07
8cd60ef1-8b49-4bed-8aec-3181997f22c8	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1 Brave	1784107326582-po69f7fmo28	\N	\N	mobile	Safari	\N	2026-07-15 16:22:07.059758+07
445d4090-ae53-4e06-b64e-1b5757b61e03	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1	1784338309777-8svu0yy1xwt	\N	\N	mobile	Safari	\N	2026-07-18 08:31:50.839361+07
385c6ce9-5be4-4d45-9676-e26b0abcbf81	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	1784420071816-r96xeqmj4lb	\N	\N	desktop	Chrome	\N	2026-07-19 07:14:32.133041+07
d592704c-7dd1-4919-8e50-f89dbeedfee0	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1	1784629441394-dcvd05wm1wv	\N	\N	mobile	Safari	\N	2026-07-21 17:24:01.536358+07
a0a1a682-df7c-42ad-a4b9-f56cec5e491d	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1	1784645367635-imeubxp5klf	\N	\N	mobile	Safari	\N	2026-07-21 21:49:28.077255+07
48b88a92-8415-4436-b403-85a9dfe8473e	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785200041925-613xoylh0mg	\N	\N	desktop	Firefox	\N	2026-07-28 07:54:02.809872+07
a428029a-0995-4b28-ae0e-047ef1c4a0ce	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	1785323998310-boujsqfb9mu	\N	\N	desktop	Chrome	\N	2026-07-29 18:19:58.795748+07
4b5aaa8e-b486-4337-8a86-3a9e52b29587	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	1785372648882-t5dw1xqanxq	\N	\N	desktop	Chrome	\N	2026-07-30 07:50:48.893088+07
583cb1a6-0797-4071-bc20-3932b2e8e593	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	1785470714878-uyize6b2c9k	\N	\N	desktop	Chrome	\N	2026-07-31 11:33:32.217545+07
ba79642e-f45d-4c6e-91af-19c7c0b26bc3	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785470714878-uyize6b2c9k	\N	\N	desktop	Chrome	\N	2026-07-31 11:54:02.427204+07
956d062b-ef3b-477f-a78a-17d7127fccb0	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785476870654-36gz95s7u02	\N	\N	desktop	Chrome	\N	2026-07-31 16:22:00.940279+07
cb728d4c-70fb-41f6-bc0f-7418ecddb10d	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785487957476-68vws472mrv	\N	\N	desktop	Chrome	\N	2026-07-31 16:22:25.74385+07
776ad884-0419-4691-9122-d541146b0b92	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785503104120-fuv1k8mybpw	\N	\N	desktop	Chrome	\N	2026-07-31 20:05:04.317507+07
a09e0337-664a-4e8d-8a08-dd2a11b76dd0	/	Taman Margasatwa Ragunan	http://localhost:3000/manager/animals	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 08:10:42.754049+07
603605ae-6e3c-4135-8e0b-0777131c98d2	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 08:31:32.128862+07
898fd08a-5971-4168-b7a6-fe60a86a0530	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785503104120-fuv1k8mybpw	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 08:31:32.719809+07
cf9ddd3f-5b27-4d32-abc1-cf34b5dd40c5	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 08:44:29.764921+07
58805f82-9daf-454c-a069-3b0ce5c3d984	/animals/2	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 08:44:33.269028+07
66bf29ad-8c07-4d77-b356-7c9e101cdd05	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 08:44:37.800375+07
d7e0d813-03ef-4067-91c7-753599a04674	/tickets	Tiket & Harga | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 08:50:44.174494+07
af1bcc89-78fd-4a79-b6f2-97af1585aa6d	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 08:50:51.887088+07
126c647a-6625-47ff-bcbd-b8f14df9aaa3	/animals/2	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 08:52:10.161227+07
e43dd17b-9ee1-4093-a1f8-ad57285460e6	/animals/2	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 08:53:34.531304+07
0024e30e-23cc-415f-9936-100214b357b2	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 08:53:37.091287+07
4e562233-9bed-4fdc-a512-3d7203743538	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 08:55:31.460122+07
ba0766ba-e07b-4b4c-ad90-a8852e583789	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785503104120-fuv1k8mybpw	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 08:55:31.690354+07
a707474b-d064-4734-b1a7-57072849bf7e	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 09:00:04.611554+07
be71c734-e5cd-4357-b7dc-367a6c6664aa	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785503104120-fuv1k8mybpw	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 09:18:12.193342+07
ac6b40d3-3985-4a9f-8628-de18e42deec7	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	\N	\N	desktop	Chrome	\N	2026-08-01 09:20:44.62154+07
9565e02f-61c9-486c-9d5b-155c35612a78	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	\N	\N	desktop	Chrome	\N	2026-08-01 09:21:01.138446+07
f37beded-9697-4447-a1f6-ba8c176bd492	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	\N	\N	desktop	Chrome	\N	2026-08-01 09:28:14.852378+07
4b9d171b-c750-4fae-afa7-8be863e7b07f	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785503104120-fuv1k8mybpw	26b0bda9-67d9-437d-8a35-5640e9e7afcd	\N	desktop	Chrome	\N	2026-08-01 09:35:31.195279+07
3f27561a-6d6a-492c-82f8-fbe2b6ec81ea	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	\N	\N	desktop	Chrome	\N	2026-08-01 09:35:31.985345+07
35c80a8b-3573-4eb2-b900-d0fca21d3508	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785503104120-fuv1k8mybpw	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 11:42:38.017672+07
71fdb622-d526-4fb8-b42b-e592588c5798	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785503104120-fuv1k8mybpw	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 11:49:04.02332+07
4ca3dab4-50af-49ab-a2ef-c68b42fad816	/	Taman Margasatwa Ragunan	http://localhost:3000/manager/users	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	\N	\N	desktop	Chrome	\N	2026-08-01 12:14:48.999708+07
43c1fd1c-7ef9-456e-b048-f401c7e5c303	/	Taman Margasatwa Ragunan	http://localhost:3000/manager/users	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	\N	\N	desktop	Chrome	\N	2026-08-01 12:15:02.316643+07
c40d8db2-e8b4-4ec7-b8a1-1c498fbb2aea	/	Taman Margasatwa Ragunan	http://localhost:3000/manager/users	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	\N	\N	desktop	Chrome	\N	2026-08-01 12:21:21.876244+07
76f02273-1191-4a3a-b12b-051b636ea834	/fauna	Taman Margasatwa Ragunan	http://localhost:3000/manager/users	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	\N	\N	desktop	Chrome	\N	2026-08-01 12:23:28.737975+07
00fc45f9-68ba-4d2e-866a-fabad29d9a48	/	Taman Margasatwa Ragunan	http://localhost:3000/manager/users	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	\N	\N	desktop	Chrome	\N	2026-08-01 12:58:56.067624+07
94e94291-1a4b-40eb-b713-e43fb672fe52	/	Taman Margasatwa Ragunan	http://localhost:3000/manager/users	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	\N	\N	desktop	Chrome	\N	2026-08-01 13:12:22.21115+07
28b9ca8d-aac4-4bc4-9ff0-bb038d4028eb	/privacy	Taman Margasatwa Ragunan	http://localhost:3000/manager/users	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	\N	\N	desktop	Chrome	\N	2026-08-01 13:16:12.532159+07
9b5a5984-5782-436a-9856-1ea13fee6391	/terms	Taman Margasatwa Ragunan	http://localhost:3000/manager/users	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785546642736-aea9cis2el4	\N	\N	desktop	Chrome	\N	2026-08-01 13:16:25.399183+07
5559c4b2-2bb5-4b7f-8931-405490a682d7	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785566936461-kb9nl64jphc	\N	\N	desktop	Chrome	\N	2026-08-01 13:48:56.648748+07
4ea9d9d9-434d-40a9-b822-4e82ca4be289	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785568272018-gy1idhtzxsq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 14:11:12.178368+07
79cefdaa-2157-4c24-bca0-2ef375e8c612	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785568272018-gy1idhtzxsq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 14:11:16.620007+07
1f45a9c1-a364-447d-921a-df18468806b6	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785568272018-gy1idhtzxsq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 14:11:21.933585+07
8c6b8b07-802d-4d64-8ed1-08045e7e7a28	/flora	Ragunan Zoo	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785568272018-gy1idhtzxsq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 14:13:25.948546+07
02a685cb-66dc-4a79-858e-0079f9f276d4	/flora	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785568272018-gy1idhtzxsq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 14:14:22.523361+07
a83c10be-ab2d-4115-b037-e170ddc0cb9b	/	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785568272018-gy1idhtzxsq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 14:14:25.827986+07
21e91ee1-63ac-487f-b44c-9db28c5547a0	/flora	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785568272018-gy1idhtzxsq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 14:14:28.232379+07
c19e6f61-0e87-4452-997a-d077681ce0c4	/flora	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785568272018-gy1idhtzxsq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 14:18:44.63798+07
c5d4234c-ec4f-43b6-9501-9058790e4b9e	/	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785568272018-gy1idhtzxsq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 14:18:48.339429+07
341c134b-a272-4e67-9366-7e64f6344a11	/fauna	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785568272018-gy1idhtzxsq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 14:18:50.32708+07
dc3ba5a1-c789-47e5-ab28-f2212a395345	/fauna	Taman Margasatwa Ragunan	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785568272018-gy1idhtzxsq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 14:23:33.392798+07
74340038-f3f4-46d3-9a28-1d228305e23e	/fauna	Taman Margasatwa Ragunan	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785568272018-gy1idhtzxsq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 14:33:59.027559+07
0748f263-f529-4d59-8f93-2625d83f3ce0	/animals/1	Taman Margasatwa Ragunan	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785568272018-gy1idhtzxsq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-01 14:34:01.422687+07
477a8a5b-0ea7-4f7c-ac0b-ef78923f40a7	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785639556814-rvcyfgn8k4	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-02 09:59:17.481612+07
e148490e-792f-4091-9cd3-4da85f9d179d	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785641176878-prv99rtdqxb	\N	\N	desktop	Chrome	\N	2026-08-02 10:26:17.114609+07
906d4825-45f2-4565-af08-968962047884	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785641177457-9sb5bieab0c	\N	\N	desktop	Chrome	\N	2026-08-02 10:26:17.812585+07
6cae3efa-ad4d-4094-a7e9-37832b4cbfb9	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 10:26:50.879944+07
437fd7a1-3dcd-41b8-a420-04162b0e61f6	/animals/category/0b537b2d-ee09-476f-907c-0c5d474e7b0d	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 10:32:26.42028+07
032ffc38-a646-479c-8ff0-79679468f4c7	/animals/4	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 10:32:49.587043+07
651f3fb0-63c3-40b9-8a6d-c6643710c02b	/animals/category/0b537b2d-ee09-476f-907c-0c5d474e7b0d	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 10:33:03.022547+07
e3528d52-4d7e-4fd8-bf9b-f1d2de25ae51	/animals/4	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 10:50:05.947522+07
1a0b8fea-9cd3-4c0e-897d-acec7ed76bad	/animals/category/0b537b2d-ee09-476f-907c-0c5d474e7b0d	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 10:50:11.907402+07
67970af6-99fa-41bc-92f5-eb9150b20f6a	/animals/4	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 10:50:13.712259+07
b5863397-45e5-487b-aac5-381d8d21968c	/animals/category/0b537b2d-ee09-476f-907c-0c5d474e7b0d	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:04:17.319027+07
1805c313-a184-415c-82b3-50b1f9f1f12b	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:04:23.063477+07
508ed6f3-ff8c-4f69-a43e-5cc170df9f0e	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:04:38.089666+07
9b0a5bdf-601a-4e1f-bcf6-de4893165c94	/news/1	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:04:45.679302+07
4a897b60-726d-4a18-9bc0-db85c18b4143	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:04:54.758203+07
e021fa84-ba55-4b6c-9d43-f1ad05db6cab	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:05:03.056058+07
f9944139-bf74-49ca-bde5-9924fb9f51af	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:05:09.166221+07
0ae6008b-e120-429a-853b-b56fcac7619c	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:10:43.518714+07
6836fa72-6e47-4adb-b458-c616df2ad446	/animals/4	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:10:45.704186+07
1ceaa678-96ad-4c78-9e98-23a7669867aa	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:14:44.962862+07
df196e42-9a39-4d0f-92b9-8959c3caebd4	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:17:55.312449+07
42e097de-8b4a-46a5-b5df-e146f15858c2	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:17:57.90204+07
d9987c5a-c92f-43c7-b984-e736e9bd78bd	/map	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:18:01.843703+07
4ce5fb85-0540-4747-b136-7f4a62c936ba	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:18:09.791854+07
b8f23ae8-be84-4690-aee9-5509b8a76ed2	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:19:12.130897+07
6d57f4fa-7cb5-437c-b2f3-29ca509c1504	/animals/1	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:19:18.911588+07
16f0aa1e-bebc-46f1-a6f6-f16439d4af77	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:21:51.219934+07
5f434e7f-0d2d-4157-b0d0-0c408646dc18	/animals/4	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:21:57.624581+07
68db79c4-c365-48f0-8ee9-b1ab4d8b7708	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:22:01.63627+07
2f80723f-8f3e-4b3b-a9b5-73a044546579	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:22:32.685199+07
c47fabc2-69f1-4720-a187-2876aefb5ba1	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:31:15.544068+07
039e75ca-ce60-435c-bd33-97918d1fa1be	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785641210438-v4wnvcwd1xj	\N	\N	desktop	Firefox	\N	2026-08-02 11:35:14.850608+07
73c2554a-73d4-436a-ac5a-4428220a2919	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1	1785641210438-v4wnvcwd1xj	\N	\N	mobile	Safari	\N	2026-08-02 12:06:11.349788+07
154651d8-4844-4938-b38f-dff8d093e4a0	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 13:45:22.411876+07
2e4e768c-9cd3-4b26-9226-0350768ff3e0	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 13:45:38.260503+07
3c6d85c6-df44-42c5-b4f8-6b3e636c20da	/flora	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:01:53.422975+07
f67ebea0-1249-40fd-b703-8761fa4c7907	/fauna	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:29:54.518962+07
c75cbbfe-40b1-42d9-9baf-89adae27584b	/animals/4	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:35:08.642238+07
20ed8295-9d9b-4098-8eee-e9a21d0a112b	/fauna	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:35:15.921285+07
a43e0333-9196-461a-9e23-6818681393fb	/animals/4	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:35:19.793425+07
f311918a-904e-4c4f-8ebb-2930c54e08ef	/fauna	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:35:26.890423+07
500b94c5-574f-45c1-aa64-988248d7c154	/	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:37:08.291943+07
d765ade7-4dc1-4967-911b-30d031d29e97	/venues	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:37:11.874364+07
fc319e16-1814-4a7b-8480-c9cee860b9a6	/fauna	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:37:14.47283+07
5468da4f-d531-4533-9d5e-4dcc1f568773	/fauna	Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:39:12.23549+07
0d8916f9-f879-49ef-8659-fe2f7eef5d5c	/fauna	Taman Margasatwa Ragunan	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:43:37.227361+07
8b67bd1e-e480-4cb5-b861-2d21d2ad0454	/animals/1	Taman Margasatwa Ragunan	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:44:52.026725+07
3e9f1608-95da-496b-87cf-9699ff9b88fc	/fauna	Taman Margasatwa Ragunan	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:44:56.793085+07
087290a6-d285-4f65-a713-b514c6cc3062	/flora	Taman Margasatwa Ragunan	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:52:04.958173+07
f68940f2-488c-416e-98bc-aae652f0066a	/flora	Taman Margasatwa Ragunan	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:53:28.304943+07
7c5bf1b6-97b1-47e9-a735-42f69536ec8f	/fauna	Taman Margasatwa Ragunan	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 14:55:45.900994+07
e2e581d2-5872-49e3-b394-1b3d1a01b8d5	/map	Taman Margasatwa Ragunan	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:01:25.048276+07
5de37ce2-2915-4c92-a41b-1f792d6f4822	/audio-guide	Taman Margasatwa Ragunan	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:01:28.692311+07
d8e782d7-5ae9-4238-a147-633fe76f1c84	/gallery-3d	Taman Margasatwa Ragunan	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:03:32.992902+07
696e5630-837f-4099-8d73-f93f10d0e49d	/gallery-3d	Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:04:34.224396+07
96309716-eed0-4a5a-9fc3-62bd4551934c	/venues	Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:09:06.356112+07
29d9bca1-e7ce-44dd-9103-683a7d9bf5be	/venues	Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:16:29.567343+07
3312d533-2480-47fc-8956-e99010e4a53a	/venues	Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:19:23.2785+07
8878cf30-a371-422d-a56b-48df26ce9b1e	/venues	Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:28:03.228826+07
ad8cf6c7-1d46-4016-a315-0948b186175d	/venues	Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:30:00.151321+07
dfb7db29-8c8c-4ba2-af5f-3831214b82dc	/tour-guide	Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:30:13.924896+07
247f70cf-2b7c-4b33-b093-22268dce3719	/tour-guide	Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:32:47.380681+07
3c68121c-5ba1-4192-ac87-8bd37c4762d8	/services	Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:33:26.104754+07
805d996d-a0bd-4ce5-9755-9518824c288f	/services	Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:36:22.726255+07
a9f9d5d0-ffab-4d34-9a79-24f340e90f30	/standar-pelayanan	Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:36:41.812918+07
daec9c24-434b-4382-b510-2cd4f6a4287b	/standar-pelayanan	Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:37:52.610102+07
d1bff636-06a8-42d9-8bad-787ae51dd611	/news	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:37:59.589537+07
e6c7a974-2fc3-411f-97ce-5dce45297cf5	/news/1	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:38:03.139646+07
e01f9453-7bc0-46db-8722-e0ca800e4073	/news/1	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:40:39.911908+07
2cc95720-7dfd-4866-b22f-a1d68d723cab	/news	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:40:42.731566+07
7d825eae-4aac-4375-952e-92ebd6268f8c	/news	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/gallery-3d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 15:41:43.201939+07
9e42b5d9-3518-441b-bf06-ea8b3c5cf325	/news	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/news	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 19:07:37.398184+07
088455f9-5ab4-408e-b6a2-8d6d540e8442	/news	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/news	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 21:30:41.250658+07
f444022a-369b-49fb-a72e-0f9413295abc	/	Taman Margasatwa Ragunan	http://localhost:3000/news	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 21:30:48.532321+07
6f8fff81-aa91-425b-9270-3aa7b554c56e	/venues	Taman Margasatwa Ragunan	http://localhost:3000/news	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 21:34:41.047435+07
157ad030-18fc-42c8-9123-e25c06d12fd6	/tickets	Tiket & Harga | Taman Margasatwa Ragunan	http://localhost:3000/news	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 21:34:46.690327+07
d738c9df-2bbc-4d40-9db9-34485b080f7c	/news	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/news	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 21:34:52.774053+07
1075680d-aa59-48ca-8483-cad61b7cf7a0	/standar-pelayanan	Taman Margasatwa Ragunan	http://localhost:3000/news	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 22:35:50.55316+07
e3c85e64-04c7-44a8-98bb-8278ae6da72d	/news	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/news	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785825922013-jy4agmq3ef	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-04 22:35:52.892384+07
baf87a34-f346-42e9-b0ed-9d25577ab7b3	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 13:56:17.574261+07
398a1eec-0bcf-447f-bd3c-2d69940874db	/news	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 13:56:23.205962+07
a7bfe50e-012a-4214-a665-b62d5d6b6de5	/events	Jadwal Acara | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 13:56:30.28045+07
884ea626-11c5-4362-93a0-1fa6ae53c5f0	/news	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 13:56:34.174549+07
2fd49563-b0e8-43a0-9ecf-d8b9fd78d6d5	/venues	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 13:56:37.372211+07
ffc4f3c1-8169-49e6-9790-2ac27e94e5da	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 13:58:24.195654+07
622673a1-865f-4ce5-a1ac-975778b82a8b	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 13:59:24.047261+07
92c25a33-41fe-489f-bf71-aa26282e6624	/map	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 13:59:28.984647+07
e360c031-939e-4aee-9803-fbd0059b7b8a	/audio-guide	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 13:59:32.482141+07
047ee43a-0451-493a-b851-06ca93fc4185	/gallery-3d	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 13:59:36.375984+07
8b95fe1e-9a9a-45dd-a553-7f67d0f2eece	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 13:59:43.7392+07
12e92da4-92b3-4489-bb49-eac868dccd97	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 13:59:46.580279+07
e008c58f-30bf-4696-9904-da1398213b2b	/news/1	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 13:59:56.778377+07
c750c74a-8896-4750-880d-e0ee48da6170	/news	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 14:03:10.526431+07
b06b2e3b-6c47-42cd-88f9-04ac88f4c190	/news/1	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 14:03:14.902364+07
0b902db8-191c-4f58-9eef-4edc6eb9e5bd	/news	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 14:03:20.225338+07
dd4cd74a-ab31-4e4b-a16c-cbd177e03fe0	/news/1	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 14:03:35.697114+07
50a1be4a-cab8-42bd-9461-6aa08d8271e7	/news	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 14:03:42.282493+07
b7ed18a4-edae-4399-bd21-2371cafd6323	/news/1	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 14:03:50.06644+07
cafe3aa2-9b7f-4c89-8030-9cdc778add1d	/news	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 14:03:51.983005+07
65713733-6357-4e5c-a3ab-a26cea5ea6ea	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 14:03:53.508323+07
db2cd018-f622-43af-8aae-f78f4ca4ad05	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 14:07:05.357722+07
203580e4-b3d0-4141-9154-8929c30cdd3e	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 14:07:10.803322+07
586c760b-7c47-48e5-84c7-16b3b1370424	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 14:07:59.479123+07
0344a593-c730-4efd-a045-ff30495a62ca	/news/1	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 14:10:01.442518+07
8ff5e31a-8e66-4a4e-a3e9-072a4b638782	/news	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 14:15:43.213373+07
bc667847-2713-4e6d-8d58-93af59bf22dc	/news	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 14:25:53.786094+07
23562b1a-a4f4-4aaa-bfcc-a5f2b12d7334	/news	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 14:25:57.201453+07
1bb9c6e1-ef98-4de6-b105-a710c4cd8901	/news	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 14:26:06.140408+07
2b840e4c-e180-4d0c-bdc7-dadb53318641	/news	Berita & Artikel | Ragunan Zoo	\N	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 14:26:09.548373+07
2fc77e5f-3faf-4a7a-a349-eb7bebc1c86c	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 14:26:20.294484+07
c47afeff-441e-4467-af14-b376e22fe097	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 14:36:27.566657+07
bcba8db9-1551-47c3-b01c-358ba8edd03d	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 14:40:26.787869+07
9ed7af78-ed36-4fdd-87cf-b0ce73d807e1	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 14:54:41.622599+07
9342a704-ded3-4a2c-80de-239d7ac09cda	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 14:57:42.499171+07
8f8597e2-5ebe-4fae-a7d0-95c43686722c	/news/7	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 14:57:49.744014+07
79a5df71-d432-4799-97e4-85895cce33fb	/news/7	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 14:58:03.987673+07
adaa1f15-7a1c-414c-b19b-b7ebfb1cfb3d	/news/7	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 15:08:20.183725+07
c679505e-e91c-4bc4-82ed-66d73b977c36	/news/7	Berita & Artikel | Ragunan Zoo	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 15:09:04.974082+07
43bf42cc-84e6-4984-a8be-5a6718204ee8	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 15:09:07.137681+07
96bcbcb7-9a71-4b4d-9052-5fe91e197723	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 15:09:59.861679+07
2d625aed-0244-418a-9997-b7c2fa4b3499	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 15:10:32.471222+07
afbb6752-33c8-495a-b94c-b52f53347b81	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-05 15:12:18.444454+07
598a3cc6-74e1-4a2f-a86f-407ffabd5209	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1785920564908-yyhaoc5uru	\N	\N	desktop	Firefox	\N	2026-08-05 16:02:45.287598+07
0efc43e8-c79c-4777-a4fe-2ac3c0168cff	/	Ragunan Zoo	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 16:23:10.121532+07
481cb11f-1061-4c84-9551-d1d4116b0eb9	/news/8	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 16:23:17.515076+07
48bf70dc-5be1-41e3-9daa-37bb59545ef0	/news	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 16:23:38.330663+07
ff7998bf-f283-4d48-9560-ef737bcf53f0	/news	Berita & Artikel | Ragunan Zoo	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 16:26:21.42094+07
e8fe5252-7801-4844-8c47-6f01ae64eabd	/news/8	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 16:26:25.183266+07
c005b8d2-18eb-483c-895a-69085883a380	/news/8	Berita & Artikel | Ragunan Zoo	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 16:26:29.008425+07
30ad701a-4123-4a21-b552-013b87ce50a9	/news	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785912976990-1pfwyvmqbc1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-05 16:26:31.819929+07
baa8a08f-2709-42af-aa70-6ab5c4ed832b	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 06:46:50.131302+07
d4149b31-9a15-40e5-8f1d-f70d8608ea28	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 06:49:07.794409+07
67a47268-1e51-44f2-92f9-1150ef5dfa6a	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 07:16:51.161892+07
fde5a1f5-6fe2-4fed-9578-3127fcaad3db	/map	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 07:16:53.933304+07
7e81b666-b2b2-4afb-8250-a8631cf9c7ea	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 07:16:57.060104+07
e080fd16-737a-471b-a80b-cbca69a1534d	/animals/2	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 07:27:23.249845+07
ad1c2d74-76bc-45f6-b51b-15e516577633	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 07:29:57.966741+07
2aedef03-2765-4886-9f5e-308f58f0ffde	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 07:39:02.853378+07
7391de07-d0f1-44f9-b81b-8fc9db2095b2	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 07:43:42.36524+07
22fb8160-4260-4d9f-bead-15b8ca8b47a2	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 07:43:48.518702+07
5a39d860-fff1-422f-958f-fe9c436113bc	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-06 07:50:57.95935+07
7fb9bfe4-de66-4bac-abf1-aca55b35fde0	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-06 08:03:08.452291+07
4b7406bd-69f0-47d2-af7d-434e9c42f338	/animals/4	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 08:23:42.513514+07
ed60199d-d021-4238-9b62-fc770b624e2b	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 08:23:47.494494+07
7529cf8c-f596-4967-a4a2-347959d34cbf	/animals/7	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 08:23:51.337684+07
7154184e-af12-4bbe-ac5e-b4af1f82ebee	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 08:23:54.126805+07
af57ade2-608a-437c-a933-26e7c00b1aaf	/news/8	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 08:23:55.974021+07
16e547b8-4ace-42a1-b510-af954f303347	/news	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-06 08:24:02.894938+07
7829f9f4-c936-42f8-9a7e-dccff6d1f7d4	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-06 08:24:17.326475+07
b727ff39-07a3-48fa-9235-13d7c783f26e	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-06 08:26:07.140956+07
8e74cb5f-ee4f-4388-ba40-f8d059cb9d0b	/news	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 08:27:56.959252+07
4c7092b7-4e9a-48ce-9160-9d2c3213fef0	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 08:28:00.366636+07
8965333d-aa90-456d-acfb-393c80ee1a5b	/map	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 08:28:18.551456+07
aac63fda-be25-40fe-b9e2-b9f5330e63e4	/tickets	Tiket & Harga | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 08:28:39.770812+07
96028dd4-3d24-4ca2-9f09-19e1f9287f88	/tickets	Tiket & Harga | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 08:42:32.656766+07
cca8ff04-a3a1-4360-9254-8a3b29a83b74	/tickets	Tiket & Harga | Ragunan Zoo	http://localhost:3000/tickets	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1785973609849-frksuvhdead	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-06 08:49:26.708105+07
bda8c115-aa17-41e8-a992-c1e73ce25ebc	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786061766876-i968kmml7kq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-07 07:16:07.494997+07
097dbfc9-e5a7-4951-8d71-828cd8775c9f	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786061913496-i1nz5q3u4vn	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 07:18:33.638791+07
7f379bad-a246-4351-b3ad-451811d4eee3	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786061913496-i1nz5q3u4vn	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 07:24:42.684456+07
2598df05-dc44-4837-8383-b5bb4d5cf7f6	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786061913496-i1nz5q3u4vn	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 07:24:48.550801+07
953526c3-d043-411c-9168-097919023a46	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786061913496-i1nz5q3u4vn	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 07:24:51.891939+07
bc1b35d6-029c-407e-bb4e-636c7ab26bf0	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786061913496-i1nz5q3u4vn	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 07:29:59.549586+07
d0ce53a0-1380-4eff-a51e-e5bc2c91a0ff	/	Ragunan Zoo	http://localhost:3000/	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786061913496-i1nz5q3u4vn	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 07:32:51.357903+07
0370fa7f-c5e4-44e5-9dce-cf9a31cd258e	/	Ragunan Zoo	http://localhost:3000/	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786061913496-i1nz5q3u4vn	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 07:39:41.409646+07
3ab37979-ed07-4e72-88ad-2eee007cea81	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786061913496-i1nz5q3u4vn	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 07:42:34.196251+07
6aa2a4d3-7bc5-444e-ac38-183d5ec0b232	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786061913496-i1nz5q3u4vn	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 07:46:10.689412+07
0c4e3284-717c-4ae8-a2dd-d5e831af7b93	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786096377656-ep1s79ca1ov	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-07 16:52:58.049337+07
690b3933-e26e-45ae-89b5-58d1c225418d	/	Ragunan Zoo	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786096377656-ep1s79ca1ov	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-07 17:00:07.33078+07
7c23a2c8-416a-444f-853f-2f4deb23f724	/news/3	Berita & Artikel | Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786096377656-ep1s79ca1ov	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-07 17:47:35.3102+07
d4ae3107-d953-47a9-ab86-ad45f58b029e	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786096377656-ep1s79ca1ov	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-07 17:47:40.094113+07
de217abe-9aed-488a-900f-78729e49b2e6	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786096377656-ep1s79ca1ov	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-07 17:53:07.425064+07
ebad34f4-bb12-4b36-af65-936b86fa5e06	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786096377656-ep1s79ca1ov	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-07 17:53:28.824139+07
98622cea-adcf-46a5-a44c-47a70584bda2	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786096377656-ep1s79ca1ov	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-07 17:54:37.157744+07
a319d888-a5b6-451b-9320-434ecb6f3822	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786106672842-9qmsldd563c	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-07 19:44:33.457859+07
31fbf524-2c06-4a0a-8877-e16a7551eb22	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786106672842-9qmsldd563c	\N	\N	desktop	Chrome	\N	2026-08-07 19:48:28.474497+07
05abbf29-d27c-46a0-9976-2016806a5ca1	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786107075694-zomevlc7wbs	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 19:51:15.834351+07
484558ac-f4ac-4ec9-ad93-f1081c850180	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786107075694-zomevlc7wbs	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 19:52:34.778072+07
e0335932-d7e4-4d65-90e4-21960f3c11ed	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786107075694-zomevlc7wbs	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 19:54:01.27345+07
cd206202-8a2e-406f-b495-50c1d6d756f0	/tickets	Tiket & Harga | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1	1786107075694-zomevlc7wbs	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-08-07 20:30:36.33882+07
b60a82b5-2042-4430-ae47-d4efe476958a	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1	1786107075694-zomevlc7wbs	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-08-07 20:30:58.000144+07
c2b3c4fc-df74-419d-b13e-16d1770e56be	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786107075694-zomevlc7wbs	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 20:32:58.305738+07
3275307b-9b28-4af6-aa82-3901463edc9f	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0	1786107075694-zomevlc7wbs	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Firefox	\N	2026-08-07 20:35:59.989884+07
3040669c-075a-45b8-bf2a-370d1c328530	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 07:21:08.803696+07
0becbd2d-ee70-4a7a-98be-96c5bbcba101	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 07:27:02.764054+07
26b71aad-8998-4804-8244-480c4b79c8d5	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:07:43.916572+07
b1feabe7-1742-4153-9f22-dfbe91a0e203	/animals/6	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:07:50.544129+07
546e7403-2b57-48af-ad6a-4ea1875fb0d5	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:08:02.715496+07
c7566f77-1ba6-4863-9385-0b2b248eb19c	/news/7	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:08:04.440464+07
b07f1947-f144-416e-ace8-c9e9ef92279c	/news	Berita & Artikel | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:08:20.575018+07
890bbd43-152c-4562-92c0-61b890549bad	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:08:32.025863+07
96cc14c2-14ed-42c4-bb47-3d60abaeb5fa	/animals/7	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:08:34.344823+07
1cf6f6a4-d624-4c93-b2a7-f814409cfdd0	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:08:51.90458+07
5780054a-ad3a-42f8-a53c-478e0ed4add6	/animals/4	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:08:54.979535+07
ea751fdc-b7fc-4d38-a74b-b2049e3e0285	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:08:56.705962+07
9067439a-d8db-4a69-9659-c3287ad6c8c0	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:08:58.727053+07
3862edca-2fc1-473f-aac5-1b410f7f4d2d	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:09:06.569787+07
ca192a19-e2c0-4c4a-a412-f8cd9b171712	/animals/6	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:17:11.51687+07
bee0f563-1727-4d72-8b61-79852172eb09	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:17:14.792377+07
305dcc3c-4903-4cdd-9212-12fbfe13956a	/animals/6	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:17:40.111718+07
ed6033df-9673-4701-9632-6718b4b2a37c	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:17:44.021475+07
c2440859-b318-4db7-8bb1-5e13a0a5f8cd	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:19:30.377395+07
a1a0a451-b5a6-4f37-bb18-45898af00de9	/animals/7	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:20:26.316477+07
5dd2a296-01bb-4863-a486-8668dedea328	/animals/7	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 09:23:57.420475+07
f42a5242-26a5-4c62-a2c9-d5f9282bab28	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 09:24:24.348526+07
0f5a417f-debc-46eb-a2b8-44c922efb32c	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:32:37.628076+07
25b94913-ef3b-448b-b2c6-02ea42d5a95d	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:36:30.923095+07
b4c6cd88-e568-41d2-818f-31c037608ba4	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 09:36:33.707412+07
59468562-3232-49c6-ab35-40b8d24270ac	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:09:16.540422+07
116fe89b-4e25-473a-86be-6239421b58d3	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:12:46.340925+07
499dae70-9bd4-461b-b161-b04a74f3a58f	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:18:18.594661+07
12469f0a-fecd-45d4-befa-16bfe6ee8a64	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:21:09.013939+07
1e4e6c81-84dc-4d9d-a065-95ecb1712e71	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:33:30.183466+07
d5f90f97-4341-4ac5-921f-3f74b9d8db7d	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:33:37.964425+07
579b00b8-da2e-48d6-ba16-04911cb9caab	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:35:26.61704+07
6b51c468-cc3f-4662-a78d-d4d5963e339a	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:35:47.397714+07
4fa2cb48-2667-416c-a6fb-ab44fc9a52d1	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:36:30.220041+07
b7d3a7a2-1ff1-4ccd-848a-33f5b3823cb7	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:36:37.365493+07
ac9cfbc8-4e8d-40d9-82c9-5756e9cd0f6c	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:37:43.088237+07
cb4441ed-b488-407a-bc29-7b3380e8d992	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:40:13.471222+07
06b37439-e8ed-4639-9296-ac5fcc0fa24c	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:49:40.555818+07
d7818281-b114-473d-9559-a313e55b5378	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-08 10:49:47.146292+07
433c9e4a-162a-4de0-a920-23f7e23fe143	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 10:52:23.300707+07
12d007e4-f01a-4212-a0f0-796dc3b6cc0d	/animals/2	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 10:52:55.859663+07
04e7fcdf-911d-4468-a3d5-1a0add4527d5	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 10:53:04.75308+07
cd59bea1-ec41-4775-bc19-297f5d5f4a1b	/animals/7	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 10:53:05.770719+07
cd86c09d-d077-47dd-bcce-e5bc20049c63	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 10:53:07.657685+07
3449b98a-1a14-4da5-a9c0-cc86b25b4133	/flora	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 10:53:10.550194+07
214afd84-d54b-4cfc-af5b-a05d6a91d540	/fauna	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 10:53:11.994454+07
5e063160-174d-4524-bcb5-90cc69917973	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 10:53:19.390113+07
cfcbdec2-e660-45f6-bfa4-b01ff19f798c	/standar-pelayanan	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 11:05:35.698891+07
cd62e2b9-599e-4c38-8c8f-dc4f6290e5f5	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786148467992-dps6x7pzx4u	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-08 12:11:22.184037+07
804158d7-a2c2-4f5f-9b83-430b45085bd7	/	Taman Margasatwa Ragunan	http://localhost:3000/manager/service-standards	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786166225157-yj36cxovyxr	\N	\N	desktop	Chrome	\N	2026-08-08 12:17:05.426224+07
1d40fdc7-a845-4236-bc62-5ff8252f1e31	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786176664646-gxufytzy5	\N	\N	desktop	Chrome	\N	2026-08-08 15:11:04.755282+07
08bc5262-7e22-47a3-a85b-10b4048e431e	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786266310756-yx1il6dlks	\N	\N	desktop	Chrome	\N	2026-08-09 16:05:10.972305+07
e43988b8-132e-4dde-b13b-54fb2968d15f	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786267758426-pxzl2f0hp07	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-09 16:29:18.670672+07
7f4f4ced-2af2-4a52-9a55-14382f7b02cb	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786410148617-r6tucar3s6	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-11 08:02:29.402461+07
b23c1f40-70ce-47d9-a0db-549c83f34de7	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786421116343-adh7kip50x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-11 11:05:16.641132+07
530b81ce-9cb6-4f4a-ae36-8496da3ffd98	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786421116343-adh7kip50x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-11 11:34:27.53696+07
3a901251-3e22-415e-a13c-b9b1a22d3b64	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786421116343-adh7kip50x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-11 12:05:58.896277+07
e9d501ae-7914-467d-965c-bfaa770246f1	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786421116343-adh7kip50x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-11 13:36:28.898308+07
e04e5aa4-17e0-4637-9b81-c84dff10fee2	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786421116343-adh7kip50x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-11 13:37:04.12604+07
9098746f-50c8-43d5-87b1-74c71cdcf9d4	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786430954481-mvbj3vzkpif	\N	\N	desktop	Chrome	\N	2026-08-11 13:49:14.677449+07
7f887a34-8ea9-4187-b43a-3af907f23fa9	/	Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786430954481-mvbj3vzkpif	\N	\N	desktop	Chrome	\N	2026-08-11 13:49:17.411244+07
cb3b1d93-acf6-4272-81e7-112b17272878	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786529372786-029gc2skxg4p	\N	\N	desktop	Chrome	\N	2026-08-12 17:09:33.362046+07
8034d867-77cc-4b6b-8cee-af335712810b	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786529372786-029gc2skxg4p	\N	\N	desktop	Chrome	\N	2026-08-12 17:18:05.74548+07
ca3b4c5c-784f-426f-b55d-d4178cebed78	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786529372786-029gc2skxg4p	\N	\N	desktop	Chrome	\N	2026-08-12 17:32:23.187109+07
d9f86303-a382-45bc-b04e-3c0c98a1290f	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786530760141-b99zb1tdz9e	\N	\N	desktop	Chrome	\N	2026-08-12 17:32:40.332358+07
d524b8c8-a8fa-46f8-8fc4-f52ff645ce93	/	Ragunan Zoo	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786530760141-b99zb1tdz9e	\N	\N	desktop	Chrome	\N	2026-08-12 17:38:14.496086+07
3b2b03c9-327c-4805-9ae5-391d921f6f53	/	Taman Margasatwa Ragunan	http://localhost:3000/manager/venues	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786531651209-00zrkcgnack5e	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-12 17:47:31.468739+07
89989dfb-5cac-40b8-80b1-40549903cad6	/venues	Taman Margasatwa Ragunan	http://localhost:3000/manager/venues	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786531651209-00zrkcgnack5e	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-12 17:47:36.83067+07
3b8c4744-771c-402a-8d0c-63cd2bd4961b	/venues	Taman Margasatwa Ragunan	http://localhost:3000/manager/venues	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786531651209-00zrkcgnack5e	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-12 17:48:59.792864+07
7938ffc1-03dd-4aae-b3a9-356a8b82e2b5	/	Taman Margasatwa Ragunan	http://localhost:3000/manager/venues	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786531651209-00zrkcgnack5e	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-12 17:51:28.705199+07
8da73f37-7fb3-483d-ad72-31513663de13	/	Taman Margasatwa Ragunan	http://localhost:3000/manager/venues	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786531651209-00zrkcgnack5e	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-12 17:51:50.396107+07
13d6de7f-0807-4231-aee1-fa5f6383cae5	/	Ragunan Zoo	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786599234438-r1xcfpm98zg	\N	\N	desktop	Chrome	\N	2026-08-13 12:33:55.597346+07
41c1747c-932f-4827-962f-47764f5526eb	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786599234438-r1xcfpm98zg	\N	\N	desktop	Chrome	\N	2026-08-13 12:34:05.246796+07
7ec8c17c-3a4b-4858-b5a0-950ee83ec879	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786599234438-r1xcfpm98zg	\N	\N	desktop	Chrome	\N	2026-08-13 12:34:08.511461+07
2f0c61d9-e61a-428d-9eaa-4a0d21d95a80	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786599234438-r1xcfpm98zg	\N	\N	desktop	Chrome	\N	2026-08-13 13:14:21.124831+07
1670afc7-3b56-447b-b6b3-2a6985960327	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786601668361-0k2msczpaneb	\N	\N	desktop	Chrome	\N	2026-08-13 13:14:28.7162+07
42c82069-4b20-47d1-b99b-a0a697eb058e	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786601668361-0k2msczpaneb	\N	\N	desktop	Chrome	\N	2026-08-13 13:14:33.125591+07
dedee96e-4dce-4e85-b077-b5092f63ae69	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786601668361-0k2msczpaneb	\N	\N	desktop	Chrome	\N	2026-08-13 13:14:36.405959+07
6093f485-439e-4f1d-9323-2a84c73df132	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786601668361-0k2msczpaneb	\N	\N	desktop	Chrome	\N	2026-08-13 13:14:39.602026+07
1ef9e31f-19fa-4240-88e3-0b366134fd71	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786602442799-pdk65wcb7ma	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 13:27:23.000576+07
b3e559da-fb1c-470b-8915-72faf56617cc	/fauna	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786602442799-pdk65wcb7ma	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 13:27:26.173193+07
6849fd23-9fd3-4479-bbad-dc4bc7114192	/flora	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786602442799-pdk65wcb7ma	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 13:27:28.42177+07
ab4186dd-c2ea-4395-80c5-f3e11982bad9	/map	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786602442799-pdk65wcb7ma	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 13:27:30.76173+07
2ecb4cdb-6169-47fe-8647-48135cc17bbc	/audio-guide	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786602442799-pdk65wcb7ma	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 13:27:33.49933+07
a2b22120-803f-4330-9920-70f7822c749a	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786602442799-pdk65wcb7ma	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 13:27:35.435953+07
f01cb4c0-941d-4806-aefd-f4bd1bb1abc7	/	Ragunan Zoo	http://localhost:3000/	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786602442799-pdk65wcb7ma	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 13:35:45.339693+07
9046a510-daab-421d-944f-976777214f82	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager/history	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786601668361-0k2msczpaneb	\N	\N	desktop	Chrome	\N	2026-08-13 13:41:05.310271+07
c1908e1c-b0aa-456f-b3f6-d6c920d5ae71	/fauna	Koleksi Satwa (Fauna) - Taman Margasatwa Ragunan	http://localhost:3000/manager/history	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786601668361-0k2msczpaneb	\N	\N	desktop	Chrome	\N	2026-08-13 13:41:08.250593+07
71dbf0fa-cfe4-4a5c-b4d3-ed61861a9901	/flora	Koleksi Flora & Tumbuhan - Taman Margasatwa Ragunan	http://localhost:3000/manager/history	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786601668361-0k2msczpaneb	\N	\N	desktop	Chrome	\N	2026-08-13 13:41:10.184003+07
1c403d0a-7aaa-4f41-8210-3d9492978869	/map	Peta Interaktif Pintu & Zona - Taman Margasatwa Ragunan	http://localhost:3000/manager/history	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786601668361-0k2msczpaneb	\N	\N	desktop	Chrome	\N	2026-08-13 13:41:12.218553+07
2f8e017b-3150-4279-b0aa-772df8e2c8da	/audio-guide	Panduan Audio Wisata - Taman Margasatwa Ragunan	http://localhost:3000/manager/history	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786601668361-0k2msczpaneb	\N	\N	desktop	Chrome	\N	2026-08-13 13:41:14.009434+07
694b8ca9-523d-4917-85d3-c6532b822497	/gallery-3d	Galeri Virtual 3D - Taman Margasatwa Ragunan	http://localhost:3000/manager/history	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786601668361-0k2msczpaneb	\N	\N	desktop	Chrome	\N	2026-08-13 13:41:16.047413+07
eb00bd5a-c997-4afb-b813-b5769ce7e08d	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager/history	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786601668361-0k2msczpaneb	\N	\N	desktop	Chrome	\N	2026-08-13 13:41:20.067276+07
4e84f022-e0df-4aa1-9a47-c6640706a03e	/	Taman Margasatwa Ragunan	http://localhost:3000/manager/history	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786601668361-0k2msczpaneb	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 13:43:54.30662+07
1541886f-cdae-49ba-95f5-06e354ccc3e9	/report-facility	Lapor Kendala Fasilitas - Taman Margasatwa Ragunan	http://localhost:3000/manager/history	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786601668361-0k2msczpaneb	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 13:50:31.18801+07
8b360f4b-1d67-42e6-b529-6a57f1f7d479	/report-facility	Taman Margasatwa Ragunan	http://localhost:3000/manager/history	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786604291893-zsg1nd3w5m	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 13:58:11.911909+07
d9a420bd-b860-4533-bae1-01faf88d07cd	/	Ragunan Zoo - Animal Info, Tickets & Interactive Map	http://localhost:3000/manager/history	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786604291893-zsg1nd3w5m	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 14:08:07.491092+07
bb0cf52e-6935-439f-9f50-6149bc5a7228	/fauna	Fauna Collection - Ragunan Zoo	http://localhost:3000/manager/history	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786604291893-zsg1nd3w5m	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 14:08:11.539102+07
21f25386-53b1-4277-b437-9737572e0b79	/fauna	Fauna Collection - Ragunan Zoo	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786604291893-zsg1nd3w5m	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 14:15:16.695985+07
04d057fa-d431-4a0c-bb03-83daca8a95cd	/fauna	Fauna Collection - Ragunan Zoo	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786604291893-zsg1nd3w5m	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 14:16:48.246768+07
a21f08b1-5d16-42ce-a233-afd411947629	/fauna	Fauna Collection - Ragunan Zoo	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786604291893-zsg1nd3w5m	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 14:19:04.997522+07
052ac1ce-aadb-4875-861b-be3ae27d8b9c	/fauna	Fauna Collection - Ragunan Zoo	http://localhost:3000/fauna	Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	1786604291893-zsg1nd3w5m	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Chrome	\N	2026-08-13 14:29:35.248646+07
c93be918-3b49-4664-a10e-deae7f621826	/	Ragunan Zoo - Animal Info, Tickets & Interactive Map	http://localhost:3000/fauna	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786604291893-zsg1nd3w5m	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-13 15:18:02.761879+07
0a85b2d1-1878-4bd6-8fb4-e2e26b9fe232	/	Ragunan Zoo - Animal Info, Tickets & Interactive Map	http://localhost:3000/fauna	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	1786604291893-zsg1nd3w5m	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-08-13 15:18:44.802693+07
3b30cda2-dd1d-4473-ae43-45b798915925	/tickets	Buy Tickets Online - Ragunan Zoo	http://localhost:3000/fauna	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	1786604291893-zsg1nd3w5m	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-08-13 17:02:01.598298+07
86202370-fc0a-440e-ae36-4796e3fd9896	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1786761469712-y9y1vqt75ff	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-15 09:37:50.310696+07
13f5ce73-4c8c-4e3d-8844-caf0c6be785c	/	Taman Margasatwa Ragunan	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	1787053645632-b6ev9vbpho	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-08-18 18:47:26.53729+07
ea95f018-5528-4f50-a789-6c0a80b48736	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790252244880-xnhw3jmd09g	\N	\N	desktop	Chrome	\N	2026-09-24 19:17:26.128014+07
53d0d561-2c65-47fb-be7e-dbc53490d7a9	/map	Peta Interaktif Pintu & Zona - Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790252244880-xnhw3jmd09g	\N	\N	desktop	Chrome	\N	2026-09-24 19:17:54.624137+07
adf62691-1a7b-4f46-bea0-e15827e5e1bf	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 08:35:02.185416+07
39ff6d6a-dcea-41f2-bc55-6f6d4e376a59	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 09:00:54.775885+07
9af9c255-f77e-4d2f-9f1a-e8e46f861705	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 09:01:07.406783+07
51e74d01-a52e-4dfc-9cde-bc86aaa5b0a7	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/tickets	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 11:39:34.329267+07
f95fa3a8-aaaf-4b0f-b4b0-cc64f0614469	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 15:19:34.324344+07
00fdb457-9ae5-4bda-b979-69eb984fdefb	/map	Peta Interaktif & Zona Kebun Binatang | Taman Margasatwa Ragunan	http://localhost:3000/map	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	1790932798490-rgxijvqfj2	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-02 17:32:18.851596+07
4a72a30e-8dd1-4054-8689-4378b0eca06d	/map	Peta Interaktif & Zona Kebun Binatang | Taman Margasatwa Ragunan	http://localhost:3000/map	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	1790932798490-rgxijvqfj2	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-02 17:33:14.931646+07
3e96ec38-089c-4b15-8df2-63a44bdae438	/map	Peta Interaktif & Zona Kebun Binatang | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790252244880-xnhw3jmd09g	\N	\N	desktop	Chrome	\N	2026-09-24 19:19:52.016797+07
15afd1b5-6599-4a6c-8198-7e707116af96	/tickets	Beli Tiket Online - Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 08:38:11.662085+07
96e4a8e4-ed79-46f5-9987-470275622faf	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 08:38:14.060547+07
9c011d8b-c829-476b-9be2-ca90727fd77a	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 09:02:36.132521+07
21f612aa-bb5d-44bf-9c2c-c49135be136f	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/tickets	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 12:32:07.835699+07
a4b0db1c-091b-4bef-a0e5-159d6f775650	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/tickets	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 12:32:09.498892+07
3932efef-f995-46a9-86bd-caaeba7a2fb7	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	http://localhost:3000/manager/explorer-navbar	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 15:19:52.957501+07
9fe3aca6-a9c4-47d1-be87-11f13ba3e321	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	1790927286123-fgb4yu1yp8w	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-02 14:55:14.41777+07
f7aadcc0-b657-47ca-be00-b7dcfb8fa82c	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/map	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	1790932798490-rgxijvqfj2	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-02 17:48:10.412779+07
fc81daa1-970e-4b1c-8e76-1245760bafbb	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790252244880-xnhw3jmd09g	\N	\N	desktop	Chrome	\N	2026-09-24 19:19:59.161417+07
11797511-03bd-4187-82d0-72dc2c2bb577	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 08:41:53.84071+07
655b7b08-5b11-4abb-ac5f-f3c42d215412	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/tickets?_mvua=mv-ios-v1	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 09:02:37.027415+07
a9c1c191-3839-461f-92b6-e69f2fe0fca6	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/tickets	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 13:17:05.722211+07
3a9f1790-3787-43b2-9a88-fe24c1406468	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/tickets	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 13:17:07.401896+07
8bfa8bed-6fc0-471f-b173-e4379d1a764c	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790326480043-7i0g1z5koko	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 15:54:40.636141+07
9ff70419-bb7a-4302-896a-969aaa581bb9	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	1790927286123-fgb4yu1yp8w	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-02 14:58:31.193877+07
137d2587-a2e6-4a7f-aa4b-805cb031ceee	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	http://localhost:3000/manager	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790254403267-zbhqcn5d4q	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-24 19:53:24.484669+07
a9686d7c-b384-4ca6-b958-432ea9ab28ca	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 08:42:33.589723+07
a25baee7-6860-443e-bb4c-90abea51124b	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 09:05:24.176731+07
babd922f-6630-4e5f-8d35-0c771b6c3d96	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	http://localhost:3000/manager/explorer-navbar	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 13:22:10.236195+07
449f5a1b-a801-4598-bab4-8e6390ddf8bc	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790335147526-ex4gpk3qb4q	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 18:19:09.117711+07
9c752832-9b82-40e1-9f96-8ce1b2865849	/map	Peta Interaktif Pintu & Zona - Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790335147526-ex4gpk3qb4q	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 18:19:17.086933+07
67fd0cdf-a78f-4ba6-800a-be60ac0a9fbb	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	1790927286123-fgb4yu1yp8w	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-02 15:37:31.893579+07
5239133b-b5b4-4173-956f-20f39eccebe2	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790254403267-zbhqcn5d4q	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-24 19:56:55.30662+07
cc2cd31f-c12a-4d74-a58e-61f582c84394	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790254403267-zbhqcn5d4q	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-24 19:57:26.623937+07
675eb17a-ad74-414c-aabd-25ba73aafde9	/tickets	Beli Tiket Online - Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 08:43:22.673986+07
870a8926-6bc1-4634-bbd7-ca741688f569	/tickets	Beli Tiket Online - Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 08:43:23.102871+07
28dbfdec-0be0-4cb6-bf2b-559f0948ad70	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 11:26:48.869041+07
2009d43b-4c9c-400f-be97-4c3b47d81e22	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 11:26:56.117813+07
7e44e842-e407-48db-93c1-77d18a4de081	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager/animals?_mvua=mv-ios-v1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790317339468-mk635qe6h4k	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 13:22:28.87839+07
4d389219-899b-4995-bc3c-6f8a0fb8984d	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 13:22:39.457767+07
a2ad0ccb-5e7d-4d3f-bf4a-70aabb1106fb	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	1790932099210-i0kl445r37	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-02 16:08:22.436321+07
86dc0fe8-792e-4eaf-8d45-e30fe31b71e5	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790297276472-39q1cuwjd46	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 07:47:57.464818+07
4dc4eac0-cf3f-4f8e-81cb-afd639e25afa	/tickets	Beli Tiket Online - Taman Margasatwa Ragunan	http://localhost:3000/tickets?_mvua=mv-ios-v1	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 08:45:32.453019+07
cb65b372-c1bc-4420-9431-3cfcc8c5bac4	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 11:26:52.335809+07
b805362e-ef94-4b6b-bdd0-ad4622294a43	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager/explorer-navbar	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 13:24:03.222476+07
11ed203b-3ce7-413c-9bf2-4eb1a355bdea	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 13:24:07.884266+07
a99092ca-a3ab-4434-991d-f3e0d75d5397	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	1790932099210-i0kl445r37	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-02 16:17:35.884831+07
cca4b899-617f-4ee7-a055-29af0f631814	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager/system-configs	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 08:19:38.669781+07
9c2d6bb9-3158-443c-972c-b3fe831b9522	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 08:54:57.501103+07
e978d11d-bdf7-4e7a-b069-aec4056ddacb	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 11:26:56.102196+07
25a0a938-f265-46e9-8394-c001c9212372	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	http://localhost:3000/manager/explorer-navbar	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 13:30:31.313689+07
b225fbc7-9673-40ec-9ef0-08b3a1dba0f8	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 13:30:36.3902+07
f8cb5b66-d0d3-40f3-9763-2507568d85c5	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	1790932798490-rgxijvqfj2	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-02 16:20:00.702405+07
bb1b83bd-c7c3-406a-a60d-d2857f79f147	/fauna	Koleksi Satwa (Fauna) - Taman Margasatwa Ragunan	http://localhost:3000/manager/system-configs	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 08:22:16.482675+07
76b4a2bb-610a-4d37-9384-82a83ea7a7a9	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager/system-configs	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 08:22:27.891882+07
0ee4b098-26fe-4a3a-a0ff-7c1b1799334c	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager/system-configs	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 08:22:33.079922+07
0c1c298b-4e91-4371-86e7-63b792264d5d	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/tickets	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 08:54:59.309232+07
f34e9050-57d5-40ef-8232-c35425c5227c	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/tickets	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 11:36:12.941118+07
6b0c942e-7056-4507-ab88-c3e705f87014	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager/explorer-navbar	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 13:35:07.500724+07
21f8ca42-2d02-405f-a18f-ee4417818697	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 13:35:11.088153+07
f8e326b7-ca35-420b-b034-8e2e2625030a	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	1790932798490-rgxijvqfj2	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-02 16:20:38.71872+07
1d5d81fe-f442-4668-8566-c07ded7bbe6a	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager/system-configs	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 08:25:27.190486+07
97e77610-1020-436b-9870-ab4689660c1d	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 08:59:14.52686+07
5c95d504-3b42-4cd3-80ea-3456ac7ffaa2	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/tickets	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 08:59:15.508494+07
578b47f6-b4ac-404e-9809-f324494e9850	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/tickets	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 11:36:14.939725+07
f4b2cd55-63bc-4026-bd0e-fb2f379f1ce5	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager/explorer-navbar	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 13:35:57.647444+07
abdae0e3-476d-4316-a0f0-0a7ae7d60888	/	Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 13:36:01.306893+07
0c26e792-672f-4402-ac25-34f94986cb99	/map	Peta Interaktif & Zona Kebun Binatang | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	1790932798490-rgxijvqfj2	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-02 16:20:43.545298+07
fdc0aa21-3d8d-4a21-8f08-72105a520dff	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager/system-configs	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 08:30:46.380845+07
60672926-be27-4b99-ab20-6c0b2fd700c6	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 09:00:52.167607+07
a794348a-6094-4a50-8875-c0746abea198	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 09:01:07.403543+07
aa2bdee9-e688-4d90-b6fd-6446984f4a41	/tickets	Tarif Masuk & Simulasi Tiket - Taman Margasatwa Ragunan	http://localhost:3000/tickets	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790299177883-5nnnmr9n5x	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 11:39:32.469208+07
ee5ed015-f59b-4908-a5e6-9257bc8854e4	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager/explorer-navbar	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-09-25 13:36:29.231064+07
a48d61fb-9fd9-49ff-a229-d6523433a35b	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/	Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1	1790317328604-huyr6x4hq9l	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	mobile	Safari	\N	2026-09-25 13:36:32.461626+07
a4098413-3c72-4e5f-8495-793d6f7004b3	/map	Peta Interaktif & Zona Kebun Binatang | Taman Margasatwa Ragunan	http://localhost:3000/map	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	1790932798490-rgxijvqfj2	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-02 17:16:14.865428+07
\.


--
-- Data for Name: plants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plants (id, name, latin_name, species, zone, category, category_en, category_id, location, habitat, description, status, health_status, image_url, is_featured, latitude, longitude, created_at, is_published, name_en, description_en, habitat_en) FROM stdin;
2	Rafflesia Arnoldi	Rafflesia arnoldii	Parasit Obligat	Zona Flora Langka	Bunga Langka	Rare Flowers	\N	\N	Hutan hujan tropis	Rafflesia Arnoldi adalah bunga terbesar di dunia dengan diameter hingga 1 meter. Bunga ini tidak memiliki daun, batang, dan akar, melainkan hidup sebagai parasit pada tanaman inang.	Langka	Sehat	https://images.unsplash.com/photo-1597762117709-859f744b84c3?w=800&auto=format&fit=crop&q=80	t	\N	\N	2026-08-05 15:07:58.14351+07	t	Rafflesia	Rafflesia Arnoldii is the world's largest individual flower, up to 1 meter in diameter. It has no leaves, stems, or roots and lives as a parasite on host plants.	Tropical rainforest
3	Pohon Ulin	Eusideroxylon zwageri	Pohon Kayu Keras	Zona Pohon Besar	Pohon Hutan	Forest Trees	\N	\N	Hutan hujan Kalimantan	Ulin atau Kayu Besi adalah pohon endemik Kalimantan yang dikenal sebagai "kayu terkuat" di Indonesia. Pohon ini dapat hidup hingga ribuan tahun.	Rentan	Sehat	https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80	t	\N	\N	2026-08-05 15:07:58.14351+07	t	Borneo Ironwood	Ulin or Ironwood is an endemic tree of Borneo known as Indonesia's "strongest wood". This tree can live for thousands of years.	Borneo rainforest
4	Anggrek Bulan	Phalaenopsis amabilis	Anggrek	Zona Anggrek	Anggrek	Orchids	\N	\N	Hutan hujan tropis	Anggrek Bulan adalah bunga nasional Indonesia yang dikenal sebagai "Puspa Pesona". Bunganya yang cantik berwarna putih dengan diameter 8-10 cm.	Dilindungi	Sehat	https://images.unsplash.com/photo-1524598171347-26d0f038daa6?w=800&auto=format&fit=crop&q=80	t	\N	\N	2026-08-05 15:07:58.14351+07	t	Moon Orchid	The Moon Orchid is Indonesia's national flower, known as "Puspa Pesona". Its beautiful white flowers have a diameter of 8-10 cm.	Tropical rainforest
5	Kantong Semar	Nepenthes rafflesiana	Tanaman Karnivora	Zona Flora Unik	Tanaman Karnivora	Carnivorous Plants	\N	\N	Hutan rawa gambut	Kantong Semar adalah tanaman karnivora unik Indonesia yang menangkap serangga menggunakan kantong yang berisi cairan pencerna.	Rentan	Sehat	https://images.unsplash.com/photo-1589873963847-ab3c6a33e8bc?w=800&auto=format&fit=crop&q=80	t	\N	\N	2026-08-05 15:07:58.14351+07	t	Pitcher Plant	The Pitcher Plant is a unique Indonesian carnivorous plant that catches insects using pitchers filled with digestive fluid.	Peat swamp forest
6	Bambu Petung	Dendrocalamus asper	Bambu	Zona Bambu	Bambu	Bamboo	\N	\N	Hutan bambu	Bambu Petung adalah salah satu jenis bambu terbesar di dunia dengan diameter batang hingga 20 cm dan tinggi lebih dari 20 meter.	Aman	Sehat	https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80	f	\N	\N	2026-08-05 15:07:58.14351+07	t	Giant Bamboo	Petung Bamboo is one of the world's largest bamboo species with stem diameters up to 20 cm and heights of more than 20 meters.	Bamboo forest
7	Pohon Beringin	Ficus benjamina	Pohon Ara	Zona Pohon Besar	Pohon Hutan	Forest Trees	\N	\N	Berbagai habitat	Pohon Beringin adalah pohon sakral dalam budaya Indonesia yang memiliki akar gantung yang khas. Pohon ini sering ditemukan di alun-alun kota dan area publik.	Aman	Sehat	https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80	f	\N	\N	2026-08-05 15:07:58.14351+07	t	Banyan Tree	The Banyan Tree is a sacred tree in Indonesian culture with distinctive aerial roots. It is often found in city squares and public areas.	Various habitats
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, name, username, child_mode, created_at, updated_at, last_activity) FROM stdin;
ca06f5e1-881f-4179-b600-4a48ff473786	Admin KP3	admin_kp3	f	2026-08-05 16:06:15.797871+07	2026-08-05 16:06:15.797871+07	\N
a7db1c17-a0a8-4fdf-afe6-85c6042eb561	Admin Rival	admin_rival	f	2026-08-01 09:20:43.916683+07	2026-08-01 09:20:43.916683+07	2026-09-24 19:51:46.334853+07
\.


--
-- Data for Name: service_availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_availability (id, date, program_type, max_slots, booked_slots, is_available, notes, created_at, updated_at) FROM stdin;
6b64e8e5-ebfd-4914-8425-a79702f0d1ad	2026-06-30	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
28760ebe-a7d0-4875-b948-95bf8ef1fbec	2026-06-30	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
b6c88791-d389-47af-ad2c-ea962f37da4d	2026-06-30	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
6de22f0e-4e8b-4108-a429-e2614fddaeef	2026-06-30	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c2f20d0a-9dad-4bbb-93e8-db69be66ef57	2026-07-01	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
6978bb8d-fc90-4f5b-9d7f-85ce39d5c326	2026-07-01	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
cc82e8fb-7879-451e-aeb4-89a8b8096b6a	2026-07-01	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
a40b4ed0-2b74-4f9c-9583-39c0ee68266d	2026-07-01	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
30a1be7d-e257-478d-a3ec-f067ccd6b3ed	2026-07-02	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
5a32eb13-331b-41f4-af80-60b191e2f77f	2026-07-02	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ae58abe9-ff92-4693-9951-e0878ca6c908	2026-07-02	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
b17a659e-85c1-4f6a-b8c1-bc33b414a7ad	2026-07-02	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ea2e3d5a-331d-4d9d-9cab-e412a55c0deb	2026-07-03	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0fd17963-2813-4ce2-96e3-f7a08e0fbe4b	2026-07-03	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
617414b3-f537-4b7e-8362-9ed2b7e62411	2026-07-03	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
78cc3abd-b883-48fb-ac06-aa8c77eb5504	2026-07-03	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
947ba954-ec80-4eb6-97e2-88771f8e413d	2026-07-04	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
02311fe3-551b-4379-aead-7531f1292026	2026-07-04	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
7b26161c-48a8-452f-9c23-c6ce81acf2f5	2026-07-04	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
30eccc2a-1f72-4675-b696-da24cae49bcd	2026-07-04	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c4738640-33b8-47a9-b870-d1097f3778da	2026-07-05	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
47e7813e-398a-48b0-89f1-1a26d88c01c6	2026-07-05	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
fc1433de-c5d9-48c2-9e1a-fe7c5cd29a45	2026-07-05	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
b4704003-15ca-493d-abac-7457f16243ea	2026-07-05	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
fed13d6a-847f-40a7-974b-191f75e4e24d	2026-07-06	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
94607770-c609-4332-b0ad-87e771adc6a6	2026-07-06	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f4dc4e20-07b6-4e8f-99a7-4e26d4b613a0	2026-07-06	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
7e0487af-4d06-4323-8015-39322c1399cd	2026-07-06	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
309b550a-011f-4a88-a7dc-59f0a0fa9d09	2026-07-07	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
04dee69f-7b84-4134-8e45-9404273883ce	2026-07-07	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
418dcadb-f126-4d9c-97cf-66125c482228	2026-07-07	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
6401ca2b-fb98-4f49-a54d-b83159b4546a	2026-07-07	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
89340120-634d-4e0b-b715-9c07673b551d	2026-07-08	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c04612d6-e63b-40ed-acf8-a5d7e684280d	2026-07-08	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
86b87a19-f331-40f0-a3ed-197b3efc5e0c	2026-07-08	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
9846c855-e27c-4205-b919-0a354983c5fa	2026-07-08	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
8b6fdaea-bc63-42ce-a159-df89f0d7ad40	2026-07-09	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
6f321c1a-19fe-4662-89e7-78b815b4f22e	2026-07-09	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
6f902b2a-c45a-4184-9dfe-2314de467297	2026-07-09	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
bded1ab3-3d8a-40b7-9f1d-e1ce40a3cccf	2026-07-09	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d728352e-3914-4599-80e4-b7007e0b7a5d	2026-07-10	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
320776d4-1cc1-4ab7-8701-97a547e57ac6	2026-07-10	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
57ff5801-d5cf-4354-9e7c-d17d3319aa08	2026-07-10	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
5f6960f7-9db8-49f6-b8d6-bf3c81a379b6	2026-07-10	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
15e2da24-c651-477e-b286-2e94eb5da406	2026-07-11	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
38800226-d54f-4e54-aabe-56bd304ebf72	2026-07-11	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c4a8de13-acb7-4bd4-ae81-bd1fecb7879b	2026-07-11	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
688a9cf4-dbbd-4950-b7d2-a052fc42ec10	2026-07-11	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0841d3ec-491c-4ab6-9acf-5043a11b9124	2026-07-12	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
093f2eae-7063-4c9f-9567-88952d8d4fe4	2026-07-12	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
eabd3c14-d755-47a1-b0ff-8819affff0ae	2026-07-12	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
63104e11-799b-4334-9022-272f944732d2	2026-07-12	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
9fa19a56-811e-4a79-acca-f27da7daa5d7	2026-07-13	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
e601c6e9-4efe-42f7-aa23-35edd22e8672	2026-07-13	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
087087dc-ea63-466f-85ae-48a0b70886e3	2026-07-13	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
cb262870-a1b6-4be3-b9fb-e697cbdb0f6c	2026-07-13	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
4ca99b64-7bcf-4728-b911-8c5171ef0166	2026-07-14	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
04f7a145-586c-4433-96fe-6eb91d11c009	2026-07-14	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ab6a8a3a-2222-4a1b-9eeb-6de19dbf7b22	2026-07-14	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
3b75d1ec-ec13-41af-8f03-20dcde16c514	2026-07-14	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c337e5b4-3c81-499b-88b9-ba2ffb624a56	2026-07-15	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
5d978fb8-e1b8-40c3-a422-d91b4fc8284e	2026-07-15	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
a5d77126-53cf-438f-a803-a888f3485023	2026-07-15	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
db3fb30d-d354-405a-875f-7cc5c452ff7f	2026-07-15	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f4990718-d017-4db5-a62a-31d0c9c33d91	2026-07-16	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
e89b3f94-eaf7-4562-84f0-8e9d7e3f0bc5	2026-07-16	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
5ff0f9df-1078-4443-b0ce-1d25ebdf4faa	2026-07-16	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d52cc243-d4e3-475f-8fae-5d8ec9582e43	2026-07-16	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
bfb00661-1620-4891-8f30-ecc16f03fdfe	2026-07-17	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
e73a7c61-791e-4128-acec-bf22ef68be06	2026-07-17	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
39b12a98-178b-448c-aeb4-b4218d3aee48	2026-07-17	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
af35a355-7a45-463b-9422-77052b4597a0	2026-07-17	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
89b738cb-2032-4c33-971f-aafe29f0ec1d	2026-07-18	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0f8ed7af-37c3-42e3-9224-28a92614083a	2026-07-18	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
401231cb-dc7c-4f22-8032-fd96479f5370	2026-07-18	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
1ec28a73-9853-4867-bd7a-77b3833ea367	2026-07-18	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
a1295220-bd68-453a-8de8-e634bde484e8	2026-07-19	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
7c548ac8-9bca-45a1-a2c8-de7d8cd00e8a	2026-07-19	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ade20bd5-feef-413e-a2c9-b7c39046424d	2026-07-19	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
525ad2a0-341c-4408-8f76-f25534111f7f	2026-07-19	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
bc31a581-9ca2-4a3b-9a93-91fa222ba7f2	2026-07-20	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
3e15a74f-acfc-4498-b709-a455079e791d	2026-07-20	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
e3f5f98a-7726-43dc-97e9-760cdc0f6b7b	2026-07-20	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
716e3558-151d-4fd2-89a1-de7ee272fb5c	2026-07-20	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
cebdb1b8-7a05-4913-8259-562f182981fa	2026-07-21	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
87a6a4d4-1cf5-4074-bcdd-9dcb07587b8a	2026-07-21	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
159405c7-df10-4790-886d-c438f31d740e	2026-07-21	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d155e1f3-23d2-41d1-ae10-a55d9fdf78bc	2026-07-21	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
cb332e7a-f2ca-4e17-ab8f-59f53338465e	2026-07-22	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
199285af-fd26-4e4c-9a64-b35e9d204266	2026-07-22	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
8b61e9cd-c03f-4c60-bb80-42352d9e030d	2026-07-22	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
e093d3c5-0c84-4e4f-8e25-06abd0b6a2ae	2026-07-22	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
56d2ea60-70c1-44b2-9a55-08a43561d74a	2026-07-23	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
4b9e85dd-cbba-4678-a7ac-80735f773f9b	2026-07-23	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ded9f438-1366-4051-8eda-1c3a947a1688	2026-07-23	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
81174238-4fc3-414a-8e69-e7049d5caab0	2026-07-23	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
54713fd7-835d-423e-9703-0de7d2bf0025	2026-07-24	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
95e8d1d3-1845-4794-a586-6a8383a5d655	2026-07-24	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
96badeb0-b72c-45ef-8310-ec3b84d13265	2026-07-24	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f4104fcc-e057-4d24-a1ab-719e525a055e	2026-07-24	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
cf880a83-f498-417d-9457-57c3cb21b307	2026-07-25	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
2e90060a-3c14-4a9b-9d33-a3c1c16048f2	2026-07-25	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
2c272619-9a2d-4008-b3b7-31477f674447	2026-07-25	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
2db852d3-78c7-4ce7-a358-514e1c2b264d	2026-07-25	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
9432c691-c6d5-4f9c-a949-293f9c019b25	2026-07-26	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
31d9f3a1-e4e4-4bc7-987f-f7595951839b	2026-07-26	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
8de23eee-5019-4076-aa8c-e15325c5e9ff	2026-07-26	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
fa61250f-f63d-475e-a83a-270f91c4f8a5	2026-07-26	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
cecf5558-52d2-4f87-81fe-8fffe270c638	2026-07-27	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
6222af64-ed29-4e90-847b-9c72edd8aa1d	2026-07-27	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
9da529fa-97d9-44f5-aad2-7371244b24c9	2026-07-27	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
816bb0fa-97b5-445d-9588-9d40b9b35df2	2026-07-27	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
3c3ee519-284c-44ec-846f-3c087f6abf7e	2026-07-28	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
48ed16de-f627-499a-a85f-4a74a525f190	2026-07-28	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
80a4795f-5a31-499f-b242-2fc510f1edf8	2026-07-28	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
2697c512-23c6-425d-9435-9287c81bed2d	2026-07-28	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
fa73d9b5-fe48-4655-9b19-19715904c503	2026-07-29	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
e6a455f0-69db-461a-80af-8ed3962819cb	2026-07-29	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
2d40f996-431c-4270-aa1e-40c696ed28a9	2026-07-29	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
2b5c1ffb-6560-4cab-acaa-449919926cbd	2026-07-29	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
6f07fc33-0758-4027-9399-79526128156d	2026-07-30	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
46b7a112-57d9-4d12-b5a0-6eb334359e40	2026-07-30	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
6abe9e99-21a5-47c5-964d-89361aa01fd8	2026-07-30	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0a335bb8-5349-4679-a876-8038711c735a	2026-07-30	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f548d586-b691-4615-9956-8c1e0006d760	2026-07-31	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
91526a6a-c19d-43e8-ace7-37bc6cddc934	2026-07-31	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
da3b2a79-ef55-4819-a840-45b209fad618	2026-07-31	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
20bb7df8-2db2-4912-8ab8-2a4b2a2e630b	2026-07-31	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
38b9414a-63d2-4dcf-b541-2c5992b70816	2026-08-01	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
4a9b491f-6929-4f45-a97a-36e5f95c9545	2026-08-01	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
5dab039b-0108-47f1-b8bf-81dca9745dc0	2026-08-01	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
1f312d4c-5893-467b-ac8c-64c3a34f5ea8	2026-08-01	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
5bcf50e5-cbe6-4f14-9e7c-53b11d11ee74	2026-08-02	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ff5e4a93-59fb-41d7-85f0-ec35a6c09f52	2026-08-02	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
dc28d52e-5f3e-4e58-8a60-96cf309699b0	2026-08-02	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
2376407d-f2ba-4a66-9b4c-dae99b0e3d55	2026-08-02	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
062cd1c7-66a5-4309-acfc-f6413e1b6dc3	2026-08-03	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
2f5acf0b-7229-4c7e-b7a7-d5121d7d10c4	2026-08-03	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
b1d58ddc-fcfe-451b-97f9-0979fab8d917	2026-08-03	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
12763e9a-f19e-458c-bcf8-77d92c849390	2026-08-03	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
df0dc038-d6ed-4f07-8164-a4461fb35d33	2026-08-04	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c225a317-94a3-44f1-aa62-562da709e14e	2026-08-04	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
95b48d6a-c0af-4468-acd0-82f494a5a9c8	2026-08-04	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
89cc1ad1-a526-48a0-82b7-c8ee598344e7	2026-08-04	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ab68d9af-38c1-49f3-9ba5-b593450bca46	2026-08-05	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
882b05bf-b8af-4998-9a9c-d0c9d1f3191c	2026-08-05	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
174177fc-e28a-4068-af53-6557a91abe78	2026-08-05	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
6209898d-2218-43a3-91a8-430aea20e72a	2026-08-05	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
eb09f9de-4b5e-44ea-ab04-28722612c0f0	2026-08-06	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f147de8a-d5a3-4707-a9f9-f87ab6333f74	2026-08-06	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
5d95d71c-d6ed-4c7f-af1d-78b2cbd39483	2026-08-06	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
44a76089-7222-4bf9-a840-a5a7fa063fc8	2026-08-06	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f569a10d-d379-4d2f-b342-87fb932f3348	2026-08-07	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
8975c5aa-fe9c-42fd-9012-21851359e8fd	2026-08-07	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
793c9770-d63d-4330-b876-7fcc83ea56fc	2026-08-07	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
9b800bee-51f0-4926-978d-d0cc3bf57658	2026-08-07	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0614e29a-55d8-40d8-906a-1abc5657f47b	2026-08-08	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0fc37113-71e6-4548-9369-01523d82ea91	2026-08-08	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
bf0215bb-5552-4833-af02-8a269becd4ca	2026-08-08	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
6ce4318e-027f-4b66-ac1a-25a34da61ef4	2026-08-08	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ecac2b43-1798-4757-b3d2-f20496b1ab5f	2026-08-09	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
42fc661b-2dac-43ee-8851-f1495bc01d24	2026-08-09	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
7c683316-f88b-45fe-8e52-3e6fcdd964d6	2026-08-09	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
cb510577-b2d8-4b11-8c51-671942c95e66	2026-08-09	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d32dc64e-432f-48b9-bfd8-a47b721add53	2026-08-10	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
319a1ee6-46b0-48b1-93b6-8de6cec7f234	2026-08-10	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0ee7b25d-98c4-4eb9-b3d5-c70b78b20b28	2026-08-10	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
80024ffd-9670-4bed-924b-c951fae1f198	2026-08-10	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
246bc4c1-7fcd-4663-a0c2-674eb0294755	2026-08-11	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
33a1e423-83fa-4185-bb98-178d13a7b194	2026-08-11	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
1348cf96-ef12-481b-9c6d-272ec06b1fe1	2026-08-11	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
28dc2563-33c9-4611-a976-67efc55abda0	2026-08-11	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d82d22ae-f73f-4d26-99ad-d2aca02db213	2026-08-12	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
6c01546e-ef27-478c-82be-fbf173b3229a	2026-08-12	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
4f3be984-d4bb-4fe2-a368-6fad3b7d13ae	2026-08-12	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
8b1d346a-2b0a-4013-b051-27f2b3cf2c25	2026-08-12	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
fd997242-e840-4872-9e1a-88c874484828	2026-08-13	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0646c355-0c19-40b8-89b6-8d79aa86c5fa	2026-08-13	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
969f80d0-8827-4673-a55d-4e5e723b2d55	2026-08-13	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
2ebfc89a-09fd-4434-a005-f090416b04ac	2026-08-13	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
acc213e3-2f59-4523-bd0f-f0acd05ba945	2026-08-14	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f9f4ddac-f87d-4086-8239-22034c83decf	2026-08-14	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
417a01f5-acc9-4796-9bf4-2ce6191063ed	2026-08-14	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
94f6455f-0965-44dc-9df1-2a285d3a6a00	2026-08-14	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
e6dc0116-7d96-421f-a5bb-d3da7cb479a5	2026-08-15	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
085437d6-6740-4ec7-80a0-0ffb5aeb4156	2026-08-15	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
09a32fc8-380a-47f4-a084-67fce0cd36a6	2026-08-15	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
21323afb-de2f-43be-b3c4-9f470a6364c5	2026-08-15	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d0f340fa-3dc9-4f7c-8856-95badf51e035	2026-08-16	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
262e55a8-0597-4906-8c63-4b35d805f8ca	2026-08-16	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
de7f1ece-a997-459f-885a-5d3a95bc1c48	2026-08-16	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
841d7a71-4ba0-4f8d-a762-df848033c502	2026-08-16	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
56132db0-7572-4265-b921-9109ce091714	2026-08-17	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
3ac6975c-3f22-400b-adfb-0727ef88b991	2026-08-17	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
5f9256e1-d9fc-4ad5-9b2d-5340e1b45233	2026-08-17	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ce25d058-576b-4904-b1d8-536ee285d4de	2026-08-17	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
261404aa-febe-4ae3-aaf8-949685625c7a	2026-08-18	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
351a5440-feb9-46a0-a911-b08619ba7568	2026-08-18	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
357f4390-4e06-4a03-ac99-001aa0e9bcc6	2026-08-18	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
68422f0a-467f-411b-96ca-601aec37ff35	2026-08-18	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
9982d17d-4177-421f-81a5-e698a17245cd	2026-08-19	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
05e684e9-85da-4a0e-8c63-2ebd85520d7c	2026-08-19	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
a3fcdca3-1f90-4490-994a-b076e7add346	2026-08-19	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d8eda3ff-a701-4939-ae0e-d3cdeda7f3d0	2026-08-19	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
95696a83-8bcc-4c7e-9a6f-b136e8f8997b	2026-08-20	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
444b61d9-a85c-4273-86f3-5cea3e41be51	2026-08-20	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
5cf38537-2d6a-4b38-a3fd-0a471cbc7632	2026-08-20	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
6f0f227e-a156-436a-845c-70e2b2d0834b	2026-08-20	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f4e7d6ab-deaf-4d9b-9c94-3a1aa350cf3e	2026-08-21	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
bdf5b2bf-5788-4b07-803e-b9417f703ea9	2026-08-21	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
5837fda8-9bc7-498f-b30b-f9c2a967e5c0	2026-08-21	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ab623f86-f486-4abc-8ff2-8a5870aa2f65	2026-08-21	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
716cdf99-0711-4e79-a293-f15abfe2c35e	2026-08-22	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
1540ec5d-3e7e-4216-a400-900899a5986b	2026-08-22	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
06129f4f-2ff9-4874-8f6e-2f847e85e1cd	2026-08-22	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
91f180e0-f932-46b7-b372-0b7e7998fd8e	2026-08-22	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c163340b-3699-4bfd-b6c0-3c45eba3b869	2026-08-23	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
9309024a-fc58-4228-974b-8274fa6debdb	2026-08-23	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
41e8ab8f-4526-410a-9fc1-ed91eba5d2b9	2026-08-23	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
062aaf6a-0212-4e37-9776-bebc54524509	2026-08-23	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
4c6bf7ab-dc57-42f0-8069-1043c9576185	2026-08-24	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
a55dcf49-eeca-4b3b-80f0-166f09390b83	2026-08-24	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
061b1425-ccd6-440d-9f2a-269d708b1ea1	2026-08-24	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
536aa6e8-b1e2-41f4-8cf8-1596ed649efa	2026-08-24	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
bb40eab2-9b7c-49f2-8537-e8447a50b526	2026-08-25	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0ec05a20-30dc-45e0-bbc0-ef8ae078f5e6	2026-08-25	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
29b28695-b340-4c32-b9b0-c11b0f5f6e22	2026-08-25	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f6290112-1e4c-44b4-b171-b50559e45925	2026-08-25	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
8d1fb02d-37cd-416a-8365-1e550ab10371	2026-08-26	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c8510b2d-6ab3-44ff-9f19-c6be08ac9ff7	2026-08-26	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
02554d98-8a41-4d6d-b6a3-3a800b5c376a	2026-08-26	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
7cc1db9f-b58a-4d89-bff9-67f3bbc7eee1	2026-08-26	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ba6c7cc6-46de-487c-8146-976fde919ac6	2026-08-27	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f957a2d2-5398-4389-9634-e91f7b1bbe90	2026-08-27	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
b04018ac-3560-4284-acf2-4d55ad06c270	2026-08-27	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c808f269-ef85-4c4e-a56a-9a96519e2b4c	2026-08-27	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
7ac7fe9d-50ca-4d98-9bf3-404391a16776	2026-08-28	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
91b00e17-a6a6-41c2-978a-8035d6b0cb67	2026-08-28	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
aa0e0a7a-c061-4aba-84ed-ab6797fce612	2026-08-28	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
43cc6b35-766f-4726-aa05-a861fddb11ab	2026-08-28	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
fe64149b-677f-4eb7-a277-720ba25a7163	2026-08-29	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
b16ea56c-3fe7-4e34-9849-20f07901b70a	2026-08-29	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
4a8649a5-0580-46cf-8da7-a80c41c9dec6	2026-08-29	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
35542cce-3ded-42a0-bbf4-c5ca693c095a	2026-08-29	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ed8aa7d3-ec57-4ca0-84d0-dfd5499acf9a	2026-08-30	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ebfd5280-1b35-4dc0-99d3-503a8d95388b	2026-08-30	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
e1a463e7-7924-40ba-a6c2-3b2727239dce	2026-08-30	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
8d8d5329-3cc9-431e-9aa2-60f367866a0c	2026-08-30	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
608edf1f-4c55-4219-a621-4f925174273e	2026-08-31	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
042bba1b-2462-40b2-8fdd-76bbb96b332c	2026-08-31	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
1665f77e-a592-4dc8-9e7f-dc260984c0a5	2026-08-31	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d95d102c-f5c9-4daf-b0b1-a1f1d94a3499	2026-08-31	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c8378b78-5221-4b6a-ab70-cf5757bd3428	2026-09-01	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
8c82b4ba-5c18-4bed-8386-2fe730af4aa0	2026-09-01	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
73f441e3-3d91-44df-b3fe-26ad0c4d2c24	2026-09-01	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
8d5ee4df-4b84-43d1-9274-1c6031f87547	2026-09-01	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
9e4b324d-6a3f-4c06-8619-034ffcb8732a	2026-09-02	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0bc3604a-104c-44a7-becc-ebdd128880ee	2026-09-02	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c1aa8079-68d9-4b0c-827b-423fc8f8823f	2026-09-02	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
618050ae-c454-4a4e-961e-6884442b42d2	2026-09-02	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d8124f96-db5f-4568-81a8-f5207d71aecc	2026-09-03	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
260cc406-5c99-4f5b-b3dc-d393ed76ea1a	2026-09-03	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
9e2db69b-1cf7-45e6-a67a-41f3027eb3f3	2026-09-03	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
b410cb0a-7273-40f6-8f55-f836e4c9aed1	2026-09-03	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d9b9e026-07d0-4f77-bcb9-79a5d95cbfed	2026-09-04	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c6032929-4ad8-4649-afeb-8d324d761a15	2026-09-04	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
06a6c4df-fa03-4b0d-b7d3-cfbb0293f4d2	2026-09-04	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
403e8a0a-c00e-43ec-8db0-782833d4b585	2026-09-04	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
20b2f63f-a154-41e8-b921-10ef8241b047	2026-09-05	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
fac8fa50-5a21-4785-9c54-3b567d8031a2	2026-09-05	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
63092cb5-c622-430e-902b-7857d295e78d	2026-09-05	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
1f933658-c727-4091-b859-595da675a576	2026-09-05	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
1f8c00d1-cf61-4b49-855f-359379f7e51f	2026-09-06	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
a517fd13-88db-41f9-8f61-63ff650837b1	2026-09-06	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
02866fb4-b47b-4564-b138-927864fe30ec	2026-09-06	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
7b197dcc-e67b-44a9-840b-d152a1ae61f5	2026-09-06	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0c3c17de-0d64-4a53-9d4b-885de0a6b40e	2026-09-07	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
2e3d8267-d98b-4460-8d9b-cbb7809d7b93	2026-09-07	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
9ec36459-5a74-4328-bde3-e6820fef1a71	2026-09-07	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
89f24b28-edc1-4937-91f8-774269aa1244	2026-09-07	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ddeda2e3-db05-431a-8301-16ed17965806	2026-09-08	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
8d747359-c96f-43fa-8f4d-ec1993ce9cbe	2026-09-08	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ac529709-a2ee-4abc-96f0-c8da1b37e906	2026-09-08	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
da2e22e7-6172-4afe-a29b-91e4437402cf	2026-09-08	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
291de85e-003f-432e-951b-032dee75e214	2026-09-09	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
26077964-97c3-4bdf-8d60-1f71102240b7	2026-09-09	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
7c658888-254e-4312-a4a7-a38bb69bbc87	2026-09-09	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
73702855-7c80-4818-88de-0b2406e425a0	2026-09-09	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
34918221-6d23-41c1-86b9-2eb844a0d9ec	2026-09-10	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d91109b0-f865-4776-94bd-8a25ebb39bf2	2026-09-10	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f7e904b5-9341-4c70-a99c-2c20b378c598	2026-09-10	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
1851d0cc-9c92-449d-985a-1f54b2bc7f14	2026-09-10	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
5d73d5d3-5abe-4dc5-a133-f4a13937fc8f	2026-09-11	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c8cedefd-4673-4521-b6ea-06941aaedc1d	2026-09-11	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f3eb0ba8-99f5-4df9-9ecb-02c75d9f8168	2026-09-11	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
fd64e363-1d15-44cb-a443-3feaac5af95f	2026-09-11	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
1db7f378-516f-4e2f-bf56-d66758b81fe8	2026-09-12	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
2f25c9bf-c34e-4172-8955-f47e4011ae3c	2026-09-12	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
748b528c-0446-4568-9eef-fe3e3e0f58c5	2026-09-12	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
82d1ac46-613e-4faa-810f-ad5054822dc4	2026-09-12	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
bc6b208e-9ab5-4b3a-b345-7e9e9f0a88fb	2026-09-13	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0455dff9-cd07-4adc-abf3-54bb6cc24240	2026-09-13	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
565310ab-9eeb-413c-afe6-7fdfcc2402b4	2026-09-13	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0c2970e9-9e0e-4352-a73e-ef1714161015	2026-09-13	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
1639fbf8-0575-4c73-90da-beb8665e1cef	2026-09-14	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
a22ebaa1-634a-498e-9230-676d2632643a	2026-09-14	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
de8aa3cb-6d0f-4a67-ba69-0b2969235e2e	2026-09-14	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
7ffa8299-16ae-4d9f-b852-d0dc7af0c766	2026-09-14	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
6202e3e6-16c6-473e-b896-350329a2806d	2026-09-15	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
bb470719-ac41-456f-bba1-dcf8b21bca0e	2026-09-15	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
61575340-a30c-476e-b5f1-14c7ebe403a2	2026-09-15	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
8ae0ab5c-b54e-4f11-8b6d-e7550ed4c4f8	2026-09-15	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
4fb921d8-1440-4346-b2c8-5aa4c63d99fb	2026-09-16	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
b24f6d2d-3dff-4259-b36c-80a5a8ce45bb	2026-09-16	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
deff36f9-1c30-4c79-ac0d-ff3f38ec3f4a	2026-09-16	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
91525712-bfbf-4930-96a5-325bb96a3e03	2026-09-16	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f79495cf-5639-43e9-9f43-efb2fac586ba	2026-09-17	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
3938ef25-822f-4e9f-ad0a-387decf931a1	2026-09-17	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0571377a-fa8a-4cd1-a9d2-65a77324a698	2026-09-17	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
9d59c5a4-350b-4de4-8c14-3c9a89eefede	2026-09-17	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
7d652797-5934-4783-a335-97f70052fb47	2026-09-18	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
31de5bcc-1555-40bd-9421-d5601915d338	2026-09-18	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
9edf2c19-335d-4d84-87a8-bbc72cfaa026	2026-09-18	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
baf41c27-583a-4950-a768-f1a6d46fc637	2026-09-18	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
fdffd39d-3f7e-41d6-965e-60dfe3e5b8e9	2026-09-19	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
af62e777-ee5a-43b6-ab50-fde017fe7735	2026-09-19	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
35907665-1fb5-4571-a424-aa60ac2131b6	2026-09-19	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
0fda507a-0af8-40dd-b9cb-af79c2020849	2026-09-19	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f62f6401-5402-42e5-adf4-3b8cad09b805	2026-09-20	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d04116d1-b3c3-4982-aad1-d75a49dafd1a	2026-09-20	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
117b8ba2-3843-4978-9be4-b671579b4fda	2026-09-20	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
43541f42-f9d8-4940-88f2-38a54c02aaa5	2026-09-20	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d8a449ea-8f59-4a40-82e2-d192fe3cda4d	2026-09-21	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
737b5016-847b-47a4-aa51-c5d50a0ba586	2026-09-21	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
9eddb28c-7225-4f60-8bb7-3cae12bc37fb	2026-09-21	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d254ca95-e476-4523-9dff-c4032a0ec3a8	2026-09-21	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d42e2e53-14fb-412a-a30b-6f436aaaf32c	2026-09-22	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
268d4e50-8d4b-4d60-b424-82eb552f354b	2026-09-22	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
a2b3d60d-8271-4a1c-99ee-b2f08814f4fc	2026-09-22	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
85bfee35-9d25-4023-b0ab-ddbf9f42168f	2026-09-22	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
4720a703-177c-496d-98a4-c91687bda21c	2026-09-23	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
f61f351a-7180-41b1-8642-6ba1866b4ed9	2026-09-23	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
d05d9bf9-6af1-4536-8815-c8bb62d4bf43	2026-09-23	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ba9330fd-ee02-4760-83dc-ef5efb0f4274	2026-09-23	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
60106b84-d8f4-4507-acf3-92e1e6ef3f1e	2026-09-24	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
590234cf-9188-4638-823e-cd18349fe4fd	2026-09-24	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
e8c25bea-1745-457c-9398-33bb9c25d23b	2026-09-24	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c95d754f-c8ed-4d4d-8710-bbf89a79e3bf	2026-09-24	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
70a32b65-03ab-402c-b65d-2843357231a4	2026-09-25	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
3d01792d-67b6-43d3-b68e-65759ad6633c	2026-09-25	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
c0ee0927-c383-49f5-8985-27ec3811842b	2026-09-25	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
bd32e551-302e-42b3-afd0-4feede09bd2e	2026-09-25	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
b878d3f4-be2d-40e9-a97d-cfaac2e555b7	2026-09-26	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
5c49cba9-7dd3-47a2-bbfa-b782a14de534	2026-09-26	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ed9e32a1-90e2-42a6-bd6c-72cf98bbaa33	2026-09-26	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
3f46c190-e3d3-423b-a08c-b700d689609f	2026-09-26	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
cdea4860-7b35-43a5-93a3-5e9cfc8f809a	2026-09-27	pkl	5	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
7d27eeb9-46f5-464c-9329-f3d6b773f848	2026-09-27	research	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
244141eb-71ed-4a4d-a4eb-d349f431ef4a	2026-09-27	koas	3	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
58cb027c-a858-42df-80f0-b2c9bef49a48	2026-09-27	interview	10	0	f	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
ea50928f-8872-4d8d-917c-bb3cd1a3a5d8	2026-09-28	pkl	5	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
576e1818-eeef-431d-afe2-adc84ec45e7a	2026-09-28	research	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
42a1116f-0cad-4f09-89c1-36a63d9c5702	2026-09-28	koas	3	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
5cfa183e-42da-40bc-805b-14f4e8707e18	2026-09-28	interview	10	0	t	\N	2026-06-30 19:57:24.674684+07	2026-06-30 19:57:24.674684+07
\.


--
-- Data for Name: service_faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_faqs (id, category, question_id, question_en, answer_id, answer_en, order_index, is_active, created_at, updated_at) FROM stdin;
25df7313-1dc2-487d-b3e0-4ec60ca508ac	general	Berapa lama proses persetujuan pendaftaran?	How long does the registration approval process take?	Proses persetujuan biasanya memakan waktu 3-5 hari kerja setelah dokumen lengkap diterima.	The approval process usually takes 3-5 business days after complete documents are received.	1	t	2026-06-30 19:57:24.39825+07	2026-06-30 19:57:24.39825+07
4a2100eb-815a-47f1-9f43-fbbf239bbf7a	general	Bagaimana cara mengecek status pendaftaran?	How to check registration status?	Anda dapat mengecek status pendaftaran dengan memasukkan kode tracking yang diberikan saat pendaftaran di halaman Layanan.	You can check your registration status by entering the tracking code given during registration on the Services page.	2	t	2026-06-30 19:57:24.39825+07	2026-06-30 19:57:24.39825+07
c28c12cc-f78e-4345-b7a8-cf8eb2a4bcb9	pkl	Berapa lama durasi PKL yang diperbolehkan?	How long is the internship duration allowed?	Durasi PKL minimal 1 bulan dan maksimal 6 bulan.	The minimum internship duration is 1 month and maximum 6 months.	1	t	2026-06-30 19:57:24.39825+07	2026-06-30 19:57:24.39825+07
82ed864f-c79c-4f60-ace5-de9340e5dd4d	pkl	Apakah peserta PKL mendapat sertifikat?	Do interns receive certificates?	Ya, peserta yang menyelesaikan program akan mendapat sertifikat keikutsertaan.	Yes, participants who complete the program will receive a participation certificate.	2	t	2026-06-30 19:57:24.39825+07	2026-06-30 19:57:24.39825+07
e802b1db-737c-490c-aaed-e8149bca4462	research	Apakah boleh mengambil sampel dari lokasi?	Is it allowed to take samples from the location?	Pengambilan sampel harus mendapat persetujuan khusus dan mengikuti prosedur yang ditetapkan.	Sample collection requires special approval and must follow established procedures.	1	t	2026-06-30 19:57:24.39825+07	2026-06-30 19:57:24.39825+07
0e65411b-d451-4d43-9cf4-b2abfead8cda	koas	Departemen apa saja yang tersedia untuk rotasi Koas?	What departments are available for medical clerkship rotation?	Tersedia departemen Kesehatan Satwa, Nutrisi, dan Konservasi. Silakan hubungi admin untuk informasi lebih lanjut.	Available departments include Animal Health, Nutrition, and Conservation. Please contact admin for more information.	1	t	2026-06-30 19:57:24.39825+07	2026-06-30 19:57:24.39825+07
8234971b-05d5-4244-b945-e72f67b26ee9	interview	Apakah boleh membawa kru dalam jumlah besar?	Is it allowed to bring a large crew?	Jumlah kru disesuaikan dengan kebutuhan dan harus dikonfirmasi saat pendaftaran. Maksimal 5 orang per sesi.	Crew size is adjusted to needs and must be confirmed during registration. Maximum 5 people per session.	1	t	2026-06-30 19:57:24.39825+07	2026-06-30 19:57:24.39825+07
\.


--
-- Data for Name: service_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_registrations (id, tracking_code, program_type, institution_name, institution_address, institution_phone, institution_email, participant_name, participant_nim, participant_phone, participant_email, study_program, start_date, end_date, research_title, participant_count, cover_letter_url, proposal_url, student_id_url, status, admin_notes, reviewed_by, reviewed_at, created_at, updated_at, faculty, rotation_department, supervisor_name, supervisor_phone, recommendation_letter_url, media_organization, interview_topic, target_interviewee, equipment_used, interview_date, interview_time, journalist_id_url) FROM stdin;
\.


--
-- Data for Name: service_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_settings (id, admin_whatsapp, admin_email, cover_letter_template_url, proposal_template_url, required_documents_pkl, required_documents_research, required_documents_koas, required_documents_interview, limit_pkl, limit_research, limit_koas, limit_interview, created_at, updated_at) FROM stdin;
main	\N	\N	\N	\N	["Surat Pengantar dari Institusi", "Kartu Tanda Mahasiswa"]	["Surat Pengantar dari Institusi", "Proposal Penelitian", "Kartu Tanda Mahasiswa"]	["Surat Pengantar dari Fakultas", "Surat Rekomendasi", "Kartu Tanda Mahasiswa"]	["Surat Pengantar dari Media", "Kartu Identitas Jurnalis"]	\N	\N	\N	\N	2026-06-30 19:57:24.39399+07	2026-06-30 19:57:24.39399+07
\.


--
-- Data for Name: service_standards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_standards (id, service_name_id, service_name_en, requirements_id, requirements_en, procedure_id, procedure_en, duration, cost, complaint_mechanism_id, complaint_mechanism_en, icon, order_index, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, logo_url, logo_mobile_url, loading_logo_url, hero_image_url, mascot_image_url, map_image_url, site_name, updated_at, updated_by, floating_ticket_enabled, floating_ticket_text_id, floating_ticket_text_en, floating_ticket_position, footer_description_id, footer_description_en, contact_address, contact_phone, contact_email, floating_ticket_use_schedule, floating_ticket_start_time, floating_ticket_end_time, floating_ticket_icon, floating_ticket_custom_icon_url, floating_ticket_icon_size, ticket_external_url, whatsapp_number, chat_us_enabled, chat_us_number, chat_us_position, chat_us_icon_url, chat_us_start_time, chat_us_end_time, chat_us_timezone, chat_us_use_schedule, venue_whatsapp_number, venue_phone_number, navbar_show_map, navbar_show_animals, navbar_show_tickets, navbar_show_events, navbar_show_qr_scan, navbar_show_profile, navbar_show_venues, navbar_show_donate, navbar_show_news, navbar_show_gallery3d, carousel_autoplay_duration, hero_ticket_enabled, hero_ticket_use_schedule, hero_ticket_start_time, hero_ticket_end_time, social_instagram, social_facebook, social_twitter, social_youtube, social_tiktok, footer_logo_url, favicon_url) FROM stdin;
main	/uploads/branding/logo/logo-1769473779191.png	/uploads/branding/logo-mobile/logo-mobile-1769309416559.png	/uploads/branding/loading-logo/loading-logo-1769311207076.png	\N	/uploads/branding/mascot/mascot-1769321937179.png	\N	Taman Margasatwa Ragunan	2026-08-13 13:20:47.407+07	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	t	Pesan Tiket Online	Book Tickets Online	right			Jl. Harsono RM No. 1, Ragunan, Pasar Minggu, Jakarta Selatan 12550	(021) 7884 7114	ragunanzoo@jakarta.go.id	f	08:00	17:00	Ticket	\N	medium	https://ragunanzoo.agathis.fun/	\N	t	\N	right	/uploads/branding/icons/chat-us-icon-1769752532088.jpeg	08:00	17:00	\N	f	\N	\N	t	t	t	t	t	t	t	t	t	t	5000	t	f	08:00	17:00	https://www.instagram.com/ragunanzoo/?hl=en	https://www.facebook.com/ragunanzoo	https://x.com/ragunanzoo	https://www.youtube.com/@RagunanZooChannel	https://www.tiktok.com/@ragunanzoojkt	/uploads/branding/WhatsApp_Image_2026_08_07_at_07_38_49_transparent-1786063565089-430191820.png	/uploads/branding/WhatsApp_Image_2026_08_13_at_13_20_22_transparent-1786602038330-190092233.png
\.


--
-- Data for Name: system_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_configs (key, value, description, updated_at) FROM stdin;
chatbot_greetings	{"intro_en": ["Hello! I am Ragunan's virtual keeper. How can I help you?", "Welcome to Ragunan Zoo! Need info about animals, tickets, or facilities?", "Hi! Need help finding information about Ragunan Zoo?"], "intro_id": ["Halo! Saya penjaga virtual Ragunan. Ada yang bisa saya bantu?", "Selamat datang di Kebun Binatang Ragunan! Ingin bertanya tentang hewan, tiket, atau fasilitas?", "Hai! Butuh bantuan untuk mencari info seputar Ragunan Zoo?"], "outro_en": ["Thank you! Enjoy your visit at Ragunan Zoo.", "You're welcome! Don't hesitate to ask if you need more help.", "Glad to help! Have a great day at the zoo."], "outro_id": ["Terima kasih! Selamat menikmati kunjungan Anda di Ragunan Zoo.", "Sama-sama! Jangan ragu untuk bertanya lagi jika butuh bantuan.", "Senang bisa membantu! Semoga harimu menyenangkan di kebun binatang."], "fallback_en": ["Sorry, I don't quite understand. Could you rephrase or use other keywords?", "Wow, I'm still learning. Maybe try asking about animals or tickets?", "Hmm, I don't understand. You can try typing 'ticket prices' or 'opening hours'."], "fallback_id": ["Maaf, saya tidak begitu mengerti. Bisa ceritakan lebih detail atau gunakan kata kunci lain?", "Wah, saya masih belajar. Mungkin coba tanyakan hal lain seputar satwa atau tiket?", "Hmm, saya kurang paham. Anda bisa coba ketik 'harga tiket' atau 'jam buka'."]}	Chatbot varied greetings and fallbacks	2026-08-01 08:26:51.972343+07
maintenance_mode	{"title": "Sedang dalam Pemeliharaan", "enabled": false, "subtitle": "Kami sedang melakukan pembaruan sistem untuk meningkatkan layanan Anda. Mohon maaf atas ketidaknyamanan ini.", "contact_email": "taman.margasatwa@jakarta.go.id", "contact_phone": "(021) 7884-0233", "estimated_done": null, "background_image_url": null}	Pengaturan mode maintenance website	2026-08-01 14:11:04.387+07
\.


--
-- Data for Name: ticket_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_content (id, title_id, title_en, description_id, description_en, image_url, content_type, order_index, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ticket_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_settings (id, hero_image_url, hero_title_id, hero_title_en, hero_subtitle_id, hero_subtitle_en, show_pricing, regular_price, vip_price, child_discount, external_ticket_url, updated_at, updated_by, regular_title_id, regular_title_en, regular_description_id, regular_description_en, regular_link, vip_title_id, vip_title_en, vip_description_id, vip_description_en, vip_link, section_title_id, section_title_en, regular_image_url, vip_image_url) FROM stdin;
ed4b9977-3aad-4e64-a41a-fdf5d1b04607	\N	Tarif Masuk & Simulasi Tiket	Admission Rates & Ticket Simulation	Kalkulator estimasi biaya kunjungan, panduan saldo JakCard, dan simulasi alur masuk Ragunan Zoo	Visit cost calculator, JakCard balance guide, and entry procedure simulation for Ragunan Zoo	t	25000	50000	0.50	https://ragunanzoo.agathis.fun/	2026-06-30 19:57:24.784898+07	\N	Regular	Regular	Akses standar ke semua zona	Standard access to all zones	\N	VIP	VIP	Akses prioritas + feeding time	Priority access + feeding time	\N	Pilih Jenis Pembelian Tiket	Select Ticket Purchase Type	\N	\N
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (id, user_id, visit_date, quantity, ticket_type, price, total, status, code, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tour_bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_bookings (id, booking_code, guide_id, package_id, customer_name, customer_phone, customer_email, booking_date, start_time, duration_hours, participants, total_price, notes, status, admin_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tour_gallery; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_gallery (id, image_url, caption_id, caption_en, is_active, order_index, created_at) FROM stdin;
\.


--
-- Data for Name: tour_guide_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_guide_schedules (id, guide_id, date, start_time, end_time, is_available, created_at) FROM stdin;
\.


--
-- Data for Name: tour_guides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_guides (id, name, photo_url, specialization, languages, bio_id, bio_en, hourly_rate, rating, total_reviews, is_active, phone, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tour_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_packages (id, name_id, name_en, description_id, description_en, duration_hours, min_participants, max_participants, icon, color_class, is_active, order_index, created_at, updated_at) FROM stdin;
63e06d39-b318-4a57-8ca8-9333e28c6aa3	Tur Keluarga	Family Tour	Jelajahi kebun binatang bersama keluarga dengan pemandu berpengalaman	Explore the zoo with your family guided by experienced guides	2.5	1	10	Users	primary	t	1	2026-06-30 19:57:24.54369+07	2026-06-30 19:57:24.54369+07
aca1185c-f018-4920-a3b3-bff5d3ab0430	Tur Edukasi Sekolah	Educational School Tour	Program edukasi khusus untuk rombongan sekolah dengan materi pembelajaran	Special educational program for school groups with learning materials	3.5	1	40	GraduationCap	blue-500	t	2	2026-06-30 19:57:24.54369+07	2026-06-30 19:57:24.54369+07
f6c7e742-25d4-4f94-9dcf-36121076a90a	Tur Fotografi Wildlife	Wildlife Photography Tour	Tur khusus untuk fotografer dengan akses ke spot-spot terbaik	Special tour for photographers with access to the best spots	4.0	1	8	Camera	orange-500	t	3	2026-06-30 19:57:24.54369+07	2026-06-30 19:57:24.54369+07
\.


--
-- Data for Name: tram_route_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tram_route_points (id, sequence_order, lat, lng, halt_name, is_halt, is_active, created_at) FROM stdin;
1	1	-6.3062	106.8195	Halte 1 - Plaza Masuk Utara	t	t	2026-09-25 08:29:33.375867+07
2	2	-6.3075	106.821	\N	f	t	2026-09-25 08:29:33.375867+07
3	3	-6.309	106.8214	Halte 2 - Danau Pelikan	t	t	2026-09-25 08:29:33.375867+07
4	4	-6.31	106.8228	\N	f	t	2026-09-25 08:29:33.375867+07
5	5	-6.3115	106.824	Halte 3 - Gajah Sumatera	t	t	2026-09-25 08:29:33.375867+07
6	6	-6.313	106.825	\N	f	t	2026-09-25 08:29:33.375867+07
7	7	-6.3148	106.8238	\N	f	t	2026-09-25 08:29:33.375867+07
8	8	-6.316	106.8215	Halte 4 - Karnivora Rimba Selatan	t	t	2026-09-25 08:29:33.375867+07
9	9	-6.3165	106.8195	\N	f	t	2026-09-25 08:29:33.375867+07
10	10	-6.315	106.8182	\N	f	t	2026-09-25 08:29:33.375867+07
11	11	-6.3135	106.8172	\N	f	t	2026-09-25 08:29:33.375867+07
12	12	-6.3115	106.8168	\N	f	t	2026-09-25 08:29:33.375867+07
13	13	-6.3095	106.818	\N	f	t	2026-09-25 08:29:33.375867+07
14	14	-6.3078	106.8188	\N	f	t	2026-09-25 08:29:33.375867+07
15	15	-6.3062	106.8195	\N	f	t	2026-09-25 08:29:33.375867+07
\.


--
-- Data for Name: trivia_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trivia_questions (id, text_id, text_en, type, category, created_at) FROM stdin;
d8a92fa2-714a-4b41-8a78-cfc6dedef20a	Harimau Sumatera adalah satu-satunya subspesies harimau yang masih bertahan hidup di Indonesia saat ini.	Sumatran tiger is the only surviving tiger subspecies in Indonesia today.	animal	\N	2026-08-01 08:26:51.972343+07
49de36e1-0c22-425b-ad52-4fa8e31e30cf	Jerapah memiliki lidah yang panjangnya bisa mencapai 45 cm untuk menjangkau daun tinggi.	Giraffes have tongues that can reach up to 45 cm long to reach high leaves.	animal	\N	2026-08-01 08:26:51.972343+07
656ebc19-f8bc-4af5-902d-0f8f454be013	Gajah bisa berkomunikasi menggunakan suara infrasonik yang tidak bisa didengar manusia.	Elephants can communicate using infrasonic sounds that humans cannot hear.	animal	\N	2026-08-01 08:26:51.972343+07
aee84825-827a-4717-ad64-50244c0c1a00	Komodo adalah kadal terbesar di dunia dan bisa mencium mangsanya dari jarak 9 km.	Komodo dragon is the largest lizard in the world and can smell prey from 9 km away.	animal	\N	2026-08-01 08:26:51.972343+07
6ac79a65-f221-4aa7-bf29-b6b9aa9f132e	Burung merak jantan melebarkan bulu ekornya yang indah untuk menarik perhatian betina.	Male peacocks spread their beautiful tail feathers to attract females.	animal	\N	2026-08-01 08:26:51.972343+07
00da5710-e6e2-4269-8257-6f2aa0a8f699	Rafflesia arnoldii adalah bunga terbesar di dunia yang tumbuh subur di hutan hujan Indonesia.	Rafflesia arnoldii is the largest flower in the world that thrives in Indonesian rainforests.	plant	\N	2026-08-01 08:26:51.972343+07
6650a6ba-4ae2-440d-bab8-498f43e1d370	Bambu adalah tanaman dengan pertumbuhan tercepat di dunia, beberapa spesies bisa tumbuh hingga 91 cm per hari.	Bamboo is the fastest-growing plant in the world, some species can grow up to 91 cm per day.	plant	\N	2026-08-01 08:26:51.972343+07
a1ebb725-2faa-40b6-821d-6154549e14d3	Pohon Baobab dapat menyimpan hingga 120.000 liter air di dalam batangnya yang tebal.	The Baobab tree can store up to 120,000 liters of water in its thick trunk.	plant	\N	2026-08-01 08:26:51.972343+07
fabd5559-f254-4638-8ce9-c0d441f35f64	Pohon ulin atau kayu besi dari Kalimantan terkenal karena sangat kuat dan tahan terhadap rayap.	Ulin or ironwood from Kalimantan is known for being extremely strong and termite-resistant.	plant	\N	2026-08-01 08:26:51.972343+07
7da1f9d7-35ac-41ad-a709-740431b27080	Bunga bangkai (Amorphophallus titanum) mengeluarkan bau seperti bangkai untuk menarik serangga penyerbuk.	The corpse flower (Amorphophallus titanum) emits a smell like a rotting corpse to attract pollinators.	plant	\N	2026-08-01 08:26:51.972343+07
\.


--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_permissions (id, user_id, permission_key, is_allowed, created_at, updated_at) FROM stdin;
4c6ad95c-9500-4591-88ef-ea8a40bfc24c	ca06f5e1-881f-4179-b600-4a48ff473786	dashboard	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
5f738742-fadb-41b1-834c-f6c9fdabd755	ca06f5e1-881f-4179-b600-4a48ff473786	plants	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
8a0eac5f-e6a1-47dc-bac1-a0c6d04dff2c	ca06f5e1-881f-4179-b600-4a48ff473786	categories	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
bc1d7773-993a-4b57-8cf3-c842afc74f32	ca06f5e1-881f-4179-b600-4a48ff473786	feeding-schedules	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
9680201a-cc39-4c79-936d-b53aeb2db310	ca06f5e1-881f-4179-b600-4a48ff473786	events	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
637ff4a5-5f0a-4e5e-9968-7bb0346a357f	ca06f5e1-881f-4179-b600-4a48ff473786	tickets	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
e8e5e07b-9525-4ce0-9e1a-08c251cb5dbf	ca06f5e1-881f-4179-b600-4a48ff473786	ticket-content	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
2d0ea2e4-a3fc-4e59-8fa3-b68779c2fcb1	ca06f5e1-881f-4179-b600-4a48ff473786	venues	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
7a2b2a02-f5a0-465d-87aa-69e39eedf01e	ca06f5e1-881f-4179-b600-4a48ff473786	news	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
bd676839-b326-4e11-ab9c-31c111ef32eb	ca06f5e1-881f-4179-b600-4a48ff473786	announcements	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
06c5f298-4f7c-4e79-8993-8850186bccdf	ca06f5e1-881f-4179-b600-4a48ff473786	users	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
cf9b887c-74cd-44f9-a234-471f2265466f	ca06f5e1-881f-4179-b600-4a48ff473786	branding	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
3dc5eec8-c4fc-4d45-acc5-3227c0a46df3	ca06f5e1-881f-4179-b600-4a48ff473786	map	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
22ff9cae-b6c7-451b-8697-3b24a3d2b943	ca06f5e1-881f-4179-b600-4a48ff473786	map-markers	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
7a340046-b3c7-4dac-94bd-f0971f20e52b	ca06f5e1-881f-4179-b600-4a48ff473786	hero-banner	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
f358fd89-b64a-43e0-b987-40b0117d22fd	ca06f5e1-881f-4179-b600-4a48ff473786	floating-button	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
08ae2273-37f3-43f8-893f-a64b94bd8088	ca06f5e1-881f-4179-b600-4a48ff473786	system-configs	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
9cb3aa4f-55fc-40c9-ba27-eba70d8c9e26	ca06f5e1-881f-4179-b600-4a48ff473786	explorer-navbar	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
1086dc46-4684-47fa-a07b-3041e23023a0	ca06f5e1-881f-4179-b600-4a48ff473786	custom-pages	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
a4705c22-2d62-43c4-85f4-a0fec9a83683	ca06f5e1-881f-4179-b600-4a48ff473786	history	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
cb5c68f2-3381-4918-8b20-e6754a60ecd5	ca06f5e1-881f-4179-b600-4a48ff473786	visitor-stats	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
487db97e-59b5-41d8-8f9f-9ef1ec4f9636	ca06f5e1-881f-4179-b600-4a48ff473786	website-analytics	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
b859d11b-1a65-4a00-85f2-d77a340a2690	ca06f5e1-881f-4179-b600-4a48ff473786	whatsapp-templates	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
46a65698-4cb3-4ee6-9c48-26ab9290eacb	ca06f5e1-881f-4179-b600-4a48ff473786	whats-new	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
01ca3aa4-32db-499d-8310-7bce1f7ad650	ca06f5e1-881f-4179-b600-4a48ff473786	gallery	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
1c14f946-60bc-4c07-a115-a3a6a9298cf3	ca06f5e1-881f-4179-b600-4a48ff473786	wbs	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
0af6cd05-e294-461a-ab16-d0a933a3c794	ca06f5e1-881f-4179-b600-4a48ff473786	service-standards	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
601d12b8-ff4a-4480-bb5a-8fc924937ef6	ca06f5e1-881f-4179-b600-4a48ff473786	service-availability	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
1b453c65-1511-460a-adab-0e26d24cc084	ca06f5e1-881f-4179-b600-4a48ff473786	chatbot-faqs	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
22a843bd-f2a7-4727-90c1-7c67de7cac49	ca06f5e1-881f-4179-b600-4a48ff473786	jdih	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
00d0a595-53cb-41ad-a452-7e7f0d64727f	ca06f5e1-881f-4179-b600-4a48ff473786	organizations	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
7ea59c13-54c0-4997-8080-b67c99b417cb	ca06f5e1-881f-4179-b600-4a48ff473786	facility-reports	f	2026-08-05 16:06:15.971545+07	2026-08-05 16:06:15.971545+07
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, user_id, role) FROM stdin;
1be92a75-7fbb-41fd-87fb-3c51e9b434f1	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	admin
4a6f9b3d-f455-4ee3-8e8f-a2e024a96803	ca06f5e1-881f-4179-b600-4a48ff473786	staff
\.


--
-- Data for Name: venue_bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.venue_bookings (id, venue_id, renter_name, event_name, institution_name, contact_number, start_date, end_date, total_payment, special_notes, status, created_at, transfer_receipt_url) FROM stdin;
b8c580ca-7e3a-4070-a74a-6fa69d177d1e	1	AAA	AA	AAA	123	2026-07-10	2026-07-10	500000	wsaaas	confirmed	2026-07-07 20:17:35.94906+07	http://100.126.123.106:5005/uploads/receipts/RAD_BAB_3_drawio-1783434344165-184385195.png
\.


--
-- Data for Name: venues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.venues (id, name, description, capacity, price_per_hour, price_per_day, image_url, facilities, is_available, created_at, updated_at, image_urls, phone_number, whatsapp_number, panorama_url, has_panorama) FROM stdin;
1	Pendopo 1	\N	100	\N	500000.00	http://100.126.123.106:5005/uploads/venue-images/c6b4acea_ff1a_4d39_9d8d_931862e4ee4e-1783427957772-424147138.JPG	\N	t	2026-07-07 19:39:59.884123+07	2026-07-07 19:39:59.884123+07	{http://100.126.123.106:5005/uploads/venue-images/c6b4acea_ff1a_4d39_9d8d_931862e4ee4e-1783427957772-424147138.JPG,http://100.126.123.106:5005/uploads/venue-images/9042cda6_cddc_46e3_8353_adaa4160a3a5-1783427962616-364317385.JPG}	02178847114	02178847114	\N	f
\.


--
-- Data for Name: visitor_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitor_data (id, date, jumlah_pengunjung, jumlah_kendaraan, pengunjung_wahana, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: wbs_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wbs_submissions (id, reporter_name, reporter_email, reporter_phone, is_anonymous, category, incident_date, incident_location, description, evidence_urls, status, admin_notes, created_at, updated_at, reported_person_name, reported_person_position) FROM stdin;
\.


--
-- Data for Name: whats_new_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whats_new_items (id, item_type, item_id, title_id, title_en, subtitle, image_url, link_url, is_active, order_index, created_at, updated_at) FROM stdin;
95990ec0-4169-4ca9-af0c-91ba7fff47cb	news	3	Bayi Harimau Sumatera Lahir Selamat	Sumatran Tiger Cub Born Safely	Kabar gembira dari tim konservasi satwa Ragunan	https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&auto=format&fit=crop&q=80	/news/3	t	1	2026-08-05 14:51:34.711709+07	2026-08-05 14:51:34.711709+07
e1f7dd88-fb06-4218-9b5e-d1b7ab9c3c87	news	4	Tips Bebas Antrean Akhir Pekan	Weekend Queue Tips	Gunakan pesan online & tiba lebih awal	https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80	/news/4	t	2	2026-08-05 14:51:34.711709+07	2026-08-05 14:51:34.711709+07
50d3d0f2-6a0f-4112-be08-5c9c7b2ace1a	news	5	Edukasi Primata Schmutzer	Schmutzer Primate Education	Papan interaktif gorilla & simpanse	https://images.unsplash.com/photo-1540573133985-780688d1728b?w=800&auto=format&fit=crop&q=80	/news/5	t	3	2026-08-05 14:51:34.711709+07	2026-08-05 14:51:34.711709+07
\.


--
-- Data for Name: whatsapp_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whatsapp_templates (id, message_id, message_en, is_active, order_index, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: zone_markers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.zone_markers (id, name, name_en, color, position_x, position_y, description, description_en, is_active, created_at, updated_at) FROM stdin;
primata	Primata	Primates	#F7941D	25	35	Zona habitat orangutan, bekantan, dan primata lainnya	Habitat zone for orangutans, proboscis monkeys, and other primates	t	2026-06-30 19:57:23.610372+07	2026-06-30 19:57:23.610372+07
mamalia	Mamalia	Mammals	#3BA776	50	25	Zona gajah, rusa, dan mamalia besar lainnya	Zone for elephants, deer, and other large mammals	t	2026-06-30 19:57:23.610372+07	2026-06-30 19:57:23.610372+07
karnivora	Karnivora	Carnivores	#E53935	75	40	Zona harimau, singa, dan karnivora lainnya	Zone for tigers, lions, and other carnivores	t	2026-06-30 19:57:23.610372+07	2026-06-30 19:57:23.610372+07
burung	Burung	Birds	#53B4E6	35	65	Taman burung dengan berbagai spesies burung eksotis	Bird park with various exotic bird species	t	2026-06-30 19:57:23.610372+07	2026-06-30 19:57:23.610372+07
reptil	Reptil	Reptiles	#8E44AD	65	70	Zona komodo, ular, dan reptil lainnya	Zone for komodo dragons, snakes, and other reptiles	t	2026-06-30 19:57:23.610372+07	2026-06-30 19:57:23.610372+07
\.


--
-- Data for Name: zoo_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.zoo_history (id, title_id, title_en, content_id, content_en, year, image_url, order_index, is_published, created_at, updated_at) FROM stdin;
\.


--
-- Name: animals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.animals_id_seq', 9, true);


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.announcements_id_seq', 2, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 6, true);


--
-- Name: hero_banner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hero_banner_id_seq', 4, true);


--
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.news_id_seq', 8, true);


--
-- Name: plants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.plants_id_seq', 7, true);


--
-- Name: tram_route_points_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tram_route_points_id_seq', 15, true);


--
-- Name: venues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.venues_id_seq', 1, true);


--
-- Name: visitor_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visitor_data_id_seq', 1, false);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_email_key UNIQUE (username);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: analytics_daily analytics_daily_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_daily
    ADD CONSTRAINT analytics_daily_date_key UNIQUE (date);


--
-- Name: analytics_daily analytics_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_daily
    ADD CONSTRAINT analytics_daily_pkey PRIMARY KEY (id);


--
-- Name: animals animals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: chatbot_faqs chatbot_faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chatbot_faqs
    ADD CONSTRAINT chatbot_faqs_pkey PRIMARY KEY (id);


--
-- Name: custom_pages custom_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_pages
    ADD CONSTRAINT custom_pages_pkey PRIMARY KEY (id);


--
-- Name: custom_pages custom_pages_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_pages
    ADD CONSTRAINT custom_pages_slug_key UNIQUE (slug);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: facility_reports facility_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_reports
    ADD CONSTRAINT facility_reports_pkey PRIMARY KEY (id);


--
-- Name: facility_reports facility_reports_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_reports
    ADD CONSTRAINT facility_reports_ticket_number_key UNIQUE (ticket_number);


--
-- Name: feeding_schedules feeding_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feeding_schedules
    ADD CONSTRAINT feeding_schedules_pkey PRIMARY KEY (id);


--
-- Name: gps_pois gps_pois_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gps_pois
    ADD CONSTRAINT gps_pois_pkey PRIMARY KEY (id);


--
-- Name: hero_banner hero_banner_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hero_banner
    ADD CONSTRAINT hero_banner_pkey PRIMARY KEY (id);


--
-- Name: jdih_documents jdih_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jdih_documents
    ADD CONSTRAINT jdih_documents_pkey PRIMARY KEY (id);


--
-- Name: media_gallery media_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_gallery
    ADD CONSTRAINT media_gallery_pkey PRIMARY KEY (id);


--
-- Name: navbar_items navbar_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.navbar_items
    ADD CONSTRAINT navbar_items_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: organization_memberships organization_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_memberships
    ADD CONSTRAINT organization_memberships_pkey PRIMARY KEY (id);


--
-- Name: page_views page_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_views
    ADD CONSTRAINT page_views_pkey PRIMARY KEY (id);


--
-- Name: plants plants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (username);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: service_availability service_availability_date_program_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_availability
    ADD CONSTRAINT service_availability_date_program_type_key UNIQUE (date, program_type);


--
-- Name: service_availability service_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_availability
    ADD CONSTRAINT service_availability_pkey PRIMARY KEY (id);


--
-- Name: service_faqs service_faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_faqs
    ADD CONSTRAINT service_faqs_pkey PRIMARY KEY (id);


--
-- Name: service_registrations service_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_registrations
    ADD CONSTRAINT service_registrations_pkey PRIMARY KEY (id);


--
-- Name: service_registrations service_registrations_tracking_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_registrations
    ADD CONSTRAINT service_registrations_tracking_code_key UNIQUE (tracking_code);


--
-- Name: service_settings service_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_settings
    ADD CONSTRAINT service_settings_pkey PRIMARY KEY (id);


--
-- Name: service_standards service_standards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_standards
    ADD CONSTRAINT service_standards_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: system_configs system_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_configs
    ADD CONSTRAINT system_configs_pkey PRIMARY KEY (key);


--
-- Name: ticket_content ticket_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_content
    ADD CONSTRAINT ticket_content_pkey PRIMARY KEY (id);


--
-- Name: ticket_settings ticket_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_settings
    ADD CONSTRAINT ticket_settings_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: tour_bookings tour_bookings_booking_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_bookings
    ADD CONSTRAINT tour_bookings_booking_code_key UNIQUE (booking_code);


--
-- Name: tour_bookings tour_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_bookings
    ADD CONSTRAINT tour_bookings_pkey PRIMARY KEY (id);


--
-- Name: tour_gallery tour_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_gallery
    ADD CONSTRAINT tour_gallery_pkey PRIMARY KEY (id);


--
-- Name: tour_guide_schedules tour_guide_schedules_guide_id_date_start_time_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_guide_schedules
    ADD CONSTRAINT tour_guide_schedules_guide_id_date_start_time_key UNIQUE (guide_id, date, start_time);


--
-- Name: tour_guide_schedules tour_guide_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_guide_schedules
    ADD CONSTRAINT tour_guide_schedules_pkey PRIMARY KEY (id);


--
-- Name: tour_guides tour_guides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_guides
    ADD CONSTRAINT tour_guides_pkey PRIMARY KEY (id);


--
-- Name: tour_packages tour_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_packages
    ADD CONSTRAINT tour_packages_pkey PRIMARY KEY (id);


--
-- Name: tram_route_points tram_route_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tram_route_points
    ADD CONSTRAINT tram_route_points_pkey PRIMARY KEY (id);


--
-- Name: trivia_questions trivia_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trivia_questions
    ADD CONSTRAINT trivia_questions_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_user_id_permission_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_permission_key_key UNIQUE (user_id, permission_key);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: venue_bookings venue_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venue_bookings
    ADD CONSTRAINT venue_bookings_pkey PRIMARY KEY (id);


--
-- Name: venues venues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venues
    ADD CONSTRAINT venues_pkey PRIMARY KEY (id);


--
-- Name: visitor_data visitor_data_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_data
    ADD CONSTRAINT visitor_data_date_key UNIQUE (date);


--
-- Name: visitor_data visitor_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_data
    ADD CONSTRAINT visitor_data_pkey PRIMARY KEY (id);


--
-- Name: wbs_submissions wbs_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wbs_submissions
    ADD CONSTRAINT wbs_submissions_pkey PRIMARY KEY (id);


--
-- Name: whats_new_items whats_new_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whats_new_items
    ADD CONSTRAINT whats_new_items_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_templates whatsapp_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_templates
    ADD CONSTRAINT whatsapp_templates_pkey PRIMARY KEY (id);


--
-- Name: zone_markers zone_markers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zone_markers
    ADD CONSTRAINT zone_markers_pkey PRIMARY KEY (id);


--
-- Name: zoo_history zoo_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zoo_history
    ADD CONSTRAINT zoo_history_pkey PRIMARY KEY (id);


--
-- Name: idx_auth_users_username; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX idx_auth_users_username ON auth.users USING btree (username);


--
-- Name: idx_animals_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_category ON public.animals USING btree (category);


--
-- Name: idx_animals_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_category_id ON public.animals USING btree (category_id);


--
-- Name: idx_animals_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_featured ON public.animals USING btree (is_featured) WHERE (is_featured = true);


--
-- Name: idx_animals_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_published ON public.animals USING btree (is_published);


--
-- Name: idx_animals_zone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_zone ON public.animals USING btree (zone);


--
-- Name: idx_custom_pages_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_pages_published ON public.custom_pages USING btree (is_published);


--
-- Name: idx_custom_pages_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_pages_slug ON public.custom_pages USING btree (slug);


--
-- Name: idx_events_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_date ON public.events USING btree (event_date);


--
-- Name: idx_events_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_type ON public.events USING btree (type);


--
-- Name: idx_facility_reports_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_facility_reports_created ON public.facility_reports USING btree (created_at DESC);


--
-- Name: idx_facility_reports_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_facility_reports_status ON public.facility_reports USING btree (status);


--
-- Name: idx_hero_banner_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_hero_banner_active ON public.hero_banner USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_media_gallery_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_gallery_category ON public.media_gallery USING btree (category);


--
-- Name: idx_media_gallery_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_gallery_created ON public.media_gallery USING btree (created_at DESC);


--
-- Name: idx_navbar_items_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_navbar_items_parent_id ON public.navbar_items USING btree (parent_id);


--
-- Name: idx_news_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_news_category ON public.news USING btree (category);


--
-- Name: idx_news_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_news_created_at ON public.news USING btree (created_at DESC);


--
-- Name: idx_news_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_news_published ON public.news USING btree (is_published);


--
-- Name: idx_page_views_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_page_views_created_at ON public.page_views USING btree (created_at DESC);


--
-- Name: idx_page_views_page_path; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_page_views_page_path ON public.page_views USING btree (page_path);


--
-- Name: idx_page_views_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_page_views_session_id ON public.page_views USING btree (session_id);


--
-- Name: idx_plants_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_plants_category_id ON public.plants USING btree (category_id);


--
-- Name: idx_plants_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_plants_featured ON public.plants USING btree (is_featured) WHERE (is_featured = true);


--
-- Name: idx_plants_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_plants_published ON public.plants USING btree (is_published);


--
-- Name: idx_service_reg_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_reg_created ON public.service_registrations USING btree (created_at DESC);


--
-- Name: idx_service_reg_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_reg_status ON public.service_registrations USING btree (status);


--
-- Name: idx_tickets_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_created_at ON public.tickets USING btree (created_at DESC);


--
-- Name: idx_tickets_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_user_id ON public.tickets USING btree (user_id);


--
-- Name: idx_user_permissions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_permissions_user_id ON public.user_permissions USING btree (user_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: announcements update_announcements_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_registrations update_availability_on_status_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_availability_on_status_change AFTER UPDATE ON public.service_registrations FOR EACH ROW EXECUTE FUNCTION public.update_availability_on_registration();


--
-- Name: books update_books_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: categories update_categories_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: chatbot_faqs update_chatbot_faqs_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_chatbot_faqs_updated_at BEFORE UPDATE ON public.chatbot_faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: custom_pages update_custom_pages_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_custom_pages_updated_at BEFORE UPDATE ON public.custom_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: jdih_documents update_jdih_documents_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_jdih_documents_updated_at BEFORE UPDATE ON public.jdih_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: news update_news_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_availability update_service_availability_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_service_availability_updated_at BEFORE UPDATE ON public.service_availability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_registrations update_service_registrations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_service_registrations_updated_at BEFORE UPDATE ON public.service_registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_standards update_service_standards_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_service_standards_updated_at BEFORE UPDATE ON public.service_standards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tour_bookings update_tour_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tour_bookings_updated_at BEFORE UPDATE ON public.tour_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tour_guides update_tour_guides_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tour_guides_updated_at BEFORE UPDATE ON public.tour_guides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tour_packages update_tour_packages_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tour_packages_updated_at BEFORE UPDATE ON public.tour_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: venues update_venues_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: visitor_data update_visitor_data_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_visitor_data_updated_at BEFORE UPDATE ON public.visitor_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: wbs_submissions update_wbs_submissions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_wbs_submissions_updated_at BEFORE UPDATE ON public.wbs_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: whats_new_items update_whats_new_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_whats_new_items_updated_at BEFORE UPDATE ON public.whats_new_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: whatsapp_templates update_whatsapp_templates_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON public.whatsapp_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: zone_markers update_zone_markers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_zone_markers_updated_at BEFORE UPDATE ON public.zone_markers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: zoo_history update_zoo_history_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_zoo_history_updated_at BEFORE UPDATE ON public.zoo_history FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: animals animals_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: navbar_items navbar_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.navbar_items
    ADD CONSTRAINT navbar_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.navbar_items(id) ON DELETE CASCADE;


--
-- Name: plants plants_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tour_bookings tour_bookings_guide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_bookings
    ADD CONSTRAINT tour_bookings_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES public.tour_guides(id) ON DELETE SET NULL;


--
-- Name: tour_bookings tour_bookings_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_bookings
    ADD CONSTRAINT tour_bookings_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.tour_packages(id) ON DELETE SET NULL;


--
-- Name: tour_guide_schedules tour_guide_schedules_guide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_guide_schedules
    ADD CONSTRAINT tour_guide_schedules_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES public.tour_guides(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: venue_bookings venue_bookings_venue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venue_bookings
    ADD CONSTRAINT venue_bookings_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id) ON DELETE CASCADE;


--
-- Name: wbs_submissions Anyone can submit WBS reports; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can submit WBS reports" ON public.wbs_submissions FOR INSERT WITH CHECK (true);


--
-- Name: service_registrations Anyone can submit service registrations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can submit service registrations" ON public.service_registrations FOR INSERT WITH CHECK (true);


--
-- Name: tour_bookings Anyone can submit tour bookings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can submit tour bookings" ON public.tour_bookings FOR INSERT WITH CHECK (true);


--
-- Name: service_faqs Anyone can view active FAQs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active FAQs" ON public.service_faqs FOR SELECT USING ((is_active = true));


--
-- Name: announcements Anyone can view active announcements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active announcements" ON public.announcements FOR SELECT USING ((is_active = true));


--
-- Name: categories Anyone can view active categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING ((is_active = true));


--
-- Name: chatbot_faqs Anyone can view active chatbot FAQs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active chatbot FAQs" ON public.chatbot_faqs FOR SELECT USING ((is_active = true));


--
-- Name: tour_gallery Anyone can view active gallery; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active gallery" ON public.tour_gallery FOR SELECT USING ((is_active = true));


--
-- Name: navbar_items Anyone can view active navbar items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active navbar items" ON public.navbar_items FOR SELECT USING ((is_active = true));


--
-- Name: organization_memberships Anyone can view active organization memberships; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active organization memberships" ON public.organization_memberships FOR SELECT USING ((is_active = true));


--
-- Name: service_standards Anyone can view active service standards; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active service standards" ON public.service_standards FOR SELECT USING ((is_active = true));


--
-- Name: whatsapp_templates Anyone can view active templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active templates" ON public.whatsapp_templates FOR SELECT USING ((is_active = true));


--
-- Name: ticket_content Anyone can view active ticket content; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active ticket content" ON public.ticket_content FOR SELECT USING ((is_active = true));


--
-- Name: tour_guides Anyone can view active tour guides; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active tour guides" ON public.tour_guides FOR SELECT USING ((is_active = true));


--
-- Name: tour_packages Anyone can view active tour packages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active tour packages" ON public.tour_packages FOR SELECT USING ((is_active = true));


--
-- Name: whats_new_items Anyone can view active whats new items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active whats new items" ON public.whats_new_items FOR SELECT USING ((is_active = true));


--
-- Name: tour_guide_schedules Anyone can view available schedules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view available schedules" ON public.tour_guide_schedules FOR SELECT USING ((is_available = true));


--
-- Name: tour_bookings Anyone can view booking by code; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view booking by code" ON public.tour_bookings FOR SELECT USING (true);


--
-- Name: hero_banner Anyone can view hero banners; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view hero banners" ON public.hero_banner FOR SELECT USING (true);


--
-- Name: plants Anyone can view plants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view plants" ON public.plants FOR SELECT USING (true);


--
-- Name: jdih_documents Anyone can view published JDIH documents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view published JDIH documents" ON public.jdih_documents FOR SELECT USING ((is_published = true));


--
-- Name: books Anyone can view published books; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view published books" ON public.books FOR SELECT USING ((is_published = true));


--
-- Name: custom_pages Anyone can view published custom pages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view published custom pages" ON public.custom_pages FOR SELECT USING ((is_published = true));


--
-- Name: zoo_history Anyone can view published history; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view published history" ON public.zoo_history FOR SELECT USING ((is_published = true));


--
-- Name: news Anyone can view published news; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view published news" ON public.news FOR SELECT USING ((is_published = true));


--
-- Name: service_registrations Anyone can view registration by tracking code; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view registration by tracking code" ON public.service_registrations FOR SELECT USING (true);


--
-- Name: service_availability Anyone can view service availability; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view service availability" ON public.service_availability FOR SELECT USING (true);


--
-- Name: service_settings Anyone can view service settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view service settings" ON public.service_settings FOR SELECT USING (true);


--
-- Name: ticket_settings Anyone can view ticket settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view ticket settings" ON public.ticket_settings FOR SELECT USING (true);


--
-- Name: venues Anyone can view venues; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view venues" ON public.venues FOR SELECT USING (true);


--
-- Name: zone_markers Anyone can view zone markers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view zone markers" ON public.zone_markers FOR SELECT USING (true);


--
-- Name: system_configs Enable all access for all users on system_configs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all access for all users on system_configs" ON public.system_configs USING (true) WITH CHECK (true);


--
-- Name: trivia_questions Enable all access for all users on trivia_questions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all access for all users on trivia_questions" ON public.trivia_questions USING (true) WITH CHECK (true);


--
-- Name: system_configs Enable read access for all users on system_configs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users on system_configs" ON public.system_configs FOR SELECT USING (true);


--
-- Name: trivia_questions Enable read access for all users on trivia_questions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users on trivia_questions" ON public.trivia_questions FOR SELECT USING (true);


--
-- Name: feeding_schedules Public read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public read access" ON public.feeding_schedules FOR SELECT USING (true);


--
-- Name: audit_logs System insert audit logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "System insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (false);


--
-- Name: page_views Validated page views insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Validated page views insert" ON public.page_views FOR INSERT WITH CHECK (((page_path IS NOT NULL) AND (page_path ~ '^/'::text) AND (length(page_path) <= 500) AND ((page_title IS NULL) OR (length(page_title) <= 200)) AND ((referrer IS NULL) OR (length(referrer) <= 1000))));


--
-- Name: analytics_daily; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;

--
-- Name: animals; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

--
-- Name: announcements; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: books; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: chatbot_faqs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chatbot_faqs ENABLE ROW LEVEL SECURITY;

--
-- Name: custom_pages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: feeding_schedules; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.feeding_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: hero_banner; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.hero_banner ENABLE ROW LEVEL SECURITY;

--
-- Name: jdih_documents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.jdih_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: navbar_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.navbar_items ENABLE ROW LEVEL SECURITY;

--
-- Name: news; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

--
-- Name: organization_memberships; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;

--
-- Name: page_views; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

--
-- Name: plants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

--
-- Name: service_availability; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.service_availability ENABLE ROW LEVEL SECURITY;

--
-- Name: service_faqs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.service_faqs ENABLE ROW LEVEL SECURITY;

--
-- Name: service_registrations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.service_registrations ENABLE ROW LEVEL SECURITY;

--
-- Name: service_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.service_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: service_standards; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.service_standards ENABLE ROW LEVEL SECURITY;

--
-- Name: system_configs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: ticket_content; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ticket_content ENABLE ROW LEVEL SECURITY;

--
-- Name: ticket_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ticket_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: tour_bookings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tour_bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: tour_gallery; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tour_gallery ENABLE ROW LEVEL SECURITY;

--
-- Name: tour_guide_schedules; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tour_guide_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: tour_guides; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tour_guides ENABLE ROW LEVEL SECURITY;

--
-- Name: tour_packages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tour_packages ENABLE ROW LEVEL SECURITY;

--
-- Name: trivia_questions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.trivia_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: venues; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

--
-- Name: visitor_data; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.visitor_data ENABLE ROW LEVEL SECURITY;

--
-- Name: wbs_submissions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wbs_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: whats_new_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.whats_new_items ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_templates; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: zone_markers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.zone_markers ENABLE ROW LEVEL SECURITY;

--
-- Name: zoo_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.zoo_history ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict EhkdpXuXeGJ42Odpag7eKXrjM3AFdWKCE3q1I4R1epBTeWD3phgAAJvc0Gj3wtE

