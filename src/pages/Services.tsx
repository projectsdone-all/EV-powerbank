import { Zap, Battery, Activity, Wrench, ShieldAlert } from 'lucide-react';
import { mockServices } from '../data/mockData';
import { Link } from 'react-router-dom';

export default function Services() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-brand-dark">
      <div className="container-main">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Premium EV Assistance Services</h1>
          <p className="text-lg text-text-secondary">
            Professional on-road support tailored specifically for electric vehicles in Bengaluru. 
            We bring the charging station and repair shop to your location.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {mockServices.map(service => {
            const Icon = 
              service.icon === 'Zap' ? Zap :
              service.icon === 'Battery' ? Battery :
              service.icon === 'Activity' ? Activity :
              service.icon === 'Wrench' ? Wrench : ShieldAlert;

            return (
              <div key={service.id} className="card flex flex-col h-full">
                <div className="w-16 h-16 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-center mb-6 text-accent-green">
                  <Icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">{service.title}</h3>
                <p className="text-text-secondary mb-8 flex-grow">{service.description}</p>
                <div className="mt-auto pt-6 border-t border-brand-border-light flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Starting from</p>
                    <p className="text-xl font-bold text-text-primary">₹{service.price}</p>
                  </div>
                  <Link to="/customer/book" className="btn-secondary !px-4 !py-2 text-sm">
                    Book Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-brand-elevated border border-brand-border rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Not sure what you need?</h2>
          <p className="text-text-secondary mb-8">
            Our expert dispatch team can help identify the right service for your situation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/contact" className="btn-secondary">Contact Support</Link>
            <Link to="/customer/book" className="btn-primary">Request General Assistance</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
