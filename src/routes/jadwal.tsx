import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchSchedules, fetchCourses } from "@/hooks/use-supabase";
import type { Course } from "@/data/courses";

export const Route = createFileRoute("/jadwal")({
  loader: async () => {
    const [schedules, courses] = await Promise.all([
      fetchSchedules(),
      fetchCourses(),
    ]);
    return { schedules, courses };
  },
  head: () => ({
    meta: [
      { title: "Jadwal Kelas — Belajar Bareng Nexora" },
      {
        name: "description",
        content: "Jadwal lengkap sesi pembelajaran semua kelas dalam satu linimasa.",
      },
      { property: "og:title", content: "Jadwal Kelas — Belajar Bareng Nexora" },
      {
        property: "og:description",
        content: "Pantau jadwal sesi setiap kelas dan rencanakan belajar kamu.",
      },
    ],
  }),
  component: SchedulePage,
});

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DesktopSchedulePage({ schedules, courses, groups, getCourse }: any) {



  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[image:var(--gradient-hero)]">
        <div className="noise absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-4 py-1.5 text-xs font-bold text-primary-deep shadow-soft backdrop-blur-sm">
            <Calendar className="h-3.5 w-3.5" /> Linimasa Kelas
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-primary-deep sm:text-4xl">
            Jadwal Pembelajaran
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Sesi-sesi terjadwal dari semua kelas yang tersedia. Tandai kalender kamu!
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {Object.entries(groups).map(([date, items]) => (
            <div key={date} className="relative">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-soft">
                  <span className="text-[10px] font-semibold uppercase">
                    {new Date(date).toLocaleDateString("id-ID", { month: "short" })}
                  </span>
                  <span className="-mt-0.5 text-base font-extrabold leading-none">
                    {new Date(date).getDate()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-deep">
                    {formatDate(date)}
                  </p>
                  <p className="text-xs text-muted-foreground">{items.length} sesi</p>
                </div>
              </div>

              <div className="ml-5 space-y-3 border-l-2 border-dashed border-border pl-6">
                {items.map((s: any) => {
                  const course = getCourse(s.course_id);
                  if (!course) return null;
                  return (
                    <Link
                      key={s.id}
                      to="/course/$courseId"
                      params={{ courseId: course.id }}
                      className="group relative -ml-[1.85rem] flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4 pl-10 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
                    >
                      <span className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-soft" />
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        loading="lazy"
                        width={80}
                        height={80}
                        className="hidden h-16 w-16 flex-shrink-0 rounded-xl object-cover sm:block"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wide text-primary">
                          {course.category}
                        </p>
                        <h3 className="mt-0.5 truncate text-base font-bold text-foreground transition-colors group-hover:text-primary">
                          {s.topic || "Sesi Pembelajaran"}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {s.time && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {s.time}
                            </span>
                          )}
                          {s.mentor && (
                            <span className="inline-flex items-center gap-1">
                              <User className="h-3.5 w-3.5" /> {s.mentor}
                            </span>
                          )}
                          <span className="hidden sm:inline">• {course.title}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function MobileSchedulePage({ schedules, courses, groups, getCourse }: any) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background pb-20">
      <SiteHeader />

      {/* Sticky Top Nav */}
      <div className="sticky top-0 z-40 flex items-center gap-3 bg-white/80 px-4 py-3 backdrop-blur-md dark:bg-card/80 shadow-sm">
        <Link to="/" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-secondary/50">
           <ArrowLeft className="h-4 w-4 text-foreground" />
        </Link>
        <span className="text-sm font-bold text-foreground">Jadwal Kelas</span>
      </div>

      <section className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 px-4 py-5 shadow-sm">
         <div className="mx-auto max-w-3xl text-white">
            <h1 className="text-xl font-extrabold drop-shadow-sm">Linimasa Belajar</h1>
            <p className="mt-1 text-xs font-medium text-white/80">Pantau jadwal dan gabung kelas.</p>
         </div>
      </section>

      <section className="mt-2 flex-1 bg-white px-4 py-5 shadow-sm dark:bg-card">
         <div className="mx-auto max-w-3xl space-y-6">
            {Object.keys(groups).length === 0 ? (
               <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                 <p className="text-xs text-muted-foreground">Belum ada sesi terjadwal.</p>
               </div>
            ) : null}

            {Object.entries(groups).map(([date, items]: any) => (
               <div key={date}>
                  <div className="mb-3 flex items-center gap-2">
                     <Calendar className="h-4 w-4 text-primary" />
                     <h2 className="text-xs font-bold text-foreground">{formatDate(date)}</h2>
                  </div>
                  <div className="flex flex-col gap-3">
                     {items.map((s: any) => {
                        const course = getCourse(s.course_id);
                        if (!course) return null;
                        return (
                           <Link
                              key={s.id}
                              to="/course/$courseId"
                              params={{ courseId: course.id }}
                              className="group flex items-center gap-3 rounded-2xl border border-border/50 bg-white p-3 shadow-[0_2px_10px_0_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] dark:bg-card"
                           >
                              <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100 text-primary dark:bg-secondary/50">
                                 <span className="text-[10px] font-bold uppercase">{s.time?.split('-')[0].trim() || "LIVE"}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                 <p className="text-[10px] font-bold uppercase tracking-wide text-primary">{course.category}</p>
                                 <h3 className="truncate text-sm font-bold text-foreground group-hover:text-primary">{s.topic || "Sesi Belajar"}</h3>
                                 <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground"><User className="h-3 w-3" /> {s.mentor || "Mentor Nexora"}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                           </Link>
                        )
                     })}
                  </div>
               </div>
            ))}
         </div>
      </section>
    </div>
  )
}

function SchedulePage() {
  const { schedules, courses } = Route.useLoaderData();

  const getCourse = (courseId: string): Course | undefined =>
    courses.find((c: any) => c.id === courseId);

  // group by date (Y-M-D only to avoid group by time)
  const sorted = [...schedules].sort((a: any, b: any) => a.date.localeCompare(b.date));
  const groups = sorted.reduce<Record<string, typeof schedules>>((acc: any, s: any) => {
    const dateKey = s.date.split('T')[0];
    (acc[dateKey] ??= []).push(s);
    return acc;
  }, {});

  return (
    <>
      <div className="lg:hidden">
        <MobileSchedulePage schedules={schedules} courses={courses} groups={groups} getCourse={getCourse} />
      </div>
      <div className="hidden lg:block">
        <DesktopSchedulePage schedules={schedules} courses={courses} groups={groups} getCourse={getCourse} />
      </div>
    </>
  );
}
