import { X } from 'lucide-react';

export default function DemoModal({ open, onClose, feature }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 btn-icon btn-ghost">
          <X size={20} />
        </button>
        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚀</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Sign Up to Use This Feature</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {feature
            ? `Create a free account to use the ${feature} feature and track your progress.`
            : 'Create a free account to access this feature and track your progress.'}
        </p>
        <div className="flex flex-col gap-3">
          <a href="/register" className="btn-primary w-full justify-center">
            Create Free Account
          </a>
          <button onClick={onClose} className="btn-ghost w-full justify-center">
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
