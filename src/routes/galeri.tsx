import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchGallery, fetchCategories } from "@/hooks/use-supabase";
import { Camera, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/galeri")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { throw redirect({ to: "/masuk" }); }
  },
  loader: async () => {
    const [gallery, categories] = await Promise.all([fetchGallery(), fetchCategories()]);
    return { gallery, categories };
  },
  head: () => ({
    meta: [
      { title: "Galeri Kegiatan — Belajar Bareng Nexora" },
      { name: "description", content: "Dokumentasi kegiatan dan momen seru di Nexora." },
    ],
  }),
  component: GaleriPage,
});

function GaleriPage() {
  const { gallery, categories } = Route.useLoaderData();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (activeFilter === "all") return gallery;
    if (activeFilter === "lainnya") return gallery.filter((i: any) => !i.category_id);
    return gallery.filter((i: any) => i.category_id === activeFilter);
  }, [gallery, activeFilter]);

  // Build highlight circles from categories that have gallery items
  const divisionCounts = useMemo(() => {
    const map: Record<string, number> = {};
    gallery.forEach((i: any) => { if (i.category_id) map[i.category_id] = (map[i.category_id] || 0) + 1; });
    return map;
  }, [gallery]);

  const highlights = [
    { id: "all", name: "Semua", color: "from-slate-400 to-slate-600" },
    ...categories.filter((c: any) => divisionCounts[c.id]).map((c: any, i: number) => {
      const colors = [
        "from-purple-500 to-pink-500", "from-blue-500 to-cyan-500",
        "from-green-500 to-emerald-500", "from-orange-500 to-yellow-500",
        "from-rose-500 to-red-500", "from-indigo-500 to-violet-500",
      ];
      return { id: c.id, name: c.name, color: colors[i % colors.length] };
    }),
    ...(gallery.some((i: any) => !i.category_id) ? [{ id: "lainnya", name: "Lainnya", color: "from-gray-500 to-gray-700" }] : []),
  ];

  const formatDescription = (text: string) => {
    if (!text) return null;
    return text.split(/(#[a-zA-Z0-9_]+)/g).map((part, i) =>
      part.startsWith('#') ? <span key={i} className="text-blue-600 dark:text-blue-400 font-medium">{part}</span> : part
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background pb-20 sm:pb-0">
      <SiteHeader />

      {/* ═══ Header Section ═══ */}
      <section className="bg-white dark:bg-card border-b border-border/50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 sm:px-6 flex items-center gap-4 sm:gap-8">
          <div className="flex h-20 w-20 sm:h-32 sm:w-32 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-1">
            <div className="flex h-full w-full items-center justify-center rounded-full border-2 sm:border-4 border-white bg-slate-100 dark:border-card dark:bg-secondary">
               <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">nexora_course</h1>
            <div className="mt-3 flex gap-6 text-sm sm:text-base">
              <div className="flex gap-1.5"><span className="font-bold">{gallery.length}</span> <span className="text-muted-foreground">postingan</span></div>
            </div>
            <div className="mt-3">
               <p className="text-sm font-bold text-foreground">Belajar Bareng Nexora</p>
               <p className="mt-0.5 text-sm text-foreground line-clamp-2 sm:line-clamp-none">
                  Momen seru dan dokumentasi kegiatan belajar bersama. <br />
                  <span className="text-blue-600">#BelajarBarengNexora</span>
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Instagram Highlights (Filter per Divisi) ═══ */}
      <section className="bg-white dark:bg-card border-b border-border/50">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {highlights.map((h) => (
              <button
                key={h.id}
                onClick={() => setActiveFilter(h.id)}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <div className={`flex h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] items-center justify-center rounded-full p-0.5 transition-all ${
                  activeFilter === h.id
                    ? `bg-gradient-to-br ${h.color} ring-2 ring-offset-2 ring-primary/30`
                    : "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700"
                }`}>
                  <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white dark:border-card bg-slate-100 dark:bg-secondary overflow-hidden">
                    {h.id === "all" ? (
                      <Camera className="h-5 w-5 text-muted-foreground" />
                    ) : h.id === "lainnya" ? (
                      <span className="text-xs font-bold text-muted-foreground">+</span>
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground text-center leading-tight px-1">{h.name.slice(0, 6)}</span>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-medium max-w-[4.5rem] text-center truncate ${
                  activeFilter === h.id ? "font-bold text-foreground" : "text-muted-foreground"
                }`}>
                  {h.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Grid Section ═══ */}
      <section className="mx-auto w-full max-w-4xl sm:px-4 py-1 sm:py-8 flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-border mb-4">
              <Camera className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Belum Ada Postingan</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {activeFilter !== "all" ? "Belum ada foto untuk divisi ini." : "Koleksi foto galeri akan muncul di sini."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-4">
            {filtered.map((item: any) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative aspect-square w-full overflow-hidden bg-slate-200 dark:bg-secondary cursor-pointer sm:rounded-xl"
              >
                <img src={item.image_url} alt={item.title} loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                {item.division_name && (
                  <span className="absolute left-1.5 bottom-1.5 sm:left-2 sm:bottom-2 rounded-full bg-black/50 px-2 py-0.5 text-[8px] sm:text-[10px] font-bold text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.division_name}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ═══ Modal/Dialog ═══ */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 animate-fade-in" onClick={() => setSelectedItem(null)}>
          <button onClick={() => setSelectedItem(null)}
            className="absolute right-4 top-4 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors z-[110]">
            <X className="h-8 w-8" />
          </button>
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col lg:flex-row overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-card shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="relative flex items-center justify-center bg-black lg:w-3/5 lg:shrink-0 max-h-[50vh] lg:max-h-[90vh]">
              <img src={selectedItem.image_url} alt={selectedItem.title} className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-card h-[40vh] lg:h-[90vh]">
              <div className="flex items-center gap-3 border-b border-border p-3 sm:p-4 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                  <div className="h-full w-full rounded-full bg-white dark:bg-card flex items-center justify-center">
                    <Camera className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <span className="font-bold text-sm text-foreground">nexora_course</span>
                  {selectedItem.division_name && (
                    <span className="ml-2 text-[10px] rounded-full bg-primary/10 text-primary px-2 py-0.5 font-bold">{selectedItem.division_name}</span>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-secondary">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-sm text-foreground">
                    <span className="font-bold mr-2">nexora_course</span>
                    <span className="whitespace-pre-wrap leading-relaxed">
                      <span className="font-bold block mt-1 mb-1">{selectedItem.title}</span>
                      {formatDescription(selectedItem.description)}
                    </span>
                    <span className="mt-4 block text-[10px] sm:text-xs text-muted-foreground uppercase">
                      {new Date(selectedItem.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
