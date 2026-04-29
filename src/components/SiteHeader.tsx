import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

const navItems = [
  { to: "/", label: "Beranda", exact: true },
  { to: "/jadwal", label: "Jadwal", exact: false },
] as const;

export function SiteHeader() {
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

        {/* Desktop Nav (Hidden on Mobile) */}
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
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
