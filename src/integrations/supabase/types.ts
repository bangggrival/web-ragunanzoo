export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_daily: {
        Row: {
          created_at: string | null
          date: string
          devices: Json | null
          id: string
          top_pages: Json | null
          total_views: number | null
          unique_sessions: number | null
          unique_users: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          devices?: Json | null
          id?: string
          top_pages?: Json | null
          total_views?: number | null
          unique_sessions?: number | null
          unique_users?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          devices?: Json | null
          id?: string
          top_pages?: Json | null
          total_views?: number | null
          unique_sessions?: number | null
          unique_users?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      animals: {
        Row: {
          audio_url: string | null
          category: string | null
          category_en: string | null
          category_id: string | null
          created_at: string
          description: string | null
          habitat: string | null
          habitat_en: string | null
          health_status: string | null
          id: number
          image_url: string | null
          is_featured: boolean | null
          latin_name: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          model_url: string | null
          name: string
          name_en: string | null
          species: string | null
          status: string | null
          zone: string | null
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          category_en?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          habitat?: string | null
          habitat_en?: string | null
          health_status?: string | null
          id?: number
          image_url?: string | null
          is_featured?: boolean | null
          latin_name?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          model_url?: string | null
          name: string
          species?: string | null
          status?: string | null
          zone?: string | null
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          category_en?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          habitat?: string | null
          habitat_en?: string | null
          health_status?: string | null
          id?: number
          image_url?: string | null
          is_featured?: boolean | null
          latin_name?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          model_url?: string | null
          name?: string
          name_en?: string | null
          species?: string | null
          status?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          content_en: string | null
          content_id: string | null
          created_at: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          title: string
          title_en: string | null
          title_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          content_en?: string | null
          content_id?: string | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          title: string
          title_en?: string | null
          title_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          content_en?: string | null
          content_id?: string | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          title?: string
          title_en?: string | null
          title_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string | null
          category: string
          cover_url: string | null
          created_at: string | null
          description_en: string | null
          description_id: string | null
          download_count: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          page_count: number | null
          title_en: string | null
          title_id: string
          updated_at: string | null
          view_count: number | null
          year_published: number | null
        }
        Insert: {
          author?: string | null
          category?: string
          cover_url?: string | null
          created_at?: string | null
          description_en?: string | null
          description_id?: string | null
          download_count?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          page_count?: number | null
          title_en?: string | null
          title_id: string
          updated_at?: string | null
          view_count?: number | null
          year_published?: number | null
        }
        Update: {
          author?: string | null
          category?: string
          cover_url?: string | null
          created_at?: string | null
          description_en?: string | null
          description_id?: string | null
          download_count?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          page_count?: number | null
          title_en?: string | null
          title_id?: string
          updated_at?: string | null
          view_count?: number | null
          year_published?: number | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_id: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name_en: string | null
          name_id: string
          order_index: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_id?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_en?: string | null
          name_id: string
          order_index?: number | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_id?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_en?: string | null
          name_id?: string
          order_index?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chatbot_faqs: {
        Row: {
          answer_en: string | null
          answer_id: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          order_index: number | null
          question_en: string | null
          question_id: string
          updated_at: string | null
        }
        Insert: {
          answer_en?: string | null
          answer_id: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          order_index?: number | null
          question_en?: string | null
          question_id: string
          updated_at?: string | null
        }
        Update: {
          answer_en?: string | null
          answer_id?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          order_index?: number | null
          question_en?: string | null
          question_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_pages: {
        Row: {
          content_en: string | null
          content_id: string | null
          created_at: string | null
          id: string
          image_urls: string[] | null
          is_published: boolean | null
          navbar_icon: string | null
          order_index: number | null
          show_in_navbar: boolean | null
          slug: string
          title_en: string | null
          title_id: string
          updated_at: string | null
        }
        Insert: {
          content_en?: string | null
          content_id?: string | null
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          is_published?: boolean | null
          navbar_icon?: string | null
          order_index?: number | null
          show_in_navbar?: boolean | null
          slug: string
          title_en?: string | null
          title_id: string
          updated_at?: string | null
        }
        Update: {
          content_en?: string | null
          content_id?: string | null
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          is_published?: boolean | null
          navbar_icon?: string | null
          order_index?: number | null
          show_in_navbar?: boolean | null
          slug?: string
          title_en?: string | null
          title_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          description_id: string | null
          event_date: string | null
          id: number
          image_url: string | null
          location: string | null
          time: string | null
          title: string
          title_en: string | null
          title_id: string | null
          type: string | null
          zone: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_id?: string | null
          event_date?: string | null
          id?: number
          image_url?: string | null
          location?: string | null
          time?: string | null
          title: string
          title_en?: string | null
          title_id?: string | null
          type?: string | null
          zone?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_id?: string | null
          event_date?: string | null
          id?: number
          image_url?: string | null
          location?: string | null
          time?: string | null
          title?: string
          title_en?: string | null
          title_id?: string | null
          type?: string | null
          zone?: string | null
        }
        Relationships: []
      }
      feeding_schedules: {
        Row: {
          id: string
          name_id: string
          name_en: string
          times: string[]
          image_url: string | null
          color: string | null
          is_published: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          name_id: string
          name_en: string
          times?: string[]
          image_url?: string | null
          color?: string | null
          is_published?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          name_id?: string
          name_en?: string
          times?: string[]
          image_url?: string | null
          color?: string | null
          is_published?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
      trivia_questions: {
        Row: {
          id: string
          text_id: string
          text_en: string
          type: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          text_id: string
          text_en: string
          type: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          text_id?: string
          text_en?: string
          type?: string
          category?: string | null
          created_at?: string
        }
        Relationships: []
      }
      system_configs: {
        Row: {
          key: string
          value: any
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: any
          description?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: any
          description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hero_banner: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_id: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          media_type: string | null
          subtitle: string | null
          subtitle_en: string | null
          subtitle_id: string | null
          title: string | null
          title_en: string | null
          title_id: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_id?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          media_type?: string | null
          subtitle?: string | null
          subtitle_en?: string | null
          subtitle_id?: string | null
          title?: string | null
          title_en?: string | null
          title_id?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_id?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          media_type?: string | null
          subtitle?: string | null
          subtitle_en?: string | null
          subtitle_id?: string | null
          title?: string | null
          title_en?: string | null
          title_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      jdih_documents: {
        Row: {
          created_at: string | null
          date_enacted: string | null
          date_promulgated: string | null
          description_en: string | null
          description_id: string | null
          document_number: string
          file_url: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          source_url: string | null
          status: string
          title_en: string | null
          title_id: string
          type: string
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          date_enacted?: string | null
          date_promulgated?: string | null
          description_en?: string | null
          description_id?: string | null
          document_number: string
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          source_url?: string | null
          status?: string
          title_en?: string | null
          title_id: string
          type?: string
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          date_enacted?: string | null
          date_promulgated?: string | null
          description_en?: string | null
          description_id?: string | null
          document_number?: string
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          source_url?: string | null
          status?: string
          title_en?: string | null
          title_id?: string
          type?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      media_gallery: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string | null
          file_size: number | null
          file_url: string
          filename: string
          id: string
          mime_type: string | null
          original_name: string
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string | null
          file_size?: number | null
          file_url: string
          filename: string
          id?: string
          mime_type?: string | null
          original_name: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string | null
          file_size?: number | null
          file_url?: string
          filename?: string
          id?: string
          mime_type?: string | null
          original_name?: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      navbar_items: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_dropdown: boolean | null
          is_system: boolean | null
          label_en: string | null
          label_id: string
          order_index: number | null
          parent_id: string | null
          path: string
          path_en: string | null
          show_in_bottom_nav: boolean | null
          show_in_top_nav: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_dropdown?: boolean | null
          is_system?: boolean | null
          label_en?: string | null
          label_id: string
          order_index?: number | null
          parent_id?: string | null
          path: string
          path_en?: string | null
          show_in_bottom_nav?: boolean | null
          show_in_top_nav?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_dropdown?: boolean | null
          is_system?: boolean | null
          label_en?: string | null
          label_id?: string
          order_index?: number | null
          parent_id?: string | null
          path?: string
          path_en?: string | null
          show_in_bottom_nav?: boolean | null
          show_in_top_nav?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navbar_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navbar_items"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          created_at: string | null
          description: string | null
          description_en: string | null
          description_id: string | null
          id: number
          image_url: string | null
          is_published: boolean | null
          title: string
          title_en: string | null
          title_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          description_id?: string | null
          id?: number
          image_url?: string | null
          is_published?: boolean | null
          title: string
          title_en?: string | null
          title_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          description_id?: string | null
          id?: number
          image_url?: string | null
          is_published?: boolean | null
          title?: string
          title_en?: string | null
          title_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_memberships: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          order_index: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          order_index?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          order_index?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          id: string
          ip_hash: string | null
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      plants: {
        Row: {
          category: string | null
          category_en: string | null
          category_id: string | null
          created_at: string
          description: string | null
          description_en: string | null
          habitat: string | null
          habitat_en: string | null
          health_status: string | null
          id: number
          image_url: string | null
          is_featured: boolean | null
          latin_name: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          name_en: string | null
          species: string | null
          status: string | null
          zone: string | null
        }
        Insert: {
          category?: string | null
          category_en?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          habitat?: string | null
          habitat_en?: string | null
          health_status?: string | null
          id?: number
          image_url?: string | null
          is_featured?: boolean | null
          latin_name?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          name_en?: string | null
          species?: string | null
          status?: string | null
          zone?: string | null
        }
        Update: {
          category?: string | null
          category_en?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          habitat?: string | null
          habitat_en?: string | null
          health_status?: string | null
          id?: number
          image_url?: string | null
          is_featured?: boolean | null
          latin_name?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          name_en?: string | null
          species?: string | null
          status?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plants_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          child_mode: boolean | null
          created_at: string
          email: string | null
          id: string
          last_activity: string | null
          name: string | null
          updated_at: string
        }
        Insert: {
          child_mode?: boolean | null
          created_at?: string
          email?: string | null
          id: string
          last_activity?: string | null
          name?: string | null
          updated_at?: string
        }
        Update: {
          child_mode?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          last_activity?: string | null
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          event_id: number
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: number
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: number
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      service_availability: {
        Row: {
          booked_slots: number
          created_at: string | null
          date: string
          id: string
          is_available: boolean
          max_slots: number
          notes: string | null
          program_type: string
          updated_at: string | null
        }
        Insert: {
          booked_slots?: number
          created_at?: string | null
          date: string
          id?: string
          is_available?: boolean
          max_slots?: number
          notes?: string | null
          program_type: string
          updated_at?: string | null
        }
        Update: {
          booked_slots?: number
          created_at?: string | null
          date?: string
          id?: string
          is_available?: boolean
          max_slots?: number
          notes?: string | null
          program_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_faqs: {
        Row: {
          answer_en: string | null
          answer_id: string
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          question_en: string | null
          question_id: string
          updated_at: string | null
        }
        Insert: {
          answer_en?: string | null
          answer_id: string
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question_en?: string | null
          question_id: string
          updated_at?: string | null
        }
        Update: {
          answer_en?: string | null
          answer_id?: string
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question_en?: string | null
          question_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_registrations: {
        Row: {
          admin_notes: string | null
          cover_letter_url: string | null
          created_at: string | null
          end_date: string
          equipment_used: string | null
          faculty: string | null
          id: string
          institution_address: string | null
          institution_email: string | null
          institution_name: string
          institution_phone: string | null
          interview_date: string | null
          interview_time: string | null
          interview_topic: string | null
          journalist_id_url: string | null
          media_organization: string | null
          participant_count: number | null
          participant_email: string
          participant_name: string
          participant_nim: string | null
          participant_phone: string
          program_type: string
          proposal_url: string | null
          recommendation_letter_url: string | null
          research_title: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          rotation_department: string | null
          start_date: string
          status: string
          student_id_url: string | null
          study_program: string | null
          supervisor_name: string | null
          supervisor_phone: string | null
          target_interviewee: string | null
          tracking_code: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          cover_letter_url?: string | null
          created_at?: string | null
          end_date: string
          equipment_used?: string | null
          faculty?: string | null
          id?: string
          institution_address?: string | null
          institution_email?: string | null
          institution_name: string
          institution_phone?: string | null
          interview_date?: string | null
          interview_time?: string | null
          interview_topic?: string | null
          journalist_id_url?: string | null
          media_organization?: string | null
          participant_count?: number | null
          participant_email: string
          participant_name: string
          participant_nim?: string | null
          participant_phone: string
          program_type: string
          proposal_url?: string | null
          recommendation_letter_url?: string | null
          research_title?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rotation_department?: string | null
          start_date: string
          status?: string
          student_id_url?: string | null
          study_program?: string | null
          supervisor_name?: string | null
          supervisor_phone?: string | null
          target_interviewee?: string | null
          tracking_code: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          cover_letter_url?: string | null
          created_at?: string | null
          end_date?: string
          equipment_used?: string | null
          faculty?: string | null
          id?: string
          institution_address?: string | null
          institution_email?: string | null
          institution_name?: string
          institution_phone?: string | null
          interview_date?: string | null
          interview_time?: string | null
          interview_topic?: string | null
          journalist_id_url?: string | null
          media_organization?: string | null
          participant_count?: number | null
          participant_email?: string
          participant_name?: string
          participant_nim?: string | null
          participant_phone?: string
          program_type?: string
          proposal_url?: string | null
          recommendation_letter_url?: string | null
          research_title?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rotation_department?: string | null
          start_date?: string
          status?: string
          student_id_url?: string | null
          study_program?: string | null
          supervisor_name?: string | null
          supervisor_phone?: string | null
          target_interviewee?: string | null
          tracking_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_settings: {
        Row: {
          admin_email: string | null
          admin_whatsapp: string | null
          cover_letter_template_url: string | null
          created_at: string | null
          id: string
          limit_interview: number | null
          limit_koas: number | null
          limit_pkl: number | null
          limit_research: number | null
          proposal_template_url: string | null
          required_documents_interview: Json | null
          required_documents_koas: Json | null
          required_documents_pkl: Json | null
          required_documents_research: Json | null
          updated_at: string | null
        }
        Insert: {
          admin_email?: string | null
          admin_whatsapp?: string | null
          cover_letter_template_url?: string | null
          created_at?: string | null
          id?: string
          limit_interview?: number | null
          limit_koas?: number | null
          limit_pkl?: number | null
          limit_research?: number | null
          proposal_template_url?: string | null
          required_documents_interview?: Json | null
          required_documents_koas?: Json | null
          required_documents_pkl?: Json | null
          required_documents_research?: Json | null
          updated_at?: string | null
        }
        Update: {
          admin_email?: string | null
          admin_whatsapp?: string | null
          cover_letter_template_url?: string | null
          created_at?: string | null
          id?: string
          limit_interview?: number | null
          limit_koas?: number | null
          limit_pkl?: number | null
          limit_research?: number | null
          proposal_template_url?: string | null
          required_documents_interview?: Json | null
          required_documents_koas?: Json | null
          required_documents_pkl?: Json | null
          required_documents_research?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_standards: {
        Row: {
          complaint_mechanism_en: string | null
          complaint_mechanism_id: string | null
          cost: string | null
          created_at: string | null
          duration: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          procedure_en: string | null
          procedure_id: string | null
          requirements_en: string | null
          requirements_id: string | null
          service_name_en: string | null
          service_name_id: string
          updated_at: string | null
        }
        Insert: {
          complaint_mechanism_en?: string | null
          complaint_mechanism_id?: string | null
          cost?: string | null
          created_at?: string | null
          duration?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          procedure_en?: string | null
          procedure_id?: string | null
          requirements_en?: string | null
          requirements_id?: string | null
          service_name_en?: string | null
          service_name_id: string
          updated_at?: string | null
        }
        Update: {
          complaint_mechanism_en?: string | null
          complaint_mechanism_id?: string | null
          cost?: string | null
          created_at?: string | null
          duration?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          procedure_en?: string | null
          procedure_id?: string | null
          requirements_en?: string | null
          requirements_id?: string | null
          service_name_en?: string | null
          service_name_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          button_visibility_mode: string | null
          carousel_autoplay_duration: number | null
          chat_us_enabled: boolean | null
          chat_us_end_time: string | null
          chat_us_icon_url: string | null
          chat_us_number: string | null
          chat_us_position: string | null
          chat_us_show_on_holidays: boolean | null
          chat_us_start_time: string | null
          chat_us_timezone: string | null
          chat_us_use_schedule: boolean | null
          floating_ticket_custom_icon_url: string | null
          floating_ticket_enabled: boolean | null
          floating_ticket_end_time: string | null
          floating_ticket_icon: string | null
          floating_ticket_icon_size: string | null
          floating_ticket_position: string | null
          floating_ticket_show_on_holidays: boolean | null
          floating_ticket_start_time: string | null
          floating_ticket_text_en: string | null
          floating_ticket_text_id: string | null
          floating_ticket_use_schedule: boolean | null
          hero_image_url: string | null
          hero_ticket_enabled: boolean | null
          hero_ticket_end_time: string | null
          hero_ticket_show_on_holidays: boolean | null
          hero_ticket_start_time: string | null
          hero_ticket_use_schedule: boolean | null
          id: string
          loading_logo_url: string | null
          logo_mobile_url: string | null
          logo_url: string | null
          map_image_url: string | null
          mascot_image_url: string | null
          navbar_show_animals: boolean | null
          navbar_show_events: boolean | null
          navbar_show_gallery3d: boolean | null
          navbar_show_map: boolean | null
          navbar_show_news: boolean | null
          navbar_show_profile: boolean | null
          navbar_show_qr_scan: boolean | null
          navbar_show_tickets: boolean | null
          navbar_show_venues: boolean | null
          site_name: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_tiktok: string | null
          social_twitter: string | null
          social_youtube: string | null
          ticket_external_url: string | null
          updated_at: string
          updated_by: string | null
          venue_phone_number: string | null
          venue_whatsapp_number: string | null
          whatsapp_number: string | null
        }
        Insert: {
          button_visibility_mode?: string | null
          carousel_autoplay_duration?: number | null
          chat_us_enabled?: boolean | null
          chat_us_end_time?: string | null
          chat_us_icon_url?: string | null
          chat_us_number?: string | null
          chat_us_position?: string | null
          chat_us_show_on_holidays?: boolean | null
          chat_us_start_time?: string | null
          chat_us_timezone?: string | null
          chat_us_use_schedule?: boolean | null
          floating_ticket_custom_icon_url?: string | null
          floating_ticket_enabled?: boolean | null
          floating_ticket_end_time?: string | null
          floating_ticket_icon?: string | null
          floating_ticket_icon_size?: string | null
          floating_ticket_position?: string | null
          floating_ticket_show_on_holidays?: boolean | null
          floating_ticket_start_time?: string | null
          floating_ticket_text_en?: string | null
          floating_ticket_text_id?: string | null
          floating_ticket_use_schedule?: boolean | null
          hero_image_url?: string | null
          hero_ticket_enabled?: boolean | null
          hero_ticket_end_time?: string | null
          hero_ticket_show_on_holidays?: boolean | null
          hero_ticket_start_time?: string | null
          hero_ticket_use_schedule?: boolean | null
          id?: string
          loading_logo_url?: string | null
          logo_mobile_url?: string | null
          logo_url?: string | null
          map_image_url?: string | null
          mascot_image_url?: string | null
          navbar_show_animals?: boolean | null
          navbar_show_events?: boolean | null
          navbar_show_gallery3d?: boolean | null
          navbar_show_map?: boolean | null
          navbar_show_news?: boolean | null
          navbar_show_profile?: boolean | null
          navbar_show_qr_scan?: boolean | null
          navbar_show_tickets?: boolean | null
          navbar_show_venues?: boolean | null
          site_name?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          ticket_external_url?: string | null
          updated_at?: string
          updated_by?: string | null
          venue_phone_number?: string | null
          venue_whatsapp_number?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          button_visibility_mode?: string | null
          carousel_autoplay_duration?: number | null
          chat_us_enabled?: boolean | null
          chat_us_end_time?: string | null
          chat_us_icon_url?: string | null
          chat_us_number?: string | null
          chat_us_position?: string | null
          chat_us_show_on_holidays?: boolean | null
          chat_us_start_time?: string | null
          chat_us_timezone?: string | null
          chat_us_use_schedule?: boolean | null
          floating_ticket_custom_icon_url?: string | null
          floating_ticket_enabled?: boolean | null
          floating_ticket_end_time?: string | null
          floating_ticket_icon?: string | null
          floating_ticket_icon_size?: string | null
          floating_ticket_position?: string | null
          floating_ticket_show_on_holidays?: boolean | null
          floating_ticket_start_time?: string | null
          floating_ticket_text_en?: string | null
          floating_ticket_text_id?: string | null
          floating_ticket_use_schedule?: boolean | null
          hero_image_url?: string | null
          hero_ticket_enabled?: boolean | null
          hero_ticket_end_time?: string | null
          hero_ticket_show_on_holidays?: boolean | null
          hero_ticket_start_time?: string | null
          hero_ticket_use_schedule?: boolean | null
          id?: string
          loading_logo_url?: string | null
          logo_mobile_url?: string | null
          logo_url?: string | null
          map_image_url?: string | null
          mascot_image_url?: string | null
          navbar_show_animals?: boolean | null
          navbar_show_events?: boolean | null
          navbar_show_gallery3d?: boolean | null
          navbar_show_map?: boolean | null
          navbar_show_news?: boolean | null
          navbar_show_profile?: boolean | null
          navbar_show_qr_scan?: boolean | null
          navbar_show_tickets?: boolean | null
          navbar_show_venues?: boolean | null
          site_name?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          ticket_external_url?: string | null
          updated_at?: string
          updated_by?: string | null
          venue_phone_number?: string | null
          venue_whatsapp_number?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      ticket_content: {
        Row: {
          content_type: string | null
          created_at: string | null
          description_en: string | null
          description_id: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          order_index: number | null
          title_en: string | null
          title_id: string
          updated_at: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          description_en?: string | null
          description_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          order_index?: number | null
          title_en?: string | null
          title_id: string
          updated_at?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          description_en?: string | null
          description_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          order_index?: number | null
          title_en?: string | null
          title_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_settings: {
        Row: {
          child_discount: number | null
          external_ticket_url: string | null
          hero_image_url: string | null
          hero_subtitle_en: string | null
          hero_subtitle_id: string | null
          hero_title_en: string | null
          hero_title_id: string | null
          id: string
          regular_description_en: string | null
          regular_description_id: string | null
          regular_image_url: string | null
          regular_link: string | null
          regular_price: number | null
          regular_title_en: string | null
          regular_title_id: string | null
          section_title_en: string | null
          section_title_id: string | null
          show_pricing: boolean | null
          updated_at: string | null
          updated_by: string | null
          vip_description_en: string | null
          vip_description_id: string | null
          vip_image_url: string | null
          vip_link: string | null
          vip_price: number | null
          vip_title_en: string | null
          vip_title_id: string | null
        }
        Insert: {
          child_discount?: number | null
          external_ticket_url?: string | null
          hero_image_url?: string | null
          hero_subtitle_en?: string | null
          hero_subtitle_id?: string | null
          hero_title_en?: string | null
          hero_title_id?: string | null
          id?: string
          regular_description_en?: string | null
          regular_description_id?: string | null
          regular_image_url?: string | null
          regular_link?: string | null
          regular_price?: number | null
          regular_title_en?: string | null
          regular_title_id?: string | null
          section_title_en?: string | null
          section_title_id?: string | null
          show_pricing?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          vip_description_en?: string | null
          vip_description_id?: string | null
          vip_image_url?: string | null
          vip_link?: string | null
          vip_price?: number | null
          vip_title_en?: string | null
          vip_title_id?: string | null
        }
        Update: {
          child_discount?: number | null
          external_ticket_url?: string | null
          hero_image_url?: string | null
          hero_subtitle_en?: string | null
          hero_subtitle_id?: string | null
          hero_title_en?: string | null
          hero_title_id?: string | null
          id?: string
          regular_description_en?: string | null
          regular_description_id?: string | null
          regular_image_url?: string | null
          regular_link?: string | null
          regular_price?: number | null
          regular_title_en?: string | null
          regular_title_id?: string | null
          section_title_en?: string | null
          section_title_id?: string | null
          show_pricing?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          vip_description_en?: string | null
          vip_description_id?: string | null
          vip_image_url?: string | null
          vip_link?: string | null
          vip_price?: number | null
          vip_title_en?: string | null
          vip_title_id?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          code: string | null
          created_at: string
          id: number
          price: number
          quantity: number
          status: string | null
          ticket_type: string | null
          total: number
          user_id: string
          visit_date: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: number
          price: number
          quantity?: number
          status?: string | null
          ticket_type?: string | null
          total: number
          user_id: string
          visit_date: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: number
          price?: number
          quantity?: number
          status?: string | null
          ticket_type?: string | null
          total?: number
          user_id?: string
          visit_date?: string
        }
        Relationships: []
      }
      tour_bookings: {
        Row: {
          admin_notes: string | null
          booking_code: string
          booking_date: string
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          duration_hours: number
          guide_id: string | null
          id: string
          notes: string | null
          package_id: string | null
          participants: number | null
          start_time: string
          status: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          booking_code: string
          booking_date: string
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          duration_hours: number
          guide_id?: string | null
          id?: string
          notes?: string | null
          package_id?: string | null
          participants?: number | null
          start_time: string
          status?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          booking_code?: string
          booking_date?: string
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          duration_hours?: number
          guide_id?: string | null
          id?: string
          notes?: string | null
          package_id?: string | null
          participants?: number | null
          start_time?: string
          status?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_bookings_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "tour_guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "tour_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_gallery: {
        Row: {
          caption_en: string | null
          caption_id: string | null
          created_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          order_index: number | null
        }
        Insert: {
          caption_en?: string | null
          caption_id?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          order_index?: number | null
        }
        Update: {
          caption_en?: string | null
          caption_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          order_index?: number | null
        }
        Relationships: []
      }
      tour_guide_schedules: {
        Row: {
          created_at: string | null
          date: string
          end_time: string
          guide_id: string
          id: string
          is_available: boolean | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time: string
          guide_id: string
          id?: string
          is_available?: boolean | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string
          guide_id?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_guide_schedules_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "tour_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_guides: {
        Row: {
          bio_en: string | null
          bio_id: string | null
          created_at: string | null
          hourly_rate: number
          id: string
          is_active: boolean | null
          languages: string[] | null
          name: string
          phone: string | null
          photo_url: string | null
          rating: number | null
          specialization: string[] | null
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          bio_en?: string | null
          bio_id?: string | null
          created_at?: string | null
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          name: string
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          specialization?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          bio_en?: string | null
          bio_id?: string | null
          created_at?: string | null
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          specialization?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tour_packages: {
        Row: {
          color_class: string | null
          created_at: string | null
          description_en: string | null
          description_id: string | null
          duration_hours: number
          icon: string | null
          id: string
          is_active: boolean | null
          max_participants: number | null
          min_participants: number | null
          name_en: string | null
          name_id: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          color_class?: string | null
          created_at?: string | null
          description_en?: string | null
          description_id?: string | null
          duration_hours: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          min_participants?: number | null
          name_en?: string | null
          name_id: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          color_class?: string | null
          created_at?: string | null
          description_en?: string | null
          description_id?: string | null
          duration_hours?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          min_participants?: number | null
          name_en?: string | null
          name_id?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          is_allowed: boolean | null
          permission_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_allowed?: boolean | null
          permission_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_allowed?: boolean | null
          permission_key?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          facilities: string[] | null
          has_panorama: boolean | null
          id: number
          image_url: string | null
          image_urls: string[] | null
          is_available: boolean | null
          name: string
          panorama_url: string | null
          phone_number: string | null
          price_per_day: number | null
          price_per_hour: number | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          facilities?: string[] | null
          has_panorama?: boolean | null
          id?: number
          image_url?: string | null
          image_urls?: string[] | null
          is_available?: boolean | null
          name: string
          panorama_url?: string | null
          phone_number?: string | null
          price_per_day?: number | null
          price_per_hour?: number | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          facilities?: string[] | null
          has_panorama?: boolean | null
          id?: number
          image_url?: string | null
          image_urls?: string[] | null
          is_available?: boolean | null
          name?: string
          panorama_url?: string | null
          phone_number?: string | null
          price_per_day?: number | null
          price_per_hour?: number | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      visitor_data: {
        Row: {
          created_at: string | null
          date: string
          id: number
          jumlah_kendaraan: number | null
          jumlah_pengunjung: number | null
          pengunjung_wahana: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: number
          jumlah_kendaraan?: number | null
          jumlah_pengunjung?: number | null
          pengunjung_wahana?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: number
          jumlah_kendaraan?: number | null
          jumlah_pengunjung?: number | null
          pengunjung_wahana?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wbs_submissions: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string | null
          description: string
          evidence_urls: string[] | null
          id: string
          incident_date: string | null
          incident_location: string | null
          is_anonymous: boolean | null
          reported_person_name: string | null
          reported_person_position: string | null
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          category: string
          created_at?: string | null
          description: string
          evidence_urls?: string[] | null
          id?: string
          incident_date?: string | null
          incident_location?: string | null
          is_anonymous?: boolean | null
          reported_person_name?: string | null
          reported_person_position?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string | null
          description?: string
          evidence_urls?: string[] | null
          id?: string
          incident_date?: string | null
          incident_location?: string | null
          is_anonymous?: boolean | null
          reported_person_name?: string | null
          reported_person_position?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whats_new_items: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          item_id: string
          item_type: string
          link_url: string
          order_index: number | null
          subtitle: string | null
          title_en: string | null
          title_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          item_id: string
          item_type: string
          link_url: string
          order_index?: number | null
          subtitle?: string | null
          title_en?: string | null
          title_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          item_id?: string
          item_type?: string
          link_url?: string
          order_index?: number | null
          subtitle?: string | null
          title_en?: string | null
          title_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          message_en: string | null
          message_id: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_en?: string | null
          message_id: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_en?: string | null
          message_id?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      zone_markers: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          description_en: string | null
          id: string
          is_active: boolean | null
          name: string
          name_en: string | null
          position_x: number
          position_y: number
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          id: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          position_x?: number
          position_y?: number
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          position_x?: number
          position_y?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      zoo_history: {
        Row: {
          content_en: string | null
          content_id: string
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean | null
          order_index: number | null
          title_en: string | null
          title_id: string
          updated_at: string
          year: number | null
        }
        Insert: {
          content_en?: string | null
          content_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          order_index?: number | null
          title_en?: string | null
          title_id: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          content_en?: string | null
          content_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          order_index?: number | null
          title_en?: string | null
          title_id?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_page_views: { Args: never; Returns: undefined }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_permission: {
        Args: { _permission_key: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_book_download_count: {
        Args: { book_id: string }
        Returns: undefined
      }
      increment_book_view_count: {
        Args: { book_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "visitor" | "staff" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["visitor", "staff", "admin"],
    },
  },
} as const
