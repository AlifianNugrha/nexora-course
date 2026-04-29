import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, BookOpen, Calendar, Users, ArrowRight, Zap, Trophy, Target,
  MonitorSmartphone, Server, Palette, Smartphone, Infinity, LineChart, Code2
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CategoryCard } from "@/components/CategoryCard";
import { fetchCategories, fetchCourses } from "@/hooks/use-supabase";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [categories, courses] = await Promise.all([
      fetchCategories(),
      fetchCourses(),
    ]);
    return { categories, courses };
  },
  head: () => ({
    meta: [
      { title: "Belajar Bareng Nexora — Platform Belajar Tech Online" },
      {
        name: "description",
        content:
          "Belajar Front End, Back End, Mobile Dev, UI/UX, dan DevOps bersama mentor terbaik. Gratis dan tanpa batas waktu.",
      },
      { property: "og:title", content: "Belajar Bareng Nexora" },
      {
        property: "og:description",
        content: "Platform belajar tech online untuk semua.",
      },
    ],
  }),
  component: HomePage,
});

function DesktopHomePage({ categories, courses }: { categories: any[]; courses: any[] }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* ═══ Hero Section ═══ */}
      <section className="relative overflow-hidden pb-32 pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(113,42,226,0.05)_0%,rgba(249,249,255,0)_100%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left Column */}
            <div className="max-w-2xl">

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.1] animate-slide-up delay-100">
                Belajar skill tech,{" "}
                <span className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
                  bareng Nexora.
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground animate-slide-up delay-200">
                Pilih jalur belajar kamu — Front End, Back End, Mobile Dev, UI/UX, atau DevOps.
                Mulai dari nol, gratis, dan bisa diakses kapan saja.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4 animate-slide-up delay-300">
                <a
                  href="#kategori-desktop"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:bg-white active:scale-95"
                >
                  <BookOpen className="h-5 w-5 text-white transition-colors group-hover:text-purple-600" />
                  <span className="hidden sm:inline text-white transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent">
                    Mulai Belajar
                  </span>
                </a>
                <Link
                  to="/jadwal"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-transparent px-8 py-4 text-base font-bold transition-all duration-300 hover:-translate-y-1 hover:bg-primary/5 active:scale-95"
                >
                  <Calendar className="h-5 w-5 text-primary transition-colors group-hover:text-purple-600" />
                  <span className="text-primary transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent">
                    Cek Jadwal
                  </span>
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap items-center gap-8 animate-slide-up delay-400">
                {[
                  { n: `${categories.length}`, l: "Kategori" },
                  { n: `${courses.length}+`, l: "Kelas tersedia" },
                  { n: "10+", l: "Mentor ahli" },
                ].map((s) => (
                  <div key={s.l} className="flex flex-col">
                    <p className="text-3xl font-extrabold text-foreground">{s.n}</p>
                    <p className="text-sm font-medium text-muted-foreground">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none animate-slide-up delay-200">
              <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-secondary/10 p-2 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                  alt="Belajar Bareng Nexora"
                  className="h-full w-full rounded-[2rem] object-cover"
                />
                <div className="absolute -left-6 top-1/4 rounded-2xl bg-white p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Target Karir</p>
                      <p className="text-xs text-muted-foreground">Siap Kerja</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-6 bottom-1/4 rounded-2xl bg-white p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Sertifikat</p>
                      <p className="text-xs text-muted-foreground">Diakui Industri</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Kategori Section ═══ */}
      <section id="kategori-desktop" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-primary-deep sm:text-4xl">
            Pilih Kategori{" "}
            <span className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
              Belajar
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Setiap kategori berisi kumpulan kelas yang dikurasi oleh mentor berpengalaman.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <div key={cat.slug} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <CategoryCard category={cat} courseCount={courses.filter((c: any) => c.category === cat.name).length} />
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-12 text-center shadow-2xl sm:p-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:leading-[1.1]">
                Siap Mulai Belajar?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
                Pilih kategori yang kamu minati dan mulai akses materi sekarang. Gratis, tanpa batas waktu.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#kategori-desktop"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-10 py-4 text-lg font-bold shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-95"
                >
                  <span className="text-primary transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent">
                    Pilih Kategori
                  </span>
                  <ArrowRight className="h-5 w-5 text-primary transition-colors group-hover:text-blue-600" />
                </a>
                <Link
                  to="/jadwal"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/20 px-10 py-4 text-lg font-bold transition-all duration-300 hover:-translate-y-1 hover:bg-white active:scale-95"
                >
                  <Calendar className="h-5 w-5 text-white transition-colors group-hover:text-purple-600" />
                  <span className="text-white transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent">
                    Lihat Jadwal
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function MobileHomePage({ categories, courses }: { categories: any[]; courses: any[] }) {
  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('front')) return <MonitorSmartphone className="h-6 w-6 text-blue-500" />;
    if (n.includes('back')) return <Server className="h-6 w-6 text-purple-500" />;
    if (n.includes('ui') || n.includes('ux') || n.includes('design')) return <Palette className="h-6 w-6 text-pink-500" />;
    if (n.includes('mobile')) return <Smartphone className="h-6 w-6 text-green-500" />;
    if (n.includes('devops')) return <Infinity className="h-6 w-6 text-orange-500" />;
    if (n.includes('data')) return <LineChart className="h-6 w-6 text-indigo-500" />;
    return <Code2 className="h-6 w-6 text-primary" />;
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background pb-8">
      <SiteHeader />

      {/* ═══ DANA-style Hero Card Section ═══ */}
      <section className="bg-white px-4 pb-6 pt-4 shadow-sm dark:bg-card">
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 transition-transform hover:-translate-y-0.5">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/80">Platform Belajar Tech</p>
                <h1 className="mt-1 text-xl font-extrabold text-white drop-shadow-sm">Bareng Nexora</h1>
              </div>

            </div>

            {/* Stats Row */}
            <div className="mt-6 flex items-center gap-6 border-t border-white/20 pt-4">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white drop-shadow-sm">{courses.length}+</span>
                <span className="text-[10px] text-white/80">Kelas Tersedia</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white drop-shadow-sm">10+</span>
                <span className="text-[10px] text-white/80">Mentor Ahli</span>
              </div>
            </div>
          </div>

          {/* Action Pills */}
          <div className="mt-5 flex gap-3">
            <Link
              to="/jadwal"
              className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] ring-1 ring-border/50 transition-all hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-95 dark:bg-card dark:ring-border"
            >
              <Calendar className="h-4 w-4 text-primary transition-colors group-hover:text-purple-600" />
              <span className="text-primary transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent">
                Jadwal
              </span>
            </Link>
            <a
              href="#kelas"
              className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] ring-1 ring-border/50 transition-all hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-95 dark:bg-card dark:ring-border"
            >
              <BookOpen className="h-4 w-4 text-primary transition-colors group-hover:text-purple-600" />
              <span className="text-primary transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent">
                Semua Kelas
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ DANA-style Promo Banner ═══ */}
      <section className="mt-2 bg-white px-4 py-4 dark:bg-card">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5 p-4 shadow-[0_4px_14px_0_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-primary/10 text-primary">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Sertifikat Kelulusan</h3>
                <p className="text-[10px] text-muted-foreground">Diakui Industri & Siap Kerja</p>
              </div>
            </div>
            <Link to="/sertifikat" className="group rounded-full bg-primary px-4 py-2 text-xs font-bold shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] active:scale-95">
              <span className="text-white transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent">
                Klaim
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ DANA-style Menu Grid (Categories) ═══ */}
      <section id="kategori" className="mt-2 bg-white px-4 py-6 shadow-sm dark:bg-card">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-5 text-base font-bold text-foreground">Kategori Belajar</h2>
          <div className="grid grid-cols-4 gap-x-2 gap-y-6">
            {categories.map((cat: any) => (
              <Link key={cat.slug} to="/kategori/$slug" params={{ slug: cat.slug }} className="group flex flex-col items-center gap-2">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white shadow-sm ring-1 ring-border/30 transition-transform active:scale-90 dark:bg-secondary/30">
                  {getCategoryIcon(cat.name)}
                </div>
                <span className="text-center text-[10px] font-semibold leading-tight text-muted-foreground group-hover:text-primary">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DANA-style History/List (Courses) ═══ */}
      <section id="kelas" className="mt-2 flex-1 bg-white px-4 py-6 shadow-sm dark:bg-card">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Kelas Populer</h2>
            <Link to="/jadwal" className="text-xs font-bold text-primary hover:underline">View All</Link>
          </div>

          <div className="flex flex-col gap-4">
            {courses.slice(0, 6).map((course: any) => (
              <Link
                key={course.id}
                to="/course/$courseId"
                params={{ courseId: course.id }}
                className="group flex items-center gap-4 rounded-2xl border border-transparent p-2 transition-colors hover:bg-slate-50 dark:hover:bg-secondary/20"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <h3 className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary">{course.title}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span>{course.category}</span>
                    <span className="h-1 w-1 rounded-full bg-border"></span>
                    <span>{course.level}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center justify-center rounded-full bg-primary/5 p-2 text-primary">
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function HomePage() {
  const { categories, courses } = Route.useLoaderData();

  return (
    <>
      <div className="lg:hidden">
        <MobileHomePage categories={categories} courses={courses} />
      </div>
      <div className="hidden lg:block">
        <DesktopHomePage categories={categories} courses={courses} />
      </div>
    </>
  );
}
