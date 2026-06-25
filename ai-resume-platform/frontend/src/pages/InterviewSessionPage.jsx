import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, ChevronLeft, ChevronRight, CheckCircle, SkipForward,
  Send, Loader, AlertCircle, BarChart2, Lightbulb, Star, Flag
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { difficultyColor, scoreColor } from '../utils/helpers';

function Timer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  return (
    <span className="font-mono text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
      <Clock size={14} /> {m}:{s}
    </span>
  );
}

function EvaluationCard({ evaluation }) {
  if (!evaluation) return null;
  const { score, feedback, strengths = [], improvements = [], modelAnswer } = evaluation;
  const [showModel, setShowModel] = useState(false);
  const color = score >= 80 ? 'emerald' : score >= 60 ? 'amber' : 'red';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-3"
    >
      {/* Score bar */}
      <div className={`rounded-xl p-4 bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">AI Evaluation</span>
          <span className={`text-xl font-black text-${color}-600 dark:text-${color}-400`}>{score}/100</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-${color}-500`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">{feedback}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {strengths.length > 0 && (
          <div className="rounded-xl p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1">
              <CheckCircle size={12} /> Strengths
            </p>
            <ul className="space-y-1">
              {strengths.map((s, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-400">• {s}</li>
              ))}
            </ul>
          </div>
        )}
        {improvements.length > 0 && (
          <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1">
              <Lightbulb size={12} /> Improvements
            </p>
            <ul className="space-y-1">
              {improvements.map((s, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-400">• {s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {modelAnswer && (
        <button
          onClick={() => setShowModel(!showModel)}
          className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1"
        >
          <Star size={12} /> {showModel ? 'Hide' : 'View'} model answer
        </button>
      )}
      {showModel && modelAnswer && (
        <div className="rounded-xl p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
          <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 mb-2">Model Answer</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{modelAnswer}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function InterviewSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [evaluations, setEvaluations] = useState({});
  const [completing, setCompleting] = useState(false);
  const startTimeRef = useRef(Date.now());
  const textareaRef = useRef(null);

  useEffect(() => {
    api.get(`/interviews/${id}`)
      .then(({ data }) => {
        setInterview(data.interview);
        // Pre-fill existing evaluations
        const evals = {};
        data.interview.questions.forEach((q, i) => {
          if (q.evaluation) evals[i] = q.evaluation;
        });
        setEvaluations(evals);
      })
      .catch(() => toast.error('Failed to load interview'))
      .finally(() => setLoading(false));
  }, [id]);

  const currentQ = interview?.questions[currentIdx];
  const totalQ = interview?.questions.length || 0;
  const answeredCount = Object.keys(evaluations).length;

  const submitAnswer = useCallback(async () => {
    if (!answer.trim()) { toast.error('Please write an answer first'); return; }
    if (!currentQ) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/interviews/${id}/answer`, {
        questionId: currentQ._id,
        answer: answer.trim(),
      });
      setEvaluations(prev => ({ ...prev, [currentIdx]: data.evaluation }));
      // Update local question state
      setInterview(prev => {
        const updated = { ...prev };
        updated.questions[currentIdx] = { ...updated.questions[currentIdx], answered: true, userAnswer: answer };
        return updated;
      });
      toast.success('Answer evaluated!');
    } catch {
      toast.error('Failed to evaluate answer');
    } finally {
      setSubmitting(false);
    }
  }, [answer, currentQ, currentIdx, id]);

  const skipQuestion = useCallback(async () => {
    if (!currentQ) return;
    try {
      await api.post(`/interviews/${id}/skip`, { questionId: currentQ._id });
      setInterview(prev => {
        const updated = { ...prev };
        updated.questions[currentIdx] = { ...updated.questions[currentIdx], answered: true, skipped: true };
        return updated;
      });
      goNext();
    } catch {
      toast.error('Failed to skip');
    }
  }, [currentQ, currentIdx, id]);

  const goNext = () => {
    if (currentIdx < totalQ - 1) {
      setCurrentIdx(i => i + 1);
      setAnswer('');
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
      setAnswer('');
    }
  };

  const completeInterview = async () => {
    setCompleting(true);
    try {
      await api.post(`/interviews/${id}/complete`);
      toast.success('Interview completed! 🎉');
      navigate(`/interview/${id}/result`);
    } catch {
      toast.error('Failed to complete interview');
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading interview…</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-slate-500">Interview not found</p>
      </div>
    );
  }

  const isAnswered = currentQ?.answered || evaluations[currentIdx];
  const isLast = currentIdx === totalQ - 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{interview.targetRole}</h1>
          <p className="muted capitalize">{interview.difficulty} · {totalQ} questions</p>
        </div>
        <div className="flex items-center gap-4">
          <Timer startTime={startTimeRef.current} />
          <span className="badge-primary">{answeredCount}/{totalQ} done</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5">
        {interview.questions.map((q, i) => (
          <button
            key={i}
            onClick={() => { setCurrentIdx(i); setAnswer(''); }}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i === currentIdx
                ? 'bg-primary-500'
                : q.answered
                ? q.skipped
                  ? 'bg-slate-300 dark:bg-slate-600'
                  : evaluations[i]?.score >= 70
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
                : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="card p-6"
        >
          {/* Question meta */}
          <div className="flex items-center gap-2 mb-4">
            <span className="badge-slate">Q{currentIdx + 1}</span>
            {currentQ?.category && <span className="badge-primary">{currentQ.category}</span>}
            {currentQ?.difficulty && (
              <span className={`badge text-xs ${difficultyColor(currentQ.difficulty)}`}>
                {currentQ.difficulty}
              </span>
            )}
            {isAnswered && !currentQ?.skipped && <CheckCircle size={16} className="text-emerald-500 ml-auto" />}
          </div>

          {/* Question text */}
          <p className="text-lg font-semibold text-slate-900 dark:text-white leading-relaxed mb-6">
            {currentQ?.question}
          </p>

          {/* Answer area */}
          {!isAnswered ? (
            <div className="space-y-3">
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here… Be as detailed and specific as possible. Include examples, code snippets, or explanations."
                rows={7}
                className="input resize-none font-mono text-sm leading-relaxed"
                disabled={submitting}
              />
              <div className="flex gap-3">
                <button
                  onClick={submitAnswer}
                  disabled={submitting || !answer.trim()}
                  className="btn-primary flex-1"
                >
                  {submitting
                    ? <><Loader size={15} className="animate-spin" /> Evaluating with Gemini AI…</>
                    : <><Send size={15} /> Submit Answer</>
                  }
                </button>
                <button onClick={skipQuestion} disabled={submitting} className="btn-ghost">
                  <SkipForward size={15} /> Skip
                </button>
              </div>
            </div>
          ) : currentQ?.skipped ? (
            <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/60 text-center">
              <p className="text-sm text-slate-400">Question skipped</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/60">
                <p className="text-xs text-slate-400 mb-2 font-medium">Your answer</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {currentQ?.userAnswer || answer}
                </p>
              </div>
              <EvaluationCard evaluation={evaluations[currentIdx]} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={goPrev} disabled={currentIdx === 0} className="btn-secondary disabled:opacity-40">
          <ChevronLeft size={16} /> Previous
        </button>

        <div className="flex gap-3">
          {isLast ? (
            <button
              onClick={completeInterview}
              disabled={completing}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700"
            >
              {completing
                ? <><Loader size={15} className="animate-spin" /> Completing…</>
                : <><Flag size={15} /> Complete Interview</>
              }
            </button>
          ) : (
            <button onClick={goNext} className="btn-primary">
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="card p-4">
        <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400 justify-center flex-wrap">
          <span className="flex items-center gap-1.5">
            <BarChart2 size={14} className="text-primary-500" />
            {answeredCount} answered
          </span>
          <span className="flex items-center gap-1.5">
            <SkipForward size={14} className="text-slate-400" />
            {interview.questions.filter(q => q.skipped).length} skipped
          </span>
          {answeredCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Star size={14} className="text-amber-500" />
              Avg:{' '}
              {Math.round(
                Object.values(evaluations).reduce((s, e) => s + (e?.score || 0), 0) /
                Object.values(evaluations).length
              )}
              /100
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
