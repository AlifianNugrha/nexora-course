import { Link } from "@tanstack/react-router";
import { GraduationCap, LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { checkNewSchedules } from "@/hooks/use-supabase";

const navItems = [
  { to: "/", label: "Beranda", exact: true },
  { to: "/jadwal", label: "Jadwal", exact: false },
] as const;

export function SiteHeader() {
  const { user, signOut, loading } = useAuth();
  const [hasNewSchedule, setHasNewSchedule] = useState(false);

  useEffect(() => {
    const check = async () => {
      const isNew = await checkNewSchedules();
      setHasNewSchedule(isNew);
    };
    check();

    const handleSeen = () => setHasNewSchedule(false);
    window.addEventListener("schedules_seen", handleSeen);
    return () => window.removeEventListener("schedules_seen", handleSeen);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-strong">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform duration-300 group-hover:scale-110">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-primary-deep leading-tight">
              Belajar Bareng
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/80 leading-tight">
              Nexora
            </span>
          </div>
        </Link>

        {/* Navigation & Profile */}
        <div className="flex items-center gap-6">
          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                activeProps={{
                  className: "bg-primary/10 text-primary-deep",
                }}
                inactiveProps={{
                  className: "text-muted-foreground hover:text-primary-deep hover:bg-primary/5",
                }}
                className="relative rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200"
              >
                {item.label}
                {item.to === "/jadwal" && hasNewSchedule && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* User Auth Section */}
          {!loading && (
            <div className="flex items-center gap-3 sm:border-l border-border/50 sm:pl-6">
              {user ? (
                <div className="group relative flex flex-col items-end">
                  <Link to="/profil" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="hidden text-sm font-bold text-foreground sm:block text-right">
                      {user.user_metadata?.full_name || "Pelajar Nexora"}
                    </span>
                    <img 
                      src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} 
                      alt="Avatar" 
                      className="h-9 w-9 rounded-full border-2 border-primary/20 bg-primary/10 object-cover"
                    />
                  </Link>
                  {/* Dropdown Logout */}
                  <div className="absolute right-0 top-full mt-2 hidden w-48 flex-col rounded-2xl border border-border bg-white p-2 shadow-xl group-hover:flex">
                    <button 
                      onClick={() => signOut()}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <Link 
                  to="/masuk" 
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 sm:px-5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Masuk</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
