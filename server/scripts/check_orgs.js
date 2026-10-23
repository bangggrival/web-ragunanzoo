import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'c:/Users/Ahmad Rivaldi/.gemini/antigravity-ide/scratch/web-ragunanzoo/server/.env' });

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
    const res = await pool.query('SELECT id, name, full_name, logo_url, website_url, is_active FROM public.organization_memberships ORDER BY order_index');
    console.log('Orgs count:', res.rows.length);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
