import pool from '../db.js';

const initialRides = [
  { id: 'kereta_keliling', name_id: 'Kereta Keliling Satwa', name_en: 'Sightseeing Train', price: 10000, unit_id: 'orang / putaran', unit_en: 'person / round', category: 'wahana' },
  { id: 'sepeda_tunggal', name_id: 'Sewa Sepeda Tunggal', name_en: 'Single Bicycle Rental', price: 10000, unit_id: 'sepeda / jam', unit_en: 'bike / hour', category: 'sewa' },
  { id: 'sepeda_ganda', name_id: 'Sewa Sepeda Tandem (Ganda)', name_en: 'Tandem Bicycle Rental', price: 15000, unit_id: 'sepeda / jam', unit_en: 'bike / hour', category: 'sewa' },
  { id: 'perahu_angsa', name_id: 'Perahu Angsa Danau Ragunan', name_en: 'Swan Paddle Boat', price: 15000, unit_id: 'perahu / putaran', unit_en: 'boat / round', category: 'wahana' },
  { id: 'kuda_tunggang', name_id: 'Kuda Tunggang Anak', name_en: 'Pony Ride', price: 5000, unit_id: 'anak / putaran', unit_en: 'child / round', category: 'wahana' },
  { id: 'taman_satwa_anak', name_id: 'Taman Satwa Anak (Children Zoo)', name_en: 'Children Zoo', price: 2500, unit_id: 'orang / masuk', unit_en: 'person / entry', category: 'wahana' }
];

async function migrate() {
  try {
    console.log('🔄 Running migration for ticket_settings tariffs...');

    await pool.query(`
      ALTER TABLE public.ticket_settings
      ADD COLUMN IF NOT EXISTS adult_price integer DEFAULT 4000,
      ADD COLUMN IF NOT EXISTS child_price integer DEFAULT 3000,
      ADD COLUMN IF NOT EXISTS schmutzer_weekday_price integer DEFAULT 6000,
      ADD COLUMN IF NOT EXISTS schmutzer_weekend_price integer DEFAULT 7500,
      ADD COLUMN IF NOT EXISTS parking_bike integer DEFAULT 1000,
      ADD COLUMN IF NOT EXISTS parking_motor integer DEFAULT 5000,
      ADD COLUMN IF NOT EXISTS parking_car integer DEFAULT 10000,
      ADD COLUMN IF NOT EXISTS parking_bus integer DEFAULT 15000,
      ADD COLUMN IF NOT EXISTS jakcard_card_price integer DEFAULT 25000,
      ADD COLUMN IF NOT EXISTS jakcard_tier_1_balance integer DEFAULT 20000,
      ADD COLUMN IF NOT EXISTS jakcard_tier_1_total integer DEFAULT 45000,
      ADD COLUMN IF NOT EXISTS jakcard_tier_2_balance integer DEFAULT 50000,
      ADD COLUMN IF NOT EXISTS jakcard_tier_2_total integer DEFAULT 75000,
      ADD COLUMN IF NOT EXISTS additional_tariffs jsonb DEFAULT '${JSON.stringify(initialRides)}'::jsonb,
      ADD COLUMN IF NOT EXISTS legal_basis_text text DEFAULT 'Peraturan Daerah Provinsi DKI Jakarta No. 1 Tahun 2024 tentang Pajak Daerah dan Retribusi Daerah',
      ADD COLUMN IF NOT EXISTS tariff_notes_id text DEFAULT 'Pembayaran tiket masuk dan wahana di Taman Margasatwa Ragunan wajib menggunakan kartu JakCard Bank DKI atau kartu uang elektronik perbankan lainnya (Cashless).',
      ADD COLUMN IF NOT EXISTS tariff_notes_en text DEFAULT 'Payment for entrance and rides at Ragunan Zoo requires Bank DKI JakCard or other approved electronic money cards (Cashless).';
    `);

    // Ensure existing rows have non-null tariff values
    await pool.query(`
      UPDATE public.ticket_settings SET
        adult_price = COALESCE(adult_price, 4000),
        child_price = COALESCE(child_price, 3000),
        schmutzer_weekday_price = COALESCE(schmutzer_weekday_price, 6000),
        schmutzer_weekend_price = COALESCE(schmutzer_weekend_price, 7500),
        parking_bike = COALESCE(parking_bike, 1000),
        parking_motor = COALESCE(parking_motor, 5000),
        parking_car = COALESCE(parking_car, 10000),
        parking_bus = COALESCE(parking_bus, 15000),
        jakcard_card_price = COALESCE(jakcard_card_price, 25000),
        jakcard_tier_1_balance = COALESCE(jakcard_tier_1_balance, 20000),
        jakcard_tier_1_total = COALESCE(jakcard_tier_1_total, 45000),
        jakcard_tier_2_balance = COALESCE(jakcard_tier_2_balance, 50000),
        jakcard_tier_2_total = COALESCE(jakcard_tier_2_total, 75000),
        additional_tariffs = COALESCE(additional_tariffs, '${JSON.stringify(initialRides)}'::jsonb),
        legal_basis_text = COALESCE(legal_basis_text, 'Peraturan Daerah Provinsi DKI Jakarta No. 1 Tahun 2024 tentang Pajak Daerah dan Retribusi Daerah'),
        tariff_notes_id = COALESCE(tariff_notes_id, 'Pembayaran tiket masuk dan wahana di Taman Margasatwa Ragunan wajib menggunakan kartu JakCard Bank DKI atau kartu uang elektronik perbankan lainnya (Cashless).'),
        tariff_notes_en = COALESCE(tariff_notes_en, 'Payment for entrance and rides at Ragunan Zoo requires Bank DKI JakCard or other approved electronic money cards (Cashless).')
      WHERE id IS NOT NULL;
    `);

    // Verify
    const res = await pool.query('SELECT id, adult_price, child_price, schmutzer_weekday_price, parking_car, legal_basis_text FROM public.ticket_settings LIMIT 1');
    console.log('✅ Migration successful! Current settings row sample:', res.rows[0]);
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
