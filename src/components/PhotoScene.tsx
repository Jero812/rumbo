import { useEffect, useRef, useState } from 'react';
import { photoUrl, type RoutePhoto } from '../data/route';

interface Box {
  w: number;
  h: number;
}

/** Posición en pantalla de un punto de la foto, con la foto en modo "cover". */
function project(container: Box, natural: Box, t: { x: number; y: number }) {
  const scale = Math.max(container.w / natural.w, container.h / natural.h);
  const dw = natural.w * scale;
  const dh = natural.h * scale;
  return { x: (container.w - dw) / 2 + t.x * dw, y: (container.h - dh) / 2 + t.y * dh };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Foto real del tramo con un camino de luz que va desde los pies del usuario
 * hasta el punto donde termina el tramo. Es la vista "simulada" y también el
 * visor de referencia.
 */
export function PhotoScene({ photo, showPath = true }: { photo: RoutePhoto; showPath?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box>({ w: 0, h: 0 });
  const [natural, setNatural] = useState<Box | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setBox({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ready = natural && box.w > 0;
  const target = ready ? project(box, natural, photo.target) : null;
  const start = { x: box.w / 2, y: box.h + 10 };

  let band = '';
  const chevrons: { x: number; y: number; s: number; a: number }[] = [];
  if (target) {
    const wBottom = Math.min(160, box.w * 0.42);
    const wTop = 14;
    band = [
      `${start.x - wBottom / 2},${start.y}`,
      `${target.x - wTop / 2},${target.y}`,
      `${target.x + wTop / 2},${target.y}`,
      `${start.x + wBottom / 2},${start.y}`,
    ].join(' ');
    const angle = (Math.atan2(target.x - start.x, start.y - target.y) * 180) / Math.PI;
    // Más juntos y pequeños a medida que se alejan, como en perspectiva.
    [0.12, 0.34, 0.52, 0.67, 0.79, 0.88].forEach((t) => {
      chevrons.push({
        x: lerp(start.x, target.x, t),
        y: lerp(start.y, target.y, t),
        s: lerp(1, 0.22, t),
        a: angle,
      });
    });
  }

  return (
    <div className="photo-scene" ref={ref}>
      <img
        src={photoUrl(photo.src)}
        alt=""
        draggable={false}
        onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
      />
      {target && (
        <>
          <svg className="photo-ar" width={box.w} height={box.h} aria-hidden="true">
            <defs>
              <linearGradient id="band-grad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#6d3be8" stopOpacity="0.6" />
                <stop offset="1" stopColor="#b79cff" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            {showPath && (
              <>
                <polygon points={band} className="photo-band" />
                {chevrons.map((c, i) => (
                  <path
                    key={i}
                    className="photo-chev"
                    style={{ ['--i' as string]: i }}
                    d="M-16 8L0 -8l16 16"
                    transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${c.a.toFixed(1)}) scale(${c.s.toFixed(2)})`}
                  />
                ))}
              </>
            )}
            <ellipse cx={target.x} cy={target.y} rx={26} ry={9} className="photo-ring" />
            <ellipse cx={target.x} cy={target.y} rx={26} ry={9} className="photo-ring is-delayed" />
            <circle cx={target.x} cy={target.y} r={5} className="photo-dot" />
          </svg>
          <div className="photo-tag" style={{ left: target.x, top: target.y }}>
            {photo.label}
          </div>
        </>
      )}
    </div>
  );
}
