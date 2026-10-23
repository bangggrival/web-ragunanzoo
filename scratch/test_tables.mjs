async function checkTable(table) {
  const t0 = Date.now();
  const res = await fetch('http://localhost:3000/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, action: 'select', selects: '*' })
  });
  const data = await res.json();
  console.log(`Table ${table}: Status ${res.status}, Count: ${data?.data?.length}, Time: ${Date.now() - t0}ms`);
}

async function run() {
  await checkTable('animals');
  await checkTable('events');
  await checkTable('site_settings');
  await checkTable('hero_banners');
  
  // Test weather
  const t0 = Date.now();
  const wRes = await fetch('http://localhost:3000/api/weather-proxy');
  console.log(`Weather proxy: Status ${wRes.status} in ${Date.now() - t0}ms`);
}

run();
