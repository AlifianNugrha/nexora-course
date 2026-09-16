import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { UserCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/lengkapi-profil")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/masuk" });
  },
  component: LengkapiProfilPage,
});

function LengkapiProfilPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "",
    email: user?.email || "",
    phone: (profile as any)?.phone || "",
    class_name: (profile as any)?.class_name || "",
  });

  const isComplete = 
    (form.full_name || "").trim().length >= 2 && 
    (form.phone || "").trim().length >= 8 &&
    (form.class_name || "").length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || !user) return;
    setSaving(true);

    try {
      const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        class_name: form.class_name,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

      if (error) throw error;

      await refreshProfile();
      navigate({ to: "/" });
    } catch (err: any) {
      console.error(err);
      alert(`Gagal menyimpan profil: ${err.message || "Coba lagi."}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background">
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-card">
                <UserCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Lengkapi Profil</h1>
            <p className="mt-2 text-sm text-muted-foreground">Isi data berikut agar bisa mengakses kelas dan materi.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-8 shadow-2xl dark:bg-card border border-border/50">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Nama Lengkap</label>
              <input required minLength={2} className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-secondary"
                value={form.full_name} placeholder="Nama lengkap kamu"
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">No. HP / WhatsApp</label>
              <input required minLength={8} inputMode="tel" className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-secondary"
                value={form.phone} placeholder="08xxxxxxxxxx"
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Pilih Kelas</label>
              <select 
                required 
                className="w-full rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-secondary"
                value={form.class_name}
                onChange={e => setForm(p => ({ ...p, class_name: e.target.value }))}
              >
                <option value="">-- Pilih Kelas --</option>
                <option value="TIA2">TIA2</option>
                <option value="TIA4">TIA4</option>
                <option value="TIA6">TIA6</option>
                <option value="TIC2">TIC2</option>
                <option value="TIC4">TIC4</option>
                <option value="TIC6">TIC6</option>
              </select>
            </div>

            <button type="submit" disabled={saving || !isComplete}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : "Simpan & Mulai Belajar"}
            </button>
          </form>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
