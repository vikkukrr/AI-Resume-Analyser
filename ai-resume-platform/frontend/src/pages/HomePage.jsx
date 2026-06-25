import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Mic2, BarChart3, Map, Trophy, ArrowRight, CheckCircle, Zap, Brain, Target, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: FileText, gradient: 'from-blue-500 to-primary-600', title: 'ATS Resume Analyzer', desc: 'Upload PDF or DOCX. Get an ATS score out of 100, section-by-section breakdown, skill gap analysis, and keyword recommendations.' },
  { icon: Mic2, gradient: 'from-primary-500 to-purple-600', title: 'AI Mock Interviews', desc: 'Practice role-specific questions. Every answer is evaluated by Gemini AI with a score, model answer, and improvement tips.' },
  { icon: BarChart3, gradient: 'from-accent-400 to-teal-600', title: 'Performance Analytics', desc: 'Track ATS score and interview performance over time with beautiful charts and detailed breakdowns.' },
  { icon: Map, gradient: 'from-orange-400 to-rose-500', title: 'AI Career Roadmap', desc: 'Get a personalized 4-phase career plan with milestones, skill recommendations, and salary projections.' },
  { icon: Trophy, gradient: 'from-yellow-400 to-amber-500', title: 'Leaderboard', desc: 'See how you rank against other candidates. Climb the leaderboard by improving your scores.' },
  { icon: Target, gradient: 'from-pink-500 to-rose-600', title: 'Job Match Analysis', desc: 'AI identifies best-fit job titles for your profile with match scores and required skills.' },
];

const ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Java Developer', 'Python Developer', 'Data Scientist', 'DevOps Engineer'];

export default function HomePage() {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] overflow-x-hidden">
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">CareerAI</span>
            <span className="hidden sm:block badge-primary text-[10px]">Gemini Free</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-ghost btn-icon text-slate-500">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <Link to="/dashboard" className="btn-primary">Dashboard <ArrowRight size={15} /></Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost hidden sm:flex">Sign in</Link>
                <Link to="/register" className="btn-primary">Get started free <ArrowRight size={15} /></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 bg-mesh">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 badge-primary px-4 py-1.5 text-xs mb-8 rounded-full">
            <Brain size={13} /> Powered by Google Gemini 2.5 Flash — Free Tier
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 text-slate-900 dark:text-white">
            Land your dream job with <span className="gradient-text">AI-powered</span> career tools
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Analyze your resume for ATS compatibility, practice mock interviews with real-time AI feedback, and get a personalized career roadmap — all free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary btn-lg w-full sm:w-auto shadow-glow">
              Analyze my resume free <Zap size={18} />
            </Link>
            <Link to="/login" className="btn-secondary btn-lg w-full sm:w-auto">Sign in to dashboard</Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-500 dark:text-slate-400">
            {['No credit card required', 'Free Gemini API', 'Instant ATS score', 'AI mock interviews'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle size={14} className="text-accent-500" />{t}</span>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Everything you need to get hired</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Powered by Google Gemini 2.5 Flash</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card-hover p-6 group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  <f.icon size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900/40">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Supports your target role</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10">Role-specific questions and tailored feedback for every career path</p>
          <div className="flex flex-wrap justify-center gap-3">
            {ROLES.map(role => (
              <span key={role} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">{role}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card p-10 bg-gradient-to-br from-primary-600 to-primary-800 border-0 text-center shadow-2xl shadow-primary-500/30">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6"><Sparkles size={28} className="text-white" /></div>
            <h2 className="text-3xl font-black text-white mb-3">Ready to level up your career?</h2>
            <p className="text-primary-200 mb-8 text-base">Join thousands who improved their ATS score and interview skills with CareerAI.</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg text-base">Start for free <ArrowRight size={18} /></Link>
            <p className="text-primary-300/80 text-xs mt-4">No credit card required · Free Gemini AI</p>
          </div>
        </div>
      </section>
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} CareerAI — AI-powered by Google Gemini 2.5 Flash (Free Tier)
      </footer>
    </div>
  );
}
