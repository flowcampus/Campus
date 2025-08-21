const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function applySchema() {
  try {
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');

    // Adapt for Supabase: prefer pgcrypto + gen_random_uuid()
    // 1) Ensure pgcrypto extension
    const prelude = `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;

    // 2) Remove uuid-ossp extension line(s)
    sql = sql.replace(/CREATE\s+EXTENSION[^;]*"uuid-ossp"[^;]*;?/gi, '');

    // 3) Replace uuid_generate_v4() with gen_random_uuid()
    sql = sql.replace(/uuid_generate_v4\(\)/gi, 'gen_random_uuid()');

    // Combine
    const finalSql = prelude + '\n' + sql;

    // Split statements naively by ';' while preserving order
    // This is acceptable here since our schema doesn't include complex plpgsql bodies with semicolons.
    const statements = finalSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📐 Applying schema: ${statements.length} statements`);
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';';
      try {
        await query(stmt);
      } catch (err) {
        console.error(`❌ Statement ${i + 1} failed:`, err.message);
        throw err;
      }
    }

    console.log('✅ Schema applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to apply schema:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  applySchema();
}
