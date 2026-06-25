import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { FileText, Mic2, TrendingUp, Award, Plus, Clock, ArrowRight, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate, scoreColor, scoreLabel } from '../utils/helpers';
import { SkeletonStat } from '../components/common/SkeletonCard';
import PageHeader from '../components/common/PageHeader';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 shadow-lg text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-semibold text-slate-900 dark:text-white">{payload[0].value}/100</p>
    </div>
  );
};

function StatCard({ icon: Icon, value, label, sub, color, link }) {
  const content = (
    <div className="stat-card group">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
  return link ? <Link to={link} className="block card-hover">{content}</Link> : <div className="card">{content}</div>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's your career performance at a glance"
        actions={
          <>
            <Link to="/resume/upload" className="btn-secondary">
              <Plus size={15} /> Upload Resume
            </Link>
            <Link to="/interview" className="btn-primary">
              <Mic2 size={15} /> Start Interview
            </Link>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonStat key={i} />)
        ) : (
          <>
            <StatCard icon={FileText} value={data?.stats.totalResumes || 0} label="Resumes Analyzed"
              sub={`Best ATS: ${data?.stats.bestAtsScore || 0}`} color="bg-gradient-to-br from-blue-500 to-primary-600" link="/resume/upload" />
            <StatCard icon={TrendingUp} value={`${data?.stats.avgAtsScore || 0}`} label="Avg ATS Score"
              sub="Out of 100" color="bg-gradient-to-br from-accent-400 to-teal-600" />
            <StatCard icon={Mic2} value={data?.stats.totalInterviews || 0} label="Interviews Done"
              sub={`Avg: ${data?.stats.avgInterviewScore || 0}%`} color="bg-gradient-to-br from-primary-500 to-purple-600" link="/interview" />
            <StatCard icon={Award} value={`${data?.stats.bestInterviewScore || 0}`} label="Best Interview"
              sub={data?.stats.streak ? `🔥 ${data.stats.streak} day streak` : 'Keep practicing!'} color="bg-gradient-to-br from-yellow-400 to-amber-500" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATS History */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">ATS Score History</h2>
            <Link to="/resume/upload" className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1">
              Upload new <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="skeleton h-44 w-full" />
          ) : data?.atsHistory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={176}>
              <AreaChart data={data.atsHistory.map(d => ({ date: formatDate(d.date), score: d.score }))}>
                <defs>
                  <linearGradient id="atsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" fill="url(#atsGrad)" strokeWidth={2.5}
                  dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center gap-3">
              <FileText size={32} className="text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-400">Upload a resume to see your ATS trend</p>
              <Link to="/resume/upload" className="btn-primary btn-sm">Upload Resume</Link>
            </div>
          )}
        </div>

        {/* Interview History */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Interview Scores</h2>
            <Link to="/interview" className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1">
              Practice now <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="skeleton h-44 w-full" />
          ) : data?.interviewHistory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={176}>
              <AreaChart data={data.interviewHistory.map(d => ({ date: formatDate(d.date), score: d.score }))}>
                <defs>
                  <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#10b981" fill="url(#intGrad)" strokeWidth={2.5}
                  dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center gap-3">
              <Mic2 size={32} className="text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-400">Complete an interview to track your progress</p>
              <Link to="/interview" className="btn-primary btn-sm">Start Interview</Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Resumes */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Resumes</h2>
            <Link to="/resume/upload" className="btn-ghost btn-sm"><Plus size={14} /> New</Link>
          </div>
          <div className="space-y-2">
            {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-14 w-full" />) :
            data?.recentResumes?.length > 0 ? data.recentResumes.map(r => (
              <Link key={r._id} to={r.status === 'analyzed' ? `/resume/${r._id}` : '#'}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{r.originalName}</p>
                  <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                </div>
                {r.status === 'analyzed' && (
                  <span className={`text-sm font-bold ${scoreColor(r.analysis?.atsScore || 0)}`}>
                    {r.analysis?.atsScore || 0}
                  </span>
                )}
                {r.status === 'processing' && <span className="badge-warning text-xs">Analyzing…</span>}
                {r.status === 'failed' && <span className="badge-danger text-xs">Failed</span>}
              </Link>
            )) : (
              <p className="text-sm text-slate-400 text-center py-8">No resumes yet</p>
            )}
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Interviews</h2>
            <Link to="/interview" className="btn-ghost btn-sm"><Plus size={14} /> New</Link>
          </div>
          <div className="space-y-2">
            {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-14 w-full" />) :
            data?.recentInterviews?.length > 0 ? data.recentInterviews.map(i => (
              <Link key={i._id} to={i.status === 'completed' ? `/interview/${i._id}/result` : `/interview/${i._id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <Mic2 size={16} className="text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{i.targetRole}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={10} /> {formatDate(i.createdAt)} · {i.difficulty}
                  </p>
                </div>
                {i.status === 'completed' && (
                  <span className={`text-sm font-bold ${scoreColor(i.totalScore)}`}>{i.totalScore}%</span>
                )}
                {i.status === 'in_progress' && <span className="badge-primary text-xs">In Progress</span>}
              </Link>
            )) : (
              <p className="text-sm text-slate-400 text-center py-8">No interviews yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
