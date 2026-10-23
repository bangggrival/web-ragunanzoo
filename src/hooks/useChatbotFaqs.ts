import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatbotFaq {
  id: string;
  question_id: string;
  question_en: string | null;
  answer_id: string;
  answer_en: string | null;
  keywords: string[];
  category: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ======================================================
// TEXT NORMALIZATION
// Handles Indonesian informal language, abbreviations,
// common typos, and punctuation stripping
// ======================================================
const SLANG_MAP: Record<string, string> = {
  // Common abbreviations
  'yg': 'yang', 'dgn': 'dengan', 'utk': 'untuk', 'krn': 'karena',
  'gmn': 'gimana', 'gimana': 'bagaimana', 'bgmn': 'bagaimana',
  'hrs': 'harus', 'blm': 'belum', 'sdh': 'sudah', 'udah': 'sudah',
  'tdk': 'tidak', 'gak': 'tidak', 'ga': 'tidak', 'nggak': 'tidak', 'ndak': 'tidak',
  'bisa': 'bisa', 'bs': 'bisa', 'bgt': 'banget', 'banget': 'sangat',
  'lg': 'lagi', 'lagi': 'sedang', 'msh': 'masih', 'mau': 'ingin',
  'kalo': 'kalau', 'kalau': 'jika', 'klo': 'kalau',
  'aja': 'saja', 'aj': 'saja', 'deh': '', 'dong': '', 'sih': '',
  'emg': 'memang', 'emang': 'memang',
  'tau': 'tahu', 'gw': 'saya', 'gue': 'saya', 'aku': 'saya', 'ane': 'saya',
  'lo': 'anda', 'loe': 'anda', 'lu': 'anda', 'elu': 'anda',
  'mkn': 'makan', 'minum': 'minum', 'dtg': 'datang',
  'tmpt': 'tempat', 'tp': 'tapi', 'tapi': 'tetapi',
  'pke': 'pakai', 'pake': 'pakai', 'make': 'memakai',
  'smpe': 'sampai', 'sampe': 'sampai', 'ampe': 'sampai',
  'info': 'informasi', 'inpo': 'informasi',
  'tlg': 'tolong', 'mhon': 'mohon',
  'knp': 'kenapa', 'knapa': 'kenapa', 'napa': 'kenapa',
  'ap': 'apa', 'apaan': 'apa', 'apa': 'apa',
  'dmn': 'dimana', 'mna': 'dimana', 'dimana': 'dimana',
  'kapan': 'kapan', 'kpn': 'kapan',
  'berapa': 'berapa', 'brp': 'berapa',
  'perlu': 'harus',
  'kebon': 'kebun', 'kebn': 'kebun',
  'binatang': 'binatang', 'hewan': 'binatang', 'satwa': 'binatang', 'fauna': 'binatang',
  'taman': 'taman', 'tmn': 'taman', 'kebun': 'kebun',
  'ragunan': 'ragunan', 'ragnuan': 'ragunan', 'raguanan': 'ragunan',
  'tiket': 'tiket', 'tket': 'tiket', 'ticket': 'tiket',
  'harga': 'harga', 'hrg': 'harga', 'biaya': 'harga', 'tarif': 'harga',
  'buka': 'buka', 'tutup': 'tutup', 'jam': 'jam', 'waktu': 'jam', 'pukul': 'jam',
  'parkir': 'parkir', 'parkirannya': 'parkir',
  'wahana': 'wahana', 'wahna': 'wahana', 'fasilitas': 'fasilitas',
  'toilet': 'toilet', 'wc': 'toilet', 'kamar mandi': 'toilet',
  'kuliner': 'makanan', 'jajan': 'makanan', 'makan': 'makanan',
  'foto': 'foto', 'swafoto': 'foto', 'selfie': 'foto',
  'anak': 'anak', 'anakanak': 'anak', 'bocah': 'anak', 'kids': 'anak',
  'keluarga': 'keluarga', 'keluargaan': 'keluarga',
  'ada': 'ada', 'adakah': 'ada', 'apakah': 'apakah',
  'boleh': 'boleh', 'diperbolehkan': 'boleh', 'diizinkan': 'boleh',
  'dilarang': 'dilarang', 'tidak boleh': 'dilarang',
};

// Synonym groups - any word in a group maps to others
const SYNONYM_GROUPS: string[][] = [
  ['buka', 'operasional', 'open', 'jam buka', 'waktu buka', 'tutup', 'jam tutup'],
  ['tiket', 'harga tiket', 'harga masuk', 'biaya masuk', 'tarif masuk', 'bayar'],
  ['parkir', 'tempat parkir', 'area parkir', 'parking'],
  ['makanan', 'kuliner', 'makan', 'restoran', 'kafe', 'jajanan', 'food'],
  ['toilet', 'wc', 'kamar mandi', 'mushola', 'masjid', 'tempat sholat'],
  ['wahana', 'fasilitas', 'kegiatan', 'aktivitas', 'atraksi'],
  ['satwa', 'hewan', 'binatang', 'fauna', 'animal'],
  ['anak', 'bayi', 'balita', 'keluarga', 'family'],
  ['foto', 'kamera', 'selfie', 'dokumentasi'],
  ['ragunan', 'kebun binatang', 'tmii ragunan', 'taman margasatwa'],
  ['lokasi', 'alamat', 'dimana', 'letak', 'posisi', 'cara ke'],
  ['transportasi', 'bus', 'kendaraan', 'transjakarta', 'ojek', 'naik apa', 'pergi'],
  ['aturan', 'peraturan', 'larangan', 'ketentuan', 'syarat'],
  ['gratis', 'free', 'bayar', 'biaya', 'murah'],
  ['peta', 'denah', 'map', 'layout', 'zona'],
];

function buildSynonymIndex(): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const group of SYNONYM_GROUPS) {
    for (const term of group) {
      index.set(term, group);
    }
  }
  return index;
}

