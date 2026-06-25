import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Mic, Search, Shield, ToggleLeft, ToggleRight, Trash2, UserCog } from 'lucide-react';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import { SkeletonStat, SkeletonCard } from '../components/common/SkeletonCard';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats || data);
    } catch {
      toast.error('Failed to load admin stats');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchUsers = useCallback(async (p, q) => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 10 });
      if (q) params.set('search', q);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users || data.data || []);
      setTotalPages(data.pagination?.pages || data.totalPages || 1);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(page, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, fetchUsers]);

  const handleToggleActive = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle`);
      toast.success('User status toggled');
      fetchUsers(page, search);
    } catch {
      toast.error('Failed to toggle user status');
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      fetchUsers(page, search);
    } catch {
      toast.error('Failed to change role');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      setDeleteConfirm(null);
      fetchUsers(page, search);
      fetchStats();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div>
      <PageHeader title="Admin Panel" subtitle="Manage users and view platform statistics." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loadingStats ? (
          [1, 2, 3].map((i) => <SkeletonStat key={i} />)
        ) : (
          [
            { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-900/30' },
            { label: 'Total Resumes', value: stats?.totalResumes ?? 0, icon: FileText, color: 'text-accent-500', bg: 'bg-accent-100 dark:bg-accent-900/30' },
            { label: 'Total Interviews', value: stats?.totalInterviews ?? 0, icon: Mic, color: 'text-warning-500', bg: 'bg-warning-100 dark:bg-warning-900/30' },
          ].map((s) => (
            <div key={s.label} className="card p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={24} className={s.color} />
              </div>
              <div>
                <p className="muted">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="section-title">Users</h3>
          <div className="relative max-w-xs w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {loadingUsers ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} lines={1} />)}
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="Try adjusting your search query." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left pb-3 font-semibold text-slate-500">Name</th>
                    <th className="text-left pb-3 font-semibold text-slate-500">Email</th>
                    <th className="text-left pb-3 font-semibold text-slate-500">Role</th>
                    <th className="text-left pb-3 font-semibold text-slate-500">Status</th>
                    <th className="text-right pb-3 font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4">
                        <span className="font-medium truncate max-w-[150px] block">{u.name}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="muted truncate max-w-[200px] block">{u.email}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={u.role === 'admin' ? 'badge-primary capitalize' : 'badge-slate capitalize'}>{u.role}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={u.isActive !== false ? 'badge-success' : 'badge-danger'}>
                          {u.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleActive(u._id)}
                            className="btn-icon btn-ghost"
                            title={u.isActive !== false ? 'Deactivate' : 'Activate'}
                          >
                            {u.isActive !== false ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          <button
                            onClick={() => handleChangeRole(u._id, u.role)}
                            className="btn-icon btn-ghost"
                            title={`Change to ${u.role === 'admin' ? 'user' : 'admin'}`}
                          >
                            <UserCog size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(u._id)}
                            className="btn-icon btn-ghost text-danger-500 hover:text-danger-600"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="muted mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary btn-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger btn-sm">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
