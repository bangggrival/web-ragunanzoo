import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import util from 'util';
import fs from 'fs';

const execAsync = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv
dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;

const dbHost = process.env.PGHOST || '127.0.0.1';

function isLocalHost(host) {
  return host === '127.0.0.1' || host === 'localhost' || host === '::1';
}

async function ensurePostgresRunning() {
  if (process.platform === 'win32' && isLocalHost(dbHost)) {
    const localPgBin = path.join(__dirname, '..', 'pgsql', 'bin', 'postgres.exe');
    const localPgData = path.join(__dirname, '..', 'pgsql', 'data');
    if (fs.existsSync(localPgBin) && fs.existsSync(localPgData)) {
      try {
        const { stdout } = await execAsync('powershell -Command "Get-Process postgres -ErrorAction SilentlyContinue"');
        if (!stdout || !stdout.trim()) {
          const logFile = path.join(__dirname, '..', 'pgsql', 'logfile.log');
          const child = spawn(localPgBin, ['-D', localPgData], {
            detached: true,
            stdio: ['ignore', fs.openSync(logFile, 'a'), fs.openSync(logFile, 'a')]
          });
          child.unref();
          console.log('🚀 Started local PostgreSQL daemon process');
        }
      } catch {}
    }
  }
}

console.log(`📡 Database host resolved to: ${dbHost}`);

const pool = new Pool({
  host: dbHost,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'ragunan_zoo',
  port: parseInt(process.env.PGPORT || '5432', 10),
  // Connection pool settings optimized for high concurrency & anti-DoS
  max: parseInt(process.env.PGMAX_POOL || '35', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 8000,
  statement_timeout: 8000, // 8-second query execution limit (prevents connection starvation)
  query_timeout: 9000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('connect', () => {
  console.log('✅ Successfully connected to PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  // Don't crash immediately — let the pool handle reconnection
});

// Retry logic for initial connection
async function waitForDatabase(maxRetries = 5, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await ensurePostgresRunning();
      const client = await pool.connect();
      console.log(`✅ Database connection established (attempt ${attempt})`);
      client.release();
      return true;
    } catch (err) {
      console.warn(`⏳ Database not ready (attempt ${attempt}/${maxRetries}): ${err.message}`);
      if (attempt === maxRetries) {
        console.warn('⚠️ Could not connect to database after maximum retries. Backend will remain running, but database features require PostgreSQL to be started.');
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  return false;
}

// Export both pool and the waitForDatabase function
export default pool;
export { waitForDatabase };
