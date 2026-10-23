import { Animal } from '@/hooks/useAnimals';

export interface GeneratedQuestion {
  id: string;
  question_id: string;
  question_en: string;
  options_id: string[];
  options_en: string[];
  correctIndex: number;
  explanation_id: string;
  explanation_en: string;
  hint_id?: string;
  hint_en?: string;
  difficulty?: 'junior' | 'ranger';
}

export interface QuizCategoryConfig {
  id: string;
  nameId: string;
  nameEn: string;
  icon: string;
  badgeColor: string;
  descriptionId: string;
  descriptionEn: string;
}

export const OFFICIAL_QUIZ_CATEGORIES: QuizCategoryConfig[] = [
  {
    id: 'endemik',
    nameId: 'Satwa Endemik Indonesia & Konservasi',
    nameEn: 'Indonesian Endemic Wildlife & Conservation',
    icon: '🌺',
    badgeColor: 'bg-emerald-600',
    descriptionId: 'Mengenal satwa asli kekayaan Nusantara dan upaya perlindungannya',
    descriptionEn: 'Discover native wildlife of Indonesia and global conservation efforts',
  },
  {
    id: 'schmutzer',
    nameId: 'Pusat Primata Schmutzer',
    nameEn: 'Schmutzer Primate Center',
    icon: '🦧',
    badgeColor: 'bg-amber-600',
    descriptionId: 'Dunia kera besar, gorila, orangutan, dan primata pintar dunia',
    descriptionEn: 'World of great apes, gorillas, orangutans, and intelligent primates',
  },
  {
    id: 'nokturnal',
    nameId: 'Satwa Nokturnal (Penjelajah Malam)',
    nameEn: 'Nocturnal Wildlife (Night Wanderers)',
    icon: '🦉',
    badgeColor: 'bg-indigo-600',
    descriptionId: 'Rahasia hewan yang aktif berburu dan menjelajah di malam hari',
    descriptionEn: 'Secrets of animals active and hunting under the night sky',
  },
  {
    id: 'akuatik',
    nameId: 'Dunia Air & Akuatik Ragunan',
    nameEn: 'Aquatic & Wetland Worlds',
    icon: '🌊',
    badgeColor: 'bg-sky-600',
    descriptionId: 'Satwa penghuni danau, rawa, dan perairan tropis',
    descriptionEn: 'Inhabitants of tropical lakes, wetlands, and aquatic realms',
  },
  {
    id: 'mamalia',
    nameId: 'Mamalia Raksasa & Herbivora',
    nameEn: 'Giant Mammals & Herbivores',
    icon: '🐘',
    badgeColor: 'bg-teal-600',
    descriptionId: 'Gajah Sumatra, jerapah, badak, dan herbivora unik Ragunan',
    descriptionEn: 'Sumatran elephants, giraffes, rhinos, and unique herbivores',
  },
  {
    id: 'aves',
    nameId: 'Aves & Burung Eksotis Nusantara',
    nameEn: 'Aves & Exotic Tropical Birds',
    icon: '🦜',
    badgeColor: 'bg-rose-600',
    descriptionId: 'Pesona bulu indah dan kicauan burung langka Indonesia',
    descriptionEn: 'Stunning plumage and songs of rare Indonesian bird species',
  },
  {
    id: 'reptil',
    nameId: 'Reptil & Satwa Purba',
    nameEn: 'Reptiles & Ancient Survivors',
    icon: '🐊',
    badgeColor: 'bg-lime-600',
    descriptionId: 'Komodo, buaya muara, ular raksasa, dan kura-kura purba',
    descriptionEn: 'Komodo dragons, saltwater crocs, giant pythons, and ancient tortoises',
  },
  {
    id: 'karnivora',
    nameId: 'Karnivora & Predator Tangguh',
    nameEn: 'Carnivores & Apex Predators',
    icon: '🥩',
    badgeColor: 'bg-orange-600',
    descriptionId: 'Kucing besar, harimau Sumatra, singa, dan teknik berburu mangsa',
    descriptionEn: 'Big cats, Sumatran tigers, lions, and hunting adaptations',
  },
];

// Helper to resolve any raw category string into one of the 8 official quiz category IDs
export function resolveQuizCategoryId(rawCategory?: string): string {
  if (!rawCategory) return 'endemik';
  const c = rawCategory.toLowerCase();
  if (c.includes('primata') || c.includes('schmutzer') || c.includes('kera') || c.includes('monyet') || c.includes('gorila')) return 'schmutzer';
  if (c.includes('endemik') || c.includes('konservasi') || c.includes('langka')) return 'endemik';
  if (c.includes('malam') || c.includes('nokturnal') || c.includes('kukang') || c.includes('kelelawar')) return 'nokturnal';
  if (c.includes('air') || c.includes('akuatik') || c.includes('danau') || c.includes('pelikan') || c.includes('ikan')) return 'akuatik';
  if (c.includes('burung') || c.includes('aves') || c.includes('unggas')) return 'aves';
  if (c.includes('reptil') || c.includes('ular') || c.includes('buaya') || c.includes('kura') || c.includes('komodo')) return 'reptil';
  if (c.includes('karnivor') || c.includes('predator') || c.includes('harimau') || c.includes('singa') || c.includes('macan')) return 'karnivora';
  if (c.includes('mamalia') || c.includes('herbivor') || c.includes('gajah') || c.includes('jerapah') || c.includes('badak')) return 'mamalia';
  return 'endemik';
}

// Shuffle array helper
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get random items from array
export const getRandomItems = <T>(array: T[], count: number, exclude?: T): T[] => {
  const filtered = exclude ? array.filter((item) => item !== exclude) : array;
  return shuffleArray(filtered).slice(0, count);
};

// Shuffle options of a single question and update correctIndex
export function shuffleQuestionOptions(q: GeneratedQuestion): GeneratedQuestion {
  const paired = q.options_id.map((optId, idx) => ({
    id: optId,
    en: q.options_en[idx] || optId,
    isCorrect: idx === q.correctIndex,
  }));

  const shuffledPaired = shuffleArray(paired);
  const newCorrectIndex = shuffledPaired.findIndex((p) => p.isCorrect);

  return {
    ...q,
    options_id: shuffledPaired.map((p) => p.id),
    options_en: shuffledPaired.map((p) => p.en),
    correctIndex: newCorrectIndex,
  };
}

