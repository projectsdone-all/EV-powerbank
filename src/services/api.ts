/**
 * EV Assist — in-browser backend.
 *
 * The site runs with no server: users, vehicles and bookings are stored in the
 * browser (localStorage) and every role shares the same data in that browser.
 * So a customer can book, the manager can dispatch it, the executive can
 * complete it and the customer sees each step live — all on one deployment.
 *
 * Demo logins (shown on the Login page):
 *   Admin      admin@evassist.in      Admin@123
 *   Manager    manager@evassist.in    Manager@123
 *   Executive  executive@evassist.in  Exec@123
 *   Customer   user@evassist.in       User@123
 */
import { sha256 } from './sha256';

export type Role = 'CUSTOMER' | 'EXECUTIVE' | 'MANAGER' | 'ADMIN';
export type BookingStatus = 'PENDING' | 'ASSIGNED' | 'ON_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export const ACTIVE_STATUSES: BookingStatus[] = ['PENDING', 'ASSIGNED', 'ON_ROUTE', 'ARRIVED', 'IN_PROGRESS'];

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  role: Role;
}

export interface ExecutiveProfile {
  vehicleNumber: string;
  zone: string;
  rating: number;
  ratingCount: number;
  online: boolean;
  latitude: number;
  longitude: number;
}

export interface ManagedUser extends User {
  active: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  executive?: ExecutiveProfile;
}

export interface Executive extends ManagedUser {
  executive: ExecutiveProfile;
  activeJob: Booking | null;
  completedToday: number;
  completedTotal: number;
  earningsToday: number;
}

export interface Vehicle {
  id: string;
  rcNumber: string;
  maker: string;
  model: string;
  fuelType: string;
  vehicleClass: string;
  batteryKwh: number;
  color: string;
  verified: boolean;
  createdAt?: string;
}

/** Shape returned by vehicle verification */
export interface VerifiedVehicleData {
  rcNumber: string;
  ownerNameMasked: string | null;
  maker: string;
  model: string;
  fuelType: string;
  vehicleClass: string;
  color: string;
  registrationDate: string | null;
  rto: string | null;
  insuranceValidUpto: string | null;
  fitnessValidUpto: string | null;
  batteryKwh: number | null;
  isLiveData: boolean;
  sandboxWarning: string | null;
}

