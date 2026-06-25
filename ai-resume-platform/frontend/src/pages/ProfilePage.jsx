import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Save, Loader, Github, Globe, Linkedin, Mic2, FileText, Award, MapPin, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { getInitials, scoreColor } from '../utils/helpers';
import PageHeader from '../components/common/PageHeader';

const ROLES = ['Frontend Developer','Backend Developer','Full Stack Developer','Java Developer','Python Developer','Data Scientist','DevOps Engineer','Mobile Developer'];
const COMMON_SKILLS = ['JavaScript','TypeScript','React','Vue.js','Angular','Node.js','Python','Java','Go','Rust','SQL','MongoDB','PostgreSQL','Redis','AWS','GCP','Azure','Docker','Kubernetes','Git','REST API','GraphQL','CI/CD','Linux','Spring Boot','Django','FastAPI','Next.js','Tailwind CSS'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    targetRole: user?.targetRole || '',
    skills: user?.skills || [],
    linkedIn: user?.linkedIn || '',
    github: user?.github || '',
    website: user?.website || '',
    location: user?.location || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [customSkill, setCustomSkill] = useState('');

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', profile);
      updateUser(data.user);
      toast.success('Profile saved!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const toggleSkill = (skill) => {
    setProfile(p => ({
      ...p,
      skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill]
    }));
  };

  const addCustomSkill = () => {
    if (!customSkill.trim()) return;
    if (!profile.skills.includes(customSkill.trim())) {
      setProfile(p => ({ ...p, skills: [...p.skills, customSkill.trim()] }));
    }
    setCustomSkill('');
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'security', icon: Lock, label: 'Security' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <PageHeader title="Profile Settings" subtitle="Manage your account information and preferences" />

      {/* Profile card */}
      <div className="card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-black shadow-glow flex-shrink-0">
          {getInitials(user?.name)}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          {user?.targetRole && <span className="badge-primary text-xs mt-1 inline-block">{user.targetRole}</span>}
          <div className="flex items-center justify-center sm:justify-start gap-5 mt-3 text-sm">
            <div className="text-center"><p className="font-bold text-slate-900 dark:text-white">{user?.resumeCount || 0}</p><p className="text-xs text-slate-400">Resumes</p></div>
            <div className="text-center"><p className="font-bold text-slate-900 dark:text-white">{user?.interviewCount || 0}</p><p className="text-xs text-slate-400">Interviews</p></div>
            <div className="text-center"><p className={`font-bold ${scoreColor(user?.avgInterviewScore || 0)}`}>{user?.avgInterviewScore || 0}%</p><p className="text-xs text-slate-400">Avg Score</p></div>
            <div className="text-center"><p className="font-bold text-slate-900 dark:text-white">{user?.bestAtsScore || 0}</p><p className="text-xs text-slate-400">Best ATS</p></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>
            <div>
              <label className="label">Target Role</label>
              <select className="input" value={profile.targetRole} onChange={e => setProfile({...profile, targetRole: e.target.value})}>
                <option value="">Select role…</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea className="input resize-none" rows={3} placeholder="A short bio about yourself…" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
          </div>

          <div>
            <label className="label flex items-center gap-1"><MapPin size={13} />Location</label>
            <input className="input" placeholder="e.g. San Francisco, CA" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} />
          </div>

          {/* Skills */}
          <div>
            <label className="label">Skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_SKILLS.map(s => (
                <button key={s} onClick={() => toggleSkill(s)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${profile.skills.includes(s) ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-400'}`}>
                  {s}
                </button>
              ))}
            </div>
            {/* Custom skill input */}
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Add custom skill…" value={customSkill} onChange={e => setCustomSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomSkill()} />
              <button onClick={addCustomSkill} className="btn-secondary"><Plus size={15} /></button>
            </div>
            {profile.skills.filter(s => !COMMON_SKILLS.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.skills.filter(s => !COMMON_SKILLS.includes(s)).map(s => (
                  <span key={s} className="badge-primary text-xs flex items-center gap-1">
                    {s}
                    <button onClick={() => toggleSkill(s)} className="hover:text-red-300"><X size={11} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Social links */}
          <div className="space-y-3">
            <label className="label">Social & Portfolio Links</label>
            {[
              { icon: Linkedin, key: 'linkedIn', placeholder: 'linkedin.com/in/yourname' },
              { icon: Github, key: 'github', placeholder: 'github.com/yourname' },
              { icon: Globe, key: 'website', placeholder: 'yourportfolio.com' },
            ].map(({ icon: Icon, key, placeholder }) => (
              <div key={key} className="relative">
                <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-10" placeholder={placeholder} value={profile[key]} onChange={e => setProfile({...profile, [key]: e.target.value})} />
              </div>
            ))}
          </div>

          <button onClick={saveProfile} disabled={saving} className="btn-primary">
            {saving ? <><Loader size={15} className="animate-spin" />Saving…</> : <><Save size={15} />Save Profile</>}
          </button>
        </motion.div>
      )}

      {tab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-5">
          <h2 className="section-title">Change Password</h2>
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" placeholder="Enter current password" value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" placeholder="At least 8 characters" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" placeholder="Repeat new password" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} />
          </div>
          <button onClick={changePassword} disabled={saving} className="btn-primary">
            {saving ? <><Loader size={15} className="animate-spin" />Changing…</> : <><Lock size={15} />Change Password</>}
          </button>

          <div className="divider" />
          <div>
            <h3 className="section-title text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Deactivate your account. This action is reversible by contacting support.</p>
            <button onClick={async () => {
              if (!confirm('Are you sure you want to deactivate your account?')) return;
              await api.delete('/users/account');
              toast.error('Account deactivated');
              window.location.href = '/';
            }} className="btn-danger btn-sm">Deactivate Account</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
