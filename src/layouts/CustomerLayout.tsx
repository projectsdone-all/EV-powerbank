import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Car, 
  MapPin, 
  HelpCircle, 
  User, 
  Zap, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../hooks/useAppContext';

export default function CustomerLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout, addToast } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Logged out successfully', 'info');
    } catch {
      // ignore
    } finally {
      navigate('/login');
    }
  };

  const navItems = [
    { label: 'Home', to: '/customer/dashboard', icon: Home },
    { label: 'Bookings', to: '/customer/bookings', icon: Calendar },
    { label: 'Vehicles', to: '/customer/vehicles', icon: Car },
    { label: 'Tracking', to: '/customer/tracking', icon: MapPin },
    { label: 'Support', to: '/customer/support', icon: HelpCircle },
    { label: 'Profile', to: '/customer/profile', icon: User },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900 font-sans">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Zap size={18} className="fill-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-none">EV Assist</div>
            <div className="text-[11px] text-gray-400">Bangalore</div>
          </div>
        </div>
        <button 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed lg:static top-0 left-0 z-50 h-screen w-60 bg-white border-r border-gray-200 flex flex-col justify-between p-5 transition-transform duration-300 shrink-0
        ${mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="flex items-center gap-3 pb-8 pt-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Zap size={20} className="fill-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-base leading-tight">EV Assist</div>
              <div className="text-xs text-gray-400 font-normal">Bangalore</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-600 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      size={19} 
                      className={isActive ? 'text-emerald-600' : 'text-gray-400'} 
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile at bottom */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-sm flex items-center justify-center shrink-0 uppercase">
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'EV'}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate leading-tight">
                {user?.name || 'Customer'}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'Customer'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1 shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 h-screen overflow-hidden pt-16 lg:pt-0 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
