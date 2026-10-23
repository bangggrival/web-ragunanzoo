'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RotateCcw, 
  Sparkles, 
  ChevronRight, 
  X, 
  Flame, 
  Clock, 
  HelpCircle, 
  Scissors, 
  Lightbulb, 
  Award, 
  Download, 
  Printer, 
  Share2, 
  Check, 
  BookOpen, 
  GraduationCap, 
  Smile, 
  Layers 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  GeneratedQuestion, 
  OFFICIAL_QUIZ_CATEGORIES, 
  getQuestionsForCategory, 
  resolveQuizCategoryId,
  QuizCategoryConfig 
} from './quizTemplates';
import { toast } from 'sonner';

export type QuizDifficulty = 'junior' | 'ranger';

export interface AnimalQuizProps {
  categoryId?: string;
  categoryLabel?: string;
  categoryIcon?: string;
  onClose: () => void;
  isEmbedded?: boolean;
}

export default function AnimalQuiz({ 
  categoryId = 'endemik', 
  categoryLabel, 
  categoryIcon, 
  onClose,
  isEmbedded = false
}: AnimalQuizProps) {
  const { language } = useLanguage();
  const isEN = language === 'en';

  // Category Selection State
  const initialCategory = useMemo(() => {
    return resolveQuizCategoryId(categoryId || categoryLabel);
  }, [categoryId, categoryLabel]);

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);



  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isEmbedded && mounted) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isEmbedded, mounted]);

  // Close on Escape key
  useEffect(() => {
    if (isEmbedded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEmbedded, onClose]);

  // Difficulty Mode State: Junior Explorer (Kids) vs Ranger Pelajar (Student)
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('junior');

  // Quiz Gameplay State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [xpPoints, setXpPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [userSelections, setUserSelections] = useState<number[]>([]);
  const [showReview, setShowReview] = useState(false);

  // Lifelines
  const [usedLifeline5050, setUsedLifeline5050] = useState(false);
  const [hiddenOptionIndices, setHiddenOptionIndices] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);

  // Timer for Ranger Pelajar Mode (20 seconds per question)
  const [timeLeft, setTimeLeft] = useState(20);

  // Student Certificate State
  const [studentName, setStudentName] = useState('');
  const [isCertificateReady, setIsCertificateReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get active category configuration
  const currentCategoryConfig = useMemo(() => {
    return (
      OFFICIAL_QUIZ_CATEGORIES.find(c => c.id === activeCategory) ||
      OFFICIAL_QUIZ_CATEGORIES[0]
    );
  }, [activeCategory]);

  // Load questions for selected category and difficulty
  const [questions, setQuestions] = useState<GeneratedQuestion[]>(() => {
    return getQuestionsForCategory(activeCategory, difficulty, 5);
  });

  // Reload questions when category or difficulty changes
  const reloadQuestions = useCallback((catId: string, diff: QuizDifficulty) => {
    const qList = getQuestionsForCategory(catId, diff, 5);
    setQuestions(qList);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setXpPoints(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setIsFinished(false);
    setAnsweredQuestions([]);
    setUserSelections([]);
    setShowReview(false);
    setUsedLifeline5050(false);
    setHiddenOptionIndices([]);
    setShowHint(false);
    setTimeLeft(20);
    setIsCertificateReady(false);
  }, []);

  // Sync category when props change
  useEffect(() => {
    if (categoryId || categoryLabel) {
      const resolved = resolveQuizCategoryId(categoryId || categoryLabel);
      setActiveCategory(resolved);
      reloadQuestions(resolved, difficulty);
    }
  }, [categoryId, categoryLabel, difficulty, reloadQuestions]);

  const currentQ = questions[currentQuestion] || questions[0];

  // Handle timeout in Ranger mode
  const handleTimeOut = useCallback(() => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(-1); // -1 indicates timeout
    setShowExplanation(true);
    setCurrentStreak(0);
    setAnsweredQuestions((prev) => [...prev, false]);
    setUserSelections((prev) => [...prev, -1]);
    toast.error(isEN ? 'Time is up for this question!' : 'Waktu habis untuk pertanyaan ini!');
  }, [selectedAnswer, isEN]);

  // Timer countdown for Ranger Pelajar Mode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isFinished && difficulty === 'ranger' && selectedAnswer === null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Time ran out: count as unanswered / wrong
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, difficulty, selectedAnswer, currentQuestion, handleTimeOut]);

  // Streak Multiplier calculation
  const getStreakMultiplier = (streak: number) => {
    if (streak >= 4) return 2.5;
    if (streak === 3) return 2.0;
    if (streak === 2) return 1.5;
    return 1.0;
  };

  // Handle Answer Selection
  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    setShowExplanation(true);

    const isCorrect = index === currentQ.correctIndex;

    if (isCorrect) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }

      setScore((prev) => prev + 1);

      // Points calculation
      const multiplier = getStreakMultiplier(newStreak);
      const basePoints = 100;
      const speedBonus = difficulty === 'ranger' && timeLeft > 10 ? 50 : 0;
      const earnedXp = Math.round((basePoints + speedBonus) * multiplier);

      setXpPoints((prev) => prev + earnedXp);

      if (newStreak >= 2) {
        toast.success(
          isEN
            ? `🔥 Streak x${multiplier.toFixed(1)} Combo! +${earnedXp} XP`
            : `🔥 Streak Combo x${multiplier.toFixed(1)}! +${earnedXp} XP`
        );
      }
    } else {
      setCurrentStreak(0);
    }

    setAnsweredQuestions((prev) => [...prev, isCorrect]);
    setUserSelections((prev) => [...prev, index]);
  };

  // 50:50 Lifeline
  const handleUse5050 = () => {
    if (usedLifeline5050 || selectedAnswer !== null) return;

    const correctIdx = currentQ.correctIndex;
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== correctIdx);
    // Randomly pick 2 wrong indices to hide
    const shuffledWrong = wrongIndices.sort(() => Math.random() - 0.5);
    const toHide = shuffledWrong.slice(0, 2);

    setHiddenOptionIndices(toHide);
    setUsedLifeline5050(true);
    toast.info(isEN ? '50:50 Lifeline: 2 wrong options removed!' : 'Bantuan 50:50: 2 pilihan salah disingkirkan!');
  };

  // Hint Lifeline
  const handleToggleHint = () => {
    setShowHint((prev) => !prev);
  };

  // Next Question or Finish
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setHiddenOptionIndices([]);
      setShowHint(false);
      setTimeLeft(20);
    } else {
      setIsFinished(true);
      // Confetti celebration if score >= 60%
      if ((score + (selectedAnswer === currentQ.correctIndex ? 1 : 0)) / questions.length >= 0.6) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  };

  // Badge / Rank evaluation
  const badgeInfo = useMemo(() => {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);

    if (percentage === 100) {
      return {
        title: isEN ? 'Honorary Master Zoologist' : 'Master Zoologi Kehormatan Ragunan',
        grade: 'A+ (Sempurna)',
        icon: '🏆',
        color: 'from-amber-400 to-yellow-600',
        textColor: 'text-amber-950',
        desc: isEN
          ? 'Exceptional mastery! You achieved a perfect score in wildlife science.'
          : 'Luar biasa sempurna! Kamu menguasai wawasan satwa Ragunan dengan sempurna.',
      };
    } else if (percentage >= 80) {
      return {
        title: isEN ? 'Wildlife Conservation Ranger' : 'Ranger Konservasi Tangguh',
        grade: 'A (Sangat Baik)',
        icon: '🥇',
        color: 'from-emerald-400 to-teal-600',
        textColor: 'text-emerald-950',
        desc: isEN
          ? 'Outstanding knowledge! You understand species characteristics and ecosystems deeply.'
          : 'Hebat sekali! Pemahamanmu tentang satwa dan ekosistem sangat mendalam.',
      };
    } else if (percentage >= 60) {
      return {
        title: isEN ? 'Jungle Explorer' : 'Penjelajah Rimba Nusantara',
        grade: 'B (Baik)',
        icon: '🥈',
        color: 'from-blue-400 to-indigo-600',
        textColor: 'text-indigo-950',
        desc: isEN
          ? 'Great exploration! Keep visiting Ragunan Zoo to discover more wildlife facts.'
          : 'Pencapaian bagus! Terus jelajahi Ragunan untuk mengenal lebih banyak satwa.',
      };
    } else {
      return {
        title: isEN ? 'Junior Animal Friend' : 'Sahabat Satwa Pemula',
        grade: 'C (Cukup)',
        icon: '🥉',
        color: 'from-slate-300 to-slate-500',
        textColor: 'text-slate-900',
        desc: isEN
          ? 'Good start! Retake the quiz or observe exhibits in person to level up.'
          : 'Awal yang baik! Terus belajar dan amati langsung satwa saat berwisata di Ragunan.',
      };
    }
  }, [score, questions.length, isEN]);

  // Generate Digital Certificate Canvas
  const generateCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nameToPrint = studentName.trim() || (isEN ? 'Ragunan Junior Explorer' : 'Penjelajah Cilik Ragunan');

    // Canvas size: 1200 x 850 (Hi-res printable landscape)
    canvas.width = 1200;
    canvas.height = 850;

    // Background parchment
    ctx.fillStyle = '#faf8f2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer botanical green border
    ctx.strokeStyle = '#065f46';
    ctx.lineWidth = 14;
    ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

    // Inner gold thin border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Header Logo Banner
    ctx.fillStyle = '#065f46';
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('TAMAN MARGASATWA RAGUNAN • JAKARTA', canvas.width / 2, 90);

    ctx.fillStyle = '#78350f';
    ctx.font = '16px sans-serif';
    ctx.fillText('UNIT PENGELOLA TAMAN MARGASATWA RAGUNAN • DINAS PERTAMANAN & HUTAN KOTA DKI JAKARTA', canvas.width / 2, 120);

    // Certificate Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px serif';
    ctx.fillText('SERTIFIKAT PENGHARGAAN PENJELAJAH SATWA', canvas.width / 2, 190);

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 18px serif';
    ctx.fillText('Sertifikat ini dengan bangga diberikan kepada:', canvas.width / 2, 240);

    // Student Name in bold elegant gold
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(nameToPrint, canvas.width / 2, 310);

    // Underline for name
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(350, 330);
    ctx.lineTo(850, 330);
    ctx.stroke();

    // Achievement text
    ctx.fillStyle = '#334155';
    ctx.font = '18px sans-serif';
    ctx.fillText(
      `Atas keberhasilan menyelesaikan Uji Edukasi Satwa Interaktif kategori:`,
      canvas.width / 2,
      385
    );

    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(currentCategoryConfig.nameId.toUpperCase(), canvas.width / 2, 425);

    // Score & Predicate Badge Box
    ctx.fillStyle = '#f1f5f9';
    ctx.roundRect(300, 465, 600, 110, 16);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`${badgeInfo.icon} Predikat: ${badgeInfo.title}`, canvas.width / 2, 510);

    ctx.fillStyle = '#475569';
    ctx.font = '16px sans-serif';
    ctx.fillText(
      `Skor: ${score} / ${questions.length} Benar (${Math.round((score / questions.length) * 100)}%) • Total XP: ${xpPoints} Poin • Tingkat: ${difficulty === 'junior' ? 'Penjelajah Cilik' : 'Ranger Pelajar'}`,
      canvas.width / 2,
      545
    );

    // Date and Signatures
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = '15px sans-serif';
    ctx.fillText(`Diterbitkan di: Ragunan, Jakarta`, 120, 680);
    ctx.fillText(`Tanggal: ${dateStr}`, 120, 705);
    ctx.fillText(`Kode Verifikasi: RAG-EDU-${Math.floor(100000 + Math.random() * 900000)}`, 120, 730);

    ctx.textAlign = 'right';
    ctx.font = 'italic 16px serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Kurator Edukasi & Konservasi Satwa', 1080, 680);
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#065f46';
    ctx.fillText('Taman Margasatwa Ragunan', 1080, 710);

    setIsCertificateReady(true);
  };

  // Download Certificate PNG
  const handleDownloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `Sertifikat-Penjelajah-Ragunan-${studentName.trim() || 'Pelajar'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success(isEN ? 'Certificate downloaded!' : 'Sertifikat berhasil diunduh!');
  };

  // Print Certificate
  const handlePrintCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Cetak Sertifikat Penjelajah Satwa Ragunan</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; }
            img { max-width: 95vw; max-height: 95vh; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            @media print {
              body { background: white; }
              img { max-width: 100%; max-height: 100%; box-shadow: none; }
            }
          </style>
        </head>
        <body onload="window.print()">
          <img src="${dataUrl}" alt="Sertifikat Ragunan Zoo" />
        </body>
      </html>
    `);
    win.document.close();
  };

  const quizCard = (
    <div 
      className="relative bg-card border border-border/80 rounded-3xl max-w-2xl w-full my-auto mx-auto shadow-2xl overflow-hidden transition-all text-card-foreground flex flex-col max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Bar */}
      <div className={`p-4 sm:p-5 text-white rounded-t-3xl relative overflow-hidden flex-shrink-0 ${currentCategoryConfig.badgeColor}`}>
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl sm:text-3xl flex-shrink-0">{currentCategoryConfig.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base truncate">
                    {isEN ? currentCategoryConfig.nameEn : currentCategoryConfig.nameId}
                  </h3>
                  <button
                    onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all flex-shrink-0"
                  >
                    Ganti Kategori
                  </button>
                </div>
                <p className="text-[11px] text-white/80 line-clamp-1">
                  {isEN ? currentCategoryConfig.descriptionEn : currentCategoryConfig.descriptionId}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white flex-shrink-0"
              title="Tutup Kuis"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Difficulty & Streak Status Strip */}
          {!isFinished && (
            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/20 text-xs relative z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = difficulty === 'junior' ? 'ranger' : 'junior';
                    setDifficulty(next);
                    reloadQuestions(activeCategory, next);
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    difficulty === 'junior'
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-indigo-900 text-white'
                  }`}
                  title="Klik untuk mengubah mode peserta"
                >
                  {difficulty === 'junior' ? <Smile className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                  <span>{difficulty === 'junior' ? 'Penjelajah Cilik (SD)' : 'Ranger Pelajar (SMP/SMA)'}</span>
                </button>

                {currentStreak >= 2 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-500 text-white text-[10px] font-extrabold animate-pulse">
                    <Flame className="w-3 h-3" />
                    <span>Streak x{getStreakMultiplier(currentStreak).toFixed(1)}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {difficulty === 'ranger' && selectedAnswer === null && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                    timeLeft <= 5 ? 'bg-red-500 text-white animate-ping' : 'bg-white/20 text-white'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{timeLeft}s</span>
                  </span>
                )}
                <span className="font-bold text-white/90 text-xs">
                  {currentQuestion + 1} / {questions.length}
                </span>
              </div>
            </div>
          )}

          {/* Progress bar */}
          {!isFinished && (
            <div className="w-full bg-black/20 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Category Picker Overlay */}
        {showCategoryPicker && (
          <div className="p-4 bg-muted/60 border-b border-border space-y-2.5 animate-fade-in">
            <p className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Pilih Kategori Kuis Tematik Ragunan:</span>
              <button
                onClick={() => setShowCategoryPicker(false)}
                className="text-[11px] text-muted-foreground hover:underline"
              >
                Tutup
              </button>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {OFFICIAL_QUIZ_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setShowCategoryPicker(false);
                    reloadQuestions(cat.id, difficulty);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                    activeCategory === cat.id
                      ? 'border-primary bg-primary/10 shadow-xs'
                      : 'border-border/80 bg-card hover:border-primary/50'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-foreground">{isEN ? cat.nameEn : cat.nameId}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{cat.descriptionId}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* ══════════ RESULTS SCREEN ══════════ */}
          {isFinished ? (
            <div className="space-y-6 text-center py-2 animate-fade-in">
              {/* Badge & Trophy Header */}
              <div className="space-y-2">
                <div className="text-5xl mx-auto mb-1 animate-bounce">{badgeInfo.icon}</div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  {badgeInfo.title}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {badgeInfo.desc}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
                <div className="p-3 rounded-2xl bg-muted/60 border border-border/80 text-center">
                  <p className="text-[11px] text-muted-foreground font-semibold">Skor Benar</p>
                  <p className="text-xl font-black text-primary mt-0.5">
                    {score} / {questions.length}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-muted/60 border border-border/80 text-center">
                  <p className="text-[11px] text-muted-foreground font-semibold">Total XP</p>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                    +{xpPoints}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-muted/60 border border-border/80 text-center">
                  <p className="text-[11px] text-muted-foreground font-semibold">Max Streak</p>
                  <p className="text-xl font-black text-orange-600 mt-0.5">
                    {maxStreak}x 🔥
                  </p>
                </div>
              </div>

              {/* Summary Answer Dots */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {answeredQuestions.map((isCorrect, idx) => (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                ))}
              </div>

              {/* Digital Certificate Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950/40 border border-amber-300/50 dark:border-emerald-800 space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-foreground">
                      {isEN ? 'Official Wildlife Ranger Certificate' : 'Klaim Sertifikat Penghargaan Penjelajah'}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {isEN
                        ? 'Type your name to generate an official digital certificate for school or portfolio'
                        : 'Ketik nama Anda untuk menerbitkan sertifikat prestasi resmi yang dapat dicetak/diunduh'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda / siswa..."
                    className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={generateCertificate}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap"
                  >
                    Terbitkan Sertifikat
                  </button>
                </div>

                {/* Hidden canvas used for rendering */}
                <canvas ref={canvasRef} className="hidden" />

                {isCertificateReady && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 animate-fade-in">
                    <button
                      onClick={handleDownloadCertificate}
                      className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm active:scale-95 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Sertifikat (PNG)</span>
                    </button>
                    <button
                      onClick={handlePrintCertificate}
                      className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border font-bold text-xs active:scale-95 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak Sertifikat</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Review Answers Toggle */}
              <div>
                <button
                  onClick={() => setShowReview(!showReview)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{showReview ? 'Sembunyikan Pembahasan Soal' : 'Lihat Pembahasan Seluruh Soal'}</span>
                </button>

                {showReview && (
                  <div className="mt-3 space-y-3 text-left animate-fade-in">
                    {questions.map((q, idx) => {
                      const userPick = userSelections[idx];
                      const isCorrect = userPick === q.correctIndex;
                      return (
                        <div key={q.id} className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-1.5">
                          <p className="font-bold text-foreground">
                            {idx + 1}. {isEN ? q.question_en : q.question_id}
                          </p>
                          <p className={isCorrect ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                            Jawaban Anda: {userPick >= 0 ? (isEN ? q.options_en[userPick] : q.options_id[userPick]) : 'Waktu Habis'} {isCorrect ? '✓' : '✗'}
                          </p>
                          {!isCorrect && (
                            <p className="text-muted-foreground font-semibold">
                              Jawaban Benar: <strong className="text-foreground">{isEN ? q.options_en[q.correctIndex] : q.options_id[q.correctIndex]}</strong>
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground italic pt-1 border-t border-border/60">
                            💡 {isEN ? q.explanation_en : q.explanation_id}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-border/60">
                <button
                  onClick={() => reloadQuestions(activeCategory, difficulty)}
                  className="w-full flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Main Lagi (Kategori Ini)</span>
                </button>
                <button
                  onClick={() => setShowCategoryPicker(true)}
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground border border-border font-bold text-xs transition-all"
                >
                  Pilih Kategori Lain
                </button>
              </div>
            </div>
          ) : (
            /* ══════════ QUESTION SCREEN ══════════ */
            <div className="space-y-4 animate-fade-in">
              {/* Question Header & Lifelines */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Pertanyaan {currentQuestion + 1} dari {questions.length}
                </span>

                {/* Lifeline Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleUse5050}
                    disabled={usedLifeline5050 || selectedAnswer !== null}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted border border-border/80 text-[11px] font-bold text-foreground hover:bg-primary/10 hover:border-primary/40 disabled:opacity-40 transition-all"
                    title="Hilangkan 2 pilihan salah (1x per kuis)"
                  >
                    <Scissors className="w-3 h-3 text-amber-500" />
                    <span>50:50</span>
                  </button>

                  {currentQ.hint_id && (
                    <button
                      onClick={handleToggleHint}
                      disabled={selectedAnswer !== null}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted border border-border/80 text-[11px] font-bold text-foreground hover:bg-amber-500/10 hover:border-amber-500/40 disabled:opacity-40 transition-all"
                      title="Lihat petunjuk fakta unik"
                    >
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      <span>Petunjuk</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Hint Box (if opened) */}
              {showHint && currentQ.hint_id && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2 animate-fade-in">
                  <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Petunjuk Edukasi:</p>
                    <p className="text-[11px] mt-0.5">{isEN ? currentQ.hint_en : currentQ.hint_id}</p>
                  </div>
                </div>
              )}

              {/* Question Text */}
              <div className="py-1">
                <h4 className="text-base sm:text-lg font-extrabold text-foreground leading-snug">
                  {isEN ? currentQ.question_en : currentQ.question_id}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {(isEN ? currentQ.options_en : currentQ.options_id).map((option, index) => {
                  const isHidden = hiddenOptionIndices.includes(index);
                  if (isHidden) return null;

                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQ.correctIndex;
                  const showResult = selectedAnswer !== null;

                  let buttonClass = 'bg-card border-border/80 hover:border-primary/60 hover:bg-muted/30';
                  if (showResult) {
                    if (isCorrect) {
                      buttonClass = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-sm';
                    } else if (isSelected && !isCorrect) {
                      buttonClass = 'bg-red-50 dark:bg-red-950/50 border-red-500 text-red-800 dark:text-red-200';
                    } else {
                      buttonClass = 'bg-muted/30 border-border/40 opacity-40';
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-between gap-3 ${buttonClass} ${
                        !showResult ? 'hover:scale-[1.01] active:scale-[0.99]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center text-xs font-black text-foreground flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-foreground leading-normal">{option}</span>
                      </div>

                      {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {showExplanation && (
                <div className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-scale-in ${
                  selectedAnswer === currentQ.correctIndex
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}>
                  <div className="flex items-center gap-1.5 font-extrabold text-sm">
                    {selectedAnswer === currentQ.correctIndex ? (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Jawaban Anda Tepat!</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                        <span>Pembahasan Fakta:</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed text-[11px] sm:text-xs">
                    {isEN ? currentQ.explanation_en : currentQ.explanation_id}
                  </p>
                </div>
              )}

              {/* Next Question CTA Button */}
              {showExplanation && (
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all"
                >
                  <span>{currentQuestion < questions.length - 1 ? 'Pertanyaan Berikutnya' : 'Lihat Hasil Akhir'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
  );

  if (isEmbedded) {
    return (
      <div className="w-full max-w-2xl mx-auto my-4 animate-fade-in">
        {quizCard}
      </div>
    );
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
    >
      {quizCard}
    </div>,
    document.body
  );
}
