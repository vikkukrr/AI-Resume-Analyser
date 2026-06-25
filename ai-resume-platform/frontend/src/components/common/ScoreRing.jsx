import { motion } from 'framer-motion';

export default function ScoreRing({ score = 0, size = 140, strokeWidth = 12, label, animate = true }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-700" stroke="currentColor"
          />
          {animate ? (
            <motion.circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${dash} ${circ - dash}` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
          ) : (
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={color} strokeWidth={strokeWidth}
              strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-slate-400 font-medium">/100</span>
        </div>
      </div>
      {label && <p className="text-sm font-semibold" style={{ color }}>{label}</p>}
    </div>
  );
}
