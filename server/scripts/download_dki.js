import fs from 'fs';
import path from 'path';

async function downloadFile(url, dest) {
  console.log(`Downloading ${url} -> ${dest}...`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RagunanWeb/1.0'
    }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  console.log(`Saved ${dest} (${buffer.length} bytes)`);
}

async function main() {
  try {
    // 1. Download SVG and PNG of Coat of Arms of Jakarta
    await downloadFile('https://upload.wikimedia.org/wikipedia/commons/e/eb/Coat_of_arms_of_Jakarta.svg', 'server/uploads/org-logos/dki-jakarta.svg');
    await downloadFile('https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Jakarta.svg/1280px-Coat_of_arms_of_Jakarta.svg.png', 'server/uploads/org-logos/dki-jakarta.png');
    
    // Also copy to public/org-logos if needed
    if (!fs.existsSync('public/org-logos')) {
      fs.mkdirSync('public/org-logos', { recursive: true });
    }
    fs.copyFileSync('server/uploads/org-logos/dki-jakarta.png', 'public/org-logos/dki-jakarta.png');
    console.log('Successfully downloaded DKI Jakarta coat of arms!');
  } catch (err) {
    console.error('Download error:', err);
  }
}

main();
