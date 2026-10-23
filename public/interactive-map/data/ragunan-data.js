// =====================================================================
//  TAMAN MARGASATWA RAGUNAN - DATABASE GEOSPASIAL & NAVIGASI LENGKAP
// =====================================================================

export const RAGUNAN_MAP_CONFIG = {
  center: [-6.3124, 106.8202],
  defaultZoom: 16,
  minZoom: 14,
  maxZoom: 19,
  maxBounds: [
    [-6.3300, 106.8000], // Southwest
    [-6.2950, 106.8400]  // Northeast
  ]
};

// KONFIGURASI TILE LAYERS PETA (100% FREE - TANPA API KEY)
export const TILE_LAYERS = {
  osmHot: {
    name: 'Peta Taman Rindang (OSM)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    subdomains: 'abc',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  osmStandard: {
    name: 'Peta Standar (OSM)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  satellite: {
    name: 'Foto Satelit Realistis',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
  }
};

// LINTASAN JALUR KERETA WISATA KELILING (TRAM SCENIC LOOP)
export const KERETA_KELILING_ROUTE = [
  [-6.3062, 106.8195], // Halte 1 (Plaza Masuk Utara)
  [-6.3075, 106.8210],
  [-6.3090, 106.8214], // Halte 2 (Danau Pelikan)
  [-6.3100, 106.8228],
  [-6.3115, 106.8240], // Halte 3 (Gajah Sumatera)
  [-6.3130, 106.8250],
  [-6.3148, 106.8238],
  [-6.3160, 106.8215], // Halte 4 (Karnivora Rimba Selatan)
  [-6.3165, 106.8195],
  [-6.3150, 106.8182],
  [-6.3135, 106.8172], // Dekat Gerbang Schmutzer
  [-6.3115, 106.8168],
  [-6.3095, 106.8180],
  [-6.3078, 106.8188],
  [-6.3062, 106.8195]  // Kembali ke Halte 1
];

