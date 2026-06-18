import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/lib/supabase";
import {
  Settings, Award, BookOpen, X, Loader2, ArrowRight,
  History, Trophy, ShieldAlert, Sparkles, Star, Lock, CheckCircle, Check
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAttemptsByUser, fetchUserBadges,
  updateUserProfile
} from "@/hooks/use-supabase";

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
  const { user, signOut, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"kelas" | "sertifikat" | "ujian" | "badges">("kelas");
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Ujian & Badges states
  const [attempts, setAttempts] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [loadingBadges, setLoadingBadges] = useState(true);

  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState<any>(null);

  // 1. Load data once when user is loaded
  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
      loadExamAndBadgeData();
    }
  }, [user]);

  // 2. Initialize and sync form inputs when profile loads, updates, or modal opens
  useEffect(() => {
    if (user) {
      setNewName(profile?.full_name || user.user_metadata?.full_name || "");
      setSelectedTitle(profile?.active_title || null);
    }
  }, [user, profile?.active_title, profile?.full_name, isEditing]);

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

  const loadExamAndBadgeData = async () => {
    if (!user) return;
    try {
      setLoadingAttempts(true);
      const attData = await fetchAttemptsByUser(user.id);
      setAttempts(attData);
    } catch (err) {
      console.error("Error loading attempts:", err);
    } finally {
      setLoadingAttempts(false);
    }

    try {
      setLoadingBadges(true);
      const userB = await fetchUserBadges(user.id);
      setUserBadges(userB);
    } catch (err) {
      console.error("Error loading badges:", err);
    } finally {
      setLoadingBadges(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!newName.trim() || !user) return;
    setIsSaving(true);
    try {
      // 1. Update full name in auth metadata (best effort, don't block on error)
      await supabase.auth.updateUser({ data: { full_name: newName.trim() } })
        .catch(e => console.warn("Auth metadata update:", e.message));

      // 2. Try plain UPDATE first (row must exist — created by signup trigger)
      const { error: updateError, data: updatedRows } = await supabase
        .from("user_profiles")
        .update({
          full_name: newName.trim(),
          active_title: selectedTitle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select("id");

      if (updateError) {
        // Show exact Supabase error message so we can diagnose
        console.error("Profile UPDATE error:", updateError);
        alert(`Gagal simpan: [${updateError.code}] ${updateError.message}\n\nPastikan sudah jalankan supabase_fix_profile_rls.sql di Supabase SQL Editor!`);
        setIsSaving(false);
        return;
      }

      // 3. If no row was found → create it with all required defaults
      if (!updatedRows || updatedRows.length === 0) {
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            id: user.id,
            full_name: newName.trim(),
            active_title: selectedTitle,
            email: user.email,
            role: "user",
            is_verified: false,
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Profile INSERT error:", insertError);
          alert(`Gagal membuat profil: [${insertError.code}] ${insertError.message}`);
          setIsSaving(false);
          return;
        }
      }

      // 4. Refresh context & close modal
      await refreshProfile();
      setIsEditing(false);
      loadExamAndBadgeData();
    } catch (err: any) {
      console.error("Profile save exception:", err);
      alert(`Error: ${err?.message ?? JSON.stringify(err)}`);
    } finally {
      setIsSaving(false);
    }
  };


  // Check if user has earned a specific badge
  const isBadgeEarned = (badgeId: string) => {
    return userBadges.some(ub => ub.badge_id === badgeId);
  };

  // Get earned badge info for presentation
  const getEarnedBadgeInfo = (badgeId: string) => {
    return userBadges.find(ub => ub.badge_id === badgeId);
  };

  // ── Derived: active badge object based on current title
  const activeBadge = userBadges.find(ub => ub.badges?.name === profile?.active_title)?.badges || null;

  // ── Color map: keyed by admin-selected color template (badge.color field)
  const COLOR_MAP: Record<string, { gradient: string; frame: { label: string; cls: string } }> = {
    violet:  { gradient: 'from-violet-500 via-purple-500 to-pink-500',    frame: { label: 'Obsidian Frame', cls: 'text-purple-600 bg-purple-50 border-purple-200' } },
    cyan:    { gradient: 'from-cyan-300 via-blue-400 to-indigo-500',       frame: { label: 'Sapphire Frame', cls: 'text-blue-600 bg-blue-50 border-blue-200' } },
    gold:    { gradient: 'from-yellow-300 via-amber-400 to-orange-500',    frame: { label: 'Sunset Gold Frame', cls: 'text-amber-600 bg-amber-50 border-amber-200' } },
    emerald: { gradient: 'from-emerald-400 via-teal-500 to-cyan-500',      frame: { label: 'Emerald Frame', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' } },
    rose:    { gradient: 'from-rose-400 via-pink-500 to-red-500',          frame: { label: 'Ruby Frame', cls: 'text-rose-600 bg-rose-50 border-rose-200' } },
    indigo:  { gradient: 'from-indigo-400 via-purple-500 to-rose-500',     frame: { label: 'Cosmic Frame', cls: 'text-indigo-600 bg-indigo-50 border-indigo-200' } },
    amber:   { gradient: 'from-amber-200 via-yellow-400 to-orange-400',    frame: { label: 'Amber Frame', cls: 'text-yellow-600 bg-yellow-50 border-yellow-200' } },
    sky:     { gradient: 'from-sky-400 via-indigo-500 to-purple-600',      frame: { label: 'Deep Space Frame', cls: 'text-sky-600 bg-sky-50 border-sky-200' } },
  };

  // ── Get border gradient from badge.color key
  const getBorderGradient = (color?: string | null): string => {
    if (!color) return 'from-slate-200 via-slate-300 to-slate-100';
    return COLOR_MAP[color]?.gradient ?? COLOR_MAP.violet.gradient;
  };

  // ── Get frame label from badge.color key
  const getFrameLabel = (color?: string | null) => {
    if (!color) return null;
    return COLOR_MAP[color]?.frame ?? COLOR_MAP.violet.frame;
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background pb-20 sm:pb-0">
      <SiteHeader />

      {/* ═══ Header Profil (Instagram Style + Gamified Stats) ═══ */}
      <section className="bg-white dark:bg-card border-b border-border/50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 sm:px-6 flex items-center gap-4 sm:gap-8">
          {/* ── Profile Avatar with dynamic border frame ── */}
          <div className={`relative flex h-20 w-20 sm:h-32 sm:w-32 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${getBorderGradient(activeBadge?.color)} p-[3px] sm:p-1.5 shadow-lg transition-all duration-500`}>
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-slate-100 dark:bg-secondary">
              <img
                src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}`}
                className="h-full w-full object-cover"
              />
            </div>
            {/* Floating badge icon overlay */}
            {activeBadge && (
              <div className="absolute -bottom-1 -right-1 sm:bottom-0.5 sm:right-0.5 flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white shadow-md border-2 border-white text-sm sm:text-2xl leading-none select-none">
                {activeBadge.icon}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {(profile?.full_name || user?.user_metadata?.full_name || "pelajar_nexora").replace(/\s+/g, '_').toLowerCase()}
              </h1>

              {profile?.active_title && (
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] sm:text-xs font-black px-3 py-1 rounded-full border border-primary/20">
                    {activeBadge?.icon || '🏆'} {profile.active_title}
                  </span>
                  {activeBadge && (() => {
                    const frame = getFrameLabel(activeBadge.color);
                    return frame ? (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${frame.cls}`}>
                        ✦ {frame.label}
                      </span>
                    ) : null;
                  })()}
                </div>
              )}

              <div className="flex gap-2 ml-auto sm:ml-0">
                <button onClick={() => setIsEditing(true)} className="rounded-xl bg-secondary px-4 py-1.5 text-xs font-bold text-foreground hover:bg-secondary/80 transition-colors">
                  Edit Profil
                </button>
                <button onClick={signOut} className="rounded-xl bg-red-50 text-red-600 px-4 py-1.5 text-xs font-bold hover:bg-red-100 transition-colors">
                  Keluar
                </button>
              </div>
            </div>

            {/* Desktop Stats */}
            <div className="mt-4 hidden sm:flex gap-6 text-sm text-slate-700">
              <div className="flex gap-1"><span className="font-extrabold text-slate-900">{enrolledCourses.length}</span> <span className="text-muted-foreground">kelas diikuti</span></div>
              <div className="flex gap-1"><span className="font-extrabold text-slate-900">0</span> <span className="text-muted-foreground">sertifikat</span></div>
              <div className="flex gap-1"><span className="font-extrabold text-slate-900">{userBadges.length}</span> <span className="text-muted-foreground">badge diraih</span></div>
              <div className="flex gap-1"><span className="font-extrabold text-slate-900">{attempts.length}</span> <span className="text-muted-foreground">ujian dikerjakan</span></div>
            </div>

            <div className="mt-3">
              <p className="text-sm font-bold text-foreground">{profile?.full_name || user?.user_metadata?.full_name || "Pelajar Nexora"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed max-w-lg">
                Pelajar Aktif di Nexora Course. Terus belajar, selesaikan ujian, kumpulkan badge pencapaian, dan raih sertifikat kelulusan kelas!
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="flex sm:hidden justify-around border-t border-border/50 py-3 mt-2 text-center text-xs">
          <div className="flex flex-col"><span className="font-bold text-slate-800">{enrolledCourses.length}</span> <span className="text-muted-foreground text-[10px]">kelas</span></div>
          <div className="flex flex-col"><span className="font-bold text-slate-800">0</span> <span className="text-muted-foreground text-[10px]">sertifikat</span></div>
          <div className="flex flex-col"><span className="font-bold text-slate-800">{userBadges.length}</span> <span className="text-muted-foreground text-[10px]">badge</span></div>
          <div className="flex flex-col"><span className="font-bold text-slate-800">{attempts.length}</span> <span className="text-muted-foreground text-[10px]">ujian</span></div>
        </div>
      </section>

      {/* ═══ Tab Navigasi (Expanded tabs) ═══ */}
      <section className="mx-auto w-full max-w-4xl border-t border-border/50 bg-white sm:bg-transparent sm:border-0 dark:bg-card">
        <div className="flex justify-center gap-6 sm:gap-12 sm:border-t border-border/50">
          <button
            onClick={() => setActiveTab("kelas")}
            className={`flex items-center gap-1.5 border-t-2 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "kelas" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}
          >
            <BookOpen className="h-4 w-4" /> Kelas Saya
          </button>

          <button
            onClick={() => setActiveTab("ujian")}
            className={`flex items-center gap-1.5 border-t-2 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "ujian" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}
          >
            <History className="h-4 w-4" /> Riwayat Ujian
          </button>

          <button
            onClick={() => setActiveTab("badges")}
            className={`flex items-center gap-1.5 border-t-2 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "badges" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}
          >
            <Trophy className="h-4 w-4" /> Badge ({userBadges.length})
          </button>

          <button
            onClick={() => setActiveTab("sertifikat")}
            className={`flex items-center gap-1.5 border-t-2 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "sertifikat" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}
          >
            <Award className="h-4 w-4" /> Sertifikat
          </button>
        </div>
      </section>

      {/* ═══ Grid Section Renderer ═══ */}
      <section className="mx-auto w-full max-w-4xl sm:px-4 py-6 sm:py-8 flex-1">

        {/* KELAS TAB */}
        {activeTab === "kelas" && (
          loadingCourses ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : enrolledCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-border mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Belum ada kelas</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-6">Kamu belum mengikuti kelas apapun.</p>
              <Link to="/" className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20">Cari Kelas</Link>
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
        )}

        {/* RIWAYAT UJIAN TAB */}
        {activeTab === "ujian" && (
          loadingAttempts ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : attempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white rounded-3xl border">
              <History className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <h2 className="text-base font-bold text-slate-800">Belum Ada Riwayat Ujian</h2>
              <p className="text-xs text-muted-foreground mt-1 px-8 max-w-sm">
                Kamu belum pernah mengerjakan ujian. Buka kelas kamu untuk melihat daftar ujian kelulusan yang tersedia!
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border bg-white shadow-soft overflow-hidden mx-4 sm:mx-0">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-600">Judul Ujian</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-600">Skor</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-600">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-600">Waktu Tempuh</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-600">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-slate-700">
                  {attempts.map((att) => {
                    const passingScore = att.exams?.passing_score || 70;
                    const isPassed = att.score >= passingScore;
                    const durationMins = Math.floor((att.time_spent_seconds || 0) / 60);
                    const durationSecs = (att.time_spent_seconds || 0) % 60;
                    return (
                      <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{att.exams?.title || "Ujian Nexora"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{att.exams?.courses?.title || "Umum"}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-base">
                          {att.score}%
                        </td>
                        <td className="px-6 py-4">
                          {isPassed ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                              Lulus (KKM {passingScore}%)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                              Gagal (KKM {passingScore}%)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">
                          {durationMins > 0 ? `${durationMins}m ` : ""}{durationSecs}s
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {att.finished_at ? new Date(att.finished_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* BADGES SHOWCASE TAB */}
        {activeTab === "badges" && (
          loadingBadges ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : userBadges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white rounded-3xl border">
              <Trophy className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <h2 className="text-base font-bold text-slate-800">Belum Ada Badge Diraih</h2>
              <p className="text-xs text-muted-foreground mt-1 px-8 max-w-sm">
                Kamu belum memiliki badge pencapaian. Selesaikan ujian pilihan ganda dengan nilai di atas KKM untuk mendapatkan badge ujian!
              </p>
            </div>
          ) : (
            <div className="space-y-6 px-4 sm:px-0">
              <div className="bg-white border rounded-3xl p-6 shadow-soft">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-yellow-500" />
                  Koleksi Badge Pencapaian Kamu
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Selamat! Berikut adalah daftar badge ujian yang telah berhasil kamu dapatkan setelah lulus ujian. Gunakan nama badge sebagai title resmi profil kamu!
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {userBadges.map((ub) => {
                  const badge = ub.badges;
                  if (!badge) return null;
                  const isActive = profile?.active_title === badge.name;

                  return (
                    <button
                      key={ub.id}
                      onClick={() => setSelectedBadgeDetail(badge)}
                      className={`relative border rounded-3xl p-5 flex flex-col items-center text-center transition-all duration-300 bg-white hover:-translate-y-1 shadow-soft ${
                        isActive ? 'border-primary ring-2 ring-primary/20' : 'hover:border-slate-300'
                      }`}
                    >
                      <div className={`absolute top-3 right-3 rounded-full p-0.5 border ${
                        isActive ? 'bg-primary text-white border-primary' : 'bg-green-100 text-green-700 border-green-200'
                      }`}>
                        {isActive ? <Check className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                      </div>

                      {/* Gradient ring around badge icon */}
                      <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr ${getBorderGradient(badge.color)} p-[2.5px] mb-3 shadow-md`}>
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-3xl">
                          {badge.icon}
                        </div>
                      </div>

                      <span className="font-extrabold text-xs text-slate-800 leading-snug">{badge.name}</span>

                      {(() => {
                        const frame = getFrameLabel(badge.color);
                        return frame ? (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border mt-1 ${frame.cls}`}>
                            ✦ {frame.label}
                          </span>
                        ) : null;
                      })()}

                      {ub.earned_at && (
                        <span className="text-[9px] text-green-600 font-semibold mt-1">
                          Diraih {new Date(ub.earned_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* SERTIFIKAT TAB */}
        {activeTab === "sertifikat" && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-border mb-4">
              <Award className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Belum ada sertifikat</h2>
            <p className="text-sm text-muted-foreground mt-2">Selesaikan kelas untuk mendapatkan sertifikat kelulusan.</p>
          </div>
        )}
      </section>

      {/* ═══ Edit Profile Modal (Includes active title selector) ═══ */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-card">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h2 className="text-base font-bold text-slate-800">Edit Profil & Title</h2>
              <button onClick={() => setIsEditing(false)} className="rounded-full p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Nama Lengkap</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">Title &amp; Border Frame Profil</label>
                <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-0.5">
                  {/* No Title Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedTitle(null)}
                    className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                      !selectedTitle ? 'border-primary bg-primary/5' : 'border-border hover:border-slate-300'
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-xs text-white font-bold shadow-sm">—</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700">Tanpa Title</p>
                      <p className="text-[10px] text-slate-400">Border default Nexora</p>
                    </div>
                    {!selectedTitle && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>

                  {/* Badge title options */}
                  {userBadges.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-4 text-center text-[10px] text-muted-foreground">
                      Belum ada badge terbuka. Selesaikan ujian untuk unlock title!
                    </div>
                  ) : userBadges.map((ub) => {
                    const badge = ub.badges;
                    if (!badge) return null;
                    const isSelected = selectedTitle === badge.name;
                    const frame = getFrameLabel(badge.color);
                    return (
                      <button
                        key={ub.id}
                        type="button"
                        onClick={() => setSelectedTitle(badge.name)}
                        className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                          isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-slate-300'
                        }`}
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${getBorderGradient(badge.color)} text-base shadow-sm`}>
                          {badge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{badge.name}</p>
                          {frame && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${frame.cls}`}>
                              ✦ {frame.label}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground italic px-1">
                  Title &amp; border frame diperoleh dari badge yang berhasil kamu unlock setelah lulus ujian.
                </p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving || !newName.trim()}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Badge Detail Tooltip Modal ═══ */}
      {selectedBadgeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedBadgeDetail(null)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end -mr-2 -mt-2">
              <button onClick={() => setSelectedBadgeDetail(null)} className="rounded-full p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-6xl filter drop-shadow-md py-2">{selectedBadgeDetail.icon}</div>

            <h4 className="font-extrabold text-base text-slate-800">{selectedBadgeDetail.name}</h4>
            <p className="text-xs text-slate-600 leading-relaxed px-2">{selectedBadgeDetail.description}</p>

            {isBadgeEarned(selectedBadgeDetail.id) ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-3 text-xs font-bold flex items-center justify-center gap-1">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Kamu sudah membuka badge ini!
                </div>
                <button
                  onClick={async () => {
                    const isActive = profile?.active_title === selectedBadgeDetail.name;
                    const nextTitle = isActive ? null : selectedBadgeDetail.name;
                    try {
                      const { error } = await supabase
                        .from("user_profiles")
                        .update({ active_title: nextTitle, updated_at: new Date().toISOString() })
                        .eq("id", user?.id);
                      if (error) throw error;
                      await refreshProfile();
                      setSelectedBadgeDetail(null);
                    } catch (e: any) {
                      alert(`Gagal menerapkan frame: ${e.message}`);
                    }
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    profile?.active_title === selectedBadgeDetail.name
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20 shadow-md'
                  }`}
                >
                  {profile?.active_title === selectedBadgeDetail.name ? 'Lepas Frame & Title' : 'Gunakan Frame & Title ini'}
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl p-3 text-xs flex items-center justify-center gap-1">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                Selesaikan kriteria untuk membuka badge.
              </div>
            )}
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
