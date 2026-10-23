import pool from '../db.js';
import fs from 'fs';

async function checkPopulation() {
  console.log('=== CHECKING ALL DATABASE TABLES & ROW COUNTS ===\n');

  const tablesRes = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  const tables = tablesRes.rows.map(r => r.table_name);
  const rows = [];
  const empty = [];
  const populated = [];

  for (const table of tables) {
    const countRes = await pool.query(`SELECT count(*) FROM "${table}"`);
    const count = parseInt(countRes.rows[0].count, 10);
    rows.push({ table, count });
    if (count === 0) empty.push(table);
    else populated.push({ table, count });
  }

  console.log('--- POPULATED TABLES (' + populated.length + ') ---');
  console.table(populated);

  console.log('\n--- EMPTY TABLES (' + empty.length + ') ---');
  console.log(empty.join(', '));

  process.exit(0);
}

checkPopulation().catch(err => {
  console.error(err);
  process.exit(1);
});
