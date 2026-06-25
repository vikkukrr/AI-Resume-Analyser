export function SkeletonLine({ width = '100%', className = '' }) {
  return (
    <div className={`skeleton h-4 ${className}`} style={{ width }} />
  );
}

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`card p-5 space-y-4 ${className}`}>
      <SkeletonLine width="40%" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonStat({ className = '' }) {
  return (
    <div className={`card p-5 flex items-center gap-4 ${className}`}>
      <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="50%" />
        <SkeletonLine width="30%" />
      </div>
    </div>
  );
}
