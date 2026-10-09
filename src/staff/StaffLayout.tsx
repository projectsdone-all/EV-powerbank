import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Radio, Users, UserCog, Truck, Navigation, LogOut, Menu, X, Zap, Globe } from 'lucide-react';
import { useApp } from '../hooks/useAppContext';
import Toasts from '../components/Toasts';
import { ROLE_LABEL, type Role } from '../services/api';

const NAV: Record<Exclude<Role, 'CUSTOMER'>, { to: string; label: string; icon: typeof Users }[]> = {
  ADMIN: [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/dispatch', label: 'Dispatch', icon: Radio },
    { to: '/admin/users', label: 'Users & passwords', icon: Users },
    { to: '/admin/account', label: 'My account', icon: UserCog },
  ],
  MANAGER: [
    { to: '/manager/dashboard', label: 'Dispatch', icon: Radio },
    { to: '/manager/executives', label: 'Executives', icon: Truck },
    { to: '/manager/account', label: 'My account', icon: UserCog },
  ],
  EXECUTIVE: [
    { to: '/executive/dashboard', label: 'My jobs', icon: LayoutDashboard },
    { to: '/executive/active-job', label: 'Active job', icon: Navigation },
    { to: '/executive/account', label: 'My account', icon: UserCog },
  ],
};

export default function StaffLayout() {
  const { user, logout, addToast } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!user || user.role === 'CUSTOMER') return null;
  const items = NAV[user.role];

  const signOut = async () => {
    navigate('/login', { replace: true });
    await logout();
    addToast('Logged out', 'info');
  };

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Staff navigation">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-accent-green/10 text-accent-green' : 'text-text-secondary hover:bg-brand-elevated hover:text-text-primary'}`}
        >
          <Icon size={18} /> {label}
        </NavLink>
      ))}
      <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-brand-elevated hover:text-text-primary">
        <Globe size={18} /> Public website
      </NavLink>
    </nav>
  );

  const userCard = (
    <div className="border-t border-brand-border pt-4">
      <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
      <p className="text-xs text-text-muted truncate">{ROLE_LABEL[user.role]} · {user.email}</p>
      <button onClick={signOut} className="mt-3 w-full btn-secondary !py-2 text-sm"><LogOut size={16} /> Log out</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-dark text-text-primary lg:flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-brand-border bg-brand-surface p-5 sticky top-0 h-screen">
        <div>
          <div className="flex items-center gap-2.5 mb-8">
            <span className="w-9 h-9 rounded-lg bg-accent-green text-brand-dark flex items-center justify-center"><Zap size={18} /></span>
            <div><p className="font-bold leading-none">EV Assist</p><p className="text-xs text-text-muted mt-1">{ROLE_LABEL[user.role]}</p></div>
          </div>
          {nav}
        </div>
        {userCard}
      </aside>

      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-brand-surface border-b border-brand-border">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-accent-green text-brand-dark flex items-center justify-center"><Zap size={16} /></span>
          <span className="font-bold text-sm">EV Assist · {ROLE_LABEL[user.role]}</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 text-text-secondary" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>
      {open && (
        <div className="lg:hidden fixed inset-0 top-14 z-30 bg-brand-dark/95 p-4 flex flex-col justify-between">
          {nav}
          {userCard}
        </div>
      )}

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <Toasts />
    </div>
  );
}
