import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '../hooks/useAppContext';
import Logo from '../components/Logo';
import { homeFor, type Role } from '../services/api';

const DEMO_ACCOUNTS: { role: string; email: string; password: string; who: string }[] = [
  { role: 'Admin', email: 'admin@evassist.in', password: 'Admin@123', who: 'Users, settings & reports' },
  { role: 'Manager', email: 'manager@evassist.in', password: 'Manager@123', who: 'Dispatch & executives' },
  { role: 'Executive', email: 'executive@evassist.in', password: 'Exec@123', who: 'Rahul K — field jobs' },
  { role: 'Customer', email: 'user@evassist.in', password: 'User@123', who: 'Tejaraj — book help' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, addToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const navigateByRole = (role: Role) => {
    const redirect = new URLSearchParams(location.search).get('redirect');
    const home = homeFor(role);
    // only follow the redirect if it belongs to this role's area
    navigate(redirect && redirect.startsWith(home.split('/').slice(0, 2).join('/')) ? redirect : home);
  };

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPassword = customPassword || password;

    if (!loginEmail || !loginPassword) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const user = await login(loginEmail, loginPassword);
      addToast(`Welcome back, ${user.name}!`, 'success');
      navigateByRole(user.role);
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center pt-28 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-accent-green/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-accent-cyan/5 rounded-full blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Logo size="large" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-text-primary">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Access your EV Assist account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-brand-surface py-8 px-4 shadow-2xl border border-brand-border sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={(e) => handleLogin(e)}>
            <div>
              <label htmlFor="email" className="label-field">
                Mobile Number / Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com or 10-digit mobile"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label-field">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-brand-border bg-brand-dark text-accent-green focus:ring-accent-green/50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => addToast('Ask your administrator to reset your password from the Admin → Users screen.', 'info')}
                  className="font-medium text-accent-green hover:text-accent-green-bright transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-brand-dark bg-accent-green hover:bg-accent-green-bright focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-accent-green transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </div>
          </form>

          {/* Demo Login Shortcuts */}
          <div className="mt-8 pt-6 border-t border-brand-border border-dashed">
            <p className="text-xs text-text-muted text-center mb-4 font-semibold">
              Demo logins — tap one to sign in
            </p>
            <div className="grid gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(a.password);
                    handleLogin(undefined, a.email, a.password);
                  }}
                  className="w-full text-left rounded-xl border border-brand-border-light px-4 py-3 hover:border-accent-green/60 hover:bg-brand-elevated transition-colors flex items-center justify-between gap-3 disabled:opacity-60"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-text-primary">{a.role} <span className="font-normal text-text-muted">· {a.who}</span></span>
                    <span className="block text-xs text-text-secondary font-mono truncate">{a.email} / {a.password}</span>
                  </span>
                  <ArrowRight size={16} className="text-accent-green shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <p className="mt-6 text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-accent-green hover:text-accent-green-bright transition-colors">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
