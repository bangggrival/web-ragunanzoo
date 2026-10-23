import pool from '../db.js';

async function seedAllContent() {
  console.log('=== SEEDING COMPREHENSIVE DATA TO ALL TABLES ===\n');

  // 1. service_faqs
  console.log('1. Seeding service_faqs...');
  const faqCount = await pool.query('SELECT COUNT(*) FROM public.service_faqs');
  if (parseInt(faqCount.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO public.service_faqs (category, question_id, question_en, answer_id, answer_en, order_index) VALUES
      ('general', 'Berapa lama proses persetujuan pendaftaran?', 'How long does the registration approval process take?', 'Proses persetujuan biasanya memakan waktu 3-5 hari kerja setelah dokumen lengkap diterima.', 'The approval process usually takes 3-5 business days after complete documents are received.', 1),
      ('general', 'Bagaimana cara mengecek status pendaftaran?', 'How to check registration status?', 'Anda dapat mengecek status pendaftaran dengan memasukkan kode tracking yang diberikan saat pendaftaran di halaman Layanan.', 'You can check your registration status by entering the tracking code given during registration on the Services page.', 2),
      ('pkl', 'Berapa lama durasi PKL yang diperbolehkan?', 'How long is the internship duration allowed?', 'Durasi PKL minimal 1 bulan dan maksimal 6 bulan.', 'The minimum internship duration is 1 month and maximum 6 months.', 1),
      ('pkl', 'Apakah peserta PKL mendapat sertifikat?', 'Do interns receive certificates?', 'Ya, peserta yang menyelesaikan program akan mendapat sertifikat keikutsertaan.', 'Yes, participants who complete the program will receive a participation certificate.', 2),
      ('research', 'Apakah boleh mengambil sampel dari lokasi?', 'Is it allowed to take samples from the location?', 'Pengambilan sampel harus mendapat persetujuan khusus dan mengikuti prosedur yang ditetapkan.', 'Sample collection requires special approval and must follow established procedures.', 1),
      ('koas', 'Departemen apa saja yang tersedia untuk rotasi Koas?', 'What departments are available for medical clerkship rotation?', 'Tersedia departemen Kesehatan Satwa, Nutrisi, dan Konservasi. Silakan hubungi admin untuk informasi lebih lanjut.', 'Available departments include Animal Health, Nutrition, and Conservation. Please contact admin for more information.', 1),
      ('interview', 'Apakah boleh membawa kru dalam jumlah besar?', 'Is it allowed to bring a large crew?', 'Jumlah kru disesuaikan dengan kebutuhan dan harus dikonfirmasi saat pendaftaran. Maksimal 5 orang per sesi.', 'Crew size is adjusted to needs and must be confirmed during registration. Maximum 5 people per session.', 1);
    `);
  }

  // 2. service_availability (next 90 days)
  console.log('2. Seeding service_availability...');
  await pool.query(`
    INSERT INTO public.service_availability (date, program_type, max_slots, booked_slots, is_available)
    SELECT 
      generate_series::date,
      program_type,
      CASE 
        WHEN program_type = 'pkl' THEN 5
        WHEN program_type = 'research' THEN 3
        WHEN program_type = 'koas' THEN 3
        WHEN program_type = 'interview' THEN 10
      END as max_slots,
      0 as booked_slots,
      CASE 
        WHEN EXTRACT(DOW FROM generate_series) IN (0, 6) THEN false
        ELSE true
      END as is_available
    FROM 
      generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', INTERVAL '1 day'),
      (SELECT unnest(ARRAY['pkl', 'research', 'koas', 'interview']) as program_type) as programs
    ON CONFLICT (date, program_type) DO NOTHING;
  `);

  // 3. trivia_questions
  console.log('3. Seeding trivia_questions...');
  await pool.query(`
    INSERT INTO public.trivia_questions (text_id, text_en, type, category) VALUES
    ('Berapa kecepatan lari maksimal Harimau Sumatera saat berburu?', 'What is the maximum running speed of a Sumatran Tiger while hunting?', 'multiple_choice', 'fauna'),
    ('Apa makanan utama dari Gajah Sumatera di habitat aslinya?', 'What is the main diet of Sumatran Elephants in their natural habitat?', 'multiple_choice', 'fauna'),
    ('Berapa lama rentang hidup rata-rata Komodo di alam liar?', 'What is the average lifespan of a Komodo Dragon in the wild?', 'multiple_choice', 'fauna'),
    ('Berapa diameter bunga Rafflesia Arnoldii yang mekar sempurna?', 'What is the diameter of a fully bloomed Rafflesia Arnoldii?', 'multiple_choice', 'flora'),
    ('Pohon Trembesi dikenal memiliki kemampuan luar biasa untuk apa?', 'What is the Rain Tree (Samanea saman) famous for?', 'multiple_choice', 'flora')
    ON CONFLICT DO NOTHING;
  `);

  // 4. ticket_content
  console.log('4. Seeding ticket_content...');
  await pool.query(`
    INSERT INTO public.ticket_content (title_id, title_en, description_id, description_en, content_type, order_index, is_active) VALUES
    ('Pembelian via Kartu JakCard (Bank DKI)', 'Purchase via JakCard (Bank DKI)', 
     'Tiket masuk utama Taman Margasatwa Ragunan menggunakan kartu JakCard Bank DKI yang dapat dibeli dan di-top up di loket pintu masuk.', 
     'Main admission to Ragunan Zoo uses Bank DKI JakCard which can be purchased and topped up at entrance counters.', 
     'guide', 1, true),
    ('Pemesanan Tiket Online (Aplikasi & Website)', 'Online Ticket Booking (App & Website)', 
     'Pesan tiket lebih awal secara online untuk kemudahan akses dan menghindari antrean panjang pada akhir pekan dan hari libur nasional.', 
     'Book tickets in advance online for easy access and avoid long queues during weekends and national holidays.', 
     'guide', 2, true),
    ('Tiket Wahana & Fasilitas Tambahan', 'Rides & Additional Facility Tickets', 
     'Akses Pusat Primata Schmutzer, Taman Satwa Anak, Kereta Keliling, dan Sewa Sepeda dapat dibeli langsung di lokasi wahana.', 
     'Access to Schmutzer Primate Center, Children Zoo, Tour Train, and Bicycle Rental can be purchased directly at the attractions.', 
     'info', 3, true),
    ('Ketentuan Penggunaan & Pengembalian Tiket', 'Ticket Terms & Refund Policy', 
     'Tiket yang sudah dibeli berlaku sesuai tanggal yang dipilih. Tiket tidak dapat diuangkan kembali kecuali dalam kondisi force majeure.', 
     'Purchased tickets are valid according to the selected date. Non-refundable except under force majeure conditions.', 
     'faq', 4, true)
    ON CONFLICT DO NOTHING;
  `);

  // 5. whatsapp_templates
  console.log('5. Seeding whatsapp_templates...');
  await pool.query(`
    INSERT INTO public.whatsapp_templates (message_id, message_en, is_active, order_index) VALUES
    ('Halo Admin Ragunan Zoo, saya ingin menanyakan informasi seputar tiket dan jam operasional untuk kunjungan rombongan.', 
     'Hello Ragunan Zoo Admin, I would like to ask about tickets and opening hours for group visits.', true, 1),
    ('Halo Layanan Ragunan, saya ingin menanyakan status pendaftaran PKL / Riset dengan nomor registrasi berikut: ', 
     'Hello Ragunan Services, I would like to inquire about my Internship / Research application status with registration number: ', true, 2),
    ('Halo Manajemen Venue Ragunan, saya tertarik untuk menyewa lokasi/area untuk acara gathering/pernikahan.', 
     'Hello Ragunan Venue Management, I am interested in renting a venue/area for a gathering/wedding event.', true, 3)
    ON CONFLICT DO NOTHING;
  `);

  // 6. tour_guide_schedules
  console.log('6. Seeding tour_guide_schedules...');
  const guides = await pool.query(`SELECT id FROM public.tour_guides LIMIT 2`);
  if (guides.rows.length > 0) {
    for (const guide of guides.rows) {
      await pool.query(`
        INSERT INTO public.tour_guide_schedules (guide_id, date, start_time, end_time, is_available)
        SELECT 
          '${guide.id}'::uuid,
          generate_series::date,
          '09:00:00'::time,
          '16:00:00'::time,
          CASE WHEN EXTRACT(DOW FROM generate_series) = 1 THEN false ELSE true END
        FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', INTERVAL '1 day')
        ON CONFLICT DO NOTHING;
      `);
    }
  }

  // 7. media_gallery
  console.log('7. Seeding media_gallery...');
  await pool.query(`
    INSERT INTO public.media_gallery (filename, original_name, file_url, file_size, mime_type, alt_text, category, tags) VALUES
    ('harimau_sumatera.jpg', 'Harimau Sumatera Ragunan', 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80', 245000, 'image/jpeg', 'Harimau Sumatera di kandang terbuka Ragunan', 'fauna', ARRAY['harimau', 'kucing besar', 'konservasi']),
    ('jerapah_afrika.jpg', 'Jerapah Afrika Ragunan', 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1200&q=80', 310000, 'image/jpeg', 'Jerapah Afrika sedang makan', 'fauna', ARRAY['jerapah', 'savana']),
    ('pusat_primata_schmutzer.jpg', 'Pusat Primata Schmutzer', 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1200&q=80', 420000, 'image/jpeg', 'Kawasan Pusat Primata Schmutzer', 'attraction', ARRAY['primata', 'gorila', 'schmutzer']),
    ('pohon_trembesi.jpg', 'Pohon Trembesi Ragunan', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80', 190000, 'image/jpeg', 'Pohon Trembesi peneduh Ragunan', 'flora', ARRAY['pohon', 'trembesi', 'alam'])
    ON CONFLICT DO NOTHING;
  `);

  console.log('\n✅ ALL DATABASE SEED DATA SUCCESSFULLY INSERTED!\n');
  process.exit(0);
}

seedAllContent().catch(err => {
  console.error('Error seeding content:', err);
  process.exit(1);
});
