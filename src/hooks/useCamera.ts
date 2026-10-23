import { useEffect, useRef, useState } from 'react';

export type CameraStatus = 'off' | 'starting' | 'live' | 'denied' | 'unavailable';

/**
 * Abre la cámara trasera y la conecta a un <video>. En iPhone solo funciona
 * bajo HTTPS (o localhost) y el <video> necesita playsInline + muted.
 */
export function useCamera(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CameraStatus>('off');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setStatus('off');
      return;
    }
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable');
      return;
    }

    let stream: MediaStream | null = null;
    let cancelled = false;
    setStatus('starting');

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      .then(async (s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        const video = videoRef.current;
        if (video) {
          video.srcObject = s;
          try {
            await video.play();
          } catch {
            // iOS puede rechazar play() si el video no está listo; autoPlay lo reintenta.
          }
        }
        setStatus('live');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const name = err instanceof DOMException ? err.name : '';
        setStatus(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable');
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [enabled, attempt]);

  return { videoRef, status, retry: () => setAttempt((a) => a + 1) };
}
