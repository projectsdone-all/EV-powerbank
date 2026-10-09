import { MapPin, Search, BatteryCharging, CheckCircle2, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-brand-dark">
      <div className="container-main">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How EV Assist Works</h1>
          <p className="text-lg text-text-secondary">
            Our platform connects you with verified EV technicians when you need them most. 
            The entire process is designed for speed, transparency, and peace of mind.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-px bg-brand-border" />
          
          {[
            {
              step: '01',
              title: 'Request Assistance',
              desc: 'Select the type of help you need (charging, diagnostics, flat tyre) and provide your vehicle details. If you have saved vehicles in your profile, this takes just one tap.',
              icon: Search
            },
            {
              step: '02',
              title: 'Share Location',
              desc: 'Use your phone\'s GPS or manually enter your location. Our dispatch system uses this to find the closest available executive.',
              icon: MapPin
            },
            {
              step: '03',
              title: 'Executive Assigned & Tracking',
              desc: 'An EV Assist executive is assigned immediately. You can track their arrival on the map in real-time, see their ETA, and communicate directly.',
              icon: Navigation
            },
            {
              step: '04',
              title: 'Service Delivery',
              desc: 'The executive arrives with the necessary equipment (mobile fast charger, tools) and resolves your issue so you can get back on the road.',
              icon: BatteryCharging
            },
            {
              step: '05',
              title: 'Secure Payment',
              desc: 'Pay seamlessly via UPI, card, or cash after the service is completed. You will receive a digital invoice immediately.',
              icon: CheckCircle2
            }
          ].map((item, i) => (
            <div key={i} className={`relative flex flex-col md:flex-row items-center gap-8 mb-16 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                <div className={`w-full ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12 md:text-right md:items-end'}`}>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-green/10 text-accent-green mb-4 ${i % 2 === 0 ? '' : 'md:ml-auto'}`}>
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3">{item.title}</h3>
                  <p className="text-text-secondary">{item.desc}</p>
                </div>
              </div>
              
              <div className="absolute left-[50%] -translate-x-1/2 w-12 h-12 rounded-full bg-brand-dark border-4 border-brand-surface hidden md:flex items-center justify-center text-accent-green font-bold z-10 shadow-lg">
                {item.step}
              </div>
              
              <div className="md:w-1/2" />
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link to="/customer/book" className="btn-primary text-lg">Book Assistance Now</Link>
        </div>
      </div>
    </div>
  );
}
