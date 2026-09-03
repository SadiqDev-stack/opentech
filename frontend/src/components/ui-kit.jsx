import { Link } from "@tanstack/react-router";

/**
 * OpenTech shared UI primitives.
 * Small, readable building blocks used across the public site and dashboards.
 */

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const buttonVariants = {
  primary:
    "bg-primary text-primary-foreground hover:brightness-95 focus-visible:ring-primary shadow-sm",
  dark: "bg-navy text-navy-foreground hover:bg-navy-soft",
  outline: "border border-border bg-card text-foreground hover:bg-muted",
  outlineLight: "border border-white/25 text-white hover:bg-white/10",
  ghost: "text-foreground hover:bg-muted",
  danger: "bg-destructive text-destructive-foreground hover:brightness-95",
};

const buttonSizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  as,
  variant = "primary",
  size = "md",
  className,
  loading = false,
  disabled,
  children,
  ...props
}) {
  const Component = as || "button";
  return (
    <Component
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </Component>
  );
}

export function ButtonLink({ variant = "primary", size = "md", className, children, ...props }) {
  return (
    <Link
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Card({ className, children, ...props }) {
  return (
    <div className={cx("rounded-lg border border-border bg-card shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cx("flex items-start justify-between gap-4 border-b border-border p-5", className)}>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const badgeTones = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-accent text-accent-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning-foreground",
  danger: "bg-destructive/12 text-destructive",
  info: "bg-info/12 text-info",
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        badgeTones[tone] || badgeTones.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Maps backend status strings to a badge tone consistently across the app. */
export function statusTone(status) {
  const value = String(status || "").toLowerCase();
  if (["paid", "success", "delivered", "completed", "active", "approved"].includes(value)) return "success";
  if (["pending", "processing", "in_review", "shipped"].includes(value)) return "warning";
  if (["failed", "cancelled", "rejected", "inactive"].includes(value)) return "danger";
  return "neutral";
}

export function Field({ label, htmlFor, error, hint, required: isRequired, children, className }) {
  return (
    <div className={cx("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
        {isRequired && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

const controlClass =
  "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none";

export function Input({ className, invalid, ...props }) {
  return (
    <input
      className={cx(controlClass, invalid && "border-destructive", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Textarea({ className, invalid, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cx(controlClass, "resize-y", invalid && "border-destructive", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({ className, invalid, children, ...props }) {
  return (
    <select
      className={cx(controlClass, "pr-8", invalid && "border-destructive", className)}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({ label, id, checked, onChange, error }) {
  return (
    <div>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="mt-0.5 h-4 w-4 rounded border-input accent-[oklch(0.8_0.153_82)]"
        />
        <label htmlFor={id} className="text-sm text-muted-foreground">
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cx("shimmer rounded-md", className)} aria-hidden="true" />;
}

export function LoadingState({ label = "Loading", rows = 3 }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite" aria-label={label}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full" />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border border-border bg-card p-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center">
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const message = error?.message || "Something went wrong. Please try again.";
  return (
    <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-6 py-10 text-center">
      <h3 className="text-base font-semibold text-foreground">We couldn&apos;t load this</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, align = "left", light = false, action }) {
  return (
    <div
      className={cx(
        "mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
      )}
    >
      <div className={cx(align === "center" && "max-w-2xl text-center")}>
        {eyebrow && (
          <p className="mb-2 text-xs font-bold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
        )}
        <h2
          className={cx(
            "text-2xl font-bold sm:text-3xl",
            light ? "text-white" : "text-foreground",
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cx("mt-2 max-w-2xl text-sm", light ? "text-white/70" : "text-muted-foreground")}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Stars({ rating = 0, count }) {
  const rounded = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <span className="text-primary" aria-hidden="true">
        {"★★★★★".slice(0, rounded)}
        <span className="text-border">{"★★★★★".slice(rounded)}</span>
      </span>
      <span>
        {rating?.toFixed ? rating.toFixed(1) : rating}
        {count != null && ` (${count})`}
      </span>
    </span>
  );
}
