/**
 * Category & Animal SVG Icons Utility & Registry
 * Duotone / Two-Tone Nature Style (Ragunan Zoo Official Brand Colors)
 * Berkas vektor SVG disimpan lokal di: /icons/categories/[nama].svg
 */

export interface CategoryIconMeta {
  key: string;
  nameId: string;
  nameEn: string;
  svgPath: string;
  iconifyIcon: string;
  isCustomDesign?: boolean;
  categoryType: 'fauna' | 'flora';
  keywords: string[];
}

// Backwards-compatibility alias
export type AnimalIconMeta = CategoryIconMeta;

export const CATEGORY_ICONS: Record<string, CategoryIconMeta> = {
  // ════════════════ FAUNA CATEGORIES ════════════════
  mamalia: {
    key: 'mamalia',
    nameId: 'Mamalia',
    nameEn: 'Mammals',
    svgPath: '/icons/categories/mamalia.svg',
    iconifyIcon: 'fluent-emoji-flat:lion',
    categoryType: 'fauna',
    keywords: ['mamalia', 'mammal', 'mammals', 'hewan menyusui', 'satwa mamalia', '🦁', '🐯', '🐾', 'tiger']
  },
  primata: {
    key: 'primata',
    nameId: 'Primata',
    nameEn: 'Primates',
    svgPath: '/icons/categories/primata.svg',
    iconifyIcon: 'fluent-emoji-flat:monkey-face',
    categoryType: 'fauna',
    keywords: ['primata', 'primate', 'primates', 'orangutan', 'orang utan', 'kera', 'monyet', 'gorila', 'gorilla', 'simpanse', 'bekantan', 'schmutzer', '🐒', '🦍', 'chimpanzee', 'squirrel_monkey']
  },
  burung: {
    key: 'burung',
    nameId: 'Burung',
    nameEn: 'Birds',
    svgPath: '/icons/categories/burung.svg',
    iconifyIcon: 'fluent-emoji-flat:eagle',
    categoryType: 'fauna',
    keywords: ['burung', 'bird', 'birds', 'aves', 'unggas', 'kasuari', 'merak', 'kakatua', 'pelikan', 'elang', 'nuri', '🦅', '🦜', '🦩', 'cassowary']
  },
  reptil: {
    key: 'reptil',
    nameId: 'Reptil',
    nameEn: 'Reptiles',
    svgPath: '/icons/categories/reptil.svg',
    iconifyIcon: 'fluent-emoji-flat:lizard',
    categoryType: 'fauna',
    keywords: ['reptil', 'reptile', 'reptiles', 'ular', 'snake', 'buaya', 'crocodile', 'komodo', 'biawak', 'kadal', 'kura-kura', 'turtle', '🦎', '🐊', '🐍', '🐢']
  },
  ikan: {
    key: 'ikan',
    nameId: 'Ikan & Akuatik',
    nameEn: 'Fish & Aquatic',
    svgPath: '/icons/categories/ikan.svg',
    iconifyIcon: 'fluent-emoji-flat:tropical-fish',
    categoryType: 'fauna',
    keywords: ['ikan', 'fish', 'pisces', 'akuatik', 'aquatic', 'hiu', 'shark', 'air tawar', 'arowana', '🐟', 'bull_shark']
  },
  amfibi: {
    key: 'amfibi',
    nameId: 'Amfibi',
    nameEn: 'Amphibians',
    svgPath: '/icons/categories/amfibi.svg',
    iconifyIcon: 'fluent-emoji-flat:frog',
    categoryType: 'fauna',
    keywords: ['amfibi', 'amphibian', 'amphibians', 'katak', 'kodok', 'frog', 'toad', 'salamander', '🐸']
  },
  serangga: {
    key: 'serangga',
    nameId: 'Serangga',
    nameEn: 'Insects',
    svgPath: '/icons/categories/serangga.svg',
    iconifyIcon: 'fluent-emoji-flat:butterfly',
    categoryType: 'fauna',
    keywords: ['serangga', 'insect', 'insects', 'kupu-kupu', 'butterfly', 'lebah', 'kumbang', 'belalang', 'arthropoda', '🦋', '🐛', '🐝']
  },

  // ════════════════ SPECIFIC FAUNA ANIMALS ════════════════
  harimau: {
    key: 'harimau',
    nameId: 'Harimau',
    nameEn: 'Tiger',
    svgPath: '/icons/categories/harimau.svg',
    iconifyIcon: 'fluent-emoji-flat:tiger-face',
    categoryType: 'fauna',
    keywords: ['harimau', 'tiger', 'macan', 'panthera tigris', 'harimau sumatera', 'panthera']
  },
  singa: {
    key: 'singa',
    nameId: 'Singa',
    nameEn: 'Lion',
    svgPath: '/icons/categories/singa.svg',
    iconifyIcon: 'fluent-emoji-flat:lion',
    categoryType: 'fauna',
    keywords: ['singa', 'lion', 'panthera leo']
  },
  gajah: {
    key: 'gajah',
    nameId: 'Gajah',
    nameEn: 'Elephant',
    svgPath: '/icons/categories/gajah.svg',
    iconifyIcon: 'fluent-emoji-flat:elephant',
    categoryType: 'fauna',
    keywords: ['gajah', 'elephant', 'elephas', 'gajah sumatera', 'elephant']
  },
  jerapah: {
    key: 'jerapah',
    nameId: 'Jerapah',
    nameEn: 'Giraffe',
    svgPath: '/icons/categories/jerapah.svg',
    iconifyIcon: 'fluent-emoji-flat:giraffe',
    categoryType: 'fauna',
    keywords: ['jerapah', 'giraffe', 'giraffa']
  },
  unta: {
    key: 'unta',
    nameId: 'Unta',
    nameEn: 'Camel',
    svgPath: '/icons/categories/unta.svg',
    iconifyIcon: 'fluent-emoji-flat:camel',
    categoryType: 'fauna',
    keywords: ['unta', 'camel', 'onta', 'camelus']
  },
  badak: {
    key: 'badak',
    nameId: 'Badak',
    nameEn: 'Rhino',
    svgPath: '/icons/categories/badak.svg',
    iconifyIcon: 'fluent-emoji-flat:rhinoceros',
    categoryType: 'fauna',
    keywords: ['badak', 'rhino', 'rhinoceros', 'badak jawa', 'badak sumatera']
  },
  kasuari: {
    key: 'kasuari',
    nameId: 'Kasuari',
    nameEn: 'Cassowary',
    svgPath: '/icons/categories/kasuari.svg',
    iconifyIcon: 'fluent-emoji-flat:peacock',
    isCustomDesign: true, // Catatan: Satwa endemik/khusus difasilitasi dengan SVG tim desain internal
    categoryType: 'fauna',
    keywords: ['kasuari', 'cassowary', 'casuarius']
  },
  komodo: {
    key: 'komodo',
    nameId: 'Komodo',
    nameEn: 'Komodo Dragon',
    svgPath: '/icons/categories/komodo.svg',
    iconifyIcon: 'fluent-emoji-flat:lizard',
    isCustomDesign: true, // Catatan: Satwa endemik/khusus difasilitasi dengan SVG tim desain internal
    categoryType: 'fauna',
    keywords: ['komodo', 'komodo dragon', 'varanus komodoensis', 'biawak komodo']
  },
  rusa: {
    key: 'rusa',
    nameId: 'Rusa & Herbivora',
    nameEn: 'Deer & Herbivores',
    svgPath: '/icons/categories/rusa.svg',
    iconifyIcon: 'fluent-emoji-flat:deer',
    categoryType: 'fauna',
    keywords: ['rusa', 'deer', 'kijang', 'totol', 'cervus', 'anoa', 'banteng', 'antilop']
  },

  // ════════════════ FLORA CATEGORIES & PLANTS ════════════════
  pohon: {
    key: 'pohon',
    nameId: 'Pohon',
    nameEn: 'Trees',
    svgPath: '/icons/categories/pohon.svg',
    iconifyIcon: 'fluent-emoji-flat:deciduous-tree',
    categoryType: 'flora',
    keywords: ['pohon', 'tree', 'trees', 'kayu', 'peneduh', 'beringin', 'baobab', 'mahoni', 'trembesi', 'jati', '🌳']
  },
  bunga: {
    key: 'bunga',
    nameId: 'Bunga',
    nameEn: 'Flowers',
    svgPath: '/icons/categories/bunga.svg',
    iconifyIcon: 'fluent-emoji-flat:cherry-blossom',
    categoryType: 'flora',
    keywords: ['bunga', 'flower', 'flowers', 'hias', 'tanaman hias', 'mawar', 'melati', 'kembang', '🌸', '🌺', '🌻', '🌼', '💐']
  },
  anggrek: {
    key: 'anggrek',
    nameId: 'Anggrek',
    nameEn: 'Orchids',
    svgPath: '/icons/categories/anggrek.svg',
    iconifyIcon: 'fluent-emoji-flat:lotus',
    categoryType: 'flora',
    keywords: ['anggrek', 'orchid', 'orchids', 'orchidaceae', 'dendrobium', 'phalaenopsis', 'vanda', 'katlea', '🪻', '🪷']
  },
  'tanaman-langka': {
    key: 'tanaman-langka',
    nameId: 'Tanaman Langka',
    nameEn: 'Rare Plants',
    svgPath: '/icons/categories/tanaman-langka.svg',
    iconifyIcon: 'fluent-emoji-flat:seedling',
    isCustomDesign: true, // Spesies langka seperti Rafflesia difasilitasi dengan SVG kustom tim desain internal
    categoryType: 'flora',
    keywords: ['tanaman langka', 'rare plants', 'langka', 'dilindungi', 'rafflesia', 'bangkai', 'titan arum', 'amorphophallus', '🌿', '🌱']
  },
  'tanaman-karnivora': {
    key: 'tanaman-karnivora',
    nameId: 'Tanaman Karnivora',
    nameEn: 'Carnivorous Plants',
    svgPath: '/icons/categories/tanaman-karnivora.svg',
    iconifyIcon: 'fluent-emoji-flat:potted-plant',
    categoryType: 'flora',
    keywords: ['tanaman karnivora', 'carnivorous plants', 'karnivora', 'kantong semar', 'nepenthes', 'venus flytrap', 'drosera', '🪴']
  },
  bambu: {
    key: 'bambu',
    nameId: 'Bambu',
    nameEn: 'Bamboo',
    svgPath: '/icons/categories/bambu.svg',
    iconifyIcon: 'fluent-emoji-flat:bamboo',
    categoryType: 'flora',
    keywords: ['bambu', 'bamboo', 'bambusoideae', 'buluh', 'pring', '🎋']
  },
  kaktus: {
    key: 'kaktus',
    nameId: 'Kaktus & Sukulen',
    nameEn: 'Cactus & Succulents',
    svgPath: '/icons/categories/kaktus.svg',
    iconifyIcon: 'fluent-emoji-flat:cactus',
    categoryType: 'flora',
    keywords: ['kaktus', 'cactus', 'sukulen', 'succulent', 'arid', 'xerofit', '🌵']
  },
  'taman-palem': {
    key: 'taman-palem',
    nameId: 'Taman Palem',
    nameEn: 'Palm Garden',
    svgPath: '/icons/categories/taman-palem.svg',
    iconifyIcon: 'fluent-emoji-flat:palm-tree',
    categoryType: 'flora',
    keywords: ['palem', 'palm', 'arecaceae', 'kelapa', 'kurma', 'pinang', 'taman palem', '🌴']
  }
};

