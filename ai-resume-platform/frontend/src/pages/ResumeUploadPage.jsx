import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, Loader, AlertCircle, Zap, Clock } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatDate, scoreColor } from '../utils/helpers';
import PageHeader from '../components/common/PageHeader';

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  const [polling, setPolling] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    api.get('/resumes').then(r => setResumes(r.data.resumes || [])).catch(() => {}).finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!resumeId || !polling) return;
    const id = setInterval(async () => {
      try {
        const { data } = await api.get(`/resumes/${resumeId}/status`);
        if (data.status === 'analyzed') {
          clearInterval(id);
          setPolling(false);
          toast.success(`Analysis complete! ATS Score: ${data.atsScore}/100`);
          navigate(`/resume/${resumeId}`);
        } else if (data.status === 'failed') {
          clearInterval(id);
          setPolling(false);
          setUploading(false);
          toast.error('Analysis failed. Please try again.');
        }
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, [resumeId, polling, navigate]);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length) { toast.error('Only PDF/DOCX files under 10MB allowed'); return; }
    setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    disabled: uploading || polling,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const { data } = await api.post('/resumes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResumeId(data.resumeId);
      setPolling(true);
      toast.success('Uploaded! Gemini AI is analyzing your resume…');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
      setUploading(false);
    }
  };

  const fmtSize = (b) => b > 1024*1024 ? `${(b/1024/1024).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <PageHeader title="Resume Analyzer" subtitle="Upload your resume and get an ATS score, skill analysis, and AI-powered improvements" />

      <div {...getRootProps()} className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'} ${(uploading||polling) ? 'opacity-50 pointer-events-none' : ''}`}>
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto">
                <FileText size={28} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-slate-400">{fmtSize(file.size)}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); setFile(null); }} className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium">
                <X size={13} /> Remove file
              </button>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-all ${isDragActive ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Upload size={28} className={isDragActive ? 'text-primary-500' : 'text-slate-400'} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{isDragActive ? 'Drop it here!' : 'Drop your resume here'}</p>
                <p className="text-sm text-slate-400 mt-1">or <span className="text-primary-600 dark:text-primary-400 font-medium">browse files</span></p>
              </div>
              <p className="text-xs text-slate-400">PDF or DOCX · Max 10MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {file && !uploading && !polling && (
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={handleUpload} className="btn-primary w-full btn-lg shadow-glow">
          <Zap size={18} /> Analyze with Gemini AI
        </motion.button>
      )}

      {(uploading || polling) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full border-4 border-primary-100 dark:border-primary-900 border-t-primary-600 animate-spin mx-auto" />
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-lg">Gemini AI is analyzing your resume…</p>
            <p className="text-slate-400 text-sm mt-1">Extracting text, scoring sections, finding skill gaps</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400">
            {['Extracting text', 'Scoring sections', 'Finding skill gaps', 'Generating roadmap'].map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" style={{ animationDelay: `${i*0.3}s` }} />{s}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {resumes.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="section-title">Previous Resumes</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {resumes.map(r => (
              <div key={r._id} onClick={() => r.status === 'analyzed' && navigate(`/resume/${r._id}`)}
                className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${r.status === 'analyzed' ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60' : ''}`}>
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{r.originalName}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1"><Clock size={10} /> {formatDate(r.createdAt)}</p>
                </div>
                <div className="flex-shrink-0">
                  {r.status === 'analyzed' && <span className={`text-sm font-bold ${scoreColor(r.analysis?.atsScore || 0)}`}>{r.analysis?.atsScore || 0}/100</span>}
                  {r.status === 'processing' && <span className="badge-warning">Analyzing…</span>}
                  {r.status === 'failed' && <span className="badge-danger">Failed</span>}
                  {r.status === 'uploaded' && <Loader size={14} className="animate-spin text-slate-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
