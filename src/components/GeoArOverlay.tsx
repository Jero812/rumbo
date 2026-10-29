import { Pin, TurnLeft, TurnRight } from './Icons';

/** Mitad del campo de visión horizontal de la cámara trasera en vertical (aprox.). */
const HALF_FOV = 28;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function Chevron({ i }: { i: number }) {
  return (
    <svg className="ar-chev" viewBox="0 0 40 24" style={{ ['--i' as string]: i }} aria-hidden="true">
      <path d="M4 20L20 5l16 15" />
    </svg>
  );
}

interface Props {
  /** Ángulo entre donde mira la cámara y el siguiente punto (-180…180, + = derecha). */
  relBearing: number;
  /** Metros hasta el siguiente punto. */
  distance: number;
  label: string;
  isArrive: boolean;
}

/**
 * Capa AR anclada al mundo real: el camino del piso gira hacia el rumbo GPS
 * del siguiente punto según la brújula, y el marcador aparece en la pantalla
 * justo donde está ese punto cuando la cámara lo enfoca.
 */
export function GeoArOverlay({ relBearing, distance, label, isArrive }: Props) {
  const inView = Math.abs(relBearing) <= HALF_FOV;
  const floorAngle = clamp(relBearing, -72, 72);
  const markerLeft = 50 + (relBearing / HALF_FOV) * 42;
  const markerScale = clamp(1.15 - distance / 80, 0.7, 1.1);
  const meters = `${Math.max(0, Math.round(distance))} m`;
  const aligned = Math.abs(relBearing) < 12;

  return (
    <div className="ar" aria-hidden="true">
      <div className="ar-floor">
        <div className="ar-plane is-geo" style={{ transform: `rotateX(74deg) rotateZ(${floorAngle.toFixed(1)}deg)` }}>
          <div className={`ar-strip ar-strip-main${aligned ? ' is-aligned' : ''}`}>
            {Array.from({ length: 7 }, (_, i) => (
              <Chevron key={i} i={i} />
            ))}
          </div>
        </div>
      </div>

      {inView ? (
        <div
          className="ar-marker is-geo"
          style={{ left: `${markerLeft.toFixed(1)}%`, transform: `translate(-50%, -100%) scale(${markerScale.toFixed(2)})` }}
        >
          {isArrive ? (
            <div className="ar-pin">
              <Pin width={34} height={34} />
            </div>
          ) : (
            <div className="ar-geo-dot" />
          )}
          <div className={`ar-tag${isArrive ? ' is-dest' : ''}`}>
            <strong>{meters}</strong>
            <span>{label}</span>
          </div>
          <div className="ar-stem" />
        </div>
      ) : (
        <div className={`ar-turn-hint to-${relBearing > 0 ? 'right' : 'left'}`}>
          {relBearing > 0 ? <TurnRight width={40} height={40} strokeWidth={2.6} /> : <TurnLeft width={40} height={40} strokeWidth={2.6} />}
          <strong>Gira a la {relBearing > 0 ? 'derecha' : 'izquierda'}</strong>
          <span>
            El punto está a {meters}, {Math.abs(Math.round(relBearing))}° de tu vista
          </span>
        </div>
      )}
    </div>
  );
}