// Aliases for backwards compatibility with previous animal keys
const LEGACY_KEY_MAPPING: Record<string, string> = {
  tiger: 'harimau',
  orangutan: 'primata',
  elephant: 'gajah',
  lion: 'singa',
  giraffe: 'jerapah',
  camel: 'unta',
  rhino: 'badak',
  chimpanzee: 'primata',
  cassowary: 'kasuari',
  snake: 'reptil',
  bull_shark: 'ikan',
  otter: 'mamalia',
  squirrel_monkey: 'primata',
  capybara: 'mamalia',
  meerkat: 'mamalia',
  red_panda: 'mamalia',
  hyena: 'mamalia',
  lemur: 'primata',
  quokka: 'mamalia',
  koala: 'mamalia',
  kangaroo: 'mamalia',
  penguin: 'burung',
  african_wild_dog: 'mamalia',
  tasmanian_devil: 'mamalia',
  dingo: 'mamalia',
  culture_talk: 'primata'
};

export const ANIMAL_ICONS: Record<string, CategoryIconMeta> = CATEGORY_ICONS;

export const FAUNA_ICONS = Object.values(CATEGORY_ICONS).filter(i => i.categoryType === 'fauna');
export const FLORA_ICONS = Object.values(CATEGORY_ICONS).filter(i => i.categoryType === 'flora');

