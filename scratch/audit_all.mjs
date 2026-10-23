async function runAudit() {
  console.log('=== FULL SYSTEM AUDIT ===\n');

  // 1. Next.js Server on 3000
  console.log('[1] Testing Next.js Dev Server (port 3000):');
  try {
    const t0 = Date.now();
    const res = await fetch('http://localhost:3000/');
    const text = await res.text();
    console.log(`- GET /: Status ${res.status}, Time: ${Date.now() - t0}ms, Size: ${text.length} bytes`);
    
    // Check for Next.js error overlays in HTML
    if (text.includes('Internal Server Error')) {
      console.error('- ERROR: "Internal Server Error" found in HTML!');
    } else if (text.includes('Server Error')) {
      console.error('- ERROR: "Server Error" found in HTML!');
    } else {
      console.log('- HTML content: OK (no server error overlay)');
    }

    // Check if critical elements exist
    const hasHero = text.includes('Suaka Konservasi Satwa Liar');
    const hasSchmutzer = text.includes('Pusat Primata Schmutzer');
    const hasBreakout = text.includes('KOMITMEN PELESTARIAN');
    console.log(`- Elements present: Hero=${hasHero}, Schmutzer=${hasSchmutzer}, Breakout=${hasBreakout}`);
  } catch (e) {
    console.error('- FAILED to reach port 3000:', e.message);
  }

  // 2. Express Backend on 5005
  console.log('\n[2] Testing Express Backend (port 5005):');
  try {
    const t0 = Date.now();
    const res = await fetch('http://localhost:5005/api/health');
    console.log(`- GET /api/health: Status ${res.status}, Time: ${Date.now() - t0}ms`);
  } catch (e) {
    console.log(`- GET /api/health error or not found: ${e.message}`);
  }

  // 3. Database through /api/db (via Next.js rewrite / proxy)
  console.log('\n[3] Testing Database queries via Next.js proxy (/api/db):');
  const tables = ['animals', 'events', 'site_settings', 'hero_banner', 'news', 'facilities'];
  for (const table of tables) {
    const t0 = Date.now();
    try {
      const res = await fetch('http://localhost:3000/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, action: 'select', selects: '*' })
      });
      const data = await res.json();
      console.log(`- Table [${table}]: Status ${res.status}, Records: ${Array.isArray(data?.data) ? data.data.length : 'N/A'}, Error: ${data?.error || 'none'}, Time: ${Date.now() - t0}ms`);
    } catch (e) {
      console.error(`- Table [${table}] FAILED:`, e.message);
    }
  }

  // 4. Test Key Pages in Next.js
  console.log('\n[4] Testing Subpages in Next.js:');
  const pages = ['/map', '/tickets', '/fauna', '/events', '/news', '/history'];
  for (const page of pages) {
    const t0 = Date.now();
    try {
      const res = await fetch(`http://localhost:3000${page}`);
      console.log(`- Page [${page}]: Status ${res.status} in ${Date.now() - t0}ms`);
    } catch (e) {
      console.error(`- Page [${page}] FAILED:`, e.message);
    }
  }

  console.log('\n=== AUDIT COMPLETE ===');
}

runAudit();
