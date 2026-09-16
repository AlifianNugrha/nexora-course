import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layers, Lock, Loader2, Mail, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError("Email atau Password salah!");
        setLoading(false);
        return;
      }

      // Check if user has admin or mentor role
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        setError("Profil tidak ditemukan. Hubungi Super Admin.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (profile.role !== "super_admin" && profile.role !== "mentor") {
        setError("Akun ini tidak memiliki akses admin.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Store role in sessionStorage for quick access
      sessionStorage.setItem("admin_auth", "true");
      sessionStorage.setItem("admin_role", profile.role);
      navigate({ to: "/admin" });
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary-deep">Nexora Admin</h1>
          <p className="mt-2 text-muted-foreground">Masuk untuk mengelola platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-3xl bg-white p-8 shadow-card border border-border">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-600 text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="email" 
                required
                className="w-full rounded-xl border border-border p-3 pl-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={email}
                autoComplete="email"
                placeholder="admin@nexora.id"
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input 
                type={showPassword ? "text" : "password"}
                required
                className="w-full rounded-xl border border-border p-3 pl-10 pr-12 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={password}
                autoComplete="current-password"
                placeholder="••••••••"
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
