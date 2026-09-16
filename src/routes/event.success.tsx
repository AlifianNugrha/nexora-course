import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/event/success")({
  component: EventSuccess,
});

function EventSuccess() {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background">
      <SiteHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-card border border-border/50 animate-slide-up">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          
          <h1 className="text-2xl font-extrabold text-foreground mb-3">
            Terima Kasih Sudah Mendaftar!
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Pendaftaran kamu untuk mengikuti event telah berhasil kami terima. Silakan tunggu pemberitahuan selanjutnya dan informasi link akses yang akan kami kirimkan melalui kontak/grup.
          </p>
          
          <Link 
            to="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
          >
            Kembali ke Beranda <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
