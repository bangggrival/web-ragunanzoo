import pool from '../db.js';

async function seedAllData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // ─────────── ANIMALS - Update existing ────────────
    console.log('Updating animals data...');
    await client.query(`
      UPDATE animals SET 
        latin_name = 'Panthera tigris sumatrae',
        species = 'Harimau',
        zone = 'Zona Predator',
        status = 'Kritis (CR)',
        description = 'Harimau Sumatera adalah subspesies harimau yang paling kecil dan satu-satunya harimau yang masih hidup di Indonesia. Mereka memiliki belang yang lebih rapat dan warna yang lebih gelap dibanding subspesies lain.',
        description_en = 'The Sumatran Tiger is the smallest tiger subspecies and the only surviving tiger in Indonesia. They have denser stripes and darker colors compared to other subspecies.',
        habitat = 'Hutan tropis dataran rendah',
        habitat_en = 'Tropical lowland forest',
        category = 'Mamalia',
        category_en = 'Mammals',
        is_featured = true,
        is_published = true,
        health_status = 'Sehat',
        name_en = 'Sumatran Tiger'
      WHERE id = 1
    `);

    await client.query(`
      UPDATE animals SET 
        latin_name = 'Pongo pygmaeus',
        species = 'Primata',
        zone = 'Pusat Primata Schmutzer',
        status = 'Kritis (CR)',
        description = 'Orangutan Kalimantan adalah primata terbesar di dunia yang hidup di atas pohon. Mereka sangat cerdas dan menggunakan alat-alat sederhana untuk mencari makan.',
        description_en = 'The Bornean Orangutan is the world''s largest arboreal primate. They are highly intelligent and use simple tools to find food.',
        habitat = 'Hutan hujan tropis',
        habitat_en = 'Tropical rainforest',
        category = 'Primata',
        category_en = 'Primates',
        is_featured = true,
        is_published = true,
        health_status = 'Sehat',
        name_en = 'Bornean Orangutan'
      WHERE id = 2
    `);

    await client.query(`
      UPDATE animals SET 
        latin_name = 'Giraffa camelopardalis',
        species = 'Herbivora',
        zone = 'Savana Afrika',
        status = 'Rentan (VU)',
        description = 'Jerapah adalah hewan darat tertinggi di dunia. Leher panjang mereka memungkinkan mereka menjangkau daun-daun pohon akasia di puncak pohon.',
        description_en = 'Giraffes are the tallest living terrestrial animals. Their long necks allow them to reach leaves at the tops of acacia trees.',
        habitat = 'Sabana dan padang rumput Afrika',
        habitat_en = 'African savannah and grasslands',
        is_featured = true,
        is_published = true,
        health_status = 'Sehat'
      WHERE id = 4
    `);

    // Insert more animals
    const animalCount = await client.query('SELECT COUNT(*) FROM animals');
    if (parseInt(animalCount.rows[0].count) < 6) {
      await client.query(`
        INSERT INTO animals (name, name_en, latin_name, species, zone, status, description, description_en, image_url, habitat, habitat_en, category, category_en, is_featured, is_published, health_status)
        VALUES
        ('Komodo', 'Komodo Dragon', 'Varanus komodoensis', 'Reptil', 'Zona Reptil', 'Rentan (VU)',
         'Komodo adalah kadal terbesar di dunia yang hanya ditemukan di Indonesia. Mereka adalah predator yang sangat efisien dengan kemampuan melacak mangsa dari jarak jauh.',
         'The Komodo dragon is the world''s largest lizard, found only in Indonesia. They are highly efficient predators with the ability to track prey from great distances.',
         'https://images.unsplash.com/photo-1564518006159-eeea79c58e58?w=800&auto=format&fit=crop&q=80',
         'Hutan kering tropis', 'Tropical dry forest', 'Reptil', 'Reptiles', true, true, 'Sehat'),
        ('Elang Jawa', 'Javan Hawk-Eagle', 'Nisaetus bartelsi', 'Burung', 'Aviari', 'Terancam (EN)',
         'Elang Jawa adalah salah satu spesies elang paling langka di dunia, endemik di Pulau Jawa.',
         'The Javan Hawk-Eagle is one of the rarest eagle species in the world, endemic to Java Island.',
         'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=800&auto=format&fit=crop&q=80',
         'Hutan pegunungan', 'Mountain forest', 'Burung', 'Birds', true, true, 'Sehat'),
        ('Beruang Madu', 'Sun Bear', 'Helarctos malayanus', 'Mamalia', 'Zona Mamalia', 'Rentan (VU)',
         'Beruang Madu adalah beruang terkecil di dunia dan merupakan satwa endemik Asia Tenggara.',
         'The Sun Bear is the world''s smallest bear species and endemic to Southeast Asia.',
         'https://images.unsplash.com/photo-1527526029430-319f3218b018?w=800&auto=format&fit=crop&q=80',
         'Hutan hujan tropis', 'Tropical rainforest', 'Mamalia', 'Mammals', true, true, 'Sehat')
        ON CONFLICT DO NOTHING
      `);
    }

    // ─────────── PLANTS ────────────
    console.log('Seeding plants data...');
    const plantsCount = await client.query('SELECT COUNT(*) FROM plants');
    if (parseInt(plantsCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO plants (name, name_en, latin_name, species, description, description_en, image_url, category, category_en, habitat, habitat_en, is_featured, is_published, status, health_status, zone)
        VALUES
        ('Rafflesia Arnoldi', 'Rafflesia', 'Rafflesia arnoldii', 'Parasit Obligat',
         'Rafflesia Arnoldi adalah bunga terbesar di dunia dengan diameter hingga 1 meter. Bunga ini tidak memiliki daun, batang, dan akar, melainkan hidup sebagai parasit pada tanaman inang.',
         'Rafflesia Arnoldii is the world''s largest individual flower, up to 1 meter in diameter. It has no leaves, stems, or roots and lives as a parasite on host plants.',
         'https://images.unsplash.com/photo-1597762117709-859f744b84c3?w=800&auto=format&fit=crop&q=80',
         'Bunga Langka', 'Rare Flowers', 'Hutan hujan tropis', 'Tropical rainforest', true, true, 'Langka', 'Sehat', 'Zona Flora Langka'),
        ('Pohon Ulin', 'Borneo Ironwood', 'Eusideroxylon zwageri', 'Pohon Kayu Keras',
         'Ulin atau Kayu Besi adalah pohon endemik Kalimantan yang dikenal sebagai "kayu terkuat" di Indonesia. Pohon ini dapat hidup hingga ribuan tahun.',
         'Ulin or Ironwood is an endemic tree of Borneo known as Indonesia''s "strongest wood". This tree can live for thousands of years.',
         'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
         'Pohon Hutan', 'Forest Trees', 'Hutan hujan Kalimantan', 'Borneo rainforest', true, true, 'Rentan', 'Sehat', 'Zona Pohon Besar'),
        ('Anggrek Bulan', 'Moon Orchid', 'Phalaenopsis amabilis', 'Anggrek',
         'Anggrek Bulan adalah bunga nasional Indonesia yang dikenal sebagai "Puspa Pesona". Bunganya yang cantik berwarna putih dengan diameter 8-10 cm.',
         'The Moon Orchid is Indonesia''s national flower, known as "Puspa Pesona". Its beautiful white flowers have a diameter of 8-10 cm.',
         'https://images.unsplash.com/photo-1524598171347-26d0f038daa6?w=800&auto=format&fit=crop&q=80',
         'Anggrek', 'Orchids', 'Hutan hujan tropis', 'Tropical rainforest', true, true, 'Dilindungi', 'Sehat', 'Zona Anggrek'),
        ('Kantong Semar', 'Pitcher Plant', 'Nepenthes rafflesiana', 'Tanaman Karnivora',
         'Kantong Semar adalah tanaman karnivora unik Indonesia yang menangkap serangga menggunakan kantong yang berisi cairan pencerna.',
         'The Pitcher Plant is a unique Indonesian carnivorous plant that catches insects using pitchers filled with digestive fluid.',
         'https://images.unsplash.com/photo-1589873963847-ab3c6a33e8bc?w=800&auto=format&fit=crop&q=80',
         'Tanaman Karnivora', 'Carnivorous Plants', 'Hutan rawa gambut', 'Peat swamp forest', true, true, 'Rentan', 'Sehat', 'Zona Flora Unik'),
        ('Bambu Petung', 'Giant Bamboo', 'Dendrocalamus asper', 'Bambu',
         'Bambu Petung adalah salah satu jenis bambu terbesar di dunia dengan diameter batang hingga 20 cm dan tinggi lebih dari 20 meter.',
         'Petung Bamboo is one of the world''s largest bamboo species with stem diameters up to 20 cm and heights of more than 20 meters.',
         'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80',
         'Bambu', 'Bamboo', 'Hutan bambu', 'Bamboo forest', false, true, 'Aman', 'Sehat', 'Zona Bambu'),
        ('Pohon Beringin', 'Banyan Tree', 'Ficus benjamina', 'Pohon Ara',
         'Pohon Beringin adalah pohon sakral dalam budaya Indonesia yang memiliki akar gantung yang khas. Pohon ini sering ditemukan di alun-alun kota dan area publik.',
         'The Banyan Tree is a sacred tree in Indonesian culture with distinctive aerial roots. It is often found in city squares and public areas.',
         'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80',
         'Pohon Hutan', 'Forest Trees', 'Berbagai habitat', 'Various habitats', false, true, 'Aman', 'Sehat', 'Zona Pohon Besar')
      `);
      console.log('Plants seeded successfully!');
    } else {
      console.log(`Plants table already has ${plantsCount.rows[0].count} rows, skipping.`);
    }

    // ─────────── EVENTS ────────────
    console.log('Seeding events data...');
    const eventsCount = await client.query('SELECT COUNT(*) FROM events');
    if (parseInt(eventsCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO events (title, title_id, title_en, description, description_id, description_en, image_url, event_date, time, location, type, is_published)
        VALUES
        ('Festival Satwa Liar Ragunan 2026', 'Festival Satwa Liar Ragunan 2026', 'Ragunan Wildlife Festival 2026',
         'Festival tahunan yang merayakan keanekaragaman hayati Indonesia dengan pertunjukan satwa, edukasi konservasi, dan pameran foto satwa liar.',
         'Festival tahunan yang merayakan keanekaragaman hayati Indonesia dengan pertunjukan satwa, edukasi konservasi, dan pameran foto satwa liar.',
         'Annual festival celebrating Indonesian biodiversity with animal shows, conservation education, and wildlife photo exhibitions.',
         'https://images.unsplash.com/photo-1567334509922-399e93fad79d?w=800&auto=format&fit=crop&q=80',
         '2026-09-15', '09:00 - 17:00', 'Area Amphitheater Ragunan', 'Festival', true),
        ('Feeding Time Gajah Sumatera', 'Feeding Time Gajah Sumatera', 'Sumatran Elephant Feeding Time',
         'Saksikan langsung proses pemberian makan Gajah Sumatera oleh tim keeper berpengalaman. Program edukasi ini terbuka untuk semua pengunjung.',
         'Saksikan langsung proses pemberian makan Gajah Sumatera oleh tim keeper berpengalaman. Program edukasi ini terbuka untuk semua pengunjung.',
         'Watch the feeding of Sumatran Elephants live by experienced keepers. This educational program is open to all visitors.',
         'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop&q=80',
         '2026-08-10', '10:00 - 11:00', 'Kandang Gajah', 'Edukasi', true),
        ('Workshop Fotografi Satwa Liar', 'Workshop Fotografi Satwa Liar', 'Wildlife Photography Workshop',
         'Bergabunglah dengan fotografer profesional untuk belajar teknik terbaik memotret satwa liar di Kebun Binatang Ragunan.',
         'Bergabunglah dengan fotografer profesional untuk belajar teknik terbaik memotret satwa liar di Kebun Binatang Ragunan.',
         'Join professional photographers to learn the best techniques for photographing wildlife at Ragunan Zoo.',
         'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80',
         '2026-08-23', '08:00 - 12:00', 'Gerbang Utama - Area Meeting Point', 'Workshop', true),
        ('Program Adopsi Satwa Ragunan', 'Program Adopsi Satwa Ragunan', 'Ragunan Animal Adoption Program',
         'Daftarkan diri Anda dalam program adopsi simbolis satwa Ragunan. Kontribusi Anda langsung mendukung perawatan dan program konservasi satwa.',
         'Daftarkan diri Anda dalam program adopsi simbolis satwa Ragunan. Kontribusi Anda langsung mendukung perawatan dan program konservasi satwa.',
         'Register for Ragunan''s symbolic animal adoption program. Your contribution directly supports animal care and conservation programs.',
         'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&auto=format&fit=crop&q=80',
         '2026-08-01', '09:00 - 16:00', 'Kantor Administrasi Ragunan', 'Program', true),
        ('Konser Alam: Musik dan Satwa', 'Konser Alam: Musik dan Satwa', 'Nature Concert: Music and Wildlife',
         'Nikmati pertunjukan musik akustik di tengah alam terbuka Ragunan dengan pemandangan satwa yang memukau.',
         'Nikmati pertunjukan musik akustik di tengah alam terbuka Ragunan dengan pemandangan satwa yang memukau.',
         'Enjoy acoustic music performances in the open nature of Ragunan with stunning wildlife views.',
         'https://images.unsplash.com/photo-1540573133985-780688d1728b?w=800&auto=format&fit=crop&q=80',
         '2026-09-05', '18:00 - 21:00', 'Taman Gajah Ragunan', 'Konser', true)
      `);
      console.log('Events seeded successfully!');
    } else {
      console.log(`Events table already has ${eventsCount.rows[0].count} rows, skipping.`);
    }

    // ─────────── FEEDING SCHEDULES - Fix image URLs ────────────
    console.log('Updating feeding_schedules images...');
    await client.query(`
      UPDATE feeding_schedules SET 
        image_url = 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&auto=format&fit=crop&q=80'
      WHERE name_id ILIKE '%harimau%'
    `);
    await client.query(`
      UPDATE feeding_schedules SET 
        image_url = 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop&q=80'
      WHERE name_id ILIKE '%gajah%'
    `);
    await client.query(`
      UPDATE feeding_schedules SET 
        image_url = 'https://images.unsplash.com/photo-1540573133985-780688d1728b?w=800&auto=format&fit=crop&q=80'
      WHERE image_url LIKE '/animals/%'
    `);
    console.log('Feeding schedules images updated!');

    await client.query('COMMIT');

    // Report final counts
    console.log('\n=== Final Row Counts ===');
    for (const table of ['animals', 'plants', 'events', 'news', 'feeding_schedules']) {
      const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`${table}: ${res.rows[0].count} rows`);
    }
    
    console.log('\n✅ All data seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding data:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedAllData();
