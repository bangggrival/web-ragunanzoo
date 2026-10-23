import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RotateCcw, 
  Sparkles, 
  ChevronRight, 
  Loader2, 
  X, 
  Leaf,
  Share2,
  Award,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';
import { Plant } from '@/hooks/usePlants';
import { generateQuestionsFromPlants, GeneratedPlantQuestion } from './plantQuizTemplates';
import { toast } from 'sonner';

interface DynamicPlantQuizProps {
  categoryId?: string;
  categoryLabel?: string;
  categoryIcon?: string;
  onClose: () => void;
}

// Curated facts vs myths for botanical trivia
const CURATED_PLANT_TRIVIA = [
  {
    statement_id: 'Bunga Rafflesia arnoldii adalah bunga tunggal terbesar di dunia dan tidak memiliki daun, batang, atau akar sejati.',
    statement_en: 'Rafflesia arnoldii is the largest individual flower on Earth and has no true leaves, stems, or roots.',
    isFact: true,
    explanation_id: 'Benar! Rafflesia arnoldii adalah tumbuhan parasit langka asal Indonesia yang hanya hidup di dalam jaringan inang liana Tetrastigma.',
    explanation_en: 'Fact! Rafflesia arnoldii is an extraordinary parasitic plant endemic to Sumatra/Borneo that lives inside host vines without leaves or roots.'
  },
  {
    statement_id: 'Tanaman anggrek adalah parasit yang menyerap dan mencuri sari nutrisi dari pohon inangnya.',
    statement_en: 'Orchids are parasites that steal sap and nutrients from their host trees.',
    isFact: false,
    explanation_id: 'Mitos! Anggrek adalah tumbuhan epifit (menumpang tempat), bukan parasit. Anggrek menyerap air dan hara dari udara dan embun hujan tanpa merusak pohon inang.',
    explanation_en: 'Myth! Orchids are epiphytes, not parasites. They cling to tree bark for support but gather moisture and nutrients from air and rainfall.'
  },
  {
    statement_id: 'Bambu adalah kelompok tumbuhan berkayu yang tumbuh paling cepat di dunia, mencapai hingga 90 cm per hari.',
    statement_en: 'Bamboo is the fastest-growing woody plant in the world, capable of growing up to 90 cm in a single day.',
    isFact: true,
    explanation_id: 'Benar! Spesies bambu tertentu dapat bertambah tinggi hingga hampir 1 meter dalam waktu 24 jam dalam kondisi kelembaban optimal.',
    explanation_en: 'Fact! Under optimal climate conditions, certain bamboo species can grow nearly 1 meter in height within a 24-hour window.'
  },
  {
    statement_id: 'Kaktus dan sukulen sama sekali tidak membutuhkan air sepanjang hidupnya.',
    statement_en: 'Cacti and succulents do not require any water at all throughout their lifetimes.',
    isFact: false,
    explanation_id: 'Mitos! Kaktus tetap membutuhkan air. Mereka menyimpan cadangan air dalam jaringan batang spons yang tebal saat musim hujan untuk bertahan saat kemarau.',
    explanation_en: 'Myth! Cacti still need water. They store moisture in their thick spongy stems during rainfall to survive dry spells.'
  },
  {
    statement_id: 'Kantong semar (Nepenthes) menjebak serangga karena tanah habitatnya sangat miskin nutrisi nitrogen.',
    statement_en: 'Pitcher plants (Nepenthes) trap insects because their native soils are severely nutrient-deficient in nitrogen.',
    isFact: true,
    explanation_id: 'Benar! Tumbuhan karnivora seperti Nepenthes beradaptasi di tanah gambut atau pasir yang minim hara dengan mencerna serangga.',
    explanation_en: 'Fact! Carnivorous plants like Nepenthes adapted to nutrient-poor peat or sandy soils by digesting insects for essential nitrogen.'
  },
  {
    statement_id: 'Pohon beringin (Ficus) dapat menurunkan akar gantung yang berubah menjadi batang penopang baru.',
    statement_en: 'Banyan trees (Ficus) can drop aerial roots from branches that thicken into pillar-like secondary trunks.',
    isFact: true,
    explanation_id: 'Benar! Akar gantung pohon beringin yang mencapai tanah akan membesar dan membentuk pilar penyangga mahkota daun yang sangat rindang.',
    explanation_en: 'Fact! The aerial roots of banyan trees that penetrate the soil expand into solid woody trunks, allowing a single tree to canopy huge areas.'
  },
  {
    statement_id: 'Tumbuhan hanya menghasilkan oksigen dan tidak pernah menghirup atau mengonsumsi oksigen.',
    statement_en: 'Plants only produce oxygen and never inhale or consume oxygen.',
    isFact: false,
    explanation_id: 'Mitos! Tumbuhan tetap melakukan respirasi seluler 24 jam sehari menggunakan oksigen untuk membakar gula, terutama di malam hari ketika fotosintesis berhenti.',
    explanation_en: 'Myth! Plants undergo cellular respiration 24/7, consuming oxygen to metabolize sugars, especially at night when photosynthesis pauses.'
  },
];

