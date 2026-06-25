export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Icon size={32} className="text-slate-400 dark:text-slate-500" />
        </div>
      )}
      {title && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
      {description && <p className="muted max-w-sm">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-6">
          {action.label}
        </button>
      )}
    </div>
  );
}
