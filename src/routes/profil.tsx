import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/lib/supabase";
import { Settings, Award, BookOpen, X, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/profil")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/masuk" });
    }
  },
  component: ProfilPage,
});

function ProfilPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"kelas" | "sertifikat">("kelas");
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (user) {
      setNewName(user.user_metadata?.full_name || "");
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    setLoadingCourses(true);
    const courseIds = user?.user_metadata?.enrolled_courses || [];
    
    if (courseIds.length === 0) {
      setEnrolledCourses([]);
      setLoadingCourses(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds);
        
      if (!error && data) {
        setEnrolledCourses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      await supabase.auth.updateUser({
        data: { full_name: newName.trim() }
      });
      // Force reload to update user context
      window.location.reload();
    } catch (err) {
      console.error("Error updating profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background pb-20 sm:pb-0">
      <SiteHeader />
      
      {/* ═══ Header Profil (Instagram Style) ═══ */}
      <section className="bg-white dark:bg-card border-b border-border/50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 sm:px-6 flex items-center gap-4 sm:gap-8">
          <div className="flex h-20 w-20 sm:h-32 sm:w-32 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-1">
            <img 
              src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}`}
              className="h-full w-full rounded-full border-2 sm:border-4 border-white object-cover dark:border-card bg-slate-100 dark:bg-secondary"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-4">
               <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{user?.user_metadata?.full_name?.replace(/\s+/g, '_').toLowerCase() || "pelajar_nexora"}</h1>
               <button onClick={() => setIsEditing(true)} className="hidden sm:flex items-center gap-2 rounded-lg bg-secondary px-4 py-1.5 text-sm font-bold text-foreground hover:bg-secondary/80">
                 Edit Profil
               </button>
               <button onClick={signOut} className="hidden sm:flex items-center justify-center rounded-lg bg-secondary p-1.5 text-foreground hover:bg-red-100 hover:text-red-600">
                 Keluar
               </button>
            </div>
            
            <div className="mt-3 hidden sm:flex gap-6 text-base">
              <div className="flex gap-1.5"><span className="font-bold">{enrolledCourses.length}</span> <span className="text-muted-foreground">kelas diikuti</span></div>
              <div className="flex gap-1.5"><span className="font-bold">0</span> <span className="text-muted-foreground">sertifikat</span></div>
            </div>
            
            <div className="mt-3">
               <p className="text-sm font-bold text-foreground">{user?.user_metadata?.full_name || "Pelajar Nexora"}</p>
               <p className="mt-0.5 text-sm text-foreground line-clamp-2 sm:line-clamp-none">
                  Pelajar Aktif di Nexora Course. <br />
                  Terus belajar dan berkembang. <br />
               </p>
            </div>
            
            <div className="mt-4 flex sm:hidden gap-2">
               <button onClick={() => setIsEditing(true)} className="flex-1 rounded-lg bg-secondary px-4 py-1.5 text-sm font-bold text-foreground hover:bg-secondary/80">
                 Edit Profil
               </button>
               <button onClick={signOut} className="flex-1 rounded-lg bg-red-100 text-red-600 px-4 py-1.5 text-sm font-bold hover:bg-red-200">
                 Keluar
               </button>
            </div>
          </div>
        </div>
        
        <div className="flex sm:hidden justify-around border-t border-border/50 py-3 mt-4 text-sm">
            <div className="flex flex-col items-center"><span className="font-bold">{enrolledCourses.length}</span> <span className="text-muted-foreground text-[10px]">kelas diikuti</span></div>
            <div className="flex flex-col items-center"><span className="font-bold">0</span> <span className="text-muted-foreground text-[10px]">sertifikat</span></div>
        </div>
      </section>

      {/* ═══ Tab Navigasi ═══ */}
      <section className="mx-auto w-full max-w-4xl border-t border-border/50 bg-white sm:bg-transparent sm:border-0 dark:bg-card">
        <div className="flex justify-center gap-12 sm:border-t border-border/50">
          <button 
            onClick={() => setActiveTab("kelas")}
            className={`flex items-center gap-2 border-t-2 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "kelas" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}
          >
            <BookOpen className="h-4 w-4" /> Kelas Saya
          </button>
          <button 
            onClick={() => setActiveTab("sertifikat")}
            className={`flex items-center gap-2 border-t-2 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === "sertifikat" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}
          >
            <Award className="h-4 w-4" /> Sertifikat
          </button>
        </div>
      </section>

      {/* ═══ Grid Section ═══ */}
      <section className="mx-auto w-full max-w-4xl sm:px-4 py-6 sm:py-8 flex-1">
        {loadingCourses ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeTab === "kelas" ? (
          enrolledCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-border mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Belum ada kelas</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-6">Kamu belum mengikuti kelas apapun.</p>
              <Link to="/" className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white">Cari Kelas</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 sm:px-0">
              {enrolledCourses.map((course) => (
                <Link
                  key={course.id}
                  to="/course/$courseId"
                  params={{ courseId: course.id }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-soft hover:shadow-card transition-all"
                >
                  <div className="aspect-video w-full overflow-hidden bg-secondary">
                    <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">{course.category}</span>
                    <h3 className="font-bold text-foreground line-clamp-2 mb-2">{course.title}</h3>
                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
                      <span>{course.lessons} Sesi</span>
                      <span className="flex items-center gap-1 text-primary font-bold">Lanjut <ArrowRight className="h-3 w-3" /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-border mb-4">
              <Award className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Belum ada sertifikat</h2>
            <p className="text-sm text-muted-foreground mt-2">Selesaikan kelas untuk mendapatkan sertifikat.</p>
          </div>
        )}
      </section>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Edit Profil</h2>
              <button onClick={() => setIsEditing(false)} className="rounded-full p-1 hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving || !newName.trim()}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-soft transition-opacity disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