export default function DynamicPlantQuiz({ 
  categoryId, 
  categoryLabel = 'Flora', 
  categoryIcon = '🌿', 
  onClose 
}: DynamicPlantQuizProps) {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<GeneratedPlantQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [userSelections, setUserSelections] = useState<number[]>([]);
  const [showReview, setShowReview] = useState(false);

  const [allPlantsData, setAllPlantsData] = useState<Plant[]>([]);

  // Build a fresh random set of questions from plants & trivia pool
  const createFreshQuestions = useCallback((plants: Plant[], dbTrivia: any[]) => {
    // Dynamic fact vs myth questions
    const triviaQuestions: GeneratedPlantQuestion[] = CURATED_PLANT_TRIVIA.map((item, idx) => ({
      id: `trivia-plant-${idx}-${Math.random().toString(36).substring(7)}`,
      question_id: `Fakta atau Mitos: "${item.statement_id}"`,
      question_en: `Fact or Myth: "${item.statement_en}"`,
      options_id: ['Fakta', 'Mitos'],
      options_en: ['Fact', 'Myth'],
      correctIndex: item.isFact ? 0 : 1,
      explanation_id: item.explanation_id,
      explanation_en: item.explanation_en,
    }));

    // Generate candidate questions from plants DB
    const generated = plants.length > 0
      ? generateQuestionsFromPlants(plants, categoryId, 20)
      : [];

    // Combine and shuffle thoroughly
    const pool = [...generated, ...triviaQuestions].sort(() => Math.random() - 0.5);

    // Pick 5-7 questions for this quiz session
    const selectedCount = Math.min(Math.max(5, pool.length), 7);
    return pool.slice(0, selectedCount);
  }, [categoryId]);

  // Fetch plants and generate initial questions
  useEffect(() => {
    const fetchAndGenerate = async () => {
      setLoading(true);
      
      try {
        const { data: plants, error } = await supabase
          .from('plants')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        const { data: dbTrivia } = await supabase
          .from('trivia_questions')
          .select('*')
          .eq('type', 'plant');
          
        const fetchedPlants = (plants as Plant[]) || [];
        const fetchedTrivia = dbTrivia || [];

        setAllPlantsData(fetchedPlants);

        const initialQuestions = createFreshQuestions(fetchedPlants, fetchedTrivia);
        setQuestions(initialQuestions);
      } catch (err) {
        console.error('Error generating plant quiz:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndGenerate();
  }, [categoryId, createFreshQuestions]);

  const currentQ = questions[currentQuestion];

  // Handle answer selection
  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setAnsweredQuestions(prev => [...prev, isCorrect]);
    setUserSelections(prev => [...prev, index]);
  };

  // Handle next question or finish
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
      // Trigger confetti celebration on completion if score > 50%
      const finalScoreRatio = (score + (selectedAnswer === currentQ.correctIndex ? 0 : 0)) / questions.length;
      if (finalScoreRatio >= 0.5) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  // Restart quiz with a fresh randomized question set
  const handleRestart = () => {
    setLoading(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setIsFinished(false);
    setAnsweredQuestions([]);
    setUserSelections([]);
    setShowReview(false);
    
    setTimeout(() => {
      const fresh = createFreshQuestions(allPlantsData, []);
      setQuestions(fresh);
      setLoading(false);
    }, 200);
  };

  // Rank badge details for flora
  const getBadgeInfo = () => {
    const percentage = Math.round((score / questions.length) * 100);
    if (percentage === 100) {
      return {
        title: language === 'en' ? 'Master Botanist of Ragunan' : 'Pakar Botanis Agung Ragunan',
        desc: language === 'en' ? 'Flawless botanical mastery! You know plant ecosystems and rare species thoroughly.' : 'Sempurna! Pengetahuanmu tentang pohon langka dan keanekaragaman flora Ragunan luar biasa.',
        color: 'from-emerald-400 to-teal-500',
        textColor: 'text-emerald-950',
        icon: '🌿',
      };
    } else if (percentage >= 70) {
      return {
        title: language === 'en' ? 'Junior Plant Taxonomist' : 'Ahli Taksonomi Flora Muda',
        desc: language === 'en' ? 'Remarkable knowledge! You understand botanical habitats and plant characteristics well.' : 'Hebat! Kamu memahami karakteristik, manfaat, dan ekologi tumbuhan dengan sangat baik.',
        color: 'from-amber-400 to-yellow-500',
        textColor: 'text-amber-950',
        icon: '🥇',
      };
    } else if (percentage >= 40) {
      return {
        title: language === 'en' ? 'Rainforest Explorer' : 'Penjelajah Hutan Ragunan',
        desc: language === 'en' ? 'Good effort! Discover more lush plant corners across Ragunan park.' : 'Bagus! Ayo jelajahi taman botani dan rimbunnya pepohonan Ragunan pada kunjunganmu berikutnya.',
        color: 'from-blue-400 to-cyan-500',
        textColor: 'text-blue-950',
        icon: '🥈',
      };
    } else {
      return {
        title: language === 'en' ? 'Budding Plant Lover' : 'Sahabat Flora Pemula',
        desc: language === 'en' ? 'A wonderful start! Explore the orchid gardens and ancient trees in Ragunan.' : 'Awal yang menyenangkan! Kunjungi taman anggrek dan pepohonan peneduh Ragunan untuk belajar lebih banyak.',
        color: 'from-stone-300 to-stone-400',
        textColor: 'text-stone-900',
        icon: '🌱',
      };
    }
  };

  // Share score via Web Share API or Clipboard
  const handleShareScore = async () => {
    const badge = getBadgeInfo();
    const shareText = language === 'en'
      ? `🌿 I scored ${score}/${questions.length} on the Ragunan Zoo Flora Quiz and earned the title "${badge.title}"! Discover tropical plants at Taman Margasatwa Ragunan!`
      : `🌿 Saya berhasil meraih skor ${score}/${questions.length} di Kuis Flora Ragunan Zoo dengan gelar "${badge.title}"! Uji wawasan tanaman tropismu di Taman Margasatwa Ragunan!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ragunan Zoo Flora Quiz',
          text: shareText,
          url: window.location.href,
        });
      } catch (e) {
        // Fallback
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success(language === 'en' ? 'Result copied to clipboard!' : 'Hasil kuis disalin ke papan klip!');
    }
  };

  // Loading state
  if (loading) {
    return createPortal(
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
        <div className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-border">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h4 className="font-extrabold text-base text-foreground mb-1">
            {language === 'en' ? 'Preparing Flora Quiz...' : 'Menyiapkan Soal Kuis Flora...'}
          </h4>
          <p className="text-muted-foreground text-xs">
            {language === 'en' ? 'Selecting dynamic facts & rare plant trivia' : 'Mengacak fakta keanekaragaman flora Ragunan'}
          </p>
        </div>
      </div>,
      document.body
    );
  }

  // No questions available fallback
  if (questions.length === 0) {
    return createPortal(
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
        <div className="bg-card rounded-3xl p-6 max-w-md w-full text-center shadow-2xl border border-border">
          <p className="text-muted-foreground mb-4 text-sm">
            {language === 'en' ? 'No quiz questions available yet.' : 'Kuis untuk kategori flora ini belum tersedia.'}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-2xl font-bold text-xs"
          >
            {t('close')}
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const badge = getBadgeInfo();

  return createPortal(
    <div className="fixed inset-0 bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="bg-card rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-border/80 overflow-hidden">
        {/* Header - Fixed Top */}
        <div className="bg-emerald-600 dark:bg-emerald-700 text-white p-4 sm:p-5 shrink-0 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg tracking-tight block">
                  {language === 'en' ? `${categoryLabel} Botanical Quiz` : `Kuis Interaktif ${categoryLabel}`}
                </span>
                <span className="text-[11px] text-white/80 font-medium">
                  Taman Margasatwa Ragunan
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              aria-label="Close quiz"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Progress bar */}
          {!isFinished && (
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex-1 h-2.5 bg-white/25 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-white/95">
                {currentQuestion + 1}/{questions.length}
              </span>
            </div>
          )}
        </div>

        {/* Content - Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {!isFinished ? (
            <>
              {/* Question Header Card */}
              <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] mb-3">
                  <Sparkles className="w-3 h-3" />
                  <span>{language === 'en' ? `Question ${currentQuestion + 1}` : `Pertanyaan ${currentQuestion + 1}`}</span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-foreground leading-snug">
                  {language === 'en' ? currentQ.question_en : currentQ.question_id}
                </h3>
              </div>
                
              {/* Options */}
              <div className="space-y-2.5 mb-5">
                {(language === 'en' ? currentQ.options_en : currentQ.options_id).map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQ.correctIndex;
                  const showResult = selectedAnswer !== null;
                  
                  let optionClass = 'border border-border/80 bg-background hover:border-emerald-500/60 hover:bg-emerald-500/5 hover:scale-[1.01]';
                  
                  if (showResult) {
                    if (isCorrect) {
                      optionClass = 'border-2 border-emerald-500 bg-emerald-500/10 font-bold shadow-xs';
                    } else if (isSelected && !isCorrect) {
                      optionClass = 'border-2 border-destructive bg-destructive/10 font-bold';
                    } else {
                      optionClass = 'border border-border bg-muted/40 opacity-50';
                    }
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-3.5 rounded-2xl text-left transition-all text-xs sm:text-sm font-semibold shadow-2xs ${optionClass} ${
                        selectedAnswer === null ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 transition-colors ${
                          showResult && isCorrect 
                            ? 'bg-emerald-600 text-white' 
                            : showResult && isSelected && !isCorrect
                              ? 'bg-destructive text-white'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1 leading-snug">{option}</span>
                        {showResult && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 animate-bounce" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card */}
              {showExplanation && (
                <div className="mb-5 p-4 rounded-2xl bg-muted/70 border border-border/80 animate-fade-in space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3" />
                    </span>
                    <p className="font-extrabold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      {language === 'en' ? 'Botanical Fact & Knowledge' : 'Wawasan & Fakta Flora'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    {language === 'en' ? currentQ.explanation_en : currentQ.explanation_id}
                  </p>
                </div>
              )}

              {/* Next / Finish Button */}
              {showExplanation && (
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.01] active:scale-[0.99]"
                >
                  {currentQuestion < questions.length - 1 ? (
                    <>
                      <span>{language === 'en' ? 'Next Question' : 'Pertanyaan Berikutnya'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>{language === 'en' ? 'View Botanical Results' : 'Lihat Hasil Akhir Kuis'}</span>
                      <Trophy className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            /* Results Screen */
            <div className="text-center py-2 space-y-4">
              {/* Badge Trophy Header */}
              <div className="relative inline-block mx-auto mb-1">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${badge.color} flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/20 mx-auto`}>
                  {badge.icon}
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Award className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
                  {badge.title}
                </span>
                <h3 className="text-2xl font-black text-foreground">
                  {score}/{questions.length}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 leading-relaxed">
                  {badge.desc}
                </p>
              </div>

              {/* Answer Dot Summary */}
              <div className="flex items-center justify-center gap-1.5 py-1">
                {answeredQuestions.map((correct, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      correct 
                        ? 'bg-emerald-500 text-white shadow-xs' 
                        : 'bg-destructive text-white shadow-xs'
                    }`}
                    title={`Soal ${i + 1}: ${correct ? 'Benar' : 'Salah'}`}
                  >
                    {correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                ))}
              </div>

              {/* Review Expandable Accordion */}
              <div className="text-left border border-border/70 rounded-2xl overflow-hidden bg-muted/20">
                <button
                  type="button"
                  onClick={() => setShowReview(!showReview)}
                  className="w-full p-3.5 flex items-center justify-between font-bold text-xs text-foreground hover:bg-muted/40 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'en' ? 'Review Botanical Explanations' : 'Rangkuman & Pembahasan Soal Flora'}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showReview ? 'rotate-180' : ''}`} />
                </button>

                {showReview && (
                  <div className="p-3.5 pt-0 space-y-3 divide-y divide-border/60">
                    {questions.map((q, idx) => {
                      const userChoice = userSelections[idx];
                      const isCorrect = userChoice === q.correctIndex;
                      return (
                        <div key={idx} className="pt-3 first:pt-1 text-xs space-y-1">
                          <p className="font-bold text-foreground">
                            {idx + 1}. {language === 'en' ? q.question_en : q.question_id}
                          </p>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-destructive font-bold'}>
                              {isCorrect ? '✓ Jawaban Anda Benar' : '✗ Jawaban Anda Salah'}
                            </span>
                            <span className="text-muted-foreground">
                              • Kunci: {(language === 'en' ? q.options_en : q.options_id)[q.correctIndex]}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground bg-muted/50 p-2 rounded-xl">
                            {language === 'en' ? q.explanation_en : q.explanation_id}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleShareScore}
                    className="flex-1 py-3 px-3 rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Share Score' : 'Bagikan Skor'}</span>
                  </button>

                  <button
                    onClick={handleRestart}
                    className="flex-1 py-3 px-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs flex items-center justify-center gap-1.5 border border-border transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'en' ? 'Play Again' : 'Main Soal Baru'}</span>
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                >
                  {language === 'en' ? 'Back to Flora Catalog' : 'Selesai & Kembali ke Koleksi Flora'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
