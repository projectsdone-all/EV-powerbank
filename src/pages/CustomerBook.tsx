import { useState, useEffect } from 'react';
import { MapPin, Search, BatteryCharging, Wrench, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useAppContext';
import { api, Vehicle } from '../services/api';

export default function CustomerBook() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const services = [
    { id: 'mobile-charging', title: 'Mobile Charging', icon: BatteryCharging, desc: 'Fast charging at your location' },
    { id: 'diagnostics', title: 'Diagnostics', icon: Search, desc: 'Software and system checks' },
    { id: 'flat-tyre', title: 'Flat Tyre', icon: Wrench, desc: 'Puncture repair or replacement' },
    { id: 'towing', title: 'Flatbed Towing', icon: AlertCircle, desc: 'Safe transport for EVs' }
  ];

  useEffect(() => {
    api.vehicles.list().then(res => {
      if (res.success) setVehicles(res.vehicles);
    }).catch(console.error);
  }, []);

  const handleNext = () => {
    if (step === 2 && vehicleId === 'new') {
      navigate('/customer/vehicles');
      return;
    }
    setStep(s => s + 1);
  };
  
  const handleConfirm = async () => {
    setLoading(true);
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    if (!selectedVehicle) {
      addToast('Please select a valid vehicle', 'error');
      setLoading(false);
      return;
    }

    try {
      await api.bookings.create({
        serviceType: serviceType.includes('charging') ? 'battery' : (serviceType.includes('tyre') || serviceType.includes('towing') ? 'emergency' : 'mobile'),
        serviceLabel: services.find(s => s.id === serviceType)?.title || serviceType,
        vehicleId: selectedVehicle.id,
        vehicleModel: `${selectedVehicle.maker} ${selectedVehicle.model}`,
        vehicleNumber: selectedVehicle.rcNumber,
        batteryPercent: 20, // Example hardcoded value
        address: 'Koramangala, Bengaluru', // Mock location input
        latitude: 12.9352,
        longitude: 77.6245
      });
      addToast('Request confirmed! Executive is on the way.', 'success');
      navigate('/customer/tracking');
    } catch (err: any) {
      addToast(err.message || 'Failed to create booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === vehicleId);
  const selectedService = services.find(s => s.id === serviceType);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-brand-dark">
      <div className="container-main max-w-3xl">
        <div className="mb-8 border-b border-brand-border pb-4">
          <h1 className="text-3xl font-bold text-text-primary">Request Assistance</h1>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-accent-green' : 'bg-brand-border'}`} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold">What do you need help with?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setServiceType(s.id)}
                  className={`card text-left transition-colors border ${serviceType === s.id ? 'border-accent-green bg-brand-elevated' : 'border-brand-border bg-brand-surface hover:border-brand-border-light'}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${serviceType === s.id ? 'bg-accent-green/20 text-accent-green' : 'bg-brand-dark text-text-secondary'}`}>
                    <s.icon size={20} />
                  </div>
                  <h3 className="font-bold mb-1">{s.title}</h3>
                  <p className="text-sm text-text-secondary">{s.desc}</p>
                </button>
              ))}
            </div>
            <button 
              className="btn-primary w-full mt-6" 
              disabled={!serviceType}
              onClick={handleNext}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold">Select Vehicle & Location</h2>
            
            <div>
              <label className="label-field mb-2 block">Vehicle</label>
              <select 
                className="input-field bg-brand-surface"
                value={vehicleId}
                onChange={e => setVehicleId(e.target.value)}
              >
                <option value="" disabled>Select saved vehicle...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.maker} {v.model} ({v.rcNumber})</option>
                ))}
                <option value="new">+ Add New Vehicle</option>
              </select>
            </div>

            <div>
              <label className="label-field mb-2 block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input 
                  type="text" 
                  className="input-field pl-12 bg-brand-surface" 
                  defaultValue="Koramangala, Bengaluru"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-cyan text-sm font-semibold hover:underline">
                  Locate Me
                </button>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button className="btn-secondary flex-1" onClick={() => setStep(1)}>Back</button>
              <button 
                className="btn-primary flex-1" 
                disabled={!vehicleId}
                onClick={handleNext}
              >
                Review Details
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold">Review Request</h2>
            
            <div className="card bg-brand-surface border border-brand-border p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-brand-border-light pb-4">
                <span className="text-text-secondary">Service</span>
                <span className="font-bold capitalize">{selectedService?.title}</span>
              </div>
              <div className="flex justify-between items-center border-b border-brand-border-light pb-4">
                <span className="text-text-secondary">Vehicle</span>
                <span className="font-bold">{selectedVehicle?.maker} {selectedVehicle?.model}</span>
              </div>
              <div className="flex justify-between items-center border-b border-brand-border-light pb-4">
                <span className="text-text-secondary">Location</span>
                <span className="font-bold text-right max-w-[200px] truncate">Koramangala, Bengaluru</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-text-secondary">Estimated Cost</span>
                <span className="font-bold text-xl text-accent-green">₹750</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="btn-secondary flex-1" onClick={() => setStep(2)}>Edit</button>
              <button 
                className="btn-primary flex-1 flex items-center justify-center gap-2" 
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Confirming...' : 'Confirm Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

