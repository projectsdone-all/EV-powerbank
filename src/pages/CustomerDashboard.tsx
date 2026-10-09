import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Crosshair, 
  Zap, 
  Car, 
  LifeBuoy, 
  ChevronDown, 
  ChevronRight, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  Loader2,
  RefreshCw,
  Plus
} from 'lucide-react';
import CustomerMap from '../components/CustomerMap';
import { useApp } from '../hooks/useAppContext';
import { api, Vehicle, Booking, STATUS_SHORT } from '../services/api';
import { geocodingService } from '../services/mapProvider';

export default function CustomerDashboard() {
  const { user, addToast } = useApp();
  const navigate = useNavigate();

  // Location and Map state
  const [address, setAddress] = useState(
    '1st Main Road, Anand Nagar Colony, Hebbal, Bengaluru North City Corporation, Bengaluru'
  );
  const [coords, setCoords] = useState({ lat: 13.0358, lng: 77.5970 });
  const [isLocating, setIsLocating] = useState(false);

  // Form State
  const [serviceType, setServiceType] = useState<'mobile' | 'battery' | 'emergency'>('mobile');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [batteryPercent, setBatteryPercent] = useState<number>(15);
  const [notes, setNotes] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [formError, setFormError] = useState('');

  // Data fetching state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Fetch real vehicles and bookings from the backend API
  const loadDashboardData = async () => {
    try {
      setIsLoadingData(true);
      setFetchError('');

      const [vehRes, bookRes] = await Promise.all([
        api.vehicles.list().catch(() => ({ success: false, vehicles: [] })),
        api.bookings.list().catch(() => ({ success: false, bookings: [] })),
      ]);

      if (vehRes.success && vehRes.vehicles) {
        setVehicles(vehRes.vehicles);
        if (vehRes.vehicles.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(vehRes.vehicles[0].id);
        }
      }

      if (bookRes.success && bookRes.bookings) {
        setRecentBookings(bookRes.bookings);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update selected vehicle if vehicle list changes
  useEffect(() => {
    if (vehicles.length > 0 && (!selectedVehicleId || !vehicles.some(v => v.id === selectedVehicleId))) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  // Selected vehicle object
  const currentVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  }, []);

  const customerFirstName = useMemo(() => {
    if (!user?.name) return 'Customer';
    return user.name.split(' ')[0];
  }, [user]);

  // Map coordinate change handler
  const handleCoordsChange = (newCoords: { lat: number; lng: number }, newAddress?: string) => {
    setCoords(newCoords);
    if (newAddress) {
      setAddress(newAddress);
    }
  };

  // Browser Geolocation with permission-denied and failure states
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        try {
          const resolvedAddress = await geocodingService.reverseGeocode(lat, lng);
          setAddress(resolvedAddress);
        } catch {
          setAddress(`GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        }

        addToast('Location updated via GPS', 'success');
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          addToast(
            'Location permission denied. Please allow location access or select on the map.',
            'warning'
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          addToast('Location information is unavailable. Pinpointed on Hebbal center.', 'info');
          setCoords({ lat: 13.0358, lng: 77.5970 });
        } else {
          addToast('Location request timed out. Please select location on the map.', 'warning');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  // Assistance Request Submission
  const handleRequestAssistance = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!address.trim()) {
      setFormError('Please provide a service location address.');
      addToast('Please provide a service location address.', 'error');
      return;
    }

    if (!currentVehicle && vehicles.length === 0) {
      setFormError('Please add a vehicle to your account first.');
      addToast('No vehicle selected. Please register a vehicle in the Vehicles tab.', 'warning');
      return;
    }

    const vehicleModel = currentVehicle
      ? `${currentVehicle.maker} ${currentVehicle.model}`
      : 'Tata Nexon EV';
    const vehicleNumber = currentVehicle ? currentVehicle.rcNumber : 'KA01EV0001';

    try {
      setIsRequesting(true);
      const res = await api.bookings.create({
        serviceType,
        vehicleId: currentVehicle?.id,
        vehicleModel,
        vehicleNumber,
        batteryPercent,
        address,
        latitude: coords.lat,
        longitude: coords.lng,
        notes: notes.trim() || undefined,
      });

      addToast(res.message || 'Request placed! Nearest EV unit dispatched.', 'success');
      // Navigate to tracking page to monitor the booking
      navigate('/customer/tracking');
    } catch (err: any) {
      const msg = err.message || 'Failed to request assistance. Please try again.';
      setFormError(msg);
      addToast(msg, 'error');
    } finally {
      setIsRequesting(false);
    }
  };

  const isCriticalBattery = batteryPercent <= 20;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-white font-sans">
      {/* Middle Booking Column */}
      <div className="w-full lg:w-[420px] xl:w-[440px] shrink-0 h-full overflow-y-auto border-r border-gray-100 p-5 sm:p-6 bg-white space-y-5">
        
        {/* Top Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-medium">{greeting}</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-0.5">
              {customerFirstName}
            </h1>
          </div>
          <button
            onClick={loadDashboardData}
            title="Refresh dashboard data"
            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            aria-label="Refresh data"
          >
            <RefreshCw size={16} className={isLoadingData ? 'animate-spin text-emerald-600' : ''} />
          </button>
        </div>

        {fetchError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between">
            <span>{fetchError}</span>
            <button
              onClick={loadDashboardData}
              className="text-amber-900 font-bold underline hover:no-underline ml-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Assistance Card */}
        <div className="border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-sm bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Need EV assistance?</h2>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Fleet Active
            </span>
          </div>

          <form onSubmit={handleRequestAssistance} className="space-y-4">
            {formError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Current Location */}
            <div>
              <label 
                htmlFor="location-input" 
                className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block"
              >
                YOUR CURRENT LOCATION
              </label>
              <span className="text-[11px] text-gray-400 block mb-1.5">
                Your EV service location
              </span>

              <div className="border border-gray-200 rounded-xl p-2.5 flex items-center justify-between gap-2 bg-white hover:border-gray-300 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-colors">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MapPin className="text-emerald-500 shrink-0" size={17} />
                  <input
                    id="location-input"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter or select your location on the map"
                    className="text-xs text-gray-700 font-medium truncate w-full outline-none bg-transparent"
                    aria-label="Your current EV location"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  title="Use My Location (GPS)"
                  className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded-lg shrink-0 transition-colors disabled:opacity-50"
                  aria-label="Use my location via GPS"
                >
                  <Crosshair size={16} className={isLocating ? 'animate-spin text-emerald-600' : ''} />
                </button>
              </div>
            </div>

            {/* Service Type Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
                SERVICE TYPE
              </label>

              {/* Option 1: Mobile Charging */}
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setServiceType('mobile'); }}
                onClick={() => setServiceType('mobile')}
                className={`rounded-xl p-3 flex items-center gap-3.5 cursor-pointer transition-all border outline-none ${
                  serviceType === 'mobile'
                    ? 'border-2 border-emerald-500 bg-[#f0fdf4] shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                aria-pressed={serviceType === 'mobile'}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                    serviceType === 'mobile'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Zap size={18} className="fill-current" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">
                    Mobile Charging
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    On-site EV charging at your location
                  </div>
                </div>
              </div>

              {/* Option 2: Battery Assistance */}
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setServiceType('battery'); }}
                onClick={() => setServiceType('battery')}
                className={`rounded-xl p-3 flex items-center gap-3.5 cursor-pointer transition-all border outline-none ${
                  serviceType === 'battery'
                    ? 'border-2 border-emerald-500 bg-[#f0fdf4] shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                aria-pressed={serviceType === 'battery'}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                    serviceType === 'battery'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Car size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">
                    Battery Assistance
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Battery swap/replacement service
                  </div>
                </div>
              </div>

              {/* Option 3: Emergency EV Help */}
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setServiceType('emergency'); }}
                onClick={() => setServiceType('emergency')}
                className={`rounded-xl p-3 flex items-center gap-3.5 cursor-pointer transition-all border outline-none ${
                  serviceType === 'emergency'
                    ? 'border-2 border-emerald-500 bg-[#f0fdf4] shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                aria-pressed={serviceType === 'emergency'}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                    serviceType === 'emergency'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <LifeBuoy size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">
                    Emergency EV Help
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Urgent roadside EV assistance
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label 
                  htmlFor="vehicle-select" 
                  className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block"
                >
                  VEHICLE
                </label>
                <Link
                  to="/customer/vehicles"
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                >
                  <Plus size={11} /> Manage
                </Link>
              </div>

              <div className="relative">
                {vehicles.length > 0 ? (
                  <select
                    id="vehicle-select"
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 bg-white font-medium pr-8 focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.maker} {v.model} - {v.rcNumber}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-xl p-2.5 text-xs text-gray-500 flex items-center justify-between bg-gray-50">
                    <span>No vehicle registered</span>
                    <Link
                      to="/customer/vehicles"
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Add Vehicle
                    </Link>
                  </div>
                )}
                {vehicles.length > 0 && (
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                )}
              </div>
            </div>

            {/* Battery Status & Slider */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase mb-1">
                <span className="text-gray-400">CURRENT BATTERY</span>
                <span className={`text-xs font-bold ${isCriticalBattery ? 'text-red-600' : 'text-gray-900'}`}>
                  {batteryPercent}%
                </span>
              </div>

              {/* Slider */}
              <div className="relative py-1">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={batteryPercent}
                  onChange={(e) => setBatteryPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  aria-label="Battery level percentage"
                />
              </div>

              {/* Low Battery Alert Strip (matches screenshot) */}
              {isCriticalBattery && (
                <div 
                  className="mt-2 flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-200/80 text-red-700 animate-fadeIn"
                  role="alert"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span>Low Battery Warning (Critical)</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                    <AlertCircle size={12} />
                    <span>[!]</span>
                  </div>
                </div>
              )}
            </div>

            {/* Request Button */}
            <button
              type="submit"
              disabled={isRequesting}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isRequesting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Connecting to Fleet...</span>
                </>
              ) : (
                <>
                  <Zap size={16} className="fill-white" />
                  <span>Request Assistance</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Services */}
        <div className="space-y-2.5 pt-1">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
            Quick Services
          </h3>

          <div 
            onClick={() => { setServiceType('mobile'); addToast('Selected Mobile Charging', 'info'); }}
            className="border border-gray-100 hover:border-gray-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 transition-colors shadow-2xs"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Zap size={16} />
              </div>
              <div>
                <div className="font-semibold text-xs text-gray-900">Mobile Charging</div>
                <div className="text-[11px] text-gray-400">Charge at your location</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>

          <div 
            onClick={() => { setServiceType('battery'); addToast('Selected Battery Assistance', 'info'); }}
            className="border border-gray-100 hover:border-gray-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 transition-colors shadow-2xs"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Car size={16} />
              </div>
              <div>
                <div className="font-semibold text-xs text-gray-900">Battery Assistance</div>
                <div className="text-[11px] text-gray-400">Quick swap & replace</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>

          <div 
            onClick={() => { setServiceType('emergency'); addToast('Selected Emergency Help', 'info'); }}
            className="border border-gray-100 hover:border-gray-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 transition-colors shadow-2xs"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <LifeBuoy size={16} />
              </div>
              <div>
                <div className="font-semibold text-xs text-gray-900">Emergency Help</div>
                <div className="text-[11px] text-gray-400">24/7 roadside EV help</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>
        </div>

        {/* Recent Bookings Header & Items */}
        <div className="pt-2 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Recent Bookings
            </h3>
            <Link 
              to="/customer/bookings" 
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              View all
            </Link>
          </div>

          {isLoadingData ? (
            <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Loader2 size={14} className="animate-spin text-emerald-600" />
              <span>Loading recent bookings...</span>
            </div>
          ) : recentBookings.length > 0 ? (
            <div className="space-y-2">
              {recentBookings.slice(0, 2).map((b) => (
                <div 
                  key={b.id} 
                  className="border border-gray-100 rounded-xl p-3.5 bg-gray-50/50 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      b.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : b.status === 'CANCELLED'
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-amber-100 text-amber-700 animate-pulse'
                    }`}>
                      {b.status === 'COMPLETED' ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Clock size={16} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-gray-900 truncate">
                        {b.vehicleModel} • {b.serviceLabel}
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{b.address.split(',')[0]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="font-bold text-xs text-gray-900">₹{b.total}</div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      b.status === 'COMPLETED'
                        ? 'text-emerald-600 bg-emerald-50'
                        : b.status === 'CANCELLED'
                        ? 'text-gray-500 bg-gray-100'
                        : 'text-amber-700 bg-amber-50'
                    }`}>
                      {STATUS_SHORT[b.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-center text-xs text-gray-500">
              No recent bookings found. Request your first EV assistance above!
            </div>
          )}
        </div>
      </div>

      {/* Right Map Area (Full Height & Width) */}
      <div className="flex-1 h-[50vh] lg:h-full relative bg-gray-50 min-h-[300px]">
        <CustomerMap
          coords={coords}
          onCoordsChange={handleCoordsChange}
        />
      </div>
    </div>
  );
}
