import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, IndianRupee, Users, Truck, Clock } from 'lucide-react';
import { api, ROLE_LABEL, type Role } from '../services/api';
import { useApp } from '../hooks/useAppContext';
import { PageHead, Stat, StatusBadge, inr, timeAgo, useLive } from './shared';

export default function AdminOverview() {
  const { addToast } = useApp();
  const { data, error, refresh } = useLive(async () => ({ ...(await api.ops.overview()), users: (await api.admin.users()).users }));
  if (error) return <div className="card text-red-400">{error}</div>;
  if (!data) return <p className="text-text-muted">Loading…</p>;
  const { stats, bookings, executives, users } = data;
  const roles: Role[] = ['ADMIN', 'MANAGER', 'EXECUTIVE', 'CUSTOMER'];
  const byService = ['mobile', 'battery', 'emergency'].map((t) => ({ t, n: bookings.filter((b) => b.serviceType === t && b.status !== 'CANCELLED').length }));
  const maxSvc = Math.max(1, ...byService.map((s) => s.n));

  const reset = async () => {
    if (!window.confirm('Restore all demo users, vehicles and bookings? Everything added since will be removed.')) return;
    try { await api.admin.resetDemoData(); addToast('Demo data restored', 'success'); refresh(); } catch (e) { addToast((e as Error).message, 'error'); }
  };

  return (
    <div>
      <PageHead title="Command center" sub="The whole business at a glance." right={<button onClick={reset} className="btn-ghost text-sm border border-brand-border-light">Restore demo data</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <Stat label="Active jobs" value={stats.active} icon={<Activity size={16} className="text-accent-cyan" />} />
        <Stat label="Waiting" value={stats.pending} icon={<Clock size={16} className="text-yellow-400" />} />
        <Stat label="Done today" value={stats.completedToday} icon={<CheckCircle2 size={16} className="text-accent-green" />} />
        <Stat label="Revenue today" value={inr(stats.revenueToday)} icon={<IndianRupee size={16} className="text-accent-green" />} />
        <Stat label="Total revenue" value={inr(stats.revenueTotal)} icon={<IndianRupee size={16} />} />
        <Stat label="Customers" value={stats.customers} icon={<Users size={16} />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="card lg:col-span-2 !p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-bold">Latest requests</h2>
            <Link to="/admin/dispatch" className="text-sm text-accent-green hover:underline">Open dispatch</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-text-muted border-b border-brand-border"><th className="px-5 py-2 font-medium">Booking</th><th className="px-3 py-2 font-medium">Customer</th><th className="px-3 py-2 font-medium">Executive</th><th className="px-3 py-2 font-medium">Status</th><th className="px-5 py-2 font-medium text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-brand-border">
                {bookings.slice(0, 8).map((b) => (
                  <tr key={b.id}>
                    <td className="px-5 py-3"><span className="font-mono text-xs">{b.bookingNumber}</span><br /><span className="text-xs text-text-muted">{timeAgo(b.createdAt)}</span></td>
                    <td className="px-3 py-3">{b.customerName}<br /><span className="text-xs text-text-muted">{b.serviceLabel}</span></td>
                    <td className="px-3 py-3">{b.executiveName ?? <span className="text-yellow-400">Unassigned</span>}</td>
                    <td className="px-3 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-5 py-3 text-right font-semibold">{inr(b.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="card">
            <div className="flex items-center justify-between mb-3"><h2 className="font-bold">Team & users</h2><Link to="/admin/users" className="text-sm text-accent-green hover:underline">Manage</Link></div>
            <ul className="space-y-2 text-sm">
              {roles.map((r) => (
                <li key={r} className="flex justify-between"><span className="text-text-secondary">{ROLE_LABEL[r]}s</span><span className="font-semibold">{users.filter((u) => u.role === r).length}</span></li>
              ))}
              <li className="flex justify-between pt-2 border-t border-brand-border"><span className="text-text-secondary flex items-center gap-1.5"><Truck size={14} /> Executives online</span><span className="font-semibold">{executives.filter((e) => e.active && e.executive.online).length}/{executives.length}</span></li>
            </ul>
          </section>
          <section className="card">
            <h2 className="font-bold mb-3">Requests by service</h2>
            <div className="space-y-3">
              {byService.map(({ t, n }) => (
                <div key={t}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-text-secondary">{t === 'mobile' ? 'Mobile charging' : t === 'battery' ? 'Battery assistance' : 'Emergency help'}</span><span className="font-semibold">{n}</span></div>
                  <div className="h-2 rounded-full bg-brand-dark"><div className="h-2 rounded-full bg-accent-green" style={{ width: `${(n / maxSvc) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