export interface StatusEvent { status: BookingStatus; at: string; by: string; note?: string }

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  vehicleId?: string | null;
  vehicleModel: string;
  vehicleNumber: string;
  serviceType: 'mobile' | 'battery' | 'emergency';
  serviceLabel: string;
  status: BookingStatus;
  batteryPercent: number;
  address: string;
  latitude: number;
  longitude: number;
  executiveId?: string | null;
  executiveName?: string | null;
  executivePhone?: string | null;
  executiveVehicle?: string | null;
  executiveRating?: number | null;
  etaMinutes?: number | null;
  distanceKm?: number | null;
  amount: number;
  gst: number;
  total: number;
  paymentMode?: 'UPI' | 'CASH' | 'CARD' | null;
  customerRating?: number | null;
  notes?: string | null;
  cancelReason?: string | null;
  history: StatusEvent[];
  createdAt: string;
  updatedAt: string;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: unknown[];
  constructor(message: string, statusCode = 400, errors?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// ─── storage ────────────────────────────────────────────────────────────────
interface UserRow extends ManagedUser { salt: string; passwordHash: string }
interface VehicleRow extends Vehicle { userId: string }
interface DB { version: number; users: UserRow[]; vehicles: VehicleRow[]; bookings: Booking[] }

const DB_KEY = 'evassist.db.v2';
const SESSION_KEY = 'evassist.session.v2';
const CHANGE_EVENT = 'evassist:change';

let db: DB | null = null;
let ready: Promise<void> | null = null;

const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();
const ago = (min: number) => new Date(Date.now() - min * 60000).toISOString();
const wait = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const hash = (salt: string, password: string) => sha256(`${salt}:${password}`);

function persist() {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
  catch { throw new ApiError('Browser storage is full. Clear some data and try again.', 507); }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function seedUser(id: string, role: Role, name: string, email: string, password: string, phone: string, extra: Partial<UserRow> = {}): UserRow {
  const salt = Math.random().toString(36).slice(2);
  return { id, role, name, email, phone, city: 'Bengaluru, Karnataka', active: true, createdAt: '2026-01-01T09:00:00.000Z', lastLoginAt: null, salt, passwordHash: hash(salt, password), ...extra };
}

function seed(): DB {
  const exec = (vehicleNumber: string, zone: string, rating: number, latitude: number, longitude: number, online = true): ExecutiveProfile =>
    ({ vehicleNumber, zone, rating, ratingCount: 120, online, latitude, longitude });
  const users: UserRow[] = [
    seedUser('u-admin', 'ADMIN', 'EV Assist Administrator', 'admin@evassist.in', 'Admin@123', '+91 90000 11111'),
    seedUser('u-manager', 'MANAGER', 'Kavya R (Operations Manager)', 'manager@evassist.in', 'Manager@123', '+91 90000 22222'),
    seedUser('u-exec-1', 'EXECUTIVE', 'Rahul K', 'executive@evassist.in', 'Exec@123', '+91 99887 76655', { executive: exec('KA05 AB 2481', 'North Bengaluru', 4.9, 13.0285, 77.5895) }),
    seedUser('u-exec-2', 'EXECUTIVE', 'Vikram S', 'vikram@evassist.in', 'Exec@123', '+91 98877 66544', { executive: exec('KA05 CD 3892', 'East Bengaluru', 4.8, 12.9698, 77.7500) }),
    seedUser('u-exec-3', 'EXECUTIVE', 'Pradeep N', 'pradeep@evassist.in', 'Exec@123', '+91 97766 55433', { executive: exec('KA05 EF 5614', 'South Bengaluru', 4.7, 12.9250, 77.5838) }),
    seedUser('u-cust-1', 'CUSTOMER', 'Tejaraj Nidagundi', 'user@evassist.in', 'User@123', '+91 98765 43210'),
    seedUser('u-cust-2', 'CUSTOMER', 'Meera S', 'meera@evassist.in', 'User@123', '+91 98450 12345'),
  ];
  const v = (id: string, userId: string, rcNumber: string, maker: string, model: string, batteryKwh: number, color: string, createdAt: string): VehicleRow =>
    ({ id, userId, rcNumber, maker, model, fuelType: 'Electric', vehicleClass: 'Motor Car', batteryKwh, color, verified: true, createdAt });
  const vehicles = [
    v('veh-1', 'u-cust-1', 'KA01EV0001', 'Tata', 'Nexon EV', 40.5, 'Pristine White', '2026-01-15T00:00:00.000Z'),
    v('veh-2', 'u-cust-1', 'KA05MN8899', 'MG', 'ZS EV', 50.3, 'Glaze Red', '2026-02-10T00:00:00.000Z'),
    v('veh-3', 'u-cust-2', 'KA03EV2026', 'Hyundai', 'Ioniq 5', 72.6, 'Digital Teal', '2026-03-01T00:00:00.000Z'),
  ];
  const base = (b: Partial<Booking> & Pick<Booking, 'id' | 'bookingNumber' | 'userId' | 'status' | 'createdAt'>): Booking => {
    const amount = b.serviceType === 'battery' ? 899 : b.serviceType === 'emergency' ? 999 : 799;
    const gst = Math.round(amount * 0.18);
    return {
      customerName: '', customerPhone: '', vehicleModel: '', vehicleNumber: '', serviceType: 'mobile', serviceLabel: 'Mobile Charging',
      batteryPercent: 20, address: '', latitude: 13.0358, longitude: 77.597, amount, gst, total: amount + gst, history: [],
      updatedAt: b.createdAt, notes: '', ...b,
    } as Booking;
  };
  const rahul = users[2]!;
  const bookings: Booking[] = [
    base({
      id: 'book-1', bookingNumber: 'EVA-2026-0847', userId: 'u-cust-1', customerName: 'Tejaraj Nidagundi', customerPhone: '+91 98765 43210',
      vehicleId: 'veh-1', vehicleModel: 'Tata Nexon EV', vehicleNumber: 'KA01EV0001', status: 'ON_ROUTE', batteryPercent: 15,
      address: '1st Main Road, Anand Nagar Colony, Hebbal, Bengaluru', latitude: 13.0358, longitude: 77.597,
      executiveId: rahul.id, executiveName: rahul.name, executivePhone: rahul.phone, executiveVehicle: `${rahul.executive!.vehicleNumber} (Mobile Fast-Charger Van)`,
      executiveRating: 4.9, etaMinutes: 12, distanceKm: 3.8, notes: 'Urgent charging needed. Battery currently at 15%.', createdAt: ago(15),
      history: [{ status: 'PENDING', at: ago(15), by: 'Tejaraj Nidagundi' }, { status: 'ASSIGNED', at: ago(14), by: 'Auto-dispatch' }, { status: 'ON_ROUTE', at: ago(10), by: 'Rahul K' }],
    }),
    base({
      id: 'book-2', bookingNumber: 'EVA-2026-0842', userId: 'u-cust-1', customerName: 'Tejaraj Nidagundi', customerPhone: '+91 98765 43210',
      vehicleId: 'veh-1', vehicleModel: 'Tata Nexon EV', vehicleNumber: 'KA01EV0001', status: 'COMPLETED', batteryPercent: 12,
      address: 'Hebbal, Bengaluru', executiveId: rahul.id, executiveName: rahul.name, executivePhone: rahul.phone, executiveVehicle: rahul.executive!.vehicleNumber,
      executiveRating: 4.9, etaMinutes: 0, distanceKm: 4.2, paymentMode: 'UPI', customerRating: 5, notes: 'Charged 15 kWh on-site.', createdAt: ago(60 * 24),
      history: [{ status: 'PENDING', at: ago(1440), by: 'Tejaraj Nidagundi' }, { status: 'ASSIGNED', at: ago(1439), by: 'Auto-dispatch' }, { status: 'COMPLETED', at: ago(1380), by: 'Rahul K' }],
    }),
    base({
      id: 'book-3', bookingNumber: 'EVA-2026-0851', userId: 'u-cust-2', customerName: 'Meera S', customerPhone: '+91 98450 12345',
      vehicleId: 'veh-3', vehicleModel: 'Hyundai Ioniq 5', vehicleNumber: 'KA03EV2026', serviceType: 'battery', serviceLabel: 'Battery Assistance', status: 'PENDING',
      batteryPercent: 8, address: '80 Feet Road, Koramangala 4th Block, Bengaluru', latitude: 12.9352, longitude: 77.6245,
      notes: 'Car not starting after a week parked.', createdAt: ago(4), history: [{ status: 'PENDING', at: ago(4), by: 'Meera S' }],
    }),
  ];
  return { version: 2, users, vehicles, bookings };
}

function init(): Promise<void> {
  ready ??= (async () => {
    try {
      const raw = localStorage.getItem(DB_KEY);
      const parsed = raw ? (JSON.parse(raw) as DB) : null;
      db = parsed && parsed.version === 2 ? parsed : seed();
    } catch { db = seed(); }
    persist();
  })();
  return ready;
}

/** Re-run when data changes in this tab or another tab */
export function onDataChange(cb: () => void) {
  const storage = (e: StorageEvent) => { if (e.key === DB_KEY) { try { db = JSON.parse(e.newValue || 'null') ?? db; } catch { /* ignore */ } cb(); } };
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener('storage', storage);
  return () => { window.removeEventListener(CHANGE_EVENT, cb); window.removeEventListener('storage', storage); };
}

const D = () => db!;
const publicUser = (u: UserRow): User => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, city: u.city, role: u.role });
const managed = (u: UserRow): ManagedUser => {
  const { salt: _s, passwordHash: _p, ...rest } = u;
  return { ...rest };
};
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

