import { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, CheckCircle2, ArrowLeft, Loader2, AlertCircle, Clock, XCircle, Star, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import CustomerMap from '../components/CustomerMap';
import { api, Booking, onDataChange, STATUS_SHORT, STATUS_TEXT } from '../services/api';
import { useApp } from '../hooks/useAppContext';

export default function CustomerTracking() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToast } = useApp();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadActive(first: boolean) {
      try {
        if (first) setLoading(true);
        const res = await api.bookings.getActive();
        let b = res.booking;
        if (!b) {
          const allRes = await api.bookings.list();
          b = allRes.bookings[0] ?? null;
        }
        if (isMounted) { setBooking(b); setError(''); }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load tracking details');
      } finally {
        if (isMounted && first) setLoading(false);
      }
    }
    loadActive(true);
    const off = onDataChange(() => loadActive(false));
    const t = window.setInterval(() => loadActive(false), 4000);
    return () => { isMounted = false; off(); clearInterval(t); };
  }, []);

  const cancel = async () => {
    if (!booking || !window.confirm('Cancel this assistance request?')) return;
    setBusy(true);
    try { const r = await api.bookings.cancel(booking.id); setBooking(r.booking); addToast('Request cancelled', 'info'); }
    catch (e: any) { addToast(e.message, 'error'); }
    finally { setBusy(false); }
  };
  const rate = async (stars: number) => {
    if (!booking) return;
    try { const r = await api.bookings.rate(booking.id, stars); setBooking(r.booking); addToast(r.message, 'success'); }
    catch (e: any) { addToast(e.message, 'error'); }
  };

  const coords = booking
    ? { lat: booking.latitude, lng: booking.longitude }
    : { lat: 13.0358, lng: 77.597 };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-white">
      {/* Tracking Details Panel */}
      <div className="w-full lg:w-[410px] xl:w-[430px] shrink-0 h-full overflow-y-auto border-r border-gray-100 p-5 sm:p-6 bg-white space-y-5">
        <div>
          <Link 
            to="/customer/dashboard" 
            className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
            {booking && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                booking.status === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : booking.status === 'CANCELLED'
                  ? 'bg-gray-100 text-gray-500 border border-gray-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
              }`}>
                {STATUS_SHORT[booking.status]}
              </span>
            )}
          </div>
          {booking && (
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              Booking Ref: {booking.bookingNumber}
            </p>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 size={24} className="animate-spin text-emerald-600" />
            <p className="text-xs">Locating assigned service unit...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        ) : !booking ? (
          <div className="p-6 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50 space-y-3">
            <p className="text-xs text-gray-500">No active assistance job currently in progress.</p>
            <Link
              to="/customer/dashboard"
              className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
            >
              Request Assistance
            </Link>
          </div>
        ) : (
          <>
            {/* ETA Card */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">{STATUS_TEXT[booking.status]}</div>
                <div className="text-3xl font-extrabold text-emerald-700 mt-0.5">
                  {booking.status === 'PENDING' ? 'Finding…'
                    : booking.status === 'ASSIGNED' || booking.status === 'ON_ROUTE' ? `${booking.etaMinutes ?? '—'} mins`
                    : booking.status === 'ARRIVED' ? 'Arrived'
                    : booking.status === 'IN_PROGRESS' ? 'Working'
                    : booking.status === 'COMPLETED' ? 'Done' : 'Cancelled'}
                </div>
                <div className="text-xs text-emerald-600 font-medium mt-0.5">
                  {booking.status === 'PENDING' ? 'Our operations team is assigning the nearest executive'
                    : booking.status === 'ASSIGNED' ? `${booking.executiveName} is getting ready · ${booking.distanceKm} km away`
                    : booking.status === 'ON_ROUTE' ? `Distance: ${booking.distanceKm} km away`
                    : booking.status === 'COMPLETED' ? `Paid ₹${booking.total}${booking.paymentMode ? ` by ${booking.paymentMode}` : ''}`
                    : booking.status === 'CANCELLED' ? (booking.cancelReason || 'Request cancelled') : 'Your executive is with your vehicle'}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                {booking.status === 'PENDING' ? <Clock size={22} className="animate-pulse" /> : booking.status === 'IN_PROGRESS' ? <Wrench size={22} /> : <Navigation size={22} />}
              </div>
            </div>

            {/* Executive Info */}
            {booking.executiveName && (
              <div className="border border-gray-200 rounded-2xl p-4 bg-white flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center shrink-0">
                  {booking.executiveName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-gray-900 leading-tight">{booking.executiveName}</div>
                  <div className="text-xs text-gray-500 mt-0.5">⭐ {booking.executiveRating ?? '—'} • {booking.executiveVehicle}</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Mobile EV Fast-Charger Unit</div>
                </div>
                {booking.executivePhone && (
                  <a href={`tel:${booking.executivePhone}`} className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors shrink-0" title="Call Executive">
                    <Phone size={18} />
                  </a>
                )}
              </div>
            )}

            {/* Progress Timeline */}
            <div className="border border-gray-200 rounded-2xl p-5 bg-white space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Status Progress</h3>
              <ol className="space-y-3.5 text-xs" data-testid="timeline">
                {(['PENDING', 'ASSIGNED', 'ON_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => {
                  const ev = booking.history.find((h) => h.status === st);
                  const order = ['PENDING', 'ASSIGNED', 'ON_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'];
                  const reached = booking.status !== 'CANCELLED' && order.indexOf(booking.status) >= order.indexOf(st);
                  const current = booking.status === st;
                  return (
                    <li key={st} className={`flex items-start gap-3 ${reached || ev ? '' : 'opacity-45'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${reached ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'} ${current && st !== 'COMPLETED' ? 'animate-pulse' : ''}`}>
                        <CheckCircle2 size={13} />
                      </div>
                      <div>
                        <div className={`font-bold ${current ? 'text-emerald-700' : 'text-gray-900'}`}>{STATUS_TEXT[st]}</div>
                        <div className="text-gray-400 text-[11px]">{ev ? `${new Date(ev.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}${ev.note ? ` · ${ev.note}` : ''}` : '—'}</div>
                      </div>
                    </li>
                  );
                })}
                {booking.status === 'CANCELLED' && (
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-red-100 text-red-600"><XCircle size={13} /></div>
                    <div><div className="font-bold text-red-600">Cancelled</div><div className="text-gray-400 text-[11px]">{booking.cancelReason}</div></div>
                  </li>
                )}
              </ol>
            </div>

            {['PENDING', 'ASSIGNED', 'ON_ROUTE'].includes(booking.status) && (
              <button onClick={cancel} disabled={busy} className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-50">
                Cancel request
              </button>
            )}

            {booking.status === 'COMPLETED' && (
              <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                <div className="text-xs font-bold text-gray-900">{booking.customerRating ? 'Thanks for rating!' : `How was ${booking.executiveName}?`}</div>
                <div className="flex gap-1.5 mt-2" role="group" aria-label="Rate the service">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} disabled={!!booking.customerRating} onClick={() => rate(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      className={`${(booking.customerRating ?? 0) >= n ? 'text-amber-400' : 'text-gray-300'} hover:text-amber-400 disabled:cursor-default`}>
                      <Star size={24} fill="currentColor" />
                    </button>
                  ))}
                </div>
                <Link to="/customer/dashboard" className="inline-block mt-3 text-xs font-semibold text-emerald-700 hover:underline">Request new assistance</Link>
              </div>
            )}

            {/* Destination Location Info */}
            <div className="border border-gray-100 rounded-xl p-3 bg-gray-50 text-xs">
              <div className="text-gray-400 text-[11px] font-semibold uppercase">Service Address</div>
              <div className="font-medium text-gray-800 mt-1 flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-600 shrink-0" />
                <span className="truncate">{booking.address}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Map View */}
      <div className="flex-1 h-[50vh] lg:h-full relative bg-gray-50 min-h-[300px]">
        <CustomerMap
          coords={coords}
        />
      </div>
    </div>
  );
}
