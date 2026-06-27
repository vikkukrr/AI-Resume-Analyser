import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, Clock, Loader2, Eye, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { formatDate, scoreColor } from '../utils/helpers';
import { SkeletonCard } from '../components/common/SkeletonCard';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import DemoModal from '../components/common/DemoModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const { isDemo } = useAuth();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  const [pastResumes, setPastResumes] = useState([]);
  const [loadingPast, setLoadingPast] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isDemo) {
      setShowDemoModal(true);
      setLoadingPast(false);
    }
  }, [isDemo]);

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }
    setFile(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: () => toast.error('Only .pdf and .docx files under 10MB are accepted'),
  });

  const fetchPastResumes = async (p) => {
    try {
      const { data } = await api.get(`/resumes?page=${p}&limit=10`);
      setPastResumes(data.resumes || data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Failed to load past resumes');
    } finally {
      setLoadingPast(false);
    }
  };

  useEffect(() => {
    fetchPastResumes(page);
  }, [page]);

  useEffect(() => {
    if (!resumeId || !processing) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/resumes/${resumeId}/status`);
        if (data.status === 'analyzed') {
          setProcessing(false);
          clearInterval(interval);
          toast.success('Resume analyzed successfully!');
          navigate(`/resume/${resumeId}`);
        } else if (data.status === 'failed') {
          setProcessing(false);
          clearInterval(interval);
          toast.error('Analysis failed. Please try again.');
          setFile(null);
          setResumeId(null);
        }
      } catch {
        setProcessing(false);
        clearInterval(interval);
        toast.error('Failed to check analysis status');
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [resumeId, processing, navigate]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const { data } = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resume uploaded! Analyzing...');
      setResumeId(data.id || data._id || data.resume?._id);
      setUploading(false);
      setProcessing(true);
    } catch (err) {
      setUploading(false);
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const removeFile = () => setFile(null);

  if (processing) {
    return (
      <div>
        <PageHeader title="Upload Resume" />
        <div className="max-w-lg mx-auto text-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="inline-flex mb-6">
            <Loader2 size={48} className="text-primary-500" />
          </motion.div>
          <h2 className="text-xl font-semibold mb-2">Analyzing your resume with AI...</h2>
          <p className="muted mb-8">This usually takes about 15-30 seconds</p>
          <div className="flex justify-center gap-2">
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 rounded-full bg-primary-500" />
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} className="w-2 h-2 rounded-full bg-primary-500" />
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} className="w-2 h-2 rounded-full bg-primary-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Upload Resume" subtitle="Upload your resume for AI-powered ATS analysis and scoring." />

      <div className="max-w-2xl mx-auto mb-10">
        <div
          {...getRootProps()}
          className={`card border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <Upload size={28} className="text-primary-600 dark:text-primary-400" />
          </div>
          {isDragActive ? (
            <p className="text-lg font-medium text-primary-600 dark:text-primary-400">Drop your resume here...</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-1">Drag & drop your resume here</p>
              <p className="muted">or click to browse (PDF, DOCX - max 10MB)</p>
            </>
          )}
        </div>

        {file && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={20} className="text-primary-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs muted">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={removeFile} className="btn-icon btn-ghost" disabled={uploading}>
                  <X size={16} />
                </button>
                <button onClick={handleUpload} className="btn-primary btn-sm" disabled={uploading}>
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Upload size={14} />
                      Upload
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div>
        <h2 className="section-title mb-4">Past Resumes</h2>
        {loadingPast ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={1} />)}
          </div>
        ) : pastResumes.length === 0 ? (
          <EmptyState icon={FileText} title="No resumes yet" description="Upload your first resume above to get started." />
        ) : (
          <>
            <div className="space-y-3">
              {pastResumes.map((r) => (
                <div key={r._id} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={18} className="text-slate-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.filename}</p>
                      <p className="text-xs muted">{formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {r.status === 'analyzed' ? (
                      <span className={`text-sm font-bold ${scoreColor(r.atsScore)}`}>{Math.round(r.atsScore)}%</span>
                    ) : r.status === 'processing' ? (
                      <span className="badge-warning flex items-center gap-1"><Clock size={12} /> Processing</span>
                    ) : r.status === 'failed' ? (
                      <span className="badge-danger">Failed</span>
                    ) : (
                      <span className="badge-slate">Pending</span>
                    )}
                    <Link to={`/resume/${r._id}`} className="btn-ghost btn-sm">
                      <Eye size={14} />
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button className="btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                <span className="text-sm muted">Page {page} of {totalPages}</span>
                <button className="btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
      <DemoModal open={showDemoModal} onClose={() => setShowDemoModal(false)} feature="Resume Upload" />
    </div>
  );
}
