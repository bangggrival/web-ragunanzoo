async function test() {
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  console.log('HTML status:', res.status, 'HTML length:', html.length);
  const apis = ['/api/animals', '/api/events', '/api/site-settings', '/api/hero-banners', '/api/weather'];
  for (const api of apis) {
    const t0 = Date.now();
    try {
      const r = await fetch('http://localhost:3000' + api);
      console.log('API', api, 'status:', r.status, 'in', Date.now() - t0, 'ms');
    } catch(e) {
      console.log('API', api, 'ERROR:', e.message);
    }
  }
}
test();
