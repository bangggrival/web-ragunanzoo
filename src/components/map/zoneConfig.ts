export type MapPointType = 'animal' | 'toilet' | 'musholla' | 'tram' | 'ticket' | 'kuliner' | 'medical';

export interface ZoneConfig {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  position: { x: number; y: number };
  description: string;
  descriptionEn: string;
  type?: MapPointType;
  category?: string;
}

export const zoneConfigs: ZoneConfig[] = [
  {
    id: 'primata',
    name: 'Pusat Primata Schmutzer',
    nameEn: 'Schmutzer Primate Center',
    color: '#F7941D', // Orange
    position: { x: 25, y: 35 },
    description: 'Zona habitat orangutan, gorila, bekantan, dan primata dunia berstandar internasional.',
    descriptionEn: 'World-class habitat zone for orangutans, gorillas, proboscis monkeys, and primates.',
    type: 'animal',
    category: 'primata',
  },
  {
    id: 'mamalia',
    name: 'Mamalia Besar & Gajah',
    nameEn: 'Large Mammals & Elephants',
    color: '#94be2d', // Green
    position: { x: 62, y: 45 },
    description: 'Zona gajah sumatera, jerapah savana, rusa tutul, dan banteng jawa.',
    descriptionEn: 'Zone for Sumatran elephants, giraffes, deer, and Javan banteng.',
    type: 'animal',
    category: 'mamalia',
  },
  {
    id: 'karnivora',
    name: 'Karnivora & Harimau',
    nameEn: 'Carnivores & Tigers',
    color: '#E53935', // Red
    position: { x: 72, y: 68 },
    description: 'Zona harimau sumatera, singa afrika, macan tutul, dan beruang madu.',
    descriptionEn: 'Zone for Sumatran tigers, African lions, leopards, and sun bears.',
    type: 'animal',
    category: 'mamalia',
  },
  {
    id: 'burung',
    name: 'Taman Burung & Pelikan',
    nameEn: 'Bird Park & Pelican Lake',
    color: '#53B4E6', // Blue
    position: { x: 48, y: 35 },
    description: 'Danau terbuka burung pelikan, kubah aves langka, kasuari, dan merak.',
    descriptionEn: 'Open pelican lake, rare aves aviary, cassowaries, and peafowls.',
    type: 'animal',
    category: 'aves',
  },
  {
    id: 'reptil',
    name: 'Taman Reptil & Komodo',
    nameEn: 'Reptile & Komodo Park',
    color: '#8E44AD', // Purple
    position: { x: 32, y: 55 },
    description: 'Zona komodo dragon purba, buaya muara raksasa, kura-kura, dan ular sanca.',
    descriptionEn: 'Zone for ancient Komodo dragons, saltwater crocodiles, turtles, and pythons.',
    type: 'animal',
    category: 'reptil',
  },
];

