import pool from '../server/db.js';

async function main() {
  const res = await pool.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position
  `);
  const tableMap = {};
  for (const r of res.rows) {
    if (!tableMap[r.table_name]) tableMap[r.table_name] = [];
    tableMap[r.table_name].push(r.column_name);
  }
  console.log(JSON.stringify(tableMap, null, 2));
  process.exit(0);
}

main().catch(console.error);
