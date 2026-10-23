import { Plant } from '@/hooks/usePlants';

export interface GeneratedPlantQuestion {
  id: string;
  question_id: string;
  question_en: string;
  options_id: string[];
  options_en: string[];
  correctIndex: number;
  explanation_id: string;
  explanation_en: string;
}

// Shuffle array helper
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get random items from array
const getRandomItems = <T>(array: T[], count: number, exclude?: T): T[] => {
  const filtered = exclude ? array.filter(item => item !== exclude) : array;
  return shuffleArray(filtered).slice(0, count);
};

// Fun facts database for plants
const PLANT_FUN_FACTS: Record<string, { id: string; en: string }[]> = {
  anggrek: [
    { id: 'Indonesia memiliki lebih dari 5.000 spesies anggrek, menjadikannya salah satu negara dengan keanekaragaman anggrek terbanyak!', en: 'Indonesia has over 5,000 orchid species, making it one of the countries with the most orchid diversity!' },
    { id: 'Anggrek bisa hidup di pohon tanpa menyerap nutrisi dari pohon tersebut!', en: 'Orchids can live on trees without absorbing nutrients from them!' },
  ],
  bambu: [
    { id: 'Bambu adalah tanaman yang tumbuh paling cepat di dunia, bisa tumbuh hingga 91 cm per hari!', en: 'Bamboo is the fastest growing plant in the world, it can grow up to 91 cm per day!' },
    { id: 'Bambu menghasilkan 35% lebih banyak oksigen dibanding pohon biasa!', en: 'Bamboo produces 35% more oxygen than regular trees!' },
  ],
  raflesia: [
    { id: 'Raflesia arnoldii adalah bunga terbesar di dunia dan hanya ada di Indonesia!', en: 'Raflesia arnoldii is the largest flower in the world and only exists in Indonesia!' },
    { id: 'Raflesia tidak memiliki daun, batang, atau akar dan hidup sebagai parasit!', en: 'Raflesia has no leaves, stem, or roots and lives as a parasite!' },
  ],
  default: [
    { id: 'Indonesia memiliki lebih dari 30.000 spesies tumbuhan berbunga!', en: 'Indonesia has more than 30,000 species of flowering plants!' },
    { id: 'Hutan hujan Indonesia adalah yang terkaya kedua di dunia setelah Amazon!', en: 'Indonesian rainforests are the second richest in the world after Amazon!' },
    { id: 'Tumbuhan menghasilkan oksigen melalui proses fotosintesis!', en: 'Plants produce oxygen through photosynthesis!' },
  ]
};

// Get fun fact for a plant
const getFunFact = (plantName: string): { id: string; en: string } => {
  const nameLower = plantName.toLowerCase();
  for (const [key, facts] of Object.entries(PLANT_FUN_FACTS)) {
    if (nameLower.includes(key)) {
      return facts[Math.floor(Math.random() * facts.length)];
    }
  }
  return PLANT_FUN_FACTS.default[Math.floor(Math.random() * PLANT_FUN_FACTS.default.length)];
};

// Question type definitions
type QuestionGenerator = (plant: Plant, allPlants: Plant[]) => GeneratedPlantQuestion | null;

