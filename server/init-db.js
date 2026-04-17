const fs = require('fs');
const path = require('path');
const { query } = require('./db');

async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  try {
    await query(schema);
    console.log('✅ Database schema initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize database schema:', err.message);
    throw err;
  }
}

module.exports = { initDb };
