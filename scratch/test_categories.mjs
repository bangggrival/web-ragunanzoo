async function test() {
  const cRes = await fetch('http://localhost:3000/categories');
  const cHtml = await cRes.text();
  console.log('Categories status:', cRes.status, 'Contains tiger.svg:', cHtml.includes('tiger.svg'), 'Contains orangutan.svg:', cHtml.includes('orangutan.svg'));

  const fRes = await fetch('http://localhost:3000/fauna');
  const fHtml = await fRes.text();
  console.log('Fauna status:', fRes.status, 'Contains tiger.svg:', fHtml.includes('tiger.svg'), 'Contains orangutan.svg:', fHtml.includes('orangutan.svg'), 'Contains cassowary.svg:', fHtml.includes('cassowary.svg'), 'Contains snake.svg:', fHtml.includes('snake.svg'));

  const catDetailRes = await fetch('http://localhost:3000/animals/category/0cf7ff05-c193-48b0-b080-4b2cde5dfc84');
  const catDetailHtml = await catDetailRes.text();
  console.log('Category Primata Detail status:', catDetailRes.status, 'Contains orangutan.svg:', catDetailHtml.includes('orangutan.svg'));

  const homeRes = await fetch('http://localhost:3000/');
  console.log('Home status:', homeRes.status);
}
test();
