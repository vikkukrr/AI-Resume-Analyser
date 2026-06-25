import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileText, Mic, Trophy, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { scoreColor, formatDate, getScoreColor } from '../utils/helpers';
import { SkeletonStat } from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-4 py-3 shadow-lg text-sm">
      <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-semibold">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

const statCards = [
  { key: 'totalResumes', label: 'Total Resumes', icon: FileText, color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  { key: 'avgAtsScore', label: 'Avg ATS Score', icon: Trophy, color: 'text-accent-500', bg: 'bg-accent-100 dark:bg-accent-900/30', suffix: '%' },
  { key: 'interviewsDone', label: 'Interviews Done', icon: Mic, color: 'text-warning-500', bg: 'bg-warning-100 dark:bg-warning-900/30' },
  { key: 'bestInterviewScore', label: 'Best Interview Score', icon: Trophy, color: 'text-danger-500', bg: 'bg-danger-100 dark:bg-danger-900/30', suffix: '%' },
];

export default function DashboardPage() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Welcome back! Here's your overview." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <SkeletonStat key={i} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6"><div className="skeleton h-[300px] w-full rounded-lg" /></div>
          <div className="card p-6"><div className="skeleton h-[300px] w-full rounded-lg" /></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <EmptyState
          icon={Upload}
          title="Welcome to CareerAI"
          description="Upload your first resume to get started with AI-powered analysis."
          action={{ label: 'Upload Resume', onClick: () => window.location.href = '/resume/upload' }}
        />
      </div>
    );
  }

  const noData = !stats.totalResumes && !stats.interviewsDone;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's your overview." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => {
          const val = stats[s.key];
          const display = val !== null && val !== undefined ? (s.suffix ? `${Math.round(val)}${s.suffix}` : val) : '-';
          return (
            <motion.div key={s.key} className="card p-5 flex items-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon size={24} className={s.color} />
              </div>
              <div className="min-w-0">
                <p className="muted truncate">{s.label}</p>
                <p className={`text-2xl font-bold ${scoreColor(val)}`}>{display}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {noData ? (
        <EmptyState
          icon={Upload}
          title="Get Started"
          description="Upload your first resume or start a mock interview to see your stats here."
          action={{ label: 'Upload Resume', onClick: () => window.location.href = '/resume/upload' }}
        />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="section-title mb-4">ATS Score History</h3>
            {stats.atsHistory?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.atsHistory}>
                  <defs>
                    <linearGradient id="atsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#atsGradient)" name="ATS Score" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="muted text-center py-10">No ATS history yet.</p>}
          </div>
          <div className="card p-6">
            <h3 className="section-title mb-4">Interview Score History</h3>
            {stats.interviewHistory?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.interviewHistory}>
                  <defs>
                    <linearGradient id="interviewGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fill="url(#interviewGradient)" name="Interview Score" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="muted text-center py-10">No interview history yet.</p>}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Resumes</h3>
            <Link to="/resume/upload" className="btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {stats.recentResumes?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentResumes.map((r) => (
                <Link key={r._id} to={`/resume/${r._id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={18} className="text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{r.filename}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-slate-500">{formatDate(r.createdAt)}</span>
                    {r.atsScore !== null && r.atsScore !== undefined ? (
                      <span className={`text-sm font-bold ${scoreColor(r.atsScore)}`}>{Math.round(r.atsScore)}%</span>
                    ) : (
                      <span className="badge-warning text-xs">Pending</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted text-center py-6">No resumes uploaded yet.</p>
          )}
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Interviews</h3>
            <Link to="/interview" className="btn-ghost btn-sm">
              Start New <ArrowRight size={14} />
            </Link>
          </div>
          {stats.recentInterviews?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentInterviews.map((i) => (
                <Link key={i._id} to={`/interview/${i._id}/result`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Mic size={18} className="text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{i.targetRole}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-slate-500">{formatDate(i.createdAt)}</span>
                    {i.totalScore !== null && i.totalScore !== undefined ? (
                      <span className={`text-sm font-bold ${scoreColor(i.totalScore)}`}>{Math.round(i.totalScore)}%</span>
                    ) : (
                      <span className="badge-warning text-xs">In Progress</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted text-center py-6">No interviews taken yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
