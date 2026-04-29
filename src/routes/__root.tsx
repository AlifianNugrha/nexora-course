import { Outlet, Link, createRootRoute, useMatch } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-md shadow-primary/20"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: "Belajar Bareng Nexora — Platform Belajar Online" },
      { name: "description", content: "Belajar Bareng Nexora — Platform belajar tech online untuk semua." },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <div className="pb-[calc(4rem+env(safe-area-inset-bottom,1rem))] sm:pb-0">
      <Outlet />
      <BottomNav />
    </div>
  );
}
