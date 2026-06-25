export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton h-4 ${className}`} />;
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card p-6 space-y-4 ${className}`}>
      <SkeletonLine className="w-1/3" />
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-2/3" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-8 w-8 rounded-lg" />
      <div className="skeleton h-7 w-16" />
      <div className="skeleton h-4 w-24" />
    </div>
  );
}
