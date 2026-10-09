// Configurable Map & Geocoding Service Provider

export interface MapTileConfig {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
}

export const defaultMapConfig: MapTileConfig = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
};

// Known local landmarks in Bengaluru for instant, offline-resilient address resolution
export const BANGALORE_LANDMARKS = [
  { name: '1st Main Road, Anand Nagar Colony, Hebbal, Bengaluru North City Corporation, Bengaluru', lat: 13.0358, lng: 77.5970 },
  { name: 'Bellary Road, Hebbal Flyover Junction, Bengaluru', lat: 13.0382, lng: 77.5925 },
  { name: 'Sanjay Nagar Main Road, RMV 2nd Stage, Bengaluru', lat: 13.0285, lng: 77.5810 },
  { name: 'RT Nagar 80 Feet Road, Dinnur Main Rd, Bengaluru', lat: 13.0210, lng: 77.5960 },
  { name: 'Outer Ring Road, Manyata Tech Park Junction, Nagavara, Bengaluru', lat: 13.0475, lng: 77.6205 },
  { name: 'Nagavara Junction, Thanisandra Main Road, Bengaluru', lat: 13.0420, lng: 77.6240 },
  { name: 'Ganga Nagar Market Road, RT Nagar, Bengaluru', lat: 13.0180, lng: 77.5910 },
  { name: 'Sadashivanagar, Bellary Road, Bengaluru', lat: 13.0070, lng: 77.5820 },
  { name: 'Malleswaram 18th Cross, Margosa Road, Bengaluru', lat: 13.0085, lng: 77.5695 },
  { name: 'Indiranagar 100ft Road, HAL 2nd Stage, Bengaluru', lat: 12.9719, lng: 77.6412 },
  { name: 'Koramangala 80ft Road, 4th Block, Bengaluru', lat: 12.9352, lng: 77.6245 },
  { name: 'Electronic City Phase 1, Hosur Road, Bengaluru', lat: 12.8399, lng: 77.6770 },
];

export function getNearestLandmarkAddress(lat: number, lng: number): string {
  let closest = BANGALORE_LANDMARKS[0];
  let minDiff = Infinity;
  for (const landmark of BANGALORE_LANDMARKS) {
    const diff = Math.hypot(landmark.lat - lat, landmark.lng - lng);
    if (diff < minDiff) {
      minDiff = diff;
      closest = landmark;
    }
  }
  return closest.name;
}

export interface GeocodingService {
  reverseGeocode(lat: number, lng: number): Promise<string>;
}

export class DefaultGeocodingService implements GeocodingService {
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'EV-Assist-Client/1.0',
          },
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          // Format into clean readable short address
          const parts = data.display_name.split(',');
          if (parts.length > 4) {
            return parts.slice(0, 4).join(',').trim();
          }
          return data.display_name;
        }
      }
    } catch {
      // Fallback silently to offline landmark lookup
    }

    return getNearestLandmarkAddress(lat, lng);
  }
}

export const geocodingService = new DefaultGeocodingService();
