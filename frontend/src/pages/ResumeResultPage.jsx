import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Lightbulb, TrendingUp, RefreshCw, Map, Briefcase, FileText, Star } from 'lucide-react';
import api from '../utils/api';
import { formatDate, scoreLabel, getScoreColor, scoreColor } from '../utils/helpers';
import ScoreRing from '../components/common/ScoreRing';
import { SkeletonCard } from '../components/common/SkeletonCard';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';

const sections = [
  { key: 'contact', label: 'Contact Information' },
  { key: 'summary', label: 'Professional Summary' },
  { key: 'experience', label: 'Work Experience' },
  { key: 'education', label: 'Education' },
  { key: 'skills', label: 'Skills' },
  { key: 'projects', label: 'Projects' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'formatting', label: 'Formatting & Layout' },
];

export default function ResumeResultPage() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);

  const fetchResume = async () => {
    try {
      const { data } = await api.get(`/resumes/${id}`);
      setResume(data.resume || data);
    } catch {
      toast.error('Failed to load resume analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, [id]);

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      await api.post(`/resumes/${id}/reanalyze`);
      toast.success('Reanalysis started!');
      setTimeout(() => {
        setLoading(true);
        fetchResume();
      }, 2000);
    } catch {
      toast.error('Failed to start reanalysis');
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Resume Analysis" />
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1"><SkeletonCard lines={4} /></div>
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} lines={2} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div>
        <PageHeader title="Resume Analysis" />
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="muted">Resume not found.</p>
        </div>
      </div>
    );
  }

  const atsScore = resume.atsScore ?? resume.analysis?.atsScore ?? 0;
  const sectionScores = resume.sectionScores || resume.analysis?.sectionScores || {};
  const analysis = resume.analysis || {};
  const jobMatches = resume.jobMatches || analysis.jobMatches || [];

  return (
    <div>
      <PageHeader title="Resume Analysis" subtitle={`Analyzed on ${formatDate(resume.analyzedAt || resume.createdAt)}`}>
        <button onClick={handleReanalyze} className="btn-secondary btn-sm" disabled={reanalyzing}>
          <RefreshCw size={14} className={reanalyzing ? 'animate-spin' : ''} />
          Reanalyze
        </button>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 text-center">
            <ScoreRing score={atsScore} size={140} />
            <p className="text-lg font-semibold mt-3">{resume.filename}</p>
            <p className={`text-sm font-medium ${scoreColor(atsScore)}`}>{scoreLabel(atsScore)}</p>
          </div>

          <div className="card p-6">
            <h3 className="section-title mb-4">Section Scores</h3>
            <div className="space-y-4">
              {sections.map((s) => {
                const sec = sectionScores[s.key];
                const score = sec?.score ?? sec ?? 0;
                const maxScore = sec?.maxScore ?? 100;
                const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
                const color = getScoreColor(pct);
                return (
                  <div key={s.key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{s.label}</span>
                      <span className={scoreColor(pct)}>{Math.round(score)}/{maxScore}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="section-title mb-4">Skills Analysis</h3>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Detected Skills</p>
              <div className="flex flex-wrap gap-2">
                {(analysis.detectedSkills || analysis.skills?.detected || []).length > 0 ? (
                  (analysis.detectedSkills || analysis.skills?.detected || []).map((s) => (
                    <span key={s} className="badge-success">{s}</span>
                  ))
                ) : (
                  <span className="muted">No skills detected</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Missing Skills</p>
              <div className="flex flex-wrap gap-2">
                {(analysis.missingSkills || analysis.skills?.missing || []).length > 0 ? (
                  (analysis.missingSkills || analysis.skills?.missing || []).map((s) => (
                    <span key={s} className="badge-warning">{s}</span>
                  ))
                ) : (
                  <span className="muted">No missing skills identified</span>
                )}
              </div>
            </div>
          </div>

          {(analysis.keywords || analysis.keywordAnalysis?.keywords || []).length > 0 && (
            <div className="card p-6">
              <h3 className="section-title mb-4">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {(analysis.keywords || analysis.keywordAnalysis?.keywords || []).map((kw) => (
                  <span key={kw} className="badge-primary">{kw}</span>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            {(analysis.strengths || analysis.feedback?.strengths || []).length > 0 && (
              <div className="card p-6">
                <h3 className="section-title mb-4 flex items-center gap-2 text-accent-600">
                  <CheckCircle size={18} /> Strengths
                </h3>
                <ul className="space-y-2">
                  {(analysis.strengths || analysis.feedback?.strengths || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle size={14} className="text-accent-500 mt-0.5 flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(analysis.weaknesses || analysis.feedback?.weaknesses || []).length > 0 && (
              <div className="card p-6">
                <h3 className="section-title mb-4 flex items-center gap-2 text-danger-600">
                  <XCircle size={18} /> Weaknesses
                </h3>
                <ul className="space-y-2">
                  {(analysis.weaknesses || analysis.feedback?.weaknesses || []).map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <XCircle size={14} className="text-danger-500 mt-0.5 flex-shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {(analysis.recommendations || analysis.feedback?.recommendations || []).length > 0 && (
            <div className="card p-6">
              <h3 className="section-title mb-4 flex items-center gap-2 text-primary-600">
                <Lightbulb size={18} /> Recommendations
              </h3>
              <ul className="space-y-3">
                {(analysis.recommendations || analysis.feedback?.recommendations || []).map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {jobMatches.length > 0 && (
            <div className="card p-6">
              <h3 className="section-title mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-primary-500" /> Job Matches
              </h3>
              <div className="space-y-3">
                {jobMatches.map((j, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{j.title}</p>
                        {j.company && <p className="text-sm muted">{j.company}</p>}
                      </div>
                      {j.matchScore !== null && j.matchScore !== undefined && (
                        <span className={`text-sm font-bold ${scoreColor(j.matchScore)}`}>{Math.round(j.matchScore)}%</span>
                      )}
                    </div>
                    {(j.requiredSkills || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(j.requiredSkills || []).map((skill) => (
                          <span key={skill} className="badge-slate text-xs">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card p-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
            <h3 className="section-title mb-2 flex items-center gap-2">
              <Map size={18} className="text-primary-500" /> Career Roadmap
            </h3>
            <p className="muted mb-4">Get a personalized career roadmap based on your resume analysis.</p>
            <Link to="/roadmap" className="btn-primary btn-sm">
              <TrendingUp size={14} /> View Roadmap
            </Link>
          </div>

          {analysis.summary && (
            <div className="card p-6">
              <h3 className="section-title mb-2">Summary</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{analysis.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
