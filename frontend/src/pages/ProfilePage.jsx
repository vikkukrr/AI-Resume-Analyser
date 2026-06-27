import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Lock, X, Plus, Linkedin, Github, Globe, User, Mail, Briefcase, MapPin } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import { SkeletonCard } from '../components/common/SkeletonCard';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, isDemo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    if (isDemo) {
      setName(user?.name || '');
      setEmail(user?.email || '');
      setBio(user?.bio || '');
      setTargetRole(user?.targetRole || '');
      setLocation(user?.location || '');
      setSkills(user?.skills || []);
      setLinkedin(user?.socialLinks?.linkedin || '');
      setGithub(user?.socialLinks?.github || '');
      setWebsite(user?.socialLinks?.website || '');
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        const p = data.user || data;
        setName(p.name || '');
        setEmail(p.email || '');
        setBio(p.bio || '');
        setTargetRole(p.targetRole || '');
        setLocation(p.location || '');
        setSkills(p.skills || []);
        setLinkedin(p.socialLinks?.linkedin || p.linkedin || '');
        setGithub(p.socialLinks?.github || p.github || '');
        setWebsite(p.socialLinks?.website || p.website || '');
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isDemo, user]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      toast.error('Skill already added');
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        name: name.trim(),
        bio: bio.trim(),
        targetRole: targetRole.trim(),
        location: location.trim(),
        skills,
        socialLinks: { linkedin: linkedin.trim(), github: github.trim(), website: website.trim() },
      });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Profile" />
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your personal information and settings." />

      <div className="max-w-2xl mx-auto space-y-8">
        {isDemo ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
              <User size={28} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Demo Profile</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              This is a read-only demo profile. Create a free account to build and customize your real profile.
            </p>
            <a href="/register" className="btn-primary inline-flex items-center gap-2">
              Create Free Account
            </a>
          </div>
        ) : (
          <>
            <div className="card p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {getInitials(name)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{name || 'Your Name'}</h2>
                  <p className="muted">{email}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label"><User size={14} className="inline mr-1" /> Name</label>
                  <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="label"><Mail size={14} className="inline mr-1" /> Email</label>
                  <input type="email" className="input" value={email} disabled />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Bio</label>
                  <textarea className="input min-h-[80px] resize-y" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." />
                </div>
                <div>
                  <label className="label"><Briefcase size={14} className="inline mr-1" /> Target Role</label>
                  <input type="text" className="input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Software Engineer" />
                </div>
                <div>
                  <label className="label"><MapPin size={14} className="inline mr-1" /> Location</label>
                  <input type="text" className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" />
                </div>
              </div>

              <div className="mt-5">
                <label className="label">Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((s) => (
                    <span key={s} className="badge-primary flex items-center gap-1">
                      {s}
                      <button onClick={() => removeSkill(s)} className="hover:text-primary-700"><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Type a skill and press Enter"
                  />
                  <button onClick={addSkill} className="btn-secondary btn-sm"><Plus size={16} /></button>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-5">
                <div>
                  <label className="label"><Linkedin size={14} className="inline mr-1" /> LinkedIn</label>
                  <input type="url" className="input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="label"><Github size={14} className="inline mr-1" /> GitHub</label>
                  <input type="url" className="input" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="label"><Globe size={14} className="inline mr-1" /> Website</label>
                  <input type="url" className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} className="btn-primary" disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="card p-8">
              <h3 className="section-title mb-6 flex items-center gap-2">
                <Lock size={18} className="text-primary-500" /> Change Password
              </h3>
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="label">Current Password</label>
                  <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input type="password" className="input" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                </div>
                <button onClick={handleChangePassword} className="btn-secondary" disabled={changingPassword}>
                  <Lock size={16} />
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
