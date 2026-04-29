import { Link } from "@tanstack/react-router";
import { GraduationCap, Github, Instagram, Youtube, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/60 bg-primary-deep text-primary-foreground/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-bold text-primary-foreground leading-tight">
                  Belajar Bareng
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/60 leading-tight">
                  Nexora
                </span>
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/60">
              Platform belajar tech online untuk semua. Mulai belajar dari mana saja, kapan saja.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-primary-foreground">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="transition-colors hover:text-primary-foreground">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/jadwal" className="transition-colors hover:text-primary-foreground">
                  Jadwal Kelas
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-primary-foreground">Kategori</h4>
            <ul className="space-y-2 text-sm">
              {["Front End", "Back End", "Mobile Dev", "UI/UX", "DevOps"].map((cat) => (
                <li key={cat}>
                  <Link
                    to="/kategori/$slug"
                    params={{ slug: cat.toLowerCase().replace(/[/ ]+/g, "-") }}
                    className="transition-colors hover:text-primary-foreground"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-primary-foreground">Ikuti Kami</h4>
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "YouTube" },
                { icon: Github, label: "GitHub" },
                { icon: Mail, label: "Email" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-foreground/10 text-primary-foreground/60 transition-all duration-200 hover:bg-primary-foreground/20 hover:text-primary-foreground"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} Belajar Bareng Nexora. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
