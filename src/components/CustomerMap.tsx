import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { defaultMapConfig, geocodingService } from '../services/mapProvider';

interface CustomerMapProps {
  coords: { lat: number; lng: number };
  onCoordsChange?: (coords: { lat: number; lng: number }, addressName?: string) => void;
  tileConfig?: typeof defaultMapConfig;
}

export default function CustomerMap({
  coords,
  onCoordsChange,
  tileConfig = defaultMapConfig,
}: CustomerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: true,
      });

      // Configurable tile layer
      L.tileLayer(tileConfig.url, {
        maxZoom: tileConfig.maxZoom,
        attribution: tileConfig.attribution,
      }).addTo(map);

      // Custom pulsing emerald marker matching screenshot
      const markerIcon = L.divIcon({
        className: 'custom-ev-pin',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(16, 185, 129, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; margin: auto; width: 14px; height: 14px; border-radius: 9999px; background: #059669; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([coords.lat, coords.lng], {
        icon: markerIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', async (e) => {
        const newLatLng = e.target.getLatLng();
        const address = await geocodingService.reverseGeocode(newLatLng.lat, newLatLng.lng);
        onCoordsChange?.({ lat: newLatLng.lat, lng: newLatLng.lng }, address);
      });

      map.on('click', async (e) => {
        marker.setLatLng(e.latlng);
        const address = await geocodingService.reverseGeocode(e.latlng.lat, e.latlng.lng);
        onCoordsChange?.({ lat: e.latlng.lat, lng: e.latlng.lng }, address);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size in next frame to prevent grey tile gaps
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position if coords change externally (e.g. Locate Me)
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
      mapInstanceRef.current.panTo([coords.lat, coords.lng], { animate: true });
    }
  }, [coords.lat, coords.lng]);

  const handleRecenter = async () => {
    if (mapInstanceRef.current) {
      const centerLat = 13.0358;
      const centerLng = 77.597;
      mapInstanceRef.current.setView([centerLat, centerLng], 14, { animate: true });
      markerRef.current?.setLatLng([centerLat, centerLng]);
      const address = await geocodingService.reverseGeocode(centerLat, centerLng);
      onCoordsChange?.({ lat: centerLat, lng: centerLng }, address);
    }
  };

  return (
    <div className="w-full h-full relative" aria-label="Interactive EV Assistance Map">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {/* Recenter button on map */}
      <button
        type="button"
        onClick={handleRecenter}
        title="Recenter on Bengaluru / Hebbal"
        className="absolute bottom-6 right-6 z-[400] bg-white px-3.5 py-2.5 rounded-xl shadow-md border border-gray-200 text-emerald-700 hover:bg-emerald-50 transition-all active:scale-95 flex items-center gap-2 text-xs font-semibold"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        Recenter Map
      </button>
    </div>
  );
}