// DAFTAR TITIK SATWA (ANIMALS)
export const RAGUNAN_ANIMALS = [
  {
    id: 'gajah_sumatera',
    name: 'Gajah Sumatera',
    latin: 'Elephas maximus sumatranus',
    category: 'mamalia',
    categoryLabel: 'Mamalia Besar',
    coords: [-6.3125, 106.8232],
    nodeId: 'n_gajah',
    img: 'assets/gajah_sumatera.jpg',
    emoji: '🐘',
    color: '#388e3c',
    status: 'Kritis Terancam Punah (CR)',
    origin: 'Hutan Hujan Dataran Rendah Sumatera',
    diet: 'Herbivora (Rumput gajah, kelapa, tebu, buah-buahan)',
    feedingTime: '14.00 WIB',
    feedingTimeHour: 14,
    feedingTimeMinute: 0,
    feedingNote: 'Atraksi Mandi & Pemberian Makan Gajah',
    description: 'Kandang gajah sumatera luas terbuka dengan panggung observasi kanopi teduh bertingkat dan kolam mandi alami.',
    funFacts: [
      'Memiliki telinga lebih kecil dibandingkan gajah afrika.',
      'Dapat mengonsumsi hingga 150 kg hijauan dan 100 liter air setiap harinya.',
      'Belalai gajah memiliki lebih dari 40.000 otot mandiri tanpa tulang rawan.'
    ],
    audioScript: 'Halo Sahabat Satwa! Selamat datang di Kandang Gajah Sumatera Taman Margasatwa Ragunan. Anda sedang melihat satwa mamalia darat terbesar di Indonesia. Gajah-gajah di sini dirawat dengan program konservasi intensif dan pengayaan pakan alami.'
  },
  {
    id: 'harimau_sumatera',
    name: 'Harimau Sumatera',
    latin: 'Panthera tigris sumatrae',
    category: 'karnivora',
    categoryLabel: 'Karnivora Puncak',
    coords: [-6.3155, 106.8208],
    nodeId: 'n_harimau',
    img: 'assets/harimau_sumatera.jpg',
    emoji: '🐅',
    color: '#e65100',
    status: 'Kritis Terancam Punah (CR)',
    origin: 'Hutan Tropis Sumatera',
    diet: 'Karnivora (Daging sapi segar, daging ayam)',
    feedingTime: '11.30 WIB',
    feedingTimeHour: 11,
    feedingTimeMinute: 30,
    feedingNote: 'Pemberian Pakan Daging Segar Predator',
    description: 'Habitat replika hutan hujan lebat dengan selokan air dan bebatuan alami untuk melatih naluri berburu kucing besar.',
    funFacts: [
      'Subspesies harimau terkecil di dunia dengan garis loreng paling rapat.',
      'Sangat mahir berenang karena memiliki selaput khusus di sela-sela jarinya.',
      'Penglihatan malam harimau 6 kali lebih tajam dibanding manusia.'
    ],
    audioScript: 'Perhatian pengunjung yang budiman, ini adalah Harimau Sumatera, predator puncak endemik kebanggaan Indonesia. Harap menjaga ketenangan dan tidak melempar benda apapun ke dalam kandang.'
  },
  {
    id: 'schmutzer_primata',
    name: 'Pusat Primata Schmutzer (Gorila & Orangutan)',
    latin: 'Gorilla gorilla & Pongo pygmaeus',
    category: 'primata',
    categoryLabel: 'Pusat Primata Dunia',
    coords: [-6.3138, 106.8175],
    nodeId: 'n_schmutzer',
    img: 'assets/gorilla.jpg',
    emoji: '🦍',
    color: '#f57c00',
    status: 'Kritis Terancam Punah (CR)',
    origin: 'Afrika Tengah & Hutan Tropis Kalimantan',
    diet: 'Omnivora / Frugivora (Buah-buahan, dedaunan, umbi)',
    feedingTime: '13.30 WIB',
    feedingTimeHour: 13,
    feedingTimeMinute: 30,
    feedingNote: 'Enrichment Buah & Sayuran Gorila',
    description: 'Salah satu pusat konservasi primata termodern di dunia dengan area open-enclosure alami, gua penjelajahan, dan jembatan kanopi gantung.',
    funFacts: [
      'Gorila Schmutzer Ragunan mendiami pulau lembah rumput terbuka tanpa teralis besi.',
      'Orangutan berbagi 97% kemiripan DNA genetik dengan manusia.',
      'Pengunjung dilarang membawa makanan dan tas plastik demi kenyamanan satwa.'
    ],
    audioScript: 'Selamat datang di Pusat Primata Schmutzer Ragunan, salah satu suaka primata terlengkap bertaraf internasional. Saksikan tingkah cerdas gorila dan orangutan di lingkungan alaminya yang rimbun.'
  },
  {
    id: 'komodo',
    name: 'Komodo & Taman Reptil',
    latin: 'Varanus komodoensis',
    category: 'reptil',
    categoryLabel: 'Reptil Raksasa',
    coords: [-6.3115, 106.8170],
    nodeId: 'n_reptil',
    img: 'assets/komodo.jpg',
    emoji: '🦎',
    color: '#6a1b9a',
    status: 'Genteng (EN)',
    origin: 'Taman Nasional Komodo, NTT',
    diet: 'Karnivora (Daging kambing, unggas)',
    feedingTime: '10.30 WIB',
    feedingTimeHour: 10,
    feedingTimeMinute: 30,
    feedingNote: 'Atraksi Berburu Komodo (Rabu & Minggu)',
    description: 'Zona reptil terlengkap dengan terarium kaca, kandang pasir savana komodo, serta koleksi ular piton sanca kembang raksasa.',
    funFacts: [
      'Kadal terbesar di dunia dengan panjang mencapai 3 meter dan bobot hingga 90 kg.',
      'Memiliki kelenjar bisa beracun yang mencegah pembekuan darah mangsanya.',
      'Dapat mencium aroma bangkai dari jarak hingga 9,5 kilometer menggunakan lidah bercabangnya.'
    ],
    audioScript: 'Anda berada di Taman Reptil Ragunan. Di hadapan Anda adalah Komodo sang naga purba Indonesia yang telah hidup sejak jutaan tahun lalu di kepulauan Nusa Tenggara Timur.'
  },
  {
    id: 'jerapah',
    name: 'Jerapah & Zebra Savana',
    latin: 'Giraffa camelopardalis',
    category: 'mamalia',
    categoryLabel: 'Herbivora Tinggi',
    coords: [-6.3102, 106.8222],
    nodeId: 'n_jerapah',
    img: 'assets/giraffe.jpg',
    emoji: '🦒',
    color: '#2e7d32',
    status: 'Rentan (VU)',
    origin: 'Savana Terbuka Afrika',
    diet: 'Herbivora (Daun akasia, wortel, kangkung segar)',
    feedingTime: '15.00 WIB',
    feedingTimeHour: 15,
    feedingTimeMinute: 0,
    feedingNote: 'Pemberian Makan Panggung Leher Tinggi',
    description: 'Padang rumput terbuka dengan pohon rindang tempat bermain keluarga jerapah leher panjang bersanding dengan zebra belang.',
    funFacts: [
      'Mamalia tertinggi di dunia; bayi jerapah yang baru lahir saja sudah setinggi 1,8 meter.',
      'Lidah jerapah berwarna ungu gelap kebiruan sepanjang 45 cm untuk melindungi dari sengatan matahari.',
      'Hanya membutuhkan tidur sekitar 30 menit hingga 2 jam saja per hari.'
    ],
    audioScript: 'Lihatlah keanggunan jerapah-jerapah Ragunan yang menjulang tinggi menikmati dedaunan segar di kanopi pohon savana.'
  },
  {
    id: 'beruang_madu',
    name: 'Beruang Madu',
    latin: 'Helarctos malayanus',
    category: 'mamalia',
    categoryLabel: 'Omnivora Arboreal',
    coords: [-6.3145, 106.8222],
    nodeId: 'n_beruang',
    img: 'assets/beruang_madu.jpg',
    emoji: '🐻',
    color: '#5d4037',
    status: 'Rentan (VU)',
    origin: 'Hutan Tropis Kalimantan & Sumatera',
    diet: 'Omnivora (Madu, buah hutan, rayap, serangga)',
    feedingTime: '13.00 WIB',
    feedingTimeHour: 13,
    feedingTimeMinute: 0,
    feedingNote: 'Enrichment Madu di Batang Kayu',
    description: 'Kandang perbukitan batu dengan batang gelondongan pohon tempat beruang madu gemar memanjat dan bersantai.',
    funFacts: [
      'Spesies beruang terkecil di dunia dengan corak tapal kuda emas di dadanya.',
      'Memiliki lidah panjang hingga 25 cm yang sangat fleksibel untuk menjilat madu.',
      'Kuku melengkungnya sangat kuat untuk mencakar sarang lebah dan memanjat pohon kanopi.'
    ],
    audioScript: 'Beruang Madu adalah satwa maskot Balikpapan dan salah satu penghuni favorit Ragunan yang terkenal lincah dan gemar bermain di atas gelondong kayu.'
  },
  {
    id: 'danau_pelikan',
    name: 'Danau Burung Pelikan',
    latin: 'Pelecanus onocrotalus',
    category: 'aves',
    categoryLabel: 'Unggas Air & Danau',
    coords: [-6.3088, 106.8202],
    nodeId: 'n_danau_pusat',
    img: 'assets/cendrawasih.jpg',
    emoji: '🦢',
    color: '#0288d1',
    status: 'Risiko Rendah (LC)',
    origin: 'Danau Rawa Eurasia & Afrika',
    diet: 'Piscivora (Ikan mas, nila, udang air tawar)',
    feedingTime: '15.30 WIB',
    feedingTimeHour: 15,
    feedingTimeMinute: 30,
    feedingNote: 'Lempar Ikan Segar di Pulau Danau',
    description: 'Danau alami asri di tengah Ragunan dengan pulau rindang tempat berkumpulnya ratusan pelikan putih paruh berkantong dan angsa.',
    funFacts: [
      'Paruh pelikan memiliki kantong elastis (gular pouch) berkapasitas hingga 13 liter air.',
      'Sering berburu ikan secara berkelompok dengan mengepakkan sayap untuk menggiring ikan ke perairan dangkal.'
    ],
    audioScript: 'Danau Pelikan adalah pusat keteduhan Ragunan. Rasakan sejuknya angin dan nikmati keceriaan burung pelikan yang meluncur di permukaan air.'
  },
  {
    id: 'kuda_nil',
    name: 'Kolam Kuda Nil',
    latin: 'Hippopotamus amphibius',
    category: 'mamalia',
    categoryLabel: 'Mamalia Air Tawar',
    coords: [-6.3172, 106.8225],
    nodeId: 'n_kudanil',
    img: 'assets/hippo.jpg',
    emoji: '🦛',
    color: '#455a64',
    status: 'Rentan (VU)',
    origin: 'Sungai & Danau Afrika Sub-Sahara',
    diet: 'Herbivora (Rumput gajah, labu, semangka)',
    feedingTime: '14.30 WIB',
    feedingTimeHour: 14,
    feedingTimeMinute: 30,
    feedingNote: 'Pemberian Semangka Utuh & Rumput Gajah',
    description: 'Kolam air tawar berpasir luas dengan panggung penonton di mana pengunjung dapat melihat kuda nil berendam dan membuka mulut raksasanya.',
    funFacts: [
      'Mampu membuka rahangnya hingga sudut 150 derajat dengan kekuatan gigitan luar biasa.',
      'Mengeluarkan cairan merah muda alami yang berfungsi sebagai tabir surya dan antibakteri.'
    ],
    audioScript: 'Kuda nil menghabiskan sebagian besar siang harinya di dalam air sejuk untuk menjaga suhu tubuhnya tetap dingin di bawah terik matahari.'
  },
  {
    id: 'macan_tutul',
    name: 'Macan Tutul Jawa',
    latin: 'Panthera pardus melas',
    category: 'karnivora',
    categoryLabel: 'Kucing Besar Pemanjat',
    coords: [-6.3162, 106.8198],
    nodeId: 'n_macan',
    img: 'assets/macan_tutul.jpg',
    emoji: '🐆',
    color: '#bf360c',
    status: 'Kritis Terancam Punah (CR)',
    origin: 'Hutan Pegunungan Pulau Jawa',
    diet: 'Karnivora (Daging rusa, unggas)',
    feedingTime: '11.45 WIB',
    feedingTimeHour: 11,
    feedingTimeMinute: 45,
    feedingNote: 'Pemberian Daging Segar di Atas Dahan Pohon',
    description: 'Enclosure bernuansa tebing batu dan pohon tinggi sesuai tabiat alaminya yang suka memanjat dan mengintai mangsa.',
    funFacts: [
      'Satu-satunya kucing besar liar yang tersisa hidup di pulau Jawa.',
      'Dua varian warna: tutul emas roset dan kumbang hitam pekat akibat melanisme pigmen.'
    ],
    audioScript: 'Saksikan Macan Tutul Jawa, predator arboreal ulung pulau Jawa yang dilindungi ketat dalam program konservasi Taman Margasatwa Ragunan.'
  },
  {
    id: 'anoa_banteng',
    name: 'Anoa & Banteng Jawa',
    latin: 'Bubalus quarlesi & Bos javanicus',
    category: 'mamalia',
    categoryLabel: 'Herbivora Endemik',
    coords: [-6.3130, 106.8252],
    nodeId: 'n_anoa',
    img: 'assets/anoa.jpg',
    emoji: '🐂',
    color: '#4e342e',
    status: 'Genteng (EN)',
    origin: 'Hutan Pegunungan Sulawesi & Taman Nasional Baluran',
    diet: 'Herbivora (Rumput, pucuk ranting muda, pakis)',
    feedingTime: '09.30 WIB',
    feedingTimeHour: 9,
    feedingTimeMinute: 30,
    feedingNote: 'Pemberian Hijauan Pagi Hari',
    description: 'Kandang savana rindang dengan naungan bambu kuning dan pohon trembesi tua.',
    funFacts: [
      'Anoa adalah spesies sapi liar terkecil di dunia yang sering dijuluki kerbau kerdil.',
      'Banteng jantan memiliki tubuh hitam kekar dengan cermin putih khas di bagian pantat.'
    ],
    audioScript: 'Anoa dan Banteng Jawa merupakan warisan fauna Nusantara yang sangat bernilai bagi keanekaragaman hayati Indonesia.'
  },
  {
    id: 'buaya_muara',
    name: 'Kolam Buaya Muara',
    latin: 'Crocodylus porosus',
    category: 'reptil',
    categoryLabel: 'Reptil Purba Air',
    coords: [-6.3110, 106.8185],
    nodeId: 'n_buaya',
    img: 'assets/buaya_muara.jpg',
    emoji: '🐊',
    color: '#2e7d32',
    status: 'Risiko Rendah (LC)',
    origin: 'Muara Sungai & Rawa Bakau Nusantara',
    diet: 'Karnivora (Ikan besar, unggas, karkas daging)',
    feedingTime: '13.00 WIB',
    feedingTimeHour: 13,
    feedingTimeMinute: 0,
    feedingNote: 'Atraksi Sambaran Pakan Buaya (Selasa & Jumat)',
    description: 'Kolam rawa alami berpagar aman dengan tebing pasir tempat buaya berjemur di bawah sinar matahari.',
    funFacts: [
      'Reptil terbesar di dunia yang masih hidup; panjangnya bisa melampaui 6 meter.',
      'Dapat hidup di perairan tawar maupun air payau muara laut.'
    ],
    audioScript: 'Selamat datang di Kolam Buaya Muara Ragunan. Saksikan reptil pemangsa terhebat ini berjemur menghangatkan tubuhnya di tepi kolam.'
  },
  {
    id: 'taman_satwa_anak',
    name: 'Taman Satwa Anak (Children Zoo)',
    latin: 'Koleksi Satwa Edukasi Ramah Anak',
    category: 'edukasi',
    categoryLabel: 'Wahana Edukasi Keluarga',
    coords: [-6.3075, 106.8235],
    nodeId: 'n_satwa_anak',
    img: 'assets/rusa_bawean.jpg',
    emoji: '🦚',
    color: '#00897b',
    status: 'Taman Wisata Edukasi',
    origin: 'Berbagai Wilayah Nusantara',
    diet: 'Pakan Khusus Ramah Anak',
    feedingTime: 'Sepanjang Hari',
    feedingTimeHour: 9,
    feedingTimeMinute: 0,
    feedingNote: 'Wahana Interaksi & Memberi Makan Kelinci/Kambing',
    description: 'Area rekreasi ramah keluarga dengan akuarium raksasa ikan Arapaima gigas, panggung satwa jinak, taman burung, dan wahana gajah tunggang anak.',
    funFacts: [
      'Menampilkan ikan air tawar terbesar dunia Arapaima gigas dari Sungai Amazon.',
      'Dilengkapi taman bermain pasir, jembatan tali rintangan, dan toilet khusus anak.'
    ],
    audioScript: 'Taman Satwa Anak adalah tempat terbaik bagi si kecil untuk berinteraksi lebih dekat dengan satwa-satwa jinak yang menggemaskan.'
  },
  {
    id: 'tapir',
    name: 'Kandang Tapir Belang',
    latin: 'Tapirus indicus',
    category: 'mamalia',
    categoryLabel: 'Herbivora Hutan Hujan',
    coords: [-6.3142, 106.8242],
    nodeId: 'n_tapir',
    img: 'assets/tapir.jpg',
    emoji: '🦡',
    color: '#37474f',
    status: 'Genteng (EN)',
    origin: 'Hutan Rawa Dataran Rendah Sumatera',
    diet: 'Herbivora (Pucuk dedaunan, buah ara, rumput lembut)',
    feedingTime: '10.15 WIB',
    feedingTimeHour: 10,
    feedingTimeMinute: 15,
    feedingNote: 'Pemberian Sayur & Buah Segar',
    description: 'Area rindang berkanopi pohon beringin dengan kubangan air bersih tempat tapir suka berkubang.',
    funFacts: [
      'Pola tubuhnya hitam-putih berfungsi sebagai kamuflase di bawah sinar bulan malam hari.',
      'Anak tapir lahir dengan corak bintik dan garis cokelat seperti buah semangka.'
    ],
    audioScript: 'Tapir Sumatera memiliki moncong lentur seperti belalai mini yang berguna untuk meraih pucuk daun muda di dahan pohon.'
  }
];

