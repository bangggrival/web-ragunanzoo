import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUT_DIRS = [
  'server/uploads/org-logos',
  'public/uploads/org-logos',
  'public/org-logos'
];

for (const d of OUT_DIRS) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
}

async function saveToAll(sharpInstance, filename) {
  const buf = await sharpInstance.png().toBuffer();
  for (const dir of OUT_DIRS) {
    fs.writeFileSync(path.join(dir, filename), buf);
  }
  console.log(`Saved ${filename} (${buf.length} bytes) to all dirs`);
}

async function main() {
  // 1. DKI Jakarta
  await saveToAll(
    sharp('server/uploads/org-logos/dki-jakarta.png').trim().resize({ height: 180, fit: 'inside' }),
    'dki-jakarta.png'
  );

  // 2. Distamhut DKI Jakarta
  await saveToAll(
    sharp('server/uploads/org-logos/logo_distamhut_remake_tanpa_background-1786603428184-442076747.png').trim().resize({ height: 180, fit: 'inside' }),
    'distamhut-jakarta.png'
  );

  // 3. PKBSI
  await saveToAll(
    sharp('server/uploads/org-logos/pkbsi-1786160935468-622100983.png').trim().resize({ height: 180, fit: 'inside' }),
    'pkbsi.png'
  );

  // 4. SEAZA
  await saveToAll(
    sharp('server/uploads/org-logos/seaza-clean.png').trim().resize({ height: 140, fit: 'inside' }),
    'seaza.png'
  );

  // 5. WAZA
  await saveToAll(
    sharp('server/uploads/org-logos/WAZA_logo_svg-1786109685193-104529687.webp').trim().resize({ height: 140, fit: 'inside' }),
    'waza.png'
  );

  console.log('All 5 official transparent logos successfully generated!');
}

main();