// Question generators
const questionGenerators: QuestionGenerator[] = [
  // 1. Habitat question
  (plant, allPlants) => {
    if (!plant.habitat) return null;
    const name = plant.name;
    const correctAnswer = plant.habitat;
    
    const otherHabitats = Array.from(new Set(
      allPlants.filter(p => p.habitat && p.habitat !== correctAnswer).map(p => p.habitat!)
    ));
    const fallbackHabitats = ['Hutan Tropis', 'Hutan Bakau', 'Pegunungan', 'Dataran Rendah', 'Hutan Hujan', 'Rawa'];
    const allHabitatOptions = [...new Set([...otherHabitats, ...fallbackHabitats])].filter(h => h !== correctAnswer);
    const wrongAnswers = getRandomItems(allHabitatOptions, 3);
    
    const allOptions = shuffleArray([correctAnswer, ...wrongAnswers]);
    const funFact = getFunFact(plant.name);
    
    return {
      id: `habitat-${plant.id}-${Math.random()}`,
      question_id: `Di mana habitat alami ${name}?`,
      question_en: `What is the natural habitat of ${name}?`,
      options_id: allOptions,
      options_en: allOptions,
      correctIndex: allOptions.indexOf(correctAnswer),
      explanation_id: `${name} tumbuh di ${correctAnswer}. ${funFact.id}`,
      explanation_en: `${name} grows in ${correctAnswer}. ${funFact.en}`
    };
  },

  // 2. Latin name question
  (plant, allPlants) => {
    if (!plant.latin_name) return null;
    const name = plant.name;
    const correctAnswer = plant.latin_name;
    
    const otherLatinNames = allPlants
      .filter(p => p.latin_name && p.latin_name !== correctAnswer)
      .map(p => p.latin_name!);
    const wrongAnswers = getRandomItems(otherLatinNames, 3);
    
    if (wrongAnswers.length < 3) return null;
    
    const allOptions = shuffleArray([correctAnswer, ...wrongAnswers]);
    
    return {
      id: `latin-${plant.id}-${Math.random()}`,
      question_id: `Apa nama ilmiah dari ${name}?`,
      question_en: `What is the scientific name of ${name}?`,
      options_id: allOptions,
      options_en: allOptions,
      correctIndex: allOptions.indexOf(correctAnswer),
      explanation_id: `Nama ilmiah ${name} adalah ${correctAnswer}. Nama ini digunakan oleh ilmuwan di seluruh dunia!`,
      explanation_en: `The scientific name of ${name} is ${correctAnswer}. This name is used by scientists worldwide!`
    };
  },

  // 3. Location in zoo question
  (plant, allPlants) => {
    if (!plant.location) return null;
    const name = plant.name;
    const correctAnswer = plant.location;
    
    const otherLocations = Array.from(new Set(
      allPlants.filter(p => p.location && p.location !== correctAnswer).map(p => p.location!)
    ));
    const fallbackLocations = ['Taman Bunga A', 'Area Konservasi B', 'Hutan Bambu C', 'Taman Anggrek D', 'Area Tropis E'];
    const allLocationOptions = [...new Set([...otherLocations, ...fallbackLocations])].filter(l => l !== correctAnswer);
    const wrongAnswers = getRandomItems(allLocationOptions, 3);
    
    const allOptions = shuffleArray([correctAnswer, ...wrongAnswers]);
    
    return {
      id: `location-${plant.id}-${Math.random()}`,
      question_id: `Di mana kamu bisa menemukan ${name} di Taman Margasatwa Ragunan?`,
      question_en: `Where can you find ${name} at Ragunan Zoo?`,
      options_id: allOptions,
      options_en: allOptions,
      correctIndex: allOptions.indexOf(correctAnswer),
      explanation_id: `${name} ada di ${correctAnswer}. Jangan lupa kunjungi ya!`,
      explanation_en: `${name} is located at ${correctAnswer}. Don't forget to visit!`
    };
  },

  // 4. Identify plant from description
  (plant, allPlants) => {
    if (!plant.description || plant.description.length < 30) return null;
    const name = plant.name;
    const shortDesc = plant.description.substring(0, 80);
    
    const otherNames = allPlants
      .filter(p => p.id !== plant.id)
      .map(p => p.name);
    const wrongAnswers = getRandomItems(otherNames, 3);
    
    if (wrongAnswers.length < 3) return null;
    
    const allOptions = shuffleArray([name, ...wrongAnswers]);
    const funFact = getFunFact(plant.name);
    
    return {
      id: `identify-${plant.id}-${Math.random()}`,
      question_id: `Tumbuhan apa yang memiliki ciri-ciri: "${shortDesc}..."?`,
      question_en: `Which plant has these characteristics: "${shortDesc}..."?`,
      options_id: allOptions,
      options_en: allOptions,
      correctIndex: allOptions.indexOf(name),
      explanation_id: `Jawabannya adalah ${name}! ${funFact.id}`,
      explanation_en: `The answer is ${name}! ${funFact.en}`
    };
  },

  // 5. Category/type question
  (plant, allPlants) => {
    if (!plant.category) return null;
    const name = plant.name;
    const correctAnswer = plant.category;
    
    const otherCategories = Array.from(new Set(
      allPlants.filter(p => p.category && p.category !== correctAnswer).map(p => p.category!)
    ));
    const fallbackCategories = ['Anggrek', 'Bambu', 'Pohon', 'Semak', 'Lumut', 'Pakis'];
    const allCategoryOptions = [...new Set([...otherCategories, ...fallbackCategories])].filter(c => c !== correctAnswer);
    const wrongAnswers = getRandomItems(allCategoryOptions, 3);
    
    const allOptions = shuffleArray([correctAnswer, ...wrongAnswers]);
    
    return {
      id: `category-${plant.id}-${Math.random()}`,
      question_id: `${name} termasuk kelompok tumbuhan apa?`,
      question_en: `What group does ${name} belong to?`,
      options_id: allOptions,
      options_en: allOptions,
      correctIndex: allOptions.indexOf(correctAnswer),
      explanation_id: `${name} termasuk kelompok ${correctAnswer}!`,
      explanation_en: `${name} belongs to the ${correctAnswer} group!`
    };
  },

  // 6. Which plant grows in habitat X
  (plant, allPlants) => {
    if (!plant.habitat) return null;
    const name = plant.name;
    const habitat = plant.habitat;
    
    const otherNames = allPlants
      .filter(p => p.id !== plant.id && p.habitat && p.habitat !== habitat)
      .map(p => p.name);
    const wrongAnswers = getRandomItems(otherNames, 3);
    
    if (wrongAnswers.length < 3) return null;
    
    const allOptions = shuffleArray([name, ...wrongAnswers]);
    
    return {
      id: `habitat-who-${plant.id}-${Math.random()}`,
      question_id: `Tumbuhan mana yang tumbuh di ${habitat}?`,
      question_en: `Which plant grows in ${habitat}?`,
      options_id: allOptions,
      options_en: allOptions,
      correctIndex: allOptions.indexOf(name),
      explanation_id: `${name} adalah tumbuhan yang tumbuh di ${habitat}!`,
      explanation_en: `${name} is a plant that grows in ${habitat}!`
    };
  },

  // 7. Reverse Latin name question - "Tumbuhan mana yang memiliki nama ilmiah XYZ?"
  (plant, allPlants) => {
    if (!plant.latin_name) return null;
    const name = plant.name;
    const latinName = plant.latin_name;
    
    const otherNames = allPlants
      .filter(p => p.id !== plant.id)
      .map(p => p.name);
    const wrongAnswers = getRandomItems(otherNames, 3);
    
    if (wrongAnswers.length < 3) return null;
    
    const allOptions = shuffleArray([name, ...wrongAnswers]);
    
    return {
      id: `reverse-latin-${plant.id}-${Math.random()}`,
      question_id: `Tumbuhan mana yang memiliki nama ilmiah "${latinName}"?`,
      question_en: `Which plant has the scientific name "${latinName}"?`,
      options_id: allOptions,
      options_en: allOptions,
      correctIndex: allOptions.indexOf(name),
      explanation_id: `${name} memiliki nama ilmiah ${latinName}.`,
      explanation_en: `${name} has the scientific name ${latinName}.`
    };
  },

  // 8. True/False style - "Is this the correct latin name?"
  (plant, allPlants) => {
    if (!plant.latin_name) return null;
    const name = plant.name;
    
    const showCorrect = Math.random() > 0.5;
    const otherLatinNames = allPlants
      .filter(p => p.latin_name && p.id !== plant.id)
      .map(p => p.latin_name!);
    
    if (otherLatinNames.length === 0) return null;
    
    const displayedLatinName = showCorrect 
      ? plant.latin_name 
      : getRandomItems(otherLatinNames, 1)[0];
    
    const options = ['Benar', 'Salah'];
    const optionsEn = ['True', 'False'];
    const correctIdx = showCorrect ? 0 : 1;
    
    return {
      id: `tf-latin-${plant.id}-${Math.random()}`,
      question_id: `Apakah "${displayedLatinName}" adalah nama ilmiah dari ${name}?`,
      question_en: `Is "${displayedLatinName}" the scientific name of ${name}?`,
      options_id: options,
      options_en: optionsEn,
      correctIndex: correctIdx,
      explanation_id: showCorrect 
        ? `Benar! Nama ilmiah ${name} adalah ${plant.latin_name}.`
        : `Salah! Nama ilmiah ${name} yang benar adalah ${plant.latin_name}.`,
      explanation_en: showCorrect
        ? `Correct! The scientific name of ${name} is ${plant.latin_name}.`
        : `Wrong! The correct scientific name of ${name} is ${plant.latin_name}.`
    };
  }
];

