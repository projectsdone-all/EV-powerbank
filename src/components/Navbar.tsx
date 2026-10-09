import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../hooks/useAppContext';
import { homeFor } from '../services/api';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Coverage', to: '/coverage' },
  { label: 'Vehicle Check', to: '/check-vehicle' },
  { label: 'About', to: '/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useApp();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Don't show public navbar on dashboard routes
  const isDashboard = ['/customer', '/executive', '/admin', '/manager'].some((p) => location.pathname.startsWith(p));
  if (isDashboard) return null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'py-3 bg-brand-dark/90 backdrop-blur-xl border-b border-brand-border shadow-lg shadow-black/20'
            : 'py-5 bg-transparent'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container-main flex items-center justify-between">
          <Logo />

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === link.to
                    ? 'text-accent-green bg-accent-green/5'
                    : 'text-text-secondary hover:text-text-primary hover:bg-brand-elevated'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/contact" className="btn-ghost text-sm gap-1.5">
              <Phone size={15} /> Emergency Help
            </Link>
            {user ? (
              <Link to={homeFor(user.role)} className="btn-ghost text-sm">My Dashboard</Link>
            ) : (
              <Link to="/login" className="btn-ghost text-sm">Login</Link>
            )}
            <Link to="/customer/book" className="btn-primary text-sm !py-2.5 !px-5">
              Get Assistance
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="flex lg:hidden items-center gap-2">
            <Link to="/contact" className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" aria-label="Emergency Help">
              <Phone size={20} />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-brand-elevated rounded-lg transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-brand-dark border-l border-brand-border animate-slide-in-right overflow-y-auto">
            <div className="p-6 space-y-1 mt-16">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === link.to
                      ? 'text-accent-green bg-accent-green/5'
                      : 'text-text-secondary hover:text-text-primary hover:bg-brand-elevated'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-brand-border my-4" />
              {user ? (
                <Link to={homeFor(user.role)} className="block px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-brand-elevated rounded-lg">
                  My Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-brand-elevated rounded-lg">
                    Login
                  </Link>
                  <Link to="/register" className="block px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-brand-elevated rounded-lg">
                    Create Account
                  </Link>
                </>
              )}
              <div className="pt-4">
                <Link to="/customer/book" className="btn-primary w-full text-sm">
                  Get Assistance
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
