import { useEffect, useRef, useState } from 'react';
import { ArOverlay } from '../components/ArOverlay';
import { CampusMap } from '../components/CampusMap';
import { GeoArOverlay } from '../components/GeoArOverlay';
import { Camera, Check, ChevronLeft, ChevronRight, Close, DirectionIcon, ImageIcon, MapIcon } from '../components/Icons';
import { PhotoScene } from '../components/PhotoScene';
import { CHECKPOINTS, originForStep, photoUrl, ROUTE, targetForStep } from '../data/route';
import { useCamera } from '../hooks/useCamera';
import { useCompass } from '../hooks/useCompass';
import { useGeolocation } from '../hooks/useGeolocation';
import { bearingDegrees, distanceMeters, normalizeAngle } from '../lib/geo';

type ViewMode = 'camera' | 'sim';

// Tolerancias para detectar por GPS que se terminó un paso. La app no cambia
// de paso sola: muestra un aviso y la persona decide si pasa al siguiente.
/** Con un error mayor que este (m), la posición no cuenta. */
const MAX_ACCURACY = 25;
/** Lecturas seguidas dentro del radio antes de dar el punto por alcanzado. */
const HITS_TO_ARRIVE = 2;
/** Tiempo mínimo en un paso antes de sugerir el siguiente (ms). */
const MIN_STEP_TIME = 3000;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Radio para dar por alcanzado un punto: crece con el error del GPS, pero
 * nunca pasa del 60 % del tramo, para que en tramos cortos no salte de
 * indicación antes de tiempo.
 */
function arrivalRadius(accuracy: number, segment: number) {
  return Math.min(clamp(4 + accuracy * 0.5, 6, 12), Math.max(5, segment * 0.6));
}

const LAST_POINT = CHECKPOINTS[CHECKPOINTS.length - 1];

// Fases de un paso con giro: primero "Gira a la derecha"; en cuanto la persona
// ya giró y avanza hacia el siguiente punto, la tarjeta pasa a "Sigue derecho".
/** Tiempo mirando hacia el siguiente punto para dar el giro por hecho (ms). */
const ALIGNED_TIME = 1500;
/** Metros alejándose del punto de giro, acercándose al siguiente, para darlo por hecho. */
const GPS_PROGRESS = 5;

const TURN_DIRECTIONS = new Set(['left', 'right', 'slight-left', 'slight-right']);

interface Props {
  onArrive: () => void;
  onExit: () => void;
}

