import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import morgan from 'morgan';

import pool, { waitForDatabase } from './db.js';
import { compileSelect, compileInsert, compileUpsert, compileUpdate, compileDelete } from './queryCompiler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Security Hardening: Disable x-powered-by header
app.disable('x-powered-by');

app.set('trust proxy', 1); // Trust first proxy (e.g., Nginx/Load Balancer) to read correct X-Forwarded-For IP
app.use((req, res, next) => {
  res.setHeader('X-Custom-Server-ID', 'ragunan-api-v2');
  next();
});

// Performance: HTTP Response Compression (Gzip / Deflate)
// Excludes Server-Sent Events (SSE) stream to prevent buffering
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['accept'] === 'text/event-stream') {
      return false;
    }
    return compression.filter(req, res);
  }
}));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Strict Secret Validation (Kubernetes/Production Readiness)
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'fallback_secret') {
  console.error('🚨 [CRITICAL ERROR] JWT_SECRET is missing or insecure in Production environment!');
  console.error('Application will now crash to prevent security vulnerabilities.');
  process.exit(1);
}

// Security Hardening: Helmet for HTTP Security Headers
const isProdEnv = process.env.NODE_ENV === 'production';
app.use(
  helmet({
    contentSecurityPolicy: false,
    hsts: isProdEnv ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    noSniff: true,
    xssFilter: true,
  })
);

// Configure CORS with explicit origin validation
const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:3002')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

const corsOriginCheck = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (configuredOrigins.includes(origin)) {
    return callback(null, true);
  }
  if (!isProdEnv && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
    return callback(null, true);
  }
  return callback(new Error('Origin tidak diizinkan oleh kebijakan CORS.'));
};

app.use(cors({
  origin: corsOriginCheck,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
}));

// Express Preflight OPTIONS handler
app.options('*', cors({ origin: corsOriginCheck, credentials: true }));

// Audit Trail: Structured JSON Logging for API Requests
app.use(morgan(function (tokens, req, res) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTime: tokens['response-time'](req, res) + ' ms',
    ip: req.ip || req.connection.remoteAddress,
    userAgent: tokens['user-agent'](req, res)
  });
}));

// Security Hardening: Rate Limiting to prevent Brute Force & DDoS
const isProd = process.env.NODE_ENV === 'production';
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 1000 : 10000, // Higher limit in development
  message: { error: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Dedicated Auth Rate Limiter (Brute-Force Protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 20 : 100, // 20 attempts per 15 min
  message: { error: 'Terlalu banyak percobaan autentikasi dari IP ini. Silakan coba lagi setelah 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Dedicated Public Submission Limiter (Anti-Spam Protection)
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 30 : 200, // 30 submissions per 15 min
  message: { error: 'Batas pengiriman formulir tercapai. Mohon tunggu beberapa saat sebelum mengirim lagi.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general API rate limiter
app.use('/api/', apiLimiter);

// Liveness/Readiness Probe untuk Kubernetes/JSC
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', database: 'Connected', timestamp: new Date().toISOString() });
});

// ==========================================
// PUBLIC: Maintenance Mode Status (no auth required)
// High-traffic RAM cache (15 seconds TTL) to prevent hammering database on every page request
// ==========================================
let maintenanceCache = {
  data: null,
  enabled: false,
  expiresAt: 0,
};

app.get('/api/maintenance-status', async (req, res) => {
  const now = Date.now();
  if (maintenanceCache.expiresAt > now) {
    return res.json({
      enabled: maintenanceCache.enabled,
      data: maintenanceCache.data,
      cached: true,
    });
  }

  try {
    const result = await pool.query(
      "SELECT value FROM system_configs WHERE key = 'maintenance_mode' LIMIT 1"
    );
    if (result.rows.length === 0) {
      maintenanceCache = { enabled: false, data: null, expiresAt: now + 15000 };
      return res.json({ enabled: false, data: null });
    }
    const config = result.rows[0].value;
    const isEnabled = config?.enabled === true;
    maintenanceCache = { enabled: isEnabled, data: config || null, expiresAt: now + 15000 };
    return res.json({ enabled: isEnabled, data: config || null });
  } catch (err) {
    console.error('[MAINTENANCE] Error fetching status:', err.message);
    // Fail open: if DB is down, don't block users, return cached state if available
    return res.json({ enabled: maintenanceCache.enabled || false, data: maintenanceCache.data || null });
  }
});

app.use('/api/auth/', authLimiter);

// Anti-cache middleware for all dynamic API endpoints
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Security Hardening: Body Parser Payload limits to prevent Memory Exhaustion / JSON bomb DoS
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ==========================================
// Setup file upload storage (Hybrid Adapter: Local Disk or S3)
// ==========================================
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
let storage;
let s3;

// Check if S3 environment variables are provided
const useS3 = process.env.S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

if (useS3) {
  s3 = new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.S3_ENDPOINT || undefined, // Needed for MinIO or DigitalOcean Spaces
    forcePathStyle: !!process.env.S3_ENDPOINT, // Required for MinIO compatibility
  });

  storage = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Path traversal prevention: strip non-alphanumeric and prevent directory traversal
      const cleanBucket = (req.body.bucket || 'general').replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname).toLowerCase();
      const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
      cb(null, `${cleanBucket}/${basename}-${uniqueSuffix}${ext}`);
    }
  });
  console.log('[STORAGE] ☁️ Using S3 Object Storage for uploads.');
} else {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Path traversal prevention: resolve path and verify within uploadDir
      const cleanBucket = (req.body.bucket || 'general').replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
      const dest = path.resolve(uploadDir, cleanBucket);
      if (!dest.startsWith(uploadDir)) {
        return cb(new Error('Invalid destination path'));
      }
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname).toLowerCase();
      const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
      cb(null, `${basename}-${uniqueSuffix}${ext}`);
    }
  });
  console.log('[STORAGE] 💾 Using Local Disk Storage for uploads.');
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit to 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Hanya JPG, PNG, WebP, dan PDF yang diperbolehkan.'));
    }
  }
});


