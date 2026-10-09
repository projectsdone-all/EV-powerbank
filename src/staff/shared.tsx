import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { onDataChange, STATUS_SHORT, type BookingStatus } from '../services/api';

/** Loads data and reloads it whenever anything changes (this tab or another tab) */
export function useLive<T>(load: () => Promise<T>, everyMs = 5000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const loader = useRef(load);
  loader.current = load;
  const refresh = useCallback(() => {
    loader.current().then((d) => { setData(d); setError(''); }).catch((e: Error) => setError(e.message));
  }, []);
  useEffect(() => {
    refresh();
    const off = onDataChange(refresh);
    const t = window.setInterval(refresh, everyMs);
    return () => { off(); clearInterval(t); };
  }, [refresh, everyMs]);
  return { data, error, refresh };
}

const TONE: Record<BookingStatus, string> = {
  PENDING: 'badge-yellow', ASSIGNED: 'badge-cyan', ON_ROUTE: 'badge-cyan', ARRIVED: 'badge-green', IN_PROGRESS: 'badge-green',
  COMPLETED: 'badge-gray', CANCELLED: 'badge-red',
};
export const StatusBadge = ({ status }: { status: BookingStatus }) => <span className={TONE[status]}>{STATUS_SHORT[status]}</span>;

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode }) {
  return (
    <div className="card !p-4">
      <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">{icon}{label}</div>
      <p className="text-2xl sm:text-3xl font-bold mt-1.5">{value}</p>
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary" aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
export const timeAgo = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export function PageHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{title}</h1>
        {sub && <p className="text-text-secondary text-sm mt-1">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
