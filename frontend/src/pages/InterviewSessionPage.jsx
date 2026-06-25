import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, SkipForward, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, Lightbulb, HelpCircle } from 'lucide-react';
import api from '../utils/api';
import { formatDuration, difficultyColor } from '../utils/helpers';
import { SkeletonCard } from '../components/common/SkeletonCard';
import toast from 'react-hot-toast';

export default function InterviewSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data } = await api.get(`/interviews/${id}`);
        setInterview(data.interview || data);
      } catch {
        toast.error('Failed to load interview');
        navigate('/interview');
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id, navigate]);

  useEffect(() => {
    if (!interview || completed) return;
    const start = interview.startedAt ? new Date(interview.startedAt).getTime() : Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [interview, completed]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!completed) {
        e.preventDefault();
        e.returnValue = 'You have an interview in progress. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [completed]);

  const questions = interview?.questions || [];
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isAnswered = current?.answered === true;
  const isSkipped = current?.skipped === true;
  const isDone = isAnswered || isSkipped;

  const updateQuestion = useCallback((index, updates) => {
    setInterview((prev) => {
      if (!prev) return prev;
      const qs = [...(prev.questions || [])];
      qs[index] = { ...qs[index], ...updates };
      return { ...prev, questions: qs };
    });
  }, []);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please write an answer');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/interviews/${id}/answer`, {
        questionIndex: currentIndex,
        answer: answer.trim(),
      });
      updateQuestion(currentIndex, {
        answered: true,
        evaluation: data.evaluation,
        ...(data.score !== undefined ? { score: data.score } : {}),
      });
      toast.success('Answer submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setSubmitting(true);
    try {
      await api.post(`/interviews/${id}/skip`, { questionIndex: currentIndex });
      updateQuestion(currentIndex, { skipped: true });
      toast('Question skipped');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to skip question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post(`/interviews/${id}/complete`);
      setCompleted(true);
      toast.success('Interview completed!');
      navigate(`/interview/${id}/result`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete interview');
    } finally {
      setSubmitting(false);
    }
  };

  const progressWidth = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div>
        <div className="space-y-4 max-w-3xl mx-auto">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      </div>
    );
  }

  if (!interview || questions.length === 0) {
    return (
      <div className="text-center py-16">
        <HelpCircle size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="muted">Interview not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">{interview.targetRole}</h1>
          <p className="muted flex items-center gap-2 mt-1">
            <Clock size={14} /> {formatDuration(elapsed)}
          </p>
        </div>
        <span className="text-sm muted">Question {currentIndex + 1} of {questions.length}</span>
      </div>

      <div className="flex gap-1 mb-8">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => {
              if (i !== currentIndex) setCurrentIndex(i);
            }}
            className={`h-2 flex-1 rounded-full transition-colors cursor-pointer ${
              q.answered ? 'bg-accent-500' :
              q.skipped ? 'bg-warning-500' :
              i === currentIndex ? 'bg-primary-500' :
              'bg-slate-200 dark:bg-slate-700'
            }`}
            title={`Question ${i + 1}: ${q.answered ? 'Answered' : q.skipped ? 'Skipped' : 'Pending'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {current && (
            <div className="card p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="badge-primary">{current.category || 'General'}</span>
                {current.difficulty && (
                  <span className={difficultyColor(current.difficulty)}>{current.difficulty}</span>
                )}
              </div>
              <p className="text-lg font-medium mb-6">{current.question}</p>

              {isDone ? (
                <div className="space-y-4">
                  {current.evaluation && (
                    <>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                        <span className="text-sm font-medium">Score:</span>
                        <div className="flex-1 progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${current.evaluation.score || current.score || 0}%`,
                              backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-primary') || '#6366f1',
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold">{Math.round(current.evaluation.score || current.score || 0)}%</span>
                      </div>
                      {current.evaluation.feedback && (
                        <div>
                          <p className="text-sm font-medium mb-1">Feedback</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{current.evaluation.feedback}</p>
                        </div>
                      )}
                      {current.evaluation.strengths?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Strengths</p>
                          <ul className="space-y-1">
                            {current.evaluation.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle size={14} className="text-accent-500 mt-0.5 flex-shrink-0" />{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {current.evaluation.improvements?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Areas to Improve</p>
                          <ul className="space-y-1">
                            {current.evaluation.improvements.map((imp, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm"><Lightbulb size={14} className="text-warning-500 mt-0.5 flex-shrink-0" />{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {current.evaluation.modelAnswer && (
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center gap-2">
                            <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                            View Model Answer
                          </summary>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            {current.evaluation.modelAnswer}
                          </p>
                        </details>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    className="input min-h-[120px] resize-y"
                    placeholder="Write your answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                  <div className="flex items-center gap-3">
                    <button onClick={handleSubmitAnswer} className="btn-primary" disabled={submitting || !answer.trim()}>
                      <Send size={16} />
                      {submitting ? 'Submitting...' : 'Submit Answer'}
                    </button>
                    <button onClick={handleSkip} className="btn-secondary" disabled={submitting}>
                      <SkipForward size={16} />
                      Skip
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <button
          className="btn-ghost"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        {isLast ? (
          <button onClick={handleComplete} className="btn-primary" disabled={submitting}>
            <CheckCircle size={16} />
            {submitting ? 'Completing...' : 'Complete Interview'}
          </button>
        ) : (
          <button
            className="btn-ghost"
            onClick={() => setCurrentIndex((i) => i + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
