const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => console.error('DB pool error:', err));

async function query(text, params) {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error('DB error:', err, text.substring(0, 100));
    throw err;
  }
}

module.exports = { query, pool };
