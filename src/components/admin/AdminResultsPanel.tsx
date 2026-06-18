import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Trophy, Search, ArrowLeft,
  Clock, CheckCircle, XCircle, BarChart2, Users, Medal,
  ChevronRight, FileText
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exam {
  id: string;
  title: string;
  passing_score: number | null;
  created_at: string;
}

interface ExamAttempt {
  id: string;
  score: number;
  finished_at: string;
  user_id: string;
  exam_id: string;
  user_profiles: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    active_title: string | null;
    active_frame: string | null;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FRAME_COLOR_MAP: Record<string, string> = {
  blue: "hsl(220, 90%, 56%)",
  purple: "hsl(270, 80%, 60%)",
  gold: "hsl(45, 95%, 50%)",
  silver: "hsl(210, 20%, 70%)",
  red: "hsl(0, 80%, 58%)",
  green: "hsl(140, 70%, 45%)",
  teal: "hsl(170, 75%, 42%)",
  rose: "hsl(340, 80%, 58%)",
  orange: "hsl(25, 90%, 55%)",
  default: "hsl(220, 90%, 56%)",
};

function getFrameColor(frame: string | null | undefined): string {
  if (!frame) return FRAME_COLOR_MAP.default;
  for (const key of Object.keys(FRAME_COLOR_MAP)) {
    if (frame.toLowerCase().includes(key)) return FRAME_COLOR_MAP[key];
  }
  return FRAME_COLOR_MAP.default;
}

const RANK_ICONS = ["🥇", "🥈", "🥉"];

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score, passingScore }: { score: number; passingScore: number }) {
  const isPassed = score >= passingScore;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full bg-slate-100 h-1.5 min-w-[64px]">
        <div
          className={`h-1.5 rounded-full transition-all ${isPassed ? "bg-green-500" : "bg-red-400"}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums w-7 text-right ${isPassed ? "text-green-600" : "text-red-500"}`}>
        {score}
      </span>
      {isPassed
        ? <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
        : <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
    </div>
  );
}

// ─── VIEW 1: Exam List ────────────────────────────────────────────────────────

interface ExamListViewProps {
  onSelect: (exam: Exam) => void;
}

