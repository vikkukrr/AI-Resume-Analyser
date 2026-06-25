import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Sparkles, Loader, Target, TrendingUp, DollarSign,
  Clock, BookOpen, CheckCircle, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';

const PHASE_COLORS = [
  { border: 'border-blue-400 dark:border-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'bg-blue-500', label: 'text-blue-700 dark:text-blue-300' },
  { border: 'border-primary-400 dark:border-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20', icon: 'bg-primary-500', label: 'text-primary-700 dark:text-primary-300' },
  { border: 'border-emerald-400 dark:border-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'bg-emerald-500', label: 'text-emerald-700 dark:text-emerald-300' },
  { border: 'border-amber-400 dark:border-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'bg-amber-500', label: 'text-amber-700 dark:text-amber-300' },
];

function PhaseCard({ phase, data, index }) {
  const [open, setOpen] = useState(index === 0);
  const c = PHASE_COLORS[index] || PHASE_COLORS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`card border-l-4 ${c.border} overflow-hidden`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className={`w-9 h-9 rounded-xl ${c.icon} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${c.label}`}>{phase}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {data.goals?.length || 0} goals · {data.skills?.length || 0} skills to learn
          </p>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`px-5 pb-5 ${c.bg}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              {/* Goals */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Target size={11} /> Goals
                </p>
                <ul className="space-y-1.5">
                  {data.goals?.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" /> {g}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Zap size={11} /> Actions
                </p>
                <ul className="space-y-1.5">
                  {data.actions?.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-primary-500 mt-0.5 flex-shrink-0">→</span> {a}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <BookOpen size={11} /> Skills to Learn
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills?.map((s, i) => (
                    <span key={i} className="badge-primary text-xs">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RoadmapPage() {
  const { user } = useAuth();
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dashboard/roadmap');
      setRoadmapData(data.roadmap);
      toast.success('Career roadmap generated!');
    } catch {
      toast.error('Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const phases = roadmapData?.roadmap
    ? Object.entries(roadmapData.roadmap).map(([, data]) => ({ title: data.title, data }))
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="AI Career Roadmap"
        subtitle="Get a personalized 4-phase plan powered by Google Gemini"
        actions={
          <button onClick={generateRoadmap} disabled={loading} className="btn-primary">
            {loading
              ? <><Loader size={15} className="animate-spin" /> Generating…</>
              : <><Sparkles size={15} /> {roadmapData ? 'Regenerate' : 'Generate My Roadmap'}</>
            }
          </button>
        }
      />

      {/* Profile context */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div>
            <p className="text-slate-400 text-xs mb-1">Target Role</p>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.targetRole || 'Not set'}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Avg Interview Score</p>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.avgInterviewScore || 0}/100</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Best ATS Score</p>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.bestAtsScore || 0}/100</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Skills</p>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.skills?.length || 0} listed</p>
          </div>
        </div>
      </div>

      {!roadmapData && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Map size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Your Personalized Career Roadmap</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
            Gemini AI will analyze your profile, skills, and performance to create a step-by-step career plan with milestones, salary projections, and course recommendations.
          </p>
          <button onClick={generateRoadmap} disabled={loading} className="btn-primary btn-lg shadow-glow">
            {loading
              ? <><Loader size={18} className="animate-spin" /> Analyzing your profile…</>
              : <><Sparkles size={18} /> Generate My Career Roadmap</>
            }
          </button>
          <p className="text-xs text-slate-400 mt-4">Takes about 10-15 seconds · Powered by Gemini 2.5 Flash</p>
        </motion.div>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-5 w-40" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {roadmapData && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {roadmapData.estimatedTimeToJobReady && (
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Clock size={16} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Time to Job Ready</p>
                </div>
                <p className="font-bold text-slate-900 dark:text-white">{roadmapData.estimatedTimeToJobReady}</p>
              </div>
            )}
            {roadmapData.topPriority && (
              <div className="card p-5 sm:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Target size={16} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Top Priority Right Now</p>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{roadmapData.topPriority}</p>
              </div>
            )}
          </div>

          {/* Salary projection */}
          {roadmapData.salaryProjection && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={18} className="text-emerald-500" />
                <h3 className="section-title">Salary Projection</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Current', value: roadmapData.salaryProjection.current },
                  { label: 'In 6 Months', value: roadmapData.salaryProjection.in6months },
                  { label: 'In 1 Year', value: roadmapData.salaryProjection.in1year },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase cards */}
          <div className="space-y-3">
            <h3 className="section-title flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-500" /> Your 4-Phase Plan
            </h3>
            {phases.map(({ title, data }, i) => (
              <PhaseCard key={i} phase={title} data={data} index={i} />
            ))}
          </div>

          {/* Milestones */}
          {roadmapData.keyMilestones?.length > 0 && (
            <div className="card p-6">
              <h3 className="section-title mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500" /> Key Milestones
              </h3>
              <div className="space-y-2">
                {roadmapData.keyMilestones.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{i + 1}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{m}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-slate-400">
            Generated by Gemini 2.5 Flash · Regenerate anytime to refresh your plan
          </p>
        </motion.div>
      )}
    </div>
  );
}
