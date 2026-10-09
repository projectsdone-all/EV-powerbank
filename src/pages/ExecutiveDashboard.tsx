import { Link } from 'react-router-dom';
import { MapPin, Navigation, Phone, Battery, CheckCircle2, Star, IndianRupee } from 'lucide-react';
import { api, STATUS_TEXT } from '../services/api';
import { useApp } from '../hooks/useAppContext';
import { PageHead, Stat, StatusBadge, inr, timeAgo, useLive } from '../staff/shared';

export default function ExecutiveDashboard() {
  const { addToast } = useApp();
  const { data, error, refresh } = useLive(async () => ({ ...(await api.executive.me()), ...(await api.executive.jobs()) }), 3000);
  if (error) return <div className="card text-red-400">{error}</div>;
  if (!data) return <p className="text-text-muted">Loading…</p>;
  const { executive: me, bookings } = data;
  const job = me.activeJob;
  const history = bookings.filter((b) => b.id !== job?.id);

  const toggle = async () => {
    try { const r = await api.executive.setOnline(!me.executive.online); addToast(r.message, 'success'); refresh(); }
    catch (e) { addToast((e as Error).message, 'error'); }
  };

  return (
    <div>
      <PageHead
        title={`Hi, ${me.name.split(' ')[0]}`}
        sub={`${me.executive.vehicleNumber} · ${me.executive.zone}`}
        right={
          <button onClick={toggle} className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-semibold ${me.executive.online ? 'border-accent-green/50 text-accent-green bg-accent-green/10' : 'border-brand-border-light text-text-secondary'}`} aria-pressed={me.executive.online}>
            <span className={`w-2.5 h-2.5 rounded-full ${me.executive.online ? 'bg-accent-green' : 'bg-text-muted'}`} />
            {me.executive.online ? 'Online — tap to go offline' : 'Offline — tap to go online'}
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Done today" value={me.completedToday} icon={<CheckCircle2 size={16} className="text-accent-green" />} />
        <Stat label="Earned today" value={inr(me.earningsToday)} hint="30% of service fee" icon={<IndianRupee size={16} className="text-accent-green" />} />
        <Stat label="Rating" value={`★ ${me.executive.rating}`} icon={<Star size={16} className="text-yellow-400" />} />
        <Stat label="Total jobs" value={me.completedTotal} />
      </div>

      <h2 className="font-bold text-lg mb-3">Current job</h2>
      {job ? (
        <div className="card border-accent-cyan/50 mb-8">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <div className="flex items-center gap-2"><span className="font-mono text-xs text-text-muted">{job.bookingNumber}</span><StatusBadge status={job.status} /></div>
              <h3 className="text-xl font-bold mt-1">{job.serviceLabel}</h3>
              <p className="text-text-secondary">{job.vehicleModel} · <span className="font-mono">{job.vehicleNumber}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">Customer</p>
              <p className="font-bold">{job.customerName}</p>
              <p className={`text-sm flex items-center gap-1 justify-end ${job.batteryPercent <= 20 ? 'text-red-400' : 'text-text-secondary'}`}><Battery size={14} /> {job.batteryPercent}%</p>
            </div>
          </div>
          <p className="mt-4 bg-brand-dark rounded-xl p-3 border border-brand-border-light flex items-start gap-2 text-sm"><MapPin size={16} className="text-accent-cyan shrink-0 mt-0.5" />{job.address}{job.distanceKm ? ` · ${job.distanceKm} km` : ''}</p>
          {job.notes && <p className="text-sm text-text-muted italic mt-2">“{job.notes}”</p>}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <Link to="/executive/active-job" className="btn-primary flex-1"><Navigation size={18} /> Open job</Link>
            {job.customerPhone && <a href={`tel:${job.customerPhone}`} className="btn-secondary flex-1"><Phone size={18} /> Call customer</a>}
          </div>
        </div>
      ) : (
        <div className="card text-center text-text-secondary mb-8">
          {me.executive.online ? 'No job right now. New requests near you are assigned automatically.' : 'You are offline. Go online to receive jobs.'}
        </div>
      )}

      <h2 className="font-bold text-lg mb-3">Job history</h2>
      {history.length === 0 ? <p className="text-text-muted text-sm">No past jobs yet.</p> : (
        <ul className="space-y-2">
          {history.map((b) => (
            <li key={b.id} className="card !p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{b.serviceLabel} · {b.customerName}</p>
                <p className="text-xs text-text-muted truncate">{b.bookingNumber} · {timeAgo(b.updatedAt)} · {STATUS_TEXT[b.status]}{b.customerRating ? ` · rated ★${b.customerRating}` : ''}</p>
              </div>
              <div className="flex items-center gap-3"><StatusBadge status={b.status} /><span className="font-semibold">{inr(b.total)}</span></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
