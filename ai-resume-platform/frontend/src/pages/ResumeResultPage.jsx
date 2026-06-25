import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic2, RefreshCw, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Lightbulb, Map, Target, Loader, Download } from 'lucide-react';
import api from '../utils/api';
import ScoreRing from '../components/common/ScoreRing';
import { scoreColor, scoreLabel, formatDate } from '../utils/helpers';

const SECTION_LABELS = { contact:'Contact', summary:'Summary', experience:'Experience', education:'Education', skills:'Skills', projects:'Projects', certifications:'Certifications', formatting:'Formatting' };

function SectionRow({ name, score, maxScore, feedback, suggestions }) {
  const [open, setOpen] = useState(false);
  const pct = maxScore ? Math.round((score / maxScore) * 100) : 0;
  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{SECTION_LABELS[name] || name}</span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{score}/{maxScore}</span>
          </div>
          <div className="progress-bar"><div className={`progress-fill ${barColor}`} style={{ width: `${pct}%` }} /></div>
        </div>
        {open ? <ChevronUp size={15} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={15} className="text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          {feedback && <p className="text-sm text-slate-600 dark:text-slate-400">{feedback}</p>}
          {suggestions?.length > 0 && (
            <ul className="space-y-1">
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Lightbulb size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />{s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResumeResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  const fetch = async () => {
    try {
      const { data } = await api.get(`/resumes/${id}`);
      setResume(data.resume);
      if (data.resume.status === 'processing') setPolling(true);
    } catch { navigate('/resume/upload'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [id]);

  useEffect(() => {
    if (!polling) return;
    const timer = setInterval(async () => {
      try {
        const { data } = await api.get(`/resumes/${id}/status`);
        if (data.status !== 'processing') { clearInterval(timer); setPolling(false); fetch(); }
      } catch {}
    }, 3000);
    return () => clearInterval(timer);
  }, [polling]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  if (!resume) return null;

  if (resume.status === 'processing') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
      <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
      <div><p className="text-lg font-bold text-slate-900 dark:text-white">Analyzing your resume…</p>
      <p className="text-slate-400 text-sm mt-1">Gemini AI is reviewing your resume. Usually takes 15-30 seconds.</p></div>
    </div>
  );

  if (resume.status === 'failed') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <AlertCircle size={48} className="text-red-400" />
      <p className="text-lg font-semibold">Analysis failed</p>
      <p className="text-slate-400 text-sm">{resume.errorMessage || 'Something went wrong during analysis'}</p>
      <Link to="/resume/upload" className="btn-primary">Try Again</Link>
    </div>
  );

  const a = resume.analysis;
  const sLabel = scoreLabel(a.atsScore);
  const atsColor = a.atsScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : a.atsScore >= 60 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/resume/upload" className="btn-ghost btn-icon"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">{resume.originalName}</h1>
            <p className="text-xs text-slate-400">{formatDate(resume.createdAt)} · {resume.fileType?.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => api.post(`/resumes/${id}/reanalyze`).then(() => { setPolling(true); }).catch(() => {})} className="btn-ghost btn-sm"><RefreshCw size={13} /> Re-analyze</button>
          <Link to="/interview" className="btn-primary btn-sm"><Mic2 size={13} /> Practice Interview</Link>
        </div>
      </div>

      {/* Score + summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-6 flex flex-col items-center gap-4 md:col-span-1">
          <ScoreRing score={a.atsScore} size={150} strokeWidth={13} />
          <div className="text-center">
            <p className={`text-xl font-black ${atsColor}`}>{sLabel}</p>
            <p className="text-xs text-slate-400 mt-1">{a.experienceLevel} · ~{a.estimatedYearsExperience} yrs exp</p>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {a.detectedRoles?.slice(0, 3).map(r => <span key={r} className="badge-primary text-xs">{r}</span>)}
          </div>
        </div>

        <div className="card p-6 md:col-span-2 space-y-3">
          <h2 className="section-title">Section Scores</h2>
          <div className="space-y-2">
            {a.sections && Object.entries(a.sections).map(([k, v]) => v && (
              <SectionRow key={k} name={k} score={v.score || 0} maxScore={v.maxScore || 10} feedback={v.feedback} suggestions={v.suggestions} />
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" />Detected Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {a.detectedSkills?.length > 0 ? a.detectedSkills.map(s => <span key={s} className="badge-success text-xs">{s}</span>) : <p className="text-sm text-slate-400">No skills detected</p>}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2"><AlertCircle size={16} className="text-amber-500" />Missing Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {a.missingSkills?.length > 0 ? a.missingSkills.map(s => <span key={s} className="badge-warning text-xs">{s}</span>) : <p className="text-sm text-slate-400">No critical missing skills</p>}
          </div>
        </div>
      </div>

      {/* Strengths / Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="section-title mb-3">Strengths</h2>
          <ul className="space-y-2">{a.strengths?.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
        </div>
        <div className="card p-5">
          <h2 className="section-title mb-3">Areas to Improve</h2>
          <ul className="space-y-2">{a.weaknesses?.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
        </div>
      </div>

      {/* Recommendations */}
      {a.recommendations?.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2"><Lightbulb size={16} className="text-primary-500" />AI Recommendations</h2>
          <div className="space-y-2">
            {a.recommendations.map((r, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job matches */}
      {a.jobMatches?.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2"><Target size={16} className="text-blue-500" />Job Matches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {a.jobMatches.map((j, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{j.title}</p>
                  <span className={`text-sm font-bold flex-shrink-0 ml-2 ${scoreColor(j.matchScore)}`}>{j.matchScore}%</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{j.company}</p>
                {j.salary && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-2">{j.salary}</p>}
                <div className="flex flex-wrap gap-1">
                  {j.requiredSkills?.slice(0, 4).map(s => <span key={s} className="badge-slate text-xs">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Career roadmap teaser */}
      <div className="card p-6 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-200 dark:border-primary-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-glow"><Map size={18} className="text-white" /></div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Get Your Career Roadmap</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">AI-generated 4-phase plan with milestones & salary projections</p>
            </div>
          </div>
          <Link to="/roadmap" className="btn-primary">Generate Roadmap →</Link>
        </div>
      </div>
    </div>
  );
}
