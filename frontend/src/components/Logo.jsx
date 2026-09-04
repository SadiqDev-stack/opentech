import { Link } from "react-router-dom";

/** OpenTech wordmark. Sub-label changes per area (Store / Academy). */
export default function Logo({ sub = "Innovate. Build. Impact.", light = true }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="gradient-gold flex h-9 w-9 items-center justify-center rounded-md text-sm font-black text-primary-foreground"
      >
        OT
      </span>
      <span className="leading-tight">
        <span
          className={`block text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-foreground"}`}
        >
          OPENTECH
        </span>
        <span className={`block text-[11px] ${light ? "text-white/60" : "text-muted-foreground"}`}>
          {sub}
        </span>
      </span>
    </Link>
  );
}