function sessionUser(): UserRow {
  let id: string | null = null;
  try { id = localStorage.getItem(SESSION_KEY); } catch { /* ignore */ }
  const u = id ? D().users.find((x) => x.id === id && x.active) : undefined;
  if (!u) throw new ApiError('Please log in to continue.', 401);
  return u;
}
function requireRole(...roles: Role[]) {
  const u = sessionUser();
  if (!roles.includes(u.role)) throw new ApiError('You do not have access to this action.', 403);
  return u;
}

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const normalizePhone = (p: string) => p.replace(/\D/g, '').slice(-10);

// ─── dispatch helpers ───────────────────────────────────────────────────────
function km(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371, toR = Math.PI / 180;
  const dLat = (bLat - aLat) * toR, dLng = (bLng - aLng) * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * toR) * Math.cos(bLat * toR) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const busy = (execId: string) => D().bookings.some((b) => b.executiveId === execId && ACTIVE_STATUSES.includes(b.status) && b.status !== 'PENDING');

function attachExecutive(b: Booking, ex: UserRow, by: string) {
  const dist = km(ex.executive!.latitude, ex.executive!.longitude, b.latitude, b.longitude);
  b.executiveId = ex.id;
  b.executiveName = ex.name;
  b.executivePhone = ex.phone ?? null;
  b.executiveVehicle = `${ex.executive!.vehicleNumber} (Mobile Charging Unit)`;
  b.executiveRating = ex.executive!.rating;
  b.distanceKm = Math.round(dist * 10) / 10;
  b.etaMinutes = Math.max(5, Math.round((dist / 25) * 60) + 4);
  b.status = 'ASSIGNED';
  b.updatedAt = now();
  b.history.push({ status: 'ASSIGNED', at: now(), by, note: `Assigned to ${ex.name}` });
}

function autoAssign(b: Booking) {
  const free = D().users
    .filter((u) => u.role === 'EXECUTIVE' && u.active && u.executive?.online && !busy(u.id))
    .sort((x, y) => km(x.executive!.latitude, x.executive!.longitude, b.latitude, b.longitude) - km(y.executive!.latitude, y.executive!.longitude, b.latitude, b.longitude));
  if (free[0]) attachExecutive(b, free[0], 'Auto-dispatch');
}

