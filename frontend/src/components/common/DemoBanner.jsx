import { useAuth } from '../../context/AuthContext';

export default function DemoBanner() {
  const { user } = useAuth();
  if (!user?.isDemo) return null;

  return (
    <div className="bg-amber-500 text-white text-center text-sm font-medium py-2.5 px-4">
      You're in Demo Mode —{' '}
      <a href="/register" className="underline font-semibold hover:text-amber-100 transition-colors">
        Create a free account
      </a>{' '}
      to save your progress.
    </div>
  );
}
