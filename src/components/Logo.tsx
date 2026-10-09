import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const textClass = size === 'large' ? 'text-2xl' : size === 'small' ? 'text-base' : 'text-lg';
  const iconSize = size === 'large' ? 24 : size === 'small' ? 16 : 20;
  return (
    <Link to="/" className="flex items-center gap-2 group" aria-label="EV Assist Home">
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-accent-green/10 border border-accent-green/20 group-hover:bg-accent-green/20 transition-colors">
        <Zap size={iconSize} className="text-accent-green" strokeWidth={2.5} />
      </div>
      <span className={`${textClass} font-bold tracking-tight text-text-primary`}>
        EV <span className="text-accent-green">ASSIST</span>
      </span>
    </Link>
  );
}
