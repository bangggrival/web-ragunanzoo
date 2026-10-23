--
-- PostgreSQL database dump
--

\restrict FS6Jmb6Dk5d2ssT4TabZfPOQH13LjMfL093GuWo69u12hPk0MeqsdRS8RShQZOd

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

DROP POLICY "Validated page views insert" ON public.page_views;
DROP POLICY "System insert audit logs" ON public.audit_logs;
DROP POLICY "Public read access" ON public.feeding_schedules;
DROP POLICY "Enable read access for all users on trivia_questions" ON public.trivia_questions;
DROP POLICY "Enable read access for all users on system_configs" ON public.system_configs;
DROP POLICY "Enable all access for all users on trivia_questions" ON public.trivia_questions;
DROP POLICY "Enable all access for all users on system_configs" ON public.system_configs;
DROP POLICY "Anyone can view zone markers" ON public.zone_markers;
DROP POLICY "Anyone can view venues" ON public.venues;
DROP POLICY "Anyone can view ticket settings" ON public.ticket_settings;
DROP POLICY "Anyone can view service settings" ON public.service_settings;
DROP POLICY "Anyone can view service availability" ON public.service_availability;
DROP POLICY "Anyone can view registration by tracking code" ON public.service_registrations;
DROP POLICY "Anyone can view published news" ON public.news;
DROP POLICY "Anyone can view published history" ON public.zoo_history;
DROP POLICY "Anyone can view published custom pages" ON public.custom_pages;
DROP POLICY "Anyone can view published books" ON public.books;
DROP POLICY "Anyone can view published JDIH documents" ON public.jdih_documents;
DROP POLICY "Anyone can view plants" ON public.plants;
DROP POLICY "Anyone can view hero banners" ON public.hero_banner;
DROP POLICY "Anyone can view booking by code" ON public.tour_bookings;
DROP POLICY "Anyone can view available schedules" ON public.tour_guide_schedules;
DROP POLICY "Anyone can view active whats new items" ON public.whats_new_items;
DROP POLICY "Anyone can view active tour packages" ON public.tour_packages;
DROP POLICY "Anyone can view active tour guides" ON public.tour_guides;
DROP POLICY "Anyone can view active ticket content" ON public.ticket_content;
DROP POLICY "Anyone can view active templates" ON public.whatsapp_templates;
DROP POLICY "Anyone can view active service standards" ON public.service_standards;
DROP POLICY "Anyone can view active organization memberships" ON public.organization_memberships;
DROP POLICY "Anyone can view active navbar items" ON public.navbar_items;
DROP POLICY "Anyone can view active gallery" ON public.tour_gallery;
DROP POLICY "Anyone can view active chatbot FAQs" ON public.chatbot_faqs;
DROP POLICY "Anyone can view active categories" ON public.categories;
DROP POLICY "Anyone can view active announcements" ON public.announcements;
DROP POLICY "Anyone can view active FAQs" ON public.service_faqs;
DROP POLICY "Anyone can submit tour bookings" ON public.tour_bookings;
DROP POLICY "Anyone can submit service registrations" ON public.service_registrations;
DROP POLICY "Anyone can submit WBS reports" ON public.wbs_submissions;
ALTER TABLE ONLY public.venue_bookings DROP CONSTRAINT venue_bookings_venue_id_fkey;
ALTER TABLE ONLY public.user_roles DROP CONSTRAINT user_roles_user_id_fkey;
ALTER TABLE ONLY public.user_permissions DROP CONSTRAINT user_permissions_user_id_fkey;
ALTER TABLE ONLY public.tour_guide_schedules DROP CONSTRAINT tour_guide_schedules_guide_id_fkey;
ALTER TABLE ONLY public.tour_bookings DROP CONSTRAINT tour_bookings_package_id_fkey;
ALTER TABLE ONLY public.tour_bookings DROP CONSTRAINT tour_bookings_guide_id_fkey;
ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_id_fkey;
ALTER TABLE ONLY public.plants DROP CONSTRAINT plants_category_id_fkey;
ALTER TABLE ONLY public.navbar_items DROP CONSTRAINT navbar_items_parent_id_fkey;
ALTER TABLE ONLY public.animals DROP CONSTRAINT animals_category_id_fkey;
DROP TRIGGER update_zoo_history_updated_at ON public.zoo_history;
DROP TRIGGER update_zone_markers_updated_at ON public.zone_markers;
DROP TRIGGER update_whatsapp_templates_updated_at ON public.whatsapp_templates;
DROP TRIGGER update_whats_new_items_updated_at ON public.whats_new_items;
DROP TRIGGER update_wbs_submissions_updated_at ON public.wbs_submissions;
DROP TRIGGER update_visitor_data_updated_at ON public.visitor_data;
DROP TRIGGER update_venues_updated_at ON public.venues;
DROP TRIGGER update_tour_packages_updated_at ON public.tour_packages;
DROP TRIGGER update_tour_guides_updated_at ON public.tour_guides;
DROP TRIGGER update_tour_bookings_updated_at ON public.tour_bookings;
DROP TRIGGER update_service_standards_updated_at ON public.service_standards;
DROP TRIGGER update_service_registrations_updated_at ON public.service_registrations;
DROP TRIGGER update_service_availability_updated_at ON public.service_availability;
DROP TRIGGER update_news_updated_at ON public.news;
DROP TRIGGER update_jdih_documents_updated_at ON public.jdih_documents;
DROP TRIGGER update_custom_pages_updated_at ON public.custom_pages;
DROP TRIGGER update_chatbot_faqs_updated_at ON public.chatbot_faqs;
DROP TRIGGER update_categories_updated_at ON public.categories;
DROP TRIGGER update_books_updated_at ON public.books;
DROP TRIGGER update_availability_on_status_change ON public.service_registrations;
DROP TRIGGER update_announcements_updated_at ON public.announcements;
DROP INDEX public.idx_visitor_traffic_created_at;
DROP INDEX public.idx_visitor_traffic_coords;
DROP INDEX public.idx_user_roles_user_id;
DROP INDEX public.idx_user_permissions_user_id;
DROP INDEX public.idx_tickets_user_id;
DROP INDEX public.idx_tickets_created_at;
DROP INDEX public.idx_service_reg_status;
DROP INDEX public.idx_service_reg_created;
DROP INDEX public.idx_plants_published;
DROP INDEX public.idx_plants_featured;
DROP INDEX public.idx_plants_category_id;
DROP INDEX public.idx_page_views_session_id;
DROP INDEX public.idx_page_views_page_path;
DROP INDEX public.idx_page_views_created_at;
DROP INDEX public.idx_news_published;
DROP INDEX public.idx_news_created_at;
DROP INDEX public.idx_news_category;
DROP INDEX public.idx_navbar_items_parent_id;
DROP INDEX public.idx_media_gallery_created;
DROP INDEX public.idx_media_gallery_category;
DROP INDEX public.idx_hero_banner_active;
DROP INDEX public.idx_facility_reports_status;
DROP INDEX public.idx_facility_reports_created;
DROP INDEX public.idx_events_type;
DROP INDEX public.idx_events_date;
DROP INDEX public.idx_custom_pages_slug;
DROP INDEX public.idx_custom_pages_published;
DROP INDEX public.idx_animals_zone;
DROP INDEX public.idx_animals_published;
DROP INDEX public.idx_animals_featured;
DROP INDEX public.idx_animals_category_id;
DROP INDEX public.idx_animals_category;
DROP INDEX auth.idx_auth_users_username;
ALTER TABLE ONLY public.zoo_history DROP CONSTRAINT zoo_history_pkey;
ALTER TABLE ONLY public.zone_markers DROP CONSTRAINT zone_markers_pkey;
ALTER TABLE ONLY public.whatsapp_templates DROP CONSTRAINT whatsapp_templates_pkey;
ALTER TABLE ONLY public.whats_new_items DROP CONSTRAINT whats_new_items_pkey;
ALTER TABLE ONLY public.wbs_submissions DROP CONSTRAINT wbs_submissions_pkey;
ALTER TABLE ONLY public.visitor_traffic_logs DROP CONSTRAINT visitor_traffic_logs_pkey;
ALTER TABLE ONLY public.visitor_data DROP CONSTRAINT visitor_data_pkey;
ALTER TABLE ONLY public.visitor_data DROP CONSTRAINT visitor_data_date_key;
ALTER TABLE ONLY public.venues DROP CONSTRAINT venues_pkey;
ALTER TABLE ONLY public.venue_bookings DROP CONSTRAINT venue_bookings_pkey;
ALTER TABLE ONLY public.user_roles DROP CONSTRAINT user_roles_user_id_role_key;
ALTER TABLE ONLY public.user_roles DROP CONSTRAINT user_roles_pkey;
ALTER TABLE ONLY public.user_permissions DROP CONSTRAINT user_permissions_user_id_permission_key_key;
ALTER TABLE ONLY public.user_permissions DROP CONSTRAINT user_permissions_pkey;
ALTER TABLE ONLY public.trivia_questions DROP CONSTRAINT trivia_questions_pkey;
ALTER TABLE ONLY public.tram_route_points DROP CONSTRAINT tram_route_points_pkey;
ALTER TABLE ONLY public.tour_packages DROP CONSTRAINT tour_packages_pkey;
ALTER TABLE ONLY public.tour_guides DROP CONSTRAINT tour_guides_pkey;
ALTER TABLE ONLY public.tour_guide_schedules DROP CONSTRAINT tour_guide_schedules_pkey;
ALTER TABLE ONLY public.tour_guide_schedules DROP CONSTRAINT tour_guide_schedules_guide_id_date_start_time_key;
ALTER TABLE ONLY public.tour_gallery DROP CONSTRAINT tour_gallery_pkey;
ALTER TABLE ONLY public.tour_bookings DROP CONSTRAINT tour_bookings_pkey;
ALTER TABLE ONLY public.tour_bookings DROP CONSTRAINT tour_bookings_booking_code_key;
ALTER TABLE ONLY public.tickets DROP CONSTRAINT tickets_pkey;
ALTER TABLE ONLY public.ticket_settings DROP CONSTRAINT ticket_settings_pkey;
ALTER TABLE ONLY public.ticket_content DROP CONSTRAINT ticket_content_pkey;
ALTER TABLE ONLY public.system_configs DROP CONSTRAINT system_configs_pkey;
ALTER TABLE ONLY public.site_settings DROP CONSTRAINT site_settings_pkey;
ALTER TABLE ONLY public.service_standards DROP CONSTRAINT service_standards_pkey;
ALTER TABLE ONLY public.service_settings DROP CONSTRAINT service_settings_pkey;
ALTER TABLE ONLY public.service_registrations DROP CONSTRAINT service_registrations_tracking_code_key;
ALTER TABLE ONLY public.service_registrations DROP CONSTRAINT service_registrations_pkey;
ALTER TABLE ONLY public.service_faqs DROP CONSTRAINT service_faqs_pkey;
ALTER TABLE ONLY public.service_availability DROP CONSTRAINT service_availability_pkey;
ALTER TABLE ONLY public.service_availability DROP CONSTRAINT service_availability_date_program_type_key;
ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_pkey;
ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_email_key;
ALTER TABLE ONLY public.plants DROP CONSTRAINT plants_pkey;
ALTER TABLE ONLY public.page_views DROP CONSTRAINT page_views_pkey;
ALTER TABLE ONLY public.organization_memberships DROP CONSTRAINT organization_memberships_pkey;
ALTER TABLE ONLY public.news DROP CONSTRAINT news_pkey;
ALTER TABLE ONLY public.navbar_items DROP CONSTRAINT navbar_items_pkey;
ALTER TABLE ONLY public.media_gallery DROP CONSTRAINT media_gallery_pkey;
ALTER TABLE ONLY public.jdih_documents DROP CONSTRAINT jdih_documents_pkey;
ALTER TABLE ONLY public.hero_banner DROP CONSTRAINT hero_banner_pkey;
ALTER TABLE ONLY public.gps_pois DROP CONSTRAINT gps_pois_pkey;
ALTER TABLE ONLY public.feeding_schedules DROP CONSTRAINT feeding_schedules_pkey;
ALTER TABLE ONLY public.facility_reports DROP CONSTRAINT facility_reports_ticket_number_key;
ALTER TABLE ONLY public.facility_reports DROP CONSTRAINT facility_reports_pkey;
ALTER TABLE ONLY public.events DROP CONSTRAINT events_pkey;
ALTER TABLE ONLY public.custom_pages DROP CONSTRAINT custom_pages_slug_key;
ALTER TABLE ONLY public.custom_pages DROP CONSTRAINT custom_pages_pkey;
ALTER TABLE ONLY public.chatbot_faqs DROP CONSTRAINT chatbot_faqs_pkey;
ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pkey;
ALTER TABLE ONLY public.books DROP CONSTRAINT books_pkey;
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT audit_logs_pkey;
ALTER TABLE ONLY public.announcements DROP CONSTRAINT announcements_pkey;
ALTER TABLE ONLY public.animals DROP CONSTRAINT animals_pkey;
ALTER TABLE ONLY public.analytics_daily DROP CONSTRAINT analytics_daily_pkey;
ALTER TABLE ONLY public.analytics_daily DROP CONSTRAINT analytics_daily_date_key;
ALTER TABLE ONLY auth.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY auth.users DROP CONSTRAINT users_email_key;
ALTER TABLE public.visitor_traffic_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.visitor_data ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.venues ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.tram_route_points ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.plants ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.news ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.hero_banner ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.announcements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.animals ALTER COLUMN id DROP DEFAULT;
DROP TABLE public.zoo_history;
DROP TABLE public.zone_markers;
DROP TABLE public.whatsapp_templates;
DROP TABLE public.whats_new_items;
DROP TABLE public.wbs_submissions;
DROP SEQUENCE public.visitor_traffic_logs_id_seq;
DROP TABLE public.visitor_traffic_logs;
DROP SEQUENCE public.visitor_data_id_seq;
DROP TABLE public.visitor_data;
DROP SEQUENCE public.venues_id_seq;
DROP TABLE public.venues;
DROP TABLE public.venue_bookings;
DROP TABLE public.user_roles;
DROP TABLE public.user_permissions;
DROP TABLE public.trivia_questions;
DROP SEQUENCE public.tram_route_points_id_seq;
DROP TABLE public.tram_route_points;
DROP TABLE public.tour_packages;
DROP TABLE public.tour_guides;
DROP TABLE public.tour_guide_schedules;
DROP TABLE public.tour_gallery;
DROP TABLE public.tour_bookings;
DROP TABLE public.tickets;
DROP TABLE public.ticket_settings;
DROP TABLE public.ticket_content;
DROP TABLE public.system_configs;
DROP TABLE public.site_settings;
DROP TABLE public.service_standards;
DROP TABLE public.service_settings;
DROP TABLE public.service_registrations;
DROP TABLE public.service_faqs;
DROP TABLE public.service_availability;
DROP TABLE public.profiles;
DROP SEQUENCE public.plants_id_seq;
DROP TABLE public.plants;
DROP TABLE public.page_views;
DROP TABLE public.organization_memberships;
DROP SEQUENCE public.news_id_seq;
DROP TABLE public.news;
DROP TABLE public.navbar_items;
DROP TABLE public.media_gallery;
DROP TABLE public.jdih_documents;
DROP SEQUENCE public.hero_banner_id_seq;
DROP TABLE public.hero_banner;
DROP TABLE public.gps_pois;
DROP TABLE public.feeding_schedules;
DROP TABLE public.facility_reports;
DROP SEQUENCE public.events_id_seq;
DROP TABLE public.events;
DROP TABLE public.custom_pages;
DROP TABLE public.chatbot_faqs;
DROP TABLE public.categories;
DROP TABLE public.books;
DROP TABLE public.audit_logs;
DROP SEQUENCE public.announcements_id_seq;
DROP TABLE public.announcements;
DROP SEQUENCE public.animals_id_seq;
DROP TABLE public.animals;
DROP TABLE public.analytics_daily;
DROP TABLE auth.users;
DROP FUNCTION public.update_updated_at_column();
DROP FUNCTION public.update_last_activity();
DROP FUNCTION public.update_availability_on_registration();
DROP FUNCTION public.simulate_payment_webhook(p_purchase_id uuid, p_amount integer);
DROP FUNCTION public.log_sensitive_action();
DROP FUNCTION public.increment_book_view_count(book_id uuid);
DROP FUNCTION public.increment_book_download_count(book_id uuid);
DROP FUNCTION public.handle_new_user();
DROP FUNCTION public.generate_ticket_code();
DROP FUNCTION public.cleanup_old_page_views();
DROP FUNCTION auth.uid();
DROP TYPE public.app_role;
DROP EXTENSION "uuid-ossp";
DROP EXTENSION pgcrypto;
DROP SCHEMA auth;
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
-- Name: visitor_traffic_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitor_traffic_logs (
    id integer NOT NULL,
    source_type character varying(50) NOT NULL,
    poi_id character varying(100),
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    intensity double precision DEFAULT 0.8,
    zone_name character varying(150),
    device_fingerprint character varying(128),
    ip_address character varying(45),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.visitor_traffic_logs OWNER TO postgres;

--
-- Name: visitor_traffic_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.visitor_traffic_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.visitor_traffic_logs_id_seq OWNER TO postgres;

--
-- Name: visitor_traffic_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.visitor_traffic_logs_id_seq OWNED BY public.visitor_traffic_logs.id;


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
-- Name: visitor_traffic_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_traffic_logs ALTER COLUMN id SET DEFAULT nextval('public.visitor_traffic_logs_id_seq'::regclass);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.users (id, username, password_hash, raw_user_meta_data, created_at) FROM stdin;
ca06f5e1-881f-4179-b600-4a48ff473786	admin_kp3	$2a$10$xoSR.7L7ZzZnivsjCFQQaO4KxLO/jz9/EtCMeYidi143qBiNJtRxm	{"name": "Admin KP3"}	2026-08-05 16:06:15.797871+07
a7db1c17-a0a8-4fdf-afe6-85c6042eb561	admin_rival	$2a$12$OY2iVZhwpn.1Yyn07L7Fh.AcCT13nIhEUXhTOyMEgeUgoeQRpb8Ba	{"name": "Admin Rival"}	2026-08-01 09:20:43.916683+07
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
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, title, content, is_active, created_at, updated_at, title_id, title_en, content_id, content_en, image_url) FROM stdin;
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
3	Feeding Time Gajah Sumatera	Saksikan langsung proses pemberian makan Gajah Sumatera oleh tim keeper berpengalaman. Program edukasi ini terbuka untuk semua pengunjung.	2026-08-10	10:00 - 11:00	\N	Kandang Gajah	Edukasi	2026-08-05 15:07:58.14351+07	Feeding Time Gajah Sumatera	Sumatran Elephant Feeding Time	Saksikan langsung proses pemberian makan Gajah Sumatera oleh tim keeper berpengalaman. Program edukasi ini terbuka untuk semua pengunjung.	Watch the feeding of Sumatran Elephants live by experienced keepers. This educational program is open to all visitors.	https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop&q=80	t
4	Workshop Fotografi Satwa Liar	Bergabunglah dengan fotografer profesional untuk belajar teknik terbaik memotret satwa liar di Kebun Binatang Ragunan.	2026-08-23	08:00 - 12:00	\N	Gerbang Utama - Area Meeting Point	Workshop	2026-08-05 15:07:58.14351+07	Workshop Fotografi Satwa Liar	Wildlife Photography Workshop	Bergabunglah dengan fotografer profesional untuk belajar teknik terbaik memotret satwa liar di Kebun Binatang Ragunan.	Join professional photographers to learn the best techniques for photographing wildlife at Ragunan Zoo.	https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80	t
5	Program Adopsi Satwa Ragunan	Daftarkan diri Anda dalam program adopsi simbolis satwa Ragunan. Kontribusi Anda langsung mendukung perawatan dan program konservasi satwa.	2026-08-01	09:00 - 16:00	\N	Kantor Administrasi Ragunan	Program	2026-08-05 15:07:58.14351+07	Program Adopsi Satwa Ragunan	Ragunan Animal Adoption Program	Daftarkan diri Anda dalam program adopsi simbolis satwa Ragunan. Kontribusi Anda langsung mendukung perawatan dan program konservasi satwa.	Register for Ragunan's symbolic animal adoption program. Your contribution directly supports animal care and conservation programs.	https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&auto=format&fit=crop&q=80	t
2	Festival Satwa Liar Ragunan 2026	Festival tahunan yang merayakan keanekaragaman hayati Indonesia dengan pertunjukan satwa, edukasi konservasi, dan pameran foto satwa liar.	2026-09-15	09:00 - 17:00	\N	Area Amphitheater Ragunan	Festival	2026-08-05 15:07:58.14351+07	Festival Satwa Liar Ragunan 2026	Ragunan Wildlife Festival 2026	Festival tahunan yang merayakan keanekaragaman hayati Indonesia dengan pertunjukan satwa, edukasi konservasi, dan pameran foto satwa liar.	Annual festival celebrating Indonesian biodiversity with animal shows, conservation education, and wildlife photo exhibitions.	https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80	t
6	Konser Alam: Musik dan Satwa	Nikmati pertunjukan musik akustik di tengah alam terbuka Ragunan dengan pemandangan satwa yang memukau.	2026-09-05	18:00 - 21:00	\N	Taman Gajah Ragunan	Konser	2026-08-05 15:07:58.14351+07	Konser Alam: Musik dan Satwa	Nature Concert: Music and Wildlife	Nikmati pertunjukan musik akustik di tengah alam terbuka Ragunan dengan pemandangan satwa yang memukau.	Enjoy acoustic music performances in the open nature of Ragunan with stunning wildlife views.	https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80	t
\.


