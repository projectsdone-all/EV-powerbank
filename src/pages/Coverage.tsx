import { MapPin, Users, Clock } from 'lucide-react';
import { mockServiceAreas } from '../data/mockData';
import { Link } from 'react-router-dom';

export default function Coverage() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-brand-dark">
      <div className="container-main">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Service Coverage</h1>
          <p className="text-lg text-text-secondary">
            EV Assist provides comprehensive coverage across Bengaluru. Our mobile charging vans and roadside assistance executives are strategically positioned to reach you quickly.
          </p>
        </div>

        {/* Mock Map Representation */}
        <div className="w-full h-[400px] bg-brand-surface rounded-2xl border border-brand-border mb-16 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0a0e1a] opacity-50" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center p-8 bg-brand-dark/80 backdrop-blur-md rounded-xl border border-brand-border text-center max-w-sm">
            <MapPin size={48} className="text-accent-green mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2">Bengaluru Operational Zone</h3>
            <p className="text-sm text-text-secondary">Interactive map loading disabled for demo environment.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {mockServiceAreas.map(area => (
            <div key={area.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-text-primary">{area.name}</h3>
                {area.status === 'available' ? (
                  <span className="badge badge-green">Available</span>
                ) : area.status === 'limited' ? (
                  <span className="badge badge-yellow">Limited</span>
                ) : (
                  <span className="badge badge-red">Busy</span>
                )}
              </div>
              <p className="text-sm text-text-muted mb-6">{area.coverage}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Users size={16} /> {area.executives} Executives
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock size={16} /> {area.avg_response} avg
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-brand-surface to-brand-elevated border border-brand-border rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Are you outside these zones?</h2>
          <p className="text-text-secondary mb-8">
            We are constantly expanding our coverage. Contact our support team for special out-of-zone emergency requests.
          </p>
          <Link to="/contact" className="btn-secondary">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
