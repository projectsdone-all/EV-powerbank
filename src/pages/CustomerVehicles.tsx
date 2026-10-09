import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Car,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  X,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../hooks/useAppContext';
import { api, Vehicle, VerifiedVehicleData } from '../services/api';
import { Link } from 'react-router-dom';

// ── Helpers ────────────────────────────────────────────────────────────────────

function normalizeRc(raw: string): string {
  return raw.replace(/[\s\-]/g, '').toUpperCase();
}

/**
 * Client-side RC format guard — same regex as the server.
 * Keeps the Verify button disabled for obviously invalid input.
 */
function isValidIndianRc(normalized: string): boolean {
  const standard = /^[A-Z]{2}\d{2}[A-Z]{0,3}\d{1,4}$/;
  const bhSeries = /^\d{2}BH\d{4}[A-Z]{1,2}$/;
  return standard.test(normalized) || bhSeries.test(normalized);
}

function formatRcDisplay(raw: string): string {
  // Show formatted as user types (e.g. "KA 01 AB 1234"), but keep internal as normalized
  const n = normalizeRc(raw);
  // Try to match and insert spaces for readability
  const m = n.match(/^([A-Z]{2})(\d{2})([A-Z]{0,3})(\d{1,4})$/);
  if (m) return [m[1], m[2], m[3], m[4]].filter(Boolean).join(' ');
  return n;
}

// ── Detail row used in the result card ────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  const display = value ?? 'Not available';
  const isMissing = !value;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 shrink-0 w-36">{label}</span>
      <span
        className={`text-xs font-medium text-right ${
          isMissing ? 'text-gray-400 italic' : 'text-gray-800'
        }`}
      >
        {display}
      </span>
    </div>
  );
}

// ── Modal step types ───────────────────────────────────────────────────────────

type ModalStep = 'input' | 'loading' | 'result' | 'error';

// ── Main component ─────────────────────────────────────────────────────────────