--
-- Data for Name: facility_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facility_reports (id, ticket_number, reporter_name, is_anonymous, category, description, location_name, latitude, longitude, image_url, status, admin_notes, created_at, updated_at) FROM stdin;
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
gajah_sumatera	Gajah Sumatera	Sumatran Elephant	animal	-6.3125	106.8232	#388e3c	🐘	Kandang gajah sumatera luas terbuka dengan panggung observasi kanopi teduh bertingkat dan kolam mandi alami.	\N	t	f	\N	\N	14.00 WIB	14	0	Atraksi Mandi & Pemberian Makan Gajah	\N	\N	normal	\N	\N	Elephas maximus sumatranus	Kritis Terancam Punah (CR)	\N	\N	10	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
harimau_sumatera	Harimau Sumatera	Sumatran Tiger	animal	-6.3155	106.8208	#e65100	🐅	Habitat replika hutan hujan lebat dengan selokan air dan bebatuan alami untuk melatih naluri berburu.	\N	t	f	\N	\N	11.30 WIB	11	30	Pemberian Pakan Daging Segar Predator	\N	\N	normal	\N	\N	Panthera tigris sumatrae	Kritis Terancam Punah (CR)	\N	\N	20	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
schmutzer_primata	Pusat Primata Schmutzer (Gorila & Orangutan)	Schmutzer Primate Center	animal	-6.3138	106.8175	#f57c00	🦍	Salah satu pusat konservasi primata termodern di dunia dengan area open-enclosure alami dan jembatan kanopi.	\N	t	f	\N	\N	13.30 WIB	13	30	Enrichment Buah & Sayuran Gorila	\N	\N	normal	\N	\N	Gorilla gorilla & Pongo pygmaeus	Kritis Terancam Punah (CR)	\N	\N	30	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
komodo	Komodo & Taman Reptil	Komodo & Reptile Garden	animal	-6.3115	106.817	#6a1b9a	🦎	Zona reptil terlengkap dengan terarium kaca, kandang pasir savana komodo, serta koleksi ular piton raksasa.	\N	t	f	\N	\N	10.30 WIB	10	30	Atraksi Berburu Komodo (Rabu & Minggu)	\N	\N	normal	\N	\N	Varanus komodoensis	Genteng (EN)	\N	\N	40	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
jerapah	Jerapah & Zebra Savana	Giraffe & Zebra Savanna	animal	-6.3102	106.8222	#2e7d32	🦒	Padang rumput terbuka dengan pohon rindang tempat bermain keluarga jerapah bersanding dengan zebra.	\N	t	f	\N	\N	15.00 WIB	15	0	Pemberian Makan Panggung Leher Tinggi	\N	\N	normal	\N	\N	Giraffa camelopardalis	Rentan (VU)	\N	\N	50	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
beruang_madu	Beruang Madu	Sun Bear	animal	-6.3145	106.8222	#5d4037	🐻	Habitat tebing kayu dengan kolam pemandian khusus beruang madu Kalimantan.	\N	t	f	\N	\N	09.30 WIB	9	30	Pemberian Madu & Sarang Lebah Alami	\N	\N	normal	\N	\N	Helarctos malayanus	Rentan (VU)	\N	\N	60	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
singa_afrika	Singa Afrika	African Lion	animal	-6.3158	106.8195	#f9a825	🦁	Savana terbuka dengan tebing batu alam tempat singa jantan berteriak sambut pengunjung.	\N	t	f	\N	\N	12.00 WIB	12	0	Pemberian Daging Segar Singa	\N	\N	normal	\N	\N	Panthera leo	Rentan (VU)	\N	\N	70	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
kuda_nil	Kuda Nil & Kolam Renang	Hippopotamus Pool	animal	-6.3172	106.8225	#0277bd	🦛	Kolam raksasa transparan dengan panel kaca bawah air untuk menyaksikan kuda nil berenang.	\N	t	f	\N	\N	11.00 WIB	11	0	Pemberian Sayuran & Rumput Segar	\N	\N	normal	\N	\N	Hippopotamus amphibius	Rentan (VU)	\N	\N	80	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
buaya	Buaya Muara & Taman Air	Saltwater Crocodile	animal	-6.311	106.8185	#33691e	🐊	Kolam buaya muara raksasa terbuka dengan pagar pengaman berlapis ganda.	\N	t	f	\N	\N	10.00 WIB	10	0	Pemberian Ikan Utuh (Rabu & Sabtu)	\N	\N	normal	\N	\N	Crocodylus porosus	Rentang Luas	\N	\N	90	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
orangutan	Orangutan Sumatera & Kalimantan	Orangutan House	animal	-6.3128	106.8168	#bf360c	🦧	Rumah orangutan dengan tali dan pohon panjat alami untuk enrichment harian.	\N	t	f	\N	\N	10.00 WIB	10	0	Enrichment Buah Hutan Segar	\N	\N	normal	\N	\N	Pongo pygmaeus	Kritis Terancam Punah (CR)	\N	\N	100	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
elang_jawa	Elang Jawa & Kandang Aviarium	Javan Hawk-Eagle Aviary	animal	-6.3096	106.8238	#1565c0	🦅	Aviarium megabesar dengan kondisi hutan mini untuk burung-burung raptor endemik Indonesia.	\N	t	f	\N	\N	08.00 WIB	8	0	Pemberian Tikus & Daging Mentah	\N	\N	normal	\N	\N	Nisaetus bartelsi	Kritis Terancam Punah (CR)	\N	\N	110	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
taman_satwa_anak	Taman Satwa Anak & Akuarium	Children Animal Park	animal	-6.3075	106.8235	#0097a7	🐇	Area rekreasi ramah keluarga dengan akuarium Arapaima gigas, panggung satwa jinak, dan wahana anak.	\N	t	f	\N	\N	Sepanjang Hari	9	0	Wahana Interaksi & Memberi Makan Kelinci/Kambing	\N	\N	normal	\N	\N	\N	\N	\N	\N	120	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
tapir	Kandang Tapir Belang	Malayan Tapir	animal	-6.3142	106.8242	#37474f	🦡	Area rindang berkanopi pohon beringin dengan kubangan air bersih tempat tapir suka berkubang.	\N	t	f	\N	\N	10.15 WIB	10	15	Pemberian Sayur & Buah Segar	\N	\N	normal	\N	\N	Tapirus indicus	Genteng (EN)	\N	\N	130	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
pintu_utara	Pintu Masuk Utama (Pintu Utara)	Main Entrance (North)	ticket	-6.3045	106.8198	#013a13	🚪	Pintu masuk gerbang utama Ragunan, terhubung dengan Halte TransJakarta dan loket JakCard.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	200	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
pintu_barat	Pintu Masuk Barat	West Entrance	ticket	-6.3105	106.813	#013a13	🚪	Pintu masuk sisi barat (Jl. Kav Polri), dekat area parkir dan loket JakCard.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	210	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
pintu_timur	Pintu Masuk Timur	East Entrance	ticket	-6.3132	106.8272	#013a13	🚪	Pintu masuk koridor timur rindang, akses nyaman pejalan kaki.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	220	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
pintu_selatan	Pintu Masuk Selatan	South Entrance	ticket	-6.3195	106.8235	#013a13	🚪	Pintu gerbang selatan Ragunan dekat akses TB Simatupang.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	230	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
toilet_utara	Toilet & Laktasi Plaza Utara	Restroom & Nursing (North)	toilet	-6.306	106.8205	#00838f	🚻	Toilet bersih modern, ramah difabel, wastafel otomatis, dan ruang menyusui.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	300	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
toilet_danau	Toilet & Wastafel Danau Pelikan	Restroom (Pelican Lake)	toilet	-6.3094	106.8195	#00838f	🚻	Toilet umum berkapasitas besar di pinggir danau.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	310	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
toilet_schmutzer	Toilet Difabel & Laktasi Schmutzer	Accessible Restroom (Schmutzer)	toilet	-6.314	106.8168	#00838f	🚻	Fasilitas sanitasi berstandar internasional ramah anak di gerbang Schmutzer.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	320	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
toilet_gajah	Toilet Koridor Gajah & Mamalia	Restroom (Elephant Corridor)	toilet	-6.312	106.8242	#00838f	🚻	Toilet umum berkanopi bambu di sebelah panggung observasi gajah.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	330	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
toilet_selatan	Toilet Paviliun Rimba Selatan	Restroom (South Jungle)	toilet	-6.3175	106.8218	#00838f	🚻	Toilet umum dekat koridor harimau dan kuda nil.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	340	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
musholla_utama	Masjid Al-Falah & Tempat Wudhu	Al-Falah Mosque	musholla	-6.307	106.8192	#2e7d32	🕌	Masjid utama ber-AC dengan perlengkapan sholat lengkap dan tempat wudhu terpisah.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	400	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
musholla_schmutzer	Musholla Paviliun Primata	Prayer Room (Schmutzer)	musholla	-6.313	106.8165	#2e7d32	🕌	Musholla asri di dekat pintu keluar Pusat Primata Schmutzer.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	410	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
musholla_timur	Musholla Rindang Koridor Timur	Prayer Room (East Corridor)	musholla	-6.3135	106.8258	#2e7d32	🕌	Musholla kayu rindang di bawah naungan pohon trembesi.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	420	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
foodcourt_danau	Pujasera Danau Ragunan	Lake Food Court	kuliner	-6.3082	106.8188	#ef6c00	🍜	Sentra kuliner: es kelapa muda, soto betawi, pecel ayam, dan aneka jajanan khas Jakarta.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	500	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
foodcourt_schmutzer	Kafe Rindang Primata	Primate Café	kuliner	-6.3125	106.818	#ef6c00	☕	Kafe santai: kopi nusantara, gelato buah segar, dan roti bakar dengan pemandangan kanopi.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	510	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
foodcourt_gajah	Kios Kuliner & Minuman Segar Gajah	Elephant Food Kiosk	kuliner	-6.3118	106.822	#ef6c00	🧃	Stand aneka minuman dingin, es krim, kentang goreng, dan air kelapa hijau.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	520	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
halte_kereta_utara	Halte Kereta Keliling 1 (Plaza Utama)	Tram Stop 1 (Main Plaza)	tram	-6.3062	106.8195	#1565c0	🚋	Titik awal naik kereta wisata keliling dengan tarif Rp 10.000/orang.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	600	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
halte_kereta_danau	Halte Kereta Keliling 2 (Danau Pelikan)	Tram Stop 2 (Pelican Lake)	tram	-6.309	106.8214	#1565c0	🚋	Halte transit kereta wisata dekat area danau dan panggung satwa anak.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	610	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
halte_kereta_gajah	Halte Kereta Keliling 3 (Gajah Sumatera)	Tram Stop 3 (Elephant)	tram	-6.3115	106.824	#1565c0	🚋	Halte pemberhentian bagi pengunjung yang ingin menyaksikan atraksi mandi gajah.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	620	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
halte_kereta_harimau	Halte Kereta Keliling 4 (Karnivora Rimba)	Tram Stop 4 (Carnivore)	tram	-6.316	106.8215	#1565c0	🚋	Halte transit selatan dekat kandang harimau sumatera dan beruang madu.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	630	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
pos_medis_p3k	Pos Medis & P3K Ragunan	Medical Post & First Aid	medical	-6.3065	106.821	#c62828	🏥	Posko darurat medis dengan tenaga perawat siap siaga, kotak P3K lengkap, oksigen, dan ambulans siaga.	\N	t	f	\N	\N	\N	\N	\N	\N	\N	\N	normal	\N	\N	\N	\N	\N	\N	700	2026-10-23 14:26:58.232929+07	2026-10-23 14:26:58.232929+07
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
48c19189-6d28-4534-a589-58857956aca7	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	1792729701777-qwi99ef16m	\N	\N	desktop	Chrome	\N	2026-10-23 13:21:48.868071+07
f665fa92-cc9b-47a0-9665-2bbc9dd16b92	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	1792729701777-qwi99ef16m	\N	\N	desktop	Chrome	\N	2026-10-23 13:26:03.872042+07
5e5d9a88-1bef-412b-bd25-7b301e5e43dc	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	1792729701777-qwi99ef16m	\N	\N	desktop	Chrome	\N	2026-10-23 13:31:03.550009+07
2c877ac5-e603-4e66-a877-c6ce61ec0cf3	/fauna	Koleksi Satwa (Fauna) - Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	1792729701777-qwi99ef16m	\N	\N	desktop	Chrome	\N	2026-10-23 13:33:33.873155+07
07a0073c-e4ef-4e7c-8cf8-043f8ccdbbc5	/fauna	Koleksi Satwa (Fauna) | Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	1792729701777-qwi99ef16m	\N	\N	desktop	Chrome	\N	2026-10-23 13:33:38.263576+07
3acb34c4-385f-4797-95db-796f89af1e8f	/fauna	Koleksi Satwa (Fauna) - Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	1792729701777-qwi99ef16m	\N	\N	desktop	Chrome	\N	2026-10-23 13:33:56.650727+07
f7b3be84-2c2b-463a-890d-8f3784e7ea09	/fauna	Koleksi Satwa (Fauna) - Taman Margasatwa Ragunan	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	1792729701777-qwi99ef16m	\N	\N	desktop	Chrome	\N	2026-10-23 13:42:02.592959+07
35eca769-df47-4074-adb2-dc75cba84a9a	/	Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif	http://localhost:3000/manager/plants	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	1792737892022-5n188gk19sq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-23 13:44:53.29697+07
139a3c62-dcb3-4c35-a2f8-b9c85976fe44	/fauna	Koleksi Satwa (Fauna) | Taman Margasatwa Ragunan	http://localhost:3000/manager/plants	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	1792737892022-5n188gk19sq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-23 13:45:00.041088+07
c6408767-616f-4059-b1b0-46321b9000fb	/flora	Koleksi Flora & Tumbuhan | Taman Margasatwa Ragunan	http://localhost:3000/manager/plants	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	1792737892022-5n188gk19sq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-23 13:45:03.4353+07
0383fd43-618b-4529-b3fd-9a279cf28739	/flora	Koleksi Flora & Tumbuhan - Taman Margasatwa Ragunan	http://localhost:3000/flora	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	1792737892022-5n188gk19sq	a7db1c17-a0a8-4fdf-afe6-85c6042eb561	\N	desktop	Chrome	\N	2026-10-23 13:55:44.594866+07
\.


