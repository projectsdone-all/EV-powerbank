import { Link } from 'react-router-dom';
import { Zap, Battery, Activity, Wrench, ShieldAlert, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { mockServices } from '../data/mockData';

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* 1. Cinematic Hero */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/90 to-brand-dark z-10" />
          {/* Abstract dark automotive background placeholder */}
          <div className="w-full h-full bg-[#0a0e1a] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-green/10 rounded-full blur-[120px] opacity-50" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-cyan/10 rounded-full blur-[100px] opacity-30" />
          </div>
        </div>

        <div className="container-main relative z-20 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-elevated border border-brand-border-light mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
            </span>
            <span className="text-xs font-medium text-text-secondary tracking-wide uppercase">24/7 EV ROADSIDE ASSISTANCE</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 max-w-4xl">
            Your EV Shouldn't Stop <br />
            <span className="text-gradient">Your Journey.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed">
            Fast on-road EV charging and roadside assistance when your battery gets low or your journey takes an unexpected turn.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/customer/book" className="btn-primary text-lg !px-8 !py-4">
              Get Emergency Assistance
            </Link>
            <Link to="/services" className="btn-secondary text-lg !px-8 !py-4">
              Explore Services
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 md:gap-16 pt-10 border-t border-brand-border-light/50 text-left">
            <div>
              <p className="text-sm text-text-muted mb-1">Average Response</p>
              <p className="text-2xl font-bold text-text-primary">20–30 min</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Coverage</p>
              <p className="text-2xl font-bold text-text-primary">Bengaluru</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Service</p>
              <p className="text-2xl font-bold text-text-primary">24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Emergency Quick Action */}
      <section className="bg-brand-elevated border-y border-brand-border py-8">
        <div className="container-main flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <Battery className="text-red-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Battery critically low?</h3>
              <p className="text-text-muted text-sm">Get an EV assistance executive to your location.</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link to="/customer/book" className="btn-emergency flex-1 md:flex-none">Request Assistance</Link>
            <Link to="/vehicle-check" className="btn-secondary flex-1 md:flex-none">Check Vehicle</Link>
          </div>
        </div>
      </section>

      {/* 3. Services */}
      <section className="section-padding bg-brand-dark">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Assistance That Comes To You</h2>
            <p className="text-text-secondary text-lg">From low battery emergencies to roadside support, EV Assist brings the service to your location.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockServices.map(service => {
              const Icon = 
                service.icon === 'Zap' ? Zap :
                service.icon === 'Battery' ? Battery :
                service.icon === 'Activity' ? Activity :
                service.icon === 'Wrench' ? Wrench : ShieldAlert;

              return (
                <div key={service.id} className="card-hover group cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-brand-dark border border-brand-border flex items-center justify-center mb-6 group-hover:border-accent-green/50 group-hover:text-accent-green transition-colors">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">{service.title}</h3>
                  <p className="text-text-secondary mb-6 line-clamp-2">{service.description}</p>
                  <div className="flex items-center text-accent-green text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    Learn more <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="section-padding bg-brand-surface relative overflow-hidden">
        <div className="container-main relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-text-secondary text-lg">Four simple steps to get back on the road.</p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-brand-border" />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
              {[
                { step: '01', title: 'Request Help', desc: 'Tell us what your EV needs.' },
                { step: '02', title: 'Share Location', desc: 'Allow location access or choose your current location.' },
                { step: '03', title: 'Executive Assigned', desc: 'A nearby EV assistance executive is assigned.' },
                { step: '04', title: 'Get Back On The Road', desc: 'Receive charging or roadside assistance.' },
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className="w-24 h-24 rounded-full bg-brand-dark border-4 border-brand-surface flex items-center justify-center text-2xl font-bold text-accent-green shadow-xl mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">{item.title}</h3>
                  <p className="text-text-secondary">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live Tracking Preview (DEMO) */}
      <section className="section-padding bg-brand-dark">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden border border-brand-border bg-brand-surface shadow-2xl relative aspect-square md:aspect-video lg:aspect-square">
              {/* Mock Map Background */}
              <div className="absolute inset-0 bg-[#0a0e1a] opacity-50" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              
              {/* Mock Route */}
              <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 8px rgba(163, 230, 53, 0.4))' }}>
                <path d="M 100 300 Q 200 150 400 200 T 700 100" fill="none" stroke="#a3e635" strokeWidth="4" strokeDasharray="8 8" className="animate-[dash_20s_linear_infinite]" />
              </svg>

              {/* Mock Markers */}
              <div className="absolute top-[100px] right-[100px] w-12 h-12 bg-accent-cyan/20 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-accent-cyan rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
              </div>
              
              <div className="absolute top-[300px] left-[100px] w-12 h-12 bg-accent-green/20 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-accent-green rounded-full shadow-[0_0_15px_rgba(163,230,53,0.6)] animate-pulse" />
              </div>

              {/* Info Overlay */}
              <div className="absolute bottom-6 left-6 right-6 glass-surface rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-dark rounded-full border border-brand-border flex items-center justify-center font-bold text-lg text-text-primary">
                    RK
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">Rahul K</p>
                    <p className="text-xs text-text-muted">KA05 AB 2481</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent-green text-xl">12 min</p>
                  <p className="text-xs text-text-muted">4.8 km away</p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-elevated border border-brand-border-light mb-6">
                <span className="text-xs font-medium text-text-secondary tracking-wide uppercase">Live Tracking</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Know Where Your Assistance Is</h2>
              <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                Watch your executive arrive in real-time. Our dispatch system finds the closest available support and provides accurate ETAs so you're never left guessing.
              </p>
              <ul className="space-y-4 mb-10">
                {['Real-time location updates', 'Direct contact with executive', 'Accurate arrival estimates'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-text-primary font-medium">
                    <CheckCircle2 className="text-accent-green shrink-0" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Vehicle Verification Preview */}
      <section className="section-padding bg-brand-surface border-y border-brand-border">
        <div className="container-main text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Verify Before You Need It</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10">
            Check your EV's details instantly. Save it to your profile for faster emergency bookings.
          </p>
          <Link to="/vehicle-check" className="btn-primary text-lg">
            Try Vehicle Check
          </Link>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent-green/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(163,230,53,0.15),transparent_50%)]" />
        <div className="container-main relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Don't Wait Until Your EV Stops</h2>
          <p className="text-xl text-text-secondary mb-10">Save EV Assist before you need us.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/customer/book" className="btn-primary text-lg !px-8 !py-4">Get Assistance</Link>
            <Link to="/vehicle-check" className="btn-secondary text-lg !px-8 !py-4">Verify Your Vehicle</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
