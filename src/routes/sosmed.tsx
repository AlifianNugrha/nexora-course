import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram, ArrowLeft, Heart, Users, MessageCircle, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/sosmed")({
  head: () => ({
    meta: [
      { title: "Sosial Media — Nexora Pengembangan IT" },
      { name: "description", content: "Ikuti perkembangan teknologi dan info kelas terbaru di Instagram Nexora." },
    ],
  }),
  component: SosmedPage,
});

function SosmedPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background">
      <SiteHeader />

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <section className="relative overflow-hidden bg-[image:var(--gradient-hero)] py-20">
          <div className="noise absolute inset-0" />
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-4xl font-extrabold text-primary-deep sm:text-5xl">Hubungi Kami</h1>
            <p className="mt-4 text-lg text-muted-foreground">Ikuti perjalanan kami di sosial media.</p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl px-4 py-16">
          <div className="overflow-hidden rounded-3xl border border-border/50 bg-card p-8 shadow-card text-center">
             <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 text-white shadow-lg">
                <Instagram className="h-10 w-10" />
             </div>
             <h2 className="text-2xl font-bold text-foreground">Nexora Community</h2>
             <p className="mt-2 text-muted-foreground">Sharing knowledge seputar programming, UI/UX, dan teknologi terbaru setiap harinya.</p>
             
             <div className="mt-10 grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-secondary/30 p-4">
                   <p className="text-xl font-bold text-primary">10k+</p>
                   <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="rounded-2xl bg-secondary/30 p-4">
                   <p className="text-xl font-bold text-primary">500+</p>
                   <p className="text-xs text-muted-foreground">Posts</p>
                </div>
                <div className="rounded-2xl bg-secondary/30 p-4">
                   <p className="text-xl font-bold text-primary">High</p>
                   <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
             </div>

             <a 
               href="https://instagram.com/nexora.id" 
               target="_blank" 
               rel="noopener noreferrer"
               className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-glow active:scale-95"
             >
               Visit Instagram <ExternalLink className="h-5 w-5" />
             </a>
          </div>
        </section>
        <SiteFooter />
      </div>

      {/* Mobile Layout (DANA Style) */}
      <div className="flex flex-1 flex-col pb-20 lg:hidden">
        {/* Sticky Top Nav */}
        <div className="sticky top-0 z-40 flex items-center gap-3 bg-white/80 px-4 py-3 backdrop-blur-md dark:bg-card/80 shadow-sm">
          <Link to="/" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-secondary/50">
             <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <span className="text-sm font-bold text-foreground">Sosial Media</span>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 px-4 py-8 shadow-sm">
           <div className="mx-auto max-w-3xl text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md ring-1 ring-white/30">
                 <Instagram className="h-8 w-8" />
              </div>
              <h1 className="text-xl font-extrabold drop-shadow-sm">Nexora Community</h1>
              <p className="mt-1 text-xs font-medium text-white/80">Instagram Pengembangan IT</p>
           </div>
        </section>

        {/* Content Card */}
        <section className="mt-2 bg-white px-4 py-6 shadow-sm dark:bg-card">
           <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-border/50 bg-slate-50 p-5 dark:bg-secondary/10">
                 <h2 className="text-sm font-bold text-foreground">Tentang Instagram Kami</h2>
                 <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Instagram **Nexora Pengembangan IT** adalah wadah belajar gratis bagi kamu yang ingin update seputar dunia coding, desain, dan karir di bidang teknologi.
                 </p>
                 <div className="mt-4 flex items-center gap-4 border-t border-border/50 pt-4">
                    <div className="flex flex-col items-center">
                       <Heart className="h-4 w-4 text-pink-500" />
                       <span className="mt-1 text-[10px] font-bold">Inspiratif</span>
                    </div>
                    <div className="flex flex-col items-center">
                       <Users className="h-4 w-4 text-blue-500" />
                       <span className="mt-1 text-[10px] font-bold">Komunitas</span>
                    </div>
                    <div className="flex flex-col items-center">
                       <MessageCircle className="h-4 w-4 text-green-500" />
                       <span className="mt-1 text-[10px] font-bold">Diskusi</span>
                    </div>
                 </div>
              </div>

              <div className="mt-6">
                 <h2 className="mb-4 text-sm font-bold text-foreground">Tautan Cepat</h2>
                 <a 
                   href="https://instagram.com/nexora.id" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center justify-between rounded-xl border border-border/50 bg-white p-4 shadow-sm transition-all active:scale-95 dark:bg-card"
                 >
                    <div className="flex items-center gap-3">
                       <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-600 dark:bg-pink-900/20">
                          <Instagram className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-foreground">Buka Instagram</p>
                          <p className="text-[10px] text-muted-foreground">@nexora.community</p>
                       </div>
                    </div>
                    <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                 </a>
              </div>
           </div>
        </section>

        {/* CTA Footer */}
        <section className="mt-2 flex-1 bg-white px-4 py-8 text-center dark:bg-card">
           <div className="mx-auto max-w-3xl">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Terhubung Sekarang</p>
              <h2 className="mt-2 text-lg font-bold text-foreground">Mari Belajar Bareng!</h2>
              <p className="mt-2 text-xs text-muted-foreground px-10">Jangan lewatkan info giveaway, webinar gratis, dan diskon kelas khusus followers.</p>
              
              <a 
                href="https://instagram.com/nexora.community" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-purple-500/20 active:scale-95"
              >
                Ikuti @nexora.community <Instagram className="h-4 w-4" />
              </a>
           </div>
        </section>
      </div>
    </div>
  );
}