// Comprehensive Question Bank with balanced Junior & Ranger questions
export const CATEGORY_QUESTION_BANK: Record<string, GeneratedQuestion[]> = {
  endemik: [
    {
      id: 'end-1',
      question_id: 'Pulau di Indonesia manakah yang merupakan satu-satunya habitat alami Komodo di dunia?',
      question_en: 'Which Indonesian island is the only natural wild habitat of Komodo Dragons?',
      options_id: ['Pulau Komodo & Flores (NTT)', 'Pulau Bali & Lombok', 'Pulau Kalimantan', 'Kepulauan Seribu'],
      options_en: ['Komodo & Flores Islands (NTT)', 'Bali & Lombok Islands', 'Borneo Island', 'Thousand Islands'],
      correctIndex: 0,
      explanation_id: 'Komodo (Varanus komodoensis) adalah kadal purba terbesar di bumi dan satwa endemik Nusa Tenggara Timur.',
      explanation_en: 'Komodo Dragons (Varanus komodoensis) are the largest extant lizards and endemic to East Nusa Tenggara, Indonesia.',
      hint_id: 'Terletak di kawasan Nusa Tenggara Timur dan memiliki Taman Nasional tersendiri.',
      hint_en: 'Located in East Nusa Tenggara and has its own dedicated National Park.',
      difficulty: 'junior',
    },
    {
      id: 'end-2',
      question_id: 'Bekantan, monyet berhidung mancung besar dan perenang andal, adalah satwa endemik pulau...',
      question_en: 'The Proboscis Monkey, with its large nose and great swimming skills, is endemic to...',
      options_id: ['Pulau Kalimantan (Borneo)', 'Pulau Sumatra', 'Pulau Jawa', 'Pulau Sulawesi'],
      options_en: ['Borneo (Kalimantan)', 'Sumatra Island', 'Java Island', 'Sulawesi Island'],
      correctIndex: 0,
      explanation_id: 'Bekantan (Nasalis larvatus) hanya hidup di hutan bakau dan rawa gambut pulau Kalimantan.',
      explanation_en: 'Proboscis monkeys (Nasalis larvatus) inhabit the mangrove and peat swamp forests of Borneo.',
      hint_id: 'Pulau besar berhutan lebat yang kaya akan ekosistem hutan bakau rawa gambut.',
      hint_en: 'The large island renowned for extensive tropical peat swamps and river mangroves.',
      difficulty: 'junior',
    },
    {
      id: 'end-3',
      question_id: 'Apa nama hewan mamalia kerdil bertanduk runcing yang merupakan kerbau purba endemik Sulawesi?',
      question_en: 'What is the name of the dwarf horned bovid endemic to Sulawesi island?',
      options_id: ['Anoa (Bubalus depressicornis)', 'Babirusa', 'Banteng Jawa', 'Tapir Asia'],
      options_en: ['Anoa (Bubalus depressicornis)', 'Babirusa', 'Javan Banteng', 'Asian Tapir'],
      correctIndex: 0,
      explanation_id: 'Anoa adalah kerbau terkecil di dunia dan satwa dilindungi endemik Pulau Sulawesi.',
      explanation_en: 'Anoa is the smallest wild buffalo species in the world, endemic to Sulawesi.',
      hint_id: 'Sering dijuluki sebagai kerbau kerdil atau sapi hutan khas Sulawesi.',
      hint_en: 'Often called the forest dwarf buffalo of Sulawesi.',
      difficulty: 'ranger',
    },
    {
      id: 'end-4',
      question_id: 'Berapa persen perkiraan keanekaragaman hayati dunia yang hidup di wilayah daratan & lautan Indonesia?',
      question_en: 'What percentage of the world\'s total biodiversity is harbored within Indonesia?',
      options_id: ['Sekitar 17%', 'Kurang dari 3%', 'Hanya 5%', 'Tepat 50%'],
      options_en: ['Around 17%', 'Less than 3%', 'Only 5%', 'Exactly 50%'],
      correctIndex: 0,
      explanation_id: 'Indonesia adalah salah satu negara Mega-Biodiversitas utama dunia yang menampung sekitar 17% spesies flora & fauna bumi.',
      explanation_en: 'Indonesia is one of the premier megadiverse nations, sheltering roughly 17% of all known species on Earth.',
      hint_id: 'Hampir seperlima (hampir 20%) dari seluruh spesies di planet bumi.',
      hint_en: 'Close to one-fifth of all global species live in the Indonesian archipelago.',
      difficulty: 'ranger',
    },
    {
      id: 'end-5',
      question_id: 'Burung Jalak Bali (Leucopsar rothschildi) memiliki ciri fisik khas berupa...',
      question_en: 'The Bali Myna (Leucopsar rothschildi) features a distinctive physical trait:',
      options_id: ['Bulu putih bersih dengan kulit biru di sekitar mata', 'Bulu merah membara di seluruh tubuh', 'Paruh melengkung seperti elang', 'Ekor sangat panjang bercabang dua'],
      options_en: ['Pure white plumage with bright blue eye patches', 'Blazing red feathers across its body', 'Hooked raptor beak', 'Forked twin tails'],
      correctIndex: 0,
      explanation_id: 'Jalak Bali adalah burung langka endemik Pulau Bali yang terkenal dengan bulu putih bersih, jambul indah, dan topeng biru di sekitar mata.',
      explanation_en: 'The Bali Myna is critically endangered, recognized by snowy white plumage and vivid blue bare skin encircling its eyes.',
      hint_id: 'Warna tubuhnya didominasi putih dengan aksen biru terang di wajahnya.',
      hint_en: 'Dominated by white feathers with vivid sky-blue facial markings.',
      difficulty: 'junior',
    },
    {
      id: 'end-6',
      question_id: 'Babirusa (Babyrousa babyrussa) asal Sulawesi dan Maluku terkenal karena memiliki...',
      question_en: 'The Babirusa of Sulawesi and Maluku is famous for possessing...',
      options_id: ['Taring atas yang tumbuh melengkung menembus moncongnya', 'Cakar tajam untuk memanjat pohon', 'Tanduk ganda di kepala', 'Kantung di perut seperti kangguru'],
      options_en: ['Upper tusks that curve upwards through its snout', 'Sharp arboreal climbing claws', 'Double horns on forehead', 'A marsupial belly pouch'],
      correctIndex: 0,
      explanation_id: 'Taring atas babirusa jantan menembus kulit moncong atasnya dan melengkung ke belakang ke arah dahi.',
      explanation_en: 'Male babirusas have upper canines that pierce the top snout skin and curve back towards the eyes.',
      hint_id: 'Gigi taring unik yang mencuat menembus kulit moncongnya.',
      hint_en: 'Bizarre curved canines that puncture right through its upper snout.',
      difficulty: 'ranger',
    },
  ],

  schmutzer: [
    {
      id: 'sch-1',
      question_id: 'Berapa persentase kemiripan susunan DNA antara Orangutan dan Manusia?',
      question_en: 'What is the percentage of DNA similarity between Orangutans and Humans?',
      options_id: ['Sekitar 97%', 'Hanya 60%', 'Sekitar 40%', 'Persis 100%'],
      options_en: ['Around 97%', 'Only 60%', 'Around 40%', 'Exactly 100%'],
      correctIndex: 0,
      explanation_id: 'Orangutan berbagi sekitar 97% materi genetik DNA dengan manusia, menjadikannya salah satu kerabat terdekat kita.',
      explanation_en: 'Orangutans share roughly 97% of their genetic DNA with humans, making them one of our closest living relatives.',
      hint_id: 'Sangat tinggi, melebihi 95% kode genetik.',
      hint_en: 'Extremely high, exceeding 95% genetic similarity.',
      difficulty: 'junior',
    },
    {
      id: 'sch-2',
      question_id: 'Kera besar manakah di Pusat Primata Schmutzer yang memiliki kekuatan fisik terbesar dan dada kekar perak (Silverback)?',
      question_en: 'Which great ape housed at Schmutzer Primate Center features a massive build and Silverback alpha crest?',
      options_id: ['Gorila Dataran Rendah', 'Bekantan', 'Monyet Ekor Panjang', 'Lutung Kelabu'],
      options_en: ['Lowland Gorilla', 'Proboscis Monkey', 'Long-tailed Macaque', 'Silvered Leaf Monkey'],
      correctIndex: 0,
      explanation_id: 'Gorila jantan dewasa yang memimpin kelompok disebut "Silverback" karena bulu putih keperakan di punggungnya.',
      explanation_en: 'Mature male gorillas leading a troop are known as Silverbacks due to silvery grey hair on their backs.',
      hint_id: 'Kera besar pemakan tumbuhan asli benua Afrika dengan tubuh tegap kekar.',
      hint_en: 'The largest living primate, native to African tropical forests.',
      difficulty: 'junior',
    },
    {
      id: 'sch-3',
      question_id: 'Owa Jawa (Hylobates moloch) bergerak berpindah dari dahan ke dahan dengan teknik berayun menggunakan tangan yang disebut...',
      question_en: 'Javan Gibbons swing gracefully branch to branch using arm-swinging locomotion called...',
      options_id: ['Brakiasi (Brachiation)', 'Ekolokasi', 'Kamuflase', 'Maturasi'],
      options_en: ['Brachiation', 'Echolocation', 'Camouflage', 'Maturation'],
      correctIndex: 0,
      explanation_id: 'Brakiasi adalah cara gerak berayun khas primata menggunakan kedua lengan secara bergantian dengan sangat lincah.',
      explanation_en: 'Brachiation is a specialized form of arboreal locomotion where primates swing branch to branch using only their arms.',
      hint_id: 'Istilah ilmiah biologi untuk lokomosi ayunan lengan.',
      hint_en: 'Scientific biological term derived from the Latin root for "arm".',
      difficulty: 'ranger',
    },
    {
      id: 'sch-4',
      question_id: 'Siamang (Symphalangus syndactylus) memiliki kantung tenggorokan besar (gular sac) yang berfungsi untuk...',
      question_en: 'Siamangs possess an inflatable throat pouch (gular sac) used for...',
      options_id: ['Memperbesar suara panggilan teritorial hingga terdengar 2 km', 'Menyimpan cadangan air minum', 'Menyimpan makanan biji-bijian', 'Menyelam di air danau'],
      options_en: ['Amplifying territorial vocal calls heard up to 2 km', 'Storing drinking water reserves', 'Hoarding seed rations', 'Diving underwater'],
      correctIndex: 0,
      explanation_id: 'Kantung tenggorokan siamang dapat menggembung sebesar kepalanya dan bertindak sebagai ruang resonansi suara nyanyian pagi.',
      explanation_en: 'The inflatable gular sac acts as a resonance chamber to produce loud duet booming calls.',
      hint_id: 'Alat resonansi suara yang membuat panggilannya bergema di seluruh hutan.',
      hint_en: 'A natural acoustic resonator making morning forest duets boom.',
      difficulty: 'junior',
    },
    {
      id: 'sch-5',
      question_id: 'Apa nama kera cerdas di Schmutzer yang mampu menggunakan ranting pohon sebagai alat untuk mengambil serangga?',
      question_en: 'Which primate at Schmutzer is renowned for manufacturing and using stick tools to forage insects?',
      options_id: ['Simpanse (Pan troglodytes)', 'Kukang', 'Tarsius', 'Lemur'],
      options_en: ['Chimpanzee (Pan troglodytes)', 'Slow Loris', 'Tarsier', 'Lemur'],
      correctIndex: 0,
      explanation_id: 'Simpanse dikenal sebagai salah satu hewan paling cerdas di dunia yang mampu membuat dan menggunakan berbagai perkakas alam.',
      explanation_en: 'Chimpanzees exhibit advanced cognitive abilities, utilizing sticks, stones, and leaves as tools.',
      hint_id: 'Kerabat genetik manusia paling dekat asal Afrika.',
      hint_en: 'The intelligent great ape of equatorial Africa.',
      difficulty: 'ranger',
    },
  ],

  nokturnal: [
    {
      id: 'nok-1',
      question_id: 'Hewan nokturnal adalah hewan yang beraktivitas dan mencari makan pada waktu...',
      question_en: 'Nocturnal animals are animals that are primarily active and hunt during...',
      options_id: ['Malam hari', 'Pagi hari saat fajar', 'Siang hari terik', 'Hanya saat hujan'],
      options_en: ['Nighttime', 'Morning at dawn', 'Midday sun', 'Only during heavy rain'],
      correctIndex: 0,
      explanation_id: 'Satwa nokturnal memiliki adaptasi mata dan pendengaran tajam untuk beraktivitas dalam gelap malam.',
      explanation_en: 'Nocturnal animals possess acute vision and hearing adapted for activity in dark night conditions.',
      hint_id: 'Ketika matahari sudah terbenam dan langit menjadi gelap gulita.',
      hint_en: 'When the sun has set and darkness covers the forest.',
      difficulty: 'junior',
    },
    {
      id: 'nok-2',
      question_id: 'Kukang Jawa (Nycticebus javanicus) adalah primata nokturnal pemalu yang memiliki keunikan langka yaitu...',
      question_en: 'The Javan Slow Loris is a nocturnal primate with a rare defense mechanism, which is...',
      options_id: ['Memiliki gigitan berbisa (racun)', 'Bisa terbang meluncur 100 meter', 'Bisa menyelam dalam air selama 1 jam', 'Mengeluarkan api dari mulut'],
      options_en: ['Producing a toxic venomous bite', 'Gliding 100 meters through air', 'Diving underwater for 1 hour', 'Spitting fire sparks'],
      correctIndex: 0,
      explanation_id: 'Kukang adalah satu-satunya primata di dunia yang berbisa; racun dihasilkan dari kelenjar di sikunya yang dijilat ke giginya.',
      explanation_en: 'Slow lorises are the only venomous primates on Earth; venom from their brachial elbow glands is transferred to their teeth.',
      hint_id: 'Pertahanan kimiawi mematikan yang sangat jarang ditemukan pada bangsa kera/primata.',
      hint_en: 'A chemical defense that is unique among primates.',
      difficulty: 'ranger',
    },
    {
      id: 'nok-3',
      question_id: 'Bagaimana kelelawar buah dan pemakan serangga bernavigasi dalam kegelapan pekat?',
      question_en: 'How do microbats navigate in total nocturnal darkness without colliding?',
      options_id: ['Ekolokasi pantulan gelombang suara', 'Sinar infra-merah dari mata', 'Mencium bau angin', 'Mengikuti bintang'],
      options_en: ['Echolocation via acoustic ultrasound', 'Infrared laser eyes', 'Smelling air currents', 'Navigating by stars'],
      correctIndex: 0,
      explanation_id: 'Kelelawar memancarkan suara berfrekuensi tinggi dan mendengarkan pantulannya untuk memetakan objek di depannya.',
      explanation_en: 'Bats emit high-frequency ultrasonic pulses and listen to echoes to build a mental acoustic map.',
      hint_id: 'Memanfaatkan pantulan bunyi ultrasonik seperti sonar kapal selam.',
      hint_en: 'Uses ultrasound echo reflections similar to submarine sonar.',
      difficulty: 'junior',
    },
    {
      id: 'nok-4',
      question_id: 'Binturong (Arctictis binturong) atau kucing beruang nokturnal memiliki aroma khas yang harum seperti...',
      question_en: 'The Binturong (Bearcat) emits a unique natural musk scent that smells remarkably like...',
      options_id: ['Jagung berondong hangat (Popcorn mentega)', 'Kopi hitam pahit', 'Bunga mawar segar', 'Jeruk nipis asam'],
      options_en: ['Hot buttered popcorn', 'Bitter black coffee', 'Fresh garden roses', 'Sour key limes'],
      correctIndex: 0,
      explanation_id: 'Kelenjar aroma binturong memproduksi senyawa kimia 2-acetyl-1-pyrroline, senyawa identik yang memberi bau harum pada popcorn mentega!',
      explanation_en: 'Binturongs produce 2-acetyl-1-pyrroline in their scent glands, the exact compound that aromas buttered popcorn.',
      hint_id: 'Aroma camilan renyah yang sering dinikmati saat menonton film di bioskop.',
      hint_en: 'Smells just like the warm buttery snack eaten at movie theatres.',
      difficulty: 'junior',
    },
    {
      id: 'nok-5',
      question_id: 'Tarsius, primata terkecil di dunia asal Indonesia, tidak bisa menggerakkan bola matanya, sehingga beradaptasi dengan cara...',
      question_en: 'Tarsiers cannot rotate their enormous eyes in their sockets, so they adapted by...',
      options_id: ['Memutar kepalanya hingga 180 derajat ke belakang', 'Melihat dengan telinganya', 'Berjalan mundur', 'Tidur dengan mata terbuka'],
      options_en: ['Rotating their neck up to 180 degrees backwards', 'Seeing with auditory ears', 'Walking only backwards', 'Sleeping eyes open'],
      correctIndex: 0,
      explanation_id: 'Mata tarsius berukuran lebih besar dari otaknya dan tetap diam di tempat, namun lehernya sangat fleksibel mampu berputar 180 derajat seperti burung hantu.',
      explanation_en: 'Each tarsier eyeball is as heavy as its brain; extremely flexible cervical vertebrae allow a 180° head swivel.',
      hint_id: 'Kemampuan leher berputar mirip burung hantu.',
      hint_en: 'Rotates its neck like an owl to look directly behind.',
      difficulty: 'ranger',
    },
  ],

  akuatik: [
    {
      id: 'ak-1',
      question_id: 'Burung Pelikan (Undan) di Danau Ragunan memiliki kantung paruh besar elastis yang berguna untuk...',
      question_en: 'Pelicans at Ragunan Lake possess a large expandable gular pouch used for...',
      options_id: ['Menyerok ikan dari air', 'Menyimpan makanan selama 1 tahun', 'Menghangatkan telur di udara', 'Menyelam di dasar lumpur'],
      options_en: ['Scooping fish from water', 'Storing food for a year', 'Warming eggs in flight', 'Diving into mud bottoms'],
      correctIndex: 0,
      explanation_id: 'Kantung paruh pelikan (gular pouch) dapat menampung hingga 13 liter air saat menyiduk ikan di danau.',
      explanation_en: 'A pelican\'s gular throat pouch scoops fish and drains water before swallowing prey whole.',
      hint_id: 'Berfungsi mirip jaring serok nelayan saat menangkap mangsa di air.',
      hint_en: 'Acts like a fisherman’s dip net to catch swimming fish.',
      difficulty: 'junior',
    },
    {
      id: 'ak-2',
      question_id: 'Berapa lama buaya muara (Crocodylus porosus) dapat menahan napas di dalam air saat mengintai mangsa?',
      question_en: 'How long can an adult Saltwater Crocodile hold its breath underwater when stalking?',
      options_id: ['Hingga 1 sampai 2 jam', 'Hanya 30 detik', 'Maksimal 3 menit', 'Tidak bisa menahan napas'],
      options_en: ['Up to 1 to 2 hours', 'Only 30 seconds', 'Maximum 3 minutes', 'Cannot hold breath'],
      correctIndex: 0,
      explanation_id: 'Buaya dapat memperlambat denyut jantungnya hingga hanya 2-3 detak per menit untuk menghemat oksigen selama berjam-jam.',
      explanation_en: 'Crocodiles can slow their heart rate down to 2-3 beats per minute, conserving oxygen for hours submerged.',
      hint_id: 'Sangat lama, bisa lebih dari enam puluh menit.',
      hint_en: 'Extremely long, lasting over sixty minutes.',
      difficulty: 'ranger',
    },
    {
      id: 'ak-3',
      question_id: 'Kura-kura Leher Ular asal Papua di Ragunan Zoo memiliki kebiasaan unik saat menarik kepalanya, yaitu...',
      question_en: 'The Snake-necked Turtle of Papua has a unique neck retracting mechanism, which is...',
      options_id: ['Melipat lehernya menyamping ke dalam tempurung', 'Menarik kepala lurus ke belakang', 'Melepaskan lehernya', 'Memperpendek leher dengan membuang udara'],
      options_en: ['Folding its neck sideways into the shell', 'Pulling head straight backwards', 'Detaching its neck', 'Exhaling air to shrink'],
      correctIndex: 0,
      explanation_id: 'Kura-kura leher ular termasuk sub-ordo Pleurodira (kura-kura leher sisi) yang melipat leher secara horizontal ke samping.',
      explanation_en: 'Snake-necked turtles belong to the Pleurodira suborder, which folds their elongated neck horizontally sideways.',
      hint_id: 'Termasuk kura-kura tipe leher samping (Pleurodira).',
      hint_en: 'Belongs to side-necked turtles (Pleurodira).',
      difficulty: 'ranger',
    },
    {
      id: 'ak-4',
      question_id: 'Berang-berang cakar kecil (Aonyx cinereus) di area perairan Ragunan memiliki bulu kedap air yang tahan basah karena...',
      question_en: 'Asian Small-clawed Otters stay dry in water due to dense fur lubricated by...',
      options_id: ['Lapisan minyak alami dari kelenjar khusus', 'Kulit bersisik seperti ikan', 'Mengeringkan bulu dengan panas tubuh', 'Tidak pernah menyentuh air'],
      options_en: ['Natural waterproofing oil secreted from glands', 'Fish scales', 'Internal heating drying', 'Never touching water'],
      correctIndex: 0,
      explanation_id: 'Berang-berang memiliki lapisan rambut terpadat di dunia (hingga 1 juta rambut per inci persegi) yang dilapisi minyak kedap air.',
      explanation_en: 'Otters possess ultra-dense fur coated in water-repellent natural sebum oils that trap an insulating layer of air.',
      hint_id: 'Kelenjar alami yang memproduksi lapisan anti-air.',
      hint_en: 'Natural sebaceous oils that repel moisture.',
      difficulty: 'junior',
    },
  ],

  mamalia: [
    {
      id: 'mam-1',
      question_id: 'Gajah Sumatra (Elephas maximus sumatranus) berkomunikasi jarak jauh melalui getaran suara rendah yang disebut...',
      question_en: 'Sumatran elephants communicate over long distances using low-frequency acoustic vibrations called...',
      options_id: ['Infrasonik (di bawah 20 Hz)', 'Ultrasonik (di atas 20.000 Hz)', 'Gelombang mikro', 'Ekolokasi sonar'],
      options_en: ['Infrasound (below 20 Hz)', 'Ultrasound (above 20,000 Hz)', 'Microwave pulses', 'Sonar echolocation'],
      correctIndex: 0,
      explanation_id: 'Suara infrasonik gajah dapat merambat melalui tanah dan udara hingga jarak beberapa kilometer tanpa terdengar telinga manusia biasa.',
      explanation_en: 'Elephants generate deep infrasonic rumbles that travel through earth and air across several kilometers.',
      hint_id: 'Frekuensi suara sangat rendah di bawah batas pendengaran manusia normal.',
      hint_en: 'Frequencies below the normal lower threshold of human hearing.',
      difficulty: 'ranger',
    },
    {
      id: 'mam-2',
      question_id: 'Berapa rata-rata panjang lidah jerapah yang berwarna gelap untuk memetik daun berduri pohon akasia?',
      question_en: 'What is the average length of a giraffe\'s dark, prehensile tongue adapted for acacia leaves?',
      options_id: ['Sekitar 45–50 cm', 'Hanya 5 cm', 'Sekitar 15 cm', 'Hampir 2 meter'],
      options_en: ['Around 45–50 cm', 'Only 5 cm', 'Around 15 cm', 'Nearly 2 meters'],
      correctIndex: 0,
      explanation_id: 'Lidah jerapah panjangnya sekitar 45-50 cm dan berwarna hitam-kebiruan untuk melindunginya dari sengatan terik matahari.',
      explanation_en: 'A giraffe\'s tongue measures 45–50 cm and possesses dark melanin pigmentation to protect against sunburn.',
      hint_id: 'Kira-kira sepanjang penggaris setengah meter.',
      hint_en: 'Approximately half a meter in length.',
      difficulty: 'junior',
    },
    {
      id: 'mam-3',
      question_id: 'Berapa banyak makanan hijauan dan rumput yang dikonsumsi seekor gajah dewasa setiap harinya?',
      question_en: 'How much plant fodder and vegetation does an adult elephant consume in a single day?',
      options_id: ['Sekitar 150–200 kg', 'Hanya 10 kg', 'Sekitar 20 kg', 'Lebih dari 1.000 kg'],
      options_en: ['Around 150–200 kg', 'Only 10 kg', 'Around 20 kg', 'Over 1,000 kg'],
      correctIndex: 0,
      explanation_id: 'Gajah menghabiskan sekitar 16–18 jam sehari untuk makan dan dapat menghabiskan hingga 200 kg hijauan rumput dan buah-buahan.',
      explanation_en: 'Adult elephants spend up to 18 hours foraging daily, ingesting up to 200 kg of fresh grasses and foliage.',
      hint_id: 'Setara dengan berat dua sampai tiga orang dewasa.',
      hint_en: 'Roughly equivalent to the combined weight of two or three adult humans.',
      difficulty: 'junior',
    },
    {
      id: 'mam-4',
      question_id: 'Tapir Asia (Tapirus indicus) memiliki pola tubuh hitam-putih yang sangat kontras yang berfungsi untuk...',
      question_en: 'The Malayan Tapir\'s stark black and white body coloration serves as...',
      options_id: ['Kamuflase pemecah bayangan (disruptive coloration)', 'Menarik perhatian lawan jenis', 'Membuat predator silau di siang hari', 'Menakuti serangga'],
      options_en: ['Disruptive camouflage blending into moonlit shadows', 'Attracting mates', 'Blinding predators in daytime', 'Frightening flies'],
      correctIndex: 0,
      explanation_id: 'Pola belang hitam-putih tapir memecah siluet tubuhnya di bawah bayangan pohon hutan malam sehingga tampak seperti batu besar.',
      explanation_en: 'The contrasting black and white pattern breaks up the outline of the tapir in dappled rainforest shade.',
      hint_id: 'Kamuflase optik yang membuyarkan bentuk tubuh di tengah bayang-bayang hutan.',
      hint_en: 'Breaks up its visual silhouette in forest shadow.',
      difficulty: 'ranger',
    },
  ],

  aves: [
    {
      id: 'av-1',
      question_id: 'Burung Cenderawasih yang terkenal dengan bulu hias spektakulernya berasal dari wilayah...',
      question_en: 'The Birds of Paradise, celebrated for their iridescent display plumage, originate from...',
      options_id: ['Papua dan Kepulauan Aru (Indonesia Timur)', 'Hutan Jawa Barat', 'Pulau Madura', 'Dataran Tinggi Dieng'],
      options_en: ['Papua and Aru Islands (Eastern Indonesia)', 'West Java Forests', 'Madura Island', 'Dieng Plateau'],
      correctIndex: 0,
      explanation_id: 'Cenderawasih adalah burung kebanggaan Papua yang sering dijuluki "Bird of Paradise" karena keindahan tarian dan warna bulunya.',
      explanation_en: 'Birds of paradise are endemic treasures of Papua, famous for courtship dances and radiant plumage.',
      hint_id: 'Wilayah paling timur kepulauan Nusantara.',
      hint_en: 'The easternmost expanse of the Indonesian archipelago.',
      difficulty: 'junior',
    },
    {
      id: 'av-2',
      question_id: 'Burung Kasuari Gelambir Ganda memiliki cakar tajam seperti pisau belati pada jari kakinya yang digunakan untuk...',
      question_en: 'The Southern Cassowary carries a dagger-like inner claw on its foot used primarily for...',
      options_id: ['Mempertahankan diri dari ancaman predator', 'Menangkap ikan di laut', 'Memanjat pohon tinggi', 'Membangun sarang di atas dahan'],
      options_en: ['Self-defense against predators and threats', 'Catching ocean fish', 'Climbing tall trees', 'Weaving high nests'],
      correctIndex: 0,
      explanation_id: 'Cakar tajam sepanjang 12 cm pada kaki kasuari dapat memberikan tendangan kuat yang sangat berbahaya bagi pemangsa.',
      explanation_en: 'Cassowaries possess a formidable 12 cm middle toe claw capable of delivering lethal defensive kicks.',
      hint_id: 'Senjata alami untuk melindungi diri dan wilayah teritorialnya.',
      hint_en: 'A natural weapon for personal and territorial protection.',
      difficulty: 'ranger',
    },
    {
      id: 'av-3',
      question_id: 'Burung apa yang menjadi maskot resmi DKI Jakarta yang juga dapat dikagumi di Taman Margasatwa Ragunan?',
      question_en: 'Which raptor serves as the official animal mascot of Jakarta and is safeguarded at Ragunan?',
      options_id: ['Elang Bondol (Haliastur indus)', 'Burung Merak', 'Kakatua Raja', 'Burung Jalak Bali'],
      options_en: ['Brahminy Kite (Haliastur indus)', 'Green Peafowl', 'Palm Cockatoo', 'Bali Myna'],
      correctIndex: 0,
      explanation_id: 'Elang Bondol dengan kepala dan dada putih bersih adalah maskot resmi Provinsi DKI Jakarta.',
      explanation_en: 'The Brahminy Kite, with its striking white head and chestnut body, is Jakarta’s official provincial mascot.',
      hint_id: 'Burung pemangsa dengan dada berwarna putih bersih yang menjadi simbol kota Jakarta.',
      hint_en: 'The raptor featuring a pure white head and chest that symbolizes Jakarta.',
      difficulty: 'junior',
    },
    {
      id: 'av-4',
      question_id: 'Merak Hijau jantan (Pavo muticus) melebarkan bulu ekornya yang membentuk kipas raksasa bertotol mata terutama untuk...',
      question_en: 'Male Green Peafowls unfurl their massive train of ocelli eye-spotted feathers primarily to...',
      options_id: ['Menarik perhatian merak betina saat musim kawin', 'Terbang meluncur melintasi samudera', 'Menangkap serangga terbang', 'Menghangatkan tubuh saat hujan'],
      options_en: ['Court female peahens during breeding season', 'Glide across oceans', 'Catch flying beetles', 'Insulate during rain'],
      correctIndex: 0,
      explanation_id: 'Bulu ekor hias merak jantan digetarkan untuk menghasilkan suara getaran rendah yang memikat perhatian betina.',
      explanation_en: 'Peacocks fan and vibrate their ornate covert feathers during courtship displays to impress peahens.',
      hint_id: 'Tarian memikat hati pasangan merak betina.',
      hint_en: 'A visual courtship display for female mates.',
      difficulty: 'junior',
    },
  ],

  reptil: [
    {
      id: 'rep-1',
      question_id: 'Mengapa reptil seperti buaya dan ular sering berjemur di bawah sinar matahari pagi?',
      question_en: 'Why do reptiles such as crocodiles and snakes bask in the morning sun?',
      options_id: ['Mereka berdarah dingin (Poikiloterm) dan butuh panas untuk metabolisme', 'Untuk mengubah warna kulit menjadi hijau', 'Agar bisa tidur lebih nyenyak', 'Supaya tidak lapar sepanjang hari'],
      options_en: ['They are ectothermic (cold-blooded) and require solar heat for metabolism', 'To change their skin green', 'To sleep deeper', 'To avoid feeling hungry'],
      correctIndex: 0,
      explanation_id: 'Reptil tidak bisa memproduksi panas tubuh sendiri, sehingga mereka berjemur (basking) untuk meningkatkan suhu tubuh dan melancarkan pencernaan.',
      explanation_en: 'Reptiles are ectotherms that rely on environmental ambient heat to regulate body temperature and digestion.',
      hint_id: 'Terkait dengan sifat darah dingin yang mengandalkan suhu lingkungan.',
      hint_en: 'Related to cold-blooded physiology depending on external warmth.',
      difficulty: 'junior',
    },
    {
      id: 'rep-2',
      question_id: 'Ular Sanca Kembang / Batik (Malayopython reticulatus) di Ragunan menaklukkan mangsanya dengan cara...',
      question_en: 'The Reticulated Python at Ragunan subdues its prey primarily by...',
      options_id: ['Melilit kuat hingga pernapasan mangsa berhenti (konstriksi)', 'Menyemburkan bisa racun mematikan', 'Menyengat dengan ekor', 'Menghipnotis mangsa dengan mata'],
      options_en: ['Constriction (wrapping tightly to stop bloodflow and breathing)', 'Injecting lethal venom', 'Stinging with tail spines', 'Hypnotizing with stare'],
      correctIndex: 0,
      explanation_id: 'Ular sanca batik adalah predator non-bisa yang menggunakan otot tubuh raksasanya untuk melilit (konstriksi) mangsanya.',
      explanation_en: 'Reticulated pythons are non-venomous constrictors that use massive muscular coils to halt prey circulation.',
      hint_id: 'Menggunakan kekuatan otot tubuhnya yang berukuran hingga lebih dari 6 meter.',
      hint_en: 'Employs pure muscular squeeze rather than chemical venom.',
      difficulty: 'junior',
    },
    {
      id: 'rep-3',
      question_id: 'Bagaimana Komodo mendeteksi bau bangkai mangsanya dari jarak hingga sejauh 9 kilometer?',
      question_en: 'How do Komodo dragons detect carrion from distances up to 9 kilometers away?',
      options_id: ['Menjulurkan lidah bercabang ke organ Jacobson di langit-langit mulut', 'Melihat dengan teropong mata tajam', 'Mendengarkan getaran tanah dengan cakar', 'Mencium bau lewat lubang telinga'],
      options_en: ['Flicking forked tongue into Jacobson\'s organ in palate', 'Using binocular telephoto eyes', 'Feeling seismic foot tremors', 'Sniffing ear canals'],
      correctIndex: 0,
      explanation_id: 'Komodo mengumpulkan partikel bau di udara dengan lidah kuningnya yang bercabang, lalu menempelkannya ke organ vomeronasal (Jacobson).',
      explanation_en: 'The forked yellow tongue captures scent molecules and transfers them to the roof Jacobson\'s organ to navigate chemical gradients.',
      hint_id: 'Lidah bercabang yang menjulur keluar masuk menangkap partikel aroma.',
      hint_en: 'Flicking its forked tongue to sample air molecules.',
      difficulty: 'ranger',
    },
    {
      id: 'rep-4',
      question_id: 'Kura-kura Raksasa Aldabra di Ragunan Zoo dapat hidup mencapai usia lebih dari...',
      question_en: 'Aldabra Giant Tortoises at Ragunan Zoo are famed for lifespans exceeding...',
      options_id: ['100 hingga 150 tahun', 'Hanya 10 tahun', 'Maksimal 25 tahun', 'Sekitar 40 tahun'],
      options_en: ['100 to over 150 years', 'Only 10 years', 'Maximum 25 years', 'Around 40 years'],
      correctIndex: 0,
      explanation_id: 'Kura-kura raksasa memiliki metabolisme sangat lambat yang membuat mereka menjadi salah satu hewan dengan masa hidup terpanjang di muka bumi.',
      explanation_en: 'Their slow cellular metabolism enables them to live well over a century, outliving human observers.',
      hint_id: 'Bisa hidup lebih dari satu abad.',
      hint_en: 'Can easily surpass a full century.',
      difficulty: 'junior',
    },
  ],

  karnivora: [
    {
      id: 'kar-1',
      question_id: 'Harimau Sumatra (Panthera tigris sumatrae) adalah subspesies harimau yang...',
      question_en: 'The Sumatran Tiger (Panthera tigris sumatrae) is the tiger subspecies that is...',
      options_id: ['Terkecil di dunia dengan loreng paling rapat', 'Terbesar di dunia', 'Satu-satunya yang tidak punya cakar', 'Hewan yang tidak bisa berenang'],
      options_en: ['The smallest in the world with dense dark stripes', 'The largest in the world', 'The only one lacking claws', 'Unable to swim'],
      correctIndex: 0,
      explanation_id: 'Ukuran tubuhnya yang kompak dan loreng rapat merupakan adaptasi evolusi untuk bergerak cepat di lebatnya hutan hujan Sumatra.',
      explanation_en: 'Its smaller compact build and closely spaced stripes are evolutionary adaptations for dense tropical rainforests.',
      hint_id: 'Berukuran paling ramping dibanding harimau Siberia atau Benggala.',
      hint_en: 'More compact and slender than Siberian or Bengal tigers.',
      difficulty: 'junior',
    },
    {
      id: 'kar-2',
      question_id: 'Apakah singa (Panthera leo) dan harimau menyukai air dan bisa berenang?',
      question_en: 'Do big cats such as tigers and lions have swimming abilities in waterways?',
      options_id: ['Harimau adalah perenang andal yang suka berendam di air', 'Semua kucing besar takut pada air', 'Hanya singa yang bisa berenang', 'Mereka tenggelam jika masuk air'],
      options_en: ['Tigers are strong swimmers that frequently bathe in water', 'All big cats fear water', 'Only lions can swim', 'They instantly sink in water'],
      correctIndex: 0,
      explanation_id: 'Berbeda dengan kucing rumah, harimau sangat menyukai air dan sering berendam di telaga atau danau Ragunan saat cuaca terik.',
      explanation_en: 'Unlike house cats, tigers adore water and readily swim across wide rivers and lakes to cool off.',
      hint_id: 'Harimau sangat menikmati berendam di air saat cuaca panas.',
      hint_en: 'Tigers frequently take relaxing dips in lakes during hot days.',
      difficulty: 'junior',
    },
    {
      id: 'kar-3',
      question_id: 'Singa Afrika hidup dalam kawanan sosial keluarga yang terstruktur yang disebut...',
      question_en: 'African lions live in structured family social groups called a...',
      options_id: ['Pride', 'Flock', 'Pack', 'Herd'],
      options_en: ['Pride', 'Flock', 'Pack', 'Herd'],
      correctIndex: 0,
      explanation_id: 'Singa adalah satu-satunya kucing besar yang hidup berkelompok sosial (Pride), biasanya terdiri dari beberapa betina, anak-anak, dan jantan dominan.',
      explanation_en: 'Lions are unique among felids for living in cohesive social troops designated as prides.',
      hint_id: 'Istilah bahasa Inggris yang berarti rasa bangga.',
      hint_en: 'English word synonymous with honor or self-respect.',
      difficulty: 'ranger',
    },
    {
      id: 'kar-4',
      question_id: 'Beruang Madu (Helarctos malayanus) di Ragunan memiliki lidah yang sangat panjang (hingga 25 cm) yang berguna untuk...',
      question_en: 'The Sun Bear possesses an extraordinarily long tongue (up to 25 cm) adapted for...',
      options_id: ['Menjilat madu dan rayap dari dalam lubang pohon', 'Berenang di arus sungai deras', 'Menangkap burung yang sedang terbang', 'Membersihkan bulu badannya'],
      options_en: ['Extracting honey and termites from deep tree hollows', 'Swimming swift rivers', 'Snatching birds in flight', 'Grooming back fur'],
      correctIndex: 0,
      explanation_id: 'Lidah panjang dan fleksibel beruang madu dirancang khusus untuk mengeruk sarang lebah madu liar dan serangga di sela kayu.',
      explanation_en: 'Its long, slender tongue allows sun bears to extract insects and honeycombs from deep arboreal cavities.',
      hint_id: 'Berhubungan dengan makanan favoritnya yaitu madu lebah dan serangga.',
      hint_en: 'Designed to lick sweet wild honey from narrow holes.',
      difficulty: 'junior',
    },
  ],
};

