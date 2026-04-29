import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Clock, BookOpen, User, CheckCircle2, Lock, Calendar } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GateForm } from "@/components/GateForm";
import { fetchCourseById, fetchSchedulesByCourse } from "@/hooks/use-supabase";

export const Route = createFileRoute("/course/$courseId")({
  component: CourseDetail,
});

function DesktopCourseDetail({ course, sessions, onOpenGate }: { course: any, sessions: any[], onOpenGate: () => void }) {
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
                  <Lock className="h-4 w-4" /> Materi terkunci — isi form untuk akses
                </div>
                <button
                  onClick={onOpenGate}
                  className="w-full rounded-2xl bg-[image:var(--gradient-primary)] px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-card transition-all duration-300 hover:shadow-glow hover:scale-[1.01]"
                >
                  Akses Bahan Materi
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Gratis — cukup data dasar untuk mulai belajar.
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
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function MobileCourseDetail({ course, sessions, onOpenGate }: { course: any, sessions: any[], onOpenGate: () => void }) {
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
                  <Lock className="h-4 w-4 text-primary" /> Materi ini terkunci.
               </div>
               <button
                 onClick={onOpenGate}
                 className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] ring-1 ring-border/50 transition-all hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-95 dark:bg-card dark:ring-border"
               >
                 <Lock className="h-4 w-4 text-primary transition-colors group-hover:text-purple-600" />
                 <span className="text-primary transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent">
                   Akses Bahan Materi
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
    </div>
  );
}

function CourseDetail() {
  const { courseId } = Route.useParams();
  const [course, setCourse] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const courseData = await fetchCourseById(courseId);
        setCourse(courseData);
        if (courseData) {
          const schedulesData = await fetchSchedulesByCourse(courseId);
          setSessions(schedulesData);
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
        <MobileCourseDetail course={course} sessions={sessions} onOpenGate={() => setGateOpen(true)} />
      </div>
      <div className="hidden lg:block">
        <DesktopCourseDetail course={course} sessions={sessions} onOpenGate={() => setGateOpen(true)} />
      </div>

      <GateForm
        open={gateOpen}
        onOpenChange={setGateOpen}
        courseTitle={course.title}
        courseId={course.id}
        materialLink={course.material_link}
      />
    </>
  );
}
