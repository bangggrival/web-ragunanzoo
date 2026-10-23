async function testBundles() {
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  
  // Extract all src from script tags
  const regex = /<script[^>]+src="([^">]+)"/g;
  let m;
  const bundles = [];
  while ((m = regex.exec(html)) !== null) {
    if (m[1].startsWith('/_next/')) {
      bundles.push(m[1]);
    }
  }

  console.log(`Found ${bundles.length} Next.js bundles in HTML.`);
  let failed = 0;
  for (const b of bundles) {
    const t0 = Date.now();
    try {
      const bRes = await fetch(`http://localhost:3000${b}`);
      if (bRes.status !== 200) {
        console.error(`FAILED ${b}: status ${bRes.status} in ${Date.now() - t0}ms`);
        failed++;
      } else {
        const text = await bRes.text();
        console.log(`OK ${b.slice(0, 45)}... (${text.length} bytes) in ${Date.now() - t0}ms`);
      }
    } catch (e) {
      console.error(`ERROR ${b}:`, e.message);
      failed++;
    }
  }
  console.log(`Summary: ${bundles.length - failed}/${bundles.length} bundles loaded successfully.`);
}

testBundles();
