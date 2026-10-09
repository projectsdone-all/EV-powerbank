import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, CheckCircle2, ChevronLeft, Navigation, Battery } from 'lucide-react';
import { api, STATUS_TEXT, type Booking } from '../services/api';
import { useApp } from '../hooks/useAppContext';
import CustomerMap from '../components/CustomerMap';
import { Modal, StatusBadge, inr, useLive } from '../staff/shared';

const STEPS: Booking['status'][] = ['ASSIGNED', 'ON_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'];
const ACTION: Partial<Record<Booking['status'], string>> = { ASSIGNED: 'Start trip', ON_ROUTE: 'I have arrived', ARRIVED: 'Start service', IN_PROGRESS: 'Complete job' };

export default function ExecutiveActiveJob() {
  const { addToast } = useApp();
  const { data, error, refresh } = useLive(() => api.executive.me(), 3000);
  const [paying, setPaying] = useState(false);
  const [mode, setMode] = useState<'UPI' | 'CASH' | 'CARD'>('UPI');
  const [busy, setBusy] = useState(false);

  if (error) return <div className="card text-red-400">{error}</div>;
  if (!data) return <p className="text-text-muted">Loading…</p>;
  const job = data.executive.activeJob;

  if (!job) {
    return (
      <div className="card text-center max-w-lg mx-auto mt-10">
        <CheckCircle2 size={36} className="mx-auto text-accent-green mb-3" />
        <h1 className="text-xl font-bold">No active job</h1>
        <p className="text-text-secondary text-sm mt-1">When a customer near you requests help, it will appear here.</p>
        <Link to="/executive/dashboard" className="btn-primary mt-5">Back to my jobs</Link>
      </div>
    );
  }

  const advance = async (payment?: 'UPI' | 'CASH' | 'CARD') => {
    setBusy(true);
    try {
      const r = await api.executive.advance(job.id, payment);
      addToast(r.booking.status === 'COMPLETED' ? `Job completed — ${inr(r.booking.total)} collected by ${payment}.` : r.message, 'success');
      setPaying(false);
      refresh();
    } catch (e) { addToast((e as Error).message, 'error'); }
    finally { setBusy(false); }
  };
  const stepIndex = STEPS.indexOf(job.status);
  const maps = `https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <Link to="/executive/dashboard" className="text-text-secondary hover:text-text-primary flex items-center gap-1 text-sm font-semibold"><ChevronLeft size={16} /> My jobs</Link>
        <StatusBadge status={job.status} />
      </div>

      <ol className="grid grid-cols-5 gap-1.5 mb-6" aria-label="Job progress">
        {STEPS.map((s, i) => (
          <li key={s} className="text-center">
            <div className={`h-1.5 rounded-full ${i <= stepIndex ? 'bg-accent-green' : 'bg-brand-border'}`} />
            <span className={`hidden sm:block text-[11px] mt-1.5 ${i <= stepIndex ? 'text-text-primary' : 'text-text-muted'}`}>{STATUS_TEXT[s]}</span>
          </li>
        ))}
      </ol>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{job.serviceLabel}</h1>
            <p className="text-text-muted font-mono text-xs mt-1">{job.bookingNumber}</p>
          </div>
          <div className="bg-brand-dark rounded-xl p-4 border border-brand-border-light">
            <p className="text-sm text-text-muted">Customer</p>
            <p className="font-bold">{job.customerName}</p>
            {job.customerPhone && <a href={`tel:${job.customerPhone}`} className="text-sm text-accent-cyan flex items-center gap-1 mt-1"><Phone size={14} /> {job.customerPhone}</a>}
          </div>
          <div className="bg-brand-dark rounded-xl p-4 border border-brand-border-light">
            <p className="text-sm text-text-muted">Vehicle</p>
            <p className="font-bold">{job.vehicleModel} <span className="font-mono text-sm text-text-secondary">{job.vehicleNumber}</span></p>
            <p className={`text-sm flex items-center gap-1 mt-1 ${job.batteryPercent <= 20 ? 'text-red-400' : 'text-text-secondary'}`}><Battery size={14} /> Battery {job.batteryPercent}%</p>
          </div>
          <div className="bg-brand-dark rounded-xl p-4 border border-brand-border-light flex gap-3">
            <MapPin className="text-accent-cyan shrink-0" size={18} />
            <div>
              <p className="text-sm font-semibold">{job.address}</p>
              {job.notes && <p className="text-xs text-text-muted italic mt-1">“{job.notes}”</p>}
              <a href={maps} target="_blank" rel="noreferrer" className="text-sm text-accent-cyan flex items-center gap-1 mt-2"><Navigation size={14} /> Navigate in Google Maps</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl overflow-hidden border border-brand-border h-72 md:flex-1 min-h-[280px] bg-white">
            <CustomerMap coords={{ lat: job.latitude, lng: job.longitude }} />
          </div>
          <button className="btn-primary w-full text-lg !py-4" disabled={busy}
            onClick={() => (job.status === 'IN_PROGRESS' ? setPaying(true) : advance())}>
            {ACTION[job.status]}
          </button>
        </div>
      </div>

      {paying && (
        <Modal title="Complete job" onClose={() => setPaying(false)}>
          <div className="space-y-2 bg-brand-dark rounded-xl p-4 border border-brand-border text-sm">
            <div className="flex justify-between"><span className="text-text-secondary">{job.serviceLabel}</span><span>{inr(job.amount)}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">GST (18%)</span><span>{inr(job.gst)}</span></div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-brand-border"><span>Collect from customer</span><span className="text-accent-green">{inr(job.total)}</span></div>
          </div>
          <p className="label-field mt-4">Paid by</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup">
            {(['UPI', 'CASH', 'CARD'] as const).map((m) => (
              <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)}
                className={`py-2.5 rounded-lg border text-sm font-semibold ${mode === m ? 'border-accent-green text-accent-green bg-accent-green/10' : 'border-brand-border-light text-text-secondary'}`}>{m}</button>
            ))}
          </div>
          <button className="btn-primary w-full mt-5" disabled={busy} onClick={() => advance(mode)}>Mark as paid & complete</button>
        </Modal>
      )}
    </div>
  );
}
