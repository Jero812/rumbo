import { useState } from 'react';
import { ArOverlay } from '../components/ArOverlay';
import { CampusMap } from '../components/CampusMap';
import { Camera, ChevronLeft, ChevronRight, Close, DirectionIcon, MapIcon } from '../components/Icons';
import { SimScene } from '../components/SimScene';
import { ROUTE } from '../data/route';
import { useCamera } from '../hooks/useCamera';

type ViewMode = 'camera' | 'sim';

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
  const camera = useCamera(mode === 'camera');

  const steps = ROUTE.steps;
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const cameraLive = mode === 'camera' && camera.status === 'live';
  const cameraFailed = mode === 'camera' && (camera.status === 'denied' || camera.status === 'unavailable');
  const remaining = steps.slice(stepIndex).reduce((sum, s) => sum + s.distance, 0);

  const next = () => (isLast ? onArrive() : setStepIndex((i) => i + 1));
  const prev = () => setStepIndex((i) => Math.max(0, i - 1));

  return (
    <main className="screen nav">
      <div className="nav-bg">
        {mode === 'camera' && (
          <video ref={camera.videoRef} className={`cam${cameraLive ? ' is-live' : ''}`} playsInline muted autoPlay />
        )}
        {!cameraLive && <SimScene step={step} />}
        <div className="nav-shade" />
      </div>

      <ArOverlay key={stepIndex} step={step} />

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
            Simulada
          </button>
        </div>
      </header>

      <section className={`instruction dir-${step.direction}`} key={`card-${stepIndex}`} aria-live="polite">
        <span className="instruction-icon">
          <DirectionIcon direction={step.direction} width={34} height={34} strokeWidth={2.4} />
        </span>
        <div>
          <h1>{step.title}</h1>
          <p className="instruction-meta">
            {step.direction === 'arrive' ? `A ${step.distance} m` : `Durante ${step.distance} m`} · {step.landmark}
          </p>
          <p className="instruction-detail">{step.detail}</p>
        </div>
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
              ? 'No diste permiso a la cámara. Te mostramos la vista simulada.'
              : 'La cámara no está disponible aquí. Te mostramos la vista simulada.'}
            <button type="button" onClick={camera.retry}>
              Reintentar
            </button>
          </div>
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
              Faltan {remaining} m para {ROUTE.destination.name}
            </span>
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
          {isLast ? 'Llegué al destino' : 'Siguiente indicación'}
          <ChevronRight width={20} height={20} />
        </button>
      </footer>

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
                <p>Sigue las flechas de luz que aparecen sobre el piso.</p>
              </li>
              <li>
                <span>3</span>
                <p>
                  Cuando cumplas una indicación, toca <b>Siguiente indicación</b>.
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
