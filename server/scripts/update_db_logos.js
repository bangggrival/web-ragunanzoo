import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' });

const { Pool } = pg;
const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'ragunan_zoo',
  port: parseInt(process.env.PGPORT || '5432', 10),
});

async function main() {
  try {
    const updates = [
      {
        nameLike: '%Provinsi DKI Jakarta%',
        logo_url: '/uploads/org-logos/dki-jakarta.png'
      },
      {
        nameLike: '%Dinas Pertamanan%',
        logo_url: '/uploads/org-logos/distamhut-jakarta.png'
      },
      {
        nameLike: '%PKBSI%',
        logo_url: '/uploads/org-logos/pkbsi.png'
      },
      {
        nameLike: '%SEAZA%',
        logo_url: '/uploads/org-logos/seaza.png'
      },
      {
        nameLike: '%WAZA%',
        logo_url: '/uploads/org-logos/waza.png'
      },
    ];

    for (const u of updates) {
      const res = await pool.query(
        'UPDATE public.organization_memberships SET logo_url = $1 WHERE name ILIKE $2 RETURNING id, name, logo_url',
        [u.logo_url, u.nameLike]
      );
      console.log(`Updated ${u.nameLike}:`, res.rows);
    }

    const check = await pool.query('SELECT id, name, logo_url, is_active FROM public.organization_memberships ORDER BY order_index');
    console.log('All memberships now:');
    console.table(check.rows);
  } catch (err) {
    console.error('Error updating memberships:', err);
  } finally {
    await pool.end();
  }
}

main();