// DAFTAR FASILITAS UMUM (FACILITIES)
export const RAGUNAN_FACILITIES = [
  // PINTU MASUK
  {
    id: 'pintu_utara',
    name: 'Pintu Masuk Utama (Pintu Utara)',
    type: 'gate',
    category: 'pintu',
    coords: [-6.3045, 106.8198],
    nodeId: 'n_pintu_utara',
    icon: 'meeting_room',
    color: '#013a13',
    description: 'Pintu masuk gerbang utama Ragunan, terhubung langsung dengan Halte TransJakarta Ragunan, loket JakCard, dan pusat informasi.'
  },
  {
    id: 'pintu_barat',
    name: 'Pintu Masuk Barat',
    type: 'gate',
    category: 'pintu',
    coords: [-6.3105, 106.8130],
    nodeId: 'n_pintu_barat',
    icon: 'meeting_room',
    color: '#013a13',
    description: 'Pintu masuk sisi barat (Jl. Kav Polri), dekat dengan area parkir kendaraan roda dua dan loket JakCard.'
  },
  {
    id: 'pintu_timur',
    name: 'Pintu Masuk Timur',
    type: 'gate',
    category: 'pintu',
    coords: [-6.3132, 106.8272],
    nodeId: 'n_pintu_timur',
    icon: 'meeting_room',
    color: '#013a13',
    description: 'Pintu masuk koridor timur rindang, akses nyaman pejalan kaki dan dekat dengan kandang mamalia besar.'
  },
  {
    id: 'pintu_selatan',
    name: 'Pintu Masuk Selatan',
    type: 'gate',
    category: 'pintu',
    coords: [-6.3195, 106.8235],
    nodeId: 'n_pintu_selatan',
    icon: 'meeting_room',
    color: '#013a13',
    description: 'Pintu gerbang selatan Ragunan dekat akses TB Simatupang.'
  },

  // TOILET & RUANG LAKTASI
  {
    id: 'toilet_utara',
    name: 'Toilet & Laktasi Plaza Utara',
    type: 'toilet',
    category: 'fasilitas',
    coords: [-6.3060, 106.8205],
    nodeId: 'n_koridor_utara',
    icon: 'wc',
    color: '#00838f',
    description: 'Toilet bersih modern, ramah kursi roda/difabel, wastafel otomatis, dan ruang menyusui (laktasi).'
  },
  {
    id: 'toilet_danau',
    name: 'Toilet & Wastafel Danau Pelikan',
    type: 'toilet',
    category: 'fasilitas',
    coords: [-6.3094, 106.8195],
    nodeId: 'n_danau_barat',
    icon: 'wc',
    color: '#00838f',
    description: 'Toilet umum berkapasitas besar di pinggir danau dekat kios kelapa muda.'
  },
  {
    id: 'toilet_schmutzer',
    name: 'Toilet Difabel & Laktasi Schmutzer',
    type: 'toilet',
    category: 'fasilitas',
    coords: [-6.3140, 106.8168],
    nodeId: 'n_schmutzer_gerbang',
    icon: 'wc',
    color: '#00838f',
    description: 'Fasilitas sanitasi berstandar internasional ramah anak dan stroller di dalam gerbang Schmutzer.'
  },
  {
    id: 'toilet_gajah',
    name: 'Toilet Koridor Gajah & Mamalia',
    type: 'toilet',
    category: 'fasilitas',
    coords: [-6.3120, 106.8242],
    nodeId: 'n_mamalia_koridor',
    icon: 'wc',
    color: '#00838f',
    description: 'Toilet umum berkanopi bambu asri di sebelah timur panggung observasi gajah.'
  },
  {
    id: 'toilet_selatan',
    name: 'Toilet Paviliun Rimba Selatan',
    type: 'toilet',
    category: 'fasilitas',
    coords: [-6.3175, 106.8218],
    nodeId: 'n_rimba_selatan',
    icon: 'wc',
    color: '#00838f',
    description: 'Toilet umum dekat koridor harimau dan kuda nil.'
  },

  // MUSHOLLA & MASJID
  {
    id: 'musholla_utama',
    name: 'Masjid Al-Falah & Tempat Wudhu Luas',
    type: 'musholla',
    category: 'fasilitas',
    coords: [-6.3070, 106.8192],
    nodeId: 'n_persimpangan_danau',
    icon: 'mosque',
    color: '#2e7d32',
    description: 'Masjid utama berpenyejuk udara sejuk dengan perlengkapan sholat lengkap, karpet bersih, dan tempat wudhu terpisah.'
  },
  {
    id: 'musholla_schmutzer',
    name: 'Musholla Paviliun Primata',
    type: 'musholla',
    category: 'fasilitas',
    coords: [-6.3130, 106.8165],
    nodeId: 'n_schmutzer_gerbang',
    icon: 'mosque',
    color: '#2e7d32',
    description: 'Musholla asri nan tenang di dekat pintu keluar Pusat Primata Schmutzer.'
  },
  {
    id: 'musholla_timur',
    name: 'Musholla Rindang Koridor Timur',
    type: 'musholla',
    category: 'fasilitas',
    coords: [-6.3135, 106.8258],
    nodeId: 'n_timur_jalur',
    icon: 'mosque',
    color: '#2e7d32',
    description: 'Musholla kayu rindang di bawah naungan pohon trembesi.'
  },

  // KULINER & PUJASERA
  {
    id: 'foodcourt_danau',
    name: 'Pujasera Danau Ragunan',
    type: 'food',
    category: 'kuliner',
    coords: [-6.3082, 106.8188],
    nodeId: 'n_pujasera_danau',
    icon: 'restaurant',
    color: '#ef6c00',
    description: 'Sentra kuliner terlengkap: Es kelapa muda segar, soto betawi, pecel ayam, mie ayam baso, dan aneka jajanan khas Jakarta.'
  },
  {
    id: 'foodcourt_schmutzer',
    name: 'Kafe Rindang Primata',
    type: 'food',
    category: 'kuliner',
    coords: [-6.3125, 106.8180],
    nodeId: 'n_schmutzer_plaza',
    icon: 'local_cafe',
    color: '#ef6c00',
    description: 'Kafe santai menyajikan kopi nusantara, gelato buah segar, dan roti bakar dengan pemandangan rimbun kanopi.'
  },
  {
    id: 'foodcourt_gajah',
    name: 'Kios Kuliner & Minuman Segar Gajah',
    type: 'food',
    category: 'kuliner',
    coords: [-6.3118, 106.8220],
    nodeId: 'n_koridor_beringin',
    icon: 'fastfood',
    color: '#ef6c00',
    description: 'Stand aneka minuman dingin, es krim, kentang goreng, dan air kelapa hijau.'
  },

  // HALTE KERETA WISATA & TRANSPORTASI
  {
    id: 'halte_kereta_utara',
    name: 'Halte Kereta Keliling 1 (Plaza Utama)',
    type: 'transport',
    category: 'transportasi',
    coords: [-6.3062, 106.8195],
    nodeId: 'n_koridor_utara',
    icon: 'tram',
    color: '#1565c0',
    description: 'Titik awal naik kereta wisata keliling mengitari rute lingkar luar kebun binatang dengan tarif Rp 10.000/orang.'
  },
  {
    id: 'halte_kereta_danau',
    name: 'Halte Kereta Keliling 2 (Danau Pelikan)',
    type: 'transport',
    category: 'transportasi',
    coords: [-6.3090, 106.8214],
    nodeId: 'n_danau_timur',
    icon: 'tram',
    color: '#1565c0',
    description: 'Halte transit kereta wisata dekat area danau dan panggung satwa anak.'
  },
  {
    id: 'halte_kereta_gajah',
    name: 'Halte Kereta Keliling 3 (Gajah Sumatera)',
    type: 'transport',
    category: 'transportasi',
    coords: [-6.3115, 106.8240],
    nodeId: 'n_mamalia_koridor',
    icon: 'tram',
    color: '#1565c0',
    description: 'Halte pemberhentian bagi pengunjung yang ingin menyaksikan atraksi mandi gajah.'
  },
  {
    id: 'halte_kereta_harimau',
    name: 'Halte Kereta Keliling 4 (Karnivora Rimba)',
    type: 'transport',
    category: 'transportasi',
    coords: [-6.3160, 106.8215],
    nodeId: 'n_rimba_selatan',
    icon: 'tram',
    color: '#1565c0',
    description: 'Halte transit selatan dekat kandang harimau sumatera dan beruang madu.'
  },
  {
    id: 'sewa_sepeda_utara',
    name: 'Penyewaan Sepeda Tunggal & Tandem',
    type: 'transport',
    category: 'transportasi',
    coords: [-6.3058, 106.8200],
    nodeId: 'n_koridor_utara',
    icon: 'pedal_bike',
    color: '#1565c0',
    description: 'Sewa sepeda santai untuk mengelilingi jalur rindang Ragunan (Sepeda single Rp 10.000/jam, Tandem Rp 15.000/jam).'
  },

  // POS MEDIS P3K & RANGER
  {
    id: 'pos_medis_p3k',
    name: 'Pos Medis & P3K Ragunan',
    type: 'medical',
    category: 'fasilitas',
    coords: [-6.3065, 106.8210],
    nodeId: 'n_koridor_utara',
    icon: 'medical_services',
    color: '#c62828',
    description: 'Posko darurat medis dengan tenaga perawat siap siaga, kotak P3K lengkap, oksigen, dan ambulans siaga.'
  },
  {
    id: 'pos_ranger_pusat',
    name: 'Pos Keamanan & Ranger Pusat',
    type: 'security',
    category: 'fasilitas',
    coords: [-6.3120, 106.8200],
    nodeId: 'n_koridor_beringin',
    icon: 'shield_person',
    color: '#013a13',
    description: 'Pos komando pengamanan terpadu, pusat penanganan anak hilang/terpisah, dan informasi barang tertinggal.'
  },
  {
    id: 'pos_ranger_3',
    name: 'Pos Pantau Ranger 3 Schmutzer',
    type: 'security',
    category: 'fasilitas',
    coords: [-6.3148, 106.8188],
    nodeId: 'n_schmutzer_plaza',
    icon: 'security',
    color: '#013a13',
    description: 'Pos pantau petugas jaga koridor primata dan rimba selatan.'
  },

  // AIR MINUM GRATIS & SPESIAL
  {
    id: 'water_refill_1',
    name: 'Stasiun Refill Air Minum Danau',
    type: 'amenity',
    category: 'fasilitas',
    coords: [-6.3086, 106.8202],
    nodeId: 'n_danau_pusat',
    icon: 'water_drop',
    color: '#0288d1',
    description: 'Dispenser air minum mineral higienis siap minum gratis untuk botol tumbler pengunjung.'
  },
  {
    id: 'water_refill_2',
    name: 'Stasiun Refill Air Minum Schmutzer',
    type: 'amenity',
    category: 'fasilitas',
    coords: [-6.3132, 106.8185],
    nodeId: 'n_schmutzer_plaza',
    icon: 'water_drop',
    color: '#0288d1',
    description: 'Keran air minum reverse osmosis gratis ramah lingkungan.'
  },

  // AREA PARKIR KENDARAAN (MOBIL & MOTOR)
  {
    id: 'parkir_utara',
    name: 'Area Parkir Utama (Gerbang Utara)',
    type: 'parkir',
    category: 'fasilitas',
    coords: [-6.3040, 106.8198],
    nodeId: 'n_pintu_utara',
    icon: 'local_parking',
    color: '#b85032',
    description: 'Kantong parkir utama Ragunan berkapasitas ribuan mobil, bus pariwisata, dan motor dengan akses langsung halte TransJakarta.'
  },
  {
    id: 'parkir_barat',
    name: 'Area Parkir Gerbang Barat',
    type: 'parkir',
    category: 'fasilitas',
    coords: [-6.3108, 106.8126],
    nodeId: 'n_pintu_barat',
    icon: 'local_parking',
    color: '#b85032',
    description: 'Area parkir teduh sisi barat (Jl. Kav Polri) untuk kendaraan roda dua dan minibus keluarga.'
  },
  {
    id: 'parkir_timur',
    name: 'Area Parkir Gerbang Timur',
    type: 'parkir',
    category: 'fasilitas',
    coords: [-6.3135, 106.8276],
    nodeId: 'n_pintu_timur',
    icon: 'local_parking',
    color: '#b85032',
    description: 'Parkir sisi timur dekat koridor mamalia besar dan jalan lingkar luar.'
  },
  {
    id: 'parkir_selatan',
    name: 'Area Parkir Gerbang Selatan',
    type: 'parkir',
    category: 'fasilitas',
    coords: [-6.3198, 106.8232],
    nodeId: 'n_pintu_selatan',
    icon: 'local_parking',
    color: '#b85032',
    description: 'Area parkir sisi selatan Ragunan dekat akses jalan TB Simatupang.'
  }
];

