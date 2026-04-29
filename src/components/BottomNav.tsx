import { Link } from "@tanstack/react-router";
import { Home, Grid, Calendar, MessageCircle } from "lucide-react";

const navItems = [
  { to: "/jadwal", label: "Jadwal", icon: Calendar, exact: false },
  { to: "/", label: "Beranda", icon: Home, exact: true },
  { to: "/sosmed", label: "Sosmed", icon: MessageCircle, exact: false },
];

export function BottomNav() {
  return (
    <>
      <svg width="0" height="0" className="absolute">
        <linearGradient id="nav-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" /> {/* purple-600 */}
          <stop offset="50%" stopColor="#ec4899" /> {/* pink-500 */}
          <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
        </linearGradient>
      </svg>
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border/50 bg-white/90 pb-safe pt-2 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] backdrop-blur-lg sm:hidden">
        <nav className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            if (item.external || item.to.includes("#")) {
              return (
                <a
                  key={item.label}
                  href={item.to}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="group flex flex-col items-center justify-center gap-1 w-16 text-muted-foreground transition-colors hover:text-primary"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full transition-all group-hover:bg-primary/5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </a>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="group relative flex flex-col items-center justify-center w-16"
              >
                {({ isActive }) => (
                  <div className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${isActive ? "-mt-8" : ""}`}>
                    <div
                      className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                        isActive 
                          ? "h-14 w-14 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 ring-4 ring-white dark:ring-background" 
                          : "h-8 w-8 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                      }`}
                    >
                      <Icon className={`${isActive ? "h-7 w-7 text-white" : "h-5 w-5"} transition-all`} />
                    </div>
                    <span 
                      className={`text-[10px] font-bold transition-all ${
                        isActive 
                          ? "bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent font-extrabold" 
                          : "text-muted-foreground group-hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
