import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layers, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@nexora.id" && password === "nexora123") {
      sessionStorage.setItem("admin_auth", "true");
      navigate({ to: "/admin" });
    } else {
      setError("Email atau Password salah!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary-deep">Nexora Login</h1>
          <p className="mt-2 text-muted-foreground">Masuk untuk mengelola platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-3xl bg-white p-8 shadow-card border border-border">
          {error && <div className="text-red-500 text-xs text-center font-bold">{error}</div>}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Email</label>
            <input 
              type="email" 
              required
              className="w-full rounded-xl border border-border p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={email}
              autoComplete="email"
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Password</label>
            <input 
              type="password" 
              required
              className="w-full rounded-xl border border-border p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={password}
              autoComplete="current-password"
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-transform active:scale-95">
            Masuk Sekarang
          </button>
        </form>
      </div>
    </div>
  );
}
