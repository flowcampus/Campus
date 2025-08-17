const { Pool } = require('pg');
require('dotenv').config();

// Factory to create a configured pool
const createPool = (connectionString, label) => {
  if (!connectionString) return null;
  const pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : // Respect explicit sslmode if present on the URL as well
          (connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('connect', () => {
    console.log(`✅ Connected to PostgreSQL (${label})`);
  });

  pool.on('error', (err) => {
    console.error(`❌ Database connection error (${label}):`, err);
  });

  return pool;
};

// Resolve connection URLs (backward compatible)
const PRIMARY_URL = process.env.DATABASE_URL_PRIMARY || process.env.DATABASE_URL;
const SECONDARY_URL = process.env.DATABASE_URL_SECONDARY || null; // Expect a Postgres connection string

// Pools
const primaryPool = createPool(PRIMARY_URL, 'primary');
const secondaryPool = createPool(SECONDARY_URL, 'secondary');

// Scoped helpers
const makeHelpers = (pool) => {
  if (!pool) return null;
  const query = async (text, params) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('📊 Query executed', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('❌ Query error:', error);
      throw error;
    }
  };

  const transaction = async (callback) => {
    const client = await pool.connect();
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

  return { pool, query, transaction };
};

const primary = makeHelpers(primaryPool);
const secondary = makeHelpers(secondaryPool);

// Backward compatible helpers (default to primary)
const query = primary ? primary.query : async () => {
  throw new Error('Primary database is not configured');
};
const transaction = primary ? primary.transaction : async () => {
  throw new Error('Primary database is not configured');
};

// Health check for one pool
const checkPool = async (helpers) => {
  if (!helpers) return { status: 'disabled' };
  try {
    const result = await helpers.query('SELECT NOW() as current_time');
    return {
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      connections: helpers.pool.totalCount,
    };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};

// Combined health check
const healthCheck = async () => {
  const [primaryHealth, secondaryHealth] = await Promise.all([
    checkPool(primary),
    checkPool(secondary),
  ]);
  return {
    primary: primaryHealth,
    secondary: secondaryHealth,
  };
};

module.exports = {
  // Back-compat default exports
  pool: primary ? primary.pool : null,
  query,
  transaction,
  // Named helpers for explicit usage
  primary,
  secondary,
  healthCheck,
};
