export const scoreColor = (score) => {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
};

export const scoreBg = (score) => {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

export const scoreLabel = (score) => {
  if (score >= 90) return 'Exceptional';
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Average';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
};

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const formatDuration = (s) => {
  if (!s) return '0s';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

export const truncate = (str, n) => str?.length > n ? str.slice(0, n) + '…' : str;

export const getInitials = (name) =>
  name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

export const difficultyColor = (d) => ({
  easy: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  medium: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  hard: 'text-red-500 bg-red-50 dark:bg-red-900/20',
}[d] || 'text-slate-500 bg-slate-50 dark:bg-slate-800');
