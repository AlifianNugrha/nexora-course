import { Link } from "@tanstack/react-router";
import { Clock, BookOpen, ArrowRight } from "lucide-react";
import type { Course } from "@/data/courses";

type Props = {
  course: Course;
  size?: "sm" | "md" | "lg";
};

export function CourseCard({ course, size = "md" }: Props) {
  const isLarge = size === "lg";

  return (
    <Link
      to="/course/$courseId"
      params={{ courseId: course.id }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-card-hover"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Category badge */}
        <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-1 text-[9px] font-bold text-primary-deep shadow-soft backdrop-blur-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-[11px]">
          {course.category}
        </span>
        {/* Level badge */}
        <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-1 text-[9px] font-bold text-primary-foreground shadow-soft sm:right-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-[11px]">
          {course.level}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
        {/* Meta */}
        <div className="flex flex-col gap-1 text-[9px] font-medium text-muted-foreground sm:flex-row sm:items-center sm:gap-3 sm:text-xs">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {course.duration}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {course.lessons} sesi
          </span>
        </div>

        {/* Title */}
        <h3
          className={`font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary ${
            isLarge ? "text-lg sm:text-2xl" : "text-sm sm:text-lg"
          }`}
        >
          {course.title}
        </h3>

        {/* Desc */}
        <p className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground sm:text-sm">
          {course.description}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-2 sm:pt-3">
          <span className="text-[9px] text-muted-foreground sm:text-xs">
            oleh <span className="font-semibold text-foreground">{course.instructor}</span>
          </span>
          <span className="inline-flex items-center gap-1 pl-2 text-[10px] font-bold text-primary transition-colors group-hover:text-primary-deep sm:text-sm whitespace-nowrap">
            Lihat
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4" />
          </span>
        </div>
      </div>

      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 shadow-glow transition-opacity duration-500 group-hover:opacity-100" />
    </Link>
  );
}
