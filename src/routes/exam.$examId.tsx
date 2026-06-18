import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, Award, 
  HelpCircle, ChevronLeft, ChevronRight, Check, AlertTriangle,
  Play, RotateCcw, Loader2, Sparkles, Trophy
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { 
  fetchExamById, fetchQuestionsByExamId, createAttempt, 
  submitAttempt, checkAndAwardBadges, fetchBestScore, 
  fetchAttemptsByUser, fetchUserAttemptCountForExam,
  fetchLeaderboardByExam
} from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/exam/$examId")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/masuk" });
    }
  },
  component: StudentExamPage,
});

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ═══════════════════════════════════════════════════════════
// EXAM LEADERBOARD COMPONENT
// ═══════════════════════════════════════════════════════════
function ExamLeaderboard({ leaderboard, currentUserId, loading, examPassingScore }: {
  leaderboard: any[];
  currentUserId?: string;
  loading: boolean;
  examPassingScore?: number;
}) {
  const medals = ['🥇', '🥈', '🥉'];
  const fmtTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const podiumOrder = [
    { rankIdx: 1, h: 'h-16 mt-4', medal: '🥈', bg: 'from-slate-100 to-slate-200' },
    { rankIdx: 0, h: 'h-20',      medal: '🥇', bg: 'from-amber-100 to-yellow-200' },
    { rankIdx: 2, h: 'h-12 mt-8', medal: '🥉', bg: 'from-orange-100 to-amber-200' },
  ];

  return (
    <div className="rounded-3xl border border-border/50 bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center justify-between bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" /> Papan Peringkat
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {leaderboard.length} peserta telah mengerjakan ujian ini
          </p>
        </div>
        <div className="text-3xl">🏆</div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="py-14 text-center space-y-2">
          <Trophy className="h-10 w-10 text-slate-200 mx-auto" />
          <p className="text-sm font-bold text-slate-600">Jadilah yang pertama!</p>
          <p className="text-xs text-muted-foreground">Belum ada yang mengerjakan ujian ini.</p>
        </div>
      ) : (
        <>
          {/* Podium Top 3 */}
          {leaderboard.length >= 1 && (
            <div className="grid grid-cols-3 gap-2 px-6 pt-6 pb-4 border-b bg-gradient-to-b from-amber-50/40 to-white">
              {podiumOrder.map(({ rankIdx, h, medal, bg }) => {
                const entry = leaderboard[rankIdx];
                if (!entry) return <div key={rankIdx} />;
                const isMe = entry.user_id === currentUserId;
                return (
                  <div key={rankIdx} className="flex flex-col items-center gap-1">
                    <div className={`flex flex-col items-center justify-center w-full ${h} rounded-2xl bg-gradient-to-b ${bg} ${isMe ? 'ring-2 ring-primary' : ''} px-2 py-2 text-center`}>
                      <span className="text-2xl">{medal}</span>
                      <p className="text-[10px] font-extrabold text-slate-700 leading-tight mt-0.5 line-clamp-1">
                        {(entry.user_profiles?.full_name || 'User').split(' ')[0]}
                        {isMe ? ' 👈' : ''}
                      </p>
                      <p className={`text-xs font-black mt-0.5 ${
                        (examPassingScore != null ? entry.score >= examPassingScore : entry.score >= 70)
                          ? 'text-green-600' : 'text-red-500'
                      }`}>{entry.score}%</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground font-medium">⏱ {fmtTime(entry.time_spent_seconds || 0)}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase text-muted-foreground w-10">#</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase text-muted-foreground">Peserta</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase text-muted-foreground text-center">Skor</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase text-muted-foreground text-center hidden sm:table-cell">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {leaderboard.slice(0, 20).map((entry, idx) => {
                  const rank = idx + 1;
                  const isMe = entry.user_id === currentUserId;
                  const passed = examPassingScore != null ? entry.score >= examPassingScore : entry.score >= 70;
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isMe ? 'bg-primary/5 border-l-4 border-l-primary font-semibold' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-black">
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                            {(entry.user_profiles?.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1 flex-wrap">
                              {entry.user_profiles?.full_name || 'Anonim'}
                              {isMe && (
                                <span className="text-[9px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Kamu</span>
                              )}
                            </p>
                            {entry.user_profiles?.active_title && (
                              <p className="text-[9px] text-primary/80 font-semibold mt-0.5">🏆 {entry.user_profiles.active_title}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-extrabold ${passed ? 'text-green-600' : 'text-red-500'}`}>
                          {entry.score}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground font-medium hidden sm:table-cell">
                        ⏱ {fmtTime(entry.time_spent_seconds || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {leaderboard.length > 20 && (
              <p className="text-center text-xs text-muted-foreground py-3 border-t bg-slate-50/50">
                + {leaderboard.length - 20} peserta lainnya tidak ditampilkan
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StudentExamPage() {
  const { examId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User History
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  
  // Phase handling: 'info' | 'taking' | 'result'
  const [phase, setPhase] = useState<'info' | 'taking' | 'result'>('info');

  // Taking state
  const [currentAttempt, setCurrentAttempt] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | null>>({}); // question_id -> option_key
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [timeSpent, setTimeSpent] = useState(0); // seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Result state
  const [finalScore, setFinalScore] = useState<number>(0);
  const [finalAttempt, setFinalAttempt] = useState<any>(null);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [submittingExam, setSubmittingExam] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Load Exam Meta Data
  useEffect(() => {
    const loadExamData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const examData = await fetchExamById(examId);
        setExam(examData);
        
        if (examData) {
          const score = await fetchBestScore(examId, user.id);
          setBestScore(score);
          
          const count = await fetchUserAttemptCountForExam(examId, user.id);
          setAttemptCount(count);

          const qData = await fetchQuestionsByExamId(examId);
          setQuestions(qData);

          // Load leaderboard
          setLoadingLeaderboard(true);
          try {
            const lb = await fetchLeaderboardByExam(examId);
            setLeaderboard(lb);
          } finally {
            setLoadingLeaderboard(false);
          }
        }
      } catch (err) {
        console.error("Error loading student exam:", err);
      } finally {
        setLoading(false);
      }
    };
    loadExamData();
  }, [examId, user]);

  // Timer handling
  useEffect(() => {
    if (phase === 'taking' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, timeLeft]);

  // Pre-shuffle questions & options when starting the exam
  const handleStartExam = async () => {
    if (!user || !exam || questions.length === 0) return;
    setLoading(true);
    try {
      const attempt = await createAttempt(exam.id, user.id);
      setCurrentAttempt(attempt);

      // Randomize if enabled
      let preparedQs = [...questions];
      if (exam.shuffle_questions) {
        preparedQs = shuffleArray(preparedQs);
      }

      // Randomize options for each question if enabled
      const processedQs = preparedQs.map((q) => {
        let options = [
          { key: 'a', text: q.option_a },
          { key: 'b', text: q.option_b },
          { key: 'c', text: q.option_c },
          { key: 'd', text: q.option_d },
        ];
        if (exam.shuffle_options) {
          options = shuffleArray(options);
        }
        return { ...q, displayOptions: options };
      });

      setShuffledQuestions(processedQs);
      setCurrentQuestionIdx(0);
      
      // Reset answers
      const initialAnswers: Record<string, string | null> = {};
      questions.forEach((q) => {
        initialAnswers[q.id] = null;
      });
      setUserAnswers(initialAnswers);
      
      // Timer setup
      setTimeLeft(exam.duration_minutes * 60);
      setTimeSpent(0);
      setPhase('taking');
    } catch (err: any) {
      alert("Gagal memulai ujian: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, optionKey: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleAutoSubmit = () => {
    alert("Waktu ujian telah habis! Jawaban Anda akan otomatis dikirim.");
    handleSubmitExam(true);
  };

  const handleSubmitExam = async (force: boolean = false) => {
    if (!force && !confirm("Apakah Anda yakin ingin menyelesaikan dan mengirim jawaban Anda?")) return;
    if (!user || !currentAttempt || !exam) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmittingExam(true);

    try {
      // Map Answers Object to array format expected by submitAttempt
      const formattedAnswers = Object.entries(userAnswers).map(([qId, ans]) => ({
        question_id: qId,
        selected_answer: ans,
      }));

      // Submit and grade attempt
      const attemptResult = await submitAttempt(
        currentAttempt.id,
        formattedAnswers,
        questions,
        timeSpent
      );

      setFinalAttempt(attemptResult);
      setFinalScore(attemptResult.score);

      // Check Badges
      const badgesResult = await checkAndAwardBadges(
        user.id,
        exam.id,
        attemptResult.score,
        timeSpent,
        exam.duration_minutes
      );
      setEarnedBadges(badgesResult || []);

      // Refresh metadata for history later
      const newBest = await fetchBestScore(exam.id, user.id);
      setBestScore(newBest);
      const newCount = await fetchUserAttemptCountForExam(exam.id, user.id);
      setAttemptCount(newCount);

      // Refresh leaderboard to reflect new submission
      const freshLb = await fetchLeaderboardByExam(exam.id);
      setLeaderboard(freshLb);

      setPhase('result');
    } catch (err: any) {
      alert("Gagal mengirim jawaban: " + err.message);
    } finally {
      setSubmittingExam(false);
    }
  };

  const handleResetToInfo = () => {
    setPhase('info');
    setCurrentAttempt(null);
    setEarnedBadges([]);
  };

  if (loading && phase === 'info') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm font-semibold text-muted-foreground">Mempersiapkan Ujian...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <SiteHeader />
        <div className="mx-auto flex flex-1 items-center justify-center p-8">
          <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-sm border">
            <h2 className="text-xl font-extrabold text-red-600">Ujian Tidak Ditemukan</h2>
            <p className="text-muted-foreground text-sm mt-2">Mungkin link tidak valid atau ujian telah draf/dihapus oleh admin.</p>
            <button onClick={() => navigate({ to: "/" })} className="mt-6 inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-white">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
            </button>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // 1. INFO SCREEN (PRE-EXAM)
  // ════════════════════════════════════════════════════════════
  if (phase === 'info') {
    const isPassed = bestScore !== null && bestScore >= exam.passing_score;
    
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <SiteHeader />
        
        <main className="flex-1 py-10 px-4 max-w-4xl mx-auto w-full">
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
            {/* Exam card detail */}
            <div className="rounded-3xl border border-border/50 bg-white p-8 shadow-card flex flex-col justify-between">
              <div>
                <Link to={exam.course_id ? `/course/${exam.course_id}` : "/"} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mb-2">
                  <ArrowLeft className="h-3 w-3" /> Kembali ke Kelas
                </Link>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight sm:text-3xl">{exam.title}</h1>
                <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap leading-relaxed">{exam.description || "Ujian evaluasi kelulusan untuk membuktikan pemahaman materi yang telah dipelajari."}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Durasi</span>
                    <p className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" /> {exam.duration_minutes} Menit
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Jumlah Soal</span>
                    <p className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4 text-primary" /> {questions.length} Pilihan Ganda
                    </p>
                  </div>
                  <div className="space-y-1 mt-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Min. Kelulusan</span>
                    <p className="text-sm font-extrabold text-green-600">
                      {exam.passing_score}% Skor
                    </p>
                  </div>
                  <div className="space-y-1 mt-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Kesempatan</span>
                    <p className="text-sm font-extrabold text-slate-800">
                      Unlimited (Retry Gratis)
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                {questions.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs">
                    Ujian ini belum memiliki soal terdaftar. Silakan hubungi admin/mentor.
                  </div>
                ) : isPassed ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs text-center font-bold">
                      🎉 Anda telah lulus ujian ini dengan skor {bestScore}%. Anda tidak perlu mengerjakannya kembali.
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleStartExam}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[image:var(--gradient-primary)] px-6 py-4 text-sm font-bold text-white shadow-lg hover:shadow-glow hover:scale-[1.01] transition-all"
                  >
                    <Play className="h-4 w-4 fill-white" /> Mulai Kerjakan Ujian Sekarang
                  </button>
                )}
                {!isPassed && questions.length > 0 && (
                  <p className="text-center text-[10px] text-muted-foreground mt-2">
                    Timer akan langsung berjalan saat Anda mengklik Mulai. Jangan tutup halaman!
                  </p>
                )}
              </div>
            </div>

            {/* Score & Badge Showcase info widget */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-border/50 bg-white p-6 shadow-card text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-4">Pencapaian Anda</span>
                
                {bestScore !== null ? (
                  <div className="space-y-3">
                    <div className="inline-flex flex-col items-center justify-center h-28 w-28 rounded-full border-4 border-primary bg-primary/5">
                      <span className="text-3xl font-extrabold text-primary">{bestScore}%</span>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5">Best Score</span>
                    </div>
                    <div>
                      {isPassed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Kamu Lulus Ujian Ini!
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                          <XCircle className="h-3.5 w-3.5" /> Belum Lulus (Min. {exam.passing_score}%)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Sudah mengerjakan sebanyak <span className="font-bold text-slate-800">{attemptCount} kali</span>.
                    </p>
                  </div>
                ) : (
                  <div className="py-6">
                    <Award className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Belum Ada Riwayat Ujian</p>
                    <p className="text-xs text-muted-foreground mt-1 px-4">Selesaikan ujian dan raih nilai kelulusan minimal 70% untuk dapat badge khusus!</p>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="rounded-3xl bg-[image:var(--gradient-hero)] border border-border/30 p-6">
                <h4 className="font-bold text-primary-deep text-sm flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" /> Tips Gamifikasi
                </h4>
                <ul className="text-xs text-muted-foreground mt-3 space-y-2 list-disc list-inside">
                  <li>Raih nilai 100% sempurna untuk membuka badge <span className="font-bold text-slate-800">💎 Diamond</span>.</li>
                  <li>Selesaikan ujian dalam waktu sangat singkat untuk mendapat badge <span className="font-bold text-slate-800">⏱️ Speed Demon</span>.</li>
                  <li>Jangan menyerah jika gagal, retry sampai lulus untuk badge <span className="font-bold text-slate-800">💪 Never Give Up</span>.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <ExamLeaderboard
            leaderboard={leaderboard}
            currentUserId={user?.id}
            loading={loadingLeaderboard}
            examPassingScore={exam.passing_score}
          />
        </main>
        
        <SiteFooter />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // 2. TAKING EXAM SYSTEM (ACTIVE TIMER)
  // ════════════════════════════════════════════════════════════
  if (phase === 'taking') {
    const currentQ = shuffledQuestions[currentQuestionIdx];
    const isAnswered = (qId: string) => userAnswers[qId] !== null && userAnswers[qId] !== undefined;

    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        {/* Fullscreen header */}
        <header className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-extrabold text-slate-800 line-clamp-1">{exam.title}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Timer countdown progress bubble */}
            <div className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl border text-sm font-mono font-bold ${
              timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Clock className="h-4 w-4 shrink-0" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            
            <button 
              onClick={() => handleSubmitExam(false)}
              disabled={submittingExam}
              className="rounded-xl bg-green-600 hover:bg-green-700 px-4 py-2 text-xs font-extrabold text-white transition-all shadow-md shadow-green-600/10"
            >
              {submittingExam ? "Mengirim..." : "Submit Ujian"}
            </button>
          </div>
        </header>

        <main className="flex-1 py-8 px-4 max-w-5xl mx-auto w-full grid gap-6 md:grid-cols-[2fr_1fr]">
          {/* Main Question Panel */}
          {currentQ ? (
            <div className="space-y-6">
              {/* Question card */}
              <div className="rounded-3xl border border-border/50 bg-white p-8 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full">
                    Pertanyaan {currentQuestionIdx + 1} dari {shuffledQuestions.length}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    Poin: {currentQ.points || 1}
                  </span>
                </div>
                
                <h3 className="text-base font-extrabold text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {currentQ.question}
                </h3>
              </div>

              {/* Option cards */}
              <div className="grid gap-3">
                {currentQ.displayOptions?.map((opt: any) => {
                  const isSelected = userAnswers[currentQ.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectAnswer(currentQ.id, opt.key)}
                      className={`w-full flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-300 ${
                        isSelected 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary text-slate-800 font-semibold shadow-soft' 
                          : 'border-border/60 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                        isSelected 
                          ? 'bg-primary border-primary text-white shadow-soft' 
                          : 'border-slate-300 bg-white text-slate-500'
                      }`}>
                        {opt.key.toUpperCase()}
                      </div>
                      <span className="text-sm pt-0.5 leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Page navigation */}
              <div className="flex justify-between items-center pt-2">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border px-4 py-2.5 rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft className="h-4 w-4" /> Sebelumnya
                </button>
                
                {currentQuestionIdx < shuffledQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                    className="flex items-center gap-1 text-xs font-bold text-white bg-primary hover:bg-primary-deep px-5 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20"
                  >
                    Selanjutnya <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubmitExam(false)}
                    className="flex items-center gap-1 text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-green-600/20"
                  >
                    Submit Ujian <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">Tidak ada soal.</div>
          )}

          {/* Question Grid Navigation side panel */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border/50 bg-white p-6 shadow-card space-y-4">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Navigasi Soal</h4>
              
              <div className="grid grid-cols-5 gap-2.5">
                {shuffledQuestions.map((q, idx) => {
                  const isActive = currentQuestionIdx === idx;
                  const answered = isAnswered(q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`aspect-square rounded-xl text-xs font-bold transition-all border flex items-center justify-center ${
                        isActive 
                          ? 'bg-primary border-primary text-white shadow-md' 
                          : answered 
                            ? 'bg-green-50 border-green-300 text-green-700 font-semibold' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t space-y-2 text-[10px] text-muted-foreground font-semibold">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-md bg-primary border border-primary" />
                  <span>Sedang Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-md bg-green-50 border border-green-300" />
                  <span>Sudah Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-md bg-white border border-slate-200" />
                  <span>Belum Terjawab</span>
                </div>
              </div>
            </div>

            {/* Warning block */}
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-800 leading-relaxed">
                <p className="font-bold">Perhatian!</p>
                <p className="mt-1">Jangan me-refresh halaman, menekan tombol Back browser, atau berpindah tab. Aksi tersebut dapat membatalkan atau secara otomatis mengumpulkan sesi ujian Anda.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // 3. EXAM RESULTS & REVIEW SYSTEM
  // ════════════════════════════════════════════════════════════
  if (phase === 'result') {
    const isPassed = finalScore >= exam.passing_score;
    
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <SiteHeader />
        
        <main className="flex-1 py-10 px-4 max-w-4xl mx-auto w-full space-y-8">
          
          {/* Main Grade block */}
          <div className="rounded-3xl border border-border/50 bg-white p-8 shadow-card text-center relative overflow-hidden">
            {isPassed && <div className="absolute inset-x-0 top-0 h-1.5 bg-green-500" />}
            {!isPassed && <div className="absolute inset-x-0 top-0 h-1.5 bg-red-500" />}
            
            <div className="max-w-md mx-auto space-y-4">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Hasil Penilaian</span>
              
              <div className="inline-flex flex-col items-center justify-center h-32 w-32 rounded-full border-8 border-slate-100 bg-slate-50 shadow-soft">
                <span className={`text-4xl font-extrabold ${isPassed ? 'text-green-600' : 'text-red-500'}`}>{finalScore}%</span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5">Skor Akhir</span>
              </div>

              <div>
                {isPassed ? (
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-green-600">SELAMAT! KAMU LULUS 🎉</h2>
                    <p className="text-xs text-muted-foreground">Kamu berhasil menyelesaikan ujian ini dengan skor kelulusan terpenuhi.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-red-500">BELUM LULUS 😢</h2>
                    <p className="text-xs text-muted-foreground">Skor kamu masih di bawah batas kriteria kelulusan ({exam.passing_score}%).</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-600 pt-2 font-semibold">
                <span>Jawaban Benar: <strong className="text-green-600 font-bold">{finalAttempt?.total_correct}</strong> / {finalAttempt?.total_questions}</span>
                <span>Waktu Tempuh: <strong className="text-slate-800 font-bold">{Math.floor((finalAttempt?.time_spent_seconds || 0) / 60)}m {(finalAttempt?.time_spent_seconds || 0) % 60}s</strong></span>
              </div>

              <div className="flex gap-3 pt-6 max-w-sm mx-auto">
                <button 
                  onClick={handleResetToInfo}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-white border px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <RotateCcw className="h-4 w-4" /> Ulangi Ujian
                </button>
                <Link 
                  to={exam.course_id ? `/course/${exam.course_id}` : "/"}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-primary hover:bg-primary-deep px-4 py-3 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all"
                >
                  Selesai
                </Link>
              </div>
            </div>
          </div>

          {/* 🏆 Celebration Badge Earned Banner */}
          {earnedBadges.length > 0 && (
            <div className="rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-glow animate-pulse">
              <div className="rounded-[22px] bg-white p-8 text-center space-y-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    🏆 BADGE BARU DIPERANGKAP!
                  </span>
                  <h3 className="text-xl font-black text-slate-800">Selamat! Pencapaian Kamu Membuka Badge Baru</h3>
                  <p className="text-xs text-muted-foreground">Badge ini telah disematkan permanen di profil publik Anda.</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6">
                  {earnedBadges.map((ub) => (
                    <div key={ub.id} className="bg-slate-50 border rounded-2xl p-5 w-48 flex flex-col items-center text-center shadow-soft hover:-translate-y-1 transition-all duration-300">
                      <div className="text-4xl filter drop-shadow-md mb-2">{ub.badges?.icon}</div>
                      <span className="font-extrabold text-sm text-slate-800">{ub.badges?.name}</span>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{ub.badges?.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard after result */}
          <ExamLeaderboard
            leaderboard={leaderboard}
            currentUserId={user?.id}
            loading={loadingLeaderboard}
            examPassingScore={exam.passing_score}
          />

          {/* Detailed Question Review Panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-800">Review Jawaban Soal</h3>
            
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const selectedAns = userAnswers[q.id];
                const isCorrect = selectedAns === q.correct_answer;
                
                return (
                  <div key={q.id} className="rounded-3xl border border-border/50 bg-white p-6 shadow-soft space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Soal #{idx + 1}
                      </span>
                      {selectedAns ? (
                        isCorrect ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                            Benar (+{q.points || 1})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                            Salah (+0)
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          Kosong (+0)
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-slate-800 leading-relaxed">{q.question}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {/* Option A */}
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        q.correct_answer === 'a' 
                          ? 'bg-green-50 border-green-200 font-bold text-green-700' 
                          : selectedAns === 'a' 
                            ? 'bg-red-50 border-red-200 text-red-600 font-bold' 
                            : 'border-slate-100'
                      }`}>
                        <span>A. {q.option_a}</span>
                        {q.correct_answer === 'a' && <Check className="h-4 w-4 text-green-600" />}
                      </div>

                      {/* Option B */}
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        q.correct_answer === 'b' 
                          ? 'bg-green-50 border-green-200 font-bold text-green-700' 
                          : selectedAns === 'b' 
                            ? 'bg-red-50 border-red-200 text-red-600 font-bold' 
                            : 'border-slate-100'
                      }`}>
                        <span>B. {q.option_b}</span>
                        {q.correct_answer === 'b' && <Check className="h-4 w-4 text-green-600" />}
                      </div>

                      {/* Option C */}
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        q.correct_answer === 'c' 
                          ? 'bg-green-50 border-green-200 font-bold text-green-700' 
                          : selectedAns === 'c' 
                            ? 'bg-red-50 border-red-200 text-red-600 font-bold' 
                            : 'border-slate-100'
                      }`}>
                        <span>C. {q.option_c}</span>
                        {q.correct_answer === 'c' && <Check className="h-4 w-4 text-green-600" />}
                      </div>

                      {/* Option D */}
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        q.correct_answer === 'd' 
                          ? 'bg-green-50 border-green-200 font-bold text-green-700' 
                          : selectedAns === 'd' 
                            ? 'bg-red-50 border-red-200 text-red-600 font-bold' 
                            : 'border-slate-100'
                      }`}>
                        <span>D. {q.option_d}</span>
                        {q.correct_answer === 'd' && <Check className="h-4 w-4 text-green-600" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
        
        <SiteFooter />
      </div>
    );
  }

  return null;
}