// Fallback general trivia
export const GENERAL_TRIVIA: GeneratedQuestion[] = Object.values(CATEGORY_QUESTION_BANK).flat();

// Category trivia helper with randomized options and balanced distribution
export function getQuestionsForCategory(
  categoryId: string = 'endemik',
  difficulty: 'junior' | 'ranger' | 'all' = 'all',
  limit: number = 5
): GeneratedQuestion[] {
  const resolvedCat = resolveQuizCategoryId(categoryId);
  let questions = CATEGORY_QUESTION_BANK[resolvedCat] || CATEGORY_QUESTION_BANK['endemik'];

  if (difficulty !== 'all') {
    const filtered = questions.filter((q) => q.difficulty === difficulty);
    if (filtered.length >= 3) {
      questions = filtered;
    }
  }

  // Shuffle question order AND shuffle options for each question
  const picked = shuffleArray(questions).slice(0, limit);
  return picked.map(shuffleQuestionOptions);
}

// Generate random questions from all animals (database integration)
export function generateQuestionsFromAnimals(
  animals: Animal[],
  categoryId?: string,
  maxQuestions: number = 5
): GeneratedQuestion[] {
  if (animals.length === 0) {
    return getQuestionsForCategory(categoryId, 'all', maxQuestions);
  }

  let eligibleAnimals = animals.filter((a) => a.name && a.name.trim() !== '');

  if (categoryId && categoryId !== 'all') {
    const catLower = categoryId.toLowerCase();
    const categoryFiltered = animals.filter((a) => {
      const aCat = (a.category || '').toLowerCase();
      const aZone = (a.zone || '').toLowerCase();
      const aName = (a.name || '').toLowerCase();
      return aCat.includes(catLower) || aZone.includes(catLower) || aName.includes(catLower);
    });
    if (categoryFiltered.length > 0) {
      eligibleAnimals = categoryFiltered;
    }
  }

  const generated: GeneratedQuestion[] = [];
  const questionTexts = new Set<string>();

  for (const animal of shuffleArray(eligibleAnimals)) {
    const name = animal.name.split('"')[0].trim();
    if (animal.habitat) {
      const qText = `Di mana habitat alami dari ${name}?`;
      if (!questionTexts.has(qText)) {
        questionTexts.add(qText);
        const wrongHabitats = ['Gurun Pasir', 'Tundra Kutub', 'Pegunungan Salju', 'Lautan Pasifik Dalam', 'Hutan Sabana'];
        const options = shuffleArray([animal.habitat, ...getRandomItems(wrongHabitats, 3, animal.habitat)]);
        generated.push({
          id: `gen-hab-${animal.id}-${Math.random()}`,
          question_id: qText,
          question_en: `What is the natural habitat of ${name}?`,
          options_id: options,
          options_en: options,
          correctIndex: options.indexOf(animal.habitat),
          explanation_id: `${name} secara alami hidup di habitat ${animal.habitat}.`,
          explanation_en: `${name} is natively adapted to ${animal.habitat}.`,
          hint_id: `Habitat aslinya adalah ${animal.habitat.split(' ')[0]}.`,
          hint_en: `Think of environments with ${animal.habitat.split(' ')[0]}.`,
          difficulty: 'junior',
        });
      }
    }
  }

  const resolved = resolveQuizCategoryId(categoryId);
  const combined = [...generated, ...(CATEGORY_QUESTION_BANK[resolved] || CATEGORY_QUESTION_BANK.endemik)];
  const picked = shuffleArray(combined).slice(0, maxQuestions);
  return picked.map(shuffleQuestionOptions);
}
