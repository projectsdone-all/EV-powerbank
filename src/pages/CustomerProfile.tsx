import { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../hooks/useAppContext';
import { api } from '../services/api';

export default function CustomerProfile() {
  const { user, refreshUser, addToast } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || 'Bengaluru, Karnataka');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const res = await api.profile.get();
        if (isMounted && res.success && res.profile) {
          setName(res.profile.name);
          setEmail(res.profile.email);
          setPhone(res.profile.phone || '');
          setCity(res.profile.city || 'Bengaluru, Karnataka');
        }
      } catch {
        if (isMounted && user) {
          setName(user.name);
          setEmail(user.email);
          setPhone(user.phone || '');
          setCity(user.city || 'Bengaluru, Karnataka');
        }
      } finally {
        if (isMounted) setFetching(false);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.profile.update({ name, phone, city });
      await refreshUser();
      addToast(res.message || 'Profile updated successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50/50 p-6 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link 
            to="/customer/dashboard" 
            className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="text-xs text-gray-500">Manage your contact details and EV account preferences</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xl flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{name || 'Customer'}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified {user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'Customer'}
              </span>
            </div>
          </div>

          {fetching ? (
            <div className="py-12 flex items-center justify-center text-xs text-gray-400 gap-2">
              <Loader2 size={16} className="animate-spin text-emerald-600" />
              <span>Loading profile details...</span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 pt-6">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100/70 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Location / City</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru, Karnataka"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <ChangePasswordCard />
      </div>
    </div>
  );
}

function ChangePasswordCard() {
  const { addToast } = useApp();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) { addToast('New passwords do not match', 'error'); return; }
    setSaving(true);
    try {
      await api.auth.changePassword({ currentPassword: current, newPassword: next });
      addToast('Password changed', 'success');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err: any) { addToast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  const field = 'w-full px-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500';
  return (
    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-4">
      <h2 className="text-sm font-bold text-gray-900">Change password</h2>
      <div><label htmlFor="cp-cur" className="text-xs font-bold text-gray-700 mb-1.5 block">Current password</label><input id="cp-cur" type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} className={field} autoComplete="current-password" /></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label htmlFor="cp-new" className="text-xs font-bold text-gray-700 mb-1.5 block">New password</label><input id="cp-new" type="password" required minLength={6} value={next} onChange={(e) => setNext(e.target.value)} className={field} autoComplete="new-password" /></div>
        <div><label htmlFor="cp-confirm" className="text-xs font-bold text-gray-700 mb-1.5 block">Confirm new password</label><input id="cp-confirm" type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} autoComplete="new-password" /></div>
      </div>
      <button type="submit" disabled={saving} className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs sm:text-sm rounded-xl disabled:opacity-60">Change password</button>
    </form>
  );
}