// JARINGAN GRAF JALAN KAKI RAGUNAN (NODES & EDGES)
export const RAGUNAN_ROAD_NODES = {
  n_pintu_utara: {
    id: 'n_pintu_utara',
    name: 'Plaza Pintu Masuk Utara',
    coords: [-6.3048, 106.8198],
    canopyLevel: 0.60
  },
  n_koridor_utara: {
    id: 'n_koridor_utara',
    name: 'Koridor Utama Pintu Utara',
    coords: [-6.3065, 106.8200],
    canopyLevel: 0.85
  },
  n_persimpangan_danau: {
    id: 'n_persimpangan_danau',
    name: 'Pertigaan Danau & Masjid Al-Falah',
    coords: [-6.3075, 106.8195],
    canopyLevel: 0.90
  },
  n_pujasera_danau: {
    id: 'n_pujasera_danau',
    name: 'Jalur Pujasera Danau Barat',
    coords: [-6.3082, 106.8188],
    canopyLevel: 0.80
  },
  n_danau_pusat: {
    id: 'n_danau_pusat',
    name: 'Plaza Tepi Danau Pelikan',
    coords: [-6.3088, 106.8202],
    canopyLevel: 0.92
  },
  n_danau_barat: {
    id: 'n_danau_barat',
    name: 'Koridor Barat Danau Pelikan',
    coords: [-6.3095, 106.8192],
    canopyLevel: 0.95
  },
  n_danau_timur: {
    id: 'n_danau_timur',
    name: 'Koridor Timur Danau & Halte 2',
    coords: [-6.3090, 106.8214],
    canopyLevel: 0.90
  },
  n_satwa_anak: {
    id: 'n_satwa_anak',
    name: 'Gerbang Taman Satwa Anak',
    coords: [-6.3075, 106.8235],
    canopyLevel: 0.88
  },
  n_jerapah: {
    id: 'n_jerapah',
    name: 'Plaza Savana Jerapah',
    coords: [-6.3102, 106.8222],
    canopyLevel: 0.85
  },
  n_koridor_beringin: {
    id: 'n_koridor_beringin',
    name: 'Koridor Beringin Rindang',
    coords: [-6.3120, 106.8202],
    canopyLevel: 0.98
  },
  n_reptil: {
    id: 'n_reptil',
    name: 'Gerbang Taman Reptil & Komodo',
    coords: [-6.3115, 106.8170],
    canopyLevel: 0.85
  },
  n_buaya: {
    id: 'n_buaya',
    name: 'Pelataran Kolam Buaya Muara',
    coords: [-6.3110, 106.8185],
    canopyLevel: 0.80
  },
  n_pintu_barat: {
    id: 'n_pintu_barat',
    name: 'Jalur Akses Pintu Barat',
    coords: [-6.3105, 106.8130],
    canopyLevel: 0.70
  },
  n_schmutzer_gerbang: {
    id: 'n_schmutzer_gerbang',
    name: 'Gerbang Pusat Primata Schmutzer',
    coords: [-6.3132, 106.8172],
    canopyLevel: 0.95
  },
  n_schmutzer: {
    id: 'n_schmutzer',
    name: 'Lembah Gorila & Kanopi Orangutan',
    coords: [-6.3138, 106.8175],
    canopyLevel: 0.98
  },
  n_schmutzer_plaza: {
    id: 'n_schmutzer_plaza',
    name: 'Plaza Kafe Schmutzer & Pos Ranger 3',
    coords: [-6.3135, 106.8185],
    canopyLevel: 0.94
  },
  n_gajah: {
    id: 'n_gajah',
    name: 'Gerbang Observasi Gajah Sumatera',
    coords: [-6.3125, 106.8232],
    canopyLevel: 0.92
  },
  n_mamalia_koridor: {
    id: 'n_mamalia_koridor',
    name: 'Koridor Mamalia Besar & Halte 3',
    coords: [-6.3118, 106.8240],
    canopyLevel: 0.90
  },
  n_beruang: {
    id: 'n_beruang',
    name: 'Jalur Tebing Beruang Madu',
    coords: [-6.3145, 106.8222],
    canopyLevel: 0.94
  },
  n_tapir: {
    id: 'n_tapir',
    name: 'Jalur Rimbun Kandang Tapir',
    coords: [-6.3142, 106.8242],
    canopyLevel: 0.96
  },
  n_anoa: {
    id: 'n_anoa',
    name: 'Koridor Anoa & Savana Banteng',
    coords: [-6.3130, 106.8252],
    canopyLevel: 0.90
  },
  n_timur_jalur: {
    id: 'n_timur_jalur',
    name: 'Koridor Kanopi Menuju Pintu Timur',
    coords: [-6.3135, 106.8265],
    canopyLevel: 0.92
  },
  n_pintu_timur: {
    id: 'n_pintu_timur',
    name: 'Plaza Pintu Masuk Timur',
    coords: [-6.3132, 106.8272],
    canopyLevel: 0.75
  },
  n_harimau: {
    id: 'n_harimau',
    name: 'Koridor Belantara Harimau Sumatera',
    coords: [-6.3155, 106.8208],
    canopyLevel: 0.96
  },
  n_macan: {
    id: 'n_macan',
    name: 'Tebing Pengamatan Macan Tutul',
    coords: [-6.3162, 106.8198],
    canopyLevel: 0.95
  },
  n_kudanil: {
    id: 'n_kudanil',
    name: 'Pelataran Kolam Kuda Nil',
    coords: [-6.3172, 106.8225],
    canopyLevel: 0.88
  },
  n_rimba_selatan: {
    id: 'n_rimba_selatan',
    name: 'Koridor Rimba Selatan & Halte 4',
    coords: [-6.3168, 106.8215],
    canopyLevel: 0.92
  },
  n_pintu_selatan: {
    id: 'n_pintu_selatan',
    name: 'Plaza Pintu Masuk Selatan',
    coords: [-6.3195, 106.8235],
    canopyLevel: 0.65
  }
};

