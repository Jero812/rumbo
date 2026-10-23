import { useEffect, type RefObject } from 'react';

type PermissionCapable = { requestPermission?: () => Promise<'granted' | 'denied'> };

/**
 * iOS solo entrega la orientación del teléfono tras pedir permiso, y ese
 * pedido tiene que salir de un toque del usuario. Llamar desde un onClick.
 */
export function requestMotionPermission(): Promise<boolean> {
  const ctor = (window.DeviceOrientationEvent as unknown as PermissionCapable | undefined) ?? undefined;
  if (!ctor || typeof ctor.requestPermission !== 'function') return Promise.resolve(true);
  return ctor
    .requestPermission()
    .then((r) => r === 'granted')
    .catch(() => false);
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Desplaza la capa AR en sentido contrario al giro del teléfono, para que
 * las flechas parezcan quedarse quietas en el entorno. Escribe el transform
 * directo en el elemento para no re-renderizar React en cada frame.
 */
export function useParallax(ref: RefObject<HTMLElement | null>, strength = { x: 70, y: 50 }) {
  useEffect(() => {
    let baseBeta: number | null = null;
    let baseGamma: number | null = null;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      if (baseBeta === null || baseGamma === null) {
        baseBeta = e.beta;
        baseGamma = e.gamma;
      }
      target.x = clamp((e.gamma - baseGamma) / 25, -1, 1);
      target.y = clamp((e.beta - baseBeta) / 25, -1, 1);
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      const el = ref.current;
      if (el) {
        el.style.transform = `translate3d(${(-current.x * strength.x).toFixed(1)}px, ${(current.y * strength.y).toFixed(1)}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('deviceorientation', onOrientation);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('deviceorientation', onOrientation);
      cancelAnimationFrame(frame);
    };
  }, [ref, strength.x, strength.y]);
}
