import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  ChevronRight,
  FileText,
  CheckCircle2,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchCourseById, fetchMaterialsByCourseId } from "@/hooks/use-supabase";
import type { Material } from "@/hooks/use-pb"; // Keeping the type for now if it's used

export const Route = createFileRoute("/materi/$courseId")({
  loader: async ({ params }) => {
    const course = await fetchCourseById(params.courseId);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.course;
    return {
      meta: c
        ? [
            { title: `Materi ${c.title} — Belajar Bareng Nexora` },
            { name: "description", content: `Akses materi lengkap ${c.title}.` },
          ]
        : [{ title: "Materi — Belajar Bareng Nexora" }],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="mx-auto flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-deep">Materi tidak ditemukan</h1>
          <p className="mt-2 text-muted-foreground">Mungkin sudah dipindahkan atau dihapus.</p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  ),
  component: MateriPage,
});

function MateriPage() {
  const { course } = Route.useLoaderData();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    fetchMaterialsByCourseId(course.id).then((data) => {
      setMaterials(data);
      setLoading(false);
    });
  }, [course.id]);

  const activeMaterial = materials[activeIdx] ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Breadcrumb header */}
      <div className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              to="/course/$courseId"
              params={{ courseId: course.id }}
              className="hover:text-primary transition-colors"
            >
              {course.title}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-primary-deep">Materi</span>
          </div>
          <h1 className="mt-2 text-xl font-bold text-primary-deep sm:text-2xl">
            Materi — {course.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-72">
          <div className="sticky top-20 rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-deep">
              <BookOpen className="h-4 w-4" />
              Daftar Materi
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : materials.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Belum ada materi dari CMS.
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Materi akan muncul setelah ditambahkan di Supabase Admin.
                </p>
              </div>
            ) : (
              <nav className="space-y-1">
                {materials.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveIdx(i)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                      activeIdx === i
                        ? "bg-primary/10 font-bold text-primary-deep"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                        activeIdx === i
                          ? "bg-[image:var(--gradient-primary)] text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {activeIdx === i ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span className="truncate">{m.title}</span>
                  </button>
                ))}
              </nav>
            )}
          </div>
        </aside>

        {/* Main content area */}
        <main className="min-w-0 flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : materials.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-soft">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground/50">
                <FileText className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-primary-deep">Materi Belum Tersedia</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Materi untuk kelas ini belum ditambahkan ke CMS. Konten akan muncul secara
                otomatis setelah diinput di Supabase Admin Panel.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/course/$courseId"
                  params={{ courseId: course.id }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
                >
                  <ArrowLeft className="h-4 w-4" /> Kembali ke Detail Kelas
                </Link>
              </div>
            </div>
          ) : activeMaterial ? (
            <article className="animate-fade-in">
              {/* Material header */}
              <div className="mb-6 rounded-2xl border border-border/50 bg-card p-6 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary-deep">
                      Materi {activeIdx + 1} / {materials.length}
                    </span>
                    <h2 className="mt-3 text-2xl font-bold text-primary-deep">
                      {activeMaterial.title}
                    </h2>
                  </div>
                </div>

                {/* Link tambahan */}
                {activeMaterial.link && (
                  <a
                    href={activeMaterial.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/10"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Buka Link Materi
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {/* Rich text content */}
              <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-soft sm:p-8">
                <div
                  className="prose prose-sm max-w-none text-foreground prose-headings:text-primary-deep prose-a:text-primary prose-strong:text-foreground prose-code:rounded prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:text-primary-deep"
                  dangerouslySetInnerHTML={{ __html: activeMaterial.content }}
                />
              </div>

              {/* Navigation */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                  disabled={activeIdx === 0}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" /> Sebelumnya
                </button>
                <button
                  onClick={() => setActiveIdx(Math.min(materials.length - 1, activeIdx + 1))}
                  disabled={activeIdx === materials.length - 1}
                  className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:opacity-95 disabled:opacity-40"
                >
                  Selanjutnya <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ) : null}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
