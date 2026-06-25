import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, Mic, Trophy, Map, User, Shield,
  LogOut, Menu, X, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/helpers';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume/upload', label: 'Resume Upload', icon: Upload },
  { to: '/interview', label: 'Interview', icon: Mic },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6">
        <NavLink to="/dashboard" className="text-2xl font-bold gradient-text">
          CareerAI
        </NavLink>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={isActive(item.to) ? 'nav-item-active' : 'nav-item'}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className={isActive('/admin') ? 'nav-item-active' : 'nav-item'}
          >
            <Shield size={20} />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={toggleTheme}
          className="nav-item w-full mb-2"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="btn-icon btn-ghost flex-shrink-0" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <span className="text-lg font-bold gradient-text">CareerAI</span>
        <button onClick={() => setMobileOpen(true)} className="btn-icon btn-ghost">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-xl"
            >
              <div className="absolute top-3 right-3">
                <button onClick={() => setMobileOpen(false)} className="btn-icon btn-ghost">
                  <X size={20} />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="pt-14 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
