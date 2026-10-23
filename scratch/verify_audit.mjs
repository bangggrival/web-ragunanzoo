async function verifyAll() {
  console.log('=== STARTING AUDIT VERIFICATION ===');
  
  // 1. Health check
  const health = await fetch('http://localhost:5005/api/health').then(r => r.json());
  console.log('1. Backend Health:', health.status === 'OK' && health.database === 'Connected' ? '✅ PASS' : '❌ FAIL', health);

  // 2. Next.js frontend root
  const frontRes = await fetch('http://localhost:3000');
  console.log('2. Frontend Root HTTP:', frontRes.status === 200 ? '✅ PASS' : '❌ FAIL', frontRes.status);

  // 3. SQL Injection blocked
  const sqli = await fetch('http://localhost:5005/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table: 'animals', action: 'select', selects: '(SELECT current_database()) as db' })
  }).then(r => r.json());
  console.log('3. SQL Injection Blocked:', sqli.error && sqli.error.message.includes('Potential SQL Injection') ? '✅ PASS' : '❌ FAIL');

  // 4. Data Leak user_roles blocked
  const leak = await fetch('http://localhost:5005/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table: 'user_roles', action: 'select' })
  }).then(r => r.json());
  console.log('4. user_roles Leak Blocked:', leak.error === 'Authentication required to access roles or permissions.' ? '✅ PASS' : '❌ FAIL');

  // 5. Manager Edge Route Guard without token
  const noToken = await fetch('http://localhost:3000/manager', { redirect: 'manual' });
  console.log('5. Manager Guard (no token -> 307):', noToken.status === 307 ? '✅ PASS' : '❌ FAIL', noToken.status);

  // 6. Manager Edge Route Guard with fake token
  const fakeToken = await fetch('http://localhost:3000/manager', { redirect: 'manual', headers: { Cookie: 'sb-token=faketoken123' } });
  console.log('6. Manager Guard (fake token -> 307):', fakeToken.status === 307 ? '✅ PASS' : '❌ FAIL', fakeToken.status);

  const jwt = await import('../server/node_modules/jsonwebtoken/index.js');
  const s = 'ragunan_super_secret_production_key_2026_xYz987!@';
  const adminToken = jwt.default.sign({ id: '1', role: 'admin' }, s);
  const realAdmin = await fetch('http://localhost:3000/manager', { redirect: 'manual', headers: { Cookie: 'sb-token=' + adminToken } });
  console.log('7. Manager Guard (valid admin -> 200):', realAdmin.status === 200 ? '✅ PASS' : '❌ FAIL', realAdmin.status);

  // 8. Upload bucket protection
  const form = new FormData();
  form.append('bucket', 'branding');
  form.append('file', new Blob(['test'], { type: 'image/png' }), 'test.png');
  const uploadRes = await fetch('http://localhost:5005/api/storage/upload', { method: 'POST', body: form }).then(r => r.json());
  console.log('8. Upload Bucket Guard:', uploadRes.error === 'Autentikasi diperlukan untuk mengunggah ke folder ini.' ? '✅ PASS' : '❌ FAIL');

  console.log('=== ALL TESTS COMPLETED ===');
}
verifyAll();
