import { ROUTE } from '../data/route';

// Plano esquemático del campus: no es un mapa a escala, solo da contexto.
const BUILDINGS = [
  { x: 4, y: 58, w: 13, h: 30 },
  { x: 32, y: 60, w: 34, h: 22 },
  { x: 32, y: 27, w: 30, h: 17 },
  { x: 86, y: 60, w: 24, h: 26 },
  { x: 128, y: 36, w: 27, h: 28 },
  { x: 84, y: 20, w: 25, h: 22 },
  { x: 128, y: 74, w: 27, h: 18 },
];

const WALKWAYS = [
  'M0 52H160',
  'M24 100V8',
  'M118 100V0',
  'M76 52V100',
  'M24 14H118',
];

const LAWNS = [
  { cx: 50, cy: 92, rx: 16, ry: 6 },
  { cx: 142, cy: 14, rx: 14, ry: 9 },
  { cx: 74, cy: 8, rx: 12, ry: 5 },
];

interface Props {
  /** Paso actual; null muestra el campus sin ruta. */
  activeStep: number | null;
}

export function CampusMap({ activeStep }: Props) {
  const pts = ROUTE.path;
  const toLine = (list: typeof pts) => list.map((p) => `${p.x},${p.y}`).join(' ');
  const start = pts[0];
  const end = pts[pts.length - 1];
  const here = activeStep === null ? start : pts[activeStep];
  const done = activeStep === null ? [] : pts.slice(0, activeStep + 1);
  const ahead = activeStep === null ? [] : pts.slice(activeStep);

  return (
    <svg className="campus-map" viewBox="0 0 160 100" role="img" aria-label="Plano simplificado del campus con la ruta">
      <defs>
        <linearGradient id="route-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#38e8ff" />
          <stop offset="1" stopColor="#7b61ff" />
        </linearGradient>
        <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      {LAWNS.map((l, i) => (
        <ellipse key={i} {...l} className="map-lawn" />
      ))}
      {WALKWAYS.map((d) => (
        <path key={d} d={d} className="map-walk" />
      ))}
      {BUILDINGS.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={2.5} className="map-building" />
      ))}
      <rect x={104} y={1} width={28} height={9} rx={2.5} className="map-building is-dest" />

      {activeStep !== null && (
        <>
          <polyline points={toLine(ahead)} className="map-route-glow" filter="url(#route-glow)" />
          <polyline points={toLine(ahead)} className="map-route-ahead" />
          {done.length > 1 && <polyline points={toLine(done)} className="map-route-done" />}
        </>
      )}

      <g transform={`translate(${end.x} ${end.y})`} className="map-dest">
        <circle r={4.2} />
        <circle r={1.6} className="map-dest-core" />
      </g>

      {activeStep !== null && activeStep > 0 && (
        <circle cx={start.x} cy={start.y} r={2} className="map-origin" />
      )}

      <g transform={`translate(${here.x} ${here.y})`} className="map-here">
        <circle r={6} className="map-here-pulse" />
        <circle r={3.2} className="map-here-dot" />
      </g>
    </svg>
  );
}