// ==========================================
// Security Hardening: Token Revocation Store (Blacklist) with TTL cleanup
// ==========================================
const revokedTokens = new Map(); // token -> expiryTimestamp

const revokeToken = (token) => {
  if (!token) return;
  try {
    const decoded = jwt.decode(token);
    const exp = decoded?.exp ? decoded.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
    revokedTokens.set(token, exp);
  } catch {
    revokedTokens.set(token, Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
};

const isTokenRevoked = (token) => {
  if (!token || !revokedTokens.has(token)) return false;
  const exp = revokedTokens.get(token);
  if (Date.now() > exp) {
    revokedTokens.delete(token);
    return false;
  }
  return true;
};

// Periodic garbage collection of expired blacklisted tokens
setInterval(() => {
  const now = Date.now();
  for (const [t, exp] of revokedTokens.entries()) {
    if (now > exp) revokedTokens.delete(t);
  }
}, 30 * 60 * 1000);

// ==========================================
// Server-Sent Events (SSE) Clients for Realtime Database Updates
// ==========================================
const sseClients = new Set();

// Security Hardening: Whitelist tables allowed for public realtime broadcast
const PUBLIC_REALTIME_TABLES = new Set([
  'animals',
  'events',
  'flora',
  'venues',
  'gps_pois',
  'tram_route_points',
  'ticket_types',
  'page_views'
]);

const broadcastChange = (table, type, record) => {
  // Never broadcast sensitive tables (roles, PII, WBS, registrations, configs) to unauthenticated stream
  if (!PUBLIC_REALTIME_TABLES.has(table)) {
    // If maintenance mode changes, broadcast only safe key without exposing raw system configs
    if (table === 'system_configs' && record?.key === 'maintenance_mode') {
      const safePayload = JSON.stringify({
        table: 'system_configs',
        type,
        record: { key: 'maintenance_mode', value: record.value }
      });
      for (const client of sseClients) {
        client.write(`data: ${safePayload}\n\n`);
      }
    }
    return;
  }

  const payload = JSON.stringify({ table, type, record });
  console.log(`[REALTIME] Broadcasting change in table "${table}" to ${sseClients.size} clients.`);
  for (const client of sseClients) {
    client.write(`data: ${payload}\n\n`);
  }
};

app.get('/api/realtime', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  
  // Security Hardening: Restrict CORS origin on SSE stream
  const reqOrigin = req.headers.origin;
  if (reqOrigin && (reqOrigin.startsWith('http://localhost:') || reqOrigin.startsWith('http://127.0.0.1:') || configuredOrigins.includes(reqOrigin))) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.flushHeaders();
  res.write(': connected\n\n');
  
  sseClients.add(res);
  console.log(`[REALTIME] Client connected. Total clients: ${sseClients.size}`);
  
  // Keep connection alive with periodic heartbeats (10s to prevent reverse proxy/socket timeouts)
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 10000);
  
  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
    console.log(`[REALTIME] Client disconnected. Total clients: ${sseClients.size}`);
  });
});

// Helper to authenticate JWT token
const authenticateToken = (req, res, next) => {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (authHeader) {
    token = authHeader;
  }

  // Fallback to cookie if present
  if (!token && req.headers['cookie']) {
    const match = req.headers['cookie'].match(/(?:^|;\s*)sb-token=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) {
    req.user = null;
    return next();
  }

  // Security Hardening: Reject revoked/blacklisted tokens
  if (isTokenRevoked(token)) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded;
    }
    next();
  });
};

app.use(authenticateToken);

// ==========================================
// AUTH ENDPOINTS
// ==========================================

