import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Medal, Crown, Award, Star, Trophy, Mic, BarChart3 } from 'lucide-react';
import api from '../utils/api';
import { getInitials, scoreColor } from '../utils/helpers';
import { SkeletonCard } from '../components/common/SkeletonCard';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

const rankStyles = {
  1: { bg: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700', icon: Crown, iconColor: 'text-amber-500', medal: 'text-amber-500' },
  2: { bg: 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600', icon: Medal, iconColor: 'text-slate-400', medal: 'text-slate-400' },
  3: { bg: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700', icon: Award, iconColor: 'text-orange-500', medal: 'text-orange-500' },
};

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('interview');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/leaderboard?sortBy=${sortBy}&limit=50`);
        setUsers(data.leaderboard || []);
      } catch {
        toast.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [sortBy]);

  return (
    <div>
      <PageHeader title="Leaderboard" subtitle="Top performers ranked by interview and ATS scores." />

      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setSortBy('interview')}
          className={`btn-sm ${sortBy === 'interview' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <Mic size={14} /> Interview Score
        </button>
        <button
          onClick={() => setSortBy('ats')}
          className={`btn-sm ${sortBy === 'ats' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <BarChart3 size={14} /> ATS Score
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} lines={1} />)}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Trophy} title="No data yet" description="Complete an interview or upload a resume to get on the leaderboard." />
      ) : (
        <div className="space-y-3">
          {users.map((u, i) => {
            const rank = i + 1;
            const style = rankStyles[rank] || {};
            const RankIcon = style.icon || Star;
            const score = u.score ?? 0;

            return (
              <motion.div
                key={u.rank || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`card p-4 flex items-center gap-4 ${style.bg || ''} border ${style.bg ? '' : 'border-slate-200 dark:border-slate-700'}`}
              >
                <div className="w-10 flex justify-center flex-shrink-0">
                  {rank <= 3 ? (
                    <RankIcon size={24} className={style.medal || 'text-slate-400'} />
                  ) : (
                    <span className="text-sm font-bold text-slate-400">{rank}</span>
                  )}
                </div>

                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {getInitials(u.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  {u.targetRole && <p className="text-xs muted truncate">{u.targetRole}</p>}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`text-lg font-bold ${scoreColor(score)}`}>{Math.round(score)}%</p>
                  <p className="text-xs muted">{sortBy === 'interview' ? 'Interview' : 'ATS'}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
