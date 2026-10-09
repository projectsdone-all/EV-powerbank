import { useState } from 'react';
import { api, ROLE_LABEL } from '../services/api';
import { useApp } from '../hooks/useAppContext';
import { PageHead } from './shared';

export default function AccountPage() {
  const { user, addToast, refreshUser } = useApp();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  if (!user) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.profile.update({ name, phone }); await refreshUser(); addToast('Profile saved', 'success'); }
    catch (err) { addToast((err as Error).message, 'error'); }
  };
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) { addToast('New passwords do not match', 'error'); return; }
    setBusy(true);
    try { await api.auth.changePassword({ currentPassword: current, newPassword: next }); addToast('Password changed. Use it next time you log in.', 'success'); setCurrent(''); setNext(''); setConfirm(''); }
    catch (err) { addToast((err as Error).message, 'error'); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-2xl">
      <PageHead title="My account" sub={`${ROLE_LABEL[user.role]} · ${user.email}`} />
      <form onSubmit={saveProfile} className="card space-y-4 mb-6">
        <h2 className="font-bold">Profile</h2>
        <div><label className="label-field" htmlFor="acc-name">Name</label><input id="acc-name" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} /></div>
        <div><label className="label-field" htmlFor="acc-phone">Phone</label><input id="acc-phone" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <button className="btn-primary">Save profile</button>
      </form>
      <form onSubmit={changePassword} className="card space-y-4">
        <h2 className="font-bold">Change password</h2>
        <div><label className="label-field" htmlFor="pw-cur">Current password</label><input id="pw-cur" type="password" className="input-field" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label-field" htmlFor="pw-new">New password</label><input id="pw-new" type="password" className="input-field" value={next} onChange={(e) => setNext(e.target.value)} required minLength={6} autoComplete="new-password" /></div>
          <div><label className="label-field" htmlFor="pw-confirm">Confirm new password</label><input id="pw-confirm" type="password" className="input-field" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} autoComplete="new-password" /></div>
        </div>
        <button className="btn-primary" disabled={busy}>Change password</button>
      </form>
    </div>
  );
}
