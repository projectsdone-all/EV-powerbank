import { useState } from 'react';
import { Search, ShieldCheck, Car, Battery, Info } from 'lucide-react';
import { verifyVehicleRegistration, type VerificationResult } from '../services/vehicleVerificationService';

export default function VehicleCheck() {
  const [regNumber, setRegNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim()) return;

    setLoading(true);
    setResult(null);

    // Call our mock service
    const res = await verifyVehicleRegistration(regNumber);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-brand-dark">
      <div className="container-main">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-elevated border border-brand-border-light text-accent-green mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Vehicle Check</h1>
          <p className="text-lg text-text-secondary">
            Verify your vehicle before requesting EV assistance. This ensures we dispatch the right executive with the correct charging equipment.
          </p>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start">
          {/* Input Panel */}
          <div className="w-full md:w-1/3 card bg-brand-surface sticky top-28">
            <form onSubmit={handleVerify}>
              <label htmlFor="regNumber" className="label-field">
                Vehicle Registration Number
              </label>
              <div className="relative mb-4">
                <input
                  id="regNumber"
                  type="text"
                  className="input-field uppercase font-mono text-lg tracking-wider"
                  placeholder="KA01AB1234"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-text-muted mb-6">
                Enter your Indian vehicle registration number without spaces.
              </p>
              
              <button 
                type="submit" 
                className="btn-primary w-full"
                disabled={loading || !regNumber}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search size={18} />
                    Verify Vehicle
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-brand-border-light">
              <p className="text-sm font-medium text-text-secondary mb-3">Supported Demo Examples:</p>
              <div className="flex flex-wrap gap-2">
                {['KA01AB1234', 'KA05MN8899', 'KA03EV2026'].map(ex => (
                  <button 
                    key={ex}
                    onClick={() => setRegNumber(ex)}
                    className="px-3 py-1.5 text-xs font-mono bg-brand-dark border border-brand-border rounded-md text-text-muted hover:text-text-primary hover:border-brand-border-light transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Panel */}
          <div className="w-full md:w-2/3">
            {!result && !loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-brand-border rounded-xl">
                <Car size={48} className="text-text-muted mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-text-primary mb-2">No Vehicle Selected</h3>
                <p className="text-text-secondary max-w-sm">Enter a registration number to view vehicle details and verification status.</p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-brand-border bg-brand-surface rounded-xl">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-brand-elevated rounded-full" />
                  <div className="absolute inset-0 border-4 border-accent-green rounded-full border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-accent-green">
                    <ShieldCheck size={24} />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-text-primary mb-2 animate-pulse">Checking registration details...</h3>
                <p className="text-text-secondary">Connecting to VAHAN database (Mock)</p>
              </div>
            )}

            {result && !result.success && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-red-500/20 bg-red-500/5 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                  <Info size={32} className="text-red-400" />
                </div>
                <h3 className="text-xl font-medium text-red-400 mb-2">Verification Failed</h3>
                <p className="text-text-secondary max-w-sm mb-6">{result.error}</p>
                <button onClick={() => { setRegNumber(''); setResult(null); }} className="btn-secondary">
                  Try Another Number
                </button>
              </div>
            )}

            {result && result.success && result.data && (
              <div className="card border-accent-green/30 bg-gradient-to-b from-accent-green/5 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 px-4 py-1 bg-accent-green text-brand-dark text-xs font-bold uppercase tracking-wider rounded-bl-lg">
                  DEMO DATA
                </div>

                <div className="flex items-start justify-between mb-8 pb-8 border-b border-brand-border-light">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-green/10 text-accent-green text-sm font-medium mb-4">
                      <ShieldCheck size={16} /> Vehicle Verified
                    </div>
                    <h2 className="text-4xl font-mono font-bold text-text-primary tracking-wider mb-2">
                      {result.data.rc_number}
                    </h2>
                    <p className="text-lg text-text-secondary">
                      {result.data.maker} {result.data.model}
                    </p>
                  </div>
                  <div className="hidden sm:block w-32 h-24 bg-brand-dark rounded-lg border border-brand-border flex items-center justify-center relative overflow-hidden">
                    {/* Mock vehicle silhouette */}
                    <Car size={48} className="text-brand-border-light" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-green" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <p className="text-sm text-text-muted mb-1">Owner Name</p>
                    <p className="font-medium text-text-primary">{result.data.owner_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Vehicle Class</p>
                    <p className="font-medium text-text-primary">{result.data.vehicle_class}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Fuel Type</p>
                    <div className="flex items-center gap-2 font-medium text-text-primary">
                      <Battery size={16} className="text-accent-green" /> {result.data.fuel_type}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Battery Capacity</p>
                    <p className="font-medium text-text-primary">{result.data.battery_kwh} kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Registration Date</p>
                    <p className="font-medium text-text-primary">{result.data.registration_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">RTO</p>
                    <p className="font-medium text-text-primary">{result.data.rto}</p>
                  </div>
                  
                  <div className="sm:col-span-2 pt-4 flex gap-3">
                    <span className="badge badge-green">Insurance: Valid</span>
                    <span className="badge badge-green">Fitness: Valid</span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-brand-border-light flex justify-end">
                  <button className="btn-primary">
                    Book Assistance For This Vehicle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
