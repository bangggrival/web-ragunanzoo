import fs from 'fs';
import path from 'path';

async function runPhase2Tests() {
  console.log('==============================================');
  console.log('🔒 STARTING PHASE 2 SECURITY HARDENING TESTS');
  console.log('==============================================\n');

  const jwt = await import('../server/node_modules/jsonwebtoken/index.js');
  const secret = 'ragunan_super_secret_production_key_2026_xYz987!@';

  const visitorToken = jwt.default.sign({ id: 'visitor-hacker-99', username: 'malicious_visitor', role: 'visitor' }, secret);
  const adminToken = jwt.default.sign({ id: 'admin-1', username: 'admin_rival', role: 'admin' }, secret);

  let passed = 0;
  let total = 0;

  function assert(title, condition, detail = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${title}`);
    } else {
      console.error(`❌ [FAIL] ${title} - Detail:`, detail);
    }
  }

  // ----------------------------------------------------
  // TEST 1: BOLA/IDOR Protection on service_registrations
  // ----------------------------------------------------
  console.log('--- TEST GROUP 1: BOLA / IDOR Protection on Citizen Data ---');
  const bolaAttempt = await fetch('http://localhost:5005/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${visitorToken}` },
    body: JSON.stringify({ table: 'service_registrations', action: 'select' })
  }).then(r => r.json());
  
  assert(
    'Visitor dumping all service_registrations without tracking_code is BLOCKED (403)',
    bolaAttempt.error && bolaAttempt.error.includes('tracking_code yang valid diperlukan'),
    bolaAttempt
  );

  const trackingAttempt = await fetch('http://localhost:5005/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${visitorToken}` },
    body: JSON.stringify({
      table: 'service_registrations',
      action: 'select',
      filters: [{ column: 'tracking_code', type: 'eq', value: 'REG-TEST-12345' }]
    })
  }).then(r => r.json());

  assert(
    'Visitor querying service_registrations WITH valid tracking_code filter is ALLOWED',
    trackingAttempt.error === null && Array.isArray(trackingAttempt.data),
    trackingAttempt
  );

  const adminQuery = await fetch('http://localhost:5005/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ table: 'service_registrations', action: 'select' })
  }).then(r => r.json());

  assert(
    'Admin/Staff can inspect service_registrations without restrictions',
    adminQuery.error === null && Array.isArray(adminQuery.data),
    adminQuery
  );

  // ----------------------------------------------------
  // TEST 2: WBS Submissions Confidentiality
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 2: Whistleblowing System (WBS) Confidentiality ---');
  const wbsSelectAttempt = await fetch('http://localhost:5005/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${visitorToken}` },
    body: JSON.stringify({ table: 'wbs_submissions', action: 'select' })
  }).then(r => r.json());

  assert(
    'Non-staff user selecting from wbs_submissions is BLOCKED (403)',
    wbsSelectAttempt.error && wbsSelectAttempt.error.includes('WBS'),
    wbsSelectAttempt
  );

  // ----------------------------------------------------
  // TEST 3: Token Revocation / Blacklist on Logout
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 3: Session Invalidation & Token Revocation ---');
  const testUserToken = jwt.default.sign({ id: 'test-user-revoke-1', username: 'test_user', role: 'admin' }, secret, { expiresIn: '1h' });

  // 3a. Before logout: should be able to access private resource
  const beforeLogout = await fetch('http://localhost:5005/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${testUserToken}` },
    body: JSON.stringify({ table: 'user_roles', action: 'select' })
  }).then(r => r.json());

  assert('Token valid and accepted BEFORE logout', beforeLogout.error === null, beforeLogout);

  // 3b. Call logout with this token
  const logoutRes = await fetch('http://localhost:5005/api/auth/logout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${testUserToken}` }
  }).then(r => r.json());

  assert('Logout endpoint confirms token revocation', logoutRes.success === true, logoutRes);

  // 3c. After logout: same token MUST be rejected
  const afterLogout = await fetch('http://localhost:5005/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${testUserToken}` },
    body: JSON.stringify({ table: 'user_roles', action: 'select' })
  }).then(r => r.json());

  assert(
    'Token rejected AFTER logout (revoked in blacklist)',
    afterLogout.error && afterLogout.error.includes('Authentication required'),
    afterLogout
  );

  // ----------------------------------------------------
  // TEST 4: Magic Bytes / File Spoofing Prevention
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 4: Storage Upload Magic Bytes Anti-Spoofing ---');
  
  // 4a. Create spoofed file: HTML / JS disguised as .jpg
  const spoofedContent = '<html><script>alert("XSS")</script></html>';
  const spoofedForm = new FormData();
  spoofedForm.append('bucket', 'wbs-evidence');
  spoofedForm.append('file', new Blob([spoofedContent], { type: 'image/jpeg' }), 'malicious.jpg');

  const spoofedRes = await fetch('http://localhost:5005/api/storage/upload', {
    method: 'POST',
    body: spoofedForm
  }).then(r => r.json());

  assert(
    'Upload of spoofed file (HTML disguised as .jpg) is REJECTED by Magic Bytes validator',
    spoofedRes.error && spoofedRes.error.includes('Magic Bytes'),
    spoofedRes
  );

  // 4b. Create valid 1x1 transparent PNG file with real magic bytes: 89 50 4E 47 0D 0A 1A 0A
  const validPngBytes = new Uint8Array([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);

  const validForm = new FormData();
  validForm.append('bucket', 'wbs-evidence');
  validForm.append('file', new Blob([validPngBytes], { type: 'image/png' }), 'valid_pixel.png');

  const validRes = await fetch('http://localhost:5005/api/storage/upload', {
    method: 'POST',
    body: validForm
  }).then(r => r.json());

  assert(
    'Upload of genuine PNG with valid magic bytes SUCCEEDS',
    validRes.data && validRes.data.url && validRes.error === null,
    validRes
  );

  console.log('\n==============================================');
  console.log(`🏁 PHASE 2 TESTS SUMMARY: ${passed}/${total} PASSED (${Math.round(passed/total*100)}%)`);
  console.log('==============================================');
}

runPhase2Tests();