function ExamListView({ onSelect }: ExamListViewProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: examData } = await supabase
        .from("exams")
        .select("id, title, passing_score, created_at")
        .order("created_at", { ascending: false });

      const exams = (examData as Exam[]) || [];
      setExams(exams);

      // Fetch attempt counts per exam
      if (exams.length > 0) {
        const counts: Record<string, number> = {};
        await Promise.all(
          exams.map(async (exam) => {
            // Try without is_submitted filter first (more inclusive)
            const { count, error } = await supabase
              .from("exam_attempts")
              .select("*", { count: "exact", head: true })
              .eq("exam_id", exam.id)
              .not("finished_at", "is", null);
            if (error) console.error("[AdminResults] count error:", error);
            counts[exam.id] = count ?? 0;
          })
        );
        setAttemptCounts(counts);
      }

      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return exams;
    return exams.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
  }, [exams, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Ujian</p>
            <p className="text-2xl font-extrabold">{exams.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Pengerjaan</p>
            <p className="text-2xl font-extrabold text-amber-600">
              {Object.values(attemptCounts).reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari judul ujian..."
          className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-3 text-sm outline-none focus:border-primary shadow-sm"
        />
      </div>

      {/* Exam cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">Belum ada ujian.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(exam => {
            const count = attemptCounts[exam.id] ?? 0;
            return (
              <button
                key={exam.id}
                onClick={() => onSelect(exam)}
                className="w-full rounded-2xl border border-border bg-white shadow-sm hover:shadow-md hover:border-primary/40 transition-all group text-left"
              >
                <div className="flex items-center gap-4 px-6 py-4">
                  {/* Icon */}
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{exam.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Passing Score: <span className="font-semibold text-foreground">{exam.passing_score ?? 70}</span>
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-xs font-bold">{count} peserta</span>
                    </div>
                    {count > 0 && (
                      <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
                        <BarChart2 className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-bold text-primary">Lihat Hasil</span>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                </div>

                {/* Mobile count */}
                <div className="sm:hidden px-6 pb-4 -mt-2">
                  <span className="text-xs text-muted-foreground">{count} peserta telah mengerjakan</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── VIEW 2: Exam Results ─────────────────────────────────────────────────────

interface ExamResultViewProps {
  exam: Exam;
  onBack: () => void;
}

function ExamResultView({ exam, onBack }: ExamResultViewProps) {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const passingScore = exam.passing_score ?? 70;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Fetch all attempts that have a score (finished), no is_submitted filter
      const { data, error } = await supabase
        .from("exam_attempts")
        .select(`
          id,
          score,
          finished_at,
          user_id,
          exam_id,
          user_profiles (
            full_name,
            email,
            avatar_url,
            active_title,
            active_frame
          )
        `)
        .eq("exam_id", exam.id)
        .not("finished_at", "is", null)
        .order("score", { ascending: false });

      if (error) {
        console.error("[AdminResults] fetch error:", error);
      } else {
        console.log("[AdminResults] attempts fetched:", data?.length, data);
      }
      setAttempts((data as any) || []);
      setLoading(false);
    };
    load();
  }, [exam.id]);

  const filtered = useMemo(() => {
    if (!search.trim()) return attempts;
    const q = search.toLowerCase();
    return attempts.filter(a => {
      const name = a.user_profiles?.full_name?.toLowerCase() || "";
      const email = a.user_profiles?.email?.toLowerCase() || "";
      return name.includes(q) || email.includes(q);
    });
  }, [attempts, search]);

  const passed = attempts.filter(a => a.score >= passingScore).length;
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
        <div>
          <h2 className="font-extrabold text-lg leading-tight">{exam.title}</h2>
          <p className="text-xs text-muted-foreground">Passing Score: {passingScore}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Peserta</p>
            <p className="text-2xl font-extrabold">{attempts.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Lulus</p>
            <p className="text-2xl font-extrabold text-green-600">{passed}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Medal className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Rata-rata Skor</p>
            <p className="text-2xl font-extrabold text-amber-600">{avgScore}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama atau email peserta..."
          className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-3 text-sm outline-none focus:border-primary shadow-sm"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">Belum ada peserta yang mengerjakan ujian ini.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase text-muted-foreground w-12">#</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase text-muted-foreground">Peserta</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase text-muted-foreground w-44">Skor</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase text-muted-foreground">Status</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase text-muted-foreground">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((attempt, index) => {
                  const isPassed = attempt.score >= passingScore;
                  const name = attempt.user_profiles?.full_name || attempt.user_profiles?.email || "Unknown";
                  const avatar = attempt.user_profiles?.avatar_url;
                  const frame = attempt.user_profiles?.active_frame;
                  const title = attempt.user_profiles?.active_title;
                  const frameColor = getFrameColor(frame);

                  return (
                    <tr key={attempt.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Rank */}
                      <td className="px-5 py-4">
                        {index < 3 ? (
                          <span className="text-lg leading-none">{RANK_ICONS[index]}</span>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground tabular-nums">{index + 1}</span>
                        )}
                      </td>

                      {/* Peserta */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="relative h-9 w-9 rounded-full p-[2px] shrink-0"
                            style={{ background: `linear-gradient(135deg, ${frameColor}, ${frameColor}88)` }}
                          >
                            <div className="h-full w-full rounded-full overflow-hidden bg-slate-200">
                              {avatar ? (
                                <img src={avatar} alt={name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                                  <span className="text-xs font-bold text-primary">
                                    {name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-sm leading-tight">{name}</p>
                            {title ? (
                              <span className="text-[10px] font-bold text-primary/80 rounded px-1 bg-primary/10">
                                {title}
                              </span>
                            ) : (
                              attempt.user_profiles?.email && (
                                <p className="text-[10px] text-muted-foreground">{attempt.user_profiles.email}</p>
                              )
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Score bar */}
                      <td className="px-5 py-4">
                        <ScoreBar score={attempt.score} passingScore={passingScore} />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isPassed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          {isPassed ? "Lulus" : "Belum Lulus"}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 shrink-0" />
                          {new Date(attempt.finished_at).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function AdminResultsPanel() {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  if (selectedExam) {
    return (
      <ExamResultView
        exam={selectedExam}
        onBack={() => setSelectedExam(null)}
      />
    );
  }

  return <ExamListView onSelect={setSelectedExam} />;
}
