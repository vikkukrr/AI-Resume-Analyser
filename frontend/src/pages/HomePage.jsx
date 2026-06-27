import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FileText, Brain, Target, BarChart3, Upload, Search, Award, ArrowRight, Users, Sparkles, Mic } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 }
};

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.15 }
};

const features = [
  { icon: FileText, title: 'Resume Analysis', description: 'AI-powered ATS score analysis with detailed section-by-section breakdown and actionable recommendations.' },
  { icon: Mic, title: 'Mock Interviews', description: 'Practice with AI-driven mock interviews tailored to your target role with real-time evaluation.' },
  { icon: Target, title: 'Career Roadmap', description: 'Get a personalized career roadmap with milestones, skill recommendations, and salary projections.' },
  { icon: BarChart3, title: 'ATS Scoring', description: 'See exactly how your resume scores against ATS systems with keyword matching and formatting checks.' },
];

const steps = [
  { icon: Upload, step: '01', title: 'Upload Your Resume', description: 'Upload your resume in PDF or DOCX format. Our AI instantly analyzes the content and structure.' },
  { icon: Search, step: '02', title: 'Get AI Analysis', description: 'Receive detailed feedback on ATS score, missing keywords, formatting issues, and improvement suggestions.' },
  { icon: Award, step: '03', title: 'Practice & Improve', description: 'Use mock interviews, follow your career roadmap, and track your progress over time.' },
];

export default function HomePage() {
  const { user, startDemo } = useAuth();
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const counters = [
      { el: 'resumes', val: 1250 },
      { el: 'interviews', val: 840 },
      { el: 'users', val: 3200 },
      { el: 'score', val: 92 },
    ];
    setStats({ resumes: 1250, interviews: 840, users: 3200, score: 92 });
  }, []);

  const scrollToFeatures = () => featuresRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <span className="text-xl font-bold gradient-text">CareerAI</span>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary btn-sm">Dashboard</button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="btn-ghost btn-sm">Sign In</button>
                <button onClick={() => navigate('/register')} className="btn-primary btn-sm">Get Started</button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative pt-32 pb-20 px-4 bg-mesh overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                <Sparkles size={16} />
                AI-Powered Career Development
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                Supercharge Your
                <br />
                <span className="gradient-text">Career Journey</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Get AI-powered resume analysis, practice mock interviews, and follow a personalized career roadmap to land your dream job.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => navigate('/register')} className="btn-primary btn-lg text-base px-8">
                  Get Started Free
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => { startDemo(); navigate('/dashboard'); }}
                  className="btn-secondary btn-lg text-base px-8"
                >
                  Try Free Demo
                </button>
                <button onClick={scrollToFeatures} className="btn-ghost btn-lg text-base px-8">
                  Learn More
                </button>
              </div>
              <p className="muted mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</Link>
              </p>
            </motion.div>
          </div>
        </section>

        <section ref={featuresRef} className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-16" {...fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Powerful tools to help you optimize your resume, ace interviews, and plan your career growth.
              </p>
            </motion.div>
            <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" {...stagger}>
              {features.map((f) => (
                <motion.div key={f.title} className="card-hover p-6" variants={fadeUp}>
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                    <f.icon size={24} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="muted">{f.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-4 bg-slate-100 dark:bg-slate-800/50">
          <div className="max-w-5xl mx-auto">
            <motion.div className="text-center mb-16" {...fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Three simple steps to supercharge your career.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <motion.div key={s.step} className="relative text-center" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 mb-6">
                    <s.icon size={28} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-2 block">{s.step}</span>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="muted">{s.description}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 -right-4 text-slate-300 dark:text-slate-600">
                      <ArrowRight size={24} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8" {...fadeUp}>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">1,250+</div>
                <p className="muted">Resumes Analyzed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">840+</div>
                <p className="muted">Mock Interviews</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">3,200+</div>
                <p className="muted">Active Users</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">92%</div>
                <p className="muted">Success Rate</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-4 bg-primary-600 dark:bg-primary-800">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Transform Your Career?</h2>
              <p className="text-lg text-primary-100 mb-8">
                Join thousands of professionals who have accelerated their career growth with CareerAI.
              </p>
              <button onClick={() => navigate('/register')} className="bg-white text-primary-700 hover:bg-primary-50 font-semibold rounded-xl px-8 py-3 text-base transition-all hover:shadow-lg inline-flex items-center gap-2">
                Start Free Today
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="text-xl font-bold text-white">CareerAI</span>
              <p className="mt-2 text-sm">AI-powered career development platform.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Get Started</button></li>
                <li><button onClick={scrollToFeatures} className="hover:text-white transition-colors">Features</button></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="cursor-default">Help Center</span></li>
                <li><span className="cursor-default">Documentation</span></li>
                <li><span className="cursor-default">API Status</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="cursor-default">About</span></li>
                <li><span className="cursor-default">Privacy</span></li>
                <li><span className="cursor-default">Terms</span></li>
              </ul>
            </div>
          </div>
          <div className="divider border-slate-800 pt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} CareerAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
