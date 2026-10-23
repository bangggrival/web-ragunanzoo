async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'animals', action: 'select', selects: '*' })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data count:', data?.data?.length, 'Error:', data?.error);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
test();
