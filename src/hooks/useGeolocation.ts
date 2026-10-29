import { useEffect, useState } from 'react';

export type GeoStatus = 'starting' | 'active' | 'denied' | 'unavailable';

export interface GeoFix {
  lat: number;
  lng: number;
  /** Radio de error en metros que reporta el teléfono. */
  accuracy: number;
  timestamp: number;
}

/**
 * Sigue la ubicación real del teléfono. En iPhone solo funciona bajo HTTPS y
 * el navegador muestra su propio aviso de permiso la primera vez.
 */
export function useGeolocation(enabled = true) {
  const [status, setStatus] = useState<GeoStatus>('starting');
  const [fix, setFix] = useState<GeoFix | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!('geolocation' in navigator) || !window.isSecureContext) {
      setStatus('unavailable');
      return;
    }
    setStatus('starting');
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setFix({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setStatus('active');
      },
      (err) => {
        // TIMEOUT y POSITION_UNAVAILABLE son pasajeros: watchPosition sigue intentando.
        if (err.code === err.PERMISSION_DENIED) setStatus('denied');
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled]);

  return { status, fix };
}
