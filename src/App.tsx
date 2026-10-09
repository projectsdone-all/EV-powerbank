import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider } from './hooks/useAppContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import RootLayout from './layouts/RootLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Public Pages
import Home from './pages/Home';
import Services from './pages/Services';
import VehicleCheck from './pages/VehicleCheck';
import HowItWorks from './pages/HowItWorks';
import Coverage from './pages/Coverage';
import FAQ from './pages/FAQ';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard Pages
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerBookings from './pages/CustomerBookings';
import CustomerVehicles from './pages/CustomerVehicles';
import CustomerBook from './pages/CustomerBook';
import CustomerTracking from './pages/CustomerTracking';
import CustomerSupport from './pages/CustomerSupport';
import CustomerProfile from './pages/CustomerProfile';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import ExecutiveActiveJob from './pages/ExecutiveActiveJob';
import StaffLayout from './staff/StaffLayout';
import AdminOverview from './staff/AdminOverview';
import AdminUsers from './staff/AdminUsers';
import DispatchBoard from './staff/DispatchBoard';
import ExecutivesPage from './staff/ExecutivesPage';
import AccountPage from './staff/AccountPage';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Marketing Website */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="check-vehicle" element={<VehicleCheck />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="coverage" element={<Coverage />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route path="vehicle-check" element={<VehicleCheck />} />
          </Route>

          {/* Staff areas */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><StaffLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="dispatch" element={<DispatchBoard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="account" element={<AccountPage />} />
          </Route>
          <Route path="/manager" element={<ProtectedRoute allowedRoles={['MANAGER']}><StaffLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DispatchBoard title="Operations dispatch" />} />
            <Route path="executives" element={<ExecutivesPage />} />
            <Route path="account" element={<AccountPage />} />
          </Route>
          <Route path="/executive" element={<ProtectedRoute allowedRoles={['EXECUTIVE']}><StaffLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ExecutiveDashboard />} />
            <Route path="active-job" element={<ExecutiveActiveJob />} />
            <Route path="account" element={<AccountPage />} />
          </Route>

          {/* Customer App Flow (Dedicated App Layout matching reference) */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="bookings" element={<CustomerBookings />} />
            <Route path="vehicles" element={<CustomerVehicles />} />
            <Route path="book" element={<CustomerBook />} />
            <Route path="tracking" element={<CustomerTracking />} />
            <Route path="support" element={<CustomerSupport />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
