import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import ResumeResultPage from './pages/ResumeResultPage';
import MockInterviewPage from './pages/MockInterviewPage';
import InterviewSessionPage from './pages/InterviewSessionPage';
import InterviewResultPage from './pages/InterviewResultPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import RoadmapPage from './pages/RoadmapPage';
import AdminPage from './pages/AdminPage';

function LoadingScreen() {
  return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" /></div>;
}

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');
  if (loading) return <LoadingScreen />;
  if (!user && token) return <LoadingScreen />;
  if (!user && !token) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" />;
  if (!user && token) return <LoadingScreen />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resume/upload" element={<ResumeUploadPage />} />
        <Route path="/resume/:id" element={<ResumeResultPage />} />
        <Route path="/interview" element={<MockInterviewPage />} />
        <Route path="/interview/:id" element={<InterviewSessionPage />} />
        <Route path="/interview/:id/result" element={<InterviewResultPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
