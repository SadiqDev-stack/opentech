/** Simple shimmer placeholders shown while API data loads. */

export function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-md ${className}`} />;
}

export function CardShimmer() {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <Shimmer className="h-32 w-full" />
      <Shimmer className="mt-3 h-4 w-3/4" />
      <Shimmer className="mt-2 h-4 w-1/2" />
      <Shimmer className="mt-3 h-8 w-full" />
    </div>
  );
}

export function CardGridShimmer({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardShimmer key={i} />
      ))}
    </div>
  );
}
