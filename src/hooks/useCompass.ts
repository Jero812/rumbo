import { useEffect, useState } from 'react';
import { normalizeAngle } from '../lib/geo';

type IOSOrientationEvent = DeviceOrientationEvent & { webkitCompassHeading?: number };

const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Rumbo hacia donde mira la cámara trasera, a partir de la orientación
 * absoluta (alpha, beta, gamma) del estándar W3C. Funciona con el teléfono
 * vertical, que es como se sostiene para ver la cámara.
 */
function cameraHeading(alpha: number, beta: number, gamma: number): number {
  const [cA, sA] = [Math.cos(rad(alpha)), Math.sin(rad(alpha))];
  const sB = Math.sin(rad(beta));
  const [cG, sG] = [Math.cos(rad(gamma)), Math.sin(rad(gamma))];
  // Eje -Z del teléfono (sale por la cámara trasera) en coordenadas Este/Norte.
  const east = -cA * sG - sA * sB * cG;
  const north = -sA * sG + cA * sB * cG;
  return ((Math.atan2(east, north) * 180) / Math.PI + 360) % 360;
}

/**
 * Brújula del teléfono: devuelve hacia dónde apunta la cámara, en grados
 * desde el norte, o null si el dispositivo no da una orientación absoluta.
 * En iPhone usa webkitCompassHeading (requiere el permiso de movimiento que
 * se pide al tocar "Iniciar recorrido"); en Android, deviceorientationabsolute.
 */
export function useCompass() {
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    let smoothed: number | null = null;
    let lastSent: number | null = null;
    let frame = 0;
    let pending: number | null = null;

    const push = (raw: number) => {
      // Promedio circular suave para que la flecha no tiemble.
      smoothed = smoothed === null ? raw : (smoothed + normalizeAngle(raw - smoothed) * 0.25 + 360) % 360;
      pending = smoothed;
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (pending !== null && (lastSent === null || Math.abs(normalizeAngle(pending - lastSent)) > 0.8)) {
            lastSent = pending;
            setHeading(pending);
          }
        });
      }
    };

    const onIOS = (e: Event) => {
      const ev = e as IOSOrientationEvent;
      if (typeof ev.webkitCompassHeading === 'number' && ev.webkitCompassHeading >= 0) {
        push(ev.webkitCompassHeading);
      }
    };

    const onAbsolute = (e: Event) => {
      const ev = e as DeviceOrientationEvent;
      if (ev.alpha == null || ev.beta == null || ev.gamma == null) return;
      push(cameraHeading(ev.alpha, ev.beta, ev.gamma));
    };

    const hasAbsolute = 'ondeviceorientationabsolute' in window;
    if (hasAbsolute) window.addEventListener('deviceorientationabsolute', onAbsolute);
    else window.addEventListener('deviceorientation', onIOS);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('deviceorientationabsolute', onAbsolute);
      window.removeEventListener('deviceorientation', onIOS);
    };
  }, []);

  return heading;
}
