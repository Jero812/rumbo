import { MAP_PATH, mapIndexForStep } from '../data/route';

// Plano esquemático: el camino sale de los pasos de la ruta y los bloques de
// edificios se colocan a los lados de cada tramo. No es un mapa a escala.

type Pt = { x: number; y: number };

function sideBlocks(a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len < 8) return [];
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const nx = -dy / len;
  const ny = dx / len;
  const w = len * 0.72;
  return [1, -1].map((side) => ({
    cx: mid.x + nx * 8.5 * side,
    cy: mid.y + ny * 8.5 * side,
    w,
    angle,
  }));
}

const TREES = [
  { cx: 8, cy: 12 },
  { cx: 150, cy: 88 },
  { cx: 12, cy: 90 },
  { cx: 148, cy: 10 },
  { cx: 80, cy: 94 },
];

export function CampusMap({ activeStep }: { activeStep: number | null }) {
  const pts = MAP_PATH;
  const toLine = (list: Pt[]) => list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const idx = activeStep === null ? 0 : mapIndexForStep(activeStep);
  const here = pts[idx];
  const end = pts[pts.length - 1];
  const done = pts.slice(0, idx + 1);
  const ahead = pts.slice(idx);
  const blocks = pts.slice(1).flatMap((p, i) => sideBlocks(pts[i], p));

  return (
    <svg className="campus-map" viewBox="0 0 160 100" role="img" aria-label="Plano simplificado del campus con la ruta">
      <rect width="160" height="100" className="map-ground" />
      {TREES.map((t, i) => (
        <circle key={i} cx={t.cx} cy={t.cy} r={5} className="map-tree" />
      ))}
      {blocks.map((b, i) => (
        <rect
          key={i}
          x={b.cx - b.w / 2}
          y={b.cy - 3.6}
          width={b.w}
          height={7.2}
          rx={1.8}
          className="map-building"
          transform={`rotate(${b.angle.toFixed(1)} ${b.cx.toFixed(1)} ${b.cy.toFixed(1)})`}
        />
      ))}
      <polyline points={toLine(pts)} className="map-walk" />

      {activeStep !== null && (
        <>
          {done.length > 1 && <polyline points={toLine(done)} className="map-route-done" />}
          <polyline points={toLine(ahead)} className="map-route-ahead" />
        </>
      )}

      <g transform={`translate(${end.x} ${end.y})`} className="map-dest">
        <path d="M0 0c-3.2-3.6-5-6.1-5-8.6a5 5 0 0 1 10 0c0 2.5-1.8 5-5 8.6z" />
        <circle cy={-8.6} r={1.9} className="map-dest-core" />
      </g>

      <g transform={`translate(${here.x} ${here.y})`} className="map-here">
        <circle r={7} className="map-here-pulse" />
        <circle r={3.4} className="map-here-dot" />
      </g>
    </svg>
  );
}
