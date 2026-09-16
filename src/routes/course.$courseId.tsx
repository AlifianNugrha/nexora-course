import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Clock, BookOpen, User, CheckCircle2, Lock, Calendar, X, Loader2, Award, Gamepad2, Sparkles, Trophy, KeyRound, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchCourseById, fetchSchedulesByCourse, fetchExamsByCourseId } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "@tanstack/react-router";
import { getStoredGames } from "@/hooks/use-mini-games";

export const Route = createFileRoute("/course/$courseId")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/masuk" });
    }
  },
  component: CourseDetail,
});

function DesktopCourseDetail({ course, sessions, onAccess, exams }: { course: any, sessions: any[], onAccess: () => void, exams: any[] }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[image:var(--gradient-hero)]">
        <div className="noise absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke katalog
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1.5 text-xs font-bold text-primary-deep shadow-soft backdrop-blur-sm">
                {course.category} • {course.level}
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-primary-deep sm:text-4xl lg:text-5xl">
                {course.title}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {course.longDescription}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" /> Mentor:{" "}
                  <span className="font-semibold text-foreground">{course.instructor}</span>
                </span>
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" /> {course.duration}
                </span>
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" /> {course.lessons} sesi
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-card">
              <img
                src={course.thumbnail}
                alt={course.title}
                width={800}
                height={600}
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-2 text-sm text-primary-deep">
                  {course.is_closed ? (
                    <><X className="h-4 w-4 text-destructive" /> Pendaftaran telah ditutup</>
                  ) : (
                    <><Lock className="h-4 w-4" /> Akses instan dengan profil lengkap</>
                  )}
                </div>
                <button
                  onClick={onAccess}
                  disabled={course.is_closed}
                  className={`w-full rounded-2xl px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-card transition-all duration-300 ${course.is_closed ? 'bg-slate-400 cursor-not-allowed' : 'bg-[image:var(--gradient-primary)] hover:shadow-glow hover:scale-[1.01]'}`}
                >
                  {course.is_closed ? "Pendaftaran Ditutup" : "Akses Bahan Materi"}
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  {course.is_closed ? "Kelas ini sudah tidak menerima pendaftaran." : "Pastikan profil kamu sudah lengkap untuk akses instan."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primary-deep">
              Apa yang akan kamu pelajari
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {(course.syllabus || []).map((item: string) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primary-deep">
              Jadwal Sesi
            </h2>
            <div className="mt-5 space-y-3">
              {sessions.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Belum ada sesi terjadwal.
                </p>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-soft">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{s.topic}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        • {s.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Join Game via Room Code Quick Bar */}
            <div className="mt-10 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
                    <Gamepad2 className="h-3.5 w-3.5" /> Realtime Multiplayer
                  </span>
                  <h3 className="mt-2 text-xl font-bold">Masuk Game Room dengan Kode</h3>
                  <p className="text-xs text-purple-100">Dapatkan Kode Room dari Admin/Mentor untuk bergabung ke Waiting Room!</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget.elements.namedItem("roomCodeInput") as HTMLInputElement).value;
                    if (input.trim()) {
                      window.location.href = `/game/mg-prompt-01?code=${input.trim().toUpperCase()}`;
                    }
                  }}
                  className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md"
                >
                  <KeyRound className="h-5 w-5 text-purple-200 ml-2" />
                  <input
                    name="roomCodeInput"
                    type="text"
                    placeholder="KODE ROOM (NEX-XXXX)"
                    className="w-44 bg-transparent px-2 py-1.5 text-xs font-bold text-white placeholder-purple-200 uppercase outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-purple-700 shadow hover:bg-purple-50 transition-all shrink-0"
                  >
                    Join Room
                  </button>
                </form>
              </div>
            </div>

            {/* Mini Games Showcase Section */}
            <h2 className="text-2xl font-bold tracking-tight text-primary-deep mt-10 flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-purple-600" /> Mini Games Interaktif Kelas Ini
            </h2>
            <div className="mt-5 space-y-3">
              {(() => {
                const catSlug = (course.category || "").toLowerCase().replace(/\s+/g, "-");
                const classGames = getStoredGames().filter(
                  (g) => g.course_id === course.id || g.course_id === "all" || g.division_slug === catSlug || g.division_slug === "all"
                );

                if (classGames.length === 0) {
                  return (
                    <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      Belum ada mini game khusus untuk kelas ini. Minta Admin/Mentor meluncurkan game di divisi {course.category}!
                    </p>
                  );
                }

                return classGames.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-purple-50/40 p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card dark:border-purple-900/30 dark:bg-purple-950/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-white shadow-soft">
                        {g.game_type === "prompt_vote" ? <Sparkles className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground">{g.title}</p>
                          <span className="rounded-full bg-purple-200 px-2 py-0.5 text-[10px] font-extrabold text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {g.game_type === "prompt_vote" ? "AI Prompt & Vote" : "Cerdas Cermat"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {g.description || "Mainkan bersama secara realtime!"}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/game/$gameId"
                      params={{ gameId: g.id }}
                      className="rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white px-4 py-2.5 shadow-md transition-all shrink-0 flex items-center gap-1.5"
                    >
                      Mainkan Game <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ));
              })()}
            </div>

            {/* Course Exams Section */}
            <h2 className="text-2xl font-bold tracking-tight text-primary-deep mt-10 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" /> Ujian Kelulusan
            </h2>
            <div className="mt-5 space-y-3">
              {exams.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Belum ada ujian kelulusan untuk kelas ini.
                </p>
              ) : (
                exams.map((exam: any) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-soft">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{exam.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {exam.duration_minutes} Menit • Batas KKM: {exam.passing_score}%
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/exam/$examId"
                      params={{ examId: exam.id }}
                      className="rounded-xl bg-primary hover:bg-primary-deep text-xs font-bold text-white px-4 py-2 shadow-md transition-all"
                    >
                      Mulai Ujian
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function MobileCourseDetail({ course, sessions, onAccess, exams }: { course: any, sessions: any[], onAccess: () => void, exams: any[] }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background pb-20">
      <SiteHeader />

      {/* DANA-style Sticky Top Nav Area */}
      <div className="sticky top-0 z-40 flex items-center gap-3 bg-white/80 px-4 py-3 backdrop-blur-md dark:bg-card/80">
        <Link to="/" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-secondary/50">
           <ArrowLeft className="h-4 w-4 text-foreground" />
        </Link>
        <span className="text-sm font-bold text-foreground">Detail Kelas</span>
      </div>

      {/* Hero Image Container */}
      <section className="bg-white px-4 pb-4 pt-2 shadow-sm dark:bg-card">
         <div className="mx-auto max-w-3xl">
           <div className="relative aspect-video w-full overflow-hidden rounded-[1.25rem] shadow-[0_4px_14px_0_rgba(0,0,0,0.05)]">
             <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
           </div>
         </div>
      </section>

      {/* Main Info Card */}
      <section className="mt-2 bg-white px-4 py-5 shadow-sm dark:bg-card">
         <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
               <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{course.category}</span>
               <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-bold text-foreground">{course.level}</span>
            </div>
            <h1 className="text-lg font-extrabold leading-tight text-foreground">{course.title}</h1>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
               {course.longDescription}
            </p>
            
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/50 pt-4">
               <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="text-foreground">{course.instructor}</span>
               </div>
               <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>{course.duration}</span>
               </div>
               <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span>{course.lessons} sesi</span>
               </div>
            </div>
         </div>
      </section>

      {/* CTA Section for Mobile */}
      <section className="mt-2 bg-white px-4 py-5 shadow-sm dark:bg-card">
         <div className="mx-auto max-w-3xl">
            <h2 className="mb-3 text-sm font-bold text-foreground">Akses Pembelajaran</h2>
            <div className="rounded-2xl border border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5 p-4 shadow-[0_4px_14px_0_rgba(0,0,0,0.02)]">
               <div className="flex items-center gap-2 text-xs font-semibold text-primary-deep mb-3">
                  {course.is_closed ? (
                    <><X className="h-4 w-4 text-destructive" /> Pendaftaran ditutup</>
                  ) : (
                    <><Lock className="h-4 w-4 text-primary" /> Akses materi instan</>
                  )}
               </div>
               <button
                 onClick={onAccess}
                 disabled={course.is_closed}
                 className={`group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] ring-1 ring-border/50 transition-all ${course.is_closed ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-primary hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-95 dark:bg-card dark:ring-border'}`}
               >
                 <Lock className={`h-4 w-4 ${course.is_closed ? 'text-slate-400' : 'text-primary transition-colors group-hover:text-purple-600'}`} />
                 <span className={course.is_closed ? "" : "transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent"}>
                   {course.is_closed ? "Pendaftaran Ditutup" : "Akses Bahan Materi"}
                 </span>
               </button>
            </div>
         </div>
      </section>

      {/* Syllabus */}
      <section className="mt-2 flex-1 bg-white px-4 py-5 shadow-sm dark:bg-card">
         <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-sm font-bold text-foreground">Apa yang akan dipelajari</h2>
            <ul className="grid gap-2">
               {(course.syllabus || []).map((item: string) => (
                  <li key={item} className="flex items-start gap-2.5 rounded-xl border border-border/50 p-3 shadow-[0_2px_10px_0_rgba(0,0,0,0.02)]">
                     <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                     <span className="text-xs font-medium text-foreground">{item}</span>
                  </li>
               ))}
            </ul>
         </div>
      </section>

      {/* Mobile Course Exams Section */}
      <section className="mt-2 bg-white px-4 py-5 shadow-sm dark:bg-card">
         <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-sm font-bold text-foreground">Ujian Kelulusan</h2>
            <div className="grid gap-3">
               {exams.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                     Belum ada ujian untuk kelas ini.
                  </p>
               ) : (
                  exams.map((exam) => (
                     <div key={exam.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 p-4 shadow-[0_2px_10px_0_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2.5">
                           <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Award className="h-4 w-4" />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-foreground">{exam.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                 {exam.duration_minutes} Menit • Batas KKM: {exam.passing_score}%
                              </p>
                           </div>
                        </div>
                        <Link
                           to="/exam/$examId"
                           params={{ examId: exam.id }}
                           className="rounded-lg bg-primary text-[10px] font-bold text-white px-3.5 py-1.5 shadow-sm"
                        >
                           Mulai
                        </Link>
                     </div>
                  ))
               )}
            </div>
         </div>
      </section>
      {/* Mobile Mini Games Section */}
      <section className="mt-2 bg-white px-4 py-5 shadow-sm dark:bg-card">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600">
                <Gamepad2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Mini Games Interaktif Kelas Ini</h2>
                <p className="text-[10px] text-muted-foreground">Mainkan kuis & tantangan kuis/AI</p>
              </div>
            </div>

            {/* Join Room Code Input for Mobile Course */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const input = fd.get("mobileCourseRoomCode") as string;
                if (input && input.trim()) {
                  window.location.href = `/game/mg-prompt-01?code=${input.trim().toUpperCase()}`;
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/50 p-1.5 dark:border-purple-900/40 dark:bg-purple-950/30"
            >
              <KeyRound className="h-3.5 w-3.5 text-purple-600 ml-1 shrink-0" />
              <input
                name="mobileCourseRoomCode"
                type="text"
                placeholder="KODE ROOM (NEX-XXXX)"
                className="w-full min-w-0 bg-transparent px-2 py-0.5 text-xs font-bold text-foreground placeholder-muted-foreground uppercase outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-bold text-white shadow hover:bg-purple-700 transition-all shrink-0"
              >
                Join
              </button>
            </form>
          </div>

          <div className="grid gap-3">
            {(() => {
              const catSlug = (course.category || "").toLowerCase().replace(/\s+/g, "-");
              const classGames = getStoredGames().filter(
                (g) => g.course_id === course.id || g.course_id === "all" || g.division_slug === catSlug || g.division_slug === "all"
              );

              if (classGames.length === 0) {
                return (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Belum ada mini game khusus untuk kelas ini. Minta Mentor meluncurkan game di divisi {course.category}!
                  </p>
                );
              }

              return classGames.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-purple-100 bg-purple-50/40 p-3.5 shadow-sm dark:border-purple-900/30 dark:bg-purple-950/20"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-soft">
                      {g.game_type === "prompt_vote" ? <Sparkles className="h-4 w-4" /> : <Trophy className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-foreground">{g.title}</p>
                      <span className="mt-0.5 inline-block rounded-full bg-purple-200 px-2 py-0.5 text-[9px] font-extrabold text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {g.game_type === "prompt_vote" ? "AI Prompt & Vote" : "Cerdas Cermat"}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/game/$gameId"
                    params={{ gameId: g.id }}
                    className="shrink-0 rounded-lg bg-purple-600 px-3 py-1.5 text-[10px] font-bold text-white shadow hover:bg-purple-700 transition-all flex items-center gap-1"
                  >
                    Main <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>
    </div>
  );
}

function CourseDetail() {
  const { courseId } = Route.useParams();
  const [course, setCourse] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleAccess = async () => {
    if (!user) {
      navigate({ to: "/masuk" });
      return;
    }

    // 1. Check if profile is complete (needs class_name)
    if (!profile?.class_name) {
      navigate({ to: "/lengkapi-profil" });
      return;
    }

    setSubmitting(true);
    try {
      // 2. Check database for enrollment
      const { data: enrollment } = await supabase
        .from("form_submissions")
        .select("id")
        .eq("course", courseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!enrollment) {
        // 3. Auto-enroll in background (Absensi)
        const { error } = await supabase.from("form_submissions").insert([{
          course: courseId,
          event_name: course.title,
          name: profile.full_name || "User",
          email: profile.email || "",
          phone: profile.phone || "-",
          class_name: profile.class_name,
          user_id: user.id
        }]);
        if (error) throw error;
      }

      // 4. Navigate directly to materials
      navigate({ to: "/materi/$courseId", params: { courseId } });
    } catch (err) {
      console.error("Enrollment error:", err);
      alert("Gagal mengakses materi. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const courseData = await fetchCourseById(courseId);
        setCourse(courseData);
        if (courseData) {
          const schedulesData = await fetchSchedulesByCourse(courseId);
          setSessions(schedulesData);
          const examsData = await fetchExamsByCourseId(courseId);
          setExams(examsData);
        }
      } catch (err) {
        console.error("Error loading course:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Memuat data kelas...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <div className="mx-auto flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary-deep">Course tidak ditemukan</h1>
            <p className="mt-2 text-muted-foreground">Mungkin sudah dipindahkan atau dihapus.</p>
            <Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md">
              <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
            </Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <>
      <div className="lg:hidden">
        <MobileCourseDetail course={course} sessions={sessions} onAccess={handleAccess} exams={exams} />
      </div>
      <div className="hidden lg:block">
        <DesktopCourseDetail course={course} sessions={sessions} onAccess={handleAccess} exams={exams} />
      </div>

      {submitting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-10 shadow-2xl dark:bg-card">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-lg font-bold">Mempersiapkan Materi...</h3>
              <p className="text-sm text-muted-foreground">Mohon tunggu sebentar.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
