import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, Target, BookOpen, RotateCcw, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import api from '../utils/api';
import ScoreRing from '../components/common/ScoreRing';
import { scoreColor, scoreLabel, formatDuration } from '../utils/helpers';

function QuestionItem({ q, index }) {
  const [open, setOpen] = useState(false);
  const score = q.evaluation?.score || 0;
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left">
        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{index+1}</span>
        <p className="flex-1 text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{q.question}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {q.skipped ? <span className="badge-slate text-xs">Skipped</span> : <span className={`text-sm font-bold ${scoreColor(score)}`}>{score}</span>}
          {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
          {q.userAnswer && (
            <div><p className="text-xs font-semibold text-slate-400 mb-1">Your Answer</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{q.userAnswer}</p></div>
          )}
          {q.evaluation?.feedback && (
            <div><p className="text-xs font-semibold text-slate-400 mb-1">AI Feedback</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{q.evaluation.feedback}</p></div>
          )}
          {q.evaluation?.modelAnswer && (
            <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">Model Answer</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{q.evaluation.modelAnswer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewResultPage() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/interviews/${id}`).then(r => setInterview(r.data.interview)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
  if (!interview) return <div className="text-center py-20 text-slate-400">Interview not found</div>;

  const fb = interview.overallFeedback;
  const readinessColors = { 'Interview Ready':'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', 'Almost Ready':'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', 'Developing':'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', 'Not Ready':'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/interview" className="btn-ghost btn-icon"><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="page-title">Interview Results</h1>
          <p className="muted">{interview.targetRole} · {interview.difficulty}</p>
        </div>
      </div>

      {/* Score overview */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreRing score={interview.totalScore} size={140} strokeWidth={12} label={scoreLabel(interview.totalScore)} />
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Confidence', value: interview.confidenceScore },
                { label: 'Technical', value: interview.technicalScore },
                { label: 'Communication', value: interview.communicationScore },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <p className={`text-xl font-bold ${scoreColor(value || 0)}`}>{value || 0}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Clock size={13} /> {formatDuration(interview.durationSeconds)}</span>
              <span>{interview.completionPercentage}% completion</span>
              {fb?.readinessLevel && (
                <span className={`badge text-xs ${readinessColors[fb.readinessLevel] || 'badge-slate'}`}>{fb.readinessLevel}</span>
              )}
            </div>
          </div>
        </div>
        {fb?.summary && <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 leading-relaxed">{fb.summary}</p>}
      </div>

      {/* Strengths & Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" />Strengths</h2>
          <ul className="space-y-2">{fb?.strengths?.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="text-emerald-500 mt-0.5">✓</span>{s}</li>)}</ul>
        </div>
        <div className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2"><AlertCircle size={16} className="text-amber-500" />Areas to Improve</h2>
          <ul className="space-y-2">{fb?.areasToImprove?.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="text-amber-500 mt-0.5">→</span>{s}</li>)}</ul>
        </div>
      </div>

      {/* Next steps */}
      {fb?.nextSteps?.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2"><Target size={16} className="text-primary-500" />Next Steps</h2>
          <ol className="space-y-2">
            {fb.nextSteps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs flex items-center justify-center font-bold flex-shrink-0">{i+1}</span>{s}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Resources */}
      {fb?.recommendedResources?.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2"><BookOpen size={16} className="text-purple-500" />Recommended Resources</h2>
          <ul className="space-y-1.5">{fb.recommendedResources.map((r, i) => <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"><span className="text-purple-400">📚</span>{r}</li>)}</ul>
        </div>
      )}

      {/* Question breakdown */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800"><h2 className="section-title">Question Breakdown</h2></div>
        <div className="p-4 space-y-2">
          {interview.questions.map((q, i) => <QuestionItem key={q._id || i} q={q} index={i} />)}
        </div>
      </div>

      <div className="flex gap-3">
        <Link to="/interview" className="btn-primary flex-1 justify-center"><RotateCcw size={15} /> Practice Again</Link>
        <Link to="/dashboard" className="btn-secondary flex-1 justify-center">View Dashboard</Link>
      </div>
    </div>
  );
}
