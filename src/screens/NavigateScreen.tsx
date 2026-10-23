import { useState } from 'react';
import { ArOverlay } from '../components/ArOverlay';
import { CampusMap } from '../components/CampusMap';
import { Camera, ChevronLeft, ChevronRight, Close, DirectionIcon, ImageIcon, MapIcon } from '../components/Icons';
import { PhotoScene } from '../components/PhotoScene';
import { photoUrl, ROUTE } from '../data/route';
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
  const [viewer, setViewer] = useState<'step' | 'checkpoint' | null>(null);
  const camera = useCamera(mode === 'camera');

  const steps = ROUTE.steps;
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const cameraLive = mode === 'camera' && camera.status === 'live';
  const cameraFailed = mode === 'camera' && (camera.status === 'denied' || camera.status === 'unavailable');
  const remaining = steps.slice(stepIndex).reduce((sum, s) => sum + s.distance, 0);

  const goTo = (i: number) => {
    setViewer(null);
    setStepIndex(i);
  };
  const next = () => (isLast ? onArrive() : goTo(stepIndex + 1));
  const prev = () => goTo(Math.max(0, stepIndex - 1));

  const meta =
    step.distance === 0
      ? `Frente a ti · ${step.landmark}`
      : `${step.distance} m · ${step.landmark}`;

  return (
    <main className="screen nav">
      <div className="nav-bg">
        {mode === 'camera' && (
          <video ref={camera.videoRef} className={`cam${cameraLive ? ' is-live' : ''}`} playsInline muted autoPlay />
        )}
        {!cameraLive && <PhotoScene key={`bg-${stepIndex}`} photo={step.photo} />}
        <div className="nav-shade" />
      </div>

      {cameraLive && <ArOverlay key={stepIndex} step={step} />}

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

      <section className={`instruction dir-${step.direction}`} key={`card-${stepIndex}`} aria-live="polite">
        <span className="instruction-icon">
          <DirectionIcon direction={step.direction} width={32} height={32} strokeWidth={2.4} />
        </span>
        <div className="instruction-text">
          <h1>{step.title}</h1>
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
        <div className="nav-meta">
          <button type="button" className="icon-btn" aria-label="Paso anterior" onClick={prev} disabled={stepIndex === 0}>
            <ChevronLeft width={20} height={20} />
          </button>
          <div className="nav-meta-text">
            <strong>
              Paso {stepIndex + 1} de {steps.length}
            </strong>
            <span>
              {remaining > 0 ? `Faltan ${remaining} m para ${ROUTE.destination.short}` : `Estás en ${ROUTE.destination.short}`}
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
          {isLast ? 'Confirmar llegada' : 'Siguiente indicación'}
          <ChevronRight width={20} height={20} />
        </button>
      </footer>

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
                <p>Sigue las flechas que aparecen sobre el piso. Toca la foto de la tarjeta para ver hasta dónde caminar.</p>
              </li>
              <li>
                <span>3</span>
                <p>
                  Cuando llegues al punto, toca <b>Siguiente indicación</b>.
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