export const facilityConfigs: ZoneConfig[] = [
  // ── LOKET & GERBANG UTAMA ──
  {
    id: 'pintu_utara',
    name: 'Pintu Masuk Utama (Utara)',
    nameEn: 'Main North Gate & Ticket Counter',
    color: '#1b5e20',
    position: { x: 48, y: 12 },
    description: 'Pintu gerbang utama Ragunan dengan loket kartu JakCard resmi dan halte TransJakarta.',
    descriptionEn: 'Main Ragunan gate with JakCard official ticket counters and TransJakarta bus shelter.',
    type: 'ticket',
    category: 'pintu',
  },
  {
    id: 'pintu_barat',
    name: 'Pintu Masuk Barat (Kav Polri)',
    nameEn: 'West Gate & Ticket Counter',
    color: '#1b5e20',
    position: { x: 12, y: 48 },
    description: 'Pintu barat akses jalan Kav Polri, loket tiket JakCard, dan kantong parkir motor.',
    descriptionEn: 'West entrance access, JakCard counters, and motorcycle parking lot.',
    type: 'ticket',
    category: 'pintu',
  },
  {
    id: 'pintu_timur',
    name: 'Pintu Masuk Timur',
    nameEn: 'East Gate & Ticket Counter',
    color: '#1b5e20',
    position: { x: 88, y: 54 },
    description: 'Pintu sisi timur dekat koridor mamalia besar dan jalan lingkar luar Ragunan.',
    descriptionEn: 'East entrance near large mammals corridor and outer loop road.',
    type: 'ticket',
    category: 'pintu',
  },
  {
    id: 'pintu_selatan',
    name: 'Pintu Masuk Selatan (TB Simatupang)',
    nameEn: 'South Gate & Ticket Counter',
    color: '#1b5e20',
    position: { x: 55, y: 92 },
    description: 'Pintu gerbang selatan Ragunan dekat akses jalan arteri TB Simatupang.',
    descriptionEn: 'South entrance gate near TB Simatupang arterial road access.',
    type: 'ticket',
    category: 'pintu',
  },

  // ── TOILET & RUANG LAKTASI ──
  {
    id: 'toilet_utara',
    name: 'Toilet & Laktasi Plaza Utara',
    nameEn: 'North Plaza Restroom & Nursery',
    color: '#0284c7',
    position: { x: 53, y: 18 },
    description: 'Toilet bersih modern, ramah kursi roda difabel, wastafel otomatis, dan ruang laktasi ibu menyusui.',
    descriptionEn: 'Modern clean restrooms, wheelchair accessible, baby care & nursing room.',
    type: 'toilet',
    category: 'toilet',
  },
  {
    id: 'toilet_danau',
    name: 'Toilet & Wastafel Danau Pelikan',
    nameEn: 'Pelican Lake Restroom',
    color: '#0284c7',
    position: { x: 44, y: 38 },
    description: 'Toilet umum berkapasitas besar di pinggir danau dekat pujasera kuliner.',
    descriptionEn: 'High capacity public restroom on lakeside near culinary food court.',
    type: 'toilet',
    category: 'toilet',
  },
  {
    id: 'toilet_schmutzer',
    name: 'Toilet Difabel & Laktasi Schmutzer',
    nameEn: 'Schmutzer Accessible Restroom',
    color: '#0284c7',
    position: { x: 23, y: 44 },
    description: 'Toilet berstandar internasional ramah anak dan stroller di dalam kawasan Schmutzer.',
    descriptionEn: 'International standard restroom with kid & stroller friendly amenities.',
    type: 'toilet',
    category: 'toilet',
  },
  {
    id: 'toilet_gajah',
    name: 'Toilet Koridor Gajah',
    nameEn: 'Elephant Corridor Restroom',
    color: '#0284c7',
    position: { x: 67, y: 52 },
    description: 'Toilet umum asri berkanopi bambu di sebelah timur panggung observasi gajah.',
    descriptionEn: 'Public restroom east of the elephant observation grandstand.',
    type: 'toilet',
    category: 'toilet',
  },
  {
    id: 'toilet_selatan',
    name: 'Toilet Paviliun Rimba Selatan',
    nameEn: 'South Wilderness Restroom',
    color: '#0284c7',
    position: { x: 62, y: 76 },
    description: 'Toilet umum di koridor harimau sumatera dan kolam kuda nil.',
    descriptionEn: 'Public restroom along tiger and hippo trails.',
    type: 'toilet',
    category: 'toilet',
  },

  // ── MUSHOLLA & TEMPAT IBADAH ──
  {
    id: 'musholla_utama',
    name: 'Masjid Al-Falah & Tempat Wudhu Luas',
    nameEn: 'Al-Falah Mosque (Main)',
    color: '#059669',
    position: { x: 45, y: 24 },
    description: 'Masjid utama berpenyejuk udara sejuk dengan mukena/sarung bersih dan tempat wudhu terpisah.',
    descriptionEn: 'Main air-conditioned mosque with clean prayer amenities and spacious ablution facilities.',
    type: 'musholla',
    category: 'musholla',
  },
  {
    id: 'musholla_schmutzer',
    name: 'Musholla Paviliun Primata',
    nameEn: 'Schmutzer Primate Prayer Room',
    color: '#059669',
    position: { x: 27, y: 46 },
    description: 'Musholla tenang nan asri di dekat pintu keluar Pusat Primata Schmutzer.',
    descriptionEn: 'Serene botanical prayer room near the exit of Schmutzer Primate Center.',
    type: 'musholla',
    category: 'musholla',
  },
  {
    id: 'musholla_timur',
    name: 'Musholla Rindang Koridor Timur',
    nameEn: 'East Corridor Prayer Room',
    color: '#059669',
    position: { x: 80, y: 56 },
    description: 'Musholla kayu rindang di bawah naungan pohon trembesi tua.',
    descriptionEn: 'Shaded wooden prayer pavilion under mature rain trees.',
    type: 'musholla',
    category: 'musholla',
  },

  // ── HALTE KERETA KELILING (TRAM) ──
  {
    id: 'halte_1',
    name: 'Halte Kereta Wisata 1 (Plaza Utara)',
    nameEn: 'Tram Stop 1 (North Plaza)',
    color: '#15803d',
    position: { x: 50, y: 16 },
    description: 'Titik awal naik kereta wisata keliling rute lingkar luar (Tarif Rp 10.000/orang).',
    descriptionEn: 'Starting station for scenic zoo tram loop (Ticket: Rp 10,000/person).',
    type: 'tram',
    category: 'transportasi',
  },
  {
    id: 'halte_2',
    name: 'Halte Kereta Wisata 2 (Danau Pelikan)',
    nameEn: 'Tram Stop 2 (Pelican Lake)',
    color: '#15803d',
    position: { x: 56, y: 38 },
    description: 'Halte transit kereta wisata dekat area danau dan panggung satwa anak.',
    descriptionEn: 'Transit tram station near the lake and children zoo stage.',
    type: 'tram',
    category: 'transportasi',
  },
  {
    id: 'halte_3',
    name: 'Halte Kereta Wisata 3 (Gajah Sumatera)',
    nameEn: 'Tram Stop 3 (Sumatran Elephant)',
    color: '#15803d',
    position: { x: 74, y: 48 },
    description: 'Halte pemberhentian bagi pengunjung atraksi mandi & pakan gajah.',
    descriptionEn: 'Tram stop for the elephant bathing & feeding pavilion.',
    type: 'tram',
    category: 'transportasi',
  },
  {
    id: 'halte_4',
    name: 'Halte Kereta Wisata 4 (Karnivora Selatan)',
    nameEn: 'Tram Stop 4 (Carnivores South)',
    color: '#15803d',
    position: { x: 68, y: 78 },
    description: 'Halte transit selatan dekat kandang harimau sumatera dan beruang madu.',
    descriptionEn: 'South tram stop near the tiger and sun bear habitats.',
    type: 'tram',
    category: 'transportasi',
  },

  // ── KULINER & PUJASERA ──
  {
    id: 'pujasera_danau',
    name: 'Pujasera Danau Ragunan',
    nameEn: 'Ragunan Lakeside Food Court',
    color: '#d97706',
    position: { x: 42, y: 32 },
    description: 'Sentra kuliner lengkap: Es kelapa muda segar, soto betawi, mie ayam baso, dan aneka jajanan.',
    descriptionEn: 'Full food court: Fresh young coconut, Indonesian noodles, snacks & cold beverages.',
    type: 'kuliner',
    category: 'kuliner',
  },
  {
    id: 'kafe_schmutzer',
    name: 'Kafe Rindang Primata',
    nameEn: 'Schmutzer Canopy Cafe',
    color: '#d97706',
    position: { x: 26, y: 39 },
    description: 'Kafe santai menyajikan kopi nusantara, gelato buah segar, dan roti bakar dengan pemandangan kanopi.',
    descriptionEn: 'Relaxing cafe with artisanal coffee, fresh gelato, and tropical forest views.',
    type: 'kuliner',
    category: 'kuliner',
  },

  // ── POS MEDIS / P3K ──
  {
    id: 'pos_medis',
    name: 'Pos Medis & P3K Ragunan',
    nameEn: 'Ragunan Medical & First Aid Post',
    color: '#dc2626',
    position: { x: 55, y: 20 },
    description: 'Posko darurat medis dengan perawat siaga, kotak P3K lengkap, tabung oksigen, dan ambulans siaga.',
    descriptionEn: 'Emergency first aid post with registered nurses, oxygen, and standby ambulance.',
    type: 'medical',
    category: 'medical',
  },
];

export const allMapPoints: ZoneConfig[] = [...zoneConfigs, ...facilityConfigs];

export function getZoneByName(zoneName: string): ZoneConfig | undefined {
  return allMapPoints.find(
    (zone) => zone.name.toLowerCase() === zoneName.toLowerCase() || zone.id.toLowerCase() === zoneName.toLowerCase()
  );
}
