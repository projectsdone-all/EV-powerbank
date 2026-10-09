import { api } from './api';

export interface VerificationResult {
  success: boolean;
  data?: any;
  error?: string;
}

function normalizeRegistration(input: string): string {
  return input.replace(/\s+/g, '').toUpperCase();
}

function isValidIndianRegistration(number: string): boolean {
  const pattern = /^[A-Z]{2}\d{2}[A-Z]{0,3}\d{1,4}$/;
  const bhSeries = /^\d{2}BH\d{4}[A-Z]{1,2}$/;
  return pattern.test(number) || bhSeries.test(number);
}

/**
 * Verify vehicle registration number using the real API.
 */
export async function verifyVehicleRegistration(registrationNumber: string): Promise<VerificationResult> {
  const normalized = normalizeRegistration(registrationNumber);

  if (!isValidIndianRegistration(normalized)) {
    return { success: false, error: 'Please enter a valid Indian registration number.' };
  }

  try {
    const res = await api.vehicles.verify({ rcNumber: normalized, consentGiven: true });
    
    // Map VerifiedVehicleData to what VehicleCheck.tsx expects (snake_case)
    const data = {
      rc_number: res.data.rcNumber,
      maker: res.data.maker,
      model: res.data.model,
      owner_name: res.data.ownerNameMasked || 'Hidden',
      vehicle_class: res.data.vehicleClass,
      fuel_type: res.data.fuelType,
      battery_kwh: res.data.batteryKwh || 0,
      registration_date: res.data.registrationDate,
      rto: res.data.rto,
    };

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Verification failed. Please try again later.' };
  }
}
