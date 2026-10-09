import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  ChevronRight, 
  Zap, 
  Car, 
  LifeBuoy,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { api, Booking, STATUS_SHORT } from '../services/api';

export default function CustomerBookings() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.bookings.list();
      if (res.success) {
        setBookings(res.bookings);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'completed') return b.status === 'COMPLETED';
    if (filter === 'active') {
      return ['PENDING', 'ASSIGNED', 'ON_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(b.status);
    }
    return true;
  });

  const activeCount = bookings.filter((b) =>
    ['PENDING', 'ASSIGNED', 'ON_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)
  ).length;

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50/50 p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link 
                to="/customer/dashboard" 
                className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-xs text-gray-500">History of all your EV service and charging requests</p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-xl shadow-2xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === 'all' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === 'active' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === 'completed' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
            <button onClick={fetchBookings} className="underline font-bold">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 size={24} className="animate-spin text-emerald-600" />
            <p className="text-xs">Loading booking records...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 border-dashed rounded-2xl">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Bookings Found</h3>
            <p className="text-xs text-gray-500 mb-6">
              {filter !== 'all' ? `No ${filter} bookings at the moment.` : 'You have not placed any assistance requests yet.'}
            </p>
            <Link
              to="/customer/dashboard"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs"
            >
              Request EV Help Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredBookings.map((b) => {
              const isCompleted = b.status === 'COMPLETED';
              const dateDisplay = new Date(b.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });
              const timeDisplay = new Date(b.createdAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div 
                  key={b.id}
                  className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      b.serviceType === 'mobile'
                        ? 'bg-emerald-50 text-emerald-600'
                        : b.serviceType === 'battery'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {b.serviceType === 'mobile' ? (
                        <Zap size={22} />
                      ) : b.serviceType === 'battery' ? (
                        <Car size={22} />
                      ) : (
                        <LifeBuoy size={22} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-sm text-gray-900">{b.serviceLabel}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.status === 'CANCELLED'
                            ? 'bg-gray-100 text-gray-500 border border-gray-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                        }`}>
                          {STATUS_SHORT[b.status]}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        {b.vehicleModel} • <span className="font-mono">{b.vehicleNumber}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400" /> {b.address.split(',')[0]}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {dateDisplay} at {timeDisplay}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    <div className="text-base font-bold text-gray-900">₹{b.total}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Exec: {b.executiveName || 'Assigned Agent'}</div>
                    {!isCompleted && (
                      <Link 
                        to="/customer/tracking" 
                        className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        Track Live <ChevronRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
