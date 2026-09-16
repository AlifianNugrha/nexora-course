import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, MapPin, Share2, Users, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EventForm } from "@/components/EventForm";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { checkRegistration } from "@/hooks/use-supabase";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/event/$eventId")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/masuk" });
    }
  },
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", params.eventId)
      .single();
    if (error) throw error;
    return { event: data };
  },
  component: EventDetail,
});

function EventDetail() {
  const { event } = Route.useLoaderData();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (user?.email) {
        // If logged in, ONLY trust the database (check by email OR user_id)
        const registered = await checkRegistration(user.email, event.title, user.id);
        setIsRegistered(registered);
      } else {
        // If guest, use localStorage
        const localData = JSON.parse(localStorage.getItem("registered_events") || "[]");
        setIsRegistered(localData.includes(event.title));
      }
    };
    
    checkStatus();
  }, [event.title, user?.email]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background">
      <SiteHeader />
      
      <main className="flex-1 pb-24">
        {/* Hero Image */}
        <div className="relative h-64 sm:h-96 w-full overflow-hidden bg-slate-100">
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="h-full w-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
            <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/40 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 -mt-16 sm:-mt-24 relative z-10">
          <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-2xl dark:bg-card border border-border/50">
            
            {/* Status / Tags */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wider">
                Event Resmi
              </span>
              {event.is_closed && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600 uppercase tracking-wider">
                  Pendaftaran Ditutup
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-6 leading-tight">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 border-y border-border py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-secondary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Tanggal Pelaksanaan</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-secondary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Lokasi / Platform</p>
                  <p className="text-sm font-semibold text-foreground">{event.location || "Online"}</p>
                </div>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3 className="text-lg font-bold">Tentang Event Ini</h3>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground mt-4">
                {event.description}
              </p>
            </div>

            {/* Action Button inside card */}
            <div className="mt-10 border-t border-border pt-8 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="text-center sm:text-left w-full sm:w-auto mb-4 sm:mb-0">
                <p className="text-sm font-bold text-foreground">Tertarik ikut event ini?</p>
                <p className="text-xs text-muted-foreground">Daftar sekarang, gratis!</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-border text-muted-foreground hover:bg-slate-50 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setIsFormOpen(true)}
                  disabled={event.is_closed || isRegistered}
                  className={`flex-1 sm:flex-none rounded-2xl px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                    isRegistered ? "bg-green-500 shadow-green-500/20" : "bg-primary"
                  }`}
                >
                  {event.is_closed 
                    ? "Pendaftaran Ditutup" 
                    : isRegistered 
                      ? "Anda Sudah Terdaftar" 
                      : "Ikuti Event Sekarang"}
                </button>
              </div>
            </div>
            {isRegistered && (
              <p className="mt-4 text-center sm:text-left text-xs font-bold text-green-600 flex items-center justify-center sm:justify-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Kamu sudah terdaftar di event ini. Sampai jumpa di lokasi!
              </p>
            )}
          </div>
        </div>
      </main>

      <EventForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        eventTitle={event.title}
        eventId={event.id}
      />
      <SiteFooter />
    </div>
  );
}
