import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Play, FileText } from 'lucide-react';
import api from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import { SkeletonCard } from '../components/common/SkeletonCard';
import DemoModal from '../components/common/DemoModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const difficulties = [
  { value: 'beginner', label: 'Beginner', description: 'Basic questions covering fundamental concepts and common interview topics.' },
  { value: 'intermediate', label: 'Intermediate', description: 'Moderate questions requiring deeper understanding and practical experience.' },
  { value: 'advanced', label: 'Advanced', description: 'Challenging questions testing deep expertise and complex problem-solving.' },
];

export default function MockInterviewPage() {
  const navigate = useNavigate();
  const { isDemo } = useAuth();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setShowDemoModal(true);
      setLoadingResumes(false);
    }
  }, [isDemo]);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const { data } = await api.get('/resumes?limit=50');
        setResumes(data.resumes || data.data || []);
      } catch {
        // non-critical
      } finally {
        setLoadingResumes(false);
      }
    };
    fetchResumes();
  }, []);

  const handleStart = async () => {
    if (!targetRole.trim()) {
      toast.error('Please enter a target role');
      return;
    }
    setLoading(true);
    try {
      const payload = { targetRole: targetRole.trim(), difficulty };
      if (selectedResume) payload.resumeId = selectedResume;
      const { data } = await api.post('/interviews/start', payload);
      toast.success('Interview started!');
      navigate(`/interview/${data.id || data._id || data.interview?._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Mock Interview" subtitle="Practice with AI-powered mock interviews tailored to your target role." />

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="card p-8 space-y-6">
          <div>
            <label className="label" htmlFor="targetRole">Target Role</label>
            <input
              id="targetRole"
              type="text"
              className="input"
              placeholder="e.g. Senior Software Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Difficulty Level</label>
            <div className="grid sm:grid-cols-3 gap-4">
              {difficulties.map((d) => (
                <motion.div
                  key={d.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDifficulty(d.value)}
                  className={`card p-4 cursor-pointer border-2 transition-all ${
                    difficulty === d.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      difficulty === d.value ? 'border-primary-500' : 'border-slate-400'
                    }`}>
                      {difficulty === d.value && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                    </div>
                    <span className="text-sm font-semibold">{d.label}</span>
                  </div>
                  <p className="text-xs muted ml-6">{d.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="resumeSelect">Resume (Optional)</label>
            {loadingResumes ? (
              <SkeletonCard lines={1} />
            ) : (
              <select
                id="resumeSelect"
                className="input"
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
              >
                <option value="">No resume selected</option>
                {resumes.filter((r) => r.status === 'analyzed').map((r) => (
                  <option key={r._id} value={r._id}>{r.filename}</option>
                ))}
              </select>
            )}
          </div>

          <button onClick={handleStart} className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Starting Interview...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play size={18} />
                Start Interview
              </span>
            )}
          </button>
        </div>
      </div>
      <DemoModal open={showDemoModal} onClose={() => setShowDemoModal(false)} feature="Mock Interview" />
    </div>
  );
}
