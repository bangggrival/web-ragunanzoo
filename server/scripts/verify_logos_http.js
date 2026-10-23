async function checkUrl(url) {
  try {
    const res = await fetch(url);
    console.log(`[${res.status}] ${url} (${res.headers.get('content-type')}, ${res.headers.get('content-length')} bytes)`);
    return res.status === 200;
  } catch (err) {
    console.error(`FAILED: ${url}`, err.message);
    return false;
  }
}

async function main() {
  console.log('--- Verifying Logo Endpoints ---');
  const logos = [
    'http://localhost:3000/uploads/org-logos/dki-jakarta.png',
    'http://localhost:3000/uploads/org-logos/distamhut-jakarta.png',
    'http://localhost:3000/uploads/org-logos/pkbsi.png',
    'http://localhost:3000/uploads/org-logos/seaza.png',
    'http://localhost:3000/uploads/org-logos/waza.png',
    'http://localhost:3000/org-logos/dki-jakarta.png',
    'http://localhost:3000/org-logos/pkbsi.png',
  ];

  for (const l of logos) {
    await checkUrl(l);
  }

  console.log('\n--- Verifying Page Routes ---');
  await checkUrl('http://localhost:3000');
  await checkUrl('http://localhost:3000/history');
}

main();