// Generate random questions from all plants
export function generateQuestionsFromPlants(
  plants: Plant[],
  categoryId?: string,
  maxQuestions: number = 5
): GeneratedPlantQuestion[] {
  let eligiblePlants = plants.filter(p => p.name && p.name.trim() !== '');
  
  if (categoryId) {
    const categoryFiltered = plants.filter(p => 
      p.category_id === categoryId || 
      p.category?.toLowerCase() === categoryId.toLowerCase()
    );
    if (categoryFiltered.length > 0) {
      eligiblePlants = categoryFiltered;
    }
  }
  
  if (eligiblePlants.length === 0) return [];
  
  const candidateQuestions: GeneratedPlantQuestion[] = [];
  const questionTexts = new Set<string>();
  
  // Shuffle input list for maximum randomness
  const shuffledPlants = shuffleArray([...eligiblePlants]);
  const shuffledGenerators = shuffleArray([...questionGenerators]);
  
  // Build a large pool of candidate questions from all plants and generators
  for (const plant of shuffledPlants) {
    for (const generator of shuffledGenerators) {
      const q = generator(plant, plants);
      if (q && !questionTexts.has(q.question_id)) {
        questionTexts.add(q.question_id);
        candidateQuestions.push(q);
      }
    }
  }
  
  // Thoroughly shuffle the generated question pool
  const fullyShuffled = shuffleArray(candidateQuestions);
  return fullyShuffled.slice(0, maxQuestions);
}