--
-- Data for Name: plants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plants (id, name, latin_name, species, zone, category, category_en, category_id, location, habitat, description, status, health_status, image_url, is_featured, latitude, longitude, created_at, is_published, name_en, description_en, habitat_en) FROM stdin;
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
16	1	-6.3062	106.8195	Halte 1 - Plaza Masuk Utara	t	t	2026-10-23 14:26:58.232929+07
17	2	-6.3075	106.821	\N	f	t	2026-10-23 14:26:58.232929+07
18	3	-6.309	106.8214	Halte 2 - Danau Pelikan	t	t	2026-10-23 14:26:58.232929+07
19	4	-6.31	106.8228	\N	f	t	2026-10-23 14:26:58.232929+07
20	5	-6.3115	106.824	Halte 3 - Gajah Sumatera	t	t	2026-10-23 14:26:58.232929+07
21	6	-6.313	106.825	\N	f	t	2026-10-23 14:26:58.232929+07
22	7	-6.3148	106.8238	\N	f	t	2026-10-23 14:26:58.232929+07
23	8	-6.316	106.8215	Halte 4 - Karnivora Rimba Selatan	t	t	2026-10-23 14:26:58.232929+07
24	9	-6.3165	106.8195	\N	f	t	2026-10-23 14:26:58.232929+07
25	10	-6.315	106.8182	\N	f	t	2026-10-23 14:26:58.232929+07
26	11	-6.3135	106.8172	\N	f	t	2026-10-23 14:26:58.232929+07
27	12	-6.3115	106.8168	\N	f	t	2026-10-23 14:26:58.232929+07
28	13	-6.3095	106.818	\N	f	t	2026-10-23 14:26:58.232929+07
29	14	-6.3078	106.8188	\N	f	t	2026-10-23 14:26:58.232929+07
30	15	-6.3062	106.8195	\N	f	t	2026-10-23 14:26:58.232929+07
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
\.


