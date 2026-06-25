import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Lightbulb, Target, BookOpen, Mic, RefreshCw, Award } from 'lucide-react';
import api from '../utils/api';
import { formatDate, formatDuration, scoreColor, getScoreColor, scoreLabel } from '../utils/helpers';
import ScoreRing from '../components/common/ScoreRing';
import { SkeletonCard } from '../components/common/SkeletonCard';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';

const breakdownCategories = [
  { key: 'technicalAccuracy', label: 'Technical Accuracy', icon: Target },
  { key: 'communication', label: 'Communication', icon: Mic },
  { key: 'depth', label: 'Depth of Knowledge', icon: BookOpen },
];

export default function InterviewResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await api.get(`/interviews/${id}`);
        setInterview(data.interview || data);
      } catch {
        toast.error('Failed to load interview results');
        navigate('/interview');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id, navigate]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Interview Results" />
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1"><SkeletonCard lines={4} /></div>
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={3} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-16">
        <Award size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="muted">Results not found.</p>
      </div>
    );
  }

  const totalScore = interview.totalScore ?? interview.score ?? 0;
  const breakdown = {
    technicalAccuracy: interview.technicalScore ?? 0,
    communication: interview.communicationScore ?? 0,
    depth: interview.confidenceScore ?? 0,
  };
  const questions = interview.questions || [];
  const feedback = interview.overallFeedback || {};
  const resources = feedback.recommendedResources || [];

  const readinessLevel = totalScore >= 80 ? 'Job Ready' : totalScore >= 60 ? 'Almost Ready' : totalScore >= 40 ? 'Needs Practice' : 'Beginner';
  const readinessBadgeClass = totalScore >= 80 ? 'badge-success' : totalScore >= 60 ? 'badge-warning' : totalScore >= 40 ? 'badge-primary' : 'badge-slate';

  return (
    <div>
      <PageHeader title="Interview Results" subtitle={`${interview.targetRole} - ${formatDate(interview.createdAt)}`}>
        <Link to="/interview" className="btn-primary btn-sm">
          <Mic size={14} /> New Interview
        </Link>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 text-center">
            <ScoreRing score={totalScore} size={140} />
            <p className="mt-3 text-sm muted">{formatDuration(interview.duration)}</p>
            <span className={`mt-2 inline-flex ${readinessBadgeClass}`}>{readinessLevel}</span>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="section-title mb-4">Score Breakdown</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {breakdownCategories.map((cat) => {
                const val = breakdown[cat.key] ?? 0;
                const color = getScoreColor(val);
                return (
                  <div key={cat.key} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <cat.icon size={16} className="text-primary-500" />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </div>
                    <div className="progress-bar mb-2">
                      <div className="progress-fill" style={{ width: `${val}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-lg font-bold" style={{ color }}>{Math.round(val)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {(feedback.summary || feedback.strengths?.length > 0 || feedback.areasToImprove?.length > 0 || feedback.nextSteps?.length > 0) && (
        <div className="card p-6 mb-6">
          <h3 className="section-title mb-4">Overall Feedback</h3>
          {feedback.summary && <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{feedback.summary}</p>}
          <div className="grid sm:grid-cols-3 gap-4">
            {feedback.strengths?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-accent-600 mb-2 flex items-center gap-1"><CheckCircle size={14} /> Strengths</p>
                <ul className="space-y-1">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-1"><span className="text-accent-500">&bull;</span> {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.areasToImprove?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-danger-600 mb-2 flex items-center gap-1"><XCircle size={14} /> Areas to Improve</p>
                <ul className="space-y-1">
                  {feedback.areasToImprove.map((a, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-1"><span className="text-danger-500">&bull;</span> {a}</li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.nextSteps?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-primary-600 mb-2 flex items-center gap-1"><Target size={14} /> Next Steps</p>
                <ul className="space-y-1">
                  {feedback.nextSteps.map((n, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-1"><span className="text-primary-500">&bull;</span> {n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {questions.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="section-title mb-4">Question Breakdown</h3>
          <div className="space-y-2">
            {questions.map((q, i) => {
              const isOpen = expandedQuestion === i;
              const score = q.evaluation?.score ?? q.score ?? 0;
              return (
                <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <button
                    onClick={() => setExpandedQuestion(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium truncate">{q.question}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {q.answered ? (
                        <span className={`text-sm font-bold ${scoreColor(score)}`}>{Math.round(score)}%</span>
                      ) : (
                        <span className="badge-warning text-xs">Skipped</span>
                      )}
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-slate-200 dark:border-slate-700 pt-3">
                          {q.userAnswer && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 mb-1">Your Answer</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">{q.userAnswer}</p>
                            </div>
                          )}
                          {q.evaluation && (
                            <>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-medium">Score:</span>
                                <div className="flex-1 progress-bar max-w-[200px]">
                                  <div className="progress-fill" style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }} />
                                </div>
                                <span className="text-sm font-bold" style={{ color: getScoreColor(score) }}>{Math.round(score)}%</span>
                              </div>
                              {q.evaluation.feedback && <p className="text-sm text-slate-600 dark:text-slate-400">{q.evaluation.feedback}</p>}
                              {q.evaluation.modelAnswer && (
                                <div>
                                  <p className="text-xs font-medium text-slate-500 mb-1">Model Answer</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">{q.evaluation.modelAnswer}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {resources.length > 0 && (
        <div className="card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-primary-500" /> Recommended Resources
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {resources.map((r, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <p className="text-sm font-medium">{r.title || r}</p>
                {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Learn more</a>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