const NEXT: Partial<Record<BookingStatus, BookingStatus>> = { ASSIGNED: 'ON_ROUTE', ON_ROUTE: 'ARRIVED', ARRIVED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED' };

// ─── RTO sandbox lookup ─────────────────────────────────────────────────────
export function normalizeRcNumber(raw: string) { return raw.replace(/[\s-]/g, '').toUpperCase(); }
export function isValidIndianRcNumber(n: string) { return /^[A-Z]{2}\d{2}[A-Z]{0,3}\d{1,4}$/.test(n) || /^\d{2}BH\d{4}[A-Z]{1,2}$/.test(n); }
const SANDBOX_WARNING = 'Sample registry data for demo purposes — not real VAHAN records.';
const RTO: Record<string, Omit<VerifiedVehicleData, 'rcNumber' | 'isLiveData' | 'sandboxWarning'>> = {
  KA01AB1234: { ownerNameMasked: 'T**** N*******', maker: 'Tata', model: 'Nexon EV', fuelType: 'Electric', vehicleClass: 'Motor Car', color: 'Pristine White', registrationDate: '15 Jun 2025', rto: 'Bengaluru (KA-01)', insuranceValidUpto: '14 Jun 2027', fitnessValidUpto: '14 Jun 2040', batteryKwh: 40.5 },
  KA05MN8899: { ownerNameMasked: 'D*** C*******', maker: 'MG', model: 'ZS EV', fuelType: 'Electric', vehicleClass: 'Motor Car', color: 'Glaze Red', registrationDate: '22 Mar 2025', rto: 'Bengaluru (KA-05)', insuranceValidUpto: '21 Mar 2027', fitnessValidUpto: '21 Mar 2040', batteryKwh: 50.3 },
  KA03EV2026: { ownerNameMasked: 'D*** C*******', maker: 'Hyundai', model: 'Ioniq 5', fuelType: 'Electric', vehicleClass: 'Motor Car', color: 'Digital Teal', registrationDate: '10 Jan 2026', rto: 'Bengaluru (KA-03)', insuranceValidUpto: '09 Jan 2028', fitnessValidUpto: '09 Jan 2041', batteryKwh: 72.6 },
  MH02AV7788: { ownerNameMasked: 'R*** S*****', maker: 'Ola Electric', model: 'S1 Pro', fuelType: 'Electric', vehicleClass: 'Motor Cycle', color: 'Jet Black', registrationDate: '05 Aug 2024', rto: 'Mumbai (MH-02)', insuranceValidUpto: '04 Aug 2026', fitnessValidUpto: '04 Aug 2039', batteryKwh: 3.97 },
  KA51EV7777: { ownerNameMasked: 'A**** K****', maker: 'Mahindra', model: 'XUV400 EV', fuelType: 'Electric', vehicleClass: 'Motor Car', color: 'Nebula Blue', registrationDate: '18 Feb 2026', rto: 'Bengaluru (KA-51)', insuranceValidUpto: '17 Feb 2028', fitnessValidUpto: '17 Feb 2041', batteryKwh: 39.4 },
};
export const SAMPLE_RC_NUMBERS = Object.keys(RTO);

// ─── API ────────────────────────────────────────────────────────────────────
async function call<T>(fn: () => T | Promise<T>, delay = 120): Promise<T> {
  await init();
  await wait(delay);
  return clone(await fn());
}

export const api = {
  auth: {
    login(body: { email: string; password: string }) {
      return call(() => {
        const id = body.email.trim().toLowerCase();
        const digits = normalizePhone(id);
        const u = D().users.find((x) => x.email === id || (digits.length === 10 && normalizePhone(x.phone ?? '') === digits));
        if (!u || u.passwordHash !== hash(u.salt, body.password)) throw new ApiError('Invalid email or password.', 401);
        if (!u.active) throw new ApiError('This account has been disabled. Contact the administrator.', 403);
        u.lastLoginAt = now();
        localStorage.setItem(SESSION_KEY, u.id);
        persist();
        return { success: true, user: publicUser(u), message: 'Login successful' };
      }, 250);
    },

    register(body: { name: string; email: string; password: string; phone?: string; city?: string }) {
      return call(() => {
        const email = body.email.trim().toLowerCase();
        if (body.name.trim().length < 2) throw new ApiError('Name must be at least 2 characters.');
        if (!emailOk(email)) throw new ApiError('Please enter a valid email address.');
        if (body.password.length < 6) throw new ApiError('Password must be at least 6 characters.');
        if (D().users.some((u) => u.email === email)) throw new ApiError('An account with this email already exists.', 409);
        const salt = Math.random().toString(36).slice(2);
        const u: UserRow = {
          id: uid('u'), role: 'CUSTOMER', name: body.name.trim(), email, phone: body.phone?.trim() ?? '', city: body.city || 'Bengaluru, Karnataka',
          active: true, createdAt: now(), lastLoginAt: now(), salt, passwordHash: hash(salt, body.password),
        };
        D().users.push(u);
        localStorage.setItem(SESSION_KEY, u.id);
        persist();
        return { success: true, user: publicUser(u), message: 'Account created successfully' };
      }, 250);
    },

    me() {
      return call(() => ({ success: true, user: publicUser(sessionUser()) }), 0);
    },

    logout() {
      return call(() => { localStorage.removeItem(SESSION_KEY); return { success: true, message: 'Logged out successfully' }; }, 0);
    },

    changePassword(body: { currentPassword: string; newPassword: string }) {
      return call(() => {
        const u = sessionUser();
        if (u.passwordHash !== hash(u.salt, body.currentPassword)) throw new ApiError('Your current password is incorrect.');
        if (body.newPassword.length < 6) throw new ApiError('New password must be at least 6 characters.');
        u.salt = Math.random().toString(36).slice(2);
        u.passwordHash = hash(u.salt, body.newPassword);
        persist();
        return { success: true, message: 'Password changed' };
      });
    },
  },

  profile: {
    get() {
      return call(() => ({ success: true, profile: publicUser(sessionUser()) }));
    },
    update(body: { name?: string; phone?: string; city?: string }) {
      return call(() => {
        const u = sessionUser();
        if (body.name !== undefined) {
          if (body.name.trim().length < 2) throw new ApiError('Name must be at least 2 characters.');
          u.name = body.name.trim();
        }
        if (body.phone !== undefined) u.phone = body.phone.trim();
        if (body.city !== undefined) u.city = body.city.trim();
        persist();
        return { success: true, profile: publicUser(u), message: 'Profile updated' };
      });
    },
  },

  vehicles: {
    list() {
      return call(() => {
        const u = sessionUser();
        return { success: true, vehicles: D().vehicles.filter((v) => v.userId === u.id).sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')) as Vehicle[] };
      });
    },

    verify(body: { rcNumber: string; consentGiven: true }) {
      return call(() => {
        if (!body.consentGiven) throw new ApiError('User consent is required to look up vehicle registration details.');
        const rc = normalizeRcNumber(body.rcNumber);
        if (!isValidIndianRcNumber(rc)) throw new ApiError('Please enter a valid Indian vehicle registration number (e.g. KA01AB1234).');
        const rec = RTO[rc];
        if (!rec) throw new ApiError(`No record found for ${rc}. Try a sample: ${SAMPLE_RC_NUMBERS.join(', ')} — or add the vehicle details manually.`, 404);
        return { success: true, data: { ...rec, rcNumber: rc, isLiveData: false, sandboxWarning: SANDBOX_WARNING } as VerifiedVehicleData };
      }, 600);
    },

    create(body: { rcNumber: string; maker: string; model: string; fuelType?: string; vehicleClass?: string; batteryKwh?: number; color?: string }) {
      return call(() => {
        const u = sessionUser();
        const rc = normalizeRcNumber(body.rcNumber);
        if (rc.length < 4) throw new ApiError('Registration number is required.');
        if (!body.maker?.trim() || !body.model?.trim()) throw new ApiError('Manufacturer and model are required.');
        if (D().vehicles.some((v) => v.userId === u.id && v.rcNumber === rc)) throw new ApiError(`Vehicle ${rc} is already registered in your account.`, 409);
        const v: VehicleRow = {
          id: uid('veh'), userId: u.id, rcNumber: rc, maker: body.maker.trim(), model: body.model.trim(), fuelType: body.fuelType || 'Electric',
          vehicleClass: body.vehicleClass || 'Motor Car', batteryKwh: body.batteryKwh || 40.5, color: body.color || 'White', verified: Boolean(RTO[rc]), createdAt: now(),
        };
        D().vehicles.unshift(v);
        persist();
        return { success: true, vehicle: v as Vehicle, message: 'Vehicle added successfully' };
      });
    },

    delete(id: string) {
      return call(() => {
        const u = sessionUser();
        const i = D().vehicles.findIndex((v) => v.id === id && v.userId === u.id);
        if (i < 0) throw new ApiError('Vehicle not found or does not belong to you', 404);
        D().vehicles.splice(i, 1);
        persist();
        return { success: true, message: 'Vehicle removed successfully' };
      });
    },
  },

  bookings: {
    list() {
      return call(() => {
        const u = sessionUser();
        return { success: true, bookings: D().bookings.filter((b) => b.userId === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
      });
    },

    getActive() {
      return call(() => {
        const u = sessionUser();
        const b = D().bookings.filter((x) => x.userId === u.id && ACTIVE_STATUSES.includes(x.status)).sort((a, c) => c.createdAt.localeCompare(a.createdAt))[0] ?? null;
        return { success: true, booking: b };
      }, 0);
    },

    getById(id: string) {
      return call(() => {
        const u = sessionUser();
        const b = D().bookings.find((x) => x.id === id);
        const staff = u.role === 'ADMIN' || u.role === 'MANAGER' || (u.role === 'EXECUTIVE' && b?.executiveId === u.id);
        if (!b || (b.userId !== u.id && !staff)) throw new ApiError('Booking not found or access denied', 404);
        return { success: true, booking: b };
      }, 0);
    },

    create(body: {
      serviceType: 'mobile' | 'battery' | 'emergency'; serviceLabel?: string; vehicleId?: string; vehicleModel: string; vehicleNumber: string;
      batteryPercent: number; address: string; latitude: number; longitude: number; notes?: string;
    }) {
      return call(() => {
        const u = sessionUser();
        if (!body.vehicleModel || !body.vehicleNumber) throw new ApiError('Please choose a vehicle.');
        if (!body.address || body.address.trim().length < 3) throw new ApiError('Please enter the service address.');
        if (D().bookings.some((b) => b.userId === u.id && ACTIVE_STATUSES.includes(b.status) && b.vehicleNumber === body.vehicleNumber)) {
          throw new ApiError(`${body.vehicleNumber} already has an active request. Track it from the Tracking page.`, 409);
        }
        const labels = { mobile: 'Mobile Charging', battery: 'Battery Assistance', emergency: 'Emergency EV Help' };
        const amount = body.serviceType === 'battery' ? 899 : body.serviceType === 'emergency' ? 999 : 799;
        const gst = Math.round(amount * 0.18);
        const b: Booking = {
          id: uid('book'), bookingNumber: `EVA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`, userId: u.id,
          customerName: u.name, customerPhone: u.phone ?? '', vehicleId: body.vehicleId ?? null, vehicleModel: body.vehicleModel, vehicleNumber: body.vehicleNumber,
          serviceType: body.serviceType, serviceLabel: body.serviceLabel || labels[body.serviceType], status: 'PENDING',
          batteryPercent: Math.max(1, Math.min(100, Math.round(body.batteryPercent || 0))), address: body.address.trim(),
          latitude: body.latitude, longitude: body.longitude, amount, gst, total: amount + gst, notes: body.notes ?? '',
          history: [{ status: 'PENDING', at: now(), by: u.name }], createdAt: now(), updatedAt: now(),
        };
        autoAssign(b);
        D().bookings.unshift(b);
        persist();
        return {
          success: true, booking: b,
          message: b.status === 'ASSIGNED' ? `Assistance requested! ${b.executiveName} is assigned and will reach in ~${b.etaMinutes} min.` : 'Request received. Our operations team will assign the nearest executive shortly.',
        };
      }, 400);
    },

    cancel(id: string, reason = 'Cancelled by customer') {
      return call(() => {
        const u = sessionUser();
        const b = D().bookings.find((x) => x.id === id);
        const staff = u.role === 'ADMIN' || u.role === 'MANAGER';
        if (!b || (b.userId !== u.id && !staff)) throw new ApiError('Booking not found', 404);
        if (!['PENDING', 'ASSIGNED', 'ON_ROUTE'].includes(b.status)) throw new ApiError('This request can no longer be cancelled.');
        b.status = 'CANCELLED';
        b.cancelReason = reason;
        b.updatedAt = now();
        b.history.push({ status: 'CANCELLED', at: now(), by: u.name, note: reason });
        persist();
        return { success: true, booking: b, message: 'Request cancelled' };
      });
    },

    rate(id: string, stars: number) {
      return call(() => {
        const u = sessionUser();
        const b = D().bookings.find((x) => x.id === id && x.userId === u.id);
        if (!b || b.status !== 'COMPLETED') throw new ApiError('You can rate a service once it is completed.');
        if (b.customerRating) throw new ApiError('You have already rated this service.');
        b.customerRating = Math.max(1, Math.min(5, Math.round(stars)));
        const ex = D().users.find((x) => x.id === b.executiveId);
        if (ex?.executive) {
          const p = ex.executive;
          p.rating = Math.round(((p.rating * p.ratingCount + b.customerRating) / (p.ratingCount + 1)) * 10) / 10;
          p.ratingCount += 1;
        }
        persist();
        return { success: true, booking: b, message: 'Thanks for your feedback!' };
      });
    },
  },

  /** Field executive */
  executive: {
    me() {
      return call(() => {
        const u = requireRole('EXECUTIVE');
        return { success: true, executive: execView(u) };
      }, 0);
    },
    jobs() {
      return call(() => {
        const u = requireRole('EXECUTIVE');
        return { success: true, bookings: D().bookings.filter((b) => b.executiveId === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
      }, 0);
    },
    setOnline(online: boolean) {
      return call(() => {
        const u = requireRole('EXECUTIVE');
        if (!online && busy(u.id)) throw new ApiError('Finish your current job before going offline.');
        u.executive!.online = online;
        persist();
        if (online) assignWaiting();
        return { success: true, message: online ? 'You are online and can receive jobs' : 'You are offline' };
      });
    },
    advance(id: string, paymentMode?: Booking['paymentMode']) {
      return call(() => {
        const u = requireRole('EXECUTIVE');
        const b = D().bookings.find((x) => x.id === id && x.executiveId === u.id);
        if (!b) throw new ApiError('Job not found', 404);
        const next = NEXT[b.status];
        if (!next) throw new ApiError('This job cannot move forward.');
        if (next === 'COMPLETED') {
          if (!paymentMode) throw new ApiError('Select how the customer paid.');
          b.paymentMode = paymentMode;
          b.etaMinutes = 0;
        }
        if (next === 'ARRIVED') { b.etaMinutes = 0; b.distanceKm = 0; u.executive!.latitude = b.latitude; u.executive!.longitude = b.longitude; }
        if (next === 'ON_ROUTE' && b.distanceKm) b.etaMinutes = Math.max(5, Math.round((b.distanceKm / 25) * 60) + 2);
        b.status = next;
        b.updatedAt = now();
        b.history.push({ status: next, at: now(), by: u.name });
        persist();
        if (next === 'COMPLETED') assignWaiting();
        return { success: true, booking: b, message: STATUS_TEXT[next] };
      });
    },
  },

  /** Manager + Admin */
  ops: {
    overview() {
      return call(() => {
        requireRole('MANAGER', 'ADMIN');
        const today = new Date().toDateString();
        const bookings = [...D().bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const done = bookings.filter((b) => b.status === 'COMPLETED');
        const doneToday = done.filter((b) => new Date(b.updatedAt).toDateString() === today);
        return {
          success: true,
          bookings,
          executives: D().users.filter((u) => u.role === 'EXECUTIVE').map(execView),
          stats: {
            active: bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length,
            pending: bookings.filter((b) => b.status === 'PENDING').length,
            completedToday: doneToday.length,
            revenueToday: doneToday.reduce((s, b) => s + b.total, 0),
            revenueTotal: done.reduce((s, b) => s + b.total, 0),
            customers: D().users.filter((u) => u.role === 'CUSTOMER').length,
          },
        };
      }, 0);
    },
    assign(bookingId: string, executiveId: string) {
      return call(() => {
        const me = requireRole('MANAGER', 'ADMIN');
        const b = D().bookings.find((x) => x.id === bookingId);
        const ex = D().users.find((x) => x.id === executiveId && x.role === 'EXECUTIVE');
        if (!b || !ex) throw new ApiError('Booking or executive not found', 404);
        if (!['PENDING', 'ASSIGNED'].includes(b.status)) throw new ApiError('Only waiting or newly assigned jobs can be re-assigned.');
        if (!ex.active) throw new ApiError(`${ex.name}'s account is disabled.`);
        if (busy(ex.id) && b.executiveId !== ex.id) throw new ApiError(`${ex.name} is already on another job.`);
        attachExecutive(b, ex, me.name);
        persist();
        return { success: true, booking: b, message: `Assigned to ${ex.name}` };
      });
    },
    cancel(bookingId: string, reason: string) { return api.bookings.cancel(bookingId, reason || 'Cancelled by operations'); },
  },

  /** Admin only — user management */
  admin: {
    users() {
      return call(() => { requireRole('ADMIN'); return { success: true, users: D().users.map(managed).sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name)) }; }, 0);
    },
    createUser(body: { name: string; email: string; password: string; phone?: string; role: Role; vehicleNumber?: string; zone?: string }) {
      return call(() => {
        requireRole('ADMIN');
        const email = body.email.trim().toLowerCase();
        if (body.name.trim().length < 2) throw new ApiError('Name must be at least 2 characters.');
        if (!emailOk(email)) throw new ApiError('Please enter a valid email address.');
        if (body.password.length < 6) throw new ApiError('Password must be at least 6 characters.');
        if (D().users.some((u) => u.email === email)) throw new ApiError('An account with this email already exists.', 409);
        const salt = Math.random().toString(36).slice(2);
        const u: UserRow = {
          id: uid('u'), role: body.role, name: body.name.trim(), email, phone: body.phone?.trim() ?? '', city: 'Bengaluru, Karnataka', active: true, createdAt: now(),
          lastLoginAt: null, salt, passwordHash: hash(salt, body.password),
          ...(body.role === 'EXECUTIVE' ? { executive: { vehicleNumber: body.vehicleNumber?.trim() || 'KA05 XX 0000', zone: body.zone || 'Central Bengaluru', rating: 5, ratingCount: 0, online: true, latitude: 12.9716, longitude: 77.5946 } } : {}),
        };
        D().users.push(u);
        persist();
        if (u.role === 'EXECUTIVE') assignWaiting();
        return { success: true, user: managed(u), message: `${u.name} added as ${ROLE_LABEL[u.role]}` };
      });
    },
    updateUser(id: string, body: { name?: string; phone?: string; role?: Role; active?: boolean }) {
      return call(() => {
        const me = requireRole('ADMIN');
        const u = D().users.find((x) => x.id === id);
        if (!u) throw new ApiError('User not found', 404);
        if (u.id === me.id && (body.active === false || (body.role && body.role !== 'ADMIN'))) throw new ApiError('You cannot disable or demote your own admin account.');
        if (body.name !== undefined) u.name = body.name.trim() || u.name;
        if (body.phone !== undefined) u.phone = body.phone.trim();
        if (body.active !== undefined) u.active = body.active;
        if (body.role && body.role !== u.role) {
          u.role = body.role;
          if (u.role === 'EXECUTIVE' && !u.executive) u.executive = { vehicleNumber: 'KA05 XX 0000', zone: 'Central Bengaluru', rating: 5, ratingCount: 0, online: true, latitude: 12.9716, longitude: 77.5946 };
        }
        persist();
        return { success: true, user: managed(u), message: 'User updated' };
      });
    },
    resetPassword(id: string, password: string) {
      return call(() => {
        requireRole('ADMIN');
        const u = D().users.find((x) => x.id === id);
        if (!u) throw new ApiError('User not found', 404);
        if (password.length < 6) throw new ApiError('Password must be at least 6 characters.');
        u.salt = Math.random().toString(36).slice(2);
        u.passwordHash = hash(u.salt, password);
        persist();
        return { success: true, message: `Password updated for ${u.name}` };
      });
    },
    deleteUser(id: string) {
      return call(() => {
        const me = requireRole('ADMIN');
        if (id === me.id) throw new ApiError('You cannot delete your own account.');
        const i = D().users.findIndex((x) => x.id === id);
        if (i < 0) throw new ApiError('User not found', 404);
        if (busy(id)) throw new ApiError('This executive is on an active job. Re-assign it first.');
        const [u] = D().users.splice(i, 1);
        D().vehicles = D().vehicles.filter((v) => v.userId !== id);
        persist();
        return { success: true, message: `${u!.name} removed` };
      });
    },
    resetDemoData() {
      return call(() => { requireRole('ADMIN'); const keep = sessionUser().id; db = seed(); persist(); if (!db.users.some((u) => u.id === keep)) localStorage.removeItem(SESSION_KEY); return { success: true, message: 'Demo data restored' }; });
    },
  },
};

function execView(u: UserRow): Executive {
  const today = new Date().toDateString();
  const mine = D().bookings.filter((b) => b.executiveId === u.id);
  const done = mine.filter((b) => b.status === 'COMPLETED');
  const doneToday = done.filter((b) => new Date(b.updatedAt).toDateString() === today);
  return {
    ...(managed(u) as Executive),
    activeJob: mine.find((b) => ACTIVE_STATUSES.includes(b.status) && b.status !== 'PENDING') ?? null,
    completedToday: doneToday.length,
    completedTotal: done.length,
    earningsToday: doneToday.reduce((s, b) => s + Math.round(b.amount * 0.3), 0),
  };
}

/** Give waiting requests to anyone who just became free */
function assignWaiting() {
  let changed = false;
  for (const b of [...D().bookings].reverse()) {
    if (b.status === 'PENDING') { autoAssign(b); changed ||= (b.status as BookingStatus) === 'ASSIGNED'; }
  }
  if (changed) persist();
}

export const ROLE_LABEL: Record<Role, string> = { ADMIN: 'Administrator', MANAGER: 'Operations Manager', EXECUTIVE: 'Field Executive', CUSTOMER: 'Customer' };
export const STATUS_TEXT: Record<BookingStatus, string> = {
  PENDING: 'Waiting for an executive', ASSIGNED: 'Executive assigned', ON_ROUTE: 'Executive on the way', ARRIVED: 'Executive has arrived',
  IN_PROGRESS: 'Service in progress', COMPLETED: 'Service completed', CANCELLED: 'Cancelled',
};
export const homeFor = (role: Role) => (role === 'CUSTOMER' ? '/customer/dashboard' : role === 'EXECUTIVE' ? '/executive/dashboard' : role === 'MANAGER' ? '/manager/dashboard' : '/admin/dashboard');
export const STATUS_SHORT: Record<BookingStatus, string> = {
  PENDING: 'Finding executive', ASSIGNED: 'Assigned', ON_ROUTE: 'On the way', ARRIVED: 'Arrived', IN_PROGRESS: 'In progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};
