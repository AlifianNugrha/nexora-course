import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Layers, Gamepad2, Sparkles, Trophy, KeyRound } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CourseCard } from "@/components/CourseCard";
import { fetchCategory, fetchCoursesByCategory } from "@/hooks/use-supabase";
import { getStoredGames } from "@/hooks/use-mini-games";

export const Route = createFileRoute("/kategori/$slug")({
  loader: async ({ params }) => {
    const category = await fetchCategory(params.slug);
    if (!category) throw notFound();
    const courses = await fetchCoursesByCategory(category.name);
    return { category, courses };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.category;
    return {
      meta: c
        ? [
            { title: `${c.name} — Kategori Course | Belajar Bareng Nexora` },
            { name: "description", content: c.description },
            { property: "og:title", content: `${c.name} Courses — Belajar Bareng Nexora` },
            { property: "og:description", content: c.description },
            { property: "og:image", content: c.thumbnail },
          ]
        : [{ title: "Kategori — Belajar Bareng Nexora" }],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="mx-auto flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-deep">Kategori tidak ditemukan</h1>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  ),
  component: CategoryPage,
});

function DesktopCategoryPage({ category, courses }: { category: any, courses: any[] }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[image:var(--gradient-hero)]">
        <div className="noise absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Semua kategori
          </Link>

          <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-4 py-1.5 text-xs font-bold text-primary-deep shadow-soft backdrop-blur-sm">
                <Layers className="h-3.5 w-3.5" /> Kategori Course
              </span>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-primary-deep sm:text-5xl">
                {category.name}
              </h1>
              <p className="mt-3 text-lg font-semibold text-primary">
                {category.tagline}
              </p>
              <p className="mt-3 max-w-xl text-muted-foreground">
                {category.description}
              </p>
              <p className="mt-5 text-sm font-bold text-primary-deep">
                {courses.length} kelas tersedia
              </p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-card">
              <img
                src={category.thumbnail}
                alt={category.name}
                width={800}
                height={600}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-primary-deep sm:text-3xl">
            Kelas di kategori ini
          </h2>
          <Link
            to="/jadwal"
            className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            Lihat jadwal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-12 text-center">
            <p className="text-muted-foreground">
              Belum ada kelas di kategori ini. Cek kembali nanti ya!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}

        {/* Mini Games Specific to Division */}
        <div className="mt-16 border-t border-border pt-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                <Gamepad2 className="h-3.5 w-3.5" /> Divisi Game Hub
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-primary-deep sm:text-3xl mt-2">
                Mini Games Divisi {category.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Mainkan game AI Prompt Voting atau Cerdas Cermat khusus divisi ini!</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem("categoryRoomCode") as HTMLInputElement).value;
                if (input.trim()) {
                  window.location.href = `/game/mg-prompt-01?code=${input.trim().toUpperCase()}`;
                }
              }}
              className="flex items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50/50 p-1.5 dark:border-purple-900/40 dark:bg-purple-950/30 shrink-0"
            >
              <KeyRound className="h-4 w-4 text-purple-600 ml-2" />
              <input
                name="categoryRoomCode"
                type="text"
                placeholder="KODE ROOM (NEX-XXXX)"
                className="w-40 bg-transparent px-2 py-1 text-xs font-bold text-foreground placeholder-muted-foreground uppercase outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-purple-700 transition-all shrink-0"
              >
                Join
              </button>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getStoredGames()
              .filter((g) => g.division_slug === category.slug || g.division_slug === "all" || !g.division_slug)
              .map((g) => (
                <div
                  key={g.id}
                  className="flex flex-col justify-between rounded-3xl border border-purple-100 bg-purple-50/40 p-5 shadow-soft transition-all hover:shadow-card dark:border-purple-900/30 dark:bg-purple-950/20"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-purple-200 px-2.5 py-0.5 text-[10px] font-extrabold text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {g.game_type === "prompt_vote" ? "AI Prompt & Vote" : "Cerdas Cermat"}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{category.name}</span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-foreground">{g.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{g.description || "Game divisi interaktif."}</p>
                  </div>

                  <Link
                    to="/game/$gameId"
                    params={{ gameId: g.id }}
                    className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-purple-700 transition-all"
                  >
                    Mainkan Game Divisi <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function MobileCategoryPage({ category, courses }: { category: any, courses: any[] }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background pb-8">
      <SiteHeader />

      {/* DANA-style Category Banner */}
      <section className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 px-4 py-6 shadow-sm">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[1.25rem] bg-white p-1 shadow-md">
              <img src={category.thumbnail} alt={category.name} className="h-full w-full rounded-xl object-cover" />
            </div>
            <div>
              <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                Kategori
              </span>
              <h1 className="mt-1 text-xl font-extrabold text-white">{category.name}</h1>
              <p className="text-xs font-medium text-white/90">{courses.length} Kelas Tersedia</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-white/80 line-clamp-2">
            {category.description}
          </p>
        </div>
      </section>

      {/* Mobile Mini Games Divisi Section */}
      <section className="mt-2 bg-white px-4 py-6 shadow-sm dark:bg-card">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Mini Games Divisi Interaktif</h2>
                <p className="text-[11px] text-muted-foreground">Uji skill {category.name} & kumpulkan poin</p>
              </div>
            </div>

            {/* Join Room Code Input for Mobile */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const input = fd.get("mobileRoomCode") as string;
                if (input && input.trim()) {
                  window.location.href = `/game/mg-prompt-01?code=${input.trim().toUpperCase()}`;
                }
              }}
              className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50/50 p-1.5 dark:border-purple-900/40 dark:bg-purple-950/30"
            >
              <KeyRound className="h-4 w-4 text-purple-600 ml-1 shrink-0" />
              <input
                name="mobileRoomCode"
                type="text"
                placeholder="KODE ROOM (NEX-XXXX)"
                className="w-full min-w-0 bg-transparent px-2 py-1 text-xs font-bold text-foreground placeholder-muted-foreground uppercase outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-purple-700 transition-all shrink-0"
              >
                Join
              </button>
            </form>
          </div>

          <div className="grid gap-3">
            {(() => {
              const categoryGames = getStoredGames().filter(
                (g) => g.division_slug === category.slug || g.division_slug === "all" || !g.division_slug
              );

              if (categoryGames.length === 0) {
                return (
                  <p className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    Belum ada mini game di divisi ini.
                  </p>
                );
              }

              return categoryGames.map((g) => (
                <div
                  key={g.id}
                  className="flex flex-col justify-between rounded-2xl border border-purple-100 bg-purple-50/40 p-4 shadow-sm dark:border-purple-900/30 dark:bg-purple-950/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white shrink-0">
                        {g.game_type === "prompt_vote" ? <Sparkles className="h-4 w-4" /> : <Trophy className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-foreground line-clamp-1">{g.title}</h3>
                        <span className="inline-block rounded-full bg-purple-200 px-2 py-0.5 text-[9px] font-extrabold text-purple-800 dark:bg-purple-900 dark:text-purple-200 mt-0.5">
                          {g.game_type === "prompt_vote" ? "AI Prompt & Vote" : "Cerdas Cermat"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">{g.description || "Game divisi interaktif."}</p>

                  <Link
                    to="/game/$gameId"
                    params={{ gameId: g.id }}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-purple-700 transition-all"
                  >
                    Mainkan Game Divisi <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* DANA-style Course List */}
      <section className="mt-2 flex-1 bg-white px-4 py-6 shadow-sm dark:bg-card">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-5 text-base font-bold text-foreground">Daftar Kelas</h2>
          
          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-xs text-muted-foreground">Belum ada kelas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {courses.map((course) => (
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
                      <span>{course.duration}</span>
                      <span className="h-1 w-1 rounded-full bg-border"></span>
                      <span className="font-semibold text-primary">{course.level}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center justify-center rounded-full bg-primary/5 p-2 text-primary">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CategoryPage() {
  const { category, courses } = Route.useLoaderData();

  return (
    <>
      <div className="lg:hidden">
        <MobileCategoryPage category={category} courses={courses} />
      </div>
      <div className="hidden lg:block">
        <DesktopCategoryPage category={category} courses={courses} />
      </div>
    </>
  );
}
