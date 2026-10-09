import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../hooks/useAppContext';

export default function Toasts() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" aria-live="polite">
      {toasts.map(toast => {
        const Icon = 
          toast.type === 'success' ? CheckCircle :
          toast.type === 'error' ? AlertCircle :
          toast.type === 'warning' ? AlertTriangle : Info;

        const colors = 
          toast.type === 'success' ? 'bg-accent-green/10 border-accent-green/20 text-accent-green' :
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
          toast.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
          'bg-brand-elevated border-brand-border-light text-text-primary';

        return (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 border rounded-xl shadow-lg shadow-black/20 backdrop-blur-md animate-slide-up max-w-sm ${colors}`}
            role="alert"
          >
            <Icon size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium pr-6">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="absolute top-4 right-4 text-current opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
