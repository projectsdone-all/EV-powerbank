import { Link, useLocation } from 'react-router-dom';
import { Instagram, Linkedin, Youtube } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const location = useLocation();
  const isDashboard = ['/customer', '/executive', '/admin', '/manager'].some((p) => location.pathname.startsWith(p));
  if (isDashboard) return null;

  return (
    <footer className="bg-brand-surface border-t border-brand-border" role="contentinfo">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo size="large" />
            <p className="mt-4 text-text-muted text-sm leading-relaxed max-w-sm">
              On-road EV assistance when you need it. Fast emergency charging and roadside support across Bengaluru.
            </p>
            <div className="flex gap-3 mt-6">
              {[
                { icon: Instagram, label: 'Instagram' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Youtube, label: 'YouTube' },
              ].map(({ icon: Icon, label }) => (
                <a key={label} href="#" className="p-2.5 rounded-lg bg-brand-elevated border border-brand-border text-text-muted hover:text-accent-green hover:border-accent-green/30 transition-all" aria-label={label}>
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 tracking-wide uppercase">Product</h4>
            <div className="space-y-3">
              {[['Services', '/services'], ['Vehicle Check', '/vehicle-check'], ['Track Assistance', '/customer/tracking'], ['Coverage', '/coverage']].map(([label, to]) => (
                <Link key={to} to={to} className="block text-sm text-text-muted hover:text-accent-green transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 tracking-wide uppercase">Company</h4>
            <div className="space-y-3">
              {[['About', '/about'], ['Contact', '/contact'], ['FAQ', '/faq']].map(([label, to]) => (
                <Link key={to} to={to} className="block text-sm text-text-muted hover:text-accent-green transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 tracking-wide uppercase">Legal</h4>
            <div className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(label => (
                <a key={label} href="#" className="block text-sm text-text-muted hover:text-accent-green transition-colors">{label}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">© 2026 EV Assist. All rights reserved.</p>
          <p className="text-xs text-text-muted">Designed for Bengaluru, Karnataka</p>
        </div>
      </div>
    </footer>
  );
}
