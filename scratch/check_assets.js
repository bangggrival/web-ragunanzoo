const http = require('http');

async function testPage() {
  console.log('Testing http://localhost:3000/ ...');
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  console.log('Page HTML status:', res.status, 'bytes:', html.length);
  
  // Find script URLs
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/g;
  let match;
  const scriptUrls = [];
  while ((match = scriptRegex.exec(html)) !== null) {
    scriptUrls.push(match[1]);
  }
  console.log(`Found ${scriptUrls.length} scripts.`);

  for (const url of scriptUrls.slice(0, 10)) {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
    try {
      const sRes = await fetch(fullUrl);
      console.log(`Script ${url.split('/').pop().slice(0, 30)}: status ${sRes.status}`);
    } catch (e) {
      console.error(`Failed to load script ${url}:`, e.message);
    }
  }

  // Also check backend APIs that page calls
  const apis = [
    '/api/animals',
    '/api/events',
    '/api/site-settings',
    '/api/hero-banners',
    '/api/weather'
  ];

  console.log('\nTesting API routes:');
  for (const api of apis) {
    const t0 = Date.now();
    try {
      const aRes = await fetch(`http://localhost:3000${api}`);
      console.log(`API ${api}: status ${aRes.status} in ${Date.now() - t0}ms`);
    } catch (e) {
      console.error(`API ${api} FAILED:`, e.message);
    }
  }
}

testPage();
