import { useState } from 'react';
import { Check, Clock, Heart, Locate, Logo, Steps, Walk } from '../components/Icons';
import { ROUTE, TOTAL_DISTANCE, TOTAL_MINUTES } from '../data/route';

export function SelectScreen({ onStart }: { onStart: () => void }) {
  const [selected, setSelected] = useState(false);
  const { origin, destination } = ROUTE;

  return (
    <main className="screen select">
      <header className="brand">
        <Logo />
        <div>
          <span className="brand-name">
            Rumbo <small className="brand-tag">prototipo inicial</small>
          </span>
          <span className="brand-sub">
            {ROUTE.campus} · {ROUTE.city}
          </span>
        </div>
      </header>

      <section className="panel">
        <div className="origin-row">
          <span className="origin-icon">
            <Locate width={20} height={20} />
          </span>
          <div>
            <span className="label">Punto de inicio</span>
            <strong>{origin.name}</strong>
            <span className="muted">{origin.detail}</span>
          </div>
        </div>

        <h1 className="section-title">Tu destino será:</h1>

        <button
          type="button"
          className={`dest-card${selected ? ' is-selected' : ''}`}
          aria-pressed={selected}
          aria-label={`Destino: ${destination.name}`}
          onClick={() => setSelected(true)}
        >
          <span className="dest-icon">
            <Heart width={22} height={22} />
          </span>
          <span className="dest-text">
            <strong>{destination.name}</strong>
            <span className="muted">{destination.detail}</span>
          </span>
          <span className="dest-radio">{selected && <Check width={16} height={16} strokeWidth={3} />}</span>
        </button>

        <div className={`route-info${selected ? ' is-open' : ''}`} aria-hidden={!selected}>
          <div className="stat">
            <Walk width={18} height={18} />
            <strong>{TOTAL_DISTANCE} m</strong>
            <span>Distancia</span>
          </div>
          <div className="stat">
            <Clock width={18} height={18} />
            <strong>{TOTAL_MINUTES} min</strong>
            <span>Caminando</span>
          </div>
          <div className="stat">
            <Steps width={18} height={18} />
            <strong>{ROUTE.steps.length}</strong>
            <span>Indicaciones</span>
          </div>
        </div>
      </section>

      <footer className="cta-bar">
        <button type="button" className="btn-primary" disabled={!selected} onClick={onStart}>
          Iniciar recorrido
        </button>
        <p className="cta-hint">
          {selected
            ? 'Te pediremos acceso a la cámara, la ubicación y la orientación del teléfono para guiarte en vivo.'
            : 'Toca el destino para ver la ruta.'}
        </p>
      </footer>
    </main>
  );
}
