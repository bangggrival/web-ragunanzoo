import pool from '../db.js';

const indexes = [
  // 1. Animals Table
  { name: 'idx_animals_category_id', table: 'animals', query: 'CREATE INDEX IF NOT EXISTS idx_animals_category_id ON public.animals (category_id);' },
  { name: 'idx_animals_is_featured', table: 'animals', query: 'CREATE INDEX IF NOT EXISTS idx_animals_is_featured ON public.animals (is_featured) WHERE is_featured = true;' },
  { name: 'idx_animals_is_published', table: 'animals', query: 'CREATE INDEX IF NOT EXISTS idx_animals_is_published ON public.animals (is_published);' },
  { name: 'idx_animals_name', table: 'animals', query: 'CREATE INDEX IF NOT EXISTS idx_animals_name ON public.animals (name);' },

  // 2. Plants Table
  { name: 'idx_plants_category_id', table: 'plants', query: 'CREATE INDEX IF NOT EXISTS idx_plants_category_id ON public.plants (category_id);' },
  { name: 'idx_plants_is_featured', table: 'plants', query: 'CREATE INDEX IF NOT EXISTS idx_plants_is_featured ON public.plants (is_featured) WHERE is_featured = true;' },
  { name: 'idx_plants_is_published', table: 'plants', query: 'CREATE INDEX IF NOT EXISTS idx_plants_is_published ON public.plants (is_published);' },
  { name: 'idx_plants_name', table: 'plants', query: 'CREATE INDEX IF NOT EXISTS idx_plants_name ON public.plants (name);' },

  // 3. Events Table
  { name: 'idx_events_event_date', table: 'events', query: 'CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events (event_date);' },
  { name: 'idx_events_is_published', table: 'events', query: 'CREATE INDEX IF NOT EXISTS idx_events_is_published ON public.events (is_published);' },
  { name: 'idx_events_type', table: 'events', query: 'CREATE INDEX IF NOT EXISTS idx_events_type ON public.events (type);' },

  // 4. Tickets Table
  { name: 'idx_tickets_user_id', table: 'tickets', query: 'CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets (user_id);' },
  { name: 'idx_tickets_status', table: 'tickets', query: 'CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status);' },
  { name: 'idx_tickets_visit_date', table: 'tickets', query: 'CREATE INDEX IF NOT EXISTS idx_tickets_visit_date ON public.tickets (visit_date);' },
  { name: 'idx_tickets_created_at', table: 'tickets', query: 'CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets (created_at DESC);' },

  // 5. Service Registrations Table
  { name: 'idx_service_reg_tracking_code', table: 'service_registrations', query: 'CREATE INDEX IF NOT EXISTS idx_service_reg_tracking_code ON public.service_registrations (tracking_code);' },
  { name: 'idx_service_reg_status', table: 'service_registrations', query: 'CREATE INDEX IF NOT EXISTS idx_service_reg_status ON public.service_registrations (status);' },
  { name: 'idx_service_reg_program_type', table: 'service_registrations', query: 'CREATE INDEX IF NOT EXISTS idx_service_reg_program_type ON public.service_registrations (program_type);' },

  // 6. Whistleblowing System (WBS) Table
  { name: 'idx_wbs_status', table: 'wbs_submissions', query: 'CREATE INDEX IF NOT EXISTS idx_wbs_status ON public.wbs_submissions (status);' },
  { name: 'idx_wbs_created_at', table: 'wbs_submissions', query: 'CREATE INDEX IF NOT EXISTS idx_wbs_created_at ON public.wbs_submissions (created_at DESC);' },

  // 7. User Permissions & Roles Table
  { name: 'idx_user_permissions_user_id', table: 'user_permissions', query: 'CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions (user_id);' },
  { name: 'idx_user_roles_user_id', table: 'user_roles', query: 'CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);' },

  // 8. Page Views Analytics Table
  { name: 'idx_page_views_created_at', table: 'page_views', query: 'CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views (created_at DESC);' },
  { name: 'idx_page_views_page_path', table: 'page_views', query: 'CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views (page_path);' },

  // 9. News & Articles Table
  { name: 'idx_news_created_at', table: 'news', query: 'CREATE INDEX IF NOT EXISTS idx_news_created_at ON public.news (created_at DESC);' },
  { name: 'idx_news_is_published', table: 'news', query: 'CREATE INDEX IF NOT EXISTS idx_news_is_published ON public.news (is_published);' },

  // 10. Tour Guides & Schedules
  { name: 'idx_tour_schedules_guide_date', table: 'tour_guide_schedules', query: 'CREATE INDEX IF NOT EXISTS idx_tour_schedules_guide_date ON public.tour_guide_schedules (guide_id, date);' },
];

async function applyIndexes() {
  console.log('🚀 [DATABASE] Applying high-performance B-Tree indexes...');
  const client = await pool.connect();
  let successCount = 0;

  try {
    for (const idx of indexes) {
      const startTime = Date.now();
      try {
        await client.query(idx.query);
        const elapsed = Date.now() - startTime;
        console.log(`  ✅ [${idx.table}] ${idx.name} created/verified (${elapsed}ms)`);
        successCount++;
      } catch (err) {
        console.warn(`  ⚠️ [${idx.table}] ${idx.name} failed: ${err.message}`);
      }
    }

    console.log(`\n🎉 Successfully applied/verified ${successCount}/${indexes.length} database indexes!`);
  } finally {
    client.release();
    process.exit(0);
  }
}

applyIndexes().catch((err) => {
  console.error('❌ Failed to apply database indexes:', err);
  process.exit(1);
});