// DAFTAR RUAS JALAN (EDGES)
export const RAGUNAN_ROAD_EDGES = [
  // JALUR UTARA
  { from: 'n_pintu_utara', to: 'n_koridor_utara', roadName: 'Plaza Masuk Utara', distance: 190, canopy: 0.65 },
  { from: 'n_koridor_utara', to: 'n_persimpangan_danau', roadName: 'Koridor Pintu Utara', distance: 120, canopy: 0.85 },
  { from: 'n_koridor_utara', to: 'n_satwa_anak', roadName: 'Jalur Akses Satwa Anak', distance: 410, canopy: 0.80 },

  // SEKITAR DANAU PELIKAN
  { from: 'n_persimpangan_danau', to: 'n_pujasera_danau', roadName: 'Jalur Pujasera Danau Barat', distance: 110, canopy: 0.85 },
  { from: 'n_persimpangan_danau', to: 'n_danau_pusat', roadName: 'Plaza Danau Pelikan', distance: 160, canopy: 0.90 },
  { from: 'n_danau_pusat', to: 'n_danau_timur', roadName: 'Koridor Tepi Danau Timur', distance: 130, canopy: 0.92 },
  { from: 'n_danau_pusat', to: 'n_danau_barat', roadName: 'Koridor Tepi Danau Barat', distance: 120, canopy: 0.94 },
  { from: 'n_danau_timur', to: 'n_satwa_anak', roadName: 'Jalur Penghubung Satwa Anak', distance: 280, canopy: 0.88 },
  { from: 'n_danau_timur', to: 'n_jerapah', roadName: 'Jalur Savana Jerapah', distance: 160, canopy: 0.85 },
  { from: 'n_danau_barat', to: 'n_buaya', roadName: 'Jalur Tepi Air Buaya Muara', distance: 180, canopy: 0.85 },
  { from: 'n_pujasera_danau', to: 'n_buaya', roadName: 'Jalur Pujasera ke Kolam Buaya', distance: 310, canopy: 0.80 },

  // KORIDOR BERINGIN PUSAT (MAIN ARTERY)
  { from: 'n_danau_pusat', to: 'n_koridor_beringin', roadName: 'Koridor Beringin Rindang', distance: 350, canopy: 0.98 },
  { from: 'n_jerapah', to: 'n_koridor_beringin', roadName: 'Jalur Savana ke Koridor Beringin', distance: 290, canopy: 0.88 },
  { from: 'n_buaya', to: 'n_koridor_beringin', roadName: 'Jalur Buaya ke Koridor Beringin', distance: 220, canopy: 0.90 },

  // SEKTOR BARAT & PINTU BARAT
  { from: 'n_buaya', to: 'n_reptil', roadName: 'Jalur Taman Reptil', distance: 170, canopy: 0.85 },
  { from: 'n_reptil', to: 'n_pintu_barat', roadName: 'Jalur Akses Gerbang Barat', distance: 450, canopy: 0.70 },
  { from: 'n_reptil', to: 'n_schmutzer_gerbang', roadName: 'Jalur Koridor Barat Schmutzer', distance: 190, canopy: 0.92 },

  // PUSAT PRIMATA SCHMUTZER
  { from: 'n_koridor_beringin', to: 'n_schmutzer_plaza', roadName: 'Koridor Utama Primata Schmutzer', distance: 240, canopy: 0.96 },
  { from: 'n_schmutzer_plaza', to: 'n_schmutzer_gerbang', roadName: 'Plaza Depan Gerbang Schmutzer', distance: 150, canopy: 0.95 },
  { from: 'n_schmutzer_gerbang', to: 'n_schmutzer', roadName: 'Jalur Lembah Primata Dalam', distance: 80, canopy: 0.99 },

  // SEKTOR TIMUR & GAJAH SUMATERA
  { from: 'n_jerapah', to: 'n_gajah', roadName: 'Jalur Satwa Savana ke Gajah', distance: 270, canopy: 0.88 },
  { from: 'n_koridor_beringin', to: 'n_gajah', roadName: 'Koridor Menuju Panggung Gajah', distance: 340, canopy: 0.94 },
  { from: 'n_gajah', to: 'n_mamalia_koridor', roadName: 'Jalur Panggung Gajah Sumatera', distance: 110, canopy: 0.92 },
  { from: 'n_mamalia_koridor', to: 'n_anoa', roadName: 'Jalur Anoa & Banteng Jawa', distance: 190, canopy: 0.90 },
  { from: 'n_anoa', to: 'n_tapir', roadName: 'Jalur Rimbun Kandang Tapir', distance: 170, canopy: 0.95 },
  { from: 'n_anoa', to: 'n_timur_jalur', roadName: 'Jalur Koridor Timur', distance: 150, canopy: 0.92 },
  { from: 'n_timur_jalur', to: 'n_pintu_timur', roadName: 'Plaza Akses Pintu Timur', distance: 80, canopy: 0.75 },

  // SEKTOR TENGAH KE SELATAN
  { from: 'n_koridor_beringin', to: 'n_beruang', roadName: 'Jalur Tebing Beruang Madu', distance: 350, canopy: 0.95 },
  { from: 'n_gajah', to: 'n_beruang', roadName: 'Jalur Penghubung Gajah ke Beruang', distance: 250, canopy: 0.93 },
  { from: 'n_beruang', to: 'n_tapir', roadName: 'Jalur Teduh Beruang ke Tapir', distance: 220, canopy: 0.96 },

  // SEKTOR SELATAN (HARIMAU, KUDA NIL, PINTU SELATAN)
  { from: 'n_schmutzer_plaza', to: 'n_harimau', roadName: 'Jalur Belantara Primata ke Harimau', distance: 320, canopy: 0.96 },
  { from: 'n_koridor_beringin', to: 'n_harimau', roadName: 'Koridor Hutan Rimba Harimau', distance: 390, canopy: 0.95 },
  { from: 'n_harimau', to: 'n_macan', roadName: 'Jalur Tebing Macan Tutul', distance: 130, canopy: 0.94 },
  { from: 'n_harimau', to: 'n_rimba_selatan', roadName: 'Jalur Rimba Selatan', distance: 160, canopy: 0.92 },
  { from: 'n_beruang', to: 'n_rimba_selatan', roadName: 'Jalur Beruang ke Rimba Selatan', distance: 260, canopy: 0.92 },
  { from: 'n_rimba_selatan', to: 'n_kudanil', roadName: 'Pelataran Kolam Kuda Nil', distance: 120, canopy: 0.88 },
  { from: 'n_rimba_selatan', to: 'n_pintu_selatan', roadName: 'Koridor Menuju Gerbang Selatan', distance: 360, canopy: 0.70 }
];