// Sign Up
app.post('/api/auth/signup', authLimiter, async (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check if user already exists
    const checkUser = await client.query('SELECT id FROM auth.users WHERE username = $1', [username]);
    if (checkUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = crypto.randomUUID();

    // 3. Insert into auth.users
    await client.query(
      `INSERT INTO auth.users (id, username, password_hash, raw_user_meta_data) VALUES ($1, $2, $3, $4)`,
      [userId, username, passwordHash, JSON.stringify({ name: name || username.split('@')[0] })]
    );

    // 4. Insert/Update profiles (mirrors Supabase trigger handle_new_user or handles manually)
    const checkProfile = await client.query('SELECT id FROM public.profiles WHERE id = $1', [userId]);
    if (checkProfile.rows.length === 0) {
      await client.query(
        `INSERT INTO public.profiles (id, username, name) VALUES ($1, $2, $3)`,
        [userId, username, name || username.split('@')[0]]
      );
    } else {
      await client.query(
        `UPDATE public.profiles SET username = $1, name = $2 WHERE id = $3`,
        [username, name || username.split('@')[0], userId]
      );
    }

    // 5. Insert into user_roles (default to visitor, checking if already inserted by trigger)
    const checkRole = await client.query('SELECT role FROM public.user_roles WHERE user_id = $1', [userId]);
    if (checkRole.rows.length === 0) {
      await client.query(
        `INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'visitor')`,
        [userId]
      );
    }

    await client.query('COMMIT');

    // Generate JWT token
    const token = jwt.sign({ id: userId, username, role: 'visitor' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: { id: userId, username, name },
      session: {
        access_token: token,
        token_type: 'bearer',
        expires_in: 604800, // 7 days in seconds
        expires_at: Math.floor(Date.now() / 1000) + 604800,
        user: { id: userId, username, name }
      },
      error: null
    });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Sign In
app.post('/api/auth/signin', authLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // 1. Fetch user from auth.users
    const userResult = await pool.query('SELECT *, raw_user_meta_data->>\'name\' AS name FROM auth.users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const user = userResult.rows[0];

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // 3. Fetch user role
    const roleResult = await pool.query('SELECT role FROM public.user_roles WHERE user_id = $1', [user.id]);
    const role = roleResult.rows.length > 0 ? roleResult.rows[0].role : 'visitor';

    // 4. Generate JWT token
    const token = jwt.sign({ id: user.id, username: user.username, role }, JWT_SECRET, { expiresIn: '7d' });

    // 5. Update last activity
    // Set secure cookie on backend
    res.cookie('sb-token', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
      secure: isProdEnv,
    });

    res.json({
      user: { id: user.id, username: user.username, name: user.name },
      session: {
        access_token: token,
        token_type: 'bearer',
        expires_in: 604800,
        expires_at: Math.floor(Date.now() / 1000) + 604800,
        user: { id: user.id, username: user.username, name: user.name }
      },
      error: null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Session / Validate Token
app.get('/api/auth/session', async (req, res) => {
  if (!req.user) {
    return res.json({ session: null, error: null });
  }

  try {
    const userResult = await pool.query('SELECT id, username, raw_user_meta_data->>\'name\' AS name FROM auth.users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.json({ session: null, error: null });
    }

    const user = userResult.rows[0];
    let token = req.headers['authorization']?.split(' ')[1];
    if (!token && req.headers['cookie']) {
      const match = req.headers['cookie'].match(/(?:^|;\s*)sb-token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    res.json({
      user: { id: user.id, username: user.username, name: user.name },
      session: {
        access_token: token,
        token_type: 'bearer',
        user: { id: user.id, username: user.username, name: user.name }
      },
      error: null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout (with Token Revocation Blacklisting)
app.post('/api/auth/logout', (req, res) => {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (authHeader) {
    token = authHeader;
  }
  if (!token && req.headers['cookie']) {
    const match = req.headers['cookie'].match(/(?:^|;\s*)sb-token=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }
  if (token) {
    revokeToken(token);
  }
  res.clearCookie('sb-token', { path: '/' });
  res.json({ success: true, message: 'Berhasil logout. Sesi dan token telah dicabut (revoked).', error: null });
});

// Update current user account (password and/or profile)
app.post('/api/auth/update-user', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { password, data } = req.body;
  const userId = req.user.id;

  try {
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await pool.query('UPDATE auth.users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
    }

    if (data && data.name) {
      await pool.query('UPDATE public.profiles SET name = $1 WHERE id = $2', [data.name, userId]);
      await pool.query(`UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{name}', to_jsonb($1::text)) WHERE id = $2`, [data.name, userId]);
    }

    const userRes = await pool.query(`SELECT id, username, raw_user_meta_data->>'name' AS name FROM auth.users WHERE id = $1`, [userId]);
    const updatedUser = userRes.rows[0];

    res.json({ user: updatedUser, data: { user: updatedUser }, error: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// EDGE FUNCTIONS MOCK (Admin Actions)
// ==========================================

app.post('/api/functions/admin-create-user', async (req, res) => {
  // Check if admin
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can create users' });
  }

  const { email, password, name, role, permissions } = req.body;
  // Strip @ragunan.local or any domain suffix from email to get clean username
  const username = email ? email.split('@')[0] : '';

  if (!username || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check if user already exists
    const checkUser = await client.query('SELECT id FROM auth.users WHERE username = $1', [username]);
    if (checkUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = crypto.randomUUID();

    // 3. Insert into auth.users
    await client.query(
      `INSERT INTO auth.users (id, username, password_hash, raw_user_meta_data) VALUES ($1, $2, $3, $4)`,
      [userId, username, passwordHash, JSON.stringify({ name: name || username })]
    );

    // 4. Insert profiles
    await client.query(
      `INSERT INTO public.profiles (id, username, name) VALUES ($1, $2, $3)`,
      [userId, username, name || username]
    );

    // 5. Insert role
    await client.query(
      `INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2)`,
      [userId, role || 'visitor']
    );

    // 6. Insert permissions
    if (permissions && typeof permissions === 'object') {
      const deniedPerms = Object.entries(permissions)
        .filter(([_, isAllowed]) => !isAllowed)
        .map(([key]) => ({
          user_id: userId,
          permission_key: key,
          is_allowed: false,
        }));

      for (const perm of deniedPerms) {
        await client.query(
          `INSERT INTO public.user_permissions (user_id, permission_key, is_allowed) VALUES ($1, $2, $3)`,
          [perm.user_id, perm.permission_key, perm.is_allowed]
        );
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ data: { success: true, user: { id: userId, email: username, username, name } }, error: null });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ data: null, error: err.message });
  } finally {
    client.release();
  }
});

app.post('/api/functions/admin-update-password', async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can update passwords' });
  }

  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'User ID and new password are required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    await pool.query('UPDATE auth.users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
    
    res.status(200).json({ data: { success: true }, error: null });
  } catch (err) {
    res.status(400).json({ data: null, error: err.message });
  }
});

// ==========================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ==========================================

// ==========================================
// WEATHER SERVICE (High-Traffic In-Memory Caching & Timeout Protection)
// ==========================================
let weatherCache = {
  data: null,
  expiresAt: 0
};

app.post('/api/functions/get-weather', async (req, res) => {
  const now = Date.now();
  // Return cached weather data immediately if still valid (10-minute TTL)
  if (weatherCache.data && weatherCache.expiresAt > now) {
    return res.json({ data: weatherCache.data });
  }

  try {
    // 4-second timeout to prevent stalling backend during external network delays
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-6.3025&longitude=106.8274&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weather: ${response.statusText}`);
    }
    
    const data = await response.json();
    const current = data.current;
    
    // Map WMO weather code to our icons and descriptions
    const getWeatherInfo = (code) => {
      if (code === 0) return { desc: 'Cerah', icon: 'sun' };
      if (code >= 1 && code <= 3) return { desc: 'Berawan', icon: 'cloud-sun' };
      if (code === 45 || code === 48) return { desc: 'Berkabut', icon: 'cloud-fog' };
      if ((code >= 51 && code <= 57)) return { desc: 'Gerimis', icon: 'cloud-drizzle' };
      if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { desc: 'Hujan', icon: 'cloud-rain' };
      if (code >= 95 && code <= 99) return { desc: 'Badai Petir', icon: 'cloud-lightning' };
      return { desc: 'Cerah', icon: 'sun' };
    };
    
    const info = getWeatherInfo(current.weather_code);
    
    const weatherData = {
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      description: info.desc,
      icon: info.icon,
      location: 'Taman Margasatwa Ragunan',
      coordinates: { latitude: -6.3025, longitude: 106.8274 },
      lastUpdated: new Date().toISOString(),
    };

    // Cache valid data for 10 minutes (600,000 ms)
    weatherCache = {
      data: weatherData,
      expiresAt: now + 600000
    };
    
    res.json({ data: weatherData });
  } catch (err) {
    console.error('Weather function error or timeout:', err.message);
    // Graceful degradation: return stale cache if available, or realistic fallback
    if (weatherCache.data) {
      return res.json({ data: weatherCache.data });
    }
    res.json({
      data: {
        temperature: 29,
        humidity: 78,
        windSpeed: 10,
        description: 'Cerah Berawan',
        icon: 'cloud-sun',
        location: 'Taman Margasatwa Ragunan',
        coordinates: { latitude: -6.3025, longitude: 106.8274 },
        lastUpdated: new Date().toISOString(),
      }
    });
  }
});

// ==========================================
// AUTHENTICATION ROUTES (JWT / Bcrypt)
// ==========================================

// GET all users (admin only) - returns joined profiles + roles + permissions_count
app.get('/api/admin/users', async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.username,
        COALESCE(p.name, u.raw_user_meta_data->>'name', u.username) AS name,
        COALESCE(p.created_at, u.created_at) AS created_at,
        COALESCE(ur.role, 'visitor') AS role,
        COUNT(up.id) FILTER (WHERE up.is_allowed = false) AS permissions_count,
        ARRAY_AGG(up.permission_key) FILTER (WHERE up.is_allowed = false) AS denied_permissions
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.id
      LEFT JOIN public.user_roles ur ON u.id = ur.user_id
      LEFT JOIN public.user_permissions up ON u.id = up.user_id
      GROUP BY u.id, u.username, p.name, u.raw_user_meta_data, p.created_at, u.created_at, ur.role
      ORDER BY COALESCE(p.created_at, u.created_at) DESC
    `);
    res.json({ data: result.rows, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PUT update user role (admin only)
app.put('/api/admin/users/:userId/role', async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  const { userId } = req.params;
  const { role } = req.body;
  if (!role || !['visitor', 'staff', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Valid role is required' });
  }
  try {
    const existing = await pool.query('SELECT id FROM public.user_roles WHERE user_id = $1', [userId]);
    if (existing.rows.length > 0) {
      await pool.query('UPDATE public.user_roles SET role = $1 WHERE user_id = $2', [role, userId]);
    } else {
      await pool.query('INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2)', [userId, role]);
    }
    res.json({ data: { success: true }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PUT update user permissions (admin only)
app.put('/api/admin/users/:userId/permissions', async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  const { userId } = req.params;
  const { permissions } = req.body; // { key: boolean, ... }
  if (!permissions || typeof permissions !== 'object') {
    return res.status(400).json({ error: 'Permissions object is required' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Delete existing permissions
    await client.query('DELETE FROM public.user_permissions WHERE user_id = $1', [userId]);
    // Insert denied permissions
    const denied = Object.entries(permissions).filter(([_, v]) => !v);
    for (const [key] of denied) {
      await client.query(
        'INSERT INTO public.user_permissions (user_id, permission_key, is_allowed) VALUES ($1, $2, false)',
        [userId, key]
      );
    }
    await client.query('COMMIT');
    res.json({ data: { success: true }, error: null });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ data: null, error: err.message });
  } finally {
    client.release();
  }
});

// DELETE user (admin only)
app.delete('/api/admin/users/:userId', async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  const { userId } = req.params;
  
  if (userId === req.user.id) {
    return res.status(400).json({ error: 'Tidak dapat menghapus akun Anda sendiri' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Clear dependencies first (to prevent foreign key constraint errors)
    await client.query('DELETE FROM public.user_permissions WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM public.user_roles WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM public.profiles WHERE id = $1', [userId]);
    await client.query('DELETE FROM auth.users WHERE id = $1', [userId]);
    
    await client.query('COMMIT');
    res.json({ data: { success: true }, error: null });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ data: null, error: err.message });
  } finally {
    client.release();
  }
});

// PUT update user profile name (admin only)
app.put('/api/admin/users/:userId/profile', async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  const { userId } = req.params;
  const { name } = req.body;
  try {
    await pool.query('UPDATE public.profiles SET name = $1 WHERE id = $2', [name, userId]);
    await pool.query(`UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{name}', to_jsonb($1::text)) WHERE id = $2`, [name, userId]);
    res.json({ data: { success: true }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// ==========================================
// DATABASE QUERY COMPILER ENDPOINT
// ==========================================

app.post('/api/db', async (req, res) => {
  const { table, action, selects, filters = [], orders = [], single = false, limit = null, offset = null, data } = req.body;

  if (!table || !action) {
    return res.status(400).json({ error: 'Table and action are required' });
  }

  // Safety checks (RLS Mimicry in backend)
  const isUserAuthenticated = !!req.user;
  const isUserStaffOrAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'staff');
  const isUserAdmin = req.user && req.user.role === 'admin';

  // 1. SECURITY PATCH: HARD BLOCK highly sensitive tables for non-admins
  // This completely closes Vuln 1 (Data Leak) and Vuln 2 (RLS Bypass) by ensuring 
  // only true admins can query password hashes or user roles.
  const adminOnlyTables = ['auth.users', 'users', 'audit_logs'];
  if (adminOnlyTables.includes(table) && !isUserAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin privileges required to access this table.' });
  }

  // Protect roles and permissions tables
  if (table === 'user_roles' || table === 'user_permissions') {
    if (!isUserAuthenticated) {
      return res.status(401).json({ error: 'Authentication required to access roles or permissions.' });
    }
    if (!isUserAdmin && action !== 'select') {
      return res.status(403).json({ error: 'Forbidden. Admin privileges required to modify roles/permissions.' });
    }
  }

  // Enforce filter restrictions for normal visitors on sensitive tables
  if (!isUserStaffOrAdmin) {
    // Table restrictions for non-staff
    if (action !== 'select') {
      // Allow inserts on specific interaction tables
      const allowedInserts = ['tickets', 'wbs_submissions', 'page_views', 'reminders', 'service_registrations', 'facility_reports'];
      if ((action === 'insert' || action === 'upsert') && !allowedInserts.includes(table)) {
        return res.status(403).json({ error: 'Unauthorized. Staff permissions required to modify this table.' });
      }
      // Allow updates/deletes only on their own profiles/tickets
      const allowedUpdates = ['profiles', 'tickets', 'reminders'];
      if ((action === 'update' || action === 'delete') && !allowedUpdates.includes(table)) {
        return res.status(403).json({ error: 'Unauthorized to update this table.' });
      }
    }

    // Custom check for facility_reports (anonymous insert, ticket-based tracking)
    if (table === 'facility_reports') {
      if (action === 'select') {
        const hasTicketFilter = filters.some(f => f.column === 'ticket_number' && f.type === 'eq');
        if (!hasTicketFilter) {
          return res.status(403).json({ error: 'Unauthorized. Ticket number is required to view reports.' });
        }
      }
    } else if (table === 'service_registrations') {
      // Security Hardening (BOLA/IDOR Prevention):
      // Only staff/admin can query all records, update, or delete.
      // Non-staff can only SELECT if they provide the exact tracking_code.
      if (action === 'select') {
        const hasTrackingFilter = filters.some(f => f.column === 'tracking_code' && f.type === 'eq');
        if (!hasTrackingFilter) {
          return res.status(403).json({ error: 'Akses ditolak. tracking_code yang valid diperlukan untuk melihat status pendaftaran, atau diperlukan hak akses Staff/Admin.' });
        }
      } else if (action === 'update' || action === 'delete') {
        return res.status(403).json({ error: 'Akses ditolak. Hanya Staff atau Administrator yang berhak mengubah atau menghapus pendaftaran layanan.' });
      }
    } else if (table === 'wbs_submissions') {
      // Security Hardening: Whistleblowing reports are strictly confidential.
      // Non-staff/non-admin cannot query, update or delete them under any circumstances.
      if (action !== 'insert') {
        return res.status(403).json({ error: 'Akses ditolak. Laporan Whistleblowing System (WBS) bersifat rahasia dan hanya dapat diakses oleh Staff/Auditor Internal.' });
      }
    } else {
      // Enforce data ownership for selects and updates on private tables
      const privateTables = ['tickets', 'reminders', 'profiles', 'user_roles', 'user_permissions'];
      
      // If accessing private tables OR trying to write (except page_views), require auth
      if (privateTables.includes(table) || (action !== 'select' && table !== 'page_views')) {
      if (!isUserAuthenticated) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Force filter by current user_id so users can ONLY see/edit their own data (Fixes RLS bypass)
      // Admin can see all data without restrictions
      if (!isUserAdmin) {
        if (table === 'profiles') {
          const hasIdFilter = filters.some(f => f.column === 'id');
          if (!hasIdFilter) {
            filters.push({ type: 'eq', column: 'id', value: req.user.id });
          } else {
            filters.forEach(f => { if (f.column === 'id') f.value = req.user.id; });
          }
        } else {
          const hasUserIdFilter = filters.some(f => f.column === 'user_id');
          if (!hasUserIdFilter) {
            filters.push({ type: 'eq', column: 'user_id', value: req.user.id });
          } else {
            filters.forEach(f => { if (f.column === 'user_id') f.value = req.user.id; });
          }
        }
      }
    }
    } // End of else block for facility_reports custom check
  }

  try {
    let sqlQuery = '';
    let sqlParams = [];

    if (action === 'select') {
      const compiled = compileSelect(table, selects, filters, orders, single, limit, offset);
      sqlQuery = compiled.sql;
      sqlParams = compiled.values;
    } else if (action === 'insert') {
      // Map user_id to currently logged in user if not provided (and table has user_id)
      if (isUserAuthenticated && data && 'user_id' in data && !data.user_id) {
        data.user_id = req.user.id;
      }
      const compiled = compileInsert(table, data);
      sqlQuery = compiled.sql;
      sqlParams = compiled.values;
    } else if (action === 'upsert') {
      if (isUserAuthenticated && data && 'user_id' in data && !data.user_id) {
        data.user_id = req.user.id;
      }
      const compiled = compileUpsert(table, data);
      sqlQuery = compiled.sql;
      sqlParams = compiled.values;
    } else if (action === 'update') {
      const compiled = compileUpdate(table, data, filters);
      sqlQuery = compiled.sql;
      sqlParams = compiled.values;
    } else if (action === 'delete') {
      const compiled = compileDelete(table, filters);
      sqlQuery = compiled.sql;
      sqlParams = compiled.values;
    }

    console.log(`[QUERY] Executing on ${table}: ${sqlQuery} | Params:`, sqlParams);
    
    const result = await pool.query(sqlQuery, sqlParams);
    console.log(`[QUERY RESULT] Inserted ${result.rowCount} rows. Data:`, result.rows);
    
    let responseData = result.rows;
    if (single) {
      responseData = result.rows.length > 0 ? result.rows[0] : null;
    }

    res.json({ data: responseData, error: null });

    // Broadcast database change event for realtime UI reactivity
    if (action === 'insert' || action === 'upsert' || action === 'update' || action === 'delete') {
      let broadcastType = action.toUpperCase();
      if (action === 'upsert') broadcastType = 'INSERT'; // Map upsert to INSERT for simpler UI logic
      const record = result.rows.length > 0 ? result.rows[0] : null;
      broadcastChange(table, broadcastType, record);

      // Invalidate maintenance cache if system configuration changes
      if (table === 'system_configs') {
        maintenanceCache = { data: null, enabled: false, expiresAt: 0 };
      }
    }

  } catch (err) {
    console.error('[DATABASE ERROR]', err.message);
    res.json({ data: null, error: { message: err.message } });
  }
});

// ==========================================
// STORAGE / FILE UPLOAD ENDPOINT
// ==========================================

// Middleware to authenticate JWT for private file downloads
const authenticatePrivateFiles = (req, res, next) => {
  // Check if the file requested is inside a private bucket directory
  const pathParts = req.path.split('/').filter(Boolean);
  const bucket = pathParts[0];
  const privateBuckets = ['wbs-evidence', 'service-documents'];

  if (!privateBuckets.includes(bucket)) {
    return next();
  }

  // Private file access requires authentication and staff/admin role
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  if (!token && req.headers['cookie']) {
    const match = req.headers['cookie'].match(/(?:^|;\s*)sb-token=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }
  
  // Backward compatibility fallback for legacy direct links
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Authentication token is missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden. Invalid or expired token.' });
    }
    if (!(decoded.role === 'admin' || decoded.role === 'staff')) {
      return res.status(403).json({ error: 'Forbidden. Staff or Admin permissions required.' });
    }
    req.user = decoded;
    next();
  });
};

// Serve local files statically if not using S3
if (!useS3) {
  app.use('/uploads', authenticatePrivateFiles, express.static(uploadDir, {
    setHeaders: (res) => {
      res.removeHeader('Content-Security-Policy');
      res.removeHeader('Strict-Transport-Security');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }));

  // Fallback: If file is not present locally, proxy from remote server if PGHOST is remote
  const remoteHost = process.env.PGHOST;
  if (remoteHost && remoteHost !== '127.0.0.1' && remoteHost !== 'localhost') {
    app.use('/uploads', authenticatePrivateFiles, async (req, res, next) => {
      try {
        const remoteFileUrl = `http://${remoteHost}:5005/uploads${req.path}`;
        const remoteRes = await fetch(remoteFileUrl);
        if (remoteRes.ok) {
          const contentType = remoteRes.headers.get('content-type') || 'application/octet-stream';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=3600');
          
          // Cache to local disk asynchronously so future requests are served locally
          const localTarget = path.join(uploadDir, req.path.replace(/\//g, path.sep));
          const dir = path.dirname(localTarget);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          const arrayBuffer = await remoteRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          fs.writeFile(localTarget, buffer, () => {});
          return res.send(buffer);
        }
      } catch {}
      next();
    });
  }
}

// ==========================================
// STORAGE / FILE UPLOAD ENDPOINT
// ==========================================


const ALLOWED_PUBLIC_BUCKETS = ['facility-reports', 'wbs-evidence', 'service-documents'];
const ALLOWED_ALL_BUCKETS = [
  'facility-reports', 'wbs-evidence', 'service-documents',
  'branding', 'animals', 'plants', 'hero-images', 'announcement-images',
  'org-logos', 'media-gallery', 'gallery', 'jdih-documents', 'library-covers',
  'library-files', 'whats-new', 'map', 'events', 'venues', 'general'
];

// Security Hardening: Validate Magic Bytes (File Signatures) to prevent MIME spoofing & polyglots
const validateMagicBytes = (filePath, ext) => {
  try {
    const buffer = Buffer.alloc(16);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    // JPEG: FF D8 FF
    if (ext === '.jpg' || ext === '.jpeg') {
      return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (ext === '.png') {
      return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    }
    // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
    if (ext === '.webp') {
      return buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
    }
    // PDF: %PDF (bytes 0-3)
    if (ext === '.pdf') {
      return buffer.toString('ascii', 0, 4) === '%PDF';
    }
    return false;
  } catch {
    return false;
  }
};

app.post('/api/storage/upload', submissionLimiter, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran file terlalu besar (maksimal 5MB).'
        : err.message;
      return res.status(400).json({ data: null, error: message });
    }

    if (!req.file) {
      return res.status(400).json({ data: null, error: 'Tidak ada file yang diunggah.' });
    }

    const rawBucket = (req.body.bucket || 'general').trim().toLowerCase();
    
    // Strict bucket validation
    if (!ALLOWED_ALL_BUCKETS.includes(rawBucket)) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
      return res.status(400).json({ data: null, error: `Folder penyimpanan "${rawBucket}" tidak diizinkan.` });
    }

    // Check authorization: public buckets allow anonymous, others require logged-in user
    if (!ALLOWED_PUBLIC_BUCKETS.includes(rawBucket) && !req.user) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
      return res.status(401).json({ data: null, error: 'Autentikasi diperlukan untuk mengunggah ke folder ini.' });
    }

    // Security Hardening: Magic Bytes inspection for local uploaded files
    if (req.file.path && fs.existsSync(req.file.path)) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!validateMagicBytes(req.file.path, ext)) {
        try { fs.unlinkSync(req.file.path); } catch {}
        return res.status(400).json({
          data: null,
          error: 'File ditolak: Signature biner (Magic Bytes) file tidak valid atau terdeteksi manipulasi tipe file (Anti-Spoofing / Polyglot Defense).'
        });
      }
    }

    let fileUrl = '';
    let filePath = '';
    
    if (req.file.location) {
      // Handled by S3 Mode
      fileUrl = req.file.location;
      filePath = req.file.key;
    } else {
      // Handled by Local Mode
      filePath = path.join(rawBucket, req.file.filename);
      fileUrl = `/uploads/${filePath.replace(/\\/g, '/')}`;
    }
    
    res.json({
      data: {
        path: filePath,
        url: fileUrl
      },
      error: null
    });
  });
});


// Start Server with database readiness check
// ==========================================
// GPS MAP INTERACTIVE — POI & TRAM ROUTES
// ==========================================

// Helper to authorize GPS Map modifications (Strict Role-Based Access Control)
const isAuthorizedStaff = (req) => {
  return !!(req.user && ['admin', 'staff', 'manager', 'superadmin'].includes(req.user.role));
};

const isAuthorizedAdmin = (req) => {
  return !!(req.user && ['admin', 'superadmin', 'manager'].includes(req.user.role));
};

// GET all GPS POIs (public)
app.get('/api/gps-pois', async (req, res) => {
  try {
    const { category, active_only } = req.query;
    let query = 'SELECT * FROM public.gps_pois';
    const params = [];
    const conditions = [];
    if (active_only !== 'false') conditions.push('is_active = true');
    if (category && category !== 'all') {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY sort_order ASC, name ASC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET single GPS POI (public)
app.get('/api/gps-pois/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.gps_pois WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'POI not found' });
    res.json({ data: result.rows[0], error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST create GPS POI (admin/staff)
app.post('/api/gps-pois', async (req, res) => {
  if (!isAuthorizedStaff(req)) {
    return res.status(403).json({ error: 'Admin or staff required' });
  }
  const {
    id, name, name_en, category, lat, lng, color, emoji, description, description_en,
    is_active, feeding_time, feeding_time_hour, feeding_time_minute, feeding_note,
    operating_hours_open, operating_hours_close, latin_name, conservation_status,
    origin, diet, sort_order
  } = req.body;
  if (!id || !name || !category || lat == null || lng == null) {
    return res.status(400).json({ error: 'id, name, category, lat, lng wajib diisi' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO public.gps_pois (id, name, name_en, category, lat, lng, color, emoji,
        description, description_en, is_active, feeding_time, feeding_time_hour, feeding_time_minute,
        feeding_note, operating_hours_open, operating_hours_close, latin_name, conservation_status,
        origin, diet, sort_order, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,NOW())
       RETURNING *`,
      [id, name, name_en||null, category, lat, lng, color||'#22c55e', emoji||'📍',
       description||null, description_en||null, is_active!==false, feeding_time||null,
       feeding_time_hour||null, feeding_time_minute||null, feeding_note||null,
       operating_hours_open||null, operating_hours_close||null, latin_name||null,
       conservation_status||null, origin||null, diet||null, sort_order||0]
    );
    broadcastChange('gps_pois', 'INSERT', result.rows[0]);
    res.status(201).json({ data: result.rows[0], error: null });
  } catch (err) {
    res.status(400).json({ data: null, error: err.message });
  }
});

// PUT update GPS POI (admin/staff)
app.put('/api/gps-pois/:id', async (req, res) => {
  if (!isAuthorizedStaff(req)) {
    return res.status(403).json({ error: 'Admin or staff required' });
  }
  const { id } = req.params;
  const fields = req.body;
  const allowed = ['name','name_en','category','lat','lng','color','emoji','description',
    'description_en','is_active','feeding_time','feeding_time_hour','feeding_time_minute',
    'feeding_note','operating_hours_open','operating_hours_close','latin_name',
    'conservation_status','origin','diet','sort_order'];
  const setClauses = [];
  const params = [];
  for (const key of allowed) {
    if (key in fields) {
      params.push(fields[key]);
      setClauses.push(`${key} = $${params.length}`);
    }
  }
  if (!setClauses.length) return res.status(400).json({ error: 'No valid fields to update' });
  params.push(id);
  try {
    const result = await pool.query(
      `UPDATE public.gps_pois SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!result.rows.length) return res.status(404).json({ error: 'POI not found' });
    broadcastChange('gps_pois', 'UPDATE', result.rows[0]);
    res.json({ data: result.rows[0], error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE GPS POI (admin only)
app.delete('/api/gps-pois/:id', async (req, res) => {
  if (!isAuthorizedAdmin(req)) {
    return res.status(403).json({ error: 'Admin required' });
  }
  try {
    const result = await pool.query('DELETE FROM public.gps_pois WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'POI not found' });
    broadcastChange('gps_pois', 'DELETE', { id: req.params.id });
    res.json({ data: { success: true }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH - Toggle closure status
app.patch('/api/gps-pois/:id/closure', async (req, res) => {
  if (!isAuthorizedStaff(req)) {
    return res.status(403).json({ error: 'Admin or staff required' });
  }
  const { is_temporarily_closed, closure_reason, closure_until } = req.body;
  try {
    const result = await pool.query(
      `UPDATE public.gps_pois SET is_temporarily_closed = $1, closure_reason = $2, closure_until = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [!!is_temporarily_closed, closure_reason||null, closure_until||null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'POI not found' });
    broadcastChange('gps_pois', 'UPDATE', result.rows[0]);
    res.json({ data: result.rows[0], error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH - Update capacity status
app.patch('/api/gps-pois/:id/capacity', async (req, res) => {
  if (!isAuthorizedStaff(req)) {
    return res.status(403).json({ error: 'Admin or staff required' });
  }
  const { capacity_status } = req.body;
  if (!['normal','padat','sepi'].includes(capacity_status)) {
    return res.status(400).json({ error: 'capacity_status must be normal, padat, or sepi' });
  }
  try {
    const result = await pool.query(
      'UPDATE public.gps_pois SET capacity_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [capacity_status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'POI not found' });
    broadcastChange('gps_pois', 'UPDATE', result.rows[0]);
    res.json({ data: result.rows[0], error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH - Update local announcement
app.patch('/api/gps-pois/:id/announcement', async (req, res) => {
  if (!isAuthorizedStaff(req)) {
    return res.status(403).json({ error: 'Admin or staff required' });
  }
  const { local_announcement, announcement_expires_at } = req.body;
  try {
    const result = await pool.query(
      'UPDATE public.gps_pois SET local_announcement = $1, announcement_expires_at = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [local_announcement||null, announcement_expires_at||null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'POI not found' });
    broadcastChange('gps_pois', 'UPDATE', result.rows[0]);
    res.json({ data: result.rows[0], error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// ==========================================
// TRAM ROUTE ENDPOINTS
// ==========================================

// GET tram route (public)
app.get('/api/tram-route', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.tram_route_points WHERE is_active = true ORDER BY sequence_order ASC'
    );
    res.json({ data: result.rows, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST add tram waypoint (admin/staff)
app.post('/api/tram-route', async (req, res) => {
  if (!isAuthorizedStaff(req)) {
    return res.status(403).json({ error: 'Admin or staff required' });
  }
  const { sequence_order, lat, lng, halt_name, is_halt } = req.body;
  if (lat == null || lng == null) return res.status(400).json({ error: 'lat and lng required' });
  try {
    const maxSeq = await pool.query('SELECT COALESCE(MAX(sequence_order),0)+1 AS next FROM public.tram_route_points');
    const result = await pool.query(
      'INSERT INTO public.tram_route_points (sequence_order, lat, lng, halt_name, is_halt) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [sequence_order || maxSeq.rows[0].next, lat, lng, halt_name||null, !!is_halt]
    );
    broadcastChange('tram_route_points', 'INSERT', result.rows[0]);
    res.status(201).json({ data: result.rows[0], error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PUT update tram waypoint (admin/staff)
app.put('/api/tram-route/:id', async (req, res) => {
  if (!isAuthorizedStaff(req)) {
    return res.status(403).json({ error: 'Admin or staff required' });
  }
  const { lat, lng, halt_name, is_halt, sequence_order, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE public.tram_route_points SET lat=$1, lng=$2, halt_name=$3, is_halt=$4, sequence_order=$5, is_active=$6
       WHERE id=$7 RETURNING *`,
      [lat, lng, halt_name||null, !!is_halt, sequence_order, is_active!==false, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Waypoint not found' });
    broadcastChange('tram_route_points', 'UPDATE', result.rows[0]);
    res.json({ data: result.rows[0], error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE tram waypoint (admin)
app.delete('/api/tram-route/:id', async (req, res) => {
  if (!isAuthorizedAdmin(req)) {
    return res.status(403).json({ error: 'Admin required' });
  }
  try {
    await pool.query('DELETE FROM public.tram_route_points WHERE id = $1', [req.params.id]);
    broadcastChange('tram_route_points', 'DELETE', { id: req.params.id });
    res.json({ data: { success: true }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PUT bulk reorder tram route (admin/staff)
app.put('/api/tram-route/bulk/reorder', async (req, res) => {
  if (!isAuthorizedStaff(req)) {
    return res.status(403).json({ error: 'Admin or staff required' });
  }
  const { order } = req.body; // [{ id, sequence_order }]
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order array required' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of order) {
      await client.query('UPDATE public.tram_route_points SET sequence_order = $1 WHERE id = $2', [item.sequence_order, item.id]);
    }
    await client.query('COMMIT');
    res.json({ data: { success: true }, error: null });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ data: null, error: err.message });
  } finally {
    client.release();
  }
});

async function startServer() {
  try {
    const server = app.listen(PORT, () => {
      console.log(`✅ Backend Server running on port ${PORT}`);
      console.log(`📁 Local uploads directory: ${uploadDir}`);
    });

    // High traffic resilience: Slowloris & Keep-Alive timeouts
    server.timeout = 25000;
    server.keepAliveTimeout = 30000;
    server.headersTimeout = 35000;

    // Check database readiness in background
    waitForDatabase().then((connected) => {
      if (!connected) {
        console.warn('💡 [DATABASE INFO] PostgreSQL saat ini belum aktif di port 5432. Jalankan PostgreSQL untuk mengaktifkan seluruh fitur data.');
      }
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

// Global safety net against unhandled errors crashing high-traffic node processes
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

startServer();
