import { HelpCircle, Phone, MessageSquare, Mail, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerSupport() {
  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50/50 p-6 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link 
            to="/customer/dashboard" 
            className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">24/7 Roadside Support</h1>
          <p className="text-xs text-gray-500">Need immediate assistance or have questions about your service?</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Phone size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Emergency Hotline</h3>
            <p className="text-xs text-gray-500">Toll-free 24/7 roadside assistance across Bengaluru</p>
            <a 
              href="tel:18002008899" 
              className="inline-block text-sm font-bold text-emerald-600 hover:underline"
            >
              1800-200-8899
            </a>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">WhatsApp Support</h3>
            <p className="text-xs text-gray-500">Chat with our fleet dispatch support executive</p>
            <a 
              href="https://wa.me/919876543210" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-block text-sm font-bold text-blue-600 hover:underline"
            >
              +91 98765 43210
            </a>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-gray-900">Frequently Asked Roadside Questions</h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="font-semibold text-gray-900">How long does mobile charging take?</div>
              <div className="text-gray-500 mt-1">Our mobile fast-chargers add 30–50 km range in 15–20 minutes, enough to reach your destination or nearest station.</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="font-semibold text-gray-900">Which EV connectors are supported?</div>
              <div className="text-gray-500 mt-1">CCS2, Type 2, GB/T, and Bharat DC-001. All major Indian electric cars are supported.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
