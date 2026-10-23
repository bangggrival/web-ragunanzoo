/**
 * Script Rotasi Password Administrator (Security Hardening)
 * Menjamin akun admin di database memiliki password acak yang kuat
 * dan tidak lagi menggunakan hash default dari file migrasi/backup.
 * 
 * Penggunaan:
 *   node scripts/rotate_admin_passwords.js [username] [newPassword]
 */

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;
const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE || 'ragunan_zoo',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
});

async function rotatePassword() {
  const targetUsername = process.argv[2] || 'admin_rival';
  const newPassword = process.argv[3];

  if (!newPassword) {
    console.error('❌ Mohon sertakan password baru yang kuat!');
    console.log('Format: node scripts/rotate_admin_passwords.js <username> <new_strong_password>');
    console.log('Contoh: node scripts/rotate_admin_passwords.js admin_rival "Ragunan2026!Secure#Admin"');
    process.exit(1);
  }

  if (newPassword.length < 10) {
    console.error('❌ Password minimal harus 10 karakter untuk standar keamanan enterprise.');
    process.exit(1);
  }

  try {
    const salt = await bcrypt.genSalt(12); // Salt work factor 12 for high security
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const result = await pool.query(
      'UPDATE auth.users SET password_hash = $1 WHERE username = $2 RETURNING id, username',
      [passwordHash, targetUsername]
    );

    if (result.rowCount === 0) {
      console.error(`⚠️ Pengguna "${targetUsername}" tidak ditemukan di database.`);
    } else {
      console.log(`✅ [BERHASIL] Password untuk "${targetUsername}" telah dienkripsi dengan bcrypt (Work Factor 12) dan diperbarui di database!`);
    }
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat rotasi password:', err.message);
  } finally {
    await pool.end();
  }
}

rotatePassword();
