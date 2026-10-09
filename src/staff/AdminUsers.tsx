import { useState } from 'react';
import { KeyRound, Plus, Search, Trash2, Power } from 'lucide-react';
import { api, ROLE_LABEL, type ManagedUser, type Role } from '../services/api';
import { useApp } from '../hooks/useAppContext';
import { Modal, PageHead, timeAgo, useLive } from './shared';

const ROLES: Role[] = ['ADMIN', 'MANAGER', 'EXECUTIVE', 'CUSTOMER'];
const ROLE_BADGE: Record<Role, string> = { ADMIN: 'badge-red', MANAGER: 'badge-yellow', EXECUTIVE: 'badge-cyan', CUSTOMER: 'badge-green' };

export default function AdminUsers() {
  const { user: me, addToast } = useApp();
  const { data, error, refresh } = useLive(() => api.admin.users());
  const [q, setQ] = useState('');
  const [role, setRole] = useState<Role | 'ALL'>('ALL');
  const [adding, setAdding] = useState(false);
  const [pwFor, setPwFor] = useState<ManagedUser | null>(null);
  const [delFor, setDelFor] = useState<ManagedUser | null>(null);
  const [pw, setPw] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'EXECUTIVE' as Role, vehicleNumber: '', zone: 'Central Bengaluru' });

  if (error) return <div className="card text-red-400">{error}</div>;
  if (!data) return <p className="text-text-muted">Loading…</p>;

  const users = data.users.filter((u) => (role === 'ALL' || u.role === role) && `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q.toLowerCase()));
  const run = async (p: Promise<{ message: string }>, after?: () => void) => {
    try { const r = await p; addToast(r.message, 'success'); after?.(); refresh(); } catch (e) { addToast((e as Error).message, 'error'); }
  };

  return (
    <div>
      <PageHead title="Users & passwords" sub="Add staff, change roles, reset passwords and disable accounts."
        right={<button className="btn-primary !py-2.5" onClick={() => setAdding(true)}><Plus size={18} /> Add user</button>} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input className="input-field !py-2.5 pl-9" placeholder="Search name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
        </label>
        <select className="input-field !py-2.5 sm:w-56" value={role} onChange={(e) => setRole(e.target.value as Role | 'ALL')} aria-label="Filter by role">
          <option value="ALL">All roles ({data.users.length})</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]} ({data.users.filter((u) => u.role === r).length})</option>)}
        </select>
      </div>

      <div className="card !p-0 overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead><tr className="text-left text-text-muted border-b border-brand-border"><th className="px-5 py-3 font-medium">User</th><th className="px-3 py-3 font-medium">Role</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 font-medium">Last login</th><th className="px-5 py-3 font-medium text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-brand-border">
            {users.map((u) => {
              const self = u.id === me?.id;
              return (
                <tr key={u.id} data-user={u.email} className={u.active ? '' : 'opacity-60'}>
                  <td className="px-5 py-3"><p className="font-semibold">{u.name}{self && <span className="text-xs text-text-muted"> (you)</span>}</p><p className="text-xs text-text-muted">{u.email}{u.phone ? ` · ${u.phone}` : ''}</p></td>
                  <td className="px-3 py-3">
                    {self ? <span className={ROLE_BADGE[u.role]}>{ROLE_LABEL[u.role]}</span> : (
                      <select aria-label={`Role for ${u.email}`} className="bg-brand-dark border border-brand-border-light rounded-lg px-2 py-1.5 text-sm" value={u.role}
                        onChange={(e) => run(api.admin.updateUser(u.id, { role: e.target.value as Role }))}>
                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-3 py-3">{u.active ? <span className="badge-green">Active</span> : <span className="badge-red">Disabled</span>}</td>
                  <td className="px-3 py-3 text-text-secondary">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'Never'}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={() => { setPw(''); setPwFor(u); }} title="Set password"><KeyRound size={15} /> Password</button>
                      {!self && <button className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={() => run(api.admin.updateUser(u.id, { active: !u.active }))} title={u.active ? 'Disable' : 'Enable'}><Power size={15} /> {u.active ? 'Disable' : 'Enable'}</button>}
                      {!self && <button className="btn-ghost !px-2.5 !py-1.5 text-xs text-red-400 hover:text-red-300" onClick={() => setDelFor(u)} aria-label={`Delete ${u.email}`}><Trash2 size={15} /></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-6 text-center text-text-muted text-sm">No users match.</p>}
      </div>

      {adding && (
        <Modal title="Add user" onClose={() => setAdding(false)}>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(api.admin.createUser(form), () => { setAdding(false); setForm({ ...form, name: '', email: '', phone: '', password: '', vehicleNumber: '' }); }); }}>
            <div><label className="label-field" htmlFor="nu-role">Role</label>
              <select id="nu-role" className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></div>
            <div><label className="label-field" htmlFor="nu-name">Full name</label><input id="nu-name" className="input-field" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label-field" htmlFor="nu-email">Email (used to log in)</label><input id="nu-email" type="email" className="input-field" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="label-field" htmlFor="nu-phone">Phone</label><input id="nu-phone" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="label-field" htmlFor="nu-pw">Password</label><input id="nu-pw" className="input-field font-mono" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" /></div>
            {form.role === 'EXECUTIVE' && (
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-field" htmlFor="nu-van">Service van no.</label><input id="nu-van" className="input-field" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="KA05 AB 1234" /></div>
                <div><label className="label-field" htmlFor="nu-zone">Zone</label>
                  <select id="nu-zone" className="input-field" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}>{['Central Bengaluru', 'North Bengaluru', 'South Bengaluru', 'East Bengaluru', 'West Bengaluru'].map((z) => <option key={z}>{z}</option>)}</select></div>
              </div>
            )}
            <button className="btn-primary w-full mt-2">Add {ROLE_LABEL[form.role].toLowerCase()}</button>
          </form>
        </Modal>
      )}

      {pwFor && (
        <Modal title={`Set password for ${pwFor.name}`} onClose={() => setPwFor(null)}>
          <form onSubmit={(e) => { e.preventDefault(); run(api.admin.resetPassword(pwFor.id, pw), () => setPwFor(null)); }}>
            <p className="text-sm text-text-secondary mb-3">They log in with <span className="font-mono text-text-primary">{pwFor.email}</span> and this new password.</p>
            <label className="label-field" htmlFor="set-pw">New password</label>
            <input id="set-pw" className="input-field font-mono" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
            <button className="btn-primary w-full mt-4">Save password</button>
          </form>
        </Modal>
      )}

      {delFor && (
        <Modal title={`Delete ${delFor.name}?`} onClose={() => setDelFor(null)}>
          <p className="text-sm text-text-secondary">This removes the account and its saved vehicles. Past bookings stay in the records.</p>
          <div className="flex gap-2 mt-5">
            <button className="btn-secondary flex-1" onClick={() => setDelFor(null)}>Keep</button>
            <button className="btn-danger flex-1" onClick={() => run(api.admin.deleteUser(delFor.id), () => setDelFor(null))}>Delete user</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