/**
 * Mencari icon Duotone kategori atau satwa/flora berdasarkan nama, nama latin, emoji, atau key
 */
export function getCategoryIcon(nameOrQuery?: string | null, typeHint?: 'fauna' | 'flora'): CategoryIconMeta | null {
  if (!nameOrQuery) return null;
  const query = nameOrQuery.toLowerCase().trim();

  // 1. Cek exact key match di CATEGORY_ICONS
  if (CATEGORY_ICONS[query]) {
    return CATEGORY_ICONS[query];
  }

  // 2. Cek legacy key mapping
  if (LEGACY_KEY_MAPPING[query] && CATEGORY_ICONS[LEGACY_KEY_MAPPING[query]]) {
    return CATEGORY_ICONS[LEGACY_KEY_MAPPING[query]];
  }

  // 3. Prioritaskan list berdasarkan typeHint jika diberikan
  const iconList = Object.values(CATEGORY_ICONS);
  const prioritizedList = typeHint 
    ? [...iconList.filter(i => i.categoryType === typeHint), ...iconList.filter(i => i.categoryType !== typeHint)]
    : iconList;

  // 4. Cek exact nameId / nameEn
  for (const icon of prioritizedList) {
    if (query === icon.nameId.toLowerCase() || query === icon.nameEn.toLowerCase()) {
      return icon;
    }
  }

  // 5. Cek exact keyword match
  for (const icon of prioritizedList) {
    if (icon.keywords.some(kw => kw.toLowerCase() === query)) {
      return icon;
    }
  }

  // 6. Cek substring match dengan prioritas keyword lebih panjang dulu (agar multi-kata seperti "tanaman karnivora" menang)
  // Buat list keyword terurut descending
  const candidates: { icon: CategoryIconMeta; kw: string }[] = [];
  for (const icon of prioritizedList) {
    for (const kw of icon.keywords) {
      if (query.includes(kw) || kw.includes(query)) {
        candidates.push({ icon, kw });
      }
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.kw.length - a.kw.length);
    return candidates[0].icon;
  }

  // 4. Default fallback berdasarkan typeHint
  if (typeHint === 'flora') {
    return CATEGORY_ICONS['pohon'];
  }
  if (typeHint === 'fauna') {
    return CATEGORY_ICONS['mamalia'];
  }

  return null;
}

/**
 * Backwards compatible getAnimalIcon
 */
export function getAnimalIcon(nameOrCategory?: string | null): CategoryIconMeta | null {
  return getCategoryIcon(nameOrCategory);
}

/**
 * Mengambil path SVG Duotone Two-Tone Nature langsung
 */
export function getCategoryIconPath(
  nameOrQuery?: string | null, 
  typeHint?: 'fauna' | 'flora',
  fallback = '/icons/categories/mamalia.svg'
): string {
  const meta = getCategoryIcon(nameOrQuery, typeHint);
  if (meta) return meta.svgPath;
  return typeHint === 'flora' ? '/icons/categories/pohon.svg' : fallback;
}

export function getAnimalIconPath(nameOrCategory?: string | null, fallback = '/icons/categories/mamalia.svg'): string {
  return getCategoryIconPath(nameOrCategory, 'fauna', fallback);
}