--
-- Data for Name: venues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.venues (id, name, description, capacity, price_per_hour, price_per_day, image_url, facilities, is_available, created_at, updated_at, image_urls, phone_number, whatsapp_number, panorama_url, has_panorama) FROM stdin;
\.


--
-- Data for Name: visitor_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitor_data (id, date, jumlah_pengunjung, jumlah_kendaraan, pengunjung_wahana, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: visitor_traffic_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitor_traffic_logs (id, source_type, poi_id, latitude, longitude, intensity, zone_name, device_fingerprint, ip_address, created_at) FROM stdin;
1	checkin	schmutzer_primata	-6.313888	106.81769	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 11:39:01.296+07
2	route_search	schmutzer_primata	-6.313714	106.817624	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 11:12:24.674+07
3	facility_report	schmutzer_primata	-6.313856	106.817483	0.86	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:50:00.468+07
4	checkin	schmutzer_primata	-6.314068	106.817724	0.92	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 13:51:56.924+07
5	checkin	schmutzer_primata	-6.313742	106.817769	0.89	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:45:52.206+07
6	route_search	schmutzer_primata	-6.314028	106.817567	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 13:41:48.783+07
7	checkin	schmutzer_primata	-6.313714	106.817439	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:13:27.292+07
8	route_search	schmutzer_primata	-6.31367	106.81727	0.88	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:59:58.777+07
9	facility_report	schmutzer_primata	-6.313535	106.817206	0.99	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:57:07.357+07
10	checkin	schmutzer_primata	-6.313646	106.817666	0.9	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 11:56:26.445+07
11	checkin	schmutzer_primata	-6.313823	106.817368	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 11:37:47.525+07
12	route_search	schmutzer_primata	-6.313789	106.81748	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:16:33.426+07
13	facility_report	schmutzer_primata	-6.31382	106.817773	0.91	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 11:44:12.714+07
14	route_search	schmutzer_primata	-6.313889	106.817608	0.95	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 14:17:10.456+07
15	checkin	schmutzer_primata	-6.31354	106.817302	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 13:53:52.065+07
16	checkin	schmutzer_primata	-6.313573	106.817502	0.83	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:51:10.521+07
17	checkin	schmutzer_primata	-6.313937	106.817237	0.98	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:48:07.204+07
18	route_search	schmutzer_primata	-6.313932	106.817682	0.92	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:27:30.554+07
19	facility_report	schmutzer_primata	-6.313604	106.817364	0.99	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 11:01:23.054+07
20	checkin	schmutzer_primata	-6.313679	106.81755	0.91	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 11:59:59.931+07
21	facility_report	schmutzer_primata	-6.313952	106.817251	0.95	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:33:52.377+07
22	checkin	schmutzer_primata	-6.314013	106.817439	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 13:06:16.591+07
23	route_search	schmutzer_primata	-6.313941	106.817572	0.92	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 13:13:40.73+07
24	checkin	schmutzer_primata	-6.313961	106.817466	0.99	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:06:43.004+07
25	facility_report	schmutzer_primata	-6.313542	106.817713	0.89	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:02:14.821+07
26	route_search	schmutzer_primata	-6.313704	106.817674	0.89	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 14:00:56.148+07
27	facility_report	schmutzer_primata	-6.314055	106.81765	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 14:27:43.522+07
28	checkin	schmutzer_primata	-6.314075	106.817346	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:14:41.624+07
29	facility_report	schmutzer_primata	-6.314019	106.817735	0.98	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:04:59.997+07
30	checkin	schmutzer_primata	-6.313812	106.817577	0.92	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:52:05.664+07
31	facility_report	schmutzer_primata	-6.313522	106.81746	0.83	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 14:36:20.234+07
32	checkin	schmutzer_primata	-6.31358	106.817703	0.87	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 14:42:01.353+07
33	route_search	schmutzer_primata	-6.313628	106.817341	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 14:41:15.707+07
34	facility_report	schmutzer_primata	-6.313723	106.817713	0.83	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 13:18:35.8+07
35	checkin	schmutzer_primata	-6.313925	106.817509	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 13:46:07.542+07
36	checkin	schmutzer_primata	-6.314061	106.817239	0.9	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:25:17.549+07
37	facility_report	schmutzer_primata	-6.313626	106.817648	0.92	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 11:43:48.819+07
38	checkin	schmutzer_primata	-6.313717	106.8175	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:02:05.358+07
39	route_search	schmutzer_primata	-6.313519	106.817697	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:02:30.569+07
40	checkin	schmutzer_primata	-6.314014	106.817466	0.96	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 14:16:20.98+07
41	facility_report	schmutzer_primata	-6.313876	106.81775	1	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 10:53:35.832+07
42	facility_report	schmutzer_primata	-6.313949	106.817235	0.88	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 13:14:06.666+07
43	route_search	schmutzer_primata	-6.314056	106.817387	0.97	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 14:37:12.116+07
44	checkin	schmutzer_primata	-6.31403	106.81729	0.94	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 13:00:08.206+07
45	route_search	schmutzer_primata	-6.313579	106.817327	0.9	Pusat Primata Schmutzer	simulation_seed	127.0.0.1	2026-10-23 12:49:03.732+07
46	checkin	gajah_sumatera	-6.312619	106.8235	0.95	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 13:20:46.681+07
47	route_search	gajah_sumatera	-6.312777	106.823016	0.92	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 12:25:49.838+07
48	checkin	gajah_sumatera	-6.312305	106.823371	0.83	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 11:38:57.836+07
49	facility_report	gajah_sumatera	-6.312291	106.822938	0.93	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 13:20:14.466+07
50	route_search	gajah_sumatera	-6.312684	106.823184	0.9	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 11:56:14.052+07
51	facility_report	gajah_sumatera	-6.312245	106.823015	0.89	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 12:27:08.213+07
52	route_search	gajah_sumatera	-6.312492	106.823326	0.97	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 10:49:19.844+07
53	route_search	gajah_sumatera	-6.312571	106.823174	0.83	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 11:28:57.294+07
54	checkin	gajah_sumatera	-6.312312	106.823415	0.73	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 12:34:19.357+07
55	checkin	gajah_sumatera	-6.312304	106.823194	0.89	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 14:24:34.322+07
56	checkin	gajah_sumatera	-6.31261	106.823048	0.75	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 11:08:45.972+07
57	checkin	gajah_sumatera	-6.312707	106.823332	0.8	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 14:31:15.789+07
58	checkin	gajah_sumatera	-6.312557	106.823404	0.8	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 13:29:22.28+07
59	checkin	gajah_sumatera	-6.312377	106.823136	0.78	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 11:16:17.664+07
60	checkin	gajah_sumatera	-6.312774	106.823433	0.78	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 13:48:10.678+07
61	checkin	gajah_sumatera	-6.312267	106.82293	0.83	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 13:29:59.376+07
62	checkin	gajah_sumatera	-6.312338	106.823113	0.87	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 13:00:57.354+07
63	route_search	gajah_sumatera	-6.312694	106.822948	0.83	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 11:04:38.496+07
64	facility_report	gajah_sumatera	-6.312722	106.823357	0.74	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 10:51:29.091+07
65	facility_report	gajah_sumatera	-6.312409	106.823303	0.74	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 10:58:46.071+07
66	checkin	gajah_sumatera	-6.312442	106.823181	0.88	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 14:21:07.155+07
67	route_search	gajah_sumatera	-6.312746	106.823182	0.96	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 13:08:07.49+07
68	route_search	gajah_sumatera	-6.312453	106.823119	0.89	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 11:52:20.872+07
69	checkin	gajah_sumatera	-6.312459	106.82322	0.89	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 14:30:47.368+07
70	facility_report	gajah_sumatera	-6.312608	106.823476	0.93	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 14:40:15.83+07
71	checkin	gajah_sumatera	-6.312276	106.823298	0.73	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 13:06:46.472+07
72	route_search	gajah_sumatera	-6.312552	106.822948	0.8	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 12:17:52.12+07
73	checkin	gajah_sumatera	-6.312619	106.823447	0.73	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 14:36:53.956+07
74	facility_report	gajah_sumatera	-6.312598	106.823471	0.75	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 11:00:57.329+07
75	facility_report	gajah_sumatera	-6.312455	106.823181	0.97	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 11:31:15.444+07
76	checkin	gajah_sumatera	-6.312675	106.823313	0.87	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 14:13:28.528+07
77	checkin	gajah_sumatera	-6.312714	106.823273	0.83	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 13:52:48.716+07
78	checkin	gajah_sumatera	-6.312462	106.823292	0.84	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 13:58:32.374+07
79	facility_report	gajah_sumatera	-6.312274	106.822936	0.94	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 12:07:04.923+07
80	route_search	gajah_sumatera	-6.31253	106.822976	0.81	Kandang Gajah Sumatera	simulation_seed	127.0.0.1	2026-10-23 14:19:15.485+07
81	checkin	harimau_sumatera	-6.315701	106.82059	0.68	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 14:10:41.873+07
82	facility_report	harimau_sumatera	-6.315326	106.820654	0.65	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 10:49:53.576+07
83	checkin	harimau_sumatera	-6.315499	106.82099	0.65	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 13:37:42.43+07
84	route_search	harimau_sumatera	-6.31535	106.82076	0.83	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 11:21:40.128+07
85	checkin	harimau_sumatera	-6.315503	106.820727	0.78	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 12:13:04.287+07
86	route_search	harimau_sumatera	-6.315537	106.821041	0.87	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 11:15:53.932+07
87	route_search	harimau_sumatera	-6.315392	106.82078	0.69	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 11:27:31.319+07
88	route_search	harimau_sumatera	-6.31526	106.820837	0.79	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 13:47:57.048+07
89	checkin	harimau_sumatera	-6.315294	106.820578	0.85	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 12:52:02.491+07
90	checkin	harimau_sumatera	-6.315797	106.820798	0.87	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 11:23:32.678+07
91	facility_report	harimau_sumatera	-6.315283	106.820904	0.68	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 11:11:23.573+07
92	route_search	harimau_sumatera	-6.315414	106.82093	0.83	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 10:57:30.635+07
93	checkin	harimau_sumatera	-6.315362	106.820679	0.73	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 13:57:47.169+07
94	facility_report	harimau_sumatera	-6.315576	106.820589	0.79	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 13:56:59.25+07
95	route_search	harimau_sumatera	-6.315253	106.820788	0.76	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 14:20:01.18+07
96	checkin	harimau_sumatera	-6.31567	106.820764	0.63	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 11:04:11.375+07
97	facility_report	harimau_sumatera	-6.315797	106.820718	0.68	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 12:12:08.955+07
98	checkin	harimau_sumatera	-6.315372	106.820755	0.75	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 12:18:36.473+07
99	checkin	harimau_sumatera	-6.31531	106.820537	0.72	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 12:36:13.204+07
100	route_search	harimau_sumatera	-6.315493	106.820668	0.81	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 12:14:32.843+07
101	checkin	harimau_sumatera	-6.315757	106.820792	0.72	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 14:15:36.235+07
102	checkin	harimau_sumatera	-6.315614	106.82096	0.79	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 14:23:59.833+07
103	checkin	harimau_sumatera	-6.315793	106.820964	0.64	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 11:06:15.856+07
104	checkin	harimau_sumatera	-6.315483	106.82077	0.86	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 11:14:34.005+07
105	facility_report	harimau_sumatera	-6.315281	106.820753	0.7	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 14:39:19.767+07
106	checkin	harimau_sumatera	-6.315491	106.820867	0.81	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 14:32:20.49+07
107	checkin	harimau_sumatera	-6.315723	106.820815	0.73	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 12:46:46.117+07
108	facility_report	harimau_sumatera	-6.315617	106.820712	0.7	Harimau & Singa	simulation_seed	127.0.0.1	2026-10-23 11:53:47.171+07
109	checkin	pintu_barat	-6.308458	106.819105	0.8	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 10:57:07.081+07
110	checkin	pintu_barat	-6.308351	106.818869	0.75	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 11:04:52.658+07
111	checkin	pintu_barat	-6.3086	106.818877	0.81	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 11:11:28.27+07
112	route_search	pintu_barat	-6.308546	106.819157	0.79	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 13:41:19.691+07
113	facility_report	pintu_barat	-6.308742	106.819085	0.7	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 14:08:06.752+07
114	checkin	pintu_barat	-6.30844	106.819044	0.8	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 13:07:43.126+07
115	checkin	pintu_barat	-6.30863	106.81908	0.8	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 12:34:27.871+07
116	route_search	pintu_barat	-6.308553	106.819128	0.92	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 14:43:09.109+07
117	facility_report	pintu_barat	-6.308686	106.819047	0.69	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 14:10:26.296+07
118	route_search	pintu_barat	-6.308269	106.819285	0.9	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 14:23:41.57+07
119	checkin	pintu_barat	-6.308321	106.818743	0.71	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 11:29:59.576+07
120	checkin	pintu_barat	-6.308306	106.818874	0.78	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 12:43:55.272+07
121	checkin	pintu_barat	-6.308604	106.818709	0.9	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 11:23:04.383+07
122	facility_report	pintu_barat	-6.308534	106.818983	0.75	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 13:43:26.773+07
123	checkin	pintu_barat	-6.308247	106.81909	0.89	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 12:01:46.003+07
124	checkin	pintu_barat	-6.308445	106.819194	0.92	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 14:16:47.416+07
125	route_search	pintu_barat	-6.308681	106.818887	0.71	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 11:57:49.88+07
126	checkin	pintu_barat	-6.308365	106.819037	0.72	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 10:57:57.242+07
127	route_search	pintu_barat	-6.308259	106.819075	0.87	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 12:31:08.348+07
128	facility_report	pintu_barat	-6.308617	106.819013	0.79	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 14:42:53.959+07
129	checkin	pintu_barat	-6.308246	106.819161	0.7	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 11:48:37.775+07
130	route_search	pintu_barat	-6.308637	106.819036	0.88	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 11:55:10.047+07
131	checkin	pintu_barat	-6.308251	106.818927	0.68	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 13:49:46.841+07
132	checkin	pintu_barat	-6.308785	106.818932	0.9	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 12:18:25.664+07
133	checkin	pintu_barat	-6.308449	106.818741	0.74	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 13:48:14.415+07
134	route_search	pintu_barat	-6.308247	106.819235	0.86	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 14:23:07.334+07
135	facility_report	pintu_barat	-6.308482	106.819057	0.72	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 11:53:55.156+07
136	route_search	pintu_barat	-6.308344	106.818876	0.79	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 11:00:57.775+07
137	checkin	pintu_barat	-6.308728	106.81874	0.86	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 14:35:36.604+07
138	checkin	pintu_barat	-6.308592	106.81896	0.91	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 12:31:43.628+07
139	checkin	pintu_barat	-6.308369	106.818968	0.68	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 13:27:50.666+07
140	checkin	pintu_barat	-6.308746	106.819015	0.87	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 12:56:57.181+07
141	route_search	pintu_barat	-6.308215	106.818977	0.69	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 12:43:54.425+07
142	facility_report	pintu_barat	-6.30871	106.818768	0.91	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 11:32:11.396+07
143	facility_report	pintu_barat	-6.308609	106.819242	0.88	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 11:32:57.164+07
144	facility_report	pintu_barat	-6.30852	106.818952	0.79	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 12:28:40.613+07
145	checkin	pintu_barat	-6.308767	106.818863	0.7	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 14:07:27.294+07
146	facility_report	pintu_barat	-6.308757	106.819287	0.73	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 13:22:52.628+07
147	route_search	pintu_barat	-6.308561	106.818822	0.89	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 13:57:23.538+07
148	checkin	pintu_barat	-6.308585	106.819089	0.85	Pintu Masuk Barat	simulation_seed	127.0.0.1	2026-10-23 12:45:48.415+07
149	checkin	pintu_timur	-6.311814	106.827379	0.82	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 14:34:58.681+07
150	route_search	pintu_timur	-6.31205	106.827313	0.58	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 12:27:12.472+07
151	facility_report	pintu_timur	-6.311975	106.827477	0.74	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 12:23:58.1+07
152	checkin	pintu_timur	-6.312102	106.82729	0.73	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 11:53:06.842+07
153	checkin	pintu_timur	-6.311721	106.82757	0.75	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 14:38:06.737+07
154	checkin	pintu_timur	-6.311833	106.827537	0.6	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 10:52:39.207+07
155	checkin	pintu_timur	-6.311895	106.827328	0.62	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 14:44:33.31+07
156	route_search	pintu_timur	-6.312127	106.827427	0.8	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 13:39:38.119+07
157	route_search	pintu_timur	-6.312284	106.827352	0.71	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 13:54:07.199+07
158	checkin	pintu_timur	-6.312189	106.827728	0.63	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 13:28:21.839+07
159	checkin	pintu_timur	-6.31189	106.827284	0.59	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 13:16:25.671+07
160	checkin	pintu_timur	-6.312004	106.827724	0.76	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 14:11:37.249+07
161	checkin	pintu_timur	-6.311923	106.827297	0.77	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 14:15:59.664+07
162	route_search	pintu_timur	-6.312259	106.827248	0.63	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 14:06:18.895+07
163	checkin	pintu_timur	-6.311812	106.827283	0.79	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 11:42:52.972+07
164	checkin	pintu_timur	-6.312255	106.82774	0.64	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 11:35:39.776+07
165	checkin	pintu_timur	-6.31198	106.827665	0.58	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 12:39:13.582+07
166	checkin	pintu_timur	-6.311877	106.827696	0.58	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 11:41:12.694+07
167	checkin	pintu_timur	-6.311987	106.827272	0.67	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 13:53:57.918+07
168	checkin	pintu_timur	-6.311889	106.827225	0.77	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 14:10:46.107+07
169	facility_report	pintu_timur	-6.312244	106.827272	0.64	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 11:32:46.703+07
170	route_search	pintu_timur	-6.311887	106.827389	0.61	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 11:44:16.997+07
171	route_search	pintu_timur	-6.311811	106.827211	0.71	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 13:32:15.206+07
172	checkin	pintu_timur	-6.312241	106.827572	0.77	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 14:20:06.93+07
173	route_search	pintu_timur	-6.312254	106.827657	0.68	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 12:05:12.404+07
174	route_search	pintu_timur	-6.312213	106.827619	0.61	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 12:54:33.959+07
175	checkin	pintu_timur	-6.311867	106.827309	0.8	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 14:15:46.464+07
176	checkin	pintu_timur	-6.311707	106.827746	0.63	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 11:11:26.78+07
177	facility_report	pintu_timur	-6.31229	106.827789	0.58	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 13:04:46.755+07
178	facility_report	pintu_timur	-6.311989	106.827679	0.72	Pintu Masuk Timur & Loket	simulation_seed	127.0.0.1	2026-10-23 14:45:15.225+07
179	checkin	jerapah	-6.310067	106.822299	0.77	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 14:17:48.608+07
180	checkin	jerapah	-6.310398	106.821936	0.76	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 11:07:22.237+07
181	checkin	jerapah	-6.310436	106.822222	0.64	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 12:07:22.352+07
182	checkin	jerapah	-6.31031	106.822257	0.59	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 11:46:23.565+07
183	checkin	jerapah	-6.310167	106.822177	0.76	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 13:54:50.744+07
184	checkin	jerapah	-6.310297	106.822159	0.6	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 13:47:31.776+07
185	checkin	jerapah	-6.310098	106.822442	0.76	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 11:46:48.878+07
186	checkin	jerapah	-6.309995	106.822241	0.64	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 11:55:25.868+07
187	facility_report	jerapah	-6.310267	106.822278	0.54	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 12:53:29.899+07
188	facility_report	jerapah	-6.310305	106.822355	0.71	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 11:24:05.706+07
189	checkin	jerapah	-6.310398	106.821984	0.73	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 13:00:59.716+07
190	checkin	jerapah	-6.310469	106.822386	0.56	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 11:47:54.714+07
191	facility_report	jerapah	-6.310243	106.822453	0.65	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 11:50:56.394+07
192	checkin	jerapah	-6.310455	106.822123	0.72	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 13:54:41.482+07
193	checkin	jerapah	-6.310235	106.821948	0.6	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 14:23:03.73+07
194	facility_report	jerapah	-6.310243	106.822217	0.56	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 13:05:14.839+07
195	route_search	jerapah	-6.309919	106.822068	0.73	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 11:00:18.024+07
196	facility_report	jerapah	-6.310013	106.821946	0.68	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 14:35:15.709+07
197	route_search	jerapah	-6.310339	106.822444	0.59	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 12:10:10.991+07
198	route_search	jerapah	-6.310382	106.822354	0.53	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 13:01:53.16+07
199	checkin	jerapah	-6.310209	106.822071	0.74	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 11:54:06.484+07
200	checkin	jerapah	-6.310057	106.822172	0.65	Jerapah & Savana	simulation_seed	127.0.0.1	2026-10-23 11:43:09.432+07
201	checkin	foodcourt_schmutzer	-6.312524	106.817965	0.89	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 11:08:58.076+07
202	checkin	foodcourt_schmutzer	-6.312466	106.817956	0.73	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 14:36:33.019+07
203	checkin	foodcourt_schmutzer	-6.312694	106.817744	0.89	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 14:23:08.324+07
204	facility_report	foodcourt_schmutzer	-6.312658	106.818212	0.76	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 12:16:03.275+07
205	route_search	foodcourt_schmutzer	-6.312232	106.818216	0.85	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 14:43:10.66+07
206	facility_report	foodcourt_schmutzer	-6.312635	106.818282	0.78	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 11:46:21.164+07
207	route_search	foodcourt_schmutzer	-6.312676	106.817781	0.93	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 13:49:20.879+07
208	checkin	foodcourt_schmutzer	-6.312703	106.817735	0.9	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 12:09:01.905+07
209	facility_report	foodcourt_schmutzer	-6.312488	106.818087	0.86	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 14:22:25.138+07
210	checkin	foodcourt_schmutzer	-6.312238	106.818286	0.89	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 12:13:42.367+07
211	checkin	foodcourt_schmutzer	-6.312454	106.818131	0.83	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 12:46:47.175+07
212	checkin	foodcourt_schmutzer	-6.312274	106.817727	0.84	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 11:10:56.182+07
213	facility_report	foodcourt_schmutzer	-6.312538	106.818054	0.91	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 11:22:35.573+07
214	checkin	foodcourt_schmutzer	-6.312368	106.818232	0.91	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 11:57:59.577+07
215	checkin	foodcourt_schmutzer	-6.312407	106.817898	0.79	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 14:03:48.68+07
216	checkin	foodcourt_schmutzer	-6.312251	106.818035	0.8	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 11:31:37.683+07
217	checkin	foodcourt_schmutzer	-6.312218	106.817901	0.85	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 11:43:07.591+07
218	route_search	foodcourt_schmutzer	-6.312655	106.818174	0.77	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 11:16:13.978+07
219	checkin	foodcourt_schmutzer	-6.312422	106.818288	0.97	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 13:52:39.169+07
220	checkin	foodcourt_schmutzer	-6.312396	106.817717	0.81	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 13:34:55.909+07
221	checkin	foodcourt_schmutzer	-6.312436	106.817909	0.75	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 14:35:36.693+07
222	facility_report	foodcourt_schmutzer	-6.312709	106.817869	0.79	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 12:49:35.654+07
223	checkin	foodcourt_schmutzer	-6.312661	106.818137	0.89	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 14:05:16.673+07
224	route_search	foodcourt_schmutzer	-6.312659	106.818207	0.96	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 13:20:37.903+07
225	route_search	foodcourt_schmutzer	-6.312539	106.81815	0.84	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 11:46:25.373+07
226	checkin	foodcourt_schmutzer	-6.312437	106.818251	0.96	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 11:35:27.02+07
227	checkin	foodcourt_schmutzer	-6.312524	106.818272	0.85	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 14:17:40.43+07
228	checkin	foodcourt_schmutzer	-6.312299	106.817968	0.79	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 12:55:38.27+07
229	checkin	foodcourt_schmutzer	-6.312619	106.817954	0.96	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 13:25:46.867+07
230	route_search	foodcourt_schmutzer	-6.312795	106.818226	0.86	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 11:38:28.266+07
231	checkin	foodcourt_schmutzer	-6.312293	106.817953	0.91	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 12:17:04.427+07
232	facility_report	foodcourt_schmutzer	-6.312226	106.818191	0.91	Area Pujasera & Kuliner	simulation_seed	127.0.0.1	2026-10-23 11:25:36.738+07
233	checkin	danau	-6.31465	106.824753	0.46	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 12:45:09.499+07
234	checkin	danau	-6.314562	106.824283	0.5	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 14:16:22.085+07
235	facility_report	danau	-6.315054	106.824415	0.48	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 10:54:53.112+07
236	checkin	danau	-6.314716	106.824329	0.54	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 12:41:30.293+07
237	checkin	danau	-6.31505	106.824697	0.53	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 10:58:26.513+07
238	route_search	danau	-6.314538	106.824594	0.51	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 14:08:09.493+07
239	facility_report	danau	-6.314982	106.824516	0.44	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 13:37:23.016+07
240	checkin	danau	-6.314716	106.824686	0.4	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 14:19:04.958+07
241	checkin	danau	-6.31507	106.824759	0.49	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 14:23:16.925+07
242	checkin	danau	-6.314726	106.824716	0.48	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 12:16:11.475+07
243	route_search	danau	-6.315048	106.82442	0.52	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 12:04:22.906+07
244	checkin	danau	-6.314631	106.824339	0.55	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 14:32:31.43+07
245	checkin	danau	-6.314667	106.824765	0.47	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 10:49:40.183+07
246	facility_report	danau	-6.314785	106.824484	0.45	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 13:04:54.517+07
247	route_search	danau	-6.314838	106.824415	0.4	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 12:47:28.553+07
248	checkin	danau	-6.314937	106.82442	0.57	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 11:02:31.677+07
249	checkin	danau	-6.314874	106.824562	0.43	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 13:56:15.481+07
250	checkin	danau	-6.314716	106.82477	0.45	Danau Buatan & Sepeda	simulation_seed	127.0.0.1	2026-10-23 12:47:28.783+07
251	checkin	taman_satwa_anak	-6.307227	106.82332	0.5	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 12:30:41.708+07
252	route_search	taman_satwa_anak	-6.30748	106.823309	0.58	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 14:28:43.184+07
253	checkin	taman_satwa_anak	-6.307352	106.823457	0.69	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 11:01:45.833+07
254	checkin	taman_satwa_anak	-6.307611	106.823583	0.63	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 13:39:46.372+07
255	checkin	taman_satwa_anak	-6.307582	106.823293	0.63	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 13:28:55.775+07
256	checkin	taman_satwa_anak	-6.307795	106.823412	0.7	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 11:49:25.959+07
257	facility_report	taman_satwa_anak	-6.307796	106.82376	0.5	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 11:25:39.092+07
258	route_search	taman_satwa_anak	-6.30744	106.823293	0.53	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 11:35:44.418+07
259	route_search	taman_satwa_anak	-6.30727	106.823573	0.7	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 11:36:47.509+07
260	checkin	taman_satwa_anak	-6.307407	106.823585	0.71	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 10:58:08.894+07
261	facility_report	taman_satwa_anak	-6.307455	106.823722	0.57	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 14:46:42.679+07
262	checkin	taman_satwa_anak	-6.307723	106.823581	0.64	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 13:18:40.854+07
263	checkin	taman_satwa_anak	-6.307417	106.82377	0.69	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 11:24:41.036+07
264	route_search	taman_satwa_anak	-6.307299	106.823408	0.7	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 11:43:40.309+07
265	facility_report	taman_satwa_anak	-6.307652	106.823694	0.66	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 12:04:21.383+07
266	route_search	taman_satwa_anak	-6.307674	106.823394	0.57	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 12:35:48.072+07
267	checkin	taman_satwa_anak	-6.307344	106.823393	0.6	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 12:30:10.172+07
268	route_search	taman_satwa_anak	-6.307797	106.823541	0.48	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 12:28:26.435+07
269	checkin	taman_satwa_anak	-6.307436	106.823233	0.62	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 13:32:49.811+07
270	route_search	taman_satwa_anak	-6.307209	106.823295	0.59	Taman Satwa Anak	simulation_seed	127.0.0.1	2026-10-23 11:43:38.272+07
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

SELECT pg_catalog.setval('public.tram_route_points_id_seq', 30, true);


--
-- Name: venues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.venues_id_seq', 1, true);


--
-- Name: visitor_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visitor_data_id_seq', 1, false);


--
-- Name: visitor_traffic_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visitor_traffic_logs_id_seq', 270, true);


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
-- Name: visitor_traffic_logs visitor_traffic_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_traffic_logs
    ADD CONSTRAINT visitor_traffic_logs_pkey PRIMARY KEY (id);


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
-- Name: idx_visitor_traffic_coords; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_visitor_traffic_coords ON public.visitor_traffic_logs USING btree (latitude, longitude);


--
-- Name: idx_visitor_traffic_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_visitor_traffic_created_at ON public.visitor_traffic_logs USING btree (created_at DESC);


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

\unrestrict FS6Jmb6Dk5d2ssT4TabZfPOQH13LjMfL093GuWo69u12hPk0MeqsdRS8RShQZOd

