import { useState } from 'react';
import { Activity, Clock, CheckCircle2, IndianRupee, MapPin, Phone, Battery, XCircle } from 'lucide-react';
import { api, ACTIVE_STATUSES, type Booking } from '../services/api';
import { useApp } from '../hooks/useAppContext';
import { Modal, PageHead, Stat, StatusBadge, inr, timeAgo, useLive } from './shared';

type Filter = 'waiting' | 'active' | 'completed' | 'cancelled' | 'all';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'waiting', label: 'Waiting' }, { id: 'active', label: 'Active' }, { id: 'completed', label: 'Completed' }, { id: 'cancelled', label: 'Cancelled' }, { id: 'all', label: 'All' },
];

export default function DispatchBoard({ title = 'Dispatch' }: { title?: string }) {
  const { addToast } = useApp();
  const { data, error, refresh } = useLive(() => api.ops.overview());
  const [filter, setFilter] = useState<Filter>('active');
  const [cancelling, setCancelling] = useState<Booking | null>(null);
  const [reason, setReason] = useState('');

  if (error) return <div className="card text-red-400">{error}</div>;
  if (!data) return <p className="text-text-muted">Loading…</p>;

  const { bookings, executives, stats } = data;
  const shown = bookings.filter((b) =>
    filter === 'all' ? true : filter === 'waiting' ? b.status === 'PENDING' : filter === 'active' ? ACTIVE_STATUSES.includes(b.status)
      : filter === 'completed' ? b.status === 'COMPLETED' : b.status === 'CANCELLED');
  const count = (f: Filter) => bookings.filter((b) => f === 'all' || (f === 'waiting' ? b.status === 'PENDING' : f === 'active' ? ACTIVE_STATUSES.includes(b.status) : f === 'completed' ? b.status === 'COMPLETED' : b.status === 'CANCELLED')).length;

  const assign = async (b: Booking, execId: string) => {
    if (!execId) return;
    try { const r = await api.ops.assign(b.id, execId); addToast(`${b.bookingNumber}: ${r.message}`, 'success'); refresh(); }
    catch (e) { addToast((e as Error).message, 'error'); }
  };
  const doCancel = async () => {
    if (!cancelling) return;
    try { await api.ops.cancel(cancelling.id, reason.trim()); addToast(`${cancelling.bookingNumber} cancelled`, 'info'); setCancelling(null); setReason(''); refresh(); }
    catch (e) { addToast((e as Error).message, 'error'); }
  };

  return (
    <div>
      <PageHead title={title} sub="Every customer request, live. Assign waiting jobs to a free executive." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Waiting" value={stats.pending} hint="Need an executive" icon={<Clock size={16} className="text-yellow-400" />} />
        <Stat label="Active jobs" value={stats.active} icon={<Activity size={16} className="text-accent-cyan" />} />
        <Stat label="Completed today" value={stats.completedToday} icon={<CheckCircle2 size={16} className="text-accent-green" />} />
        <Stat label="Revenue today" value={inr(stats.revenueToday)} icon={<IndianRupee size={16} className="text-accent-green" />} />
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <section className="min-w-0">
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3" role="tablist">
            {FILTERS.map((f) => (
              <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${filter === f.id ? 'bg-accent-green text-brand-dark border-accent-green' : 'border-brand-border-light text-text-secondary hover:text-text-primary'}`}>
                {f.label} <span className="opacity-70">({count(f.id)})</span>
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <div className="card text-center text-text-muted text-sm">Nothing here right now.</div>
          ) : (
            <ul className="space-y-3">
              {shown.map((b) => {
                const free = executives.filter((e) => e.active && (!e.activeJob || e.activeJob.id === b.id));
                const canAssign = b.status === 'PENDING' || b.status === 'ASSIGNED';
                return (
                  <li key={b.id} className={`card !p-4 ${b.status === 'PENDING' ? 'border-yellow-500/40' : ''}`} data-booking={b.bookingNumber}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-text-muted">{b.bookingNumber}</span>
                          <StatusBadge status={b.status} />
                          <span className="text-xs text-text-muted">{timeAgo(b.createdAt)}</span>
                        </div>
                        <p className="font-semibold mt-1 break-words">{b.serviceLabel} · {b.vehicleModel} <span className="font-mono text-xs text-text-secondary">{b.vehicleNumber}</span></p>
                        <p className="text-sm text-text-secondary mt-1 flex items-center gap-1.5"><MapPin size={14} className="shrink-0" /><span className="truncate">{b.address}</span></p>
                        <p className="text-sm text-text-secondary mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span>{b.customerName}</span>
                          {b.customerPhone && <a href={`tel:${b.customerPhone}`} className="flex items-center gap-1 hover:text-accent-green"><Phone size={13} />{b.customerPhone}</a>}
                          <span className={`flex items-center gap-1 ${b.batteryPercent <= 20 ? 'text-red-400' : ''}`}><Battery size={14} />{b.batteryPercent}%</span>
                        </p>
                        {b.notes && <p className="text-xs text-text-muted mt-1.5 italic">“{b.notes}”</p>}
                        {b.cancelReason && <p className="text-xs text-red-400 mt-1.5">Reason: {b.cancelReason}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold">{inr(b.total)}</p>
                        {b.executiveName && <p className="text-xs text-text-secondary mt-1">{b.executiveName}{b.etaMinutes ? ` · ETA ${b.etaMinutes}m` : ''}</p>}
                      </div>
                    </div>
                    {(canAssign || ['ON_ROUTE'].includes(b.status)) && (
                      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-brand-border">
                        {canAssign && (
                          <label className="flex items-center gap-2 text-sm">
                            <span className="text-text-secondary">{b.status === 'PENDING' ? 'Assign to' : 'Re-assign'}</span>
                            <select
                              aria-label={`Assign ${b.bookingNumber}`}
                              className="bg-brand-dark border border-brand-border-light rounded-lg px-2.5 py-1.5 text-sm"
                              value={b.executiveId ?? ''}
                              onChange={(e) => assign(b, e.target.value)}
                            >
                              <option value="">Choose executive…</option>
                              {free.map((e) => (
                                <option key={e.id} value={e.id}>{e.name} — {e.executive.zone}{e.executive.online ? '' : ' (offline)'}</option>
                              ))}
                            </select>
                          </label>
                        )}
                        <button onClick={() => setCancelling(b)} className="ml-auto text-sm text-red-400 hover:text-red-300 flex items-center gap-1"><XCircle size={15} /> Cancel</button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside>
          <h2 className="font-bold mb-3">Executives</h2>
          <ul className="space-y-2">
            {executives.map((e) => (
              <li key={e.id} className="card !p-3.5 flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${!e.active ? 'bg-red-500' : e.activeJob ? 'bg-accent-cyan' : e.executive.online ? 'bg-accent-green' : 'bg-text-muted'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{e.name}</p>
                  <p className="text-xs text-text-muted truncate">
                    {!e.active ? 'Disabled' : e.activeJob ? `On ${e.activeJob.bookingNumber}` : e.executive.online ? 'Available' : 'Offline'} · {e.executive.zone}
                  </p>
                </div>
                <span className="text-xs text-text-secondary">★ {e.executive.rating}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {cancelling && (
        <Modal title={`Cancel ${cancelling.bookingNumber}?`} onClose={() => setCancelling(null)}>
          <p className="text-sm text-text-secondary mb-3">The customer will see this request as cancelled.</p>
          <label className="label-field" htmlFor="cancel-reason">Reason</label>
          <input id="cancel-reason" className="input-field" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Duplicate request" />
          <div className="flex gap-2 mt-5">
            <button className="btn-secondary flex-1" onClick={() => setCancelling(null)}>Keep it</button>
            <button className="btn-danger flex-1" onClick={doCancel}>Cancel request</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
