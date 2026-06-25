import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic2, Play, Loader, FileText, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';

const ROLES = ['Frontend Developer','Backend Developer','Full Stack Developer','Java Developer','Python Developer','Data Scientist','DevOps Engineer','Mobile Developer'];
const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner', desc: 'Fundamentals & basics', color: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Real-world problems', color: 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' },
  { value: 'advanced', label: 'Advanced', desc: 'Senior-level depth', color: 'border-red-400 bg-red-50 dark:bg-red-900/20' },
];

export default function MockInterviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [config, setConfig] = useState({ targetRole: user?.targetRole || '', difficulty: 'intermediate', resumeId: '' });
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/resumes').then(r => setResumes(r.data.resumes?.filter(r => r.status === 'analyzed') || [])).catch(() => {});
    api.get('/interviews?limit=5').then(r => setHistory(r.data.interviews || [])).catch(() => {});
  }, []);

  const startInterview = async () => {
    if (!config.targetRole) { toast.error('Please select a target role'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/interviews/start', config);
      toast.success('Interview started! Answer thoughtfully.');
      navigate(`/interview/${data.interview._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate questions');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <PageHeader title="Mock Interview" subtitle="Practice with AI-generated role-specific questions evaluated by Gemini" />

      <div className="card p-6 space-y-6">
        {/* Role selection */}
        <div>
          <label className="label">Target Role *</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {ROLES.map(r => (
              <button key={r} onClick={() => setConfig({...config, targetRole: r})}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left border-2 transition-all ${config.targetRole === r ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="label">Difficulty Level</label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {DIFFICULTIES.map(d => (
              <button key={d.value} onClick={() => setConfig({...config, difficulty: d.value})}
                className={`p-3 rounded-xl border-2 text-left transition-all ${config.difficulty === d.value ? d.color : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{d.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Resume (optional) */}
        {resumes.length > 0 && (
          <div>
            <label className="label">Base on Resume <span className="font-normal text-slate-400">(optional — gets personalized questions)</span></label>
            <select className="input" value={config.resumeId} onChange={e => setConfig({...config, resumeId: e.target.value})}>
              <option value="">Use generic {config.targetRole || 'role'} questions</option>
              {resumes.map(r => <option key={r._id} value={r._id}>{r.originalName} (ATS: {r.analysis?.atsScore})</option>)}
            </select>
          </div>
        )}

        <button onClick={startInterview} disabled={loading || !config.targetRole} className="btn-primary w-full btn-lg shadow-glow">
          {loading ? <><Loader size={18} className="animate-spin" /> Generating 10 questions with Gemini…</> : <><Play size={18} /> Start Interview</>}
        </button>
        {!config.targetRole && <p className="text-xs text-center text-slate-400">Select a role above to continue</p>}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="section-title">Recent Interviews</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map(i => (
              <button key={i._id} onClick={() => navigate(i.status === 'completed' ? `/interview/${i._id}/result` : `/interview/${i._id}`)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left">
                <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <Mic2 size={16} className="text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{i.targetRole}</p>
                  <p className="text-xs text-slate-400 capitalize">{i.difficulty} · {new Date(i.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {i.status === 'completed' ? <span className={`text-sm font-bold ${i.totalScore >= 70 ? 'text-emerald-500' : i.totalScore >= 50 ? 'text-amber-500' : 'text-red-400'}`}>{i.totalScore}%</span> : <span className="badge-primary text-xs">Resume</span>}
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
