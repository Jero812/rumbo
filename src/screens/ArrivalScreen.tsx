import { Check, Clock, Steps, Walk } from '../components/Icons';
import { ROUTE, TOTAL_DISTANCE } from '../data/route';

interface Props {
  elapsedMs: number;
  onFinish: () => void;
  onRepeat: () => void;
}

function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ArrivalScreen({ elapsedMs, onFinish, onRepeat }: Props) {
  return (
    <main className="screen arrival">
      <div className="arrival-hero">
        <div className="arrival-rings">
          <span />
          <span />
          <span />
        </div>
        <div className="arrival-check">
          <Check width={56} height={56} strokeWidth={3} />
        </div>
      </div>

      <p className="eyebrow">Llegaste a tu destino</p>
      <h1 className="arrival-title">{ROUTE.destination.name}</h1>
      <p className="muted">{ROUTE.destination.detail}</p>

      <div className="route-info is-open arrival-stats">
        <div className="stat">
          <Clock width={18} height={18} />
          <strong>{formatDuration(elapsedMs)}</strong>
          <span>Tiempo</span>
        </div>
        <div className="stat">
          <Walk width={18} height={18} />
          <strong>{TOTAL_DISTANCE} m</strong>
          <span>Recorrido</span>
        </div>
        <div className="stat">
          <Steps width={18} height={18} />
          <strong>{ROUTE.steps.length}</strong>
          <span>Indicaciones</span>
        </div>
      </div>

      <footer className="cta-bar arrival-actions">
        <button type="button" className="btn-primary" onClick={onFinish}>
          Finalizar navegación
        </button>
        <button type="button" className="btn-ghost" onClick={onRepeat}>
          Repetir el recorrido
        </button>
      </footer>
    </main>
  );
}
