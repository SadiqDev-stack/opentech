import type { Course } from "@/utils/mockData";
import { formatNaira } from "@/utils/api";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      <div className="relative">
        <img
          src={course.image}
          alt={course.title}
          loading="lazy"
          className="h-36 w-full object-cover"
        />
        {course.badge && (
          <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            {course.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold">{course.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {course.level} • {course.duration} • {course.lessonCount} Lessons
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          <i className="fa-solid fa-star mr-1 text-primary" />
          {course.rating} ({course.ratingCount})
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-bold">{formatNaira(course.price)}</span>
          <button className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-ink-foreground transition-opacity hover:opacity-90">
            View Course
          </button>
        </div>
      </div>
    </div>
  );
}
