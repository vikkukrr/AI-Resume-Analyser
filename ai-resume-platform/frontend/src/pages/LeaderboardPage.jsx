import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Mic2, FileText, TrendingUp, Crown } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getInitials, scoreColor } from '../utils/helpers';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';

function RankBadge({ rank }) {
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md flex-shrink-0"><Crown size={15} className="text-white" /></div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-md flex-shrink-0"><Medal size={15} className="text-white" /></div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-md flex-shrink-0"><Award size={15} className="text-white" /></div>;
  return <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0">{rank}</div>;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('interview');

  useEffect(() => {
    api.get(`/users/leaderboard?sortBy=${sortBy}&limit=50`)
      .then(r => setLeaders(r.data.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sortBy]);

  const myRank = leaders.findIndex(l => l._id === user?._id) + 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Leaderboard"
        subtitle="Top performers ranked by score"
        actions={
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {[{ value: 'interview', label: 'Interview Score' }, { value: 'ats', label: 'ATS Score' }].map(opt => (
              <button key={opt.value} onClick={() => { setSortBy(opt.value); setLoading(true); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sortBy === opt.value ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      {/* My rank banner */}
      {myRank > 0 && (
        <div className="card p-4 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
          <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
            🎯 You are ranked <strong>#{myRank}</strong> on the {sortBy === 'interview' ? 'interview score' : 'ATS score'} leaderboard
          </p>
        </div>
      )}

      {/* Top 3 podium */}
      {!loading && leaders.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { user: leaders[1], rank: 2, height: 'h-28', order: 'order-1' },
            { user: leaders[0], rank: 1, height: 'h-36', order: 'order-2' },
            { user: leaders[2], rank: 3, height: 'h-24', order: 'order-3' },
          ].map(({ user: u, rank, height, order }) => (
            <motion.div key={u._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rank * 0.1 }}
              className={`card ${height} ${order} flex flex-col items-center justify-center gap-2 ${rank === 1 ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">{getInitials(u.name)}</div>
              <p className="text-xs font-bold text-slate-900 dark:text-white text-center truncate px-1 w-full">{u.name}</p>
              <p className={`text-sm font-black ${scoreColor(sortBy === 'ats' ? u.bestAtsScore : u.avgInterviewScore)}`}>
                {sortBy === 'ats' ? u.bestAtsScore : u.avgInterviewScore}
                <span className="text-slate-400 text-xs font-normal">%</span>
              </p>
              {rank === 1 && <Trophy size={14} className="text-yellow-500" />}
            </motion.div>
          ))}
        </div>
      )}

      {/* Full list */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 grid grid-cols-12 text-xs font-semibold text-slate-400 uppercase tracking-wide">
          <span className="col-span-1">#</span>
          <span className="col-span-5">Candidate</span>
          <span className="col-span-2 text-center hidden sm:block">Resumes</span>
          <span className="col-span-2 text-center hidden sm:block">Interviews</span>
          <span className="col-span-2 text-right">Score</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="skeleton h-8 w-8 rounded-full" />
                <div className="skeleton h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1"><div className="skeleton h-4 w-32" /><div className="skeleton h-3 w-20" /></div>
                <div className="skeleton h-6 w-12" />
              </div>
            ))
          ) : leaders.length === 0 ? (
            <EmptyState icon={Trophy} title="No rankings yet" description="Complete interviews to appear on the leaderboard" />
          ) : (
            leaders.map((l, i) => {
              const isMe = l._id === user?._id;
              const score = sortBy === 'ats' ? l.bestAtsScore : l.avgInterviewScore;
              return (
                <motion.div key={l._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className={`grid grid-cols-12 items-center px-5 py-3.5 transition-colors ${isMe ? 'bg-primary-50 dark:bg-primary-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                  <div className="col-span-1"><RankBadge rank={i + 1} /></div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {getInitials(l.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                        {l.name}
                        {isMe && <span className="badge-primary text-[10px]">You</span>}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{l.targetRole || 'Developer'}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-center hidden sm:block">
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1"><FileText size={12} />{l.resumeCount}</p>
                  </div>
                  <div className="col-span-2 text-center hidden sm:block">
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1"><Mic2 size={12} />{l.interviewCount}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className={`text-lg font-black ${scoreColor(score)}`}>{score}<span className="text-xs text-slate-400 font-normal">%</span></p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
