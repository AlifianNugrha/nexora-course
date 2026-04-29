import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/data/courses";

type Props = { category: Category; courseCount?: number };

export function CategoryCard({ category, courseCount }: Props) {
  const count = courseCount ?? 0;

  return (
    <Link
      to="/kategori/$slug"
      params={{ slug: category.slug }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-card-hover"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={category.thumbnail}
          alt={category.name}
          loading="lazy"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/80 via-primary-deep/20 to-transparent transition-opacity duration-300 group-hover:from-primary-deep/90" />

        {/* Badge floating */}
        <div className="absolute left-2 top-2 sm:left-4 sm:top-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-2 py-1 text-[9px] font-bold text-primary-deep shadow-soft backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-[11px]">
            {count} kelas
          </span>
        </div>

        {/* Title on image */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
          <h3 className="text-lg font-extrabold tracking-tight text-white drop-shadow-md sm:text-2xl">
            {category.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2.5 sm:p-5">
        <p className="text-xs font-semibold text-primary sm:text-sm">{category.tagline}</p>
        <p className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground sm:text-sm">
          {category.description}
        </p>
        <div className="mt-auto flex items-center gap-1 pt-2 text-[11px] font-bold text-primary-deep transition-colors group-hover:text-primary sm:gap-1.5 sm:pt-3 sm:text-sm">
          Jelajahi kelas
          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1.5 sm:h-4 sm:w-4" />
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 shadow-glow transition-opacity duration-500 group-hover:opacity-100" />
    </Link>
  );
}