const SYNONYM_INDEX = buildSynonymIndex();

function normalizeText(text: string): string {
  let normalized = text.toLowerCase().trim();

  // Remove punctuation except spaces
  normalized = normalized.replace(/[^\w\s]/g, ' ');

  // Replace multiple spaces with single space
  normalized = normalized.replace(/\s+/g, ' ').trim();

  // Replace slang/abbreviations word by word
  const words = normalized.split(' ');
  const replacedWords = words.map(word => SLANG_MAP[word] ?? word).filter(Boolean);
  normalized = replacedWords.join(' ');

  return normalized;
}

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  for (let i = 0; i <= lenA; i++) matrix[i] = [i];
  for (let j = 0; j <= lenB; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[lenA][lenB];
}

function isFuzzyMatch(word: string, target: string, threshold = 0.75): boolean {
  if (word.length < 3 || target.length < 3) return word === target;
  const dist = levenshtein(word, target);
  const maxLen = Math.max(word.length, target.length);
  return (1 - dist / maxLen) >= threshold;
}

// Expand a query with synonyms
function expandWithSynonyms(input: string): string[] {
  const expanded = new Set<string>([input]);

  for (const [term, group] of SYNONYM_INDEX.entries()) {
    if (input.includes(term)) {
      for (const synonym of group) {
        expanded.add(input.replace(term, synonym));
      }
    }
  }

  return Array.from(expanded);
}

