import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FileText, Mic2, TrendingUp, Shield, Search,
  ToggleLeft, ToggleRight, Loader, ChevronLeft, ChevronRight,
  Trash2, UserCheck, UserX, Crown
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatDate, getInitials, scoreColor } from '../utils/helpers';
import PageHeader from '../components/common/PageHeader';
import { SkeletonStat } from '../components/common/SkeletonCard';

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="card p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setUsersLoading(true);
    const params = new URLSearchParams({ page, limit: 15, ...(search && { search }) });
    api.get(`/admin/users?${params}`)
      .then(r => { setUsers(r.data.users); setTotalPages(r.data.pages); })
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, [page, search]);

  const toggleUser = async (userId, name, current) => {
    setToggling(userId);
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle`);
      setUsers(u => u.map(usr => usr._id === userId ? { ...usr, isActive: data.isActive } : usr));
      toast.success(`${name} ${data.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update user'); }
    finally { setToggling(null); }
  };

  const deleteUser = async (userId, name) => {
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    setDeleting(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(u => u.filter(usr => usr._id !== userId));
      toast.success(`${name} deleted`);
    } catch { toast.error('Failed to delete user'); }
    finally { setDeleting(null); }
  };

  const promoteUser = async (userId, name, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`${newRole === 'admin' ? 'Promote' : 'Demote'} ${name} to ${newRole}?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(u => u.map(usr => usr._id === userId ? { ...usr, role: newRole } : usr));
      toast.success(`${name} is now ${newRole}`);
    } catch { toast.error('Failed to change role'); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Admin Panel"
        subtitle="Platform overview and user management"
        actions={
          <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5">
            <Shield size={13} /> Admin
          </span>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? Array(5).fill(0).map((_, i) => <SkeletonStat key={i} />) : stats && (
          <>
            <StatCard icon={Users} value={stats.stats.totalUsers} label="Total Users" color="bg-gradient-to-br from-primary-500 to-primary-700" />
            <StatCard icon={UserCheck} value={stats.stats.activeUsers} label="Active Users" color="bg-gradient-to-br from-accent-400 to-teal-600" />
            <StatCard icon={TrendingUp} value={stats.stats.newUsersThisMonth} label="New This Month" color="bg-gradient-to-br from-purple-500 to-purple-700" />
            <StatCard icon={FileText} value={stats.stats.totalResumes} label="Resumes Analyzed" color="bg-gradient-to-br from-blue-500 to-blue-700" />
            <StatCard icon={Mic2} value={stats.stats.totalInterviews} label="Interviews Done" color="bg-gradient-to-br from-amber-400 to-orange-500" />
          </>
        )}
      </div>

      {/* Top performers */}
      {stats?.topUsers?.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2"><Crown size={16} className="text-amber-500" />Top Performers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {stats.topUsers.slice(0, 5).map((u, i) => (
              <div key={u._id} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-bold mx-auto mb-2">
                  {getInitials(u.name)}
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                <p className={`text-sm font-black mt-0.5 ${scoreColor(u.avgInterviewScore)}`}>{u.avgInterviewScore}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <h2 className="section-title">All Users</h2>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9 py-2 text-sm w-64"
              placeholder="Search name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-semibold">User</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Role</th>
                <th className="text-center px-4 py-3 font-semibold hidden lg:table-cell">Resumes</th>
                <th className="text-center px-4 py-3 font-semibold hidden lg:table-cell">Interviews</th>
                <th className="text-center px-4 py-3 font-semibold hidden md:table-cell">Avg Score</th>
                <th className="text-left px-4 py-3 font-semibold hidden xl:table-cell">Last Login</th>
                <th className="text-center px-4 py-3 font-semibold">Status</th>
                <th className="text-center px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {usersLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="skeleton h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">No users found</td></tr>
              ) : (
                users.map(u => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">{u.name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[140px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`badge text-xs ${u.role === 'admin' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'badge-slate'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 hidden lg:table-cell">{u.resumeCount}</td>
                    <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 hidden lg:table-cell">{u.interviewCount}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className={`font-bold ${scoreColor(u.avgInterviewScore)}`}>{u.avgInterviewScore > 0 ? `${u.avgInterviewScore}%` : '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 hidden xl:table-cell">
                      {u.lastLogin ? formatDate(u.lastLogin) : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {toggling === u._id ? (
                        <Loader size={18} className="animate-spin text-slate-400 mx-auto" />
                      ) : (
                        <button onClick={() => toggleUser(u._id, u.name, u.isActive)} disabled={u.role === 'admin'} title={u.isActive ? 'Deactivate' : 'Activate'}
                          className={`transition-colors disabled:opacity-30 ${u.isActive ? 'text-accent-500 hover:text-accent-600' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}>
                          {u.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => promoteUser(u._id, u.name, u.role)} title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                          className="btn-ghost btn-icon text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                          <Crown size={14} />
                        </button>
                        <button onClick={() => deleteUser(u._id, u.name)} disabled={u.role === 'admin' || deleting === u._id}
                          className="btn-ghost btn-icon text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30">
                          {deleting === u._id ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary btn-sm disabled:opacity-40">
                <ChevronLeft size={14} /> Prev
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary btn-sm disabled:opacity-40">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
