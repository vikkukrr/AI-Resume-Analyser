import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Mic2, User, Trophy, Map,
  LogOut, Menu, X, Sun, Moon, ChevronRight, Shield,
  Sparkles, Bell, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resume/upload', icon: FileText,         label: 'Resume' },
  { to: '/interview',     icon: Mic2,             label: 'Interview' },
  { to: '/roadmap',       icon: Map,              label: 'Roadmap' },
  { to: '/leaderboard',   icon: Trophy,           label: 'Leaderboard' },
  { to: '/profile',       icon: User,             label: 'Profile' },
];

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `nav-item ${isActive ? 'nav-item-active' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className="flex-shrink-0" />
          <span className="flex-1">{label}</span>
          {isActive && <ChevronRight size={14} className="opacity-40" />}
        </>
      )}
    </NavLink>
  );
}

function Sidebar({ onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow flex-shrink-0">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-base text-slate-900 dark:text-white">CareerAI</span>
          <div className="text-[10px] text-slate-400 font-medium tracking-wide">Powered by Gemini</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto btn-ghost btn-icon text-slate-400">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}
        {isAdmin && (
          <NavItem to="/admin" icon={Shield} label="Admin Panel" onClick={onClose} />
        )}
      </nav>

      {/* Bottom controls */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="nav-item w-full justify-between"
        >
          <span className="flex items-center gap-3">
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
            {isDark ? 'Dark mode' : 'Light mode'}
          </span>
          <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${isDark ? 'bg-primary-600' : 'bg-slate-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.targetRole || 'No role set'}</p>
          </div>
          <button onClick={handleLogout} className="btn-ghost btn-icon text-slate-400 hover:text-red-500" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0d1117]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-[#161b27] border-r border-slate-200 dark:border-slate-800 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#161b27] border-r border-slate-200 dark:border-slate-800 lg:hidden flex flex-col shadow-2xl"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#161b27] border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost btn-icon">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">CareerAI</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