export function NavigateScreen({ onArrive, onExit }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<ViewMode>('camera');
  const [showMap, setShowMap] = useState(false);
  const [showCoach, setShowCoach] = useState(true);
  const [confirmExit, setConfirmExit] = useState(false);
  const [viewer, setViewer] = useState<'step' | 'checkpoint' | null>(null);
  /** Paso para el que se muestra "Parece que terminaste este paso". */
  const [suggestFor, setSuggestFor] = useState<number | null>(null);
  /** Paso en el que la persona ya hizo el giro (fase "Sigue derecho"). */
  const [turnedFor, setTurnedFor] = useState<number | null>(null);
  const camera = useCamera(mode === 'camera');
  const geo = useGeolocation();
  const heading = useCompass();
  const hitsRef = useRef(0);
  const stepStartRef = useRef(Date.now());
  /** "Aún no": no volver a sugerir hasta que la persona salga del radio del punto. */
  const dismissedRef = useRef(false);

  const steps = ROUTE.steps;
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const cameraLive = mode === 'camera' && camera.status === 'live';
  const cameraFailed = mode === 'camera' && (camera.status === 'denied' || camera.status === 'unavailable');

  // ---- Posición real respecto a la ruta ----
  const target = targetForStep(stepIndex);
  const aim = target ?? LAST_POINT; // en la llegada, se sigue señalando BU
  const fix = geo.fix;
  const fixUsable = fix !== null && fix.accuracy <= MAX_ACCURACY;
  const distToAim = fix ? distanceMeters(fix, aim) : null;
  let bearing: number | null = fix ? bearingDegrees(fix, aim) : null;
  // Muy cerca del punto el rumbo GPS se vuelve inestable: se apunta al siguiente tramo.
  const nextTarget = targetForStep(stepIndex + 1);
  if (distToAim !== null && distToAim < 4 && target && nextTarget) bearing = bearingDegrees(target, nextTarget);
  const relBearing = bearing !== null && heading !== null ? normalizeAngle(bearing - heading) : null;

  const remainingStatic = steps.slice(stepIndex).reduce((sum, s) => sum + s.distance, 0);
  const remainingGps =
    fix && target
      ? distanceMeters(fix, target) +
        CHECKPOINTS.slice(stepIndex + 1).reduce((sum, p, i) => sum + distanceMeters(CHECKPOINTS[stepIndex + i], p), 0)
      : null;
  const remaining = Math.round(remainingGps ?? remainingStatic);

  const goTo = (i: number) => {
    setViewer(null);
    setStepIndex(i);
    hitsRef.current = 0;
    stepStartRef.current = Date.now();
    dismissedRef.current = false;
    setSuggestFor(null);
  };
  const next = () => (isLast ? onArrive() : goTo(stepIndex + 1));
  const prev = () => goTo(Math.max(0, stepIndex - 1));
  const notYet = () => {
    dismissedRef.current = true;
    setSuggestFor(null);
  };

  // ---- Detección de llegada a cada punto: solo sugiere pasar al siguiente ----
  useEffect(() => {
    if (!fix || !target) return;
    if (fix.accuracy > MAX_ACCURACY) {
      hitsRef.current = 0;
      return;
    }
    const from = originForStep(stepIndex);
    const segment = from ? distanceMeters(from, target) : Infinity;
    const inside = distanceMeters(fix, target) <= arrivalRadius(fix.accuracy, segment);
    if (!inside) {
      hitsRef.current = 0;
      dismissedRef.current = false;
      return;
    }
    hitsRef.current += 1;
    if (
      hitsRef.current >= HITS_TO_ARRIVE &&
      Date.now() - stepStartRef.current > MIN_STEP_TIME &&
      !dismissedRef.current &&
      suggestFor !== stepIndex
    ) {
      setSuggestFor(stepIndex);
      setViewer(null);
      navigator.vibrate?.(120);
    }
  }, [fix, target, stepIndex, suggestFor]);

  const showSuggest = suggestFor === stepIndex;

  // ---- ¿Ya hizo el giro? Brújula (mira hacia el punto) o GPS (avanza hacia él) ----
  const needsTurn = TURN_DIRECTIONS.has(step.direction);
  const turned = needsTurn && turnedFor === stepIndex;
  const alignTolerance = step.direction.startsWith('slight') ? 28 : 35;
  const facingTarget = relBearing !== null && Math.abs(relBearing) < alignTolerance;
  const stepOrigin = originForStep(stepIndex);
  const gpsProgressed =
    fixUsable &&
    stepOrigin !== null &&
    target !== null &&
    distanceMeters(fix, stepOrigin) >= GPS_PROGRESS &&
    distanceMeters(fix, target) < distanceMeters(stepOrigin, target) - 2;

  useEffect(() => {
    if (!needsTurn || turned || !facingTarget) return;
    const t = setTimeout(() => setTurnedFor(stepIndex), ALIGNED_TIME);
    return () => clearTimeout(t);
  }, [needsTurn, turned, facingTarget, stepIndex]);

  useEffect(() => {
    if (needsTurn && !turned && gpsProgressed) setTurnedFor(stepIndex);
  }, [needsTurn, turned, gpsProgressed, stepIndex]);

  const shownDirection = turned ? 'straight' : step.direction;
  const shownTitle = turned ? 'Sigue derecho' : step.title;

  const meta =
    distToAim !== null && fixUsable
      ? `${Math.round(distToAim)} m · ${step.landmark}`
      : step.distance === 0
        ? `Frente a ti · ${step.landmark}`
        : `${step.distance} m · ${step.landmark}`;

  const gpsText =
    geo.status === 'denied'
      ? 'Sin permiso de ubicación'
      : geo.status === 'unavailable'
        ? 'GPS no disponible'
        : !fix
          ? 'Buscando GPS…'
          : `GPS ±${Math.round(fix.accuracy)} m${fixUsable ? '' : ' · señal débil'}`;

  return (
    <main className="screen nav">
      <div className="nav-bg">
        {mode === 'camera' && (
          <video ref={camera.videoRef} className={`cam${cameraLive ? ' is-live' : ''}`} playsInline muted autoPlay />
        )}
        {!cameraLive && <PhotoScene key={`bg-${stepIndex}`} photo={step.photo} showMarker={!showSuggest} />}
        <div className="nav-shade" />
      </div>

      {/* Mientras se pregunta si terminó el paso, solo queda la cámara de fondo y el aviso. */}
      {cameraLive &&
        !showSuggest &&
        (relBearing !== null && distToAim !== null ? (
          <GeoArOverlay relBearing={relBearing} distance={distToAim} label={step.landmark} isArrive={!target} />
        ) : (
          <ArOverlay key={`${stepIndex}-${shownDirection}`} step={{ ...step, direction: shownDirection }} />
        ))}

      {!showSuggest && (
        <>
      <header className="nav-top">
        <button type="button" className="icon-btn" aria-label="Salir de la navegación" onClick={() => setConfirmExit(true)}>
          <Close width={20} height={20} />
        </button>
        <div className="progress" aria-label={`Paso ${stepIndex + 1} de ${steps.length}`}>
          {steps.map((_, i) => (
            <span key={i} className={i < stepIndex ? 'is-done' : i === stepIndex ? 'is-current' : ''} />
          ))}
        </div>
        <div className="mode-toggle" role="group" aria-label="Tipo de vista">
          <button type="button" aria-pressed={mode === 'camera'} onClick={() => setMode('camera')}>
            <Camera width={15} height={15} /> AR
          </button>
          <button type="button" aria-pressed={mode === 'sim'} onClick={() => setMode('sim')}>
            Fotos
          </button>
        </div>
      </header>

      <section className={`instruction dir-${shownDirection}`} key={`card-${stepIndex}-${shownDirection}`} aria-live="polite">
        <span className="instruction-icon">
          <DirectionIcon direction={shownDirection} width={32} height={32} strokeWidth={2.4} />
        </span>
        <div className="instruction-text">
          <h1>{shownTitle}</h1>
          <p className="instruction-meta">{meta}</p>
          <p className="instruction-detail">{step.detail}</p>
        </div>
        <button
          type="button"
          className="instruction-photo"
          aria-label="Ver foto de referencia de este tramo"
          onClick={() => setViewer('step')}
        >
          <img src={photoUrl(step.photo.src)} alt="" />
          <span>
            <ImageIcon width={12} height={12} /> Ver
          </span>
        </button>
      </section>

      <footer className="nav-bottom">
        {showMap && (
          <div className="mini-map">
            <CampusMap activeStep={stepIndex} />
          </div>
        )}
        {mode === 'camera' && camera.status === 'starting' && <div className="notice">Activando cámara…</div>}
        {cameraFailed && (
          <div className="notice is-warn">
            {camera.status === 'denied'
              ? 'No diste permiso a la cámara. Te mostramos las fotos de la ruta.'
              : 'La cámara no está disponible aquí. Te mostramos las fotos de la ruta.'}
            <button type="button" onClick={camera.retry}>
              Reintentar
            </button>
          </div>
        )}
        {(geo.status === 'denied' || geo.status === 'unavailable') && (
          <div className="notice is-warn">
            {geo.status === 'denied'
              ? 'Sin permiso de ubicación: la indicación no avanzará sola. Usa el botón al llegar a cada punto.'
              : 'Este navegador no da ubicación: usa el botón al llegar a cada punto.'}
          </div>
        )}
        {cameraLive && fix && heading === null && (
          <div className="notice">Brújula no disponible: las flechas no se orientan solas.</div>
        )}
        <div className="nav-meta">
          <button type="button" className="icon-btn" aria-label="Paso anterior" onClick={prev} disabled={stepIndex === 0}>
            <ChevronLeft width={20} height={20} />
          </button>
          <div className="nav-meta-text">
            <strong>
              Paso {stepIndex + 1} de {steps.length}
            </strong>
            <span>
              {remaining > 0 && target ? `Faltan ${remaining} m para ${ROUTE.destination.short}` : `Estás en ${ROUTE.destination.short}`}
            </span>
            <span className={`gps-chip${fixUsable ? ' is-ok' : ''}`}>{gpsText}</span>
          </div>
          <button
            type="button"
            className={`icon-btn${showMap ? ' is-active' : ''}`}
            aria-label={showMap ? 'Ocultar mapa' : 'Ver mapa'}
            aria-pressed={showMap}
            onClick={() => setShowMap((v) => !v)}
          >
            <MapIcon width={20} height={20} />
          </button>
        </div>
        <button type="button" className="btn-primary" onClick={next}>
          {isLast ? 'Confirmar llegada' : 'Siguiente indicación'}
          <ChevronRight width={20} height={20} />
        </button>
      </footer>
        </>
      )}

      {showSuggest && (
        <div className="suggest-overlay" role="dialog" aria-modal="true" aria-labelledby="suggest-title">
          <div className="suggest-card">
            <span className="suggest-icon">
              <Check width={34} height={34} strokeWidth={3} />
            </span>
            <h2 id="suggest-title">
              {target === LAST_POINT ? `Parece que llegaste a ${ROUTE.destination.short}` : 'Parece que terminaste este paso'}
            </h2>
            <p>¿Pasamos a la siguiente indicación?</p>
            <button type="button" className="btn-primary" onClick={next}>
              Pasar al siguiente
              <ChevronRight width={20} height={20} />
            </button>
            <button type="button" className="btn-ghost" onClick={notYet}>
              Aún no
            </button>
          </div>
        </div>
      )}

      {viewer && (
        <div className="viewer" role="dialog" aria-modal="true" aria-label="Foto de referencia">
          <PhotoScene
            key={`${viewer}-${stepIndex}`}
            photo={viewer === 'checkpoint' && step.checkpoint ? step.checkpoint : step.photo}
            showPath={viewer === 'step'}
          />
          <div className="viewer-top">
            <button type="button" className="icon-btn" aria-label="Cerrar foto" onClick={() => setViewer(null)}>
              <Close width={20} height={20} />
            </button>
            {step.checkpoint && (
              <div className="mode-toggle" role="group" aria-label="Foto">
                <button type="button" aria-pressed={viewer === 'step'} onClick={() => setViewer('step')}>
                  Camino
                </button>
                <button type="button" aria-pressed={viewer === 'checkpoint'} onClick={() => setViewer('checkpoint')}>
                  Punto de giro
                </button>
              </div>
            )}
          </div>
          <div className="viewer-caption">
            <strong>{viewer === 'checkpoint' && step.checkpoint ? step.checkpoint.caption : step.title}</strong>
            <span>
              {viewer === 'checkpoint' ? 'Así se ve el punto donde cambias de dirección.' : 'Camina hasta el punto marcado.'}
            </span>
          </div>
        </div>
      )}

      {showCoach && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="coach-title">
          <div className="sheet">
            <h2 id="coach-title">Cómo seguir la ruta</h2>
            <ol className="coach-list">
              <li>
                <span>1</span>
                <p>Sostén el teléfono frente a ti, con la cámara hacia el camino.</p>
              </li>
              <li>
                <span>2</span>
                <p>
                  Gira hasta que el camino de luz quede recto frente a ti y síguelo. Toca la foto de la tarjeta para ver hasta
                  dónde caminar.
                </p>
              </li>
              <li>
                <span>3</span>
                <p>
                  Al llegar a cada punto te avisaremos con <b>Parece que terminaste este paso</b>. También puedes tocar{' '}
                  <b>Siguiente indicación</b> cuando quieras.
                </p>
              </li>
            </ol>
            <button type="button" className="btn-primary" onClick={() => setShowCoach(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {confirmExit && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="exit-title">
          <div className="sheet">
            <h2 id="exit-title">¿Salir de la navegación?</h2>
            <p className="muted">Perderás el avance de esta ruta.</p>
            <button type="button" className="btn-primary is-danger" onClick={onExit}>
              Salir
            </button>
            <button type="button" className="btn-ghost" onClick={() => setConfirmExit(false)}>
              Seguir navegando
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