// ======================================================
// HOOK
// ======================================================
export function useChatbotFaqs() {
  const [faqs, setFaqs] = useState<ChatbotFaq[]>([]);
  const [allFaqs, setAllFaqs] = useState<ChatbotFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('chatbot_faqs')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (fetchError) throw fetchError;
      setFaqs(data || []);
    } catch (err) {
      console.error('Error fetching chatbot FAQs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllFaqs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('chatbot_faqs')
        .select('*')
        .order('order_index');

      if (fetchError) throw fetchError;
      setAllFaqs(data || []);
    } catch (err) {
      console.error('Error fetching all chatbot FAQs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Advanced answer finding with:
   * - text normalization (slang, abbreviations)
   * - synonym expansion
   * - weighted per-word keyword scoring (checks EVERY word individually)
   * - fuzzy word matching
   * - optional context category boosting
   * - strict threshold: if no word matches at all → return null (redirect to WA)
   */
  const findAnswer = useCallback(
    (userInput: string, language: 'id' | 'en' = 'id', contextCategory?: string): ChatbotFaq | null => {
      const rawInput = userInput.toLowerCase().trim();
      if (!rawInput) return null;

      const normalizedInput = normalizeText(rawInput);
      const expandedInputs = expandWithSynonyms(normalizedInput);
      // Split input into individual words, min length 2 chars
      const inputWords = normalizedInput.split(/\s+/).filter(w => w.length >= 2);
      const rawWords = rawInput.split(/\s+/).filter(w => w.length >= 2);

      // --- Pre-check: at least one input word must loosely match some keyword across all FAQs ---
      // This ensures completely unrelated questions are immediately redirected to WA
      const hasAnyWordMatch = faqs.some(faq =>
        faq.keywords.some(keyword => {
          const kwWords = keyword.toLowerCase().trim().split(/\s+/);
          return inputWords.some(iw =>
            kwWords.some(kw =>
              kw.includes(iw) || iw.includes(kw) ||
              (kw.length >= 4 && iw.length >= 4 && isFuzzyMatch(iw, kw, 0.70))
            )
          ) || rawWords.some(rw => keyword.toLowerCase().includes(rw));
        })
      );

      if (!hasAnyWordMatch) return null;

      const scoredFaqs = faqs.map(faq => {
        let score = 0;

        // -- 1. Per-word exact keyword match (highest weight: 20 pts per matching keyword)
        faq.keywords.forEach(keyword => {
          const kw = keyword.toLowerCase().trim();
          const kwWords = kw.split(/\s+/);

          // Check full keyword against expanded inputs
          for (const expandedInput of expandedInputs) {
            if (expandedInput.includes(kw)) {
              score += 20;
              break;
            }
          }

          // Check raw input against full keyword
          if (rawInput.includes(kw)) score += 15;

          // Per-word check: each input word vs each keyword word (10 pts each)
          inputWords.forEach(inputWord => {
            kwWords.forEach(kwWord => {
              if (kwWord === inputWord) {
                score += 10;
              } else if (kwWord.includes(inputWord) || inputWord.includes(kwWord)) {
                score += 7;
              }
            });
          });

          // Raw words vs keyword words
          rawWords.forEach(rawWord => {
            if (kw.includes(rawWord) || rawWord.includes(kw)) {
              score += 5;
            }
          });
        });

        // -- 2. Fuzzy keyword match per word (medium weight: 8 pts each)
        faq.keywords.forEach(keyword => {
          const kwWords = keyword.toLowerCase().split(/\s+/);
          inputWords.forEach(inputWord => {
            kwWords.forEach(kwWord => {
              if (kwWord.length >= 4 && inputWord.length >= 4 && isFuzzyMatch(inputWord, kwWord)) {
                score += 8;
              }
            });
          });
        });

        // -- 3. Question text per-word overlap (5 pts per matched word, 3 pts fuzzy)
        const question = language === 'en' && faq.question_en ? faq.question_en : faq.question_id;
        const questionNorm = normalizeText(question);
        const questionWords = questionNorm.split(/\s+/).filter(w => w.length >= 3);

        inputWords.forEach(inputWord => {
          questionWords.forEach(qWord => {
            if (qWord === inputWord) {
              score += 5;
            } else if (qWord.includes(inputWord) || inputWord.includes(qWord)) {
              score += 4;
            } else if (qWord.length >= 4 && inputWord.length >= 4 && isFuzzyMatch(inputWord, qWord)) {
              score += 3;
            }
          });
        });

        // -- 4. Answer text per-word (2 pts per word)
        const answer = language === 'en' && faq.answer_en ? faq.answer_en : faq.answer_id;
        const answerNorm = normalizeText(answer);
        inputWords.forEach(word => {
          if (answerNorm.includes(word)) score += 2;
        });

        // -- 5. Context category boost (5 pts if same category as last topic)
        if (contextCategory && faq.category === contextCategory) {
          score += 5;
        }

        return { faq, score };
      });

      // Raised threshold to 15 to reduce false positives
      const bestMatch = scoredFaqs
        .filter(item => item.score >= 15)
        .sort((a, b) => b.score - a.score)[0];

      return bestMatch ? bestMatch.faq : null;
    },
    [faqs]
  );


  const getSuggestions = useCallback((language: 'id' | 'en' = 'id'): { question: string; id: string }[] => {
    return faqs.slice(0, 5).map(faq => ({
      id: faq.id,
      question: language === 'en' && faq.question_en ? faq.question_en : faq.question_id
    }));
  }, [faqs]);

  const getAnswerById = useCallback((faqId: string, language: 'id' | 'en' = 'id'): string | null => {
    const faq = faqs.find(f => f.id === faqId);
    if (!faq) return null;
    return language === 'en' && faq.answer_en ? faq.answer_en : faq.answer_id;
  }, [faqs]);

  const getFaqById = useCallback((faqId: string): ChatbotFaq | null => {
    return faqs.find(f => f.id === faqId) ?? null;
  }, [faqs]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  return {
    faqs,
    allFaqs,
    loading,
    error,
    fetchFaqs,
    fetchAllFaqs,
    findAnswer,
    getSuggestions,
    getAnswerById,
    getFaqById,
  };
}
