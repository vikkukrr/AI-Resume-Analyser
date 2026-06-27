import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, TrendingUp, Target, DollarSign, Clock, CheckCircle, ChevronDown, ChevronUp, Zap, Briefcase, BookOpen, Star, Lightbulb, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { SkeletonCard } from '../components/common/SkeletonCard';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import DemoModal from '../components/common/DemoModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RoadmapPage() {
  const { isDemo } = useAuth();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState(null);

  useEffect(() => {
    if (isDemo) {
      setShowDemoModal(true);
      setLoading(false);
      return;
    }
    const fetchRoadmap = async () => {
      try {
        const { data } = await api.get('/dashboard/roadmap');
        setRoadmap(data.roadmap || data);
      } catch {
        setRoadmap(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [isDemo]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.get('/dashboard/roadmap');
      setRoadmap(data.roadmap || data);
      toast.success('Roadmap generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Career Roadmap" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      </div>
    );
  }

  if (!roadmap && !generating) {
    return (
      <div>
        <PageHeader title="Career Roadmap" />
        <EmptyState
          icon={Map}
          title="No Roadmap Yet"
          description="Generate a personalized career roadmap based on your profile and resume analysis."
          action={{ label: 'Generate Roadmap', onClick: handleGenerate }}
        />
      </div>
    );
  }

  if (generating) {
    return (
      <div>
        <PageHeader title="Career Roadmap" />
        <div className="max-w-lg mx-auto text-center py-16">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="inline-flex mb-6">
            <Sparkles size={48} className="text-primary-500" />
          </motion.div>
          <h2 className="text-xl font-semibold mb-2">Generating your career roadmap...</h2>
          <p className="muted mb-8">Analyzing your profile, skills, and market trends</p>
          <div className="flex justify-center gap-2">
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 rounded-full bg-primary-500" />
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} className="w-2 h-2 rounded-full bg-primary-500" />
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} className="w-2 h-2 rounded-full bg-primary-500" />
          </div>
          <div className="mt-8 space-y-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={1} />)}
          </div>
        </div>
      </div>
    );
  }

  const phases = roadmap?.phases || [];
  const milestones = roadmap?.milestones || roadmap?.keyMilestones || [];
  const salaryProjection = roadmap?.salaryProjection || {};
  const timeToReady = roadmap?.timeToReady ?? roadmap?.timeToJobReady;
  const topPriority = roadmap?.topPriority || roadmap?.priority;

  return (
    <div>
      <PageHeader title="Career Roadmap" subtitle="Your personalized career development plan." />

      {timeToReady !== null && timeToReady !== undefined && (
        <div className="card p-6 mb-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Clock size={28} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm muted">Estimated Time to Job Ready</p>
              <motion.p
                className="text-3xl font-bold gradient-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                {timeToReady}
              </motion.p>
            </div>
          </div>
        </div>
      )}

      {topPriority && (
        <div className="card p-6 mb-6 border-l-4 border-l-primary-500">
          <div className="flex items-start gap-3">
            <Target size={20} className="text-primary-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-1">Top Priority</p>
              <p className="font-medium">{typeof topPriority === 'string' ? topPriority : topPriority.title || topPriority.description}</p>
            </div>
          </div>
        </div>
      )}

      {salaryProjection && (salaryProjection.current || salaryProjection.sixMonths || salaryProjection.oneYear) && (
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Current', value: salaryProjection.current, icon: DollarSign },
            { label: 'In 6 Months', value: salaryProjection.sixMonths, icon: TrendingUp },
            { label: 'In 1 Year', value: salaryProjection.oneYear, icon: TrendingUp },
          ].map((item) => (
            <div key={item.label} className={`card p-5 ${item.label !== 'Current' ? 'bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <item.icon size={16} className="text-primary-500" />
                <span className="text-sm muted">{item.label}</span>
              </div>
              <p className="text-2xl font-bold gradient-text">{item.value || '-'}</p>
            </div>
          ))}
        </div>
      )}

      {phases.length > 0 && (
        <div className="space-y-3 mb-6">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-primary-500" /> Learning Phases
          </h2>
          {phases.map((phase, i) => {
            const isOpen = expandedPhase === i;
            return (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedPhase(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{phase.title}</p>
                      <p className="text-xs muted">{phase.goals?.length || 0} goals &bull; {phase.actions?.length || 0} actions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {phase.skills?.length > 0 && (
                      <div className="hidden sm:flex gap-1">
                        {phase.skills.slice(0, 3).map((s) => (
                          <span key={s} className="badge-slate text-xs">{s}</span>
                        ))}
                        {phase.skills.length > 3 && <span className="text-xs muted">+{phase.skills.length - 3}</span>}
                      </div>
                    )}
                    {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                        {phase.goals?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-1"><Target size={14} className="text-primary-500" /> Goals</p>
                            <ul className="space-y-1">
                              {phase.goals.map((g, gi) => (
                                <li key={gi} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                  <CheckCircle size={14} className="text-accent-500 mt-0.5 flex-shrink-0" />{g}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {phase.actions?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-1"><Zap size={14} className="text-warning-500" /> Actions</p>
                            <ul className="space-y-1">
                              {phase.actions.map((a, ai) => (
                                <li key={ai} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                  <Lightbulb size={14} className="text-warning-500 mt-0.5 flex-shrink-0" />{a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {phase.skills?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {phase.skills.map((s) => (
                                <span key={s} className="badge-primary text-xs">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {milestones.length > 0 && (
        <div className="card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Star size={18} className="text-primary-500" /> Key Milestones
          </h3>
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-accent-500" />
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />}
                </div>
                <div className="pb-6">
                  <p className="text-sm font-medium">{typeof m === 'string' ? m : m.title || m.description}</p>
                  {m.timeline && <p className="text-xs muted">{m.timeline}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <DemoModal open={showDemoModal} onClose={() => setShowDemoModal(false)} feature="Roadmap Generation" />
    </div>
  );
}
