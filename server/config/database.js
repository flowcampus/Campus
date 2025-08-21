const { Pool } = require('pg');
const dns = require('dns').promises;
const https = require('https');
const { URL } = require('url');
require('dotenv').config();

// Single database pool (Supabase Postgres only)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set. Please configure your Supabase Postgres connection string in server/.env');
}

async function resolveHost(hostname) {
  // 1) dns.resolve4
  let ip = await resolveIPv4(hostname, 2500);
  if (ip) return ip;
  // 2) dns.lookup (IPv4)
  ip = await lookupIPv4(hostname, 2500);
  if (ip) return ip;
  // 3) dns.resolveAny (extract IPv4)
  ip = await resolveAnyIPv4(hostname, 2500);
  if (ip) return ip;
  // 4) DoH providers
  ip = await resolveViaDoH(hostname, 3500);
  return ip; // may be null
}

let pool = null;
let poolInitPromise = null;

async function resolveIPv4(hostname, timeoutMs = 3000) {
  try {
    const p = dns.resolve4(hostname);
    const t = new Promise((_, rej) => setTimeout(() => rej(new Error('DNS timeout')), timeoutMs));
    const addrs = await Promise.race([p, t]);
    return Array.isArray(addrs) && addrs.length > 0 ? addrs[0] : null;
  } catch (e) {
    return null;
  }
}

async function lookupIPv4(hostname, timeoutMs = 3000) {
  try {
    const p = dns.lookup(hostname, { family: 4 });
    const t = new Promise((_, rej) => setTimeout(() => rej(new Error('DNS timeout')), timeoutMs));
    const res = await Promise.race([p, t]);
    if (res && res.address) return res.address;
    return null;
  } catch (_) {
    return null;
  }
}

async function resolveAnyIPv4(hostname, timeoutMs = 3000) {
  try {
    const p = dns.resolveAny(hostname);
    const t = new Promise((_, rej) => setTimeout(() => rej(new Error('DNS timeout')), timeoutMs));
    const records = await Promise.race([p, t]);
    if (Array.isArray(records)) {
      const a = records.find((r) => r.address && r.ttl);
      return a ? a.address : null;
    }
    return null;
  } catch (_) {
    return null;
  }
}

function dohFetch(url, timeoutMs) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { accept: 'application/dns-json' } }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const ans = Array.isArray(json.Answer) ? json.Answer.find((a) => a.type === 1 && a.data) : null;
          resolve(ans ? ans.data : null);
        } catch (_) {
          resolve(null);
        }
      });
    });
    req.setTimeout(timeoutMs, () => {
      try { req.destroy(); } catch (_) {}
      resolve(null);
    });
    req.on('error', () => resolve(null));
  });
}

async function resolveViaDoH(hostname, timeoutMs = 4000) {
  const urls = [
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`,
    `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`,
    `https://9.9.9.9/dns-query?name=${encodeURIComponent(hostname)}&type=A`,
  ];
  for (const url of urls) {
    const ip = await dohFetch(url, timeoutMs);
    if (ip) return ip;
  }
  return null;
}

async function resolveViaDoH6(hostname, timeoutMs = 4000) {
  const urls = [
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=AAAA`,
    `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=AAAA`,
  ];
  for (const url of urls) {
    const ip = await dohFetch(url, timeoutMs);
    if (ip) return ip;
  }
  return null;
}

async function initPool() {
  if (!connectionString) return null;

  // Try to parse DATABASE_URL and resolve hostname to IPv4
  let cfg;
  try {
    const u = new URL(connectionString);
    const originalHost = u.hostname;
    const preferV6 = (process.env.PREFER_IPV6 || '').toLowerCase() === 'true';
    const override4 = process.env.DB_HOST_OVERRIDE && process.env.DB_HOST_OVERRIDE.trim() !== '' ? process.env.DB_HOST_OVERRIDE : null;
    const override6 = process.env.DB_HOST_OVERRIDE6 && process.env.DB_HOST_OVERRIDE6.trim() !== '' ? process.env.DB_HOST_OVERRIDE6 : null;
    let hostIP = null;
    if (preferV6) {
      hostIP = override6 || (await resolveHostV6(originalHost)) || override4 || (await resolveHost(originalHost));
    } else {
      hostIP = override4 || (await resolveHost(originalHost)) || override6 || (await resolveHostV6(originalHost));
    }

    cfg = {
      host: hostIP || originalHost,
      port: u.port ? parseInt(u.port, 10) : 5432,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname ? u.pathname.replace(/^\//, '') : 'postgres',
      ssl: (process.env.NODE_ENV === 'production' || connectionString.includes('sslmode=require'))
        ? { rejectUnauthorized: false, servername: originalHost }
        : false,
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '10000'),
      keepAlive: true,
    };
  } catch (e) {
    // Fallback to connectionString if URL parsing fails
    cfg = {
      connectionString,
      ssl: (process.env.NODE_ENV === 'production' || connectionString.includes('sslmode=require'))
        ? { rejectUnauthorized: false }
        : false,
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '10000'),
      keepAlive: true,
    };
  }

  console.log('🔌 Initializing DB pool to host:', cfg.host, 'servername:', cfg.ssl && cfg.ssl.servername ? cfg.ssl.servername : '(none)');
  const p = new Pool(cfg);
  p.on('connect', () => {
    console.log('✅ Connected to PostgreSQL');
  });
  p.on('error', (err) => {
    console.error('❌ Database connection error:', err);
  });
  pool = p;
  return pool;
}

async function getPool() {
  if (pool) return pool;
  if (!poolInitPromise) poolInitPromise = initPool();
  return poolInitPromise;
}

// Helpers
const query = async (text, params) => {
  const p = await getPool();
  if (!p) throw new Error('Database is not configured');
  const start = Date.now();
  try {
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executed', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

const transaction = async (callback) => {
  const p = await getPool();
  if (!p) throw new Error('Database is not configured');
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Health check (Supabase-only)
const healthCheck = async () => {
  const p = await getPool();
  if (!p) return { status: 'disabled' };
  try {
    const result = await p.query('SELECT NOW() as current_time');
    return {
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      connections: p.totalCount,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      code: error.code || error.name,
    };
  }
};

module.exports = {
  pool,
  query,
  transaction,
  healthCheck,
};