// Static general trivia questions (fallback when no plant data)
export const GENERAL_PLANT_TRIVIA: GeneratedPlantQuestion[] = [
  {
    id: 'gen-1',
    question_id: 'Berapa spesies anggrek yang ada di Indonesia?',
    question_en: 'How many orchid species are there in Indonesia?',
    options_id: ['500', '1.000', '5.000+', '100'],
    options_en: ['500', '1,000', '5,000+', '100'],
    correctIndex: 2,
    explanation_id: 'Indonesia memiliki lebih dari 5.000 spesies anggrek, menjadikannya salah satu negara dengan keanekaragaman anggrek terbanyak!',
    explanation_en: 'Indonesia has over 5,000 orchid species, making it one of the countries with the most orchid diversity!'
  },
  {
    id: 'gen-2',
    question_id: 'Tanaman apa yang tumbuh paling cepat di dunia?',
    question_en: 'What is the fastest growing plant in the world?',
    options_id: ['Bambu', 'Kelapa', 'Rumput', 'Kangkung'],
    options_en: ['Bamboo', 'Coconut', 'Grass', 'Water spinach'],
    correctIndex: 0,
    explanation_id: 'Bambu adalah tanaman yang tumbuh paling cepat di dunia, bisa tumbuh hingga 91 cm per hari!',
    explanation_en: 'Bamboo is the fastest growing plant in the world, it can grow up to 91 cm per day!'
  },
  {
    id: 'gen-3',
    question_id: 'Bunga terbesar di dunia adalah?',
    question_en: 'What is the largest flower in the world?',
    options_id: ['Bunga Matahari', 'Raflesia Arnoldii', 'Teratai', 'Mawar'],
    options_en: ['Sunflower', 'Raflesia Arnoldii', 'Lotus', 'Rose'],
    correctIndex: 1,
    explanation_id: 'Raflesia arnoldii adalah bunga terbesar di dunia dan hanya ada di Indonesia!',
    explanation_en: 'Raflesia arnoldii is the largest flower in the world and only exists in Indonesia!'
  },
  {
    id: 'gen-4',
    question_id: 'Proses apa yang digunakan tumbuhan untuk menghasilkan oksigen?',
    question_en: 'What process do plants use to produce oxygen?',
    options_id: ['Respirasi', 'Fotosintesis', 'Fermentasi', 'Oksidasi'],
    options_en: ['Respiration', 'Photosynthesis', 'Fermentation', 'Oxidation'],
    correctIndex: 1,
    explanation_id: 'Tumbuhan menghasilkan oksigen melalui proses fotosintesis menggunakan sinar matahari!',
    explanation_en: 'Plants produce oxygen through photosynthesis using sunlight!'
  },
  {
    id: 'gen-5',
    question_id: 'Indonesia memiliki berapa spesies tumbuhan berbunga?',
    question_en: 'How many flowering plant species does Indonesia have?',
    options_id: ['5.000', '10.000', '20.000', '30.000+'],
    options_en: ['5,000', '10,000', '20,000', '30,000+'],
    correctIndex: 3,
    explanation_id: 'Indonesia memiliki lebih dari 30.000 spesies tumbuhan berbunga!',
    explanation_en: 'Indonesia has more than 30,000 species of flowering plants!'
  }
];
