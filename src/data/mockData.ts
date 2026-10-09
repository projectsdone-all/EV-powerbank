// DEMO DATA ONLY — Fictional notifications for UI demonstration.

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Executive Assigned', message: 'Rahul K has been assigned to your request.', time: '2 min ago', read: false, type: 'info' },
  { id: 'n2', title: 'Executive Nearby', message: 'Your assistance executive is 4.2 km away.', time: '5 min ago', read: false, type: 'info' },
  { id: 'n3', title: 'Vehicle Verified', message: 'KA01AB1234 verification completed successfully.', time: '1 hour ago', read: false, type: 'success' },
  { id: 'n4', title: 'Service Completed', message: 'Emergency charging service for KA05MN8899 is complete.', time: '2 hours ago', read: true, type: 'success' },
  { id: 'n5', title: 'Payment Receipt', message: 'Payment receipt for booking EVA-2026-0846 generated.', time: '2 hours ago', read: true, type: 'info' },
  { id: 'n6', title: 'Low Battery Alert', message: 'Your Nexon EV battery is below 15%.', time: '3 hours ago', read: true, type: 'warning' },
  { id: 'n7', title: 'New Feature', message: 'You can now track your executive in real-time.', time: '1 day ago', read: true, type: 'info' },
];

export interface ServiceArea {
  id: string;
  name: string;
  status: 'available' | 'limited' | 'busy';
  executives: number;
  avg_response: string;
  coverage: string;
}

export const mockServiceAreas: ServiceArea[] = [
  { id: 'sa1', name: 'North Bengaluru', status: 'available', executives: 6, avg_response: '18 min', coverage: 'Hebbal, Yelahanka, Devanahalli' },
  { id: 'sa2', name: 'South Bengaluru', status: 'available', executives: 8, avg_response: '15 min', coverage: 'Electronic City, JP Nagar, Bannerghatta' },
  { id: 'sa3', name: 'East Bengaluru', status: 'limited', executives: 4, avg_response: '22 min', coverage: 'Whitefield, Marathahalli, KR Puram' },
  { id: 'sa4', name: 'West Bengaluru', status: 'available', executives: 5, avg_response: '20 min', coverage: 'Rajajinagar, Yeshwanthpur, Malleswaram' },
  { id: 'sa5', name: 'Central Bengaluru', status: 'busy', executives: 7, avg_response: '12 min', coverage: 'MG Road, Koramangala, Indiranagar' },
];

export const mockServices = [
  { id: 's1', key: 'emergency_charging' as const, title: 'Mobile EV Charging', description: 'Emergency on-road charging when your EV is running critically low.', icon: 'Zap', price: 799 },
  { id: 's2', key: 'battery_assistance' as const, title: 'Battery Assistance', description: 'Battery-related roadside support for unexpected EV failures.', icon: 'Battery', price: 599 },
  { id: 's3', key: 'diagnostics' as const, title: 'EV Diagnostics', description: 'Basic vehicle and battery diagnostics to help identify the problem.', icon: 'Activity', price: 499 },
  { id: 's4', key: 'roadside_assistance' as const, title: 'Roadside Assistance', description: 'Support for common roadside problems and minor EV-related issues.', icon: 'Wrench', price: 399 },
  { id: 's5', key: 'emergency_rescue' as const, title: 'Emergency Rescue', description: 'Priority assistance for vehicles stranded on the road.', icon: 'ShieldAlert', price: 1299 },
];

export const mockCustomers = [
  { id: 'c1', name: 'Tejaraj S', phone: '+91 98765 43210', email: 'tejaraj@demo.com', vehicles: 2, bookings: 12, status: 'active' as const, joined: '01 Aug 2026' },
  { id: 'c2', name: 'Ananya R', phone: '+91 97654 32109', email: 'ananya@demo.com', vehicles: 1, bookings: 5, status: 'active' as const, joined: '15 Aug 2026' },
  { id: 'c3', name: 'Karthik M', phone: '+91 96543 21098', email: 'karthik@demo.com', vehicles: 1, bookings: 3, status: 'active' as const, joined: '22 Aug 2026' },
  { id: 'c4', name: 'Priya D', phone: '+91 95432 10987', email: 'priya@demo.com', vehicles: 2, bookings: 8, status: 'active' as const, joined: '01 Sep 2026' },
  { id: 'c5', name: 'Suresh V', phone: '+91 94321 09876', email: 'suresh@demo.com', vehicles: 1, bookings: 2, status: 'inactive' as const, joined: '10 Sep 2026' },
  { id: 'c6', name: 'Meera K', phone: '+91 93210 98765', email: 'meera@demo.com', vehicles: 1, bookings: 4, status: 'active' as const, joined: '18 Sep 2026' },
];

export const faqData = [
  { q: 'How does EV Assist work?', a: 'EV Assist connects you with nearby EV assistance executives who come to your location with mobile charging equipment and roadside support tools. Simply request assistance through the app, share your location, and a trained executive will be dispatched to help you.' },
  { q: 'What type of EV problems can you request help for?', a: 'You can request help for emergency charging when your battery is critically low, battery-related issues, basic EV diagnostics, general roadside assistance like flat tyres, and priority emergency rescue for stranded vehicles.' },
  { q: 'Can I verify my vehicle before booking?', a: 'Yes. Use our Vehicle Check feature to verify your vehicle registration number. This helps us prepare the right equipment and ensures faster service when you need assistance.' },
  { q: 'How is the executive assigned?', a: 'When you submit an assistance request, our system identifies the nearest available executive in your area and assigns them to your request. The executive receives your location, vehicle details, and service requirement.' },
  { q: 'Can I track the executive?', a: 'Yes. Once an executive is assigned, you can track their real-time location on the map, see their ETA, and communicate via in-app chat or call.' },
  { q: 'Can I contact the executive?', a: 'Absolutely. You can call or chat with your assigned executive directly through the app once they are assigned to your request.' },
  { q: 'What payment options can the platform support?', a: 'The platform is designed to support UPI, credit/debit cards, and cash payments. Payment options may vary based on service availability.' },
  { q: 'Can I save multiple vehicles?', a: 'Yes. You can add and manage multiple EVs in your account. Each vehicle can be verified separately, making it faster to book assistance for any of your vehicles.' },
];
