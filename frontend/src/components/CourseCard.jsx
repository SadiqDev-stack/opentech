import { Link } from "react-router-dom";
import { Badge, Stars } from "./ui-kit";
import { formatNaira } from "@/utils/format";

export default function CourseCard({ course }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      <Link
        to="/academy/courses/$id"
        params={{ id: String(course.id) }}
        className="block aspect-16/9 bg-navy"
        aria-label={course.title}
      >
        <div className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-primary">
          {course.category}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <Badge tone="primary">{course.level}</Badge>
          <span className="text-xs text-muted-foreground">{course.duration}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">
          <Link to="/academy/courses/$id" params={{ id: String(course.id) }} className="hover:text-primary">
            {course.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{course.summary}</p>
        <div className="mt-3">
          <Stars rating={course.rating} count={course.ratingCount} />
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-base font-bold text-foreground">{formatNaira(course.price)}</span>
          <span className="text-xs text-muted-foreground">{course.lessonCount} lessons</span>
        </div>
      </div>
    </article>
  );
}
