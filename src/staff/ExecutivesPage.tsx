import { Phone } from 'lucide-react';
import { api } from '../services/api';
import { PageHead, StatusBadge, inr, useLive } from './shared';

export default function ExecutivesPage() {
  const { data, error } = useLive(() => api.ops.overview());
  if (error) return <div className="card text-red-400">{error}</div>;
  if (!data) return <p className="text-text-muted">Loading…</p>;
  const ex = data.executives;
  return (
    <div>
      <PageHead title="Field executives" sub={`${ex.filter((e) => e.active && e.executive.online).length} of ${ex.length} online. Executives go online or offline from their own dashboard.`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {ex.map((e) => (
          <div key={e.id} className="card min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent-green/10 text-accent-green font-bold flex items-center justify-center">{e.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</div>
              <div className="min-w-0">
                <p className="font-bold truncate">{e.name}</p>
                <p className="text-xs text-text-muted">{e.executive.vehicleNumber} · {e.executive.zone}</p>
              </div>
              <span className={`ml-auto ${!e.active ? 'badge-red' : e.activeJob ? 'badge-cyan' : e.executive.online ? 'badge-green' : 'badge-gray'}`}>
                {!e.active ? 'Disabled' : e.activeJob ? 'Busy' : e.executive.online ? 'Available' : 'Offline'}
              </span>
            </div>
            <dl className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-brand-dark rounded-lg py-2"><dt className="text-[11px] text-text-muted">Rating</dt><dd className="font-bold">★ {e.executive.rating}</dd></div>
              <div className="bg-brand-dark rounded-lg py-2"><dt className="text-[11px] text-text-muted">Done today</dt><dd className="font-bold">{e.completedToday}</dd></div>
              <div className="bg-brand-dark rounded-lg py-2"><dt className="text-[11px] text-text-muted">Earned today</dt><dd className="font-bold">{inr(e.earningsToday)}</dd></div>
            </dl>
            {e.activeJob ? (
              <div className="mt-4 text-sm bg-brand-dark rounded-lg p-3">
                <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs">{e.activeJob.bookingNumber}</span><StatusBadge status={e.activeJob.status} /></div>
                <p className="text-text-secondary mt-1 truncate">{e.activeJob.customerName} · {e.activeJob.address}</p>
              </div>
            ) : null}
            {e.phone && <a href={`tel:${e.phone}`} className="mt-4 btn-secondary w-full !py-2 text-sm"><Phone size={15} /> {e.phone}</a>}
          </div>
        ))}
      </div>
    </div>
  );
}
