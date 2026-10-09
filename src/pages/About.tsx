import { Zap, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-brand-dark">
      <div className="container-main">
        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Mobility Support For The Electric Future</h1>
          <p className="text-xl text-text-secondary leading-relaxed">
            EV Assist is designed around one simple idea: When an EV stops, help should not be far away.
          </p>
        </div>

        {/* Story */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-text-primary">Driving the Green Transition in Bengaluru</h2>
            <p className="text-text-secondary text-lg">
              As more drivers switch to electric vehicles, the infrastructure must evolve. Traditional roadside assistance is often ill-equipped to handle EV-specific emergencies like dead high-voltage batteries or software lockouts.
            </p>
            <p className="text-text-secondary text-lg">
              We built EV Assist to bridge this gap. Our fleet of mobile charging units and specialized EV technicians ensure that range anxiety and unexpected breakdowns never keep you off the road for long.
            </p>
          </div>
          <div className="aspect-square md:aspect-auto md:h-full bg-brand-surface rounded-2xl border border-brand-border flex items-center justify-center p-8 relative overflow-hidden">
             <div className="absolute inset-0 bg-accent-green/5" />
             <Zap size={120} className="text-accent-green/20" />
             <div className="absolute bottom-8 left-8 right-8 p-6 glass-surface rounded-xl border border-brand-border-light text-center">
                <p className="font-bold text-xl mb-1">"We Charge On The Way.</p>
                <p className="font-bold text-xl text-accent-green">You Drive The Green Way."</p>
             </div>
          </div>
        </div>

        {/* Why EV Assist */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose EV Assist</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Fast Response', desc: 'Our smart dispatch system finds the nearest available executive to minimize your wait time.', icon: Clock },
              { title: 'Service Comes To You', desc: 'No need for towing in most cases. We bring the charging station directly to your vehicle.', icon: MapPin },
              { title: 'EV-Focused Assistance', desc: 'Our technicians are specifically trained for modern electric vehicle architectures.', icon: Zap },
              { title: 'Transparent Experience', desc: 'Track your executive in real-time, get accurate ETAs, and know the price upfront.', icon: ShieldCheck },
            ].map((feature, i) => (
              <div key={i} className="card bg-brand-surface border border-brand-border text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-elevated text-accent-green mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Stats (Demo) */}
        <div className="bg-brand-elevated rounded-3xl border border-brand-border p-12 text-center relative overflow-hidden mb-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(163,230,53,0.1),transparent_70%)]" />
          <h2 className="text-2xl md:text-3xl font-bold mb-12 relative z-10">Making an Impact Every Day</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            <div>
              <p className="text-4xl font-bold text-accent-green mb-2">500+</p>
              <p className="text-sm text-text-secondary uppercase tracking-wider">Demo Requests</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent-green mb-2">24/7</p>
              <p className="text-sm text-text-secondary uppercase tracking-wider">Service Experience</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent-green mb-2">4.9/5</p>
              <p className="text-sm text-text-secondary uppercase tracking-wider">Demo Rating</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent-green mb-2">31</p>
              <p className="text-sm text-text-secondary uppercase tracking-wider">Coverage Districts</p>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-12 relative z-10">Note: These are interface demonstration values only, not verified company statistics.</p>
        </div>

        <div className="text-center">
          <Link to="/customer/book" className="btn-primary text-lg">Experience EV Assist</Link>
        </div>
      </div>
    </div>
  );
}