export default function CustomerVehicles() {
  const { addToast } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [listError, setListError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>('input');

  // Step 1 — RC input
  const [rcInput, setRcInput] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const rcInputRef = useRef<HTMLInputElement>(null);

  // Step 2 — Verification result
  const [verifiedData, setVerifiedData] = useState<VerifiedVehicleData | null>(null);
  const [verifyError, setVerifyError] = useState('');

  // Step 3 — Saving
  const [isSaving, setIsSaving] = useState(false);

  // ── Derived state ──────────────────────────────────────────────────────────
  const normalizedRc = normalizeRc(rcInput);
  const rcValid = isValidIndianRc(normalizedRc);
  const canVerify = rcValid && consentChecked;

  // ── Vehicle list ───────────────────────────────────────────────────────────

  const fetchVehicles = useCallback(async () => {
    try {
      setLoadingVehicles(true);
      setListError('');
      const res = await api.vehicles.list();
      if (res.success) setVehicles(res.vehicles);
    } catch (err: any) {
      setListError(err.message || 'Failed to load vehicles');
    } finally {
      setLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this vehicle from your account?')) return;
    try {
      await api.vehicles.delete(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      addToast('Vehicle removed successfully', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to remove vehicle', 'error');
    }
  };

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openModal = () => {
    setRcInput('');
    setConsentChecked(false);
    setVerifiedData(null);
    setVerifyError('');
    setStep('input');
    setModalOpen(true);
    // Focus the RC input after mount
    setTimeout(() => rcInputRef.current?.focus(), 80);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
    setStep('input');
  };

  // ── Step 1 → Verify ────────────────────────────────────────────────────────

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canVerify) return;

    setStep('loading');
    setVerifyError('');

    try {
      const res = await api.vehicles.verify({ rcNumber: normalizedRc, consentGiven: true });
      setVerifiedData(res.data);
      setStep('result');
    } catch (err: any) {
      setVerifyError(err.message || 'Verification failed. Please try again.');
      setStep('error');
    }
  };

  // ── Step 2 → Save vehicle ──────────────────────────────────────────────────

  const handleSave = async () => {
    if (!verifiedData || isSaving) return;

    // Duplicate guard (client-side early check)
    const alreadyAdded = vehicles.some(
      (v) => normalizeRc(v.rcNumber) === normalizeRc(verifiedData.rcNumber)
    );
    if (alreadyAdded) {
      addToast(`${verifiedData.rcNumber} is already in your account.`, 'error');
      return;
    }

    try {
      setIsSaving(true);
      const res = await api.vehicles.create({
        rcNumber: verifiedData.rcNumber,
        maker: verifiedData.maker,
        model: verifiedData.model,
        fuelType: verifiedData.fuelType,
        vehicleClass: verifiedData.vehicleClass,
        batteryKwh: verifiedData.batteryKwh ?? 40.5,
        color: verifiedData.color,
      });
      setVehicles((prev) => [res.vehicle, ...prev]);
      addToast(`${verifiedData.maker} ${verifiedData.model} added to your account!`, 'success');
      setModalOpen(false);
    } catch (err: any) {
      addToast(err.message || 'Could not save vehicle. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyAnother = () => {
    setRcInput('');
    setConsentChecked(false);
    setVerifiedData(null);
    setVerifyError('');
    setStep('input');
    setTimeout(() => rcInputRef.current?.focus(), 80);
  };

  // ── Keyboard: close on Escape ──────────────────────────────────────────────

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, isSaving]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50/50 p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-gray-200 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/customer/dashboard"
                className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
            <p className="text-xs text-gray-500">
              Manage your registered electric vehicles
            </p>
          </div>
          <button
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            onClick={openModal}
            id="add-vehicle-btn"
          >
            <Plus size={16} /> Add Vehicle
          </button>
        </div>

        {/* List error */}
        {listError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{listError}</span>
            </div>
            <button onClick={fetchVehicles} className="underline font-bold">
              Retry
            </button>
          </div>
        )}

        {/* Vehicle list */}
        {loadingVehicles ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 size={24} className="animate-spin text-emerald-600" />
            <p className="text-xs">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 border-dashed rounded-2xl">
            <Car size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Vehicles Added</h3>
            <p className="text-xs text-gray-500 mb-6">
              Add your EV to request assistance quickly.
            </p>
            <button
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer"
              onClick={openModal}
            >
              <Plus size={16} /> Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs hover:border-gray-300 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <Car size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">
                        {vehicle.maker} {vehicle.model}
                      </h3>
                      <p className="text-xs text-gray-400 capitalize">
                        {vehicle.color} • {vehicle.batteryKwh} kWh Pack
                      </p>
                    </div>
                  </div>
                  <button
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer opacity-90"
                    title="Remove vehicle"
                    aria-label={`Remove ${vehicle.maker} ${vehicle.model}`}
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="bg-gray-50/70 rounded-xl p-3 border border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-500">License Plate</span>
                  <span className="font-mono font-bold bg-white px-2 py-1 rounded border border-gray-200 text-gray-800">
                    {vehicle.rcNumber}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                  {vehicle.verified ? (
                    <>
                      <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                      <span className="text-xs text-emerald-600 font-medium">Verified</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={13} className="text-amber-500 shrink-0" />
                      <span className="text-xs text-amber-600 font-medium">Unverified</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add Vehicle Modal ────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add Vehicle"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Car size={16} className="text-emerald-600" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Add New Vehicle</h2>
              </div>
              <button
                onClick={closeModal}
                disabled={isSaving}
                aria-label="Close modal"
                className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-40"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Step: Input ─────────────────────────────────────────────── */}
            {step === 'input' && (
              <form onSubmit={handleVerify} className="px-6 py-5 space-y-5">
                {/* RC Number field */}
                <div>
                  <label
                    htmlFor="rc-number-input"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Vehicle Registration Number
                  </label>
                  <div className="relative">
                    <input
                      id="rc-number-input"
                      ref={rcInputRef}
                      type="text"
                      autoComplete="off"
                      spellCheck={false}
                      value={rcInput}
                      onChange={(e) => setRcInput(e.target.value)}
                      placeholder="e.g. KA01AB1234"
                      maxLength={16}
                      className={`w-full px-4 py-3 border rounded-xl text-sm font-mono uppercase tracking-widest focus:outline-none transition-colors ${
                        rcInput && !rcValid
                          ? 'border-red-300 bg-red-50 focus:border-red-400'
                          : rcValid
                          ? 'border-emerald-400 bg-emerald-50/30 focus:border-emerald-500'
                          : 'border-gray-200 focus:border-emerald-400'
                      }`}
                    />
                    {rcValid && (
                      <CheckCircle2
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none"
                      />
                    )}
                  </div>
                  {rcInput && !rcValid && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Not a valid Indian registration format (e.g. KA01AB1234)
                    </p>
                  )}
                  {rcValid && (
                    <p className="mt-1.5 text-xs text-gray-400">
                      Will look up: <span className="font-mono font-bold text-gray-600">{formatRcDisplay(normalizedRc)}</span>
                    </p>
                  )}
                </div>

                {/* Consent checkbox */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                  <label
                    htmlFor="consent-checkbox"
                    className="flex items-start gap-3 cursor-pointer"
                  >
                    <input
                      id="consent-checkbox"
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                    />
                    <span className="text-xs text-blue-800 leading-relaxed">
                      I authorise EV Assist to look up registration details for this vehicle number
                      solely to verify ownership and pre-fill vehicle information for my account.
                      I understand this does not access official government records directly.
                    </span>
                  </label>
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2 text-xs text-gray-400">
                  <Info size={13} className="shrink-0 mt-0.5" />
                  <span>
                    Details are fetched from an authorised vehicle data provider.
                    You can review and confirm before saving.
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canVerify}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    id="verify-vehicle-btn"
                  >
                    <ShieldCheck size={14} />
                    Verify Vehicle
                    <ChevronRight size={13} />
                  </button>
                </div>
              </form>
            )}

            {/* ── Step: Loading ───────────────────────────────────────────── */}
            {step === 'loading' && (
              <div className="px-6 py-14 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Car size={24} className="text-emerald-600" />
                  </div>
                  <Loader2
                    size={48}
                    className="animate-spin text-emerald-500 absolute -inset-2.5"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800">Checking Registration</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Looking up{' '}
                    <span className="font-mono font-bold">{formatRcDisplay(normalizedRc)}</span>
                    …
                  </p>
                </div>
              </div>
            )}

            {/* ── Step: Error ─────────────────────────────────────────────── */}
            {step === 'error' && (
              <div className="px-6 py-5 space-y-5">
                <div className="flex flex-col items-center text-center gap-3 py-4">
                  <div className="w-13 h-13 rounded-full bg-red-50 flex items-center justify-center p-3">
                    <ShieldAlert size={26} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Verification Failed</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{verifyError}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyAnother}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={13} /> Try Again
                  </button>
                </div>
              </div>
            )}

            {/* ── Step: Result ────────────────────────────────────────────── */}
            {step === 'result' && verifiedData && (
              <div className="px-6 py-5 space-y-4">
                {/* Sandbox warning banner */}
                {verifiedData.sandboxWarning && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3">
                    <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      {verifiedData.sandboxWarning}
                    </p>
                  </div>
                )}

                {/* Verification status header */}
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-800">
                      {verifiedData.isLiveData ? 'Verified — Live Data' : 'Verification Complete'}
                    </p>
                    <p className="text-xs text-emerald-600 font-mono font-bold mt-0.5 truncate">
                      {formatRcDisplay(verifiedData.rcNumber)}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      verifiedData.isLiveData
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {verifiedData.isLiveData ? 'LIVE' : 'SANDBOX'}
                  </span>
                </div>

                {/* Detail rows */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-1">
                  {verifiedData.ownerNameMasked && (
                    <DetailRow label="Owner Name" value={verifiedData.ownerNameMasked} />
                  )}
                  <DetailRow label="Make" value={verifiedData.maker} />
                  <DetailRow label="Model" value={verifiedData.model} />
                  <DetailRow label="Fuel Type" value={verifiedData.fuelType} />
                  <DetailRow label="Vehicle Class" value={verifiedData.vehicleClass} />
                  <DetailRow label="Color" value={verifiedData.color} />
                  <DetailRow label="Registration Date" value={verifiedData.registrationDate} />
                  <DetailRow label="RTO" value={verifiedData.rto} />
                  <DetailRow label="Insurance Valid Upto" value={verifiedData.insuranceValidUpto} />
                  <DetailRow label="Fitness Valid Upto" value={verifiedData.fitnessValidUpto} />
                </div>

                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  Review the details above. Tap <strong>Save Vehicle</strong> to add this to your
                  account, or <strong>Verify Another</strong> to look up a different number.
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleVerifyAnother}
                    disabled={isSaving}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <RotateCcw size={13} /> Verify Another
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60 transition-all"
                    id="save-vehicle-btn"
                  >
                    {isSaving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    {isSaving ? 'Saving…' : 'Save Vehicle'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
