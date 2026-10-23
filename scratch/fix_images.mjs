import pool from '../server/db.js';

async function main() {
  await pool.query('UPDATE animals SET image_url = $1 WHERE id = 5', ['https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?w=800&auto=format&fit=crop&q=80']);
  await pool.query('UPDATE animals SET image_url = $1 WHERE id = 7', ['https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=800&auto=format&fit=crop&q=80']);
  await pool.query('UPDATE events SET image_url = $1 WHERE id = 2', ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80']);
  await pool.query('UPDATE events SET image_url = $1 WHERE id = 6', ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80']);
  await pool.query('UPDATE plants SET image_url = $1 WHERE id = 4', ['https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800&auto=format&fit=crop&q=80']);
  await pool.query('UPDATE plants SET image_url = $1 WHERE id = 5', ['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80']);
  console.log('✅ Successfully updated 6 dead image URLs in database!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
